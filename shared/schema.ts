import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  familyName: text("family_name").notNull(),
  bio: text("bio").default(""),
  avatarUrl: text("avatar_url"),
  suburb: text("suburb"),
  city: text("city"),
  lat: real("lat"),
  lon: real("lon"),
  radiusPreference: integer("radius_preference").default(25),
  interests: text("interests").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const familyMembers = pgTable("family_members", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const connections = pgTable("connections", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  targetUserId: varchar("target_user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messageThreads = pgTable("message_threads", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  user1Id: varchar("user1_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  user2Id: varchar("user2_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  lastMessage: text("last_message"),
  lastMessageAt: timestamp("last_message_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  threadId: varchar("thread_id", { length: 36 })
    .notNull()
    .references(() => messageThreads.id, { onDelete: "cascade" }),
  senderId: varchar("sender_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  read: boolean("read").default(false),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  date: text("date").notNull(),
  time: text("time"),
  location: text("location").notNull(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  familyName: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const insertFamilyMemberSchema = createInsertSchema(familyMembers).pick({
  name: true,
  age: true,
});

export const insertConnectionSchema = createInsertSchema(connections).pick({
  targetUserId: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  threadId: true,
  text: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type FamilyMember = typeof familyMembers.$inferSelect;
export type Connection = typeof connections.$inferSelect;
export type MessageThread = typeof messageThreads.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Event = typeof events.$inferSelect;
