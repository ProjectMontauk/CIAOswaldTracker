import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { markets, evidence, predictions, votes, users } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  // Add a market creation endpoint
  app.post("/api/markets", async (req, res) => {
    try {
      const { title, description, yesCondition, noCondition, startingOdds } = req.body;

      // Validate required fields
      if (!title || !description || !yesCondition || !noCondition || !startingOdds) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Create new market
      const [newMarket] = await db.insert(markets).values({
        title,
        description,
        yesCondition,
        noCondition,
        startingOdds: startingOdds / 100, // Convert percentage to decimal
        creatorId: 1, // Default user for now
      }).returning();

      res.json(newMarket);
    } catch (error) {
      console.error('Error creating market:', error);
      res.status(500).json({ error: 'Failed to create market' });
    }
  });

  // Get all markets
  app.get("/api/markets", async (req, res) => {
    try {
      const allMarkets = await db.query.markets.findMany({
        orderBy: desc(markets.createdAt),
      });
      res.json(allMarkets);
    } catch (error) {
      console.error('Error fetching markets:', error);
      res.status(500).json({ error: 'Failed to fetch markets' });
    }
  });

  // Get specific market
  app.get("/api/markets/:id", async (req, res) => {
    try {
      const marketId = parseInt(req.params.id);

      if (isNaN(marketId)) {
        return res.status(400).json({ error: "Invalid market ID" });
      }

      const market = await db.query.markets.findFirst({
        where: eq(markets.id, marketId),
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
    marketId: null
  },
  {
    userId: 1,
    title: "201 File Opening - December 1960",
    content: "CIA opened a 201 personality file on Oswald in December 1960, despite officially claiming no interest in him until after the assassination. The existence of this file suggests earlier surveillance.",
    text: "The existence of a CIA 201 file on Oswald three years before the assassination contradicts official statements.",
    createdAt: new Date("1960-12-09"),
    marketId: null
  },
  {
    userId: 1,
    title: "James Jesus Angleton Testimony - 1964",
    content: "CIA Counterintelligence Chief Angleton's testimony to the Warren Commission contained notable gaps regarding Oswald's file handling. Later revelations indicated special interest procedures were applied to Oswald's records.",
    text: "Angleton's testimony shows inconsistencies in how the CIA handled Oswald's records.",
    createdAt: new Date("1964-02-15"),
    marketId: null
  }
];