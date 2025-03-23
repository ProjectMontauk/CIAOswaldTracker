"use strict";
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
exports.setupAuth = setupAuth;
var passport_1 = require("passport");
var passport_local_1 = require("passport-local");
var express_session_1 = require("express-session");
var memorystore_1 = require("memorystore");
var crypto_1 = require("crypto");
var util_1 = require("util");
var schema_1 = require("@db/schema");
var _db_1 = require("@db");
var drizzle_orm_1 = require("drizzle-orm");
var scryptAsync = (0, util_1.promisify)(crypto_1.scrypt);
var crypto = {
    hash: function (password) { return __awaiter(void 0, void 0, void 0, function () {
        var salt, buf;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    salt = (0, crypto_1.randomBytes)(16).toString("hex");
                    return [4 /*yield*/, scryptAsync(password, salt, 64)];
                case 1:
                    buf = (_a.sent());
                    return [2 /*return*/, "".concat(buf.toString("hex"), ".").concat(salt)];
            }
        });
    }); },
    compare: function (suppliedPassword, storedPassword) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, hashedPassword, salt, hashedPasswordBuf, suppliedPasswordBuf;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = storedPassword.split("."), hashedPassword = _a[0], salt = _a[1];
                    hashedPasswordBuf = Buffer.from(hashedPassword, "hex");
                    return [4 /*yield*/, scryptAsync(suppliedPassword, salt, 64)];
                case 1:
                    suppliedPasswordBuf = (_b.sent());
                    return [2 /*return*/, (0, crypto_1.timingSafeEqual)(hashedPasswordBuf, suppliedPasswordBuf)];
            }
        });
    }); },
};
function setupAuth(app) {
    var _this = this;
    var MemoryStore = (0, memorystore_1.default)(express_session_1.default);
    var sessionSettings = {
        secret: process.env.REPL_ID || "oswald-market-secret",
        resave: false,
        saveUninitialized: false,
        cookie: {},
        store: new MemoryStore({
            checkPeriod: 86400000,
        }),
    };
    if (app.get("env") === "production") {
        app.set("trust proxy", 1);
        sessionSettings.cookie = { secure: true };
    }
    app.use((0, express_session_1.default)(sessionSettings));
    app.use(passport_1.default.initialize());
    app.use(passport_1.default.session());
    passport_1.default.use(new passport_local_1.Strategy(function (username, password, done) { return __awaiter(_this, void 0, void 0, function () {
        var user, isMatch, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, _db_1.db
                            .select()
                            .from(schema_1.users)
                            .where((0, drizzle_orm_1.eq)(schema_1.users.username, username))
                            .limit(1)];
                case 1:
                    user = (_a.sent())[0];
                    if (!user) {
                        return [2 /*return*/, done(null, false, { message: "Incorrect username." })];
                    }
                    return [4 /*yield*/, crypto.compare(password, user.password)];
                case 2:
                    isMatch = _a.sent();
                    if (!isMatch) {
                        return [2 /*return*/, done(null, false, { message: "Incorrect password." })];
                    }
                    return [2 /*return*/, done(null, user)];
                case 3:
                    err_1 = _a.sent();
                    return [2 /*return*/, done(err_1)];
                case 4: return [2 /*return*/];
            }
        });
    }); }));
    passport_1.default.serializeUser(function (user, done) {
        done(null, user.id);
    });
    passport_1.default.deserializeUser(function (id, done) { return __awaiter(_this, void 0, void 0, function () {
        var user, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, _db_1.db
                            .select()
                            .from(schema_1.users)
                            .where((0, drizzle_orm_1.eq)(schema_1.users.id, id))
                            .limit(1)];
                case 1:
                    user = (_a.sent())[0];
                    done(null, user);
                    return [3 /*break*/, 3];
                case 2:
                    err_2 = _a.sent();
                    done(err_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    app.post("/api/register", function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
        var _a, username, password, existingUser, hashedPassword, newUser_1, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    _a = req.body, username = _a.username, password = _a.password;
                    if (!username || !password) {
                        return [2 /*return*/, res.status(400).send("Username and password are required")];
                    }
                    return [4 /*yield*/, _db_1.db
                            .select()
                            .from(schema_1.users)
                            .where((0, drizzle_orm_1.eq)(schema_1.users.username, username))
                            .limit(1)];
                case 1:
                    existingUser = (_b.sent())[0];
                    if (existingUser) {
                        return [2 /*return*/, res.status(400).send("Username already exists")];
                    }
                    return [4 /*yield*/, crypto.hash(password)];
                case 2:
                    hashedPassword = _b.sent();
                    return [4 /*yield*/, _db_1.db
                            .insert(schema_1.users)
                            .values({
                            username: username,
                            password: hashedPassword,
                        })
                            .returning()];
                case 3:
                    newUser_1 = (_b.sent())[0];
                    // Log the user in after registration
                    req.login(newUser_1, function (err) {
                        if (err)
                            return next(err);
                        return res.json({
                            message: "Registration successful",
                            user: { id: newUser_1.id, username: newUser_1.username },
                        });
                    });
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _b.sent();
                    next(error_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); });
    app.post("/api/login", function (req, res, next) {
        passport_1.default.authenticate("local", function (err, user, info) {
            var _a;
            if (err)
                return next(err);
            if (!user)
                return res.status(400).send((_a = info.message) !== null && _a !== void 0 ? _a : "Login failed");
            req.logIn(user, function (err) {
                if (err)
                    return next(err);
                return res.json({
                    message: "Login successful",
                    user: { id: user.id, username: user.username },
                });
            });
        })(req, res, next);
    });
    app.post("/api/logout", function (req, res) {
        req.logout(function (err) {
            if (err)
                return res.status(500).send("Logout failed");
            res.json({ message: "Logout successful" });
        });
    });
    app.get("/api/user", function (req, res) {
        if (req.isAuthenticated()) {
            return res.json(req.user);
        }
        res.status(401).send("Not logged in");
    });
}
