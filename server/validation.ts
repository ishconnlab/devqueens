import { z } from "zod";

const httpUrl = z.string().url().refine((value) => {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
});
const safeUrl = z.union([httpUrl, z.literal("")]).optional();
const lessonSchema = z.object({
  title: z.string().trim().min(1).max(180),
  content: z.string().max(50000).optional().default(""),
  exercise: z.string().max(5000).optional().default(""),
  resources: z.array(z.object({ title: z.string().max(180), url: httpUrl })).max(30).optional().default([]),
});

export const courseSchema = z.object({
  title: z.string().trim().min(3).max(180),
  slug: z.string().trim().min(3).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().min(20).max(3000),
  coverImage: safeUrl,
  level: z.enum(["Beginner", "Intermediate", "Advanced"]).default("Beginner"),
  duration: z.string().max(80).optional().default(""),
  status: z.enum(["draft", "published"]).default("draft"),
  completionRequirementPercent: z.number().int().min(1).max(100).default(100),
  modules: z.array(
    z.object({
      title: z.string().trim().min(1).max(180),
      lessons: z.array(lessonSchema).min(1).max(100),
    }),
  ).min(1).max(40),
  assessment: z.object({
    passingScore: z.number().min(0).max(100).default(70),
    attemptLimit: z.number().int().min(1).max(20).default(3),
    timeLimitMinutes: z.number().int().min(1).max(600).default(60),
    availableFrom: z.coerce.date().optional(),
    availableUntil: z.coerce.date().optional(),
    questions: z.array(
      z.object({
        prompt: z.string().trim().min(1).max(2000),
        type: z.enum(["multiple-choice", "true-false", "practical"]),
        options: z.array(z.string().max(500)).max(10).optional().default([]),
        correctAnswer: z.string().max(2000).optional(),
        practicalInstructions: z.string().max(5000).optional(),
        marks: z.number().min(1).max(1000).default(1),
      }).superRefine((question, context) => {
        if (question.type === "multiple-choice") {
          const options = question.options.map((option) => option.trim()).filter(Boolean);
          if (options.length < 2) context.addIssue({ code: "custom", path: ["options"], message: "Add at least two answer options." });
          if (!options.includes(question.correctAnswer?.trim() ?? "")) context.addIssue({ code: "custom", path: ["correctAnswer"], message: "Choose one of the answer options as correct." });
        }
        if (question.type === "true-false" && !["True", "False"].includes(question.correctAnswer ?? "")) {
          context.addIssue({ code: "custom", path: ["correctAnswer"], message: "Choose True or False as the correct answer." });
        }
        if (question.type === "practical" && !question.practicalInstructions?.trim()) {
          context.addIssue({ code: "custom", path: ["practicalInstructions"], message: "Add instructions for the practical assessment." });
        }
      }),
    ).min(1).max(100),
  }).superRefine((assessment, context) => {
    if (assessment.availableFrom && assessment.availableUntil && assessment.availableUntil <= assessment.availableFrom) {
      context.addIssue({ code: "custom", path: ["availableUntil"], message: "The closing time must be after the opening time." });
    }
  }),
});

export const registrationSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  password: z.string().min(10).max(128).regex(/[a-z]/).regex(/[A-Z]/).regex(/[0-9]/),
  memberDetails: z.object({
    country: z.string().trim().min(2).max(80),
    institutionType: z.enum(["school", "other"]),
    institutionName: z.string().trim().min(2).max(120),
    district: z.string().trim().min(2).max(100),
    ageRange: z.enum(["13-15", "16-17", "18-24", "25+"]),
  }),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  profile: z.object({
    bio: z.string().max(500).optional(),
    photoUrl: safeUrl,
    country: z.string().max(80).optional(),
    interests: z.array(z.string().trim().min(1).max(50)).max(20).optional(),
    visibility: z.enum(["public", "private"]).optional(),
    linkedin: safeUrl,
    github: safeUrl,
    portfolio: safeUrl,
  }).optional(),
});

export const socialPostSchema = z.object({
  text: z.string().trim().max(1000).default(""),
});

export const socialCommentSchema = z.object({
  text: z.string().trim().min(1).max(500),
});

export const chatMessageSchema = z.object({
  text: z.string().trim().max(2000).default(""),
});

export const contentSchema = z.object({
  data: z.record(z.string(), z.unknown()).superRefine((data, context) => {
    if (Object.keys(data).length > 50) context.addIssue({ code: "custom", message: "A content item cannot have more than 50 fields." });
    if (JSON.stringify(data).length > 100_000) context.addIssue({ code: "custom", message: "Content data must be smaller than 100 KB." });
    for (const key of ["url", "imageUrl", "photoUrl", "certificateUrl"]) {
      const value = data[key];
      if (value === undefined || value === "") continue;
      if (typeof value !== "string") {
        context.addIssue({ code: "custom", path: [key], message: `${key} must be a URL.` });
        continue;
      }
      try {
        if (!["http:", "https:"].includes(new URL(value).protocol)) throw new Error("Unsupported URL protocol.");
      } catch {
        context.addIssue({ code: "custom", path: [key], message: `${key} must be an HTTP or HTTPS URL.` });
      }
    }
  }),
  published: z.boolean().optional(),
});

export const assessmentAnswersSchema = z.object({
  answers: z.array(z.object({ questionId: z.string(), answer: z.string().max(10000) })).max(100),
});
