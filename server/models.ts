import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const profileSchema = new Schema(
  {
    bio: { type: String, maxlength: 500, default: "" },
    photoUrl: { type: String, default: "" },
    country: { type: String, maxlength: 80, default: "" },
    interests: { type: [String], default: [] },
    visibility: { type: String, enum: ["public", "private"], default: "public" },
    linkedin: { type: String, default: "" },
    github: { type: String, default: "" },
    portfolio: { type: String, default: "" },
  },
  { _id: false },
);

const memberDetailsSchema = new Schema(
  {
    country: { type: String, required: true, trim: true, maxlength: 80 },
    institutionType: { type: String, enum: ["school", "other"], required: true },
    institutionName: { type: String, required: true, trim: true, maxlength: 120 },
    district: { type: String, required: true, trim: true, maxlength: 100 },
    ageRange: { type: String, enum: ["13-15", "16-17", "18-24", "25+"], required: true },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["member", "admin"], default: "member" },
    memberId: { type: String, unique: true, sparse: true },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    profile: { type: profileSchema, default: () => ({}) },
    memberDetails: { type: memberDetailsSchema, default: undefined, select: false },
    badgeIds: { type: [String], default: [] },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

userSchema.methods.verifyPassword = function (password: string) {
  return bcrypt.compare(password, this.passwordHash);
};

export const User = mongoose.model("User", userSchema);

export const Follow = mongoose.model(
  "Follow",
  new Schema(
    {
      followerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      followedId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true },
  ).index({ followerId: 1, followedId: 1 }, { unique: true }),
);

export const SocialPost = mongoose.model(
  "SocialPost",
  new Schema(
    {
      authorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
      text: { type: String, trim: true, maxlength: 1000, default: "" },
      imageUrl: { type: String, default: "" },
      likes: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
      comments: [{
        authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        text: { type: String, required: true, trim: true, maxlength: 500 },
        createdAt: { type: Date, default: Date.now },
      }],
    },
    { timestamps: true },
  ).index({ authorId: 1, createdAt: -1 }),
);

export const ChatThread = mongoose.model(
  "ChatThread",
  new Schema(
    {
      memberId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
      lastMessageAt: { type: Date, default: Date.now, index: true },
      lastMessageText: { type: String, default: "" },
    },
    { timestamps: true },
  ),
);

export const ChatMessage = mongoose.model(
  "ChatMessage",
  new Schema(
    {
      threadId: { type: Schema.Types.ObjectId, ref: "ChatThread" },
      broadcast: { type: Boolean, default: false, index: true },
      senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      text: { type: String, trim: true, maxlength: 2000, default: "" },
      imageUrl: { type: String, default: "" },
      readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    },
    { timestamps: true },
  ).index({ threadId: 1, createdAt: 1 }).index({ broadcast: 1, createdAt: -1 }),
);

const lessonSchema = new Schema({
  title: { type: String, required: true, trim: true, maxlength: 180 },
  content: { type: String, default: "", maxlength: 50000 },
  resources: [{ title: String, url: String }],
  exercise: { type: String, default: "" },
});

const courseSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 180 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true, maxlength: 3000 },
    coverImage: { type: String, default: "" },
    level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" },
    duration: { type: String, default: "" },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    completionRequirementPercent: { type: Number, min: 1, max: 100, default: 100 },
    modules: [{ title: { type: String, required: true }, lessons: [lessonSchema] }],
    assessment: {
      passingScore: { type: Number, min: 0, max: 100, default: 70 },
      attemptLimit: { type: Number, min: 1, max: 20, default: 3 },
      timeLimitMinutes: { type: Number, min: 1, max: 600, default: 60 },
      availableFrom: Date,
      availableUntil: Date,
      questions: [
        {
          prompt: { type: String, required: true },
          type: { type: String, enum: ["multiple-choice", "true-false", "practical"], required: true },
          options: [String],
          correctAnswer: { type: String },
          practicalInstructions: String,
          marks: { type: Number, min: 1, default: 1 },
        },
      ],
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export const Course = mongoose.model("Course", courseSchema);

export const Enrollment = mongoose.model(
  "Enrollment",
  new Schema(
    {
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
      completedLessonIds: { type: [String], default: [] },
      exerciseSubmissions: [{ lessonId: String, response: String, submittedAt: { type: Date, default: Date.now } }],
      progress: { type: Number, min: 0, max: 100, default: 0 },
      enrolledAt: { type: Date, default: Date.now },
      completedAt: Date,
    },
    { timestamps: true },
  ).index({ userId: 1, courseId: 1 }, { unique: true }),
);

export const AssessmentAttempt = mongoose.model(
  "AssessmentAttempt",
  new Schema(
    {
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
      answers: [{ questionId: String, answer: String, awardedMarks: Number, pendingReview: Boolean }],
      score: { type: Number, default: 0 },
      totalMarks: { type: Number, required: true },
      status: { type: String, enum: ["in-progress", "pending-review", "passed", "failed"], default: "in-progress" },
      startedAt: { type: Date, default: Date.now },
      submittedAt: Date,
    },
    { timestamps: true },
  ),
);

export const Certificate = mongoose.model(
  "Certificate",
  new Schema(
    {
      certificateId: { type: String, required: true, unique: true },
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
      issuedAt: { type: Date, default: Date.now },
      revokedAt: Date,
    },
    { timestamps: true },
  ),
);

export const ContentEntry = mongoose.model(
  "ContentEntry",
  new Schema(
    {
      kind: {
        type: String,
        enum: ["team", "badge", "alumni", "achiever", "partner", "gallery", "testimonial"],
        required: true,
        index: true,
      },
      data: { type: Schema.Types.Mixed, required: true },
      published: { type: Boolean, default: false },
    },
    { timestamps: true },
  ),
);

export const PlatformSettings = mongoose.model(
  "PlatformSettings",
  new Schema(
    {
      key: { type: String, required: true, unique: true },
      value: { type: Schema.Types.Mixed, required: true },
    },
    { timestamps: true },
  ),
);
