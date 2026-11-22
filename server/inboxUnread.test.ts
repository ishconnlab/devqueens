import { Types } from "mongoose";
import { describe, expect, it } from "vitest";
import { unreadMessageFilter } from "./inboxUnread.js";

const userId = "65a000000000000000000001";
const threadId = new Types.ObjectId("65a000000000000000000002");
const userObjectId = new Types.ObjectId(userId);

describe("unreadMessageFilter", () => {
  it("counts a member's unread direct messages and announcements without requiring an existing thread", () => {
    expect(unreadMessageFilter("member", userId)).toEqual({
      $or: [
        { senderId: { $ne: userObjectId }, readBy: { $ne: userObjectId }, broadcast: true },
      ],
    });
  });

  it("limits a member's direct unread messages to their thread", () => {
    expect(unreadMessageFilter("member", userId, threadId)).toEqual({
      $or: [
        { senderId: { $ne: userObjectId }, readBy: { $ne: userObjectId }, threadId },
        { senderId: { $ne: userObjectId }, readBy: { $ne: userObjectId }, broadcast: true },
      ],
    });
  });

  it("counts only unread direct messages for administrators", () => {
    expect(unreadMessageFilter("admin", userId)).toEqual({
      senderId: { $ne: userObjectId },
      readBy: { $ne: userObjectId },
      threadId: { $exists: true },
    });
  });
});
