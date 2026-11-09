import { describe, expect, it } from "vitest";
import { gradeObjectiveAnswers } from "./assessment.js";
import { chatMessageSchema, contentSchema, courseSchema, registrationSchema, socialCommentSchema, socialPostSchema } from "./validation.js";

const validCourse = {
  title: "Foundations of Web Development",
  slug: "foundations-web-development",
  description: "Learn the foundations of the web and build your first accessible page.",
  level: "Beginner",
  status: "draft",
  completionRequirementPercent: 80,
  modules: [{
    title: "Getting started",
    lessons: [{ title: "How the web works", content: "Browsers request web pages from servers." }],
  }],
  assessment: {
    passingScore: 70,
    attemptLimit: 3,
    timeLimitMinutes: 45,
    questions: [{
      prompt: "Which language structures a web page?",
      type: "multiple-choice",
      options: ["HTML", "CSS"],
      correctAnswer: "HTML",
      marks: 1,
    }],
  },
};

describe("course import validation", () => {
  it("accepts a complete course and applies safe defaults", () => {
    const result = courseSchema.parse(validCourse);
    expect(result.modules[0].lessons[0].resources).toEqual([]);
    expect(result.assessment.attemptLimit).toBe(3);
  });

  it("rejects malformed course slugs, empty curricula, and invalid answer keys", () => {
    expect(courseSchema.safeParse({ ...validCourse, slug: "../course" }).success).toBe(false);
    expect(courseSchema.safeParse({ ...validCourse, modules: [] }).success).toBe(false);
    expect(courseSchema.safeParse({
      ...validCourse,
      assessment: {
        ...validCourse.assessment,
        questions: [{ ...validCourse.assessment.questions[0], correctAnswer: "JavaScript" }],
      },
    }).success).toBe(false);
  });
});

describe("registration and published content validation", () => {
  const memberDetails = {
    country: "Rwanda",
    institutionType: "school",
    institutionName: "Example School",
    district: "Gasabo",
    ageRange: "16-17",
  };

  it("requires a strong password before registration", () => {
    expect(registrationSchema.safeParse({ name: "Amina N.", email: "amina@example.org", password: "simplepass", memberDetails }).success).toBe(false);
    expect(registrationSchema.safeParse({ name: "Amina N.", email: "amina@example.org", password: "SecurePass123", memberDetails }).success).toBe(true);
  });

  it("requires valid private member details at registration", () => {
    expect(registrationSchema.safeParse({
      name: "Amina N.",
      email: "amina@example.org",
      password: "SecurePass123",
      memberDetails: { ...memberDetails, ageRange: "12" },
    }).success).toBe(false);
    expect(registrationSchema.safeParse({
      name: "Amina N.",
      email: "amina@example.org",
      password: "SecurePass123",
      memberDetails: { ...memberDetails, institutionType: "unknown" },
    }).success).toBe(false);
  });

  it("rejects executable URLs in user-managed public content", () => {
    expect(contentSchema.safeParse({ data: { title: "Partner", url: "javascript:alert(1)" }, published: true }).success).toBe(false);
    expect(contentSchema.safeParse({ data: { title: "Partner", url: "https://example.org" }, published: true }).success).toBe(true);
  });
});

describe("community post validation", () => {
  it("limits post text and accepts image-only posts", () => {
    expect(socialPostSchema.safeParse({ text: "Building my first app!" }).success).toBe(true);
    expect(socialPostSchema.safeParse({ text: "x".repeat(1001) }).success).toBe(false);
    expect(socialPostSchema.safeParse({}).success).toBe(true);
  });

  it("requires non-empty comments and caps their length", () => {
    expect(socialCommentSchema.safeParse({ text: "Great work!" }).success).toBe(true);
    expect(socialCommentSchema.safeParse({ text: "   " }).success).toBe(false);
    expect(socialCommentSchema.safeParse({ text: "x".repeat(501) }).success).toBe(false);
  });
});

describe("chat message validation", () => {
  it("accepts text or image-only messages and caps message length", () => {
    expect(chatMessageSchema.safeParse({ text: "Hello team 😊" }).success).toBe(true);
    expect(chatMessageSchema.safeParse({}).success).toBe(true);
    expect(chatMessageSchema.safeParse({ text: "x".repeat(2001) }).success).toBe(false);
  });
});

describe("assessment grading", () => {
  it("grades objective answers case-insensitively and flags practical work for review", () => {
    const result = gradeObjectiveAnswers([
      { _id: "q1", type: "multiple-choice", correctAnswer: "HTML", marks: 2 },
      { _id: "q2", type: "true-false", correctAnswer: "True", marks: 1 },
      { _id: "q3", type: "practical", marks: 5 },
    ], [
      { questionId: "q1", answer: "html" },
      { questionId: "q2", answer: "True" },
      { questionId: "q3", answer: "A project link" },
    ]);

    expect(result.score).toBe(3);
    expect(result.needsReview).toBe(true);
    expect(result.answers[2].pendingReview).toBe(true);
  });

  it("rejects unknown and duplicate question identifiers", () => {
    const questions = [{ _id: "q1", type: "true-false" as const, correctAnswer: "True", marks: 1 }];
    expect(() => gradeObjectiveAnswers(questions, [{ questionId: "unknown", answer: "True" }])).toThrow("unknown question");
    expect(() => gradeObjectiveAnswers(questions, [
      { questionId: "q1", answer: "True" },
      { questionId: "q1", answer: "False" },
    ])).toThrow("one submitted answer");
  });
});
