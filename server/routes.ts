import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
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

  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserById(req.params.id);
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
      const user = await storage.updateUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const familyMembers = await storage.getFamilyMembers(user.id);
      res.json({ ...sanitizeUser(user), familyMembers });
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.get("/api/users/:userId/family-members", async (req: Request, res: Response) => {
    try {
      const members = await storage.getFamilyMembers(req.params.userId);
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
      const member = await storage.addFamilyMember(req.params.userId, name, age);
      res.json(member);
    } catch (error) {
      console.error("Add family member error:", error);
      res.status(500).json({ error: "Failed to add family member" });
    }
  });

  app.put("/api/family-members/:id", async (req: Request, res: Response) => {
    try {
      const { name, age } = req.body;
      const member = await storage.updateFamilyMember(req.params.id, name, age);
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
      await storage.deleteFamilyMember(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete family member error:", error);
      res.status(500).json({ error: "Failed to delete family member" });
    }
  });

  app.get("/api/discover/:userId", async (req: Request, res: Response) => {
    try {
      const families = await storage.getDiscoverFamilies(req.params.userId);
      res.json(families.map(sanitizeUser));
    } catch (error) {
      console.error("Discover error:", error);
      res.status(500).json({ error: "Failed to get families" });
    }
  });

  app.get("/api/connections/:userId", async (req: Request, res: Response) => {
    try {
      const connections = await storage.getConnections(req.params.userId);
      res.json(connections);
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
      const connection = await storage.updateConnectionStatus(req.params.id, status);
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
      const threads = await storage.getThreads(req.params.userId);
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
      const messages = await storage.getMessages(req.params.threadId);
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
      await storage.markThreadAsRead(req.params.threadId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Mark thread read error:", error);
      res.status(500).json({ error: "Failed to mark thread as read" });
    }
  });

  app.get("/api/events", async (_req: Request, res: Response) => {
    try {
      const events = await storage.getEvents();
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

  app.post("/api/users/:userId/block", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
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
      const { userId, blockedUserId } = req.params;
      await storage.unblockUser(userId, blockedUserId);
      res.json({ success: true });
    } catch (error) {
      console.error("Unblock user error:", error);
      res.status(500).json({ error: "Failed to unblock user" });
    }
  });

  app.get("/api/users/:userId/blocked", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
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

  app.get("/api/admin/reports", async (_req: Request, res: Response) => {
    try {
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
      const { id } = req.params;
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

  app.get("/api/admin/blocks", async (_req: Request, res: Response) => {
    try {
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

  const httpServer = createServer(app);
  return httpServer;
}
