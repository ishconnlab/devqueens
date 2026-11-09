/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomBytes } from "node:crypto";
import { Readable } from "node:stream";
import { Types } from "mongoose";
import express from "express";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { z } from "zod";
import { gradeObjectiveAnswers } from "./assessment.js";
import { config } from "./config.js";
import { clearAuthCookie, requireAdmin, requireAuth, setAuthCookie, type AuthenticatedRequest } from "./auth.js";
import { AssessmentAttempt, Certificate, ChatMessage, ChatThread, ContentEntry, Course, Enrollment, Follow, PlatformSettings, SocialPost, User } from "./models.js";
import { assessmentAnswersSchema, chatMessageSchema, contentSchema, courseSchema, profileSchema, registrationSchema, socialCommentSchema, socialPostSchema } from "./validation.js";

const app = express();
const router = express.Router();
const authRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: "draft-7", legacyHeaders: false });
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 } });
const contentKinds = ["team", "badge", "alumni", "achiever", "partner", "gallery", "testimonial"] as const;
type ContentKind = (typeof contentKinds)[number];
const defaultCommunityJoinUrl = "https://chat.whatsapp.com/LllvTuja4xH7ZZBQXav73J";
const communityLinkSchema = z.object({
  url: z.string().url().max(2048).refine((value) => {
    try { return new URL(value).protocol === "https:"; } catch { return false; }
  }, "Community link must use HTTPS."),
  enabled: z.boolean(),
});

cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
  secure: true,
});

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: config.CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

function sendError(res: express.Response, status: number, message: string, details?: unknown) {
  res.status(status).json({ error: message, ...(details ? { details } : {}) });
}

function parseOrRespond<T>(schema: z.ZodType<T>, value: unknown, res: express.Response): T | null {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    sendError(res, 400, "Please check the submitted information.", parsed.error.flatten());
    return null;
  }
  return parsed.data;
}

function publicCourse(course: any) {
  const result = course.toObject ? course.toObject() : { ...course };
  for (const question of result.assessment?.questions ?? []) delete question.correctAnswer;
  return result;
}

function courseLessonIds(course: any) {
  return course.modules.flatMap((module: any) => module.lessons.map((lesson: any) => String(lesson._id)));
}

async function uploadChatImage(file: Express.Multer.File | undefined, res: express.Response) {
  if (!file) return "";
  if (!file.mimetype.startsWith("image/")) {
    sendError(res, 400, "Choose an image file.");
    return null;
  }
  if (!config.CLOUDINARY_CLOUD_NAME || !config.CLOUDINARY_API_KEY || !config.CLOUDINARY_API_SECRET) {
    sendError(res, 503, "Image uploads are not configured. Set the Cloudinary environment variables.");
    return null;
  }
  const uploaded = await new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "devqueens/messages", resource_type: "image", transformation: [{ width: 1600, height: 1600, crop: "limit", quality: "auto", fetch_format: "auto" }] },
      (error, result) => error ? reject(error) : resolve(result),
    );
    Readable.from(file.buffer).pipe(stream);
  });
  return uploaded.secure_url as string;
}

async function createCertificate(userId: string, courseId: string) {
  const existing = await Certificate.findOne({ userId, courseId, revokedAt: { $exists: false } });
  if (existing) return existing;
  const certificateId = `DQ-${new Date().getFullYear()}-${randomBytes(5).toString("hex").toUpperCase()}`;
  return Certificate.create({ certificateId, userId, courseId });
}

async function checkCourseCompletion(userId: string, course: any) {
  const enrollment = await Enrollment.findOne({ userId, courseId: course._id });
  if (!enrollment) return null;
  const lessonIds = courseLessonIds(course);
  const percent = lessonIds.length ? (enrollment.completedLessonIds.length / lessonIds.length) * 100 : 0;
  return percent >= course.completionRequirementPercent ? enrollment : null;
}

router.get("/health", (_req, res) => res.json({ status: "ok", service: "devqueens-api" }));

router.get("/community-link", async (_req, res, next) => {
  try {
    const [urlSetting, enabledSetting] = await Promise.all([
      PlatformSettings.findOne({ key: "communityJoinUrl" }).lean(),
      PlatformSettings.findOne({ key: "communityJoinEnabled" }).lean(),
    ]);
    const result = communityLinkSchema.safeParse({
      url: urlSetting?.value ?? defaultCommunityJoinUrl,
      enabled: enabledSetting?.value ?? true,
    });
    if (!result.success) return sendError(res, 500, "Community invitation settings are invalid. Ask an administrator to update them.");
    res.json(result.data);
  } catch (error) {
    next(error);
  }
});

router.post("/auth/register", authRateLimit, async (req, res, next) => {
  try {
    const data = parseOrRespond(registrationSchema, req.body, res);
    if (!data) return;
    const registrationSetting = await PlatformSettings.findOne({ key: "registrationOpen" }).lean();
    if (registrationSetting?.value === false) return sendError(res, 403, "New member registration is currently closed.");
    const email = data.email.toLowerCase();
    if (await User.exists({ email })) return sendError(res, 409, "An account with this email already exists.");
    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await User.create({
      name: data.name,
      email,
      passwordHash,
      memberDetails: data.memberDetails,
      memberId: `DQ-${new Date().getFullYear()}-${randomBytes(4).toString("hex").toUpperCase()}`,
    });
    setAuthCookie(res, user);
    res.status(201).json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, memberId: user.memberId } });
  } catch (error) {
    next(error);
  }
});

router.post("/auth/login", authRateLimit, async (req, res, next) => {
  try {
    const parsed = z.object({ email: z.string().email(), password: z.string().min(1).max(128) }).safeParse(req.body);
    if (!parsed.success) return sendError(res, 400, "Enter a valid email address and password.");
    const user = await User.findOne({ email: parsed.data.email.toLowerCase() }).select("+passwordHash");
    if (!user || !(await (user as any).verifyPassword(parsed.data.password))) {
      return sendError(res, 401, "The email or password is incorrect.");
    }
    if (user.status !== "active") return sendError(res, 403, "This account is currently suspended.");
    setAuthCookie(res, user);
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, memberId: user.memberId } });
  } catch (error) {
    next(error);
  }
});

