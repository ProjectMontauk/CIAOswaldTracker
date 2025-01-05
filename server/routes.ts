import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { evidence, predictions, votes } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  // Predictions routes
  app.post("/api/predictions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Login required");
    }

    const { probability } = req.body;
    if (typeof probability !== "number" || probability < 0 || probability > 100) {
      return res.status(400).send("Invalid probability value");
    }

    const [prediction] = await db
      .insert(predictions)
      .values({
        userId: req.user.id,
        probability,
      })
      .returning();

    res.json(prediction);
  });

  app.get("/api/predictions", async (req, res) => {
    const allPredictions = await db.query.predictions.findMany({
      orderBy: desc(predictions.createdAt),
      with: {
        user: true,
      },
    });

    res.json(allPredictions);
  });

  // Evidence routes
  app.post("/api/evidence", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Login required");
    }

    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).send("Title and content are required");
    }

    const [newEvidence] = await db
      .insert(evidence)
      .values({
        userId: req.user.id,
        title,
        content,
      })
      .returning();

    res.json(newEvidence);
  });

  app.get("/api/evidence", async (req, res) => {
    const allEvidence = await db.query.evidence.findMany({
      orderBy: desc(evidence.createdAt),
      with: {
        user: true,
        votes: true,
      },
    });

    res.json(allEvidence);
  });

  // Voting routes
  app.post("/api/vote", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Login required");
    }

    const { evidenceId, isUpvote } = req.body;

    // Check for existing vote
    const [existingVote] = await db
      .select()
      .from(votes)
      .where(
        and(
          eq(votes.userId, req.user.id),
          eq(votes.evidenceId, evidenceId)
        )
      );

    if (existingVote) {
      if (existingVote.isUpvote === isUpvote) {
        // Remove vote if same type
        await db
          .delete(votes)
          .where(eq(votes.id, existingVote.id));
      } else {
        // Update vote if different type
        await db
          .update(votes)
          .set({ isUpvote })
          .where(eq(votes.id, existingVote.id));
      }
    } else {
      // Create new vote
      await db
        .insert(votes)
        .values({
          userId: req.user.id,
          evidenceId,
          isUpvote,
        });
    }

    res.json({ success: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}