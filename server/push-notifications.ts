import { db } from "./db";
import { pushTokens } from "@shared/schema";
import { eq, and } from "drizzle-orm";

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: "default" | null;
  badge?: number;
}

export async function registerPushToken(userId: string, token: string): Promise<void> {
  const existing = await db
    .select()
    .from(pushTokens)
    .where(and(eq(pushTokens.userId, userId), eq(pushTokens.token, token)));

  if (existing.length === 0) {
    await db.insert(pushTokens).values({ userId, token });
  }
}

export async function removePushToken(userId: string, token: string): Promise<void> {
  await db
    .delete(pushTokens)
    .where(and(eq(pushTokens.userId, userId), eq(pushTokens.token, token)));
}

export async function getUserPushTokens(userId: string): Promise<string[]> {
  const tokens = await db
    .select({ token: pushTokens.token })
    .from(pushTokens)
    .where(eq(pushTokens.userId, userId));

  return tokens.map((t) => t.token);
}

export async function sendPushNotifications(
  userIds: string[],
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<void> {
  const allTokens: string[] = [];

  for (const userId of userIds) {
    const tokens = await getUserPushTokens(userId);
    allTokens.push(...tokens);
  }

  if (allTokens.length === 0) return;

  const messages: ExpoPushMessage[] = allTokens.map((token) => ({
    to: token,
    title,
    body,
    sound: "default" as const,
    badge: 1,
    data: data || {},
  }));

  const chunks = chunkArray(messages, 100);

  for (const chunk of chunks) {
    try {
      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(chunk),
      });
    } catch (error) {
      console.error("Error sending push notifications:", error);
    }
  }
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}
