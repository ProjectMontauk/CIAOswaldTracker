import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { evidence, predictions, votes, users, markets } from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { setupAuth } from "./auth";

console.log('Are we even getting here?')

export function registerRoutes(app: Express): Server {
  console.log('Registering routes...');
  setupAuth(app);

  // Single health check endpoint that also verifies DB connection
  app.get("/api/health", async (req, res) => {
    try {
      await db.select().from(users).limit(1);
      res.json({ 
        status: "ok", 
        database: "connected",
        env: process.env.NODE_ENV
      });
    } catch (error: any) {
      console.error('Database connection error:', error);
      res.status(500).json({ 
        status: 'error', 
        database: 'disconnected',
        message: error.message 
      });
    }
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

  // Delete all evidence with null marketId
  app.delete("/api/evidence/cleanup", async (req, res) => {
    try {
      await db
        .delete(evidence)
        .where(sql`${evidence.marketId} IS NULL`);
      
      res.json({ message: "Successfully deleted all evidence without market ID" });
    } catch (error) {
      console.error('Error deleting evidence:', error);
      res.status(500).json({ error: 'Failed to delete evidence' });
    }
  });


  // Get a specific market with its predictions
  app.get("/api/markets/:id", async (req, res) => {
    try {
      const marketId = parseInt(req.params.id);
      
      // Explicitly select all fields including resolutions
      const market = await db.query.markets.findFirst({
        where: eq(markets.id, marketId),
        with: {
          predictions: true,
        },
        columns: {
          id: true,
          title: true,
          yes_resolution: true,
          no_resolution: true,
          createdAt: true,
          // ... other fields you need
        }
      });

      if (!market) {
        return res.status(404).json({ error: "Market not found" });
      }

      // Clean up the description by removing the "Yes Resolution:" and "No Resolution:" prefixes
      let cleanedDescription = market.description;
      if (cleanedDescription) {
        cleanedDescription = cleanedDescription
          .replace("Yes Resolution:", "")
          .replace("No Resolution:", "")
          .trim();
      }

      // Calculate market odds based on predictions
      const yesPredictions = market.predictions.filter(p => p.position === 'yes');
      const noPredictions = market.predictions.filter(p => p.position === 'no');
      
      const yesAmount = yesPredictions.reduce((sum, p) => sum + Number(p.amount), 0);
      const noAmount = noPredictions.reduce((sum, p) => sum + Number(p.amount), 0);
      const totalLiquidity = yesAmount + noAmount;

      res.json({
        ...market,
        description: cleanedDescription,
        yesAmount,
        noAmount,
        totalPool: totalLiquidity,
        currentOdds: {
          yes: totalLiquidity > 0 ? yesAmount / totalLiquidity : 0.5,
          no: totalLiquidity > 0 ? noAmount / totalLiquidity : 0.5
        }
      });
    } catch (error) {
      console.error('Error fetching market:', error);
      res.status(500).json({ error: 'Failed to fetch market' });
    }
  });

  // Get all markets
  app.get("/api/markets", async (req, res) => {
    try {
      console.log('Attempting to fetch markets...');
      const allMarkets = await db.query.markets.findMany({
        orderBy: desc(markets.createdAt),
        with: {
          predictions: true,
        },
      });
      console.log('Successfully fetched markets:', allMarkets);
      res.json(allMarkets);
    } catch (error) {
      console.error('Error fetching markets:', error);
      res.status(500).json({ error: 'Failed to fetch markets' });
    }
  });

  // First, add a route to create a user (if you don't have one already)
  app.post("/api/users", async (req, res) => {
    try {
      const [newUser] = await db
        .insert(users)
        .values({
          username: "default_user",  // You can change this
          password: "default_pass",  // You should use proper password hashing
          balance: "1000",          // Starting balance
        })
        .returning();

      res.json(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  });

  // Then modify the market creation to use an existing user ID
  app.post("/api/markets", async (req, res) => {
    console.log('Received POST request to /api/markets:', req.body);
    try {
      const { title, description } = req.body;

      if (!title) {
        return res.status(400).json({ error: "Title is required" });
      }

      // First, get an existing user
      const [user] = await db
        .select()
        .from(users)
        .limit(1);

      if (!user) {
        return res.status(400).json({ error: "No users exist. Please create a user first." });
      }

      const marketData = {
        title,
        description: description || '',
        initialEvidence: null,
        startingOdds: 0.5,
        creatorId: user.id,  // Use the actual user ID
        createdAt: new Date(),
        participants: 0,
        totalLiquidity: 0
      };

      console.log('Market Data before insert:', JSON.stringify(marketData, null, 2));

      const [newMarket] = await db
        .insert(markets)
        .values(marketData)
        .returning();

      console.log('Successfully created market:', newMarket);
      res.json(newMarket);
    } catch (error) {
      console.error('Error creating market - Full error:', {
        error,
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown',
        sql: error instanceof Error ? (error as any).sql : 'No SQL available',
      });

      res.status(500).json({ 
        error: 'Failed to create market',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Submit evidence endpoint
  app.post("/api/evidence", async (req, res) => {
    try {
      console.log('📝 Received evidence submission:', req.body);
      
      const { title, content, text, marketId, evidenceType } = req.body;

      if (!title || !content) {
        return res.status(400).json({ error: "Title and content are required" });
      }

      // Insert the evidence
      const [newEvidence] = await db
        .insert(evidence)
        .values({
          userId: 1, // Default user for now
          marketId: marketId ? parseInt(marketId) : null,
          title,
          content,
          text: text || content,
          evidenceType: evidenceType || 'yes',
          createdAt: new Date(),
        })
        .returning();

      console.log('✅ Created evidence:', newEvidence);

      // Fetch the evidence with its relationships
      const evidenceWithRelations = await db.query.evidence.findFirst({
        where: eq(evidence.id, newEvidence.id),
        with: {
          votes: {
            columns: {
              id: true,
              userId: true,
              value: true,  // Using the new value column instead of is_upvote
              createdAt: true,
            }
          },
          user: {
            columns: {
              id: true,
              username: true,
            }
          }
        }
      });

      console.log('✅ Returning evidence with relations:', evidenceWithRelations);
      res.json(evidenceWithRelations);

    } catch (error) {
      console.error('❌ Error submitting evidence:', error);
      res.status(500).json({ 
        error: 'Failed to submit evidence',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Simplified test endpoint to isolate the issue
  app.get("/api/evidence/test", async (req, res) => {
    try {
      console.log('📥 Test endpoint hit');
      
      // Simple query without relations
      const basicEvidence = await db.select().from(evidence);
      
      console.log('Basic evidence query result:', {
        count: basicEvidence.length,
        firstItem: basicEvidence[0] || 'no items'
      });
      
      return res.json({
        message: 'Test successful',
        evidenceCount: basicEvidence.length,
        evidence: basicEvidence
      });
      
    } catch (error) {
      console.error('❌ Test endpoint error:', error);
      return res.status(500).json({
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Update the main evidence endpoint with more detailed error handling
  app.get("/api/evidence", async (req, res) => {
    try {
      const marketId = req.query.marketId ? parseInt(req.query.marketId as string) : undefined;
      console.log('📥 Evidence request received:', { marketId });

      // Simple query without joins first
      const evidenceData = await db.select().from(evidence)
        .where(marketId ? eq(evidence.marketId, marketId) : undefined);

      console.log('✅ Query successful:', {
        count: evidenceData.length,
        firstItem: evidenceData[0] || 'no items'
      });

      return res.json(evidenceData);

    } catch (error) {
      console.error('❌ Evidence endpoint error:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
      });

      return res.status(500).json({
        error: 'Failed to fetch evidence',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Update the predictions endpoint to recalculate odds after each bet
  app.post("/api/predictions", async (req, res) => {
    try {
      const { position, amount, marketId } = req.body;
      
      console.log('Received prediction request:', { position, amount, marketId });

      // Validation checks...
      if (!position || !['yes', 'no'].includes(position)) {
        return res.status(400).json({ error: 'Invalid position. Must be "yes" or "no".' });
      }

      const marketIdNum = Number(marketId);
      if (isNaN(marketIdNum)) {
        return res.status(400).json({ error: 'Invalid market ID' });
      }

      // Create the prediction
      const [prediction] = await db.insert(predictions)
        .values({
          userId: 1,
          marketId: marketIdNum,
          position: position as 'yes' | 'no',
          amount: Number(amount),
          probability: 0.5,
          createdAt: new Date(),
        })
        .returning();

      // Fetch all predictions for this market to calculate odds
      const marketPredictions = await db.query.predictions.findMany({
        where: eq(predictions.marketId, marketIdNum),
      });

      // Calculate total amounts for each side
      const yesPredictions = marketPredictions.filter(p => p.position === 'yes');
      const noPredictions = marketPredictions.filter(p => p.position === 'no');
      
      const yesAmount = yesPredictions.reduce((sum, p) => sum + Number(p.amount), 0);
      const noAmount = noPredictions.reduce((sum, p) => sum + Number(p.amount), 0);
      const totalPool = yesAmount + noAmount;

      // Calculate odds based on the proportion of money on each side
      // If $100 on Yes and $100 on No, then odds are 0.5 (50%) for each side
      const yesOdds = totalPool > 0 ? yesAmount / totalPool : 0.5;
      const noOdds = totalPool > 0 ? noAmount / totalPool : 0.5;

      console.log('Calculated odds:', {
        yesAmount,
        noAmount,
        totalPool,
        yesOdds,
        noOdds
      });

      // Update market with new totals
      await db
        .update(markets)
        .set({
          totalLiquidity: totalPool,
        })
        .where(eq(markets.id, marketIdNum));

      // Fetch updated market
      const updatedMarket = await db.query.markets.findFirst({
        where: eq(markets.id, marketIdNum),
        with: {
          predictions: true,
        },
      });

      // Return comprehensive update
      res.json({
        prediction,
        market: {
          ...updatedMarket,
          yesAmount,
          noAmount,
          totalPool,
          currentOdds: {
            yes: yesOdds,
            no: noOdds
          }
        }
      });

    } catch (error) {
      console.error('Error processing prediction:', error);
      res.status(500).json({ error: error.message });
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

  // Vote on evidence endpoint
  app.post("/api/evidence/:evidenceId/vote", async (req, res) => {
    try {
      const evidenceId = parseInt(req.params.evidenceId);
      const { value } = req.body;
      const userId = 1; // Default user for now

      console.log('🗳️ Processing vote:', { evidenceId, value, userId });

      // Delete existing vote if any
      await db
        .delete(votes)
        .where(and(
          eq(votes.evidenceId, evidenceId),
          eq(votes.userId, userId)
        ));

      // If value isn't 0, create new vote
      if (value !== 0) {
        await db
          .insert(votes)
          .values({
            evidenceId,
            userId,
            value,
            createdAt: new Date(),
          });
      }

      // Return updated evidence with votes
      const updatedEvidence = await db.query.evidence.findFirst({
        where: eq(evidence.id, evidenceId),
        with: {
          votes: {
            columns: {
              id: true,
              userId: true,
              value: true,  // Using the new value column
              createdAt: true,
            }
          },
          user: {
            columns: {
              id: true,
              username: true,
            }
          }
        }
      });

      console.log('✅ Vote processed, returning:', updatedEvidence);
      res.json(updatedEvidence);

    } catch (error) {
      console.error('❌ Error processing vote:', error);
      res.status(500).json({ 
        error: 'Failed to process vote',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Add these simple test endpoints
  app.get("/api/test", (req, res) => {
    console.log("Basic test endpoint hit");
    res.json({ message: "Basic test endpoint working" });
  });

  app.get("/api/evidence/simple-test", async (req, res) => {
    console.log("🔍 Starting simple evidence test...");
    
    try {
      // Step 1: Just return a simple message
      console.log("Step 1: Sending test message");
      res.json({
        message: "Simple test endpoint reached",
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error("Test endpoint error:", error);
      res.status(500).json({
        error: "Test failed",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/evidence/db-test", async (req, res) => {
    console.log("🔍 Starting database test...");
    
    try {
      // Step 1: Basic database query
      console.log("Step 1: Testing basic query");
      const result = await db.execute(sql`SELECT NOW()`);
      
      console.log("Query result:", result);
      res.json({
        message: "Database test completed",
        result: result,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error("Database test error:", error);
      res.status(500).json({
        error: "Database test failed",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}