router.post("/auth/logout", (_req, res) => {
  clearAuthCookie(res);
  res.status(204).end();
});

router.get("/auth/me", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await User.findById(req.user!.id).select("-passwordHash");
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

router.get("/courses", async (_req, res, next) => {
  try {
    const courses = await Course.find({ status: "published" }).sort({ createdAt: -1 });
    res.json({ courses: courses.map(publicCourse) });
  } catch (error) {
    next(error);
  }
});

router.get("/courses/:slug", async (req, res, next) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug, status: "published" });
    if (!course) return sendError(res, 404, "Course not found.");
    res.json({ course: publicCourse(course) });
  } catch (error) {
    next(error);
  }
});

router.get("/content/:kind", async (req, res, next) => {
  try {
    if (!contentKinds.includes(req.params.kind as ContentKind)) return sendError(res, 404, "Content collection not found.");
    const kind = req.params.kind as ContentKind;
    const items = await ContentEntry.find({ kind, published: true }).sort({ createdAt: -1 }).lean();
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get("/profiles/:memberId", async (req, res, next) => {
  try {
    const user = await User.findOne({ memberId: req.params.memberId, status: "active" })
      .select("name memberId profile joinedAt badgeIds");
    if (!user || user.profile.visibility !== "public") return sendError(res, 404, "This public profile is unavailable.");
    const [certificates, posts, followers, following] = await Promise.all([
      Certificate.find({ userId: user._id, revokedAt: { $exists: false } }).populate("courseId", "title slug").select("certificateId issuedAt courseId"),
      SocialPost.find({ authorId: user._id }).sort({ createdAt: -1 }).limit(30).populate("comments.authorId", "name memberId profile.photoUrl").lean(),
      Follow.countDocuments({ followedId: user._id }),
      Follow.countDocuments({ followerId: user._id }),
    ]);
    res.json({
      profile: user,
      certificates,
      followers,
      following,
      posts: posts.map((post: any) => ({
        _id: post._id,
        text: post.text,
        imageUrl: post.imageUrl,
        createdAt: post.createdAt,
        likesCount: post.likes.length,
        comments: post.comments,
      })),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/social/members", async (_req, res, next) => {
  try {
    const members = await User.find({ role: "member", status: "active", "profile.visibility": "public" })
      .select("name memberId profile.photoUrl profile.bio profile.interests joinedAt")
      .sort({ joinedAt: -1 }).limit(40).lean();
    const counts = await Follow.aggregate([
      { $match: { followedId: { $in: members.map((member) => member._id) } } },
      { $group: { _id: "$followedId", count: { $sum: 1 } } },
    ]);
    const followerCounts = new Map(counts.map((entry: any) => [String(entry._id), entry.count]));
    res.json({ members: members.map((member) => ({ ...member, followers: followerCounts.get(String(member._id)) ?? 0 })) });
  } catch (error) {
    next(error);
  }
});

router.get("/certificates/verify/:certificateId", async (req, res, next) => {
  try {
    const certificate = await Certificate.findOne({ certificateId: req.params.certificateId })
      .populate("userId", "name").populate("courseId", "title");
    if (!certificate) return sendError(res, 404, "Certificate not found.");
    res.json({
      valid: !certificate.revokedAt,
      certificate: {
        certificateId: certificate.certificateId,
        issuedAt: certificate.issuedAt,
        revokedAt: certificate.revokedAt,
        recipient: (certificate.userId as any)?.name,
        course: (certificate.courseId as any)?.title,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/certificates/:certificateId/pdf", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const certificate = await Certificate.findOne({ certificateId: req.params.certificateId })
      .populate("userId", "name").populate("courseId", "title");
    if (!certificate) return sendError(res, 404, "Certificate not found.");
    if (req.user!.role !== "admin" && String((certificate.userId as any)._id) !== req.user!.id) {
      return sendError(res, 403, "You cannot download another member's certificate.");
    }
    if (certificate.revokedAt) return sendError(res, 410, "This certificate has been revoked.");

    const verificationUrl = `${config.APP_URL}/verify/${certificate.certificateId}`;
    const qr = await QRCode.toDataURL(verificationUrl, { margin: 1, width: 120 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${certificate.certificateId}.pdf"`);
    const pdf = new PDFDocument({ size: "A4", layout: "landscape", margin: 48 });
    pdf.pipe(res);
    pdf.rect(0, 0, 842, 595).fill("#fff7ed");
    pdf.rect(20, 20, 802, 555).lineWidth(2).strokeColor("#f97316").stroke();
    pdf.fillColor("#f97316").fontSize(18).font("Helvetica-Bold").text("ISHCONNECT", 0, 62, { align: "center" });
    pdf.fillColor("#1c1917").fontSize(16).font("Helvetica").text("DevQueens Technology Learning Initiative", 0, 89, { align: "center" });
    pdf.fillColor("#1c1917").fontSize(34).font("Helvetica-Bold").text("Certificate of Completion", 0, 154, { align: "center" });
    pdf.fillColor("#57534e").fontSize(15).font("Helvetica").text("This certificate is proudly presented to", 0, 220, { align: "center" });
    pdf.fillColor("#1c1917").fontSize(30).font("Helvetica-Bold").text((certificate.userId as any).name, 70, 258, { align: "center", width: 702 });
    pdf.moveTo(190, 302).lineTo(652, 302).lineWidth(1).strokeColor("#f97316").stroke();
    pdf.fillColor("#57534e").fontSize(15).font("Helvetica").text("for successfully completing", 0, 320, { align: "center" });
    pdf.fillColor("#1c1917").fontSize(23).font("Helvetica-Bold").text((certificate.courseId as any).title, 80, 352, { align: "center", width: 682 });
    pdf.fillColor("#57534e").fontSize(12).font("Helvetica").text(`Issued ${new Date(certificate.issuedAt).toLocaleDateString("en", { dateStyle: "long" })}  |  Certificate ID: ${certificate.certificateId}`, 0, 424, { align: "center" });
    pdf.image(qr, 712, 455, { width: 72, height: 72 });
    pdf.fillColor("#1c1917").fontSize(11).font("Helvetica-Bold").text(config.CERTIFICATE_SIGNER_NAME, 70, 475);
    pdf.fillColor("#57534e").fontSize(10).font("Helvetica").text(config.CERTIFICATE_SIGNER_TITLE, 70, 491);
    pdf.end();
  } catch (error) {
    next(error);
  }
});

router.use(requireAuth);

router.get("/messages/inbox", async (req: AuthenticatedRequest, res, next) => {
  try {
    if (req.user!.role !== "member") return sendError(res, 403, "Member access is required.");
    const thread = await ChatThread.findOne({ memberId: req.user!.id }).lean();
    const [messages, broadcasts] = await Promise.all([
      thread
        ? ChatMessage.find({ threadId: thread._id }).sort({ createdAt: 1 }).limit(200).populate("senderId", "name role memberId profile.photoUrl").lean()
        : Promise.resolve([]),
      ChatMessage.find({ broadcast: true }).sort({ createdAt: -1 }).limit(50).populate("senderId", "name role").lean(),
    ]);
    const idsToMarkRead = [...messages, ...broadcasts]
      .filter((message: any) => String(message.senderId?._id ?? message.senderId) !== req.user!.id)
      .map((message: any) => message._id);
    if (idsToMarkRead.length) await ChatMessage.updateMany({ _id: { $in: idsToMarkRead } }, { $addToSet: { readBy: req.user!.id } });
    res.json({ thread: thread ? { id: thread._id } : null, messages, broadcasts: broadcasts.reverse() });
  } catch (error) {
    next(error);
  }
});

router.post("/messages/admin", upload.single("image"), async (req: AuthenticatedRequest, res, next) => {
  try {
    if (req.user!.role !== "member") return sendError(res, 403, "Member access is required.");
    const data = parseOrRespond(chatMessageSchema, { text: req.body.text ?? "" }, res);
    if (!data) return;
    if (!data.text && !req.file) return sendError(res, 400, "Write a message or attach an image.");
    const imageUrl = await uploadChatImage(req.file, res);
    if (imageUrl === null) return;
    const thread = await ChatThread.findOneAndUpdate(
      { memberId: req.user!.id },
      { $setOnInsert: { memberId: req.user!.id } },
      { new: true, upsert: true, runValidators: true },
    );
    const message = await ChatMessage.create({ threadId: thread._id, senderId: req.user!.id, text: data.text, imageUrl, readBy: [req.user!.id] });
    await ChatThread.updateOne({ _id: thread._id }, { lastMessageAt: message.createdAt, lastMessageText: data.text || "Image" });
    res.status(201).json({ message });
  } catch (error) {
    next(error);
  }
});

router.get("/social/feed", async (req: AuthenticatedRequest, res, next) => {
  try {
    const followed = await Follow.find({ followerId: req.user!.id }).select("followedId").lean();
    const authorIds = [req.user!.id, ...followed.map((entry) => String(entry.followedId))];
    const posts = await SocialPost.find({ authorId: { $in: authorIds } })
      .sort({ createdAt: -1 }).limit(50)
      .populate("authorId", "name memberId profile.photoUrl profile.visibility status")
      .populate("comments.authorId", "name memberId profile.photoUrl").lean();
    const visiblePosts = posts.filter((post: any) => post.authorId?.status === "active" && post.authorId?.profile?.visibility === "public");
    res.json({
      posts: visiblePosts.map((post: any) => ({
        _id: post._id,
        text: post.text,
        imageUrl: post.imageUrl,
        createdAt: post.createdAt,
        author: post.authorId,
        likesCount: post.likes.length,
        liked: post.likes.some((id: unknown) => String(id) === req.user!.id),
        comments: post.comments,
      })),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/admin/inbox", requireAdmin, async (_req: AuthenticatedRequest, res, next) => {
  try {
    const threads = await ChatThread.find().sort({ lastMessageAt: -1 }).limit(200)
      .populate("memberId", "name memberId email profile.photoUrl status").lean();
    res.json({
      threads: threads
        .filter((thread: any) => thread.memberId?.status === "active")
        .map((thread: any) => ({
          id: thread._id,
          member: thread.memberId,
          lastMessageAt: thread.lastMessageAt,
          lastMessageText: thread.lastMessageText,
        })),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/admin/inbox/broadcasts", requireAdmin, async (_req, res, next) => {
  try {
    const messages = await ChatMessage.find({ broadcast: true }).sort({ createdAt: -1 }).limit(50)
      .populate("senderId", "name role").lean();
    res.json({ messages: messages.reverse() });
  } catch (error) {
    next(error);
  }
});

router.get("/admin/inbox/:threadId", requireAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    const threadId = String(req.params.threadId);
    if (!Types.ObjectId.isValid(threadId)) return sendError(res, 404, "Conversation not found.");
    const thread = await ChatThread.findById(threadId).populate("memberId", "name memberId email profile.photoUrl status");
    if (!thread || (thread.memberId as any).status !== "active") return sendError(res, 404, "Conversation not found.");
    await ChatMessage.updateMany({ threadId: thread._id, senderId: { $ne: req.user!.id } }, { $addToSet: { readBy: req.user!.id } });
    const messages = await ChatMessage.find({ threadId: thread._id }).sort({ createdAt: 1 }).limit(200)
      .populate("senderId", "name role memberId profile.photoUrl").lean();
    res.json({ thread: { id: thread.id, member: thread.memberId }, messages });
  } catch (error) {
    next(error);
  }
});

router.post("/admin/inbox/:threadId/messages", requireAdmin, upload.single("image"), async (req: AuthenticatedRequest, res, next) => {
  try {
    const threadId = String(req.params.threadId);
    if (!Types.ObjectId.isValid(threadId)) return sendError(res, 404, "Conversation not found.");
    const data = parseOrRespond(chatMessageSchema, { text: req.body.text ?? "" }, res);
    if (!data) return;
    if (!data.text && !req.file) return sendError(res, 400, "Write a message or attach an image.");
    const thread = await ChatThread.findById(threadId);
    if (!thread) return sendError(res, 404, "Conversation not found.");
    const imageUrl = await uploadChatImage(req.file, res);
    if (imageUrl === null) return;
    const message = await ChatMessage.create({ threadId: thread._id, senderId: req.user!.id, text: data.text, imageUrl, readBy: [req.user!.id] });
    await ChatThread.updateOne({ _id: thread._id }, { lastMessageAt: message.createdAt, lastMessageText: data.text || "Image" });
    res.status(201).json({ message });
  } catch (error) {
    next(error);
  }
});

router.post("/admin/inbox/broadcasts", requireAdmin, upload.single("image"), async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = parseOrRespond(chatMessageSchema, { text: req.body.text ?? "" }, res);
    if (!data) return;
    if (!data.text && !req.file) return sendError(res, 400, "Write a message or attach an image.");
    const imageUrl = await uploadChatImage(req.file, res);
    if (imageUrl === null) return;
    const message = await ChatMessage.create({ broadcast: true, senderId: req.user!.id, text: data.text, imageUrl, readBy: [req.user!.id] });
    res.status(201).json({ message });
  } catch (error) {
    next(error);
  }
});

router.get("/social/following", async (req: AuthenticatedRequest, res, next) => {
  try {
    const follows = await Follow.find({ followerId: req.user!.id }).populate("followedId", "memberId").lean();
    res.json({ memberIds: follows.map((follow: any) => follow.followedId?.memberId).filter(Boolean) });
  } catch (error) {
    next(error);
  }
});

router.post("/social/posts", upload.single("image"), async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = parseOrRespond(socialPostSchema, { text: req.body.text ?? "" }, res);
    if (!data) return;
    if (!data.text && !req.file) return sendError(res, 400, "Write something or add an image.");
    if (req.file && !req.file.mimetype.startsWith("image/")) return sendError(res, 400, "Choose an image file.");
    let imageUrl = "";
    if (req.file) {
      if (!config.CLOUDINARY_CLOUD_NAME || !config.CLOUDINARY_API_KEY || !config.CLOUDINARY_API_SECRET) {
        return sendError(res, 503, "Image uploads are not configured. Set the Cloudinary environment variables.");
      }
      const uploaded = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "devqueens/community", resource_type: "image", transformation: [{ width: 1600, height: 1600, crop: "limit", quality: "auto", fetch_format: "auto" }] },
          (error, result) => error ? reject(error) : resolve(result),
        );
        Readable.from(req.file!.buffer).pipe(stream);
      });
      imageUrl = uploaded.secure_url;
    }
    const post = await SocialPost.create({ authorId: req.user!.id, text: data.text, imageUrl });
    res.status(201).json({ post });
  } catch (error) {
    next(error);
  }
});

router.delete("/social/posts/:postId", async (req: AuthenticatedRequest, res, next) => {
  try {
    const post = await SocialPost.findOneAndDelete({ _id: req.params.postId, authorId: req.user!.id });
    if (!post) return sendError(res, 404, "Post not found or you cannot delete it.");
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

router.post("/social/posts/:postId/like", async (req: AuthenticatedRequest, res, next) => {
  try {
    const post = await SocialPost.findById(req.params.postId);
    if (!post) return sendError(res, 404, "Post not found.");
    const author = await User.findOne({ _id: post.authorId, status: "active", "profile.visibility": "public" }).select("_id");
    if (!author) return sendError(res, 404, "Post not found.");
    const existing = post.likes.some((id) => String(id) === req.user!.id);
    if (existing) post.likes = post.likes.filter((id) => String(id) !== req.user!.id);
    else post.likes.push(new Types.ObjectId(req.user!.id));
    await post.save();
    res.json({ liked: !existing, likesCount: post.likes.length });
  } catch (error) {
    next(error);
  }
});

router.post("/social/posts/:postId/comments", async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = parseOrRespond(socialCommentSchema, req.body, res);
    if (!data) return;
    const visiblePost = await SocialPost.findById(req.params.postId).select("authorId");
    if (!visiblePost) return sendError(res, 404, "Post not found.");
    const author = await User.findOne({ _id: visiblePost.authorId, status: "active", "profile.visibility": "public" }).select("_id");
    if (!author) return sendError(res, 404, "Post not found.");
    const post = await SocialPost.findByIdAndUpdate(
      req.params.postId,
      { $push: { comments: { authorId: req.user!.id, text: data.text } } },
      { new: true, runValidators: true },
    ).populate("comments.authorId", "name memberId profile.photoUrl");
    if (!post) return sendError(res, 404, "Post not found.");
    res.status(201).json({ comments: post.comments });
  } catch (error) {
    next(error);
  }
});

router.post("/social/members/:memberId/follow", async (req: AuthenticatedRequest, res, next) => {
  try {
    const target = await User.findOne({ memberId: req.params.memberId, role: "member", status: "active", "profile.visibility": "public" }).select("_id");
    if (!target) return sendError(res, 404, "This public profile is unavailable.");
    if (String(target._id) === req.user!.id) return sendError(res, 400, "You cannot follow your own profile.");
    await Follow.updateOne({ followerId: req.user!.id, followedId: target._id }, { $setOnInsert: { followerId: req.user!.id, followedId: target._id } }, { upsert: true });
    res.json({ following: true });
  } catch (error) {
    next(error);
  }
});

router.delete("/social/members/:memberId/follow", async (req: AuthenticatedRequest, res, next) => {
  try {
    const target = await User.findOne({ memberId: req.params.memberId, role: "member", status: "active" }).select("_id");
    if (!target) return sendError(res, 404, "Member not found.");
    await Follow.deleteOne({ followerId: req.user!.id, followedId: target._id });
    res.json({ following: false });
  } catch (error) {
    next(error);
  }
});

router.get("/social/analytics", async (req: AuthenticatedRequest, res, next) => {
  try {
    const posts = await SocialPost.find({ authorId: req.user!.id }).select("likes comments createdAt").lean();
    const [followers, following, newFollowers] = await Promise.all([
      Follow.countDocuments({ followedId: req.user!.id }),
      Follow.countDocuments({ followerId: req.user!.id }),
      Follow.countDocuments({ followedId: req.user!.id, createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
    ]);
    res.json({
      analytics: {
        followers,
        following,
        newFollowersLast30Days: newFollowers,
        posts: posts.length,
        likesReceived: posts.reduce((total, post) => total + post.likes.length, 0),
        commentsReceived: posts.reduce((total, post) => total + post.comments.length, 0),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/me", async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = parseOrRespond(profileSchema, req.body, res);
    if (!data) return;
    const user = await User.findByIdAndUpdate(req.user!.id, { $set: data }, { new: true, runValidators: true }).select("-passwordHash");
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

router.post("/me/photo", upload.single("photo"), async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.file || !req.file.mimetype.startsWith("image/")) return sendError(res, 400, "Choose an image file.");
    if (!config.CLOUDINARY_CLOUD_NAME || !config.CLOUDINARY_API_KEY || !config.CLOUDINARY_API_SECRET) {
      return sendError(res, 503, "Profile photo uploads are not configured. Set the Cloudinary environment variables.");
    }
    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "devqueens/profiles", resource_type: "image", transformation: [{ width: 800, height: 800, crop: "limit", quality: "auto", fetch_format: "auto" }] },
        (error, uploaded) => error ? reject(error) : resolve(uploaded),
      );
      Readable.from(req.file!.buffer).pipe(stream);
    });
    const user = await User.findByIdAndUpdate(req.user!.id, { "profile.photoUrl": result.secure_url }, { new: true }).select("-passwordHash");
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

router.get("/enrollments", async (req: AuthenticatedRequest, res, next) => {
  try {
    const enrollments = await Enrollment.find({ userId: req.user!.id }).populate("courseId");
    res.json({
      enrollments: enrollments.map((enrollment) => {
        const result = enrollment.toObject();
        if (result.courseId && typeof result.courseId === "object") result.courseId = publicCourse(result.courseId);
        return result;
      }),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/courses/:courseId/enroll", async (req: AuthenticatedRequest, res, next) => {
  try {
    const course = await Course.findOne({ _id: req.params.courseId, status: "published" });
    if (!course) return sendError(res, 404, "Course not found.");
    const enrollment = await Enrollment.findOneAndUpdate(
      { userId: req.user!.id, courseId: course._id },
      { $setOnInsert: { userId: req.user!.id, courseId: course._id } },
      { new: true, upsert: true },
    );
    res.status(201).json({ enrollment });
  } catch (error) {
    next(error);
  }
});

router.post("/courses/:courseId/lessons/:lessonId/complete", async (req: AuthenticatedRequest, res, next) => {
  try {
    const courseId = String(req.params.courseId);
    const lessonId = String(req.params.lessonId);
    const course = await Course.findOne({ _id: courseId, status: "published" });
    const lesson = course?.modules.flatMap((module: any) => module.lessons).find((item: any) => String(item._id) === lessonId);
    if (!course || !lesson) return sendError(res, 404, "Lesson not found.");
    const enrollment = await Enrollment.findOne({ userId: req.user!.id, courseId: course._id });
    if (!enrollment) return sendError(res, 403, "Enroll in this course before marking lessons complete.");
    const submittedExercise = z.object({ exerciseResponse: z.string().max(10000).optional().default("") }).safeParse(req.body ?? {});
    if (!submittedExercise.success) return sendError(res, 400, "Exercise response is too long.");
    if (lesson.exercise?.trim() && !submittedExercise.data.exerciseResponse.trim()) {
      return sendError(res, 400, "Submit your exercise response before completing this lesson.");
    }
    if (!enrollment.completedLessonIds.includes(lessonId)) {
      enrollment.completedLessonIds.push(lessonId);
      if (lesson.exercise?.trim()) {
        enrollment.exerciseSubmissions.push({ lessonId, response: submittedExercise.data.exerciseResponse });
      }
    }
    const ids = courseLessonIds(course);
    enrollment.progress = ids.length ? Math.round((enrollment.completedLessonIds.length / ids.length) * 100) : 0;
    if (enrollment.progress >= course.completionRequirementPercent) enrollment.completedAt = new Date();
    await enrollment.save();
    res.json({ enrollment });
  } catch (error) {
    next(error);
  }
});

router.post("/courses/:courseId/assessment/start", async (req: AuthenticatedRequest, res, next) => {
  try {
    const course = await Course.findOne({ _id: req.params.courseId, status: "published" });
    if (!course) return sendError(res, 404, "Course not found.");
    if (!(await checkCourseCompletion(req.user!.id, course))) return sendError(res, 403, "Complete the required lessons before starting the final assessment.");
    const now = new Date();
    if (course.assessment.availableFrom && now < course.assessment.availableFrom) return sendError(res, 403, "This assessment is not available yet.");
    if (course.assessment.availableUntil && now > course.assessment.availableUntil) return sendError(res, 403, "The assessment availability period has ended.");
    const active = await AssessmentAttempt.findOne({ userId: req.user!.id, courseId: course._id, status: "in-progress" });
    if (active) {
      const elapsedMinutes = (now.getTime() - new Date(active.startedAt).getTime()) / 60000;
      if (elapsedMinutes <= course.assessment.timeLimitMinutes + 1) {
        return res.json({ attemptId: active.id, startedAt: active.startedAt, assessment: publicCourse(course).assessment });
      }
      active.status = "failed";
      active.submittedAt = now;
      await active.save();
    }
    const priorCount = await AssessmentAttempt.countDocuments({ userId: req.user!.id, courseId: course._id, status: { $ne: "in-progress" } });
    if (priorCount >= course.assessment.attemptLimit) return sendError(res, 403, "You have used all available assessment attempts.");
    const totalMarks = course.assessment.questions.reduce((sum: number, question: any) => sum + question.marks, 0);
    const attempt = await AssessmentAttempt.create({ userId: req.user!.id, courseId: course._id, totalMarks });
    res.status(201).json({ attemptId: attempt.id, startedAt: attempt.startedAt, assessment: publicCourse(course).assessment });
  } catch (error) {
    next(error);
  }
});

router.post("/courses/:courseId/assessment/:attemptId/submit", async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = parseOrRespond(assessmentAnswersSchema, req.body, res);
    if (!data) return;
    const course = await Course.findById(req.params.courseId);
    const attempt = await AssessmentAttempt.findOne({
      _id: req.params.attemptId, courseId: req.params.courseId, userId: req.user!.id, status: "in-progress",
    });
    if (!course || !attempt) return sendError(res, 404, "Assessment attempt not found or already submitted.");
    const elapsed = (Date.now() - new Date(attempt.startedAt).getTime()) / 60000;
    if (elapsed > course.assessment.timeLimitMinutes + 1) return sendError(res, 403, "The assessment time limit has elapsed.");
    let graded;
    try {
      graded = gradeObjectiveAnswers(course.assessment.questions as any, data.answers);
    } catch (error) {
      return sendError(res, 400, error instanceof Error ? error.message : "Assessment answers are invalid.");
    }
    attempt.answers = graded.answers;
    attempt.score = graded.score;
    attempt.status = graded.needsReview ? "pending-review" : graded.score / attempt.totalMarks * 100 >= course.assessment.passingScore ? "passed" : "failed";
    attempt.submittedAt = new Date();
    await attempt.save();
    let certificate;
    if (attempt.status === "passed") certificate = await createCertificate(req.user!.id, course.id);
    res.json({ attempt, certificate });
  } catch (error) {
    next(error);
  }
});

router.get("/courses/:courseId/assessment-results", async (req: AuthenticatedRequest, res, next) => {
  try {
    const attempts = await AssessmentAttempt.find({
      userId: req.user!.id,
      courseId: req.params.courseId,
      status: { $ne: "in-progress" },
    }).sort({ submittedAt: -1 }).select("score totalMarks status startedAt submittedAt");
    const certificate = attempts.some((attempt) => attempt.status === "passed")
      ? await Certificate.findOne({ userId: req.user!.id, courseId: req.params.courseId, revokedAt: { $exists: false } }).select("certificateId")
      : null;
    res.json({ attempts, certificate });
  } catch (error) {
    next(error);
  }
});

router.get("/certificates", async (req: AuthenticatedRequest, res, next) => {
  try {
    const certificates = await Certificate.find({ userId: req.user!.id, revokedAt: { $exists: false } }).populate("courseId", "title slug");
    res.json({ certificates });
  } catch (error) {
    next(error);
  }
});

router.get("/member-card", async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await User.findById(req.user!.id).select("-passwordHash");
    res.json({ user, profileUrl: `${config.APP_URL}/members/${user!.memberId}` });
  } catch (error) {
    next(error);
  }
});

router.get("/admin/stats", requireAdmin, async (_req, res, next) => {
  try {
    const [members, activeCourses, enrollments, certificates, pendingAssessments, contentCounts] = await Promise.all([
      User.countDocuments({ role: "member" }),
      Course.countDocuments({ status: "published" }),
      Enrollment.countDocuments(),
      Certificate.countDocuments({ revokedAt: { $exists: false } }),
      AssessmentAttempt.countDocuments({ status: "pending-review" }),
      Promise.all(contentKinds.map(async (kind) => [kind, await ContentEntry.countDocuments({ kind })] as const)),
    ]);
    res.json({ stats: { members, activeCourses, enrollments, certificates, pendingAssessments, content: Object.fromEntries(contentCounts) } });
  } catch (error) {
    next(error);
  }
});

router.get("/admin/members", requireAdmin, async (_req, res, next) => {
  try {
    const members = await User.find({ role: "member" }).select("-passwordHash").sort({ createdAt: -1 });
    res.json({ members });
  } catch (error) {
    next(error);
  }
});

router.get("/admin/enrollments", requireAdmin, async (_req, res, next) => {
  try {
    const enrollments = await Enrollment.find().populate("userId", "name email memberId status").populate("courseId", "title slug status").sort({ enrolledAt: -1 });
    res.json({ enrollments });
  } catch (error) {
    next(error);
  }
});

router.post("/admin/enrollments", requireAdmin, async (req, res, next) => {
  try {
    const parsed = z.object({
      memberId: z.string().regex(/^[a-f\d]{24}$/i),
      courseId: z.string().regex(/^[a-f\d]{24}$/i),
    }).safeParse(req.body);
    if (!parsed.success) return sendError(res, 400, "Select a valid member and course.");
    const [member, course] = await Promise.all([
      User.findOne({ _id: parsed.data.memberId, role: "member", status: "active" }),
      Course.findOne({ _id: parsed.data.courseId, status: "published" }),
    ]);
    if (!member) return sendError(res, 404, "Active member not found.");
    if (!course) return sendError(res, 404, "Published course not found.");
    const enrollment = await Enrollment.findOneAndUpdate(
      { userId: member._id, courseId: course._id },
      { $setOnInsert: { userId: member._id, courseId: course._id } },
      { new: true, upsert: true },
    );
    res.status(201).json({ enrollment });
  } catch (error) {
    next(error);
  }
});

router.delete("/admin/enrollments/:id", requireAdmin, async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) return sendError(res, 404, "Enrollment not found.");
    const [attempts, certificates] = await Promise.all([
      AssessmentAttempt.exists({ userId: enrollment.userId, courseId: enrollment.courseId }),
      Certificate.exists({ userId: enrollment.userId, courseId: enrollment.courseId }),
    ]);
    if (attempts || certificates) return sendError(res, 409, "This enrollment has assessment or certificate records and cannot be removed.");
    await enrollment.deleteOne();
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

router.post("/admin/members", requireAdmin, async (req, res, next) => {
  try {
    const data = parseOrRespond(registrationSchema, req.body, res);
    if (!data) return;
    const email = data.email.toLowerCase();
    if (await User.exists({ email })) return sendError(res, 409, "An account with this email already exists.");
    const user = await User.create({
      name: data.name,
      email,
      passwordHash: await bcrypt.hash(data.password, 12),
      memberDetails: data.memberDetails,
      memberId: `DQ-${new Date().getFullYear()}-${randomBytes(4).toString("hex").toUpperCase()}`,
    });
    res.status(201).json({ user: { id: user.id, name: user.name, email: user.email, memberId: user.memberId } });
  } catch (error) {
    next(error);
  }
});

router.patch("/admin/members/:id/status", requireAdmin, async (req, res, next) => {
  try {
    const parsed = z.object({ status: z.enum(["active", "suspended"]) }).safeParse(req.body);
    if (!parsed.success) return sendError(res, 400, "Choose a valid member status.");
    const member = await User.findOneAndUpdate({ _id: req.params.id, role: "member" }, { status: parsed.data.status }, { new: true }).select("-passwordHash");
    if (!member) return sendError(res, 404, "Member not found.");
    res.json({ member });
  } catch (error) {
    next(error);
  }
});

router.patch("/admin/members/:id/badges", requireAdmin, async (req, res, next) => {
  try {
    const parsed = z.object({ badgeIds: z.array(z.string().regex(/^[a-f\d]{24}$/i)).max(30) }).safeParse(req.body);
    if (!parsed.success) return sendError(res, 400, "Choose valid member badges.");
    const badges = await ContentEntry.find({ _id: { $in: parsed.data.badgeIds }, kind: "badge" }).select("_id");
    if (badges.length !== new Set(parsed.data.badgeIds).size) return sendError(res, 400, "One or more selected badges do not exist.");
    const member = await User.findOneAndUpdate(
      { _id: req.params.id, role: "member" },
      { badgeIds: parsed.data.badgeIds },
      { new: true, runValidators: true },
    ).select("-passwordHash");
    if (!member) return sendError(res, 404, "Member not found.");
    res.json({ member });
  } catch (error) {
    next(error);
  }
});

router.get("/admin/courses", requireAdmin, async (_req, res, next) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json({ courses });
  } catch (error) {
    next(error);
  }
});

router.post("/admin/courses/import/preview", requireAdmin, (req, res) => {
  const course = parseOrRespond(courseSchema, req.body, res);
  if (course) res.json({ valid: true, preview: course });
});

router.post("/admin/courses/import", requireAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = parseOrRespond(courseSchema, req.body, res);
    if (!data) return;
    const course = await Course.create({ ...data, createdBy: req.user!.id });
    res.status(201).json({ course });
  } catch (error) {
    next(error);
  }
});

router.post("/admin/courses", requireAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = parseOrRespond(courseSchema, req.body, res);
    if (!data) return;
    const course = await Course.create({ ...data, createdBy: req.user!.id });
    res.status(201).json({ course });
  } catch (error) {
    next(error);
  }
});

router.put("/admin/courses/:id", requireAdmin, async (req, res, next) => {
  try {
    const data = parseOrRespond(courseSchema, req.body, res);
    if (!data) return;
    const course = await Course.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!course) return sendError(res, 404, "Course not found.");
    res.json({ course });
  } catch (error) {
    next(error);
  }
});

router.delete("/admin/courses/:id", requireAdmin, async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return sendError(res, 404, "Course not found.");
    const [enrollments, attempts, certificates] = await Promise.all([
      Enrollment.exists({ courseId: course._id }),
      AssessmentAttempt.exists({ courseId: course._id }),
      Certificate.exists({ courseId: course._id }),
    ]);
    if (enrollments || attempts || certificates) {
      return sendError(res, 409, "This course has learner records and cannot be deleted. Change its status to draft instead.");
    }
    await course.deleteOne();
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

router.get("/admin/assessments", requireAdmin, async (_req, res, next) => {
  try {
    const attempts = await AssessmentAttempt.find({ status: { $in: ["pending-review", "passed", "failed"] } })
      .populate("userId", "name email memberId").populate("courseId", "title").sort({ submittedAt: -1 });
    res.json({ attempts });
  } catch (error) {
    next(error);
  }
});

router.post("/admin/assessments/:attemptId/grade", requireAdmin, async (req, res, next) => {
  try {
    const data = parseOrRespond(z.object({ grades: z.array(z.object({ questionId: z.string(), marks: z.number().min(0) })) }), req.body, res);
    if (!data) return;
    const attempt = await AssessmentAttempt.findById(req.params.attemptId);
    if (!attempt || attempt.status !== "pending-review") return sendError(res, 404, "Assessment awaiting review not found.");
    const course = await Course.findById(attempt.courseId);
    if (!course) return sendError(res, 404, "Course not found.");
    for (const grade of data.grades) {
      const question = course.assessment.questions.find((item: any) => String(item._id) === grade.questionId);
      const answer = attempt.answers.find((item: any) => item.questionId === grade.questionId);
      if (!question || question.type !== "practical" || !answer?.pendingReview) return sendError(res, 400, "A submitted practical answer was not found.");
      if (grade.marks > question.marks) return sendError(res, 400, "Awarded marks cannot exceed the question's maximum.");
      answer.awardedMarks = grade.marks;
      answer.pendingReview = false;
    }
    if (attempt.answers.some((answer: any) => answer.pendingReview)) return sendError(res, 400, "Grade every practical response before submitting a final review.");
    attempt.score = attempt.answers.reduce((sum: number, answer: any) => sum + answer.awardedMarks, 0);
    attempt.status = attempt.score / attempt.totalMarks * 100 >= course.assessment.passingScore ? "passed" : "failed";
    await attempt.save();
    const certificate = attempt.status === "passed" ? await createCertificate(String(attempt.userId), String(attempt.courseId)) : undefined;
    res.json({ attempt, certificate });
  } catch (error) {
    next(error);
  }
});

router.get("/admin/certificates", requireAdmin, async (_req, res, next) => {
  try {
    const certificates = await Certificate.find().populate("userId", "name email memberId").populate("courseId", "title").sort({ issuedAt: -1 });
    res.json({ certificates });
  } catch (error) {
    next(error);
  }
});

router.patch("/admin/certificates/:id/revoke", requireAdmin, async (req, res, next) => {
  try {
    const certificate = await Certificate.findByIdAndUpdate(req.params.id, { revokedAt: new Date() }, { new: true });
    if (!certificate) return sendError(res, 404, "Certificate not found.");
    res.json({ certificate });
  } catch (error) {
    next(error);
  }
});

router.get("/admin/content/:kind", requireAdmin, async (req, res, next) => {
  try {
    if (!contentKinds.includes(req.params.kind as ContentKind)) return sendError(res, 404, "Content collection not found.");
    const kind = req.params.kind as ContentKind;
    const items = await ContentEntry.find({ kind }).sort({ createdAt: -1 });
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.post("/admin/content/:kind", requireAdmin, async (req, res, next) => {
  try {
    if (!contentKinds.includes(req.params.kind as ContentKind)) return sendError(res, 404, "Content collection not found.");
    const kind = req.params.kind as ContentKind;
    const data = parseOrRespond(contentSchema, req.body, res);
    if (!data) return;
    const item = await ContentEntry.create({ kind, ...data });
    res.status(201).json({ item });
  } catch (error) {
    next(error);
  }
});

router.put("/admin/content/:kind/:id", requireAdmin, async (req, res, next) => {
  try {
    if (!contentKinds.includes(req.params.kind as ContentKind)) return sendError(res, 404, "Content collection not found.");
    const kind = req.params.kind as ContentKind;
    const data = parseOrRespond(contentSchema, req.body, res);
    if (!data) return;
    const item = await ContentEntry.findOneAndUpdate({ _id: req.params.id, kind }, data, { new: true, runValidators: true });
    if (!item) return sendError(res, 404, "Content item not found.");
    res.json({ item });
  } catch (error) {
    next(error);
  }
});

router.delete("/admin/content/:kind/:id", requireAdmin, async (req, res, next) => {
  try {
    if (!contentKinds.includes(req.params.kind as ContentKind)) return sendError(res, 404, "Content collection not found.");
    const kind = req.params.kind as ContentKind;
    const item = await ContentEntry.findOneAndDelete({ _id: req.params.id, kind });
    if (!item) return sendError(res, 404, "Content item not found.");
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

router.post("/admin/upload", requireAdmin, upload.single("image"), async (req, res, next) => {
  try {
    if (!req.file || !req.file.mimetype.startsWith("image/")) return sendError(res, 400, "Choose an image file.");
    if (!config.CLOUDINARY_CLOUD_NAME || !config.CLOUDINARY_API_KEY || !config.CLOUDINARY_API_SECRET) {
      return sendError(res, 503, "Image uploads are not configured. Set the Cloudinary environment variables.");
    }
    const uploaded = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "devqueens/content", resource_type: "image", transformation: [{ width: 2000, height: 2000, crop: "limit", quality: "auto", fetch_format: "auto" }] },
        (error, result) => error ? reject(error) : resolve(result),
      );
      Readable.from(req.file!.buffer).pipe(stream);
    });
    res.json({ url: uploaded.secure_url });
  } catch (error) {
    next(error);
  }
});

router.get("/admin/settings", requireAdmin, async (_req, res, next) => {
  try {
    const settings = await PlatformSettings.find().lean();
    res.json({ settings: Object.fromEntries(settings.map((item) => [item.key, item.value])) });
  } catch (error) {
    next(error);
  }
});

router.put("/admin/community-link", requireAdmin, async (req, res, next) => {
  try {
    const parsed = communityLinkSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, 400, "Provide a valid HTTPS community link and enabled setting.", parsed.error.flatten());
    await Promise.all([
      PlatformSettings.findOneAndUpdate(
        { key: "communityJoinUrl" }, { value: parsed.data.url }, { upsert: true, new: true, runValidators: true },
      ),
      PlatformSettings.findOneAndUpdate(
        { key: "communityJoinEnabled" }, { value: parsed.data.enabled }, { upsert: true, new: true, runValidators: true },
      ),
    ]);
    res.json(parsed.data);
  } catch (error) {
    next(error);
  }
});

router.put("/admin/settings", requireAdmin, async (req, res, next) => {
  try {
    const parsed = z.record(z.string().max(80), z.unknown()).safeParse(req.body);
    if (!parsed.success) return sendError(res, 400, "Settings must be a key-value object.");
    if (parsed.data.communityJoinUrl !== undefined) {
      const url = z.string().url().max(2048).refine((value) => {
        try { return new URL(value).protocol === "https:"; } catch { return false; }
      }).safeParse(parsed.data.communityJoinUrl);
      if (!url.success) return sendError(res, 400, "Community link must be a valid HTTPS URL.");
    }
    if (parsed.data.communityJoinEnabled !== undefined && typeof parsed.data.communityJoinEnabled !== "boolean") {
      return sendError(res, 400, "Community button enabled setting must be a boolean.");
    }
    const updates = Object.entries(parsed.data).map(([key, value]) => PlatformSettings.findOneAndUpdate(
      { key }, { value }, { upsert: true, new: true, runValidators: true },
    ));
    await Promise.all(updates);
    res.json({ settings: parsed.data });
  } catch (error) {
    next(error);
  }
});

router.get("/admin/reports", requireAdmin, async (_req, res, next) => {
  try {
    const [monthlyMembers, courseEnrollments, completions] = await Promise.all([
      User.aggregate([{ $match: { role: "member" } }, { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }, { $limit: 24 }]),
      Enrollment.aggregate([{ $group: { _id: "$courseId", enrollments: { $sum: 1 }, completions: { $sum: { $cond: [{ $gt: ["$progress", 99] }, 1, 0] } } } }, { $sort: { enrollments: -1 } }]),
      AssessmentAttempt.aggregate([{ $match: { status: { $in: ["passed", "failed"] } } }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
    ]);
    const ids = courseEnrollments.map((entry: any) => entry._id);
    const courses = await Course.find({ _id: { $in: ids } }).select("title").lean();
    const names = new Map(courses.map((course: any) => [String(course._id), course.title]));
    res.json({
      reports: {
        monthlyMembers,
        courseEnrollments: courseEnrollments.map((entry: any) => ({ ...entry, course: names.get(String(entry._id)) ?? "Removed course" })),
        assessments: completions,
      },
    });
  } catch (error) {
    next(error);
  }
});

app.use("/api", router);

app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error?.name === "ZodError") return sendError(res, 400, "Invalid request data.");
  if (error?.code === 11000) return sendError(res, 409, "A record with the same unique value already exists.");
  if (error instanceof multer.MulterError) return sendError(res, 400, error.code === "LIMIT_FILE_SIZE" ? "Images must be 5 MB or smaller." : "The uploaded file could not be accepted.");
  console.error("API request failed:", error);
  sendError(res, 500, "The request could not be completed. Please try again.");
});

export default app;
