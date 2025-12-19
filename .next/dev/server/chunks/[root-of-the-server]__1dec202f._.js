module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/services/jwt-service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// This service is for handling custom JWT tokens for database authentication
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
class JWTService {
    secret;
    constructor(){
        this.secret = process.env.JWT_SECRET || '6dFk5d0vbyLnZC0Amy83LtI47DsNr/KB4M+FgbUc6njd4cjk7XB2/8nTuhQDWW8OOgQ6fI74huxJE3a/RP2giw==';
    }
    /**
   * Convert a string to a Uint8Array (which can be used with Web Crypto API)
   */ stringToUint8Array(str) {
        return new TextEncoder().encode(str);
    }
    /**
  * Convert a Uint8Array to a base64url encoded string
  */ uint8ArrayToBase64Url(uint8Array) {
        let binary = '';
        for(let i = 0; i < uint8Array.byteLength; i++){
            binary += String.fromCharCode(uint8Array[i]);
        }
        return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    }
    /**
   * Import the secret as a CryptoKey for use with Web Crypto API
   */ async importSecret() {
        const encoder = new TextEncoder();
        const keyBuffer = encoder.encode(this.secret);
        return await crypto.subtle.importKey('raw', keyBuffer, {
            name: 'HMAC',
            hash: 'SHA-256'
        }, false, [
            'sign',
            'verify'
        ]);
    }
    /**
   * Generate a JWT token using Web Crypto API
   */ async generateToken(payload) {
        try {
            // Create the header
            const header = {
                alg: 'HS256',
                typ: 'JWT'
            };
            // Add timestamp and expiration (1 hour from now)
            const timestamp = Math.floor(Date.now() / 1000);
            const expiration = timestamp + 3600; // 1 hour in seconds
            // Create the payload with the provided data and timestamps
            const fullPayload = {
                ...payload,
                iat: timestamp,
                exp: expiration
            };
            // Encode header and payload to base64url
            const encodedHeader = this.uint8ArrayToBase64Url(this.stringToUint8Array(JSON.stringify(header)));
            const encodedPayload = this.uint8ArrayToBase64Url(this.stringToUint8Array(JSON.stringify(fullPayload)));
            // Create the signing input
            const signingInput = `${encodedHeader}.${encodedPayload}`;
            // Import the secret as a crypto key
            const key = await this.importSecret();
            // Create signing input buffer in the proper format for Web Crypto API
            const encoder = new TextEncoder();
            const signingInputBuffer = encoder.encode(signingInput);
            // Sign the token - use type assertion to handle TypeScript compatibility issues
            const signatureBuffer = await crypto.subtle.sign('HMAC', key, signingInputBuffer);
            // Encode the signature - signatureBuffer is an ArrayBuffer, convert to base64url
            const signatureUint8Array = new Uint8Array(signatureBuffer);
            const encodedSignature = this.uint8ArrayToBase64Url(signatureUint8Array);
            // Return the complete JWT token
            return `${signingInput}.${encodedSignature}`;
        } catch (error) {
            console.error('JWT token generation failed:', error);
            throw new Error('Failed to generate JWT token');
        }
    }
    /**
   * Verify a JWT token using Web Crypto API
   */ async verifyToken(token) {
        try {
            // Check if token is valid before attempting to verify
            if (!token || typeof token !== 'string' || token.trim() === '') {
                console.error('Invalid token provided for verification');
                return null;
            }
            // Check if token has proper format (3 parts separated by dots)
            const tokenParts = token.split('.');
            if (tokenParts.length !== 3) {
                console.error('Token format is invalid');
                return null;
            }
            const [encodedHeader, encodedPayload, encodedSignature] = tokenParts;
            // Decode header
            const decodedHeader = this.base64UrlDecode(encodedHeader);
            if (!decodedHeader) {
                console.error('Failed to decode token header');
                return null;
            }
            // Decode payload
            const decodedPayloadStr = this.base64UrlDecode(encodedPayload);
            if (!decodedPayloadStr) {
                console.error('Failed to decode token payload');
                return null;
            }
            // Parse payload
            const payloadObj = JSON.parse(decodedPayloadStr);
            // Check if token is expired
            const currentTime = Math.floor(Date.now() / 1000);
            if (payloadObj.exp && payloadObj.exp < currentTime) {
                console.error('Token has expired');
                return null;
            }
            // Import the secret as a crypto key
            const key = await this.importSecret();
            // Verify the signature
            const isValid = await this.verifySignature(`${encodedHeader}.${encodedPayload}`, encodedSignature, key);
            if (!isValid) {
                console.error('Token signature verification failed');
                return null;
            }
            return payloadObj;
        } catch (error) {
            console.error('Token verification failed:', error?.message || error);
            return null;
        }
    }
    /**
   * Verify the JWT signature using Web Crypto API
   */ async verifySignature(signingInput, signature, key) {
        try {
            // Decode the signature from base64url to Uint8Array
            const signatureBytes = this.base64UrlDecodeToUint8Array(signature);
            if (!signatureBytes) {
                return false;
            }
            // Create proper buffers for Web Crypto API
            const encoder = new TextEncoder();
            const verificationInputBuffer = encoder.encode(signingInput);
            // Use ArrayBufferView for signatureBytes and input buffer
            // Cast to appropriate types to handle TypeScript issues
            const signatureView = new Uint8Array(signatureBytes.buffer, signatureBytes.byteOffset, signatureBytes.byteLength);
            const inputView = new Uint8Array(verificationInputBuffer.buffer, verificationInputBuffer.byteOffset, verificationInputBuffer.byteLength);
            // Verify the signature - use type assertion to handle TypeScript compatibility issues
            const isValid = await crypto.subtle.verify('HMAC', key, signatureView, inputView);
            return isValid;
        } catch (error) {
            console.error('Signature verification error:', error);
            return false;
        }
    }
    /**
   * Decode a JWT token without verification (for edge runtime compatibility)
   * This only extracts the payload without validating the signature
   * Use carefully - only for non-sensitive operations like checking expiration
   */ decodeToken(token) {
        try {
            if (!token || typeof token !== 'string' || token.trim() === '') {
                return null;
            }
            const tokenParts = token.split('.');
            if (tokenParts.length !== 3) {
                console.error('Token format is invalid');
                return null;
            }
            const payload = tokenParts[1];
            const decodedPayload = this.base64UrlDecode(payload);
            if (!decodedPayload) {
                return null;
            }
            return JSON.parse(decodedPayload);
        } catch (error) {
            console.error('Token decoding failed:', error?.message || error);
            return null;
        }
    }
    /**
   * Check if a token is expired without full verification
   * This uses the decode method which doesn't require the secret
   */ isTokenExpired(token) {
        try {
            const decoded = this.decodeToken(token);
            if (!decoded || !decoded.exp) {
                return true; // If we can't decode or there's no expiration, consider it expired
            }
            // Compare expiration timestamp with current time (in seconds)
            const currentTime = Math.floor(Date.now() / 1000);
            return decoded.exp < currentTime;
        } catch (error) {
            console.error('Error checking token expiration:', error);
            return true; // If there's an error, assume token is expired
        }
    }
    /**
   * Helper function to decode base64url encoded strings
   */ base64UrlDecode(str) {
        try {
            // Add padding if needed
            const padding = '='.repeat((4 - str.length % 4) % 4);
            const base64 = str.replace(/-/g, '+').replace(/_/g, '/') + padding;
            const rawData = atob(base64);
            return decodeURIComponent(escape(rawData));
        } catch (error) {
            console.error('Base64 URL decode error:', error);
            return null;
        }
    }
    /**
   * Helper function to decode base64url string to Uint8Array
   */ base64UrlDecodeToUint8Array(str) {
        try {
            // Add padding if needed
            const padding = '='.repeat((4 - str.length % 4) % 4);
            const base64 = str.replace(/-/g, '+').replace(/_/g, '/') + padding;
            const rawData = atob(base64);
            const buffer = new Uint8Array(rawData.length);
            for(let i = 0; i < rawData.length; i++){
                buffer[i] = rawData.charCodeAt(i);
            }
            return buffer;
        } catch (error) {
            console.error('Base64 URL decode to Uint8Array error:', error);
            return null;
        }
    }
}
const __TURBOPACK__default__export__ = new JWTService();
}),
"[externals]/@prisma/client [external] (@prisma/client, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("@prisma/client", () => require("@prisma/client"));

module.exports = mod;
}),
"[project]/lib/prisma.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
;
// Create Prisma client instance
const createPrismaClient = ()=>{
    return new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["PrismaClient"]({
        log: [
            'query',
            'info',
            'warn',
            'error'
        ]
    });
};
// Use the global instance in development to prevent exceeding connection limits
const client = globalThis.prisma || createPrismaClient();
if ("TURBOPACK compile-time truthy", 1) globalThis.prisma = client;
const __TURBOPACK__default__export__ = client;
}),
"[project]/lib/utils/rbac.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Role-Based Access Control (RBAC) utilities for LSPU KMIS
 * Defines role hierarchies and permission checks
 */ __turbopack_context__.s([
    "getAllowedActions",
    ()=>getAllowedActions,
    "getRolesForAction",
    ()=>getRolesForAction,
    "hasAnyRole",
    ()=>hasAnyRole,
    "hasPermission",
    ()=>hasPermission,
    "hasRole",
    ()=>hasRole,
    "hasRoleHierarchy",
    ()=>hasRoleHierarchy,
    "isAdmin",
    ()=>isAdmin,
    "isExternal",
    ()=>isExternal,
    "isFaculty",
    ()=>isFaculty,
    "isStudent",
    ()=>isStudent
]);
// Define role hierarchy - ADMIN has highest privileges, followed by FACULTY, STUDENT, then EXTERNAL
const ROLE_HIERARCHY = {
    'ADMIN': 4,
    'FACULTY': 3,
    'STUDENT': 2,
    'EXTERNAL': 1
};
function hasRole(userRole, requiredRole) {
    return userRole === requiredRole;
}
function hasAnyRole(userRole, requiredRoles) {
    return requiredRoles.includes(userRole);
}
function hasRoleHierarchy(userRole, requiredRole) {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
function isAdmin(userRole) {
    return userRole === 'ADMIN';
}
function isFaculty(userRole) {
    return userRole === 'FACULTY' || userRole === 'ADMIN';
}
function isStudent(userRole) {
    return userRole === 'STUDENT' || userRole === 'FACULTY' || userRole === 'ADMIN';
}
function isExternal(userRole) {
    return userRole === 'EXTERNAL' || userRole === 'STUDENT' || userRole === 'FACULTY' || userRole === 'ADMIN';
}
function getAllowedActions(userRole) {
    switch(userRole){
        case 'ADMIN':
            return [
                'CREATE_DOCUMENT',
                'READ_DOCUMENT',
                'UPDATE_DOCUMENT',
                'DELETE_DOCUMENT',
                'CREATE_USER',
                'READ_USER',
                'UPDATE_USER',
                'DELETE_USER',
                'CREATE_UNIT',
                'READ_UNIT',
                'UPDATE_UNIT',
                'DELETE_UNIT',
                'MANAGE_PERMISSIONS',
                'VIEW_ANALYTICS'
            ];
        case 'FACULTY':
            return [
                'CREATE_DOCUMENT',
                'READ_DOCUMENT',
                'UPDATE_DOCUMENT',
                'READ_USER',
                'READ_UNIT',
                'VIEW_ANALYTICS'
            ];
        case 'STUDENT':
            return [
                'READ_DOCUMENT',
                'READ_USER',
                'READ_UNIT'
            ];
        case 'EXTERNAL':
            return [
                'READ_DOCUMENT'
            ];
        default:
            return [];
    }
}
function hasPermission(userRole, action) {
    const allowedActions = getAllowedActions(userRole);
    return allowedActions.includes(action);
}
function getRolesForAction(action) {
    const roles = [];
    Object.keys(ROLE_HIERARCHY).forEach((role)=>{
        if (hasPermission(role, action)) {
            roles.push(role);
        }
    });
    return roles;
}
}),
"[project]/lib/middleware/auth-middleware.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "requireAuth",
    ()=>requireAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$jwt$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/services/jwt-service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$rbac$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils/rbac.ts [app-route] (ecmascript)");
