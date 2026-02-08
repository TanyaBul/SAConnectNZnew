import { db } from "./db";
import { eq, and, or, ne, desc, sql } from "drizzle-orm";
import * as schema from "@shared/schema";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export interface IStorage {
  createUser(email: string, password: string, familyName: string): Promise<schema.User>;
  getUserByEmail(email: string): Promise<schema.User | undefined>;
  getUserById(id: string): Promise<schema.User | undefined>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
  updateUser(id: string, updates: Partial<Omit<schema.User, "id" | "password" | "createdAt">>): Promise<schema.User | undefined>;
  
  getFamilyMembers(userId: string): Promise<schema.FamilyMember[]>;
  addFamilyMember(userId: string, name: string, age: number): Promise<schema.FamilyMember>;
  updateFamilyMember(id: string, name: string, age: number): Promise<schema.FamilyMember | undefined>;
  deleteFamilyMember(id: string): Promise<void>;
  
  getDiscoverFamilies(userId: string): Promise<(schema.User & { distance?: number; familyMembers: schema.FamilyMember[] })[]>;
  
  getConnections(userId: string): Promise<schema.Connection[]>;
  createConnection(userId: string, targetUserId: string): Promise<schema.Connection>;
  updateConnectionStatus(id: string, status: string): Promise<schema.Connection | undefined>;
  getConnectionBetween(userId: string, targetUserId: string): Promise<schema.Connection | undefined>;
  
  getThreads(userId: string): Promise<(schema.MessageThread & { otherUser: schema.User; unreadCount: number })[]>;
  getOrCreateThread(userId1: string, userId2: string): Promise<schema.MessageThread>;
  getMessages(threadId: string): Promise<schema.Message[]>;
  sendMessage(threadId: string, senderId: string, text: string): Promise<schema.Message>;
  markThreadAsRead(threadId: string, userId: string): Promise<void>;
  
  getEvents(): Promise<(schema.Event & { user: schema.User; attendeeCount: number; attendees: string[] })[]>;
  createEvent(userId: string, data: Omit<schema.Event, "id" | "userId" | "createdAt">): Promise<schema.Event>;
  
  getEventAttendees(eventId: string): Promise<schema.EventAttendee[]>;
  addEventAttendee(eventId: string, userId: string): Promise<schema.EventAttendee>;
  removeEventAttendee(eventId: string, userId: string): Promise<void>;
  isAttending(eventId: string, userId: string): Promise<boolean>;
  
  blockUser(userId: string, blockedUserId: string): Promise<schema.UserBlock>;
  unblockUser(userId: string, blockedUserId: string): Promise<void>;
  getBlockedUsers(userId: string): Promise<string[]>;
  isBlocked(userId: string, otherUserId: string): Promise<boolean>;
  
  reportUser(reporterId: string, reportedUserId: string, reason: string, details?: string): Promise<schema.UserReport>;
  getReports(): Promise<(schema.UserReport & { reporter: schema.User; reportedUser: schema.User })[]>;
  updateReportStatus(id: string, status: string): Promise<schema.UserReport | undefined>;
  getAllBlocks(): Promise<(schema.UserBlock & { user: schema.User; blockedUser: schema.User })[]>;
  
  createPasswordResetToken(email: string): Promise<{ token: string; email: string } | null>;
  verifyPasswordResetToken(email: string, token: string): Promise<boolean>;
  resetPassword(email: string, token: string, newPassword: string): Promise<boolean>;

  getWelcomeCards(): Promise<schema.WelcomeCard[]>;
  getActiveWelcomeCards(): Promise<schema.WelcomeCard[]>;
  createWelcomeCard(data: Omit<schema.WelcomeCard, "id" | "createdAt" | "updatedAt">): Promise<schema.WelcomeCard>;
  updateWelcomeCard(id: string, data: Partial<Omit<schema.WelcomeCard, "id" | "createdAt">>): Promise<schema.WelcomeCard | undefined>;
  deleteWelcomeCard(id: string): Promise<void>;

  getBusinesses(): Promise<(schema.Business & { user: schema.User })[]>;
  getBusinessById(id: string): Promise<(schema.Business & { user: schema.User }) | undefined>;
  getUserBusinesses(userId: string): Promise<schema.Business[]>;
  createBusiness(userId: string, data: Omit<schema.Business, "id" | "userId" | "createdAt">): Promise<schema.Business>;
  updateBusiness(id: string, data: Partial<Omit<schema.Business, "id" | "userId" | "createdAt">>): Promise<schema.Business | undefined>;
  deleteBusiness(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async createUser(email: string, password: string, familyName: string): Promise<schema.User> {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const [user] = await db.insert(schema.users).values({
      email,
      password: hashedPassword,
      familyName,
    }).returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<schema.User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return user;
  }

  async getUserById(id: string): Promise<schema.User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user;
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async updateUser(id: string, updates: Partial<Omit<schema.User, "id" | "password" | "createdAt">>): Promise<schema.User | undefined> {
    const [user] = await db.update(schema.users).set(updates).where(eq(schema.users.id, id)).returning();
    return user;
  }

  async getFamilyMembers(userId: string): Promise<schema.FamilyMember[]> {
    return db.select().from(schema.familyMembers).where(eq(schema.familyMembers.userId, userId));
  }

  async addFamilyMember(userId: string, name: string, age: number): Promise<schema.FamilyMember> {
    const [member] = await db.insert(schema.familyMembers).values({ userId, name, age }).returning();
    return member;
  }

  async updateFamilyMember(id: string, name: string, age: number): Promise<schema.FamilyMember | undefined> {
    const [member] = await db.update(schema.familyMembers).set({ name, age }).where(eq(schema.familyMembers.id, id)).returning();
    return member;
  }

  async deleteFamilyMember(id: string): Promise<void> {
    await db.delete(schema.familyMembers).where(eq(schema.familyMembers.id, id));
  }

  async getDiscoverFamilies(userId: string): Promise<(schema.User & { distance?: number; familyMembers: schema.FamilyMember[] })[]> {
    const currentUser = await this.getUserById(userId);
    const blockedUserIds = await this.getBlockedUsers(userId);
    
    const blockedByUsers = await db.select().from(schema.userBlocks).where(
      eq(schema.userBlocks.blockedUserId, userId)
    );
    const blockedByIds = blockedByUsers.map((b) => b.userId);
    
    const allBlockedIds = [...new Set([...blockedUserIds, ...blockedByIds])];
    
    const ADMIN_EMAIL = "saconnectnz@gmail.com";
    const allUsers = await db.select().from(schema.users).where(ne(schema.users.id, userId));
    
    const filteredUsers = allUsers.filter((user) => !allBlockedIds.includes(user.id) && user.email !== ADMIN_EMAIL);
    
    const usersWithMembers = await Promise.all(
      filteredUsers.map(async (user) => {
        const familyMembers = await this.getFamilyMembers(user.id);
        let distance: number | undefined;
        
        if (currentUser?.lat && currentUser?.lon && user.lat && user.lon) {
          distance = this.calculateDistance(currentUser.lat, currentUser.lon, user.lat, user.lon);
        }
        
        return { ...user, familyMembers, distance };
      })
    );
    
    return usersWithMembers.sort((a, b) => (a.distance || 999) - (b.distance || 999));
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  async getConnections(userId: string): Promise<schema.Connection[]> {
    return db.select().from(schema.connections).where(
      or(
        eq(schema.connections.userId, userId),
        eq(schema.connections.targetUserId, userId)
      )
    );
  }

  async createConnection(userId: string, targetUserId: string): Promise<schema.Connection> {
    const [connection] = await db.insert(schema.connections).values({
      userId,
      targetUserId,
      status: "pending",
    }).returning();
    return connection;
  }

  async updateConnectionStatus(id: string, status: string): Promise<schema.Connection | undefined> {
    const [connection] = await db.update(schema.connections).set({ status }).where(eq(schema.connections.id, id)).returning();
    return connection;
  }

  async getConnectionBetween(userId: string, targetUserId: string): Promise<schema.Connection | undefined> {
    const [connection] = await db.select().from(schema.connections).where(
      or(
        and(eq(schema.connections.userId, userId), eq(schema.connections.targetUserId, targetUserId)),
        and(eq(schema.connections.userId, targetUserId), eq(schema.connections.targetUserId, userId))
      )
    );
    return connection;
  }

  async getThreads(userId: string): Promise<(schema.MessageThread & { otherUser: schema.User; unreadCount: number })[]> {
    const threads = await db.select().from(schema.messageThreads).where(
      or(
        eq(schema.messageThreads.user1Id, userId),
        eq(schema.messageThreads.user2Id, userId)
      )
    ).orderBy(desc(schema.messageThreads.lastMessageAt));

    const threadsWithDetails = await Promise.all(
      threads.map(async (thread) => {
        const otherUserId = thread.user1Id === userId ? thread.user2Id : thread.user1Id;
        const otherUser = await this.getUserById(otherUserId);
        
        const unreadMessages = await db.select({ count: sql<number>`count(*)` })
          .from(schema.messages)
          .where(
            and(
              eq(schema.messages.threadId, thread.id),
              eq(schema.messages.read, false),
              ne(schema.messages.senderId, userId)
            )
          );
        
        return {
          ...thread,
          otherUser: otherUser!,
          unreadCount: Number(unreadMessages[0]?.count || 0),
        };
      })
    );

    return threadsWithDetails.filter((t) => t.otherUser);
  }

  async getOrCreateThread(userId1: string, userId2: string): Promise<schema.MessageThread> {
    const existing = await db.select().from(schema.messageThreads).where(
      or(
        and(eq(schema.messageThreads.user1Id, userId1), eq(schema.messageThreads.user2Id, userId2)),
        and(eq(schema.messageThreads.user1Id, userId2), eq(schema.messageThreads.user2Id, userId1))
      )
    );

    if (existing.length > 0) {
      return existing[0];
    }

    const [thread] = await db.insert(schema.messageThreads).values({
      user1Id: userId1,
      user2Id: userId2,
    }).returning();

    return thread;
  }

  async getMessages(threadId: string): Promise<schema.Message[]> {
    return db.select().from(schema.messages)
      .where(eq(schema.messages.threadId, threadId))
      .orderBy(schema.messages.timestamp);
  }

  async sendMessage(threadId: string, senderId: string, text: string): Promise<schema.Message> {
    const [message] = await db.insert(schema.messages).values({
      threadId,
      senderId,
      text,
    }).returning();

    await db.update(schema.messageThreads).set({
      lastMessage: text,
      lastMessageAt: new Date(),
    }).where(eq(schema.messageThreads.id, threadId));

    return message;
  }

  async markThreadAsRead(threadId: string, userId: string): Promise<void> {
    await db.update(schema.messages).set({ read: true }).where(
      and(
        eq(schema.messages.threadId, threadId),
        ne(schema.messages.senderId, userId)
      )
    );
  }

  async getEvents(): Promise<(schema.Event & { user: schema.User; attendeeCount: number; attendees: string[] })[]> {
    const eventsData = await db.select().from(schema.events).orderBy(desc(schema.events.createdAt));
    
    const eventsWithUsers = await Promise.all(
      eventsData.map(async (event) => {
        const user = await this.getUserById(event.userId);
        const attendeesData = await db.select().from(schema.eventAttendees).where(eq(schema.eventAttendees.eventId, event.id));
        const attendees = attendeesData.map(a => a.userId);
        return { ...event, user: user!, attendeeCount: attendees.length, attendees };
      })
    );

    return eventsWithUsers.filter((e) => e.user);
  }

  async createEvent(userId: string, data: Omit<schema.Event, "id" | "userId" | "createdAt">): Promise<schema.Event> {
    const [event] = await db.insert(schema.events).values({
      ...data,
      userId,
    }).returning();
    return event;
  }

  async getEventAttendees(eventId: string): Promise<schema.EventAttendee[]> {
    return db.select().from(schema.eventAttendees).where(eq(schema.eventAttendees.eventId, eventId));
  }

  async addEventAttendee(eventId: string, userId: string): Promise<schema.EventAttendee> {
    const existing = await db.select().from(schema.eventAttendees).where(
      and(
        eq(schema.eventAttendees.eventId, eventId),
        eq(schema.eventAttendees.userId, userId)
      )
    );
    
    if (existing.length > 0) {
      return existing[0];
    }

    const [attendee] = await db.insert(schema.eventAttendees).values({
      eventId,
      userId,
    }).returning();
    return attendee;
  }

  async removeEventAttendee(eventId: string, userId: string): Promise<void> {
    await db.delete(schema.eventAttendees).where(
      and(
        eq(schema.eventAttendees.eventId, eventId),
        eq(schema.eventAttendees.userId, userId)
      )
    );
  }

  async isAttending(eventId: string, userId: string): Promise<boolean> {
    const result = await db.select().from(schema.eventAttendees).where(
      and(
        eq(schema.eventAttendees.eventId, eventId),
        eq(schema.eventAttendees.userId, userId)
      )
    );
    return result.length > 0;
  }

  async blockUser(userId: string, blockedUserId: string): Promise<schema.UserBlock> {
    const existing = await db.select().from(schema.userBlocks).where(
      and(
        eq(schema.userBlocks.userId, userId),
        eq(schema.userBlocks.blockedUserId, blockedUserId)
      )
    );
    
    if (existing.length > 0) {
      return existing[0];
    }

    const [block] = await db.insert(schema.userBlocks).values({
      userId,
      blockedUserId,
    }).returning();
    return block;
  }

  async unblockUser(userId: string, blockedUserId: string): Promise<void> {
    await db.delete(schema.userBlocks).where(
      and(
        eq(schema.userBlocks.userId, userId),
        eq(schema.userBlocks.blockedUserId, blockedUserId)
      )
    );
  }

  async getBlockedUsers(userId: string): Promise<string[]> {
    const blocks = await db.select().from(schema.userBlocks).where(
      eq(schema.userBlocks.userId, userId)
    );
    return blocks.map((b) => b.blockedUserId);
  }

  async isBlocked(userId: string, otherUserId: string): Promise<boolean> {
    const block = await db.select().from(schema.userBlocks).where(
      or(
        and(eq(schema.userBlocks.userId, userId), eq(schema.userBlocks.blockedUserId, otherUserId)),
        and(eq(schema.userBlocks.userId, otherUserId), eq(schema.userBlocks.blockedUserId, userId))
      )
    );
    return block.length > 0;
  }

  async reportUser(reporterId: string, reportedUserId: string, reason: string, details?: string): Promise<schema.UserReport> {
    const [report] = await db.insert(schema.userReports).values({
      reporterId,
      reportedUserId,
      reason,
      details,
    }).returning();
    return report;
  }

  async getReports(): Promise<(schema.UserReport & { reporter: schema.User; reportedUser: schema.User })[]> {
    const reports = await db.select().from(schema.userReports).orderBy(desc(schema.userReports.createdAt));
    
    const reportsWithUsers = await Promise.all(
      reports.map(async (report) => {
        const reporter = await this.getUserById(report.reporterId);
        const reportedUser = await this.getUserById(report.reportedUserId);
        return { ...report, reporter: reporter!, reportedUser: reportedUser! };
      })
    );

    return reportsWithUsers.filter((r) => r.reporter && r.reportedUser);
  }

  async updateReportStatus(id: string, status: string): Promise<schema.UserReport | undefined> {
    const [report] = await db.update(schema.userReports).set({ status }).where(eq(schema.userReports.id, id)).returning();
    return report;
  }

  async getAllBlocks(): Promise<(schema.UserBlock & { user: schema.User; blockedUser: schema.User })[]> {
    const blocks = await db.select().from(schema.userBlocks).orderBy(desc(schema.userBlocks.createdAt));
    
    const blocksWithUsers = await Promise.all(
      blocks.map(async (block) => {
        const user = await this.getUserById(block.userId);
        const blockedUser = await this.getUserById(block.blockedUserId);
        return { ...block, user: user!, blockedUser: blockedUser! };
      })
    );

    return blocksWithUsers.filter((b) => b.user && b.blockedUser);
  }

  async createPasswordResetToken(email: string): Promise<{ token: string; email: string } | null> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      return null;
    }

    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await db.insert(schema.passwordResetTokens).values({
      userId: user.id,
      token,
      expiresAt,
    });

    return { token, email };
  }

  async verifyPasswordResetToken(email: string, token: string): Promise<boolean> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      return false;
    }

    const [resetToken] = await db.select().from(schema.passwordResetTokens).where(
      and(
        eq(schema.passwordResetTokens.userId, user.id),
        eq(schema.passwordResetTokens.token, token),
        eq(schema.passwordResetTokens.used, false)
      )
    ).orderBy(desc(schema.passwordResetTokens.createdAt)).limit(1);

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return false;
    }

    return true;
  }

  async resetPassword(email: string, token: string, newPassword: string): Promise<boolean> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      return false;
    }

    const [resetToken] = await db.select().from(schema.passwordResetTokens).where(
      and(
        eq(schema.passwordResetTokens.userId, user.id),
        eq(schema.passwordResetTokens.token, token),
        eq(schema.passwordResetTokens.used, false)
      )
    ).orderBy(desc(schema.passwordResetTokens.createdAt)).limit(1);

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return false;
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await db.update(schema.users).set({ password: hashedPassword }).where(eq(schema.users.id, user.id));
    await db.update(schema.passwordResetTokens).set({ used: true }).where(eq(schema.passwordResetTokens.id, resetToken.id));

    return true;
  }

  async getWelcomeCards(): Promise<schema.WelcomeCard[]> {
    return db.select().from(schema.welcomeCards).orderBy(schema.welcomeCards.sortOrder);
  }

  async getActiveWelcomeCards(): Promise<schema.WelcomeCard[]> {
    return db.select().from(schema.welcomeCards)
      .where(eq(schema.welcomeCards.active, true))
      .orderBy(schema.welcomeCards.sortOrder);
  }

  async createWelcomeCard(data: Omit<schema.WelcomeCard, "id" | "createdAt" | "updatedAt">): Promise<schema.WelcomeCard> {
    const [card] = await db.insert(schema.welcomeCards).values(data).returning();
    return card;
  }

  async updateWelcomeCard(id: string, data: Partial<Omit<schema.WelcomeCard, "id" | "createdAt">>): Promise<schema.WelcomeCard | undefined> {
    const [card] = await db.update(schema.welcomeCards)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.welcomeCards.id, id))
      .returning();
    return card;
  }

  async deleteWelcomeCard(id: string): Promise<void> {
    await db.delete(schema.welcomeCards).where(eq(schema.welcomeCards.id, id));
  }

  async getBusinesses(): Promise<(schema.Business & { user: schema.User })[]> {
    const allBusinesses = await db.select().from(schema.businesses)
      .where(eq(schema.businesses.active, true))
      .orderBy(desc(schema.businesses.createdAt));
    
    const results = [];
    for (const biz of allBusinesses) {
      const [user] = await db.select().from(schema.users).where(eq(schema.users.id, biz.userId));
      if (user) {
        results.push({ ...biz, user });
      }
    }
    return results;
  }

  async getBusinessById(id: string): Promise<(schema.Business & { user: schema.User }) | undefined> {
    const [biz] = await db.select().from(schema.businesses).where(eq(schema.businesses.id, id));
    if (!biz) return undefined;
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, biz.userId));
    if (!user) return undefined;
    return { ...biz, user };
  }

  async getUserBusinesses(userId: string): Promise<schema.Business[]> {
    return db.select().from(schema.businesses)
      .where(eq(schema.businesses.userId, userId))
      .orderBy(desc(schema.businesses.createdAt));
  }

  async createBusiness(userId: string, data: Omit<schema.Business, "id" | "userId" | "createdAt">): Promise<schema.Business> {
    const [biz] = await db.insert(schema.businesses).values({ ...data, userId }).returning();
    return biz;
  }

  async updateBusiness(id: string, data: Partial<Omit<schema.Business, "id" | "userId" | "createdAt">>): Promise<schema.Business | undefined> {
    const [biz] = await db.update(schema.businesses)
      .set(data)
      .where(eq(schema.businesses.id, id))
      .returning();
    return biz;
  }

  async deleteBusiness(id: string): Promise<void> {
    await db.delete(schema.businesses).where(eq(schema.businesses.id, id));
  }
}

export const storage = new DatabaseStorage();
