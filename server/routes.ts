import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { evidence, predictions, votes, users } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";

// Initial evidence data
const initialEvidence = [
  {
    id: 1,
    userId: 1,
    title: "Mexico City CIA Station Report - September 1963",
    content: "CIA surveillance records from Mexico City station documented Oswald's visits to Cuban and Soviet embassies. Station chief Win Scott's detailed memo suggests prior knowledge of Oswald's activities before the assassination.",
    createdAt: new Date("1963-09-27"),
  },
  {
    id: 2,
    userId: 1,
    title: "201 File Opening - December 1960",
    content: "CIA opened a 201 personality file on Oswald in December 1960, despite officially claiming no interest in him until after the assassination. The existence of this file suggests earlier surveillance.",
    createdAt: new Date("1960-12-09"),
  },
  {
    id: 3,
    userId: 1,
    title: "James Jesus Angleton Testimony - 1964",
    content: "CIA Counterintelligence Chief Angleton's testimony to the Warren Commission contained notable gaps regarding Oswald's file handling. Later revelations indicated special interest procedures were applied to Oswald's records.",
    createdAt: new Date("1964-02-15"),
  }
];

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
    try {
      // Check if there's any evidence in the database
      const existingEvidence = await db.query.evidence.findMany({
        limit: 1,
      });

      // If no evidence exists, insert the initial data
      if (existingEvidence.length === 0) {
        await db.insert(evidence).values(initialEvidence);
      }

      // Return all evidence with votes
      const allEvidence = await db.query.evidence.findMany({
        orderBy: desc(evidence.createdAt),
        with: {
          votes: true,
        },
      });

      res.json(allEvidence);
    } catch (error) {
      console.error('Error handling evidence:', error);
      res.status(500).json({ error: 'Failed to fetch evidence' });
    }
  });

  // Updated vote endpoint with reputation tracking
  app.post("/api/vote", async (req, res) => {
    const { evidenceId, isUpvote } = req.body;
    const userId = req.user?.id || 1; // Use authenticated user's ID when available

    try {
      // Start a transaction for atomic updates
      await db.transaction(async (tx) => {
        // Create the vote
        await tx.insert(votes).values({
          userId,
          evidenceId,
          isUpvote,
        });

        // Get the evidence to find its author
        const [evidenceItem] = await tx
          .select()
          .from(evidence)
          .where(eq(evidence.id, evidenceId))
          .limit(1);

        if (!evidenceItem) {
          throw new Error("Evidence not found");
        }

        // Update author's reputation and vote counts
        await tx
          .update(users)
          .set({
            upvotes_received: isUpvote ? tx.sql`upvotes_received + 1` : tx.sql`upvotes_received`,
            downvotes_received: !isUpvote ? tx.sql`downvotes_received + 1` : tx.sql`downvotes_received`,
            reputation: isUpvote ? tx.sql`reputation + 1` : tx.sql`reputation - 1`,
          })
          .where(eq(users.id, evidenceItem.userId));

        // Update voter's reputation (small bonus for participating)
        await tx
          .update(users)
          .set({
            reputation: tx.sql`reputation + 0.1`,
          })
          .where(eq(users.id, userId));
      });

      // Fetch updated evidence with votes and user info
      const updatedEvidence = await db.query.evidence.findMany({
        with: {
          votes: true,
          user: true,
        },
        orderBy: desc(evidence.createdAt),
      });

      res.json(updatedEvidence);
    } catch (error) {
      console.error('Error handling vote:', error);
      res.status(500).json({ error: 'Failed to process vote' });
    }
  });

  // Add endpoint to get user reputation
  app.get("/api/user/:id/reputation", async (req, res) => {
    try {
      const [user] = await db
        .select({
          reputation: users.reputation,
          upvotesReceived: users.upvotes_received, //Corrected typo here
          downvotesReceived: users.downvotes_received, //Corrected typo here
        })
        .from(users)
        .where(eq(users.id, parseInt(req.params.id)))
        .limit(1);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error('Error fetching user reputation:', error);
      res.status(500).json({ error: 'Failed to fetch reputation' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}