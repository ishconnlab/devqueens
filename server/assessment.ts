export interface AssessmentQuestion {
  _id: { toString(): string } | string;
  type: "multiple-choice" | "true-false" | "practical";
  correctAnswer?: string;
  marks: number;
}

export interface SubmittedAnswer {
  questionId: string;
  answer: string;
}

export function gradeObjectiveAnswers(questions: AssessmentQuestion[], submittedAnswers: SubmittedAnswer[]) {
  const knownIds = new Set(questions.map((question) => String(question._id)));
  const submitted = new Map<string, string>();
  for (const answer of submittedAnswers) {
    if (!knownIds.has(answer.questionId)) throw new Error("An answer refers to an unknown question.");
    if (submitted.has(answer.questionId)) throw new Error("A question can only have one submitted answer.");
    submitted.set(answer.questionId, answer.answer);
  }

  let score = 0;
  let needsReview = false;
  const answers = questions.map((question) => {
    const questionId = String(question._id);
    const answer = submitted.get(questionId) ?? "";
    if (question.type === "practical") {
      needsReview = true;
      return { questionId, answer, awardedMarks: 0, pendingReview: true };
    }
    const expected = String(question.correctAnswer ?? "").trim().toLowerCase();
    const awardedMarks = answer.trim().toLowerCase() === expected ? question.marks : 0;
    score += awardedMarks;
    return { questionId, answer, awardedMarks, pendingReview: false };
  });
  return { answers, score, needsReview };
}
