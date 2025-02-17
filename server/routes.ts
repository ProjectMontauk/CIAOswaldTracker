import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { evidence, predictions, votes, users, markets } from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { setupAuth } from "./auth";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Add a heartbeat route to verify server is running
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // New endpoint to clear evidence for a specific market
  app.post("/api/markets/:id/clear-evidence", async (req, res) => {
    try {
      const marketId = parseInt(req.params.id);

      // Verify the market exists
      const market = await db.query.markets.findFirst({
        where: eq(markets.id, marketId),
      });

      if (!market) {
        return res.status(404).json({ error: "Market not found" });
      }

      // Soft delete by updating evidence entries to be marked as cleared
      // This is safer than actually deleting the records
      await db
        .update(evidence)
        .set({
          content: "[Cleared]",
          text: "[Cleared]",
        })
        .where(eq(evidence.marketId, marketId));

      res.json({ message: "Evidence cleared successfully" });
    } catch (error) {
      console.error('Error clearing evidence:', error);
      res.status(500).json({ error: 'Failed to clear evidence' });
    }
  });

  // Get specific market with its evidence and predictions
  app.get("/api/markets/:id", async (req, res) => {
    try {
      const marketId = parseInt(req.params.id);
      const market = await db.query.markets.findFirst({
        where: eq(markets.id, marketId),
        with: {
          evidence: {
            with: {
              votes: true,
              user: true,
            },
          },
          predictions: {
            with: {
              user: true,
            },
          },
        },
      });

      if (!market) {
        return res.status(404).json({ error: "Market not found" });
      }

      res.json(market);
    } catch (error) {
      console.error('Error fetching market:', error);
      res.status(500).json({ error: 'Failed to fetch market' });
    }
  });

  // Get all markets
  app.get("/api/markets", async (req, res) => {
    try {
      const allMarkets = await db.query.markets.findMany({
        orderBy: desc(markets.createdAt),
        with: {
          predictions: true,
        },
      });

      res.json(allMarkets);
    } catch (error) {
      console.error('Error fetching markets:', error);
      res.status(500).json({ error: 'Failed to fetch markets' });
    }
  });

  // Evidence routes
  app.get("/api/evidence", async (req, res) => {
    try {
      const marketId = req.query.marketId ? parseInt(req.query.marketId as string) : undefined;

      // For the main CIA market (marketId is undefined)
      if (marketId === undefined) {
        const existingEvidence = await db.query.evidence.findMany({
          where: sql`${evidence.marketId} IS NULL`,
          with: {
            votes: true,
            user: true,
          },
          orderBy: desc(evidence.createdAt),
        });
        return res.json(existingEvidence);
      }

      // For specific markets, strictly filter by marketId
      const marketEvidence = await db.query.evidence.findMany({
        where: eq(evidence.marketId, marketId),
        with: {
          votes: true,
          user: true,
        },
        orderBy: desc(evidence.createdAt),
      });

      res.json(marketEvidence);
    } catch (error) {
      console.error('Error fetching evidence:', error);
      res.status(500).json({ error: 'Failed to fetch evidence' });
    }
  });

  // Submit evidence endpoint
  app.post("/api/evidence", async (req, res) => {
    try {
      const { title, content, text, marketId, evidenceType } = req.body;
      if (!title || !content) {
        return res.status(400).send("Title and content are required");
      }

      console.log('Creating evidence with marketId:', marketId, 'type:', evidenceType);

      // Create the new evidence
      const [newEvidence] = await db
        .insert(evidence)
        .values({
          userId: 1, // Default user for now
          marketId: marketId ? parseInt(marketId) : null,
          title,
          content,
          text: text || null,
          evidenceType,
        })
        .returning();

      console.log('Created evidence:', newEvidence);

      // Return the new evidence with its relationships
      const evidenceWithRelations = await db.query.evidence.findFirst({
        where: eq(evidence.id, newEvidence.id),
        with: {
          votes: true,
          user: true,
        },
      });

      console.log('Returning evidence with relations:', evidenceWithRelations);
      res.json(evidenceWithRelations);
    } catch (error) {
      console.error('Error submitting evidence:', error);
      res.status(500).json({ error: 'Failed to submit evidence' });
    }
  });

  // Predictions routes
  app.post("/api/predictions", async (req, res) => {
    try {
      const { position, amount, marketId } = req.body;
      if (!position || !amount || amount <= 0) {
        return res.status(400).send("Position and amount are required");
      }

      // Start a transaction to update user balance and create prediction
      const [prediction] = await db.transaction(async (tx) => {
        // Get current user balance
        const [user] = await tx
          .select()
          .from(users)
          .where(eq(users.id, 1))
          .limit(1);

        if (!user || Number(user.balance) < amount) {
          throw new Error("Insufficient balance");
        }

        // Update user balance
        await tx
          .update(users)
          .set({
            balance: sql`${users.balance} - ${amount}`,
          })
          .where(eq(users.id, 1));

        // Create prediction
        return await tx
          .insert(predictions)
          .values({
            userId: 1,
            marketId: marketId || 1, // Default to market 1 if not provided
            position,
            amount,
            probability: "0.5", // Initial probability
          })
          .returning();
      });

      // Get updated market state
      const marketState = await db.query.predictions.findMany({
        where: marketId ? eq(predictions.marketId, marketId) : undefined,
        orderBy: desc(predictions.createdAt),
      });

      res.json({ prediction, marketState });
    } catch (error) {
      console.error('Error processing prediction:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to process prediction' });
    }
  });

  app.get("/api/predictions", async (req, res) => {
    try {
      const allPredictions = await db.query.predictions.findMany({
        orderBy: desc(predictions.createdAt),
        with: {
          user: true,
        },
      });
      res.json(allPredictions);
    } catch (error) {
      console.error('Error fetching predictions:', error);
      res.status(500).json({ error: 'Failed to fetch predictions' });
    }
  });


  app.post("/api/vote", async (req, res) => {
    const { evidenceId, isUpvote } = req.body;
    const userId = 1; // Default user ID

    try {
      // Get the evidence to find its author
      const [evidenceItem] = await db
        .select()
        .from(evidence)
        .where(eq(evidence.id, evidenceId))
        .limit(1);

      if (!evidenceItem) {
        return res.status(404).json({ error: "Evidence not found" });
      }

      // Create the vote
      await db.insert(votes).values({
        userId,
        evidenceId,
        isUpvote,
      });

      // Update author's reputation and vote counts
      await db
        .update(users)
        .set({
          upvotesReceived: sql`${users.upvotesReceived} + ${isUpvote ? 1 : 0}`,
          downvotesReceived: sql`${users.downvotesReceived} + ${!isUpvote ? 1 : 0}`,
          reputation: sql`${users.reputation} + ${isUpvote ? 1 : -1}`,
        })
        .where(eq(users.id, evidenceItem.userId));

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
          upvotesReceived: users.upvotesReceived,
          downvotesReceived: users.downvotesReceived,
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

const initialEvidence = [
  {
    userId: 1,
    title: "Mexico City CIA Station Report - September 1963",
    content: "CIA surveillance records from Mexico City station documented Oswald's visits to Cuban and Soviet embassies. Station chief Win Scott's detailed memo suggests prior knowledge of Oswald's activities before the assassination.",
    text: "The CIA's Mexico City station maintained extensive surveillance operations that captured Oswald's interactions with foreign embassies.",
    createdAt: new Date("1963-09-27"),
    marketId: null,
    evidenceType: 'yes'
  },
  {
    userId: 1,
    title: "201 File Opening - December 1960",
    content: "CIA opened a 201 personality file on Oswald in December 1960, despite officially claiming no interest in him until after the assassination. The existence of this file suggests earlier surveillance.",
    text: "The existence of a CIA 201 file on Oswald three years before the assassination contradicts official statements.",
    createdAt: new Date("1960-12-09"),
    marketId: null,
    evidenceType: 'yes'
  },
  {
    userId: 1,
    title: "James Jesus Angleton Testimony - 1964",
    content: "CIA Counterintelligence Chief Angleton's testimony to the Warren Commission contained notable gaps regarding Oswald's file handling. Later revelations indicated special interest procedures were applied to Oswald's records.",
    text: "Angleton's testimony shows inconsistencies in how the CIA handled Oswald's records.",
    createdAt: new Date("1964-02-15"),
    marketId: null,
    evidenceType: 'yes'
  }
];