;
;
;
;
async function requireAuth(request, roles) {
    // Extract the token from the Authorization header or cookies
    const authHeader = request.headers.get('authorization');
    let token = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
    } else {
        // Try to get token from cookies
        const cookies = request.cookies;
        token = cookies.get('access_token')?.value;
    }
    if (!token) {
        // For API routes, return a 401 response instead of redirecting
        if (request.nextUrl.pathname.startsWith('/api/')) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Authentication required'
            }, {
                status: 401
            });
        }
        // For regular routes, redirect to login
        const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/login', request.url));
        return response;
    }
    // Verify the JWT token
    const decoded = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$jwt$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].verifyToken(token);
    if (!decoded) {
        console.error('Token verification failed:', token ? token.substring(0, 20) + '...' : 'null');
        // Token is invalid, return appropriate response based on request type
        if (request.nextUrl.pathname.startsWith('/api/')) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid or expired token'
            }, {
                status: 401
            });
        } else {
            // For regular routes, redirect to login
            const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/', request.url));
            return response;
        }
    }
    console.log('Decoded token:', decoded);
    // Check if decoded.userId is valid
    if (!decoded.userId) {
        console.error('Token does not contain userId:', decoded);
        // Token doesn't contain a valid userId, return error
        if (request.nextUrl.pathname.startsWith('/api/')) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid token: missing user ID'
            }, {
                status: 401
            });
        }
        const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/login', request.url));
        return response;
    }
    // Get user profile from database using the user ID from the token
    const user = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].user.findUnique({
        where: {
            id: decoded.userId
        },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            unitId: true
        }
    });
    if (!user) {
        console.error('User not found with ID from token:', decoded.userId);
        // User doesn't exist in the database, redirect to login
        const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/login', request.url));
        return response;
    }
    // Check if user has required roles
    if (roles && roles.length > 0 && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$rbac$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hasAnyRole"])(user.role, roles)) {
        // User doesn't have required role, return error for API routes
        if (request.nextUrl.pathname.startsWith('/api/')) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'User does not have required role to perform this action'
            }, {
                status: 403
            });
        }
        // For regular routes, redirect to unauthorized page
        const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/unauthorized', request.url));
        return response;
    }
    return {
        user
    };
}
}),
"[externals]/node:os [external] (node:os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:os", () => require("node:os"));

module.exports = mod;
}),
"[externals]/node:util [external] (node:util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:util", () => require("node:util"));

module.exports = mod;
}),
"[externals]/node:process [external] (node:process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:process", () => require("node:process"));

module.exports = mod;
}),
"[externals]/node:http [external] (node:http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:http", () => require("node:http"));

module.exports = mod;
}),
"[externals]/node:https [external] (node:https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:https", () => require("node:https"));

