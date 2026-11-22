import { Types } from "mongoose";

export function unreadMessageFilter(role: "admin" | "member", userId: string, threadId?: Types.ObjectId) {
  const userObjectId = new Types.ObjectId(userId);
  const unreadFromOthers = {
    senderId: { $ne: userObjectId },
    readBy: { $ne: userObjectId },
  };

  if (role === "member") {
    return {
      $or: [
        ...(threadId ? [{ ...unreadFromOthers, threadId }] : []),
        { ...unreadFromOthers, broadcast: true },
      ],
    };
  }

  return {
    ...unreadFromOthers,
    threadId: { $exists: true },
  };
}
