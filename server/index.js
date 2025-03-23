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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
// Log the environment for debugging
console.log('Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: (_a = process.env.DATABASE_URL) === null || _a === void 0 ? void 0 : _a.replace(/:.*@/, ':****@'), // Hide password in logs
});
var express_1 = require("express");
var vite_1 = require("./vite");
var routes_1 = require("./routes");
var path_1 = require("path");
var app = (0, express_1.default)();
app.use(express_1.default.json());
// Enhanced CORS and proxy middleware with development-friendly settings
app.use(function (req, res, next) {
    var replit_host = req.headers.host || '';
    // Set development-friendly headers
    if (process.env.NODE_ENV !== 'production') {
        // Always set the origin in development to match the host
        var protocol = req.secure ? 'https' : 'http';
        var origin_1 = "".concat(protocol, "://").concat(replit_host);
        // Set headers that Vite expects
        req.headers.origin = origin_1;
        res.header('Access-Control-Allow-Origin', origin_1);
        res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, X-Requested-With, Accept');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Cross-Origin-Resource-Policy', 'cross-origin');
        res.header('Cross-Origin-Opener-Policy', 'same-origin');
        // Log headers in development for debugging
        console.log('Development request:', {
            url: req.url,
            headers: {
                host: replit_host,
                origin: origin_1,
                method: req.method
            }
        });
    }
    else {
        // Production mode - only accept Replit domains
        var origin_2 = req.headers.origin;
        if (origin_2 && (origin_2.endsWith('.replit.dev') || origin_2.includes('replit.co'))) {
            res.header('Access-Control-Allow-Origin', origin_2);
        }
        else {
            var fallbackOrigin = "https://".concat(replit_host);
            res.header('Access-Control-Allow-Origin', fallbackOrigin);
        }
        res.header('Access-Control-Allow-Credentials', 'true');
    }
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    next();
});
// Request logging middleware
app.use(function (req, res, next) {
    var start = Date.now();
    var path = req.path;
    var capturedJsonResponse = undefined;
    var originalResJson = res.json;
    res.json = function (bodyJson) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, __spreadArray([bodyJson], args, true));
    };
    res.on("finish", function () {
        var duration = Date.now() - start;
        if (path.startsWith("/api")) {
            var logLine = "".concat(req.method, " ").concat(path, " ").concat(res.statusCode, " in ").concat(duration, "ms");
            if (capturedJsonResponse) {
                logLine += " :: ".concat(JSON.stringify(capturedJsonResponse));
            }
            (0, vite_1.log)(logLine);
        }
    });
    next();
});
// Initialize routes and server
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var server, isProduction, distPath_1, PORT;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                server = (0, routes_1.registerRoutes)(app);
                app.use(function (err, _req, res, _next) {
                    var status = err.status || err.statusCode || 500;
                    var message = err.message || "Internal Server Error";
                    console.error('Error details:', err);
                    res.status(status).json({ message: message });
                });
                isProduction = process.env.NODE_ENV === "production";
                console.log("Starting server in ".concat(isProduction ? 'production' : 'development', " mode"));
                if (!isProduction) return [3 /*break*/, 1];
                distPath_1 = path_1.default.resolve(process.cwd(), "dist/public");
                console.log('Serving static files from:', distPath_1);
                app.use(express_1.default.static(distPath_1));
                app.get("*", function (_req, res) {
                    res.sendFile(path_1.default.resolve(distPath_1, "index.html"));
                });
                return [3 /*break*/, 3];
            case 1:
                console.log('Setting up Vite development server');
                return [4 /*yield*/, (0, vite_1.setupVite)(app, server)];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                PORT = process.env.PORT || 3000;
                server.listen(Number(PORT), "0.0.0.0", function () {
                    (0, vite_1.log)("Server running in ".concat(isProduction ? 'production' : 'development', " mode on port ").concat(PORT));
                });
                return [2 /*return*/];
        }
    });
}); })();