module.exports = mod;
}),
"[externals]/node:zlib [external] (node:zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:zlib", () => require("node:zlib"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[externals]/tls [external] (tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tls", () => require("tls"));

module.exports = mod;
}),
"[externals]/assert [external] (assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}),
"[externals]/tty [external] (tty, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tty", () => require("tty"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/node:fs [external] (node:fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs", () => require("node:fs"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/lib/services/file-storage-service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$azure$2f$storage$2d$blob$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@azure/storage-blob/dist/esm/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$azure$2f$storage$2d$blob$2f$dist$2f$esm$2f$BlobServiceClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@azure/storage-blob/dist/esm/BlobServiceClient.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$azure$2f$storage$2d$blob$2f$dist$2f$esm$2f$sas$2f$BlobSASSignatureValues$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@azure/storage-blob/dist/esm/sas/BlobSASSignatureValues.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$azure$2f$storage$2d$blob$2f$dist$2f$esm$2f$sas$2f$BlobSASPermissions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@azure/storage-blob/dist/esm/sas/BlobSASPermissions.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
;
;
class FileStorageService {
    blobServiceClient;
    containerName = 'repository-files';
    constructor(){
        const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
        if (!connectionString) {
            throw new Error('Azure Storage connection string is not configured');
        }
        this.blobServiceClient = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$azure$2f$storage$2d$blob$2f$dist$2f$esm$2f$BlobServiceClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BlobServiceClient"].fromConnectionString(connectionString);
    }
    async saveFile(file, originalFileName) {
        console.log('Starting file upload process to Azure Blob Storage...');
        // Validate file type
        const allowedTypes = [
            'pdf',
            'doc',
            'docx',
            'ppt',
            'pptx',
            'xls',
            'xlsx',
            'txt',
            'jpg',
            'jpeg',
            'png'
        ];
        const fileExt = this.getFileExtension(originalFileName).toLowerCase();
        if (!allowedTypes.includes(fileExt)) {
            throw new Error(`File type ${fileExt} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
        }
        // Validate file size (e.g., max 50MB)
        const maxSize = 50 * 1024 * 1024; // 50MB in bytes
        if (file.size > maxSize) {
            throw new Error(`File size exceeds maximum allowed size of ${maxSize} bytes`);
        }
        // Generate a unique filename to prevent conflicts
        const uniqueFileName = `${(0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["randomUUID"])()}.${fileExt}`;
        console.log('Generated unique filename:', uniqueFileName);
        // Convert File object to buffer
        const buffer = Buffer.from(await file.arrayBuffer());
        console.log('File converted to buffer, size:', buffer.length);
        // Basic security: scan file content for known malicious patterns
        await this.scanFileForMaliciousContent(buffer);
        console.log('File security scan completed');
        // Upload to Azure Blob Storage
        const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(uniqueFileName);
        const uploadOptions = {
            blobHTTPHeaders: {
                blobContentType: file.type || this.getMimeTypeFromExtension(fileExt)
            }
        };
        const uploadBlobResponse = await blockBlobClient.uploadData(buffer, uploadOptions);
        console.log('Upload result:', uploadBlobResponse.requestId);
        // Extract basic metadata from the file
        const metadata = {
            originalName: originalFileName,
            size: file.size,
            type: file.type,
            extension: fileExt,
            uploadedAt: new Date(),
            lastModified: file.lastModified ? new Date(file.lastModified) : new Date(),
            hash: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["createHash"])('sha256').update(buffer).digest('hex')
        };
        // Return both the URL and metadata, including the blob name
        return {
            url: blockBlobClient.url,
            blobName: uniqueFileName,
            metadata
        };
    }
    async deleteFile(fileUrl) {
        try {
            console.log('Deleting file:', fileUrl);
            const fileName = this.getFileNameFromUrl(fileUrl);
            console.log('Extracted filename:', fileName);
            const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
            const blockBlobClient = containerClient.getBlockBlobClient(fileName);
            const deleteResponse = await blockBlobClient.delete();
            console.log('Delete result:', deleteResponse.requestId);
            return true;
        } catch (error) {
            console.error('Error deleting file:', error);
            return false;
        }
    }
    async getFileUrl(fileName, containerName = 'repository-files') {
        console.log('Getting file URL for:', {
            fileName,
            containerName
        });
        const containerClient = this.blobServiceClient.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(fileName);
        // Generate a time-limited SAS URL for secure access
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1); // URL expires in 1 hour
        // Get the account name from the connection string for SAS generation
        const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
        if (!accountName) {
            throw new Error('Azure Storage account name is not configured');
        }
        // Create SAS permissions object properly
        const permissions = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$azure$2f$storage$2d$blob$2f$dist$2f$esm$2f$sas$2f$BlobSASPermissions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BlobSASPermissions"]();
        permissions.read = true;
        const sasOptions = {
            containerName: containerName,
            blobName: fileName,
            permissions: permissions,
            expiresOn: expiryDate
        };
        // Get the account key for SAS generation
        const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
        if (!connectionString) {
            throw new Error('Azure Storage connection string is not configured');
        }
        // Extract account key from connection string
        const accountKeyMatch = connectionString.match(/AccountKey=([^;]+)/);
        if (!accountKeyMatch) {
            throw new Error('Account key not found in connection string');
        }
        const accountKey = accountKeyMatch[1];
        // Create a StorageSharedKeyCredential for SAS generation
        const { StorageSharedKeyCredential } = await __turbopack_context__.A("[project]/node_modules/@azure/storage-blob/dist/esm/index.js [app-route] (ecmascript, async loader)");
        const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
        const sasToken = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$azure$2f$storage$2d$blob$2f$dist$2f$esm$2f$sas$2f$BlobSASSignatureValues$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateBlobSASQueryParameters"])(sasOptions, sharedKeyCredential);
        return `${blockBlobClient.url}?${sasToken}`;
    }
    async validateAndExtractMetadata(file, originalFileName) {
        // Validate file type
        const allowedTypes = [
            'pdf',
            'doc',
            'docx',
            'ppt',
            'pptx',
            'xls',
            'xlsx',
            'txt',
            'jpg',
            'jpeg',
            'png'
        ];
        const fileExt = this.getFileExtension(originalFileName).toLowerCase();
        if (!allowedTypes.includes(fileExt)) {
            throw new Error(`File type ${fileExt} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
        }
        // Validate file size (e.g., max 50MB)
        const maxSize = 50 * 1024 * 1024; // 50MB in bytes
        if (file.size > maxSize) {
            throw new Error(`File size exceeds maximum allowed size of ${maxSize} bytes`);
        }
        // Extract metadata from the file
        const metadata = {
            originalName: originalFileName,
            size: file.size,
            type: file.type,
            extension: fileExt,
            uploadedAt: new Date(),
            lastModified: file.lastModified ? new Date(file.lastModified) : new Date()
        };
        return metadata;
    }
    async scanFileForMaliciousContent(buffer) {
        // Basic security check: scan for known malicious patterns in file content
        const maliciousPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
            /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
            /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
            /<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi,
            /javascript:/gi,
            /vbscript:/gi,
            /onload=/gi,
            /onerror=/gi,
            /onmouseover=/gi,
            /onfocus=/gi
        ];
        const fileContent = buffer.toString('utf-8');
        for (const pattern of maliciousPatterns){
            if (pattern.test(fileContent)) {
                throw new Error('File contains potentially malicious content');
            }
        }
    }
    getFileExtension(fileName) {
        return fileName.split('.').pop() || '';
    }
    getFileNameFromUrl(fileUrl) {
        // Remove query parameters first (e.g., SAS tokens)
        const urlWithoutParams = fileUrl.split('?')[0];
        return urlWithoutParams.split('/').pop() || '';
    }
    getMimeTypeFromExtension(extension) {
        const mimeTypes = {
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'ppt': 'application/vnd.ms-powerpoint',
            'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'xls': 'application/vnd.ms-excel',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'txt': 'text/plain',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png'
        };
        return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
    }
}
const __TURBOPACK__default__export__ = new FileStorageService();
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/http2 [external] (http2, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http2", () => require("http2"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[project]/lib/services/colivara-error-handler.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ColivaraError",
    ()=>ColivaraError,
    "ColivaraErrorHandler",
    ()=>ColivaraErrorHandler,
    "ColivaraErrorType",
    ()=>ColivaraErrorType,
    "colivaraErrorHandler",
    ()=>colivaraErrorHandler
]);
var ColivaraErrorType = /*#__PURE__*/ function(ColivaraErrorType) {
    ColivaraErrorType["API_UNAVAILABLE"] = "API_UNAVAILABLE";
    ColivaraErrorType["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
    ColivaraErrorType["AUTHENTICATION_FAILED"] = "AUTHENTICATION_FAILED";
    ColivaraErrorType["PROCESSING_FAILED"] = "PROCESSING_FAILED";
    ColivaraErrorType["TIMEOUT"] = "TIMEOUT";
    ColivaraErrorType["INVALID_RESPONSE"] = "INVALID_RESPONSE";
    ColivaraErrorType["NETWORK_ERROR"] = "NETWORK_ERROR";
    ColivaraErrorType["DOCUMENT_NOT_FOUND"] = "DOCUMENT_NOT_FOUND";
    return ColivaraErrorType;
}({});
class ColivaraError extends Error {
    type;
    originalError;
    status;
    constructor(type, message, originalError, status){
        super(message), this.type = type, this.originalError = originalError, this.status = status;
        this.name = 'ColivaraError';
    }
}
class ColivaraErrorHandler {
    static instance;
    circuitBreakerOpen = false;
    lastFailureTime = null;
    failureCount = 0;
    maxFailures = 5;
    resetTimeout = 300000;
    constructor(){}
    static getInstance() {
        if (!ColivaraErrorHandler.instance) {
            ColivaraErrorHandler.instance = new ColivaraErrorHandler();
        }
        return ColivaraErrorHandler.instance;
    }
    async handleColivaraOperation(operation, options = {}) {
        const { maxRetries = 3, retryDelay = 1000, fallbackToTraditional = true, timeout = 30000 } = options;
        // Check circuit breaker status
        if (this.isCircuitBreakerOpen()) {
            if (fallbackToTraditional) {
                console.warn('Circuit breaker is open, using fallback to traditional processing');
                return {
                    result: null,
                    error: new ColivaraError("API_UNAVAILABLE", 'Service temporarily unavailable'),
                    fallbackUsed: true
                };
            } else {
                throw new ColivaraError("API_UNAVAILABLE", 'Service temporarily unavailable due to circuit breaker');
            }
        }
        let lastError;
        for(let attempt = 0; attempt <= maxRetries; attempt++){
            try {
                // Add timeout to the operation
                const result = await this.withTimeout(operation(), timeout);
                this.resetCircuitBreaker(); // Reset on success
                return {
                    result,
                    error: undefined,
                    fallbackUsed: false
                };
            } catch (error) {
                lastError = this.convertErrorToColivaraError(error);
                // Log the error
                console.error(`Colivara operation failed on attempt ${attempt + 1}:`, lastError);
                // Check if this is a permanent error that shouldn't be retried
                if (lastError && this.isPermanentError(lastError)) {
                    break;
                }
                // Update circuit breaker on failure
                this.updateCircuitBreaker();
                // If this isn't the last attempt, wait before retrying
                if (attempt < maxRetries) {
                    await this.delay(retryDelay * Math.pow(2, attempt)); // Exponential backoff
                }
            }
        }
        // If we've exhausted retries and fallback is enabled
        if (fallbackToTraditional) {
            console.warn('Using fallback after Colivara operation failed:', lastError?.message);
            return {
                result: null,
                error: lastError,
                fallbackUsed: true
            };
        }
        // If fallback is not enabled, throw the last error
        throw lastError;
    }
    async withTimeout(promise, timeoutMs) {
        return Promise.race([
            promise,
            new Promise((_, reject)=>{
                setTimeout(()=>{
                    reject(new ColivaraError("TIMEOUT", `Operation timed out after ${timeoutMs}ms`));
                }, timeoutMs);
            })
        ]);
    }
    convertErrorToColivaraError(error) {
        if (error instanceof ColivaraError) {
            return error;
        }
        // Check for specific error types
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            return new ColivaraError("NETWORK_ERROR", 'Network connection failed', error);
        }
        if (error.status === 429) {
            return new ColivaraError("RATE_LIMIT_EXCEEDED", 'Rate limit exceeded', error, error.status);
        }
        if (error.status === 401 || error.status === 403) {
            return new ColivaraError("AUTHENTICATION_FAILED", 'Authentication failed', error, error.status);
        }
        if (error.status === 404) {
            return new ColivaraError("DOCUMENT_NOT_FOUND", 'Document not found in Colivara collections', error, error.status);
        }
        if (error.status >= 500) {
            return new ColivaraError("API_UNAVAILABLE", 'API temporarily unavailable', error, error.status);
        }
        if (error.name === 'TimeoutError') {
            return new ColivaraError("TIMEOUT", error.message, error);
        }
        // Default to processing failed
        return new ColivaraError("PROCESSING_FAILED", error.message || 'Processing failed', error);
    }
    isPermanentError(error) {
        // These errors should not be retried
        return [
            "AUTHENTICATION_FAILED",
            "INVALID_RESPONSE",
            "DOCUMENT_NOT_FOUND"
        ].includes(error.type);
    }
    isCircuitBreakerOpen() {
        if (!this.circuitBreakerOpen) {
            return false;
        }
        // Check if enough time has passed to close the circuit
        if (this.lastFailureTime && new Date().getTime() - this.lastFailureTime.getTime() > this.resetTimeout) {
            this.circuitBreakerOpen = false;
            this.failureCount = 0;
            return false;
        }
        return true;
    }
    updateCircuitBreaker() {
        this.failureCount++;
        this.lastFailureTime = new Date();
        if (this.failureCount >= this.maxFailures) {
            this.circuitBreakerOpen = true;
            console.warn('Circuit breaker opened due to too many failures');
        }
    }
    resetCircuitBreaker() {
        this.circuitBreakerOpen = false;
        this.failureCount = 0;
        this.lastFailureTime = null;
    }
    delay(ms) {
        return new Promise((resolve)=>setTimeout(resolve, ms));
    }
    // Method to check service health
    async checkServiceHealth(service) {
        try {
            return await service.validateApiKey();
        } catch (error) {
            console.error('Colivara service health check failed:', error);
            return false;
        }
    }
    // Method to handle graceful degradation
    async handleGracefulDegradation(colivaraOperation, fallbackOperation, options = {}) {
        const { result, error, fallbackUsed } = await this.handleColivaraOperation(colivaraOperation, {
            ...options,
            fallbackToTraditional: true
        });
        if (fallbackUsed && result === null) {
            // Use fallback operation
            try {
                const fallbackResult = await fallbackOperation();
                return {
                    result: fallbackResult,
                    degraded: true,
                    error
                };
            } catch (fallbackError) {
                console.error('Fallback operation also failed:', fallbackError);
                throw new ColivaraError("PROCESSING_FAILED", 'Both primary and fallback operations failed', fallbackError);
            }
        }
        if (result !== null) {
            return {
                result,
                degraded: false
            };
        }
        throw new ColivaraError("PROCESSING_FAILED", 'Operation failed', error);
    }
}
const colivaraErrorHandler = ColivaraErrorHandler.getInstance();
}),
"[project]/lib/services/colivara-service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$colivara$2d$ts$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/colivara-ts/dist/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$colivara$2d$error$2d$handler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/services/colivara-error-handler.ts [app-route] (ecmascript)");
;
;
;
class ColivaraError extends Error {
    code;
    status;
    constructor(message, code, status){
        super(message), this.code = code, this.status = status;
        this.name = 'ColivaraError';
    }
}
class ColivaraApiError extends ColivaraError {
    response;
    constructor(message, response){
        super(message, 'API_ERROR', response?.status), this.response = response;
        this.name = 'ColivaraApiError';
    }
}
class ColivaraProcessingError extends ColivaraError {
    documentId;
    constructor(message, documentId){
        super(message, 'PROCESSING_ERROR'), this.documentId = documentId;
        this.name = 'ColivaraProcessingError';
    }
}
class ColivaraService {
    client;
    config;
    isInitialized;
    defaultCollection = 'lspu-kmis-documents';
    constructor(config){
        this.config = this.mergeConfig(config);
        this.client = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$colivara$2d$ts$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ColiVara"](this.config.apiKey);
        this.isInitialized = false;
    }
    mergeConfig(userConfig) {
        return {
            apiKey: process.env.COLIVARA_API_KEY || userConfig?.apiKey || '',
            processingTimeout: userConfig?.processingTimeout || 300000,
            maxFileSize: userConfig?.maxFileSize || 52428800,
            retryAttempts: userConfig?.retryAttempts || 3,
            batchSize: userConfig?.batchSize || 10,
            cacheEnabled: userConfig?.cacheEnabled ?? true,
            cacheTtl: userConfig?.cacheTtl || 3600000,
            defaultCollection: userConfig?.defaultCollection || 'lspu-kmis-documents'
        };
    }
    async initialize() {
        try {
            // Validate API key by checking health
            await this.validateApiKey();
            // Ensure the default collection exists
            await this.ensureDefaultCollection();
            this.isInitialized = true;
            console.log('Colivara service initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Colivara service:', error);
            throw error;
        }
    }
    async validateApiKey() {
        try {
            // Test connectivity to Colivara service using the health check
            if (typeof this.client.checkHealth !== 'function') {
                throw new ColivaraApiError('Colivara client does not have a checkHealth method');
            }
            await this.client.checkHealth();
            return true;
        } catch (error) {
            console.error('API key validation failed:', error);
            throw __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$colivara$2d$error$2d$handler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["colivaraErrorHandler"].convertErrorToColivaraError(error);
        }
    }
    async ensureDefaultCollection() {
        try {
            // Try to get the collection first
            if (typeof this.client.getCollection !== 'function') {
                throw new ColivaraApiError('Colivara client does not have a getCollection method');
            }
            try {
                await this.client.getCollection({
                    collection_name: this.config.defaultCollection
                });
                console.log(`Collection '${this.config.defaultCollection}' already exists`);
            } catch (error) {
                // Check if the error is because the method doesn't exist or collection doesn't exist
                if (error instanceof TypeError || error instanceof Error && error.message.includes('method')) {
                    throw error; // Re-throw if it's a method not found error
                }
                // If collection doesn't exist, create it
                console.log(`Creating collection '${this.config.defaultCollection}'`);
                if (typeof this.client.createCollection !== 'function') {
                    throw new ColivaraApiError('Colivara client does not have a createCollection method');
                }
                await this.client.createCollection({
                    name: this.config.defaultCollection,
                    metadata: {
                        description: 'Default collection for LSPU KMIS documents',
                        created_at: new Date().toISOString()
                    }
                });
                console.log(`Collection '${this.config.defaultCollection}' created successfully`);
            }
        } catch (error) {
            console.error(`Failed to ensure default collection exists:`, error);
            throw error;
        }
    }
    async uploadDocument(fileUrl, documentId, metadata, base64Content) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }
            // Update document status to PROCESSING using raw SQL since Prisma client hasn't been updated
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].$executeRaw`
        UPDATE documents
        SET "colivaraProcessingStatus" = 'PROCESSING', "colivaraChecksum" = ${metadata.hash}
        WHERE id = ${documentId}
      `;
            // Check if the upsertDocument method exists
            if (typeof this.client.upsertDocument !== 'function') {
                throw new ColivaraApiError('Colivara client does not have an upsertDocument method');
            }
            // Validate document metadata before upload
            if (!documentId || typeof documentId !== 'string') {
                throw new ColivaraApiError('Invalid document ID provided for upload');
            }
            // Validate document name
            const documentName = `${documentId}_${metadata.originalName}`;
            if (!documentName || documentName.length > 255) {
                throw new ColivaraApiError('Document name is invalid or too long');
            }
            // Validate collection name
            if (!this.config.defaultCollection || typeof this.config.defaultCollection !== 'string') {
                throw new ColivaraApiError('Invalid collection name provided');
            }
            // Prepare upload parameters
            const uploadParams = {
                name: documentName,
                collection_name: this.config.defaultCollection,
                metadata: {
                    documentId,
                    title: metadata.originalName,
                    ...metadata
                },
                wait: false // Don't wait for processing to complete, we'll check status separately
            };
            // If base64 content is provided, use it instead of the URL
            if (base64Content) {
                console.log('Uploading document with base64 content:', {
                    name: documentName,
                    collection_name: this.config.defaultCollection,
                    metadata: {
                        documentId,
                        ...metadata
                    }
                });
                uploadParams.document_base64 = base64Content; // Use document_base64 instead of content for Colivara API
            } else {
                // If no base64 content provided, use the URL (fallback for backward compatibility)
                if (!fileUrl || typeof fileUrl !== 'string') {
                    throw new ColivaraApiError('Invalid file URL provided for upload');
                }
                console.log('Uploading document with URL:', {
                    name: documentName,
                    collection_name: this.config.defaultCollection,
                    document_url: fileUrl,
                    metadata: {
                        documentId,
                        ...metadata
                    }
                });
                uploadParams.document_url = fileUrl;
            }
            const response = await this.client.upsertDocument(uploadParams);
            console.log('Upload response received:', response);
            // Extract document ID from response - adjust based on actual API response structure
            // Ensure we return a string value, not the entire response object
            const responseObj = response;
            const documentIdFromResponse = responseObj.id || responseObj.documentId || responseObj.name || (typeof response === 'string' ? response : documentName);
            if (!documentIdFromResponse) {
                throw new ColivaraApiError('Invalid response from upsertDocument - no document ID returned');
            }
            // Validate that the document ID is a proper string
            if (typeof documentIdFromResponse !== 'string' || documentIdFromResponse === '[object Object]') {
                throw new ColivaraApiError(`Invalid document ID returned from API: ${typeof documentIdFromResponse}`);
            }
            // Store the Colivara document ID using raw SQL
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].$executeRaw`
        UPDATE documents
        SET "colivaraDocumentId" = ${documentIdFromResponse}
        WHERE id = ${documentId}
      `;
            return documentIdFromResponse;
        } catch (error) {
            console.error(`Failed to upload document ${documentId} to Colivara:`, error);
            // Update document status to FAILED using raw SQL
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].$executeRaw`
        UPDATE documents
        SET "colivaraProcessingStatus" = 'FAILED', "colivaraMetadata" = ${JSON.stringify({
                error: error instanceof Error ? error.message : 'Unknown error'
            })}::jsonb
        WHERE id = ${documentId}
      `;
            if (error instanceof ColivaraError) {
                throw error;
            }
            throw new ColivaraProcessingError(`Failed to upload document to Colivara: ${error instanceof Error ? error.message : 'Unknown error'}`, documentId);
        }
    }
    async checkProcessingStatus(colivaraDocumentId) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }
            // Validate that colivaraDocumentId is actually a string, not an object
            if (typeof colivaraDocumentId !== 'string' || colivaraDocumentId === '[object Object]' || !colivaraDocumentId) {
                throw new ColivaraApiError('Invalid document ID provided to checkProcessingStatus');
            }
            console.log(`Checking processing status for document ID: ${colivaraDocumentId}`);
            if (typeof this.client.getDocument !== 'function') {
                throw new ColivaraApiError('Colivara client does not have a getDocument method');
            }
            const response = await this.client.getDocument({
                document_name: colivaraDocumentId,
                collection_name: this.config.defaultCollection // Include collection name in the request
            });
            console.log(`Processing status response for ${colivaraDocumentId}:`, response);
            // Handle the response based on the actual ColiVara API response structure
            // Since we don't have exact type information, we'll access fields safely
            return {
                status: response.status || 'PENDING',
                progress: response.progress || 0,
                error: response.error,
                processedAt: response.processedAt ? new Date(response.processedAt) : undefined,
                num_pages: response.num_pages || response.pages || response.page_count || 0
            };
        } catch (error) {
            console.error(`Failed to check processing status for ${colivaraDocumentId}:`, error);
            // Convert error to ColivaraError to check if it's a 404
            const colivaraError = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$colivara$2d$error$2d$handler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["colivaraErrorHandler"].convertErrorToColivaraError(error);
            // If it's a document not found error, return appropriate status
            if (colivaraError.type === __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$colivara$2d$error$2d$handler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ColivaraErrorType"].DOCUMENT_NOT_FOUND) {
                console.warn(`Document ${colivaraDocumentId} not found in Colivara collections`);
                return {
                    status: 'FAILED',
                    error: `Document not found in Colivara: ${colivaraError.message}`,
                    processedAt: new Date()
                };
            }
            // For other errors, log them and re-throw
            console.error(`Error checking processing status for ${colivaraDocumentId}:`, colivaraError);
            throw colivaraError;
        }
    }
    async waitForProcessing(colivaraDocumentId, maxWaitTime = 3000) {
        const startTime = Date.now();
        const checkInterval = 5000; // Check every 5 seconds
        // Add a 2-second delay before starting the status check loop
        await new Promise((resolve)=>setTimeout(resolve, 2000));
        console.log(`Waiting 2 seconds before starting status check for document: ${colivaraDocumentId}`);
        while(Date.now() - startTime < maxWaitTime){
            try {
                const status = await this.checkProcessingStatus(colivaraDocumentId);
                if (status.status === 'COMPLETED' || status.num_pages !== undefined && status.num_pages > 0) {
                    return true;
                } else if (status.status === 'FAILED') {
                    console.error(`Document processing failed for ${colivaraDocumentId}: ${status.error}`);
                    return false;
                }
                // Wait before next check
                await new Promise((resolve)=>setTimeout(resolve, checkInterval));
            } catch (error) {
                console.error(`Error checking processing status for ${colivaraDocumentId}:`, error);
                // If the error is due to document not being found, return false immediately
                if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$colivara$2d$error$2d$handler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ColivaraError"] && error.type === __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$colivara$2d$error$2d$handler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ColivaraErrorType"].DOCUMENT_NOT_FOUND) {
                    console.error(`Document ${colivaraDocumentId} not found in Colivara, failing immediately`);
                    return false;
                }
                return false;
            }
        }
        console.warn(`Processing timeout for ${colivaraDocumentId} after ${maxWaitTime}ms`);
        return false;
    }
    async performSemanticSearch(query, filters, userId) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }
            const startTime = Date.now();
            let response;
            // Check if the search method exists on the client
            if (typeof this.client.search !== 'function') {
                console.warn('Colivara client does not have a search method, falling back to traditional search');
                return {
                    results: [],
                    total: 0,
                    query,
                    processingTime: 0
                };
            }
            try {
                response = await this.client.search({
                    query,
                    collection_name: this.config.defaultCollection,
                    top_k: 10 // Return top 10 results
                });
            } catch (error) {
                console.error('Colivara search API call failed:', error);
                // Return empty results but don't throw, let the fallback mechanism handle it
                return {
                    results: [],
                    total: 0,
                    query,
                    processingTime: 0
                };
            }
            const processingTime = Date.now() - startTime;
            // Format results to match our expected structure
            const results = response.results.map((item)=>{
                // Extract the original document ID from multiple possible locations
                let originalDocumentId = item.metadata?.documentId || item.document && item.document.metadata?.documentId || item.metadata?.id || item.id;
                // If still not found, try to extract from document_metadata in the document object
                if (!originalDocumentId && item.document && item.document_metadata) {
                    originalDocumentId = item.document.document_metadata.documentId;
                }
                // If still not found, try to extract directly from document_metadata property
                if (!originalDocumentId && item.document_metadata) {
                    originalDocumentId = item.document_metadata.documentId;
                }
                // If still not found, try to extract from the document name (which contains the document ID)
                if (!originalDocumentId && item.document?.document_name) {
                    // Extract document ID from document_name which is in format "docId_originalName.ext"
                    const nameParts = item.document.document_name.split('_');
                    if (nameParts.length >= 1) {
                        originalDocumentId = nameParts[0];
                    }
                }
                // Extract score - prioritize similarity/prob over confidence since those are more likely to be the actual relevance scores
                const score = item.score || item.similarity || item.prob || item.confidence || 0;
                return {
                    documentId: originalDocumentId,
                    title: item.metadata?.title || item.title || item.metadata?.originalName || item.name || 'Untitled Document',
                    content: item.content || item.text || item.metadata?.content || '',
                    score: score,
                    pageNumbers: item.page_numbers || item.pageNumbers || item.pages || [
                        item.document?.page_number
                    ] || [],
                    documentSection: item.section || item.documentSection || item.metadata?.section || '',
                    confidenceScore: score,
                    snippet: item.snippet || item.content?.substring(0, 200) + '...' || item.text?.substring(0, 200) + '...' || item.metadata?.content?.substring(0, 200) + '...' || '',
                    document: item.document || item.metadata?.document || item || {},
                    visualContent: item.visualContent || item.image || item.image_data || undefined,
                    extractedText: item.extractedText || item.text || item.content || undefined
                };
            });
            return {
                results,
                total: results.length,
                query,
                processingTime
            };
        } catch (error) {
            console.error('Semantic search failed:', error);
            // Return an empty result set in case of error
            return {
                results: [],
                total: 0,
                query,
                processingTime: 0
            };
        }
    }
    async performHybridSearch(query, filters, userId) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }
            // Perform semantic search with Colivara
            const semanticResults = await this.performSemanticSearch(query, filters, userId);
            // Perform traditional database search
            const traditionalResults = await this.performTraditionalSearch(query, filters, userId);
            // Combine and rank results
            const combinedResults = this.combineSearchResults(semanticResults, traditionalResults);
            return {
                results: combinedResults,
                total: combinedResults.length,
                query,
                processingTime: semanticResults.processingTime + traditionalResults.processingTime || 0
            };
        } catch (error) {
            console.error('Hybrid search failed:', error);
            // Fallback to traditional search only
            return await this.performTraditionalSearch(query, filters, userId);
        }
    }
    async performTraditionalSearch(query, filters, userId) {
        // This would use the existing search functionality from enhanced-document-service
        // For now, we'll implement a basic version
        const documents = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].document.findMany({
            where: {
                AND: [
                    {
                        OR: [
                            {
                                title: {
                                    contains: query,
                                    mode: 'insensitive'
                                }
                            },
                            {
                                description: {
                                    contains: query,
                                    mode: 'insensitive'
                                }
                            },
                            {
                                tags: {
                                    path: [
                                        '$[*]'
                                    ],
                                    string_contains: query
                                }
                            }
                        ]
                    },
                    filters?.unitId ? {
                        unitId: filters.unitId
                    } : {},
                    filters?.category ? {
                        category: filters.category
                    } : {}
                ],
                status: 'ACTIVE'
            },
            include: {
                uploadedByUser: true,
                documentUnit: true
            },
            take: 50
        });
        const results = documents.map((doc)=>({
                documentId: doc.id,
                title: doc.title,
                content: doc.description,
                score: 0.5,
                pageNumbers: [],
                documentSection: 'description',
                confidenceScore: 0.5,
                snippet: doc.description.substring(0, 200) + '...',
                document: {
                    ...doc,
                    tags: Array.isArray(doc.tags) ? doc.tags : [],
                    uploadedBy: doc.uploadedByUser?.name || doc.uploadedBy,
                    unit: doc.documentUnit ? {
                        id: doc.documentUnit.id,
                        name: doc.documentUnit.name,
                        code: doc.documentUnit.code,
                        description: doc.documentUnit.description || undefined,
                        createdAt: doc.documentUnit.createdAt,
                        updatedAt: doc.documentUnit.updatedAt
                    } : undefined,
                    uploadedAt: new Date(doc.uploadedAt),
                    createdAt: new Date(doc.createdAt),
                    updatedAt: new Date(doc.updatedAt),
                    // Colivara fields (for consistency)
                    colivaraDocumentId: doc.colivaraDocumentId ?? undefined,
                    colivaraProcessingStatus: doc.colivaraProcessingStatus ?? undefined,
                    colivaraProcessedAt: doc.colivaraProcessedAt ? new Date(doc.colivaraProcessedAt) : undefined,
                    colivaraChecksum: doc.colivaraChecksum ?? undefined
                }
            }));
        return {
            results,
            total: results.length,
            query,
            processingTime: 0
        };
    }
    combineSearchResults(semanticResults, traditionalResults) {
        // This is a simplified combination - in a real implementation, we would have more sophisticated ranking
        const combined = [
            ...semanticResults.results
        ];
        // Add traditional results that aren't already in semantic results
        for (const tradResult of traditionalResults.results){
            // Check if document already exists in combined results using documentId field
            const exists = combined.some((semResult)=>{
                const semDocId = semResult.documentId;
                const tradDocId = tradResult.documentId;
                return semDocId && tradDocId && semDocId === tradDocId;
            });
            if (!exists) {
                combined.push(tradResult);
            }
        }
        // Sort by score (or some combination of scores)
        return combined.sort((a, b)=>(b.score || 0) - (a.score || 0));
    }
    async indexDocument(documentId, base64Content) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }
            // Get document from database
            const document = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].document.findUnique({
                where: {
                    id: documentId
                },
                include: {
                    uploadedByUser: true,
                    documentUnit: true
                }
            });
            if (!document) {
                throw new ColivaraProcessingError(`Document not found: ${documentId}`, documentId);
            }
            // Update document status to PROCESSING using raw SQL
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].$executeRaw`
        UPDATE documents
        SET "colivaraProcessingStatus" = 'PROCESSING'
        WHERE id = ${documentId}
      `;
            // Upload document to Colivara for processing
            const colivaraDocId = await this.uploadDocument(document.fileUrl, documentId, {
                originalName: document.fileName,
                size: document.fileSize,
                type: document.fileType,
                extension: document.fileName.split('.').pop() || '',
                uploadedAt: document.uploadedAt,
                lastModified: document.updatedAt,
                hash: document.colivaraChecksum || ''
            }, base64Content // Pass the base64 content if provided
            );
            console.log('Upload result from upsertDocument:', {
                colivaraDocId,
                documentId
            });
            // Start background processing without blocking
            this.waitForProcessingAndComplete(documentId, colivaraDocId);
            return true;
        } catch (error) {
            console.error(`Failed to index document ${documentId}:`, error);
            // Update document status to FAILED using raw SQL
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].$executeRaw`
        UPDATE documents
        SET "colivaraProcessingStatus" = 'FAILED'
        WHERE id = ${documentId}
      `;
            return false;
        }
    }
    async waitForProcessingAndComplete(documentId, colivaraDocId) {
        try {
            // Wait for processing to complete
            const completed = await this.waitForProcessing(colivaraDocId, this.config.processingTimeout);
            if (completed) {
                // Update document with Colivara results using raw SQL
                await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].$executeRaw`
          UPDATE documents
          SET "colivaraDocumentId" = ${colivaraDocId},
              "colivaraProcessingStatus" = 'COMPLETED',
              "colivaraProcessedAt" = ${new Date()}::timestamp
          WHERE id = ${documentId}
        `;
                // Extract and store the processed content in ColivaraIndex
                await this.storeProcessedContent(documentId, colivaraDocId);
            } else {
                // Handle timeout or failure
                await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].$executeRaw`
          UPDATE documents
          SET "colivaraProcessingStatus" = 'FAILED'
          WHERE id = ${documentId}
        `;
            }
        } catch (error) {
            console.error(`Error completing processing for document ${documentId}:`, error);
            // Update document status to FAILED using raw SQL
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].$executeRaw`
        UPDATE documents
        SET "colivaraProcessingStatus" = 'FAILED'
        WHERE id = ${documentId}
      `;
        }
    }
    async storeProcessedContent(documentId, colivaraDocId) {
        try {
            // Get the processed content from Colivara
            // Note: The official API might not have a direct content endpoint
            // We'll need to implement this based on what the actual API provides
            console.log(`Storing processed content for document ${documentId} with Colivara ID ${colivaraDocId}`);
        // For now, we'll just log this operation
        // The actual implementation would depend on what data the Colivara API returns
        // after document processing is complete
        } catch (error) {
            console.error(`Failed to store processed content for document ${documentId}:`, error);
            throw error;
        }
    }
    async updateIndex(documentId, base64Content) {
        try {
            // Get the current document to check if it has changed
            const document = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].document.findUnique({
                where: {
                    id: documentId
                }
            });
            if (!document) {
                return false;
            }
            // Check if we need to reprocess (e.g., if file has changed)
            // For now, we'll just reprocess - we'll need to implement proper change detection
            // once the Prisma client is updated with new fields
            if (document.colivaraProcessingStatus === 'COMPLETED' && document.colivaraChecksum) {
            // In a real implementation, we would check if the file has changed
            // For now, we'll just reprocess
            }
            return await this.indexDocument(documentId, base64Content);
        } catch (error) {
            console.error(`Failed to update index for document ${documentId}:`, error);
            return false;
        }
    }
    async deleteFromIndex(documentId) {
        try {
            // Get the document first to check if it has a Colivara document ID
            const document = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].document.findUnique({
                where: {
                    id: documentId
                }
            });
            // If document exists and has a Colivara document ID, delete from Colivara collection
            if (document && document.colivaraDocumentId) {
                try {
                    // Delete from Colivara collection using the official API
                    await this.client.deleteDocument({
                        document_name: document.colivaraDocumentId,
                        collection_name: this.config.defaultCollection
                    });
                    console.log(`Successfully deleted document ${documentId} (${document.colivaraDocumentId}) from Colivara collection`);
                } catch (colivaraError) {
                    // Log the error but continue with database cleanup
                    console.error(`Failed to delete document ${documentId} from Colivara collection:`, colivaraError);
                    // Check if it's a "document not found" error, which is acceptable
                    const colivaraServiceError = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$colivara$2d$error$2d$handler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["colivaraErrorHandler"].convertErrorToColivaraError(colivaraError);
                    if (colivaraServiceError.type !== __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$colivara$2d$error$2d$handler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ColivaraErrorType"].DOCUMENT_NOT_FOUND) {
                        // For other errors, log but continue with database cleanup
                        console.warn(`Non-critical error deleting document from Colivara collection, proceeding with database cleanup:`, colivaraError);
                    }
                }
            }
            // Delete all index entries for this document using raw SQL
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].$executeRaw`
        DELETE FROM colivara_indexes WHERE "documentId" = ${documentId}
      `;
            // Update document to reset Colivara fields using raw SQL
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].$executeRaw`
        UPDATE documents
        SET "colivaraDocumentId" = NULL,
            "colivaraEmbeddings" = NULL,
            "colivaraMetadata" = NULL,
            "colivaraProcessingStatus" = NULL,
            "colivaraProcessedAt" = NULL,
            "colivaraChecksum" = NULL
        WHERE id = ${documentId}
      `;
            return true;
        } catch (error) {
            console.error(`Failed to delete document ${documentId} from index:`, error);
            return false;
        }
    }
    async extractDocumentMetadata(colivaraDocumentId) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }
            // Validate that colivaraDocumentId is actually a string, not an object
            if (typeof colivaraDocumentId !== 'string' || colivaraDocumentId === '[object Object]') {
                throw new ColivaraApiError('Invalid document ID provided to extractDocumentMetadata');
            }
            if (typeof this.client.getDocument !== 'function') {
                throw new ColivaraApiError('Colivara client does not have a getDocument method');
            }
            const response = await this.client.getDocument({
                document_name: colivaraDocumentId,
                collection_name: this.config.defaultCollection // Include collection name in the request
            });
            return response.metadata || response;
        } catch (error) {
            console.error(`Failed to extract metadata for ${colivaraDocumentId}:`, error);
            throw error;
        }
    }
    async processNewDocument(document, fileUrl, base64Content) {
        // This method processes a newly uploaded document
        // It will be called after a document is successfully uploaded to the system
        // Processing happens in the background without blocking the upload response
        this.processNewDocumentAsync(document, fileUrl, base64Content);
    }
    async processNewDocumentAsync(document, fileUrl, base64Content) {
        try {
            // The document should already be in the database with PENDING status
            // We just need to trigger the Colivara processing
            // Processing happens in the background without waiting for completion
            this.indexDocument(document.id, base64Content);
        } catch (error) {
            console.error(`Error starting processing for new document ${document.id}:`, error);
        }
    }
    async handleDocumentUpdate(documentId, updatedDocument, fileUrl, base64Content) {
        try {
            // Handle document updates
            // If the file has changed (fileUrl is provided), reprocess the document
            if (fileUrl) {
                // Use updateIndex which will call indexDocument with the base64 content if provided
                const success = await this.updateIndex(documentId, base64Content);
                if (!success) {
                    console.error(`Failed to reprocess updated document ${documentId} with Colivara`);
                }
            } else {
                // If only metadata changed, we might need to update the index differently
                // For now, just return
                return;
            }
        } catch (error) {
            console.error(`Error handling document update for ${documentId}:`, error);
        }
    }
    /**
   * Get visual content (screenshots/pages) from processed documents
   * @param colivaraDocumentId The document ID in Colivara
   * @param pageNumbers Specific pages to retrieve (optional, if not provided, returns all available)
   */ async getVisualContent(colivaraDocumentId, pageNumbers) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }
            // Validate that colivaraDocumentId is actually a string, not an object
            if (typeof colivaraDocumentId !== 'string' || colivaraDocumentId === '[object Object]') {
                throw new ColivaraApiError('Invalid document ID provided to getVisualContent');
            }
            console.log(`Getting visual content for document: ${colivaraDocumentId}, pages: ${pageNumbers || 'all'}`);
            // Check if the getDocumentPages method exists on the client
            if (typeof this.client.getDocumentPages !== 'function') {
                console.warn('Colivara client does not have a getDocumentPages method, returning empty array');
                return [];
            }
            const response = await this.client.getDocumentPages({
                document_name: colivaraDocumentId,
                collection_name: this.config.defaultCollection,
                page_numbers: pageNumbers
            });
            // Process the response to extract base64 images
            if (response && response.pages) {
                // If pages is an array of objects with image data
                if (Array.isArray(response.pages)) {
                    return response.pages.map((page)=>{
                        // Return base64 image data if available, otherwise return empty string
                        return page.image_data || page.image || page.base64 || '';
                    }).filter((img)=>img !== ''); // Filter out empty strings
                } else if (response.images && Array.isArray(response.images)) {
                    return response.images;
                }
            }
            return [];
        } catch (error) {
            console.error(`Failed to get visual content for ${colivaraDocumentId}:`, error);
            return [];
        }
    }
    /**
   * Get extracted text content from processed documents
   * @param colivaraDocumentId The document ID in Colivara
   * @param pageNumbers Specific pages to retrieve text from (optional, if not provided, returns all available)
   */ async getExtractedText(colivaraDocumentId, pageNumbers) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }
            // Validate that colivaraDocumentId is actually a string, not an object
            if (typeof colivaraDocumentId !== 'string' || colivaraDocumentId === '[object Object]') {
                throw new ColivaraApiError('Invalid document ID provided to getExtractedText');
            }
            console.log(`Getting extracted text for document: ${colivaraDocumentId}, pages: ${pageNumbers || 'all'}`);
            // Check if the getDocumentText method exists on the client
            if (typeof this.client.getDocumentText !== 'function') {
                console.warn('Colivara client does not have a getDocumentText method, returning empty string');
                return '';
            }
            const response = await this.client.getDocumentText({
                document_name: colivaraDocumentId,
                collection_name: this.config.defaultCollection,
                page_numbers: pageNumbers
            });
            // Return the extracted text content
            return response.text || response.content || response.extracted_text || '';
        } catch (error) {
            console.error(`Failed to get extracted text for ${colivaraDocumentId}:`, error);
            return '';
        }
    }
    /**
   * Enhanced search method that includes visual content and extracted text for multimodal processing
   */ async performEnhancedSearch(query, filters, userId) {
        try {
            // First, perform the standard semantic search
            const standardResults = await this.performSemanticSearch(query, filters, userId);
            // Instead of calling getVisualContent and getExtractedText which may trigger getDocumentPages errors,
            // we'll return the standard results which should already contain the content from the search response
            // This avoids the problematic API calls while still providing data for Gemini
            return standardResults;
        } catch (error) {
            console.error('Enhanced search failed:', error);
            // Fallback to standard search
            return await this.performSemanticSearch(query, filters, userId);
        }
    }
}
const __TURBOPACK__default__export__ = ColivaraService;
}),
"[project]/lib/services/document-service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$file$2d$storage$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/services/file-storage-service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$colivara$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/services/colivara-service.ts [app-route] (ecmascript)");
;
;
;
// Create a singleton instance of the Colivara service
const colivaraService = new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$colivara$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"]();
class DocumentService {
    /**
   * Helper method to find a user by database ID only
   */ async findUserById(userId) {
        // Find user by the provided userId (database ID)
        const user = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].user.findUnique({
            where: {
                id: userId
            }
        });
        if (!user) {
            return null;
        }
        // Transform the Prisma user to match the API type
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            unitId: user.unitId || undefined,
            avatar: user.avatar || undefined,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }
    /**
   * Get all documents with optional filtering and pagination
   */ async getDocuments(page = 1, limit = 10, category, search, userId, sort, order = 'desc', unitId// NEW: Unit filter
    ) {
        const skip = (page - 1) * limit;
        // Build where clause based on permissions and filters
        const whereClause = {
            status: 'ACTIVE'
        };
        // Add category filter if provided
        if (category && category !== 'all') {
            whereClause.category = category;
        }
        // Add unit filter if provided
        if (unitId) {
            whereClause.unitId = unitId;
        }
        // Add search filter if provided
        if (search) {
            const searchCondition = {
                OR: [
                    {
                        title: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    },
                    {
                        description: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    },
                    {
                        tags: {
                            array_contains: [
                                search
                            ]
                        }
                    }
                ]
            };
            // If we already have conditions (like category or unit), wrap everything in AND
            if (Object.keys(whereClause).length > 1) {
                whereClause.AND = whereClause.AND || [];
                whereClause.AND.push(searchCondition);
            } else {
                // If no other conditions exist, just add the search condition
                Object.assign(whereClause, searchCondition);
            }
        }
        // If user is not admin, only show documents they have access to
        if (userId) {
            const user = await this.findUserById(userId);
            if (user && user.role !== 'ADMIN' && user.role !== 'FACULTY') {
                // For non-admin and non-faculty users, we need to check document permissions
                const permissionCondition = {
                    OR: [
                        {
                            uploadedById: user.id
                        },
                        {
                            permissions: {
                                some: {
                                    userId: user.id,
                                    permission: {
                                        in: [
                                            'READ',
                                            'WRITE',
                                            'ADMIN'
                                        ]
                                    }
                                }
                            }
                        } // Documents with explicit permissions
                    ]
                };
                // If we already have conditions in whereClause, wrap everything in AND
                if (Object.keys(whereClause).length > 1) {
                    whereClause.AND = whereClause.AND || [];
                    whereClause.AND.push(permissionCondition);
                } else {
                    // If no other conditions exist, just add the permission condition
                    Object.assign(whereClause, permissionCondition);
                }
            }
        }
        try {
            const [documents, total] = await Promise.all([
                __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].document.findMany({
                    where: whereClause,
                    skip,
                    take: limit,
                    orderBy: sort ? {
                        [sort]: order
                    } : {
                        uploadedAt: 'desc'
                    },
                    include: {
                        uploadedByUser: true,
                        documentUnit: true
                    }
                }),
                __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].document.count({
                    where: whereClause
                })
            ]);
            return {
                documents: documents.map((doc)=>({
                        ...doc,
                        tags: Array.isArray(doc.tags) ? doc.tags : typeof doc.tags === 'object' && doc.tags !== null ? Object.values(doc.tags) : [],
                        unitId: doc.unitId ?? undefined,
                        versionNotes: doc.versionNotes ?? undefined,
                        downloadsCount: doc.downloadsCount ?? 0,
                        viewsCount: doc.viewsCount ?? 0,
                        uploadedBy: doc.uploadedByUser?.name || doc.uploadedBy,
                        unit: doc.documentUnit || undefined,
                        uploadedAt: new Date(doc.uploadedAt),
                        createdAt: new Date(doc.createdAt),
                        updatedAt: new Date(doc.updatedAt)
                    })),
                total
            };
        } catch (error) {
            console.error('Database connection error in getDocuments:', error);
            // Check if this is an authentication error
            if (error instanceof Error && (error.message.includes('Authentication failed') || error.message.includes('password') || error.message.includes('credentials'))) {
                throw new Error('Database authentication failed. Please check your database credentials.');
            }
            throw error; // Re-throw to be handled by the calling function
        }
    }
    /**
   * Get a specific document by ID
   */ async getDocumentById(id, userId) {
        try {
            // Validate the document ID format before querying the database
            if (!id || typeof id !== 'string' || id.trim() === '' || id.includes('undefined') || id.includes('.pdf') || id.includes('.')) {
                console.warn('Invalid document ID format received in getDocumentById:', id);
                return null;
            }
            const document = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].document.findUnique({
                where: {
                    id
                },
                include: {
                    uploadedByUser: true,
                    documentUnit: true
                }
            });
            if (!document) {
                return null;
            }
            // Check if user has access to the document
            if (userId) {
                const user = await this.findUserById(userId);
                if (user && user.role !== 'ADMIN' && user.role !== 'FACULTY') {
                    // Check if user has explicit permission for this document
                    const permission = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].documentPermission.findFirst({
                        where: {
                            documentId: id,
                            userId: user.id,
                            permission: {
                                in: [
                                    'READ',
                                    'WRITE',
                                    'ADMIN'
                                ]
                            }
                        }
                    });
                    // Allow access if user has explicit READ/WRITE/ADMIN permission OR if user uploaded the document
                    if (!permission && document.uploadedById !== user.id) {
                        return null; // User doesn't have access
                    }
                }
            }
            return {
                ...document,
                tags: Array.isArray(document.tags) ? document.tags.map((tag)=>String(tag)) : typeof document.tags === 'object' && document.tags !== null ? Object.values(document.tags).map((tag)=>String(tag)) : [],
                year: document.year ?? undefined,
                quarter: document.quarter ?? undefined,
                unitId: document.unitId || undefined,
                versionNotes: document.versionNotes || undefined,
                downloadsCount: document.downloadsCount || 0,
                viewsCount: document.viewsCount || 0,
                uploadedBy: document.uploadedByUser?.name || document.uploadedBy,
                status: document.status,
                unit: document.documentUnit && document.documentUnit.code ? {
                    id: document.documentUnit.id,
                    name: document.documentUnit.name,
                    code: document.documentUnit.code,
                    description: document.documentUnit.description || undefined,
                    createdAt: document.documentUnit.createdAt,
                    updatedAt: document.documentUnit.updatedAt
                } : undefined,
                uploadedAt: new Date(document.uploadedAt),
                createdAt: new Date(document.createdAt),
                updatedAt: new Date(document.updatedAt),
                colivaraDocumentId: document.colivaraDocumentId ?? undefined,
                colivaraProcessingStatus: document.colivaraProcessingStatus ?? undefined,
                colivaraProcessedAt: document.colivaraProcessedAt ? new Date(document.colivaraProcessedAt) : undefined,
                colivaraChecksum: document.colivaraChecksum ?? undefined
            };
        } catch (error) {
            console.error('Database connection error in getDocumentById:', error);
            // Check if this is an authentication error
            if (error instanceof Error && (error.message.includes('Authentication failed') || error.message.includes('password') || error.message.includes('credentials'))) {
                throw new Error('Database authentication failed. Please check your database credentials.');
            }
            throw error; // Re-throw to be handled by the calling function
        }
    }
    /**
   * Create a new document
   */ async createDocument(title, description, category, tags, uploadedBy, fileUrl, fileName, fileType, fileSize, userId, unitId// NEW: Unit assignment
    ) {
        try {
            console.log('Creating document in database...', {
                title,
                description,
                category,
                tags,
                uploadedBy,
                fileUrl,
                fileName,
                fileType,
                fileSize,
                userId
            });
            const user = await this.findUserById(userId);
            console.log('User lookup result:', {
                user: !!user,
                role: user?.role
            });
            if (!user || ![
                'ADMIN',
                'FACULTY'
            ].includes(user.role)) {
                throw new Error('Only admins and faculty can upload documents');
            }
            const document = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].document.create({
                data: {
                    title,
                    description,
                    category,
                    tags: tags || [],
                    uploadedBy: user.name,
                    uploadedById: user.id,
                    fileUrl,
                    fileName,
                    fileType,
                    fileSize,
                    unitId: unitId || undefined,
                    status: 'ACTIVE'
                },
                include: {
                    uploadedByUser: true,
                    documentUnit: true
                }
            });
            console.log('Document created:', document.id);
            // Grant the uploader full permissions
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].documentPermission.create({
                data: {
                    documentId: document.id,
                    userId: user.id,
                    permission: 'ADMIN'
                }
            });
            console.log('Document permissions granted');
            return {
                id: document.id,
                title: document.title,
                description: document.description,
                category: document.category,
                tags: Array.isArray(document.tags) ? document.tags.map((tag)=>String(tag)) : typeof document.tags === 'object' && document.tags !== null ? Object.values(document.tags).map((tag)=>String(tag)) : [],
                uploadedBy: document.uploadedByUser?.name || document.uploadedBy,
                uploadedById: document.uploadedById,
                uploadedAt: new Date(document.uploadedAt),
                fileUrl: document.fileUrl,
                fileName: document.fileName,
                fileType: document.fileType,
                fileSize: document.fileSize,
                downloadsCount: document.downloadsCount || 0,
                viewsCount: document.viewsCount || 0,
                version: document.version || 1,
                versionNotes: document.versionNotes || undefined,
                status: document.status,
                createdAt: new Date(document.createdAt),
                updatedAt: new Date(document.updatedAt),
                unitId: document.unitId || undefined,
                unit: document.documentUnit && document.documentUnit.code ? {
                    id: document.documentUnit.id,
                    name: document.documentUnit.name,
                    code: document.documentUnit.code,
                    description: document.documentUnit.description || undefined,
                    createdAt: document.documentUnit.createdAt,
                    updatedAt: document.documentUnit.updatedAt
                } : undefined,
                colivaraDocumentId: document.colivaraDocumentId ?? undefined,
                colivaraProcessingStatus: document.colivaraProcessingStatus ?? undefined,
                colivaraProcessedAt: document.colivaraProcessedAt ? new Date(document.colivaraProcessedAt) : undefined,
                colivaraChecksum: document.colivaraChecksum ?? undefined
            };
        } catch (error) {
            console.error('Database connection error in createDocument:', error);
            // Check if this is an authentication error
            if (error instanceof Error && (error.message.includes('Authentication failed') || error.message.includes('password') || error.message.includes('credentials'))) {
                throw new Error('Database authentication failed. Please check your database credentials.');
            }
            throw error; // Re-throw to be handled by the calling function
        }
    }
    /**
   * Update a document
   */ async updateDocument(id, title, description, category, tags, unitId, userId, fileUrl// NEW: File URL for Colivara reprocessing
    ) {
        try {
            const document = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].document.findUnique({
                where: {
                    id
                }
            });
            if (!document) {
                return null;
            }
            // Check if user has permission to update the document
            let permission = null;
            let user = null;
            if (userId) {
                user = await this.findUserById(userId);
                if (user) {
                    permission = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].documentPermission.findFirst({
                        where: {
                            documentId: id,
                            userId: user.id,
                            permission: {
                                in: [
                                    'WRITE',
                                    'ADMIN'
                                ]
                            }
                        }
                    });
                }
            }
            if (userId && !permission && user?.role !== 'ADMIN' && document.uploadedById !== user?.id) {
                throw new Error('User does not have permission to update this document');
            }
            // Update document fields that Prisma client recognizes
            const updatedDocument = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].document.update({
                where: {
                    id
                },
                data: {
                    ...title && {
                        title
                    },
                    ...description && {
                        description
                    },
                    ...category && {
                        category
                    },
                    ...tags !== undefined && {
                        tags: tags || []
                    },
                    ...unitId !== undefined && {
                        unitId
                    },
                    updatedAt: new Date()
                },
                include: {
                    uploadedByUser: true,
                    documentUnit: true
                }
            });
            return {
                id: updatedDocument.id,
                title: updatedDocument.title,
                description: updatedDocument.description,
                category: updatedDocument.category,
                tags: Array.isArray(updatedDocument.tags) ? updatedDocument.tags.map((tag)=>String(tag)) : typeof updatedDocument.tags === 'object' && updatedDocument.tags !== null ? Object.values(updatedDocument.tags).map((tag)=>String(tag)) : [],
                uploadedBy: updatedDocument.uploadedByUser?.name || updatedDocument.uploadedBy,
                uploadedById: updatedDocument.uploadedById,
                uploadedAt: new Date(updatedDocument.uploadedAt),
                fileUrl: updatedDocument.fileUrl,
                fileName: updatedDocument.fileName,
                fileType: updatedDocument.fileType,
                fileSize: updatedDocument.fileSize,
                downloadsCount: updatedDocument.downloadsCount || 0,
                viewsCount: updatedDocument.viewsCount || 0,
                version: updatedDocument.version || 1,
                versionNotes: updatedDocument.versionNotes || undefined,
                status: updatedDocument.status,
                createdAt: new Date(updatedDocument.createdAt),
                updatedAt: new Date(updatedDocument.updatedAt),
                unitId: updatedDocument.unitId || undefined,
                unit: updatedDocument.documentUnit && updatedDocument.documentUnit.code ? {
                    id: updatedDocument.documentUnit.id,
                    name: updatedDocument.documentUnit.name,
                    code: updatedDocument.documentUnit.code,
                    description: updatedDocument.documentUnit.description || undefined,
                    createdAt: updatedDocument.documentUnit.createdAt,
                    updatedAt: updatedDocument.documentUnit.updatedAt
                } : undefined,
                colivaraDocumentId: updatedDocument.colivaraDocumentId ?? undefined,
                colivaraProcessingStatus: updatedDocument.colivaraProcessingStatus ?? undefined,
                colivaraProcessedAt: updatedDocument.colivaraProcessedAt ? new Date(updatedDocument.colivaraProcessedAt) : undefined,
                colivaraChecksum: updatedDocument.colivaraChecksum ?? undefined
            };
        } catch (error) {
            console.error('Database connection error in updateDocument:', error);
            // Check if this is an authentication error
            if (error instanceof Error && (error.message.includes('Authentication failed') || error.message.includes('password') || error.message.includes('credentials'))) {
                throw new Error('Database authentication failed. Please check your database credentials.');
            }
            throw error; // Re-throw to be handled by the calling function
        }
    }
    /**
   * Delete a document
   */ async deleteDocument(id, userId) {
        try {
            const document = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].document.findUnique({
                where: {
                    id
                },
                include: {
                    permissions: true,
                    comments: true,
                    downloads: true,
                    views: true
                }
            });
            if (!document) {
                return false;
            }
            const user = await this.findUserById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            // Check if user has permission to delete the document
            const permission = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].documentPermission.findFirst({
                where: {
                    documentId: id,
                    userId: user.id,
                    permission: 'ADMIN'
                }
            });
            if (!permission && user.role !== 'ADMIN' && document.uploadedById !== user.id) {
                throw new Error('User does not have permission to delete this document');
            }
            // QPRO CLEANUP: Before deleting, capture KPIContribution records for accurate deduction
            // This solves the "memory loss" problem - we know exactly what this document contributed
            const kpiContributions = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].kPIContribution.findMany({
                where: {
                    document_id: id
                },
                select: {
                    id: true,
                    kra_id: true,
                    initiative_id: true,
                    value: true,
                    year: true,
                    quarter: true,
                    target_type: true
                }
            });
            // Also get aggregation activities for legacy cleanup (in case contributions don't exist)
            const qproAnalysis = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].qPROAnalysis.findFirst({
                where: {
                    documentId: id
                },
                select: {
                    id: true,
                    year: true,
                    quarter: true,
                    unitId: true,
                    aggregationActivities: {
                        where: {
                            isApproved: true
                        },
                        select: {
                            initiative_id: true,
                            reported: true,
                            aggregation_id: true
                        }
                    }
                }
            });
            // Track which KRAggregations need recalculation (from KPIContributions - preferred)
            const contributionsByKpi = new Map();
            for (const contrib of kpiContributions){
                const key = `${contrib.kra_id}|${contrib.initiative_id}|${contrib.year}|${contrib.quarter}`;
                contributionsByKpi.set(key, {
                    kraId: contrib.kra_id,
                    initiativeId: contrib.initiative_id,
                    value: contrib.value,
                    year: contrib.year,
                    quarter: contrib.quarter
                });
            }
            // Fallback: Track from aggregation activities if no contributions exist
            const affectedAggregations = [];
            if (kpiContributions.length === 0 && qproAnalysis?.aggregationActivities) {
                for (const activity of qproAnalysis.aggregationActivities){
                    if (activity.aggregation_id && activity.reported !== null) {
                        affectedAggregations.push({
                            aggregationId: activity.aggregation_id,
                            initiativeId: activity.initiative_id,
                            reportedValue: activity.reported
                        });
                    }
                }
            }
            console.log(`[Document Delete] Found ${kpiContributions.length} KPIContributions to deduct, ${affectedAggregations.length} legacy aggregation activities`);
            // Delete related records first (due to foreign key constraints)
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].documentComment.deleteMany({
                where: {
                    documentId: id
                }
            });
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].documentDownload.deleteMany({
                where: {
                    documentId: id
                }
            });
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].documentView.deleteMany({
                where: {
                    documentId: id
                }
            });
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].documentPermission.deleteMany({
                where: {
                    documentId: id
                }
            });
            // Delete Colivara indexes if they exist
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].colivaraIndex.deleteMany({
                where: {
                    documentId: id
                }
            });
            // Delete the file from storage before removing the database record
            try {
                const fileName = document.fileUrl.split('/').pop(); // Extract filename from URL
                if (fileName) {
                    const fileDeleted = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$file$2d$storage$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].deleteFile(fileName);
                    if (!fileDeleted) {
                        console.warn(`Failed to delete file ${fileName} from storage, but continuing with database deletion`);
                    }
                } else {
                    console.warn(`Could not extract filename from URL: ${document.fileUrl}`);
                }
            } catch (fileError) {
                console.error('Error deleting file from storage:', fileError);
            // Continue with database deletion even if file deletion fails to avoid orphaned records
            }
            // Delete from Colivara index if it exists
            try {
                // Initialize the service if needed (in case it hasn't been initialized)
                if (!colivaraService['isInitialized']) {
                    await colivaraService.initialize();
                }
                await colivaraService.deleteFromIndex(id);
            } catch (colivaraError) {
                console.error(`Failed to delete document ${id} from Colivara index:`, colivaraError);
            // Continue with deletion even if Colivara deletion fails
            }
            // Delete the document from the database (cascades to QPROAnalysis, AggregationActivity, and KPIContribution)
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].document.delete({
                where: {
                    id
                }
            });
            // QPRO CLEANUP: Deduct contributions from KRAggregation records after deletion
            // Use KPIContributions (preferred - accurate per-document stamped values)
            if (contributionsByKpi.size > 0) {
                console.log(`[Document Delete] Deducting ${contributionsByKpi.size} KPI contributions from aggregations`);
                for (const [, contrib] of contributionsByKpi){
                    try {
                        // Find the KRAggregation for this KPI
                        const aggregation = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].kRAggregation.findFirst({
                            where: {
                                year: contrib.year,
                                quarter: contrib.quarter,
                                kra_id: contrib.kraId,
                                initiative_id: contrib.initiativeId
                            }
                        });
                        if (!aggregation) {
                            console.log(`[Document Delete] No KRAggregation found for ${contrib.kraId}/${contrib.initiativeId}`);
                            continue;
                        }
                        // Deduct the exact contribution value
                        const newTotal = Math.max(0, (aggregation.total_reported ?? 0) - contrib.value);
                        const newCount = Math.max(0, aggregation.submission_count - 1);
                        if (newCount === 0) {
                            // No more contributions - delete the KRAggregation record
                            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].kRAggregation.delete({
                                where: {
                                    id: aggregation.id
                                }
                            });
                            console.log(`[Document Delete] Deleted empty KRAggregation: ${aggregation.id}`);
                        } else {
                            // Recalculate achievement with the deducted total
                            const targetValue = aggregation.target_value?.toNumber() ?? 1;
                            const newAchievement = targetValue > 0 ? newTotal / targetValue * 100 : 0;
                            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].kRAggregation.update({
                                where: {
                                    id: aggregation.id
                                },
                                data: {
                                    total_reported: newTotal,
                                    submission_count: newCount,
                                    achievement_percent: Math.min(newAchievement, 100),
                                    last_updated: new Date()
                                }
                            });
                            console.log(`[Document Delete] Deducted ${contrib.value} from KRAggregation ${aggregation.id}: new total=${newTotal}`);
                        }
                    } catch (deductError) {
                        console.error(`[Document Delete] Error deducting contribution for ${contrib.initiativeId}:`, deductError);
                    }
                }
            } else if (affectedAggregations.length > 0) {
                console.log(`[Document Delete] Legacy recalculating ${affectedAggregations.length} affected KRAggregation records`);
                for (const affected of affectedAggregations){
                    try {
                        // Get remaining approved activities for this aggregation
                        const remainingActivities = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].aggregationActivity.findMany({
                            where: {
                                aggregation_id: affected.aggregationId,
                                isApproved: true
                            },
                            select: {
                                reported: true
                            }
                        });
                        if (remainingActivities.length === 0) {
                            // No more activities - delete the KRAggregation record
                            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].kRAggregation.delete({
                                where: {
                                    id: affected.aggregationId
                                }
                            });
                            console.log(`[Document Delete] Deleted orphaned KRAggregation: ${affected.aggregationId}`);
                        } else {
                            // Recalculate totals from remaining activities
                            const newTotal = remainingActivities.reduce((sum, a)=>sum + (a.reported ?? 0), 0);
                            const newCount = remainingActivities.length;
                            // Get target for achievement calculation
                            const aggregation = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].kRAggregation.findUnique({
                                where: {
                                    id: affected.aggregationId
                                },
                                select: {
                                    target_value: true
                                }
                            });
                            const targetValue = aggregation?.target_value?.toNumber() ?? 1;
                            const newAchievement = targetValue > 0 ? newTotal / targetValue * 100 : 0;
                            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].kRAggregation.update({
                                where: {
                                    id: affected.aggregationId
                                },
                                data: {
                                    total_reported: newTotal,
                                    submission_count: newCount,
                                    achievement_percent: Math.min(newAchievement, 100),
                                    last_updated: new Date()
                                }
                            });
                            console.log(`[Document Delete] Updated KRAggregation ${affected.aggregationId}: total=${newTotal}, count=${newCount}`);
                        }
                    } catch (recalcError) {
                        console.error(`[Document Delete] Error recalculating KRAggregation ${affected.aggregationId}:`, recalcError);
                    // Continue with other aggregations even if one fails
                    }
                }
            }
            return true;
        } catch (error) {
            console.error('Database connection error in deleteDocument:', error);
            // Check if this is an authentication error
            if (error instanceof Error && (error.message.includes('Authentication failed') || error.message.includes('password') || error.message.includes('credentials'))) {
                throw new Error('Database authentication failed. Please check your database credentials.');
            }
            throw error; // Re-throw to be handled by the calling function
        }
    }
    /**
   * Get document permissions
   */ async getDocumentPermissions(documentId, userId) {
        try {
            const user = await this.findUserById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            // Check if user has admin permission for the document
            const adminPermission = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].documentPermission.findFirst({
                where: {
                    documentId,
                    userId: user.id,
                    permission: 'ADMIN'
                }
            });
            if (!adminPermission && user.role !== 'ADMIN') {
                throw new Error('User does not have permission to view document permissions');
            }
            const permissions = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].documentPermission.findMany({
                where: {
                    documentId
                }
            });
            return permissions.map((perm)=>({
                    ...perm,
                    permission: perm.permission,
                    createdAt: new Date(perm.createdAt)
                }));
        } catch (error) {
            console.error('Database connection error in getDocumentPermissions:', error);
            // Check if this is an authentication error
            if (error instanceof Error && (error.message.includes('Authentication failed') || error.message.includes('password') || error.message.includes('credentials'))) {
                throw new Error('Database authentication failed. Please check your database credentials.');
            }
            throw error; // Re-throw to be handled by the calling function
        }
    }
    /**
   * Add or update document permission
   */ async setDocumentPermission(documentId, userId, targetUserId, permission) {
        try {
            // Find the requesting user
            const user = await this.findUserById(userId);
            if (!user) {
                throw new Error('Requesting user not found');
            }
            // Check if the requesting user has admin permission for the document
            const adminPermission = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].documentPermission.findFirst({
                where: {
                    documentId,
                    userId: user.id,
                    permission: 'ADMIN'
                }
            });
            if (!adminPermission && user.role !== 'ADMIN') {
                throw new Error('User does not have permission to manage document permissions');
            }
            // Find the target user
            const targetUser = await this.findUserById(targetUserId);
            if (!targetUser) {
                throw new Error('Target user does not exist');
            }
            // Create or update the permission
            const permissionRecord = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].documentPermission.upsert({
                where: {
                    documentId_userId: {
                        documentId,
                        userId: targetUser.id
                    }
                },
                update: {
                    permission
                },
                create: {
                    documentId,
                    userId: targetUser.id,
                    permission
                }
            });
            return {
                ...permissionRecord,
                permission: permissionRecord.permission,
                createdAt: new Date(permissionRecord.createdAt)
            };
        } catch (error) {
            console.error('Database connection error in setDocumentPermission:', error);
            // Check if this is an authentication error
            if (error instanceof Error && (error.message.includes('Authentication failed') || error.message.includes('password') || error.message.includes('credentials'))) {
                throw new Error('Database authentication failed. Please check your database credentials.');
            }
            throw error; // Re-throw to be handled by the calling function
        }
    }
    /**
   * Remove document permission
   */ async removeDocumentPermission(documentId, userId, targetUserId) {
        try {
            // Find the requesting user
            const requestingUser = await this.findUserById(userId);
            if (!requestingUser) {
                throw new Error('Requesting user not found');
            }
            // Check if the requesting user has admin permission for the document
            const adminPermission = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].documentPermission.findFirst({
                where: {
                    documentId,
                    userId: requestingUser.id,
                    permission: 'ADMIN'
                }
            });
            if (!adminPermission && requestingUser.role !== 'ADMIN') {
                throw new Error('User does not have permission to manage document permissions');
            }
            // Find the target user
            const targetUser = await this.findUserById(targetUserId);
            if (!targetUser) {
                throw new Error('Target user does not exist');
            }
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].documentPermission.delete({
                where: {
                    documentId_userId: {
                        documentId,
                        userId: targetUser.id
                    }
                }
            });
            return true;
        } catch (error) {
            console.error('Database connection error in removeDocumentPermission:', error);
            // Check if this is an authentication error
            if (error instanceof Error && (error.message.includes('Authentication failed') || error.message.includes('password') || error.message.includes('credentials'))) {
                throw new Error('Database authentication failed. Please check your database credentials.');
            }
            throw error; // Re-throw to be handled by the calling function
        }
    }
    /**
   * Record document download
   */ async recordDownload(documentId, userId) {
        try {
            const user = await this.findUserById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].documentDownload.create({
                data: {
                    documentId,
                    userId: user.id
                }
            });
            // Increment download count
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].document.update({
                where: {
                    id: documentId
                },
                data: {
                    downloadsCount: {
                        increment: 1
                    }
                }
            });
        } catch (error) {
            console.error('Database connection error in recordDownload:', error);
            // Check if this is an authentication error
            if (error instanceof Error && (error.message.includes('Authentication failed') || error.message.includes('password') || error.message.includes('credentials'))) {
                throw new Error('Database authentication failed. Please check your database credentials.');
            }
            throw error; // Re-throw to be handled by the calling function
        }
    }
    /**
   * Record document view
   */ async recordView(documentId, userId) {
        try {
            const user = await this.findUserById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            // Check if user has already viewed the document recently to avoid inflating stats
            const recentView = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].documentView.findFirst({
                where: {
                    documentId,
                    userId: user.id,
                    viewedAt: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                    }
                }
            });
            if (!recentView) {
                await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].documentView.create({
                    data: {
                        documentId,
                        userId: user.id
                    }
                });
                // Increment view count
                await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].document.update({
                    where: {
                        id: documentId
                    },
                    data: {
                        viewsCount: {
                            increment: 1
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Database connection error in recordView:', error);
            // Check if this is an authentication error
            if (error instanceof Error && (error.message.includes('Authentication failed') || error.message.includes('password') || error.message.includes('credentials'))) {
                throw new Error('Database authentication failed. Please check your database credentials.');
            }
            throw error; // Re-throw to be handled by the calling function
        }
    }
    /**
   * Get document comments
   */ async getDocumentComments(documentId, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const [comments, total] = await Promise.all([
                __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].documentComment.findMany({
                    where: {
                        documentId
                    },
                    skip,
                    take: limit,
                    orderBy: {
                        createdAt: 'desc'
                    },
                    include: {
                        user: true
                    }
                }),
                __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].documentComment.count({
                    where: {
                        documentId
                    }
                })
            ]);
            return {
                comments: comments.map((comment)=>({
                        ...comment,
                        parentCommentId: comment.parentCommentId ?? undefined,
                        createdAt: new Date(comment.createdAt),
                        updatedAt: new Date(comment.updatedAt)
                    })),
                total
            };
        } catch (error) {
            console.error('Database connection error in getDocumentComments:', error);
            // Check if this is an authentication error
            if (error instanceof Error && (error.message.includes('Authentication failed') || error.message.includes('password') || error.message.includes('credentials'))) {
                throw new Error('Database authentication failed. Please check your database credentials.');
            }
            throw error; // Re-throw to be handled by the calling function
        }
    }
    /**
   * Add comment to document
   */ async addDocumentComment(documentId, userId, content, parentCommentId) {
        try {
            // Check if document exists
            const document = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].document.findUnique({
                where: {
                    id: documentId
                }
            });
            if (!document) {
                throw new Error('Document not found');
            }
            // Find the user
            const user = await this.findUserById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            // Check if user has permission to comment (must have read access)
            // Allow admins and faculty to comment on any document
            if (user.role !== 'ADMIN' && user.role !== 'FACULTY') {
                const permission = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].documentPermission.findFirst({
                    where: {
                        documentId,
                        userId: user.id,
                        permission: {
                            in: [
                                'READ',
                                'WRITE',
                                'ADMIN'
                            ]
                        }
                    }
                });
                if (!permission && document.uploadedById !== user.id) {
                    throw new Error('User does not have permission to comment on this document');
                }
            }
            if (parentCommentId) {
                // Verify the parent comment exists and belongs to the same document
                const parentComment = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].documentComment.findUnique({
                    where: {
                        id: parentCommentId
                    }
                });
                if (!parentComment || parentComment.documentId !== documentId) {
                    throw new Error('Invalid parent comment');
                }
            }
            const comment = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].documentComment.create({
                data: {
                    documentId,
                    userId: user.id,
                    content,
                    parentCommentId
                }
            });
            return {
                ...comment,
                parentCommentId: comment.parentCommentId ?? undefined,
                createdAt: new Date(comment.createdAt),
                updatedAt: new Date(comment.updatedAt)
            };
        } catch (error) {
            console.error('Database connection error in addDocumentComment:', error);
            // Check if this is an authentication error
            if (error instanceof Error && (error.message.includes('Authentication failed') || error.message.includes('password') || error.message.includes('credentials'))) {
                throw new Error('Database authentication failed. Please check your database credentials.');
            }
            throw error; // Re-throw to be handled by the calling function
        }
    }
    /**
   * Get a document by its Colivara document ID
   */ async getDocumentByColivaraId(colivaraDocumentId, userId) {
        try {
            // Validate the colivara document ID format before querying the database
            if (!colivaraDocumentId || typeof colivaraDocumentId !== 'string' || colivaraDocumentId.trim() === '' || colivaraDocumentId.includes('undefined') || colivaraDocumentId.includes('.pdf') || colivaraDocumentId.includes('.')) {
                console.warn('Invalid colivara document ID format received in getDocumentByColivaraId:', colivaraDocumentId);
                return null;
            }
            // Find the document that has this colivaraDocumentId
            const dbDocument = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].document.findFirst({
                where: {
                    colivaraDocumentId: colivaraDocumentId
                },
                include: {
                    uploadedByUser: true,
                    documentUnit: true
                }
            });
            if (!dbDocument) {
                return null;
            }
            // Check if user has access to the document - reuse the same access logic as getDocumentById
            if (userId) {
                const user = await this.findUserById(userId);
                if (user && user.role !== 'ADMIN' && user.role !== 'FACULTY') {
                    // Check if user has explicit permission for this document
                    const permission = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].documentPermission.findFirst({
                        where: {
                            documentId: dbDocument.id,
                            userId: user.id,
                            permission: {
                                in: [
                                    'READ',
                                    'WRITE',
                                    'ADMIN'
                                ]
                            }
                        }
                    });
                    // Allow access if user has explicit READ/WRITE/ADMIN permission OR if user uploaded the document
                    if (!permission && dbDocument.uploadedById !== user.id) {
                        return null; // User doesn't have access
                    }
                }
            }
            // Return the document in the expected format
            return {
                id: dbDocument.id,
                title: dbDocument.title,
                description: dbDocument.description,
                category: dbDocument.category,
                tags: Array.isArray(dbDocument.tags) ? dbDocument.tags.map((tag)=>String(tag)) : typeof dbDocument.tags === 'object' && dbDocument.tags !== null ? Object.values(dbDocument.tags).map((tag)=>String(tag)) : [],
                uploadedBy: dbDocument.uploadedByUser?.name || dbDocument.uploadedBy,
                uploadedById: dbDocument.uploadedById,
                uploadedAt: new Date(dbDocument.uploadedAt),
                fileUrl: dbDocument.fileUrl,
                fileName: dbDocument.fileName,
                fileType: dbDocument.fileType,
                fileSize: dbDocument.fileSize,
                downloadsCount: dbDocument.downloadsCount || 0,
                viewsCount: dbDocument.viewsCount || 0,
                version: dbDocument.version || 1,
                versionNotes: dbDocument.versionNotes || undefined,
                status: dbDocument.status,
                createdAt: new Date(dbDocument.createdAt),
                updatedAt: new Date(dbDocument.updatedAt),
                unitId: dbDocument.unitId || undefined,
                unit: dbDocument.documentUnit ? {
                    id: dbDocument.documentUnit.id,
                    name: dbDocument.documentUnit.name,
                    code: dbDocument.documentUnit.code || "",
                    description: dbDocument.documentUnit.description || undefined,
                    createdAt: dbDocument.documentUnit.createdAt,
                    updatedAt: dbDocument.documentUnit.updatedAt
                } : undefined,
                colivaraDocumentId: dbDocument.colivaraDocumentId ?? undefined,
                colivaraProcessingStatus: dbDocument.colivaraProcessingStatus ?? undefined,
                colivaraProcessedAt: dbDocument.colivaraProcessedAt ? new Date(dbDocument.colivaraProcessedAt) : undefined,
                colivaraChecksum: dbDocument.colivaraChecksum ?? undefined
            };
        } catch (error) {
            console.error('Database connection error in getDocumentByColivaraId:', error);
            // Check if this is an authentication error
            if (error instanceof Error && (error.message.includes('Authentication failed') || error.message.includes('password') || error.message.includes('credentials'))) {
                throw new Error('Database authentication failed. Please check your database credentials.');
            }
            throw error; // Re-throw to be handled by the calling function
        }
    }
}
const __TURBOPACK__default__export__ = new DocumentService();
}),
"[project]/app/api/documents/[id]/view/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$middleware$2f$auth$2d$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/middleware/auth-middleware.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$document$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/services/document-service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$file$2d$storage$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/services/file-storage-service.ts [app-route] (ecmascript)");
;
;
;
;
async function GET(request, { params }) {
    try {
        const { id } = await params;
        // Verify authentication
        const authResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$middleware$2f$auth$2d$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireAuth"])(request);
        if ('status' in authResult) {
            return authResult;
        }
        const { user } = authResult;
        const userId = user.id;
        // Get document
        const document = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$document$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].getDocumentById(id, userId);
        if (!document) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Document not found or access denied'
            }, {
                status: 404
            });
        }
        // Record the view
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$document$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].recordView(document.id, userId);
        // Extract filename from the stored URL
        const fileName = document.fileUrl.split('/').pop();
        if (!fileName) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid file URL'
            }, {
                status: 500
            });
        }
        try {
            // Generate a signed URL with inline content disposition for viewing
            const fileUrl = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$file$2d$storage$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].getFileUrl(fileName, 'repository-files');
            // Redirect to the file URL which will display inline
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].redirect(fileUrl);
        } catch (error) {
            console.error('Error getting file URL:', error);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Failed to retrieve file'
            }, {
                status: 500
            });
        }
    } catch (error) {
        console.error('Error in view endpoint:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1dec202f._.js.map