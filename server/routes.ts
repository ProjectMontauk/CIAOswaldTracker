import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { evidence, predictions, votes } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  // Predictions routes
  app.post("/api/predictions", async (req, res) => {
    const { probability } = req.body;
    if (typeof probability !== "number" || probability < 0 || probability > 100) {
      return res.status(400).send("Invalid probability value");
    }

    const [prediction] = await db
      .insert(predictions)
      .values({
        userId: 1, // Default user for now
        probability,
      })
      .returning();

    res.json(prediction);
  });

  app.get("/api/predictions", async (req, res) => {
    const allPredictions = await db.query.predictions.findMany({
      orderBy: desc(predictions.createdAt),
    });

    res.json(allPredictions);
  });

  // Evidence routes
  app.post("/api/evidence", async (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).send("Title and content are required");
    }

    const [newEvidence] = await db
      .insert(evidence)
      .values({
        userId: 1, // Default user for now
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
        votes: true,
      },
    });

    res.json(allEvidence);
  });

  // Voting routes
  app.post("/api/vote", async (req, res) => {
    const { evidenceId, isUpvote } = req.body;

    // Create new vote (simplified without user checking)
    await db
      .insert(votes)
      .values({
        userId: 1, // Default user for now
        evidenceId,
        isUpvote,
      });

    res.json({ success: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}