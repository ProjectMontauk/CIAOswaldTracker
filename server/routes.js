"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
var http_1 = require("http");
var _db_1 = require("@db");
var schema_1 = require("@db/schema");
var drizzle_orm_1 = require("drizzle-orm");
var auth_1 = require("./auth");
console.log('Are we even getting here?');
function registerRoutes(app) {
    var _this = this;
    (0, auth_1.setupAuth)(app);
    // Single health check endpoint that also verifies DB connection
    app.get("/api/health", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, _db_1.db.select().from(schema_1.users).limit(1)];
                case 1:
                    _a.sent();
                    res.json({
                        status: "ok",
                        database: "connected",
                        env: process.env.NODE_ENV
                    });
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('Database connection error:', error_1);
                    res.status(500).json({
                        status: 'error',
                        database: 'disconnected',
                        message: error_1.message
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    // New endpoint to clear evidence for a specific market
    app.post("/api/markets/:id/clear-evidence", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var marketId, market, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    marketId = parseInt(req.params.id);
                    return [4 /*yield*/, _db_1.db.query.markets.findFirst({
                            where: (0, drizzle_orm_1.eq)(schema_1.markets.id, marketId),
                        })];
                case 1:
                    market = _a.sent();
                    if (!market) {
                        return [2 /*return*/, res.status(404).json({ error: "Market not found" })];
                    }
                    // Soft delete by updating evidence entries to be marked as cleared
                    return [4 /*yield*/, _db_1.db
                            .update(schema_1.evidence)
                            .set({
                            content: "[Cleared]",
                            text: "[Cleared]",
                        })
                            .where((0, drizzle_orm_1.eq)(schema_1.evidence.marketId, marketId))];
                case 2:
                    // Soft delete by updating evidence entries to be marked as cleared
                    _a.sent();
                    res.json({ message: "Evidence cleared successfully" });
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error('Error clearing evidence:', error_2);
                    res.status(500).json({ error: 'Failed to clear evidence' });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    // Delete all evidence with null marketId
    app.delete("/api/evidence/cleanup", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, _db_1.db
                            .delete(schema_1.evidence)
                            .where((0, drizzle_orm_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["", " IS NULL"], ["", " IS NULL"])), schema_1.evidence.marketId))];
                case 1:
                    _a.sent();
                    res.json({ message: "Successfully deleted all evidence without market ID" });
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.error('Error deleting evidence:', error_3);
                    res.status(500).json({ error: 'Failed to delete evidence' });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    // Get specific market with its evidence and predictions
    app.get("/api/markets/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var marketId, market, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    marketId = parseInt(req.params.id);
                    return [4 /*yield*/, _db_1.db.query.markets.findFirst({
                            where: (0, drizzle_orm_1.eq)(schema_1.markets.id, marketId),
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
                        })];
                case 1:
                    market = _a.sent();
                    if (!market) {
                        return [2 /*return*/, res.status(404).json({ error: "Market not found" })];
                    }
                    res.json(market);
                    return [3 /*break*/, 3];
                case 2:
                    error_4 = _a.sent();
                    console.error('Error fetching market:', error_4);
                    res.status(500).json({ error: 'Failed to fetch market' });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    // Get all markets
    app.get("/api/markets", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var allMarkets, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, _db_1.db.query.markets.findMany({
                            orderBy: (0, drizzle_orm_1.desc)(schema_1.markets.createdAt),
                            with: {
                                predictions: true,
                            },
                        })];
                case 1:
                    allMarkets = _a.sent();
                    res.json(allMarkets);
                    return [3 /*break*/, 3];
                case 2:
                    error_5 = _a.sent();
                    console.error('Error fetching markets:', error_5);
                    res.status(500).json({ error: 'Failed to fetch markets' });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    // Submit evidence endpoint
    app.post("/api/evidence", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var _a, title, content, text, marketId, evidenceType, parsedMarketId, newEvidence, evidenceWithRelations, error_6;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    _a = req.body, title = _a.title, content = _a.content, text = _a.text, marketId = _a.marketId, evidenceType = _a.evidenceType;
                    if (!title || !content) {
                        return [2 /*return*/, res.status(400).send("Title and content are required")];
                    }
                    parsedMarketId = marketId ? parseInt(marketId) : null;
                    console.log('Creating evidence with:', {
                        title: title,
                        content: content,
                        text: text,
                        marketId: parsedMarketId,
                        evidenceType: evidenceType
                    });
                    return [4 /*yield*/, _db_1.db
                            .insert(schema_1.evidence)
                            .values({
                            userId: 1, // Default user for now
                            marketId: parsedMarketId,
                            title: title,
                            content: content,
                            text: text || null,
                            evidenceType: evidenceType || 'yes',
                        })
                            .returning()];
                case 1:
                    newEvidence = (_b.sent())[0];
                    console.log('Created evidence:', newEvidence);
                    return [4 /*yield*/, _db_1.db.query.evidence.findFirst({
                            where: (0, drizzle_orm_1.eq)(schema_1.evidence.id, newEvidence.id),
                            with: {
                                votes: true,
                                user: true,
                            },
                        })];
                case 2:
                    evidenceWithRelations = _b.sent();
                    console.log('Returning evidence with relations:', evidenceWithRelations);
                    res.json(evidenceWithRelations);
                    return [3 /*break*/, 4];
                case 3:
                    error_6 = _b.sent();
                    console.error('Error submitting evidence:', error_6);
                    res.status(500).json({ error: 'Failed to submit evidence' });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    // Evidence routes
    app.get("/api/evidence", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var marketId, evidenceData, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    marketId = req.query.marketId ? parseInt(req.query.marketId) : undefined;
                    console.log('Fetching evidence for marketId:', marketId);
                    return [4 /*yield*/, _db_1.db.query.evidence.findMany({
                            where: marketId !== undefined ? (0, drizzle_orm_1.eq)(schema_1.evidence.marketId, marketId) : undefined,
                            with: {
                                votes: true,
                                user: true,
                            },
                            orderBy: (0, drizzle_orm_1.desc)(schema_1.evidence.createdAt),
                        })];
                case 1:
                    evidenceData = _a.sent();
                    console.log('Found evidence:', evidenceData);
                    res.json(evidenceData);
                    return [3 /*break*/, 3];
                case 2:
                    error_7 = _a.sent();
                    console.error('Error fetching evidence:', error_7);
                    res.status(500).json({ error: 'Failed to fetch evidence' });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    // Predictions routes
    app.post("/api/predictions", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var _a, position_1, amount_1, marketId_1, prediction, marketState, error_8;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    _a = req.body, position_1 = _a.position, amount_1 = _a.amount, marketId_1 = _a.marketId;
                    if (!position_1 || !amount_1 || amount_1 <= 0) {
                        return [2 /*return*/, res.status(400).send("Position and amount are required")];
                    }
                    return [4 /*yield*/, _db_1.db.transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                            var user;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, tx
                                            .select()
                                            .from(schema_1.users)
                                            .where((0, drizzle_orm_1.eq)(schema_1.users.id, 1))
                                            .limit(1)];
                                    case 1:
                                        user = (_a.sent())[0];
                                        if (!user || Number(user.balance) < amount_1) {
                                            throw new Error("Insufficient balance");
                                        }
                                        // Update user balance
                                        return [4 /*yield*/, tx
                                                .update(schema_1.users)
                                                .set({
                                                balance: (0, drizzle_orm_1.sql)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["", " - ", ""], ["", " - ", ""])), schema_1.users.balance, amount_1),
                                            })
                                                .where((0, drizzle_orm_1.eq)(schema_1.users.id, 1))];
                                    case 2:
                                        // Update user balance
                                        _a.sent();
                                        return [4 /*yield*/, tx
                                                .insert(schema_1.predictions)
                                                .values({
                                                userId: 1,
                                                marketId: marketId_1 || 1, // Default to market 1 if not provided
                                                position: position_1,
                                                amount: amount_1,
                                                probability: "0.5", // Initial probability
                                            })
                                                .returning()];
                                    case 3: 
                                    // Create prediction
                                    return [2 /*return*/, _a.sent()];
                                }
                            });
                        }); })];
                case 1:
                    prediction = (_b.sent())[0];
                    return [4 /*yield*/, _db_1.db.query.predictions.findMany({
                            where: marketId_1 ? (0, drizzle_orm_1.eq)(schema_1.predictions.marketId, marketId_1) : undefined,
                            orderBy: (0, drizzle_orm_1.desc)(schema_1.predictions.createdAt),
                        })];
                case 2:
                    marketState = _b.sent();
                    res.json({ prediction: prediction, marketState: marketState });
                    return [3 /*break*/, 4];
                case 3:
                    error_8 = _b.sent();
                    console.error('Error processing prediction:', error_8);
                    res.status(500).json({ error: error_8 instanceof Error ? error_8.message : 'Failed to process prediction' });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    app.get("/api/predictions", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var allPredictions, error_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, _db_1.db.query.predictions.findMany({
                            orderBy: (0, drizzle_orm_1.desc)(schema_1.predictions.createdAt),
                            with: {
                                user: true,
                            },
                        })];
                case 1:
                    allPredictions = _a.sent();
                    res.json(allPredictions);
                    return [3 /*break*/, 3];
                case 2:
                    error_9 = _a.sent();
                    console.error('Error fetching predictions:', error_9);
                    res.status(500).json({ error: 'Failed to fetch predictions' });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    app.post("/api/vote", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var _a, evidenceId, isUpvote, userId, evidenceItem, updatedEvidence, error_10;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = req.body, evidenceId = _a.evidenceId, isUpvote = _a.isUpvote;
                    userId = 1;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, _db_1.db
                            .select()
                            .from(schema_1.evidence)
                            .where((0, drizzle_orm_1.eq)(schema_1.evidence.id, evidenceId))
                            .limit(1)];
                case 2:
                    evidenceItem = (_b.sent())[0];
                    if (!evidenceItem) {
                        return [2 /*return*/, res.status(404).json({ error: "Evidence not found" })];
                    }
                    // Create the vote
                    return [4 /*yield*/, _db_1.db.insert(schema_1.votes).values({
                            userId: userId,
                            evidenceId: evidenceId,
                            isUpvote: isUpvote,
                        })];
                case 3:
                    // Create the vote
                    _b.sent();
                    // Update author's reputation and vote counts
                    return [4 /*yield*/, _db_1.db
                            .update(schema_1.users)
                            .set({
                            upvotesReceived: (0, drizzle_orm_1.sql)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["", " + ", ""], ["", " + ", ""])), schema_1.users.upvotesReceived, isUpvote ? 1 : 0),
                            downvotesReceived: (0, drizzle_orm_1.sql)(templateObject_4 || (templateObject_4 = __makeTemplateObject(["", " + ", ""], ["", " + ", ""])), schema_1.users.downvotesReceived, !isUpvote ? 1 : 0),
                            reputation: (0, drizzle_orm_1.sql)(templateObject_5 || (templateObject_5 = __makeTemplateObject(["", " + ", ""], ["", " + ", ""])), schema_1.users.reputation, isUpvote ? 1 : -1),
                        })
                            .where((0, drizzle_orm_1.eq)(schema_1.users.id, evidenceItem.userId))];
                case 4:
                    // Update author's reputation and vote counts
                    _b.sent();
                    return [4 /*yield*/, _db_1.db.query.evidence.findMany({
                            with: {
                                votes: true,
                                user: true,
                            },
                            orderBy: (0, drizzle_orm_1.desc)(schema_1.evidence.createdAt),
                        })];
                case 5:
                    updatedEvidence = _b.sent();
                    res.json(updatedEvidence);
                    return [3 /*break*/, 7];
                case 6:
                    error_10 = _b.sent();
                    console.error('Error handling vote:', error_10);
                    res.status(500).json({ error: 'Failed to process vote' });
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); });
    // Add endpoint to get user reputation
    app.get("/api/user/:id/reputation", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var user, error_11;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, _db_1.db
                            .select({
                            reputation: schema_1.users.reputation,
                            upvotesReceived: schema_1.users.upvotesReceived,
                            downvotesReceived: schema_1.users.downvotesReceived,
                        })
                            .from(schema_1.users)
                            .where((0, drizzle_orm_1.eq)(schema_1.users.id, parseInt(req.params.id)))
                            .limit(1)];
                case 1:
                    user = (_a.sent())[0];
                    if (!user) {
                        return [2 /*return*/, res.status(404).json({ error: "User not found" })];
                    }
                    res.json(user);
                    return [3 /*break*/, 3];
                case 2:
                    error_11 = _a.sent();
                    console.error('Error fetching user reputation:', error_11);
                    res.status(500).json({ error: 'Failed to fetch reputation' });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    var httpServer = (0, http_1.createServer)(app);
    return httpServer;
}
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5;
