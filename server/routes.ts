import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import * as fs from "node:fs";
import * as path from "node:path";
import { storage } from "./storage";
import { loginSchema, insertUserSchema, insertEventSchema } from "@shared/schema";

function sanitizeUser(user: any) {
  const { password, ...safeUser } = user;
  return safeUser;
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const { email, password, familyName } = req.body;
      
      if (!email || !password || !familyName) {
        return res.status(400).json({ error: "Email, password, and family name are required" });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const user = await storage.createUser(email, password, familyName);
      res.json({ user: sanitizeUser(user) });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  app.post("/api/auth/signin", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValid = await storage.verifyPassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const familyMembers = await storage.getFamilyMembers(user.id);
      res.json({ user: { ...sanitizeUser(user), familyMembers } });
    } catch (error) {
      console.error("Signin error:", error);
      res.status(500).json({ error: "Failed to sign in" });
    }
  });

  app.post("/api/auth/forgot-password", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const result = await storage.createPasswordResetToken(email);
      if (!result) {
        return res.json({ success: true, message: "If an account exists with this email, you will receive a reset code." });
      }

      try {
        const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "accept": "application/json",
            "content-type": "application/json",
            "api-key": process.env.BREVO_API_KEY || "",
          },
          body: JSON.stringify({
            sender: { name: "SA Connect NZ", email: "saconnectnz@gmail.com" },
            to: [{ email: email }],
            subject: "Your Password Reset Code - SA Connect NZ",
            htmlContent: `
              <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
                <div style="text-align: center; margin-bottom: 24px;">
                  <h1 style="color: #1A7F7F; margin: 0;">SA Connect NZ</h1>
                </div>
                <h2 style="color: #333; font-size: 20px;">Password Reset</h2>
                <p style="color: #555; font-size: 16px; line-height: 1.5;">
                  You requested a password reset for your SA Connect NZ account. Use the code below to reset your password:
                </p>
                <div style="background: #f4f4f4; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
                  <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1A7F7F;">${result.token}</span>
                </div>
                <p style="color: #555; font-size: 14px; line-height: 1.5;">
                  This code will expire in 15 minutes. If you did not request this reset, please ignore this email.
                </p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
                <p style="color: #999; font-size: 12px; text-align: center;">
                  SA Connect NZ &mdash; Connecting South African families in New Zealand
                </p>
              </div>
            `,
          }),
        });

        if (!brevoResponse.ok) {
          const errBody = await brevoResponse.text();
          console.error("Brevo email error:", brevoResponse.status, errBody);
        } else {
          console.log("Reset email sent successfully to:", email);
        }
      } catch (emailError) {
        console.error("Failed to send reset email:", emailError);
      }
      
      res.json({ 
        success: true, 
        message: "If an account exists with this email, you will receive a reset code."
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Failed to process request" });
    }
  });

  app.post("/api/auth/verify-reset-token", async (req: Request, res: Response) => {
    try {
      const { email, token } = req.body;
      
      if (!email || !token) {
        return res.status(400).json({ error: "Email and token are required" });
      }

      const isValid = await storage.verifyPasswordResetToken(email, token);
      res.json({ valid: isValid });
    } catch (error) {
      console.error("Verify token error:", error);
      res.status(500).json({ error: "Failed to verify token" });
    }
  });

  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    try {
      const { email, token, newPassword } = req.body;
      
      if (!email || !token || !newPassword) {
        return res.status(400).json({ error: "Email, token, and new password are required" });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
      }

      const success = await storage.resetPassword(email, token, newPassword);
      if (!success) {
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }

      res.json({ success: true, message: "Password has been reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserById(req.params.id as string);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const familyMembers = await storage.getFamilyMembers(user.id);
      res.json({ ...sanitizeUser(user), familyMembers });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  app.put("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const { familyMembers: incomingMembers, ...updates } = req.body;
      const user = await storage.updateUser(req.params.id as string, updates);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (Array.isArray(incomingMembers)) {
        const existingMembers = await storage.getFamilyMembers(user.id);
        for (const existing of existingMembers) {
          await storage.deleteFamilyMember(existing.id);
        }
        for (const member of incomingMembers) {
          if (member.name && member.name.trim()) {
            await storage.addFamilyMember(user.id, member.name.trim(), member.age || 0);
          }
        }
      }

      const familyMembers = await storage.getFamilyMembers(user.id);
      res.json({ ...sanitizeUser(user), familyMembers });
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteUser(req.params.id as string);
      if (!deleted) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ success: true, message: "Account deleted successfully" });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ error: "Failed to delete account" });
    }
  });

  app.get("/api/users/:userId/family-members", async (req: Request, res: Response) => {
    try {
      const members = await storage.getFamilyMembers(req.params.userId as string);
      res.json(members);
    } catch (error) {
      console.error("Get family members error:", error);
      res.status(500).json({ error: "Failed to get family members" });
    }
  });

  app.post("/api/users/:userId/family-members", async (req: Request, res: Response) => {
    try {
      const { name, age } = req.body;
      if (!name || age === undefined) {
        return res.status(400).json({ error: "Name and age are required" });
      }
      const member = await storage.addFamilyMember(req.params.userId as string, name, age);
      res.json(member);
    } catch (error) {
      console.error("Add family member error:", error);
      res.status(500).json({ error: "Failed to add family member" });
    }
  });

  app.put("/api/family-members/:id", async (req: Request, res: Response) => {
    try {
      const { name, age } = req.body;
      const member = await storage.updateFamilyMember(req.params.id as string, name, age);
      if (!member) {
        return res.status(404).json({ error: "Family member not found" });
      }
      res.json(member);
    } catch (error) {
      console.error("Update family member error:", error);
      res.status(500).json({ error: "Failed to update family member" });
    }
  });

  app.delete("/api/family-members/:id", async (req: Request, res: Response) => {
    try {
      await storage.deleteFamilyMember(req.params.id as string);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete family member error:", error);
      res.status(500).json({ error: "Failed to delete family member" });
    }
  });

  app.get("/api/discover/:userId", async (req: Request, res: Response) => {
    try {
      const families = await storage.getDiscoverFamilies(req.params.userId as string);
      res.json(families.map(sanitizeUser));
    } catch (error) {
      console.error("Discover error:", error);
      res.status(500).json({ error: "Failed to get families" });
    }
  });

  app.get("/api/connections/:userId", async (req: Request, res: Response) => {
    try {
      const connections = await storage.getConnections(req.params.userId as string);
      const enriched = await Promise.all(
        connections.map(async (c) => {
          const otherUserId = c.userId === (req.params.userId as string) ? c.targetUserId : c.userId;
          const otherUser = await storage.getUserById(otherUserId);
          return {
            ...c,
            otherUser: otherUser ? sanitizeUser(otherUser) : null,
          };
        })
      );
      res.json(enriched);
    } catch (error) {
      console.error("Get connections error:", error);
      res.status(500).json({ error: "Failed to get connections" });
    }
  });

  app.post("/api/connections", async (req: Request, res: Response) => {
    try {
      const { userId, targetUserId } = req.body;
      if (!userId || !targetUserId) {
        return res.status(400).json({ error: "userId and targetUserId are required" });
      }

      const existing = await storage.getConnectionBetween(userId, targetUserId);
      if (existing) {
        return res.status(400).json({ error: "Connection already exists" });
      }

      const connection = await storage.createConnection(userId, targetUserId);
      res.json(connection);
    } catch (error) {
      console.error("Create connection error:", error);
      res.status(500).json({ error: "Failed to create connection" });
    }
  });

  app.put("/api/connections/:id", async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      const connection = await storage.updateConnectionStatus(req.params.id as string, status);
      if (!connection) {
        return res.status(404).json({ error: "Connection not found" });
      }
      res.json(connection);
    } catch (error) {
      console.error("Update connection error:", error);
      res.status(500).json({ error: "Failed to update connection" });
    }
  });

  app.get("/api/threads/:userId", async (req: Request, res: Response) => {
    try {
      const threads = await storage.getThreads(req.params.userId as string);
      res.json(threads.map((t) => ({
        ...t,
        otherUser: sanitizeUser(t.otherUser),
      })));
    } catch (error) {
      console.error("Get threads error:", error);
      res.status(500).json({ error: "Failed to get threads" });
    }
  });

  app.post("/api/threads", async (req: Request, res: Response) => {
    try {
      const { userId1, userId2 } = req.body;
      if (!userId1 || !userId2) {
        return res.status(400).json({ error: "userId1 and userId2 are required" });
      }
      const thread = await storage.getOrCreateThread(userId1, userId2);
      res.json(thread);
    } catch (error) {
      console.error("Create thread error:", error);
      res.status(500).json({ error: "Failed to create thread" });
    }
  });

  app.get("/api/messages/:threadId", async (req: Request, res: Response) => {
    try {
      const messages = await storage.getMessages(req.params.threadId as string);
      res.json(messages);
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ error: "Failed to get messages" });
    }
  });

  app.post("/api/messages", async (req: Request, res: Response) => {
    try {
      const { threadId, senderId, text } = req.body;
      if (!threadId || !senderId || !text) {
        return res.status(400).json({ error: "threadId, senderId, and text are required" });
      }
      const message = await storage.sendMessage(threadId, senderId, text);
      res.json(message);
    } catch (error) {
      console.error("Send message error:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.put("/api/threads/:threadId/read", async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      await storage.markThreadAsRead(req.params.threadId as string, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Mark thread read error:", error);
      res.status(500).json({ error: "Failed to mark thread as read" });
    }
  });

  app.get("/api/events", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string | undefined;
      const events = await storage.getEvents(userId);
      res.json(events.map((e) => ({
        ...e,
        user: sanitizeUser(e.user),
      })));
    } catch (error) {
      console.error("Get events error:", error);
      res.status(500).json({ error: "Failed to get events" });
    }
  });

  app.post("/api/events", async (req: Request, res: Response) => {
    try {
      const { userId, title, description, date, time, location, category } = req.body;
      if (!userId || !title || !date || !location || !category) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const event = await storage.createEvent(userId, { title, description, date, time, location, category });
      res.json(event);
    } catch (error) {
      console.error("Create event error:", error);
      res.status(500).json({ error: "Failed to create event" });
    }
  });

  app.put("/api/events/:eventId", async (req: Request, res: Response) => {
    try {
      const { title, description, date, time, location, category } = req.body;
      const event = await storage.updateEvent(req.params.eventId as string, { title, description, date, time, location, category });
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      console.error("Update event error:", error);
      res.status(500).json({ error: "Failed to update event" });
    }
  });

  app.delete("/api/events/:eventId", async (req: Request, res: Response) => {
    try {
      await storage.deleteEvent(req.params.eventId as string);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete event error:", error);
      res.status(500).json({ error: "Failed to delete event" });
    }
  });

  app.post("/api/events/:eventId/attend", async (req: Request, res: Response) => {
    try {
      const eventId = req.params.eventId as string;
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      
      const attendee = await storage.addEventAttendee(eventId, userId);
      res.json(attendee);
    } catch (error) {
      console.error("Attend event error:", error);
      res.status(500).json({ error: "Failed to RSVP to event" });
    }
  });

  app.delete("/api/events/:eventId/attend/:userId", async (req: Request, res: Response) => {
    try {
      const eventId = req.params.eventId as string;
      const userId = req.params.userId as string;
      await storage.removeEventAttendee(eventId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Remove attendance error:", error);
      res.status(500).json({ error: "Failed to remove RSVP" });
    }
  });

  app.get("/api/events/:eventId/attendees", async (req: Request, res: Response) => {
    try {
      const attendees = await storage.getEventAttendees(req.params.eventId as string);
      res.json(attendees);
    } catch (error) {
      console.error("Get attendees error:", error);
      res.status(500).json({ error: "Failed to get attendees" });
    }
  });

  app.post("/api/users/:userId/block", async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId as string;
      const { blockedUserId } = req.body;
      
      if (!blockedUserId) {
        return res.status(400).json({ error: "Blocked user ID is required" });
      }
      
      const block = await storage.blockUser(userId, blockedUserId);
      res.json(block);
    } catch (error) {
      console.error("Block user error:", error);
      res.status(500).json({ error: "Failed to block user" });
    }
  });

  app.delete("/api/users/:userId/block/:blockedUserId", async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId as string;
      const blockedUserId = req.params.blockedUserId as string;
      await storage.unblockUser(userId, blockedUserId);
      res.json({ success: true });
    } catch (error) {
      console.error("Unblock user error:", error);
      res.status(500).json({ error: "Failed to unblock user" });
    }
  });

  app.get("/api/users/:userId/blocked", async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId as string;
      const blockedIds = await storage.getBlockedUsers(userId);
      res.json(blockedIds);
    } catch (error) {
      console.error("Get blocked users error:", error);
      res.status(500).json({ error: "Failed to get blocked users" });
    }
  });

  app.post("/api/reports", async (req: Request, res: Response) => {
    try {
      const { reporterId, reportedUserId, reason, details } = req.body;
      
      if (!reporterId || !reportedUserId || !reason) {
        return res.status(400).json({ error: "Reporter ID, reported user ID, and reason are required" });
      }
      
      const report = await storage.reportUser(reporterId, reportedUserId, reason, details);
      res.json(report);
    } catch (error) {
      console.error("Report user error:", error);
      res.status(500).json({ error: "Failed to report user" });
    }
  });

  const ADMIN_EMAIL = "saconnectnz@gmail.com";

  app.get("/api/admin/reports", async (req: Request, res: Response) => {
    try {
      const userEmail = req.headers["x-user-email"] as string;
      if (userEmail !== ADMIN_EMAIL) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      const reports = await storage.getReports();
      res.json(reports.map((r) => ({
        ...r,
        reporter: sanitizeUser(r.reporter),
        reportedUser: sanitizeUser(r.reportedUser),
      })));
    } catch (error) {
      console.error("Get reports error:", error);
      res.status(500).json({ error: "Failed to get reports" });
    }
  });

  app.patch("/api/admin/reports/:id", async (req: Request, res: Response) => {
    try {
      const userEmail = req.headers["x-user-email"] as string;
      if (userEmail !== ADMIN_EMAIL) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      const id = req.params.id as string;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      
      const report = await storage.updateReportStatus(id, status);
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }
      res.json(report);
    } catch (error) {
      console.error("Update report error:", error);
      res.status(500).json({ error: "Failed to update report" });
    }
  });

  app.get("/api/admin/blocks", async (req: Request, res: Response) => {
    try {
      const userEmail = req.headers["x-user-email"] as string;
      if (userEmail !== ADMIN_EMAIL) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      const blocks = await storage.getAllBlocks();
      res.json(blocks.map((b) => ({
        ...b,
        user: sanitizeUser(b.user),
        blockedUser: sanitizeUser(b.blockedUser),
      })));
    } catch (error) {
      console.error("Get blocks error:", error);
      res.status(500).json({ error: "Failed to get blocks" });
    }
  });

  app.use("/uploads", (req, res, next) => {
    const express = require("express");
    express.static(path.resolve(process.cwd(), "uploads"))(req, res, next);
  });

  app.get("/api/welcome-cards", async (_req: Request, res: Response) => {
    try {
      const cards = await storage.getActiveWelcomeCards();
      res.json(cards);
    } catch (error) {
      console.error("Get welcome cards error:", error);
      res.status(500).json({ error: "Failed to get welcome cards" });
    }
  });

  app.get("/api/admin/welcome-cards", async (req: Request, res: Response) => {
    try {
      const userEmail = req.headers["x-user-email"] as string;
      if (userEmail !== ADMIN_EMAIL) {
        return res.status(403).json({ error: "Unauthorised" });
      }
      const cards = await storage.getWelcomeCards();
      res.json(cards);
    } catch (error) {
      console.error("Get admin welcome cards error:", error);
      res.status(500).json({ error: "Failed to get welcome cards" });
    }
  });

  app.post("/api/admin/welcome-cards", async (req: Request, res: Response) => {
    try {
      const userEmail = req.headers["x-user-email"] as string;
      if (userEmail !== ADMIN_EMAIL) {
        return res.status(403).json({ error: "Unauthorised" });
      }

      const { header, title, bullets, icon, accentColor, borderColor, promoText, imageBase64, sortOrder, active } = req.body;
      if (!header || !title || !bullets) {
        return res.status(400).json({ error: "Header, title, and bullets are required" });
      }

      let imageUrl: string | null = null;
      if (imageBase64) {
        imageUrl = saveBase64Image(imageBase64);
      }

      const card = await storage.createWelcomeCard({
        sortOrder: sortOrder || 0,
        icon: icon || "heart",
        header,
        title,
        bullets,
        accentColor: accentColor || "#E8703A",
        borderColor: borderColor || "#E8703A",
        promoText: promoText || "Watch this space for special promotions and events",
        imageUrl,
        active: active !== false,
      });

      res.json(card);
    } catch (error) {
      console.error("Create welcome card error:", error);
      res.status(500).json({ error: "Failed to create welcome card" });
    }
  });

  app.put("/api/admin/welcome-cards/:id", async (req: Request, res: Response) => {
    try {
      const userEmail = req.headers["x-user-email"] as string;
      if (userEmail !== ADMIN_EMAIL) {
        return res.status(403).json({ error: "Unauthorised" });
      }

      const id = req.params.id as string;
      const { header, title, bullets, icon, accentColor, borderColor, promoText, imageBase64, sortOrder, active } = req.body;

      const updates: any = {};
      if (header !== undefined) updates.header = header;
      if (title !== undefined) updates.title = title;
      if (bullets !== undefined) updates.bullets = bullets;
      if (icon !== undefined) updates.icon = icon;
      if (accentColor !== undefined) updates.accentColor = accentColor;
      if (borderColor !== undefined) updates.borderColor = borderColor;
      if (promoText !== undefined) updates.promoText = promoText;
      if (sortOrder !== undefined) updates.sortOrder = sortOrder;
      if (active !== undefined) updates.active = active;

      if (imageBase64) {
        updates.imageUrl = saveBase64Image(imageBase64);
      }

      const card = await storage.updateWelcomeCard(id, updates);
      if (!card) {
        return res.status(404).json({ error: "Card not found" });
      }

      res.json(card);
    } catch (error) {
      console.error("Update welcome card error:", error);
      res.status(500).json({ error: "Failed to update welcome card" });
    }
  });

  app.delete("/api/admin/welcome-cards/:id", async (req: Request, res: Response) => {
    try {
      const userEmail = req.headers["x-user-email"] as string;
      if (userEmail !== ADMIN_EMAIL) {
        return res.status(403).json({ error: "Unauthorised" });
      }

      await storage.deleteWelcomeCard(req.params.id as string);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete welcome card error:", error);
      res.status(500).json({ error: "Failed to delete welcome card" });
    }
  });

  app.get("/api/businesses", async (_req: Request, res: Response) => {
    try {
      const businesses = await storage.getBusinesses();
      res.json(businesses.map((b) => ({
        ...b,
        user: sanitizeUser(b.user),
      })));
    } catch (error) {
      console.error("Get businesses error:", error);
      res.status(500).json({ error: "Failed to get businesses" });
    }
  });

  app.get("/api/businesses/:id", async (req: Request, res: Response) => {
    try {
      const business = await storage.getBusinessById(req.params.id as string);
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }
      res.json({ ...business, user: sanitizeUser(business.user) });
    } catch (error) {
      console.error("Get business error:", error);
      res.status(500).json({ error: "Failed to get business" });
    }
  });

  app.get("/api/users/:userId/businesses", async (req: Request, res: Response) => {
    try {
      const businesses = await storage.getUserBusinesses(req.params.userId as string);
      res.json(businesses);
    } catch (error) {
      console.error("Get user businesses error:", error);
      res.status(500).json({ error: "Failed to get user businesses" });
    }
  });

  app.post("/api/businesses", async (req: Request, res: Response) => {
    try {
      const { userId, name, description, category, location, phone, email, website, logoUrl, promotion } = req.body;
      if (!userId || !name || !category) {
        return res.status(400).json({ error: "User ID, name, and category are required" });
      }

      const business = await storage.createBusiness(userId, {
        name, description, category, location, phone, email, website,
        logoUrl: logoUrl || null, promotion, active: true,
      });
      res.json(business);
    } catch (error) {
      console.error("Create business error:", error);
      res.status(500).json({ error: "Failed to create business" });
    }
  });

  app.put("/api/businesses/:id", async (req: Request, res: Response) => {
    try {
      const { name, description, category, location, phone, email, website, logoUrl, promotion, active } = req.body;

      const business = await storage.updateBusiness(req.params.id as string, {
        name, description, category, location, phone, email, website,
        logoUrl: logoUrl || undefined, promotion, active,
      });
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }
      res.json(business);
    } catch (error) {
      console.error("Update business error:", error);
      res.status(500).json({ error: "Failed to update business" });
    }
  });

  app.delete("/api/businesses/:id", async (req: Request, res: Response) => {
    try {
      await storage.deleteBusiness(req.params.id as string);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete business error:", error);
      res.status(500).json({ error: "Failed to delete business" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function saveBase64Image(base64String: string, subDir: string = "welcome-cards"): string {
  const matches = base64String.match(/^data:image\/([\w+]+);base64,(.+)$/);
  if (!matches) {
    throw new Error("Invalid base64 image string");
  }

  const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
  const data = matches[2];
  const prefixMap: Record<string, string> = { "welcome-cards": "card", "business-logos": "biz", "avatars": "avatar" };
  const prefix = prefixMap[subDir] || "img";
  const filename = `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const uploadsDir = path.resolve(process.cwd(), "uploads", subDir);

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filePath = path.join(uploadsDir, filename);
  fs.writeFileSync(filePath, Buffer.from(data, "base64"));

  return `/uploads/${subDir}/${filename}`;
}
