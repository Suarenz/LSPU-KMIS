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
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/lib/services/password-service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PasswordService",
    ()=>PasswordService,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
;
class PasswordService {
    saltRounds;
    constructor(){
        this.saltRounds = parseInt(process.env.SALT_ROUNDS || '12');
    }
    async hashPassword(password) {
        return await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].hash(password, this.saltRounds);
    }
    async verifyPassword(password, hashedPassword) {
        return await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].compare(password, hashedPassword);
    }
}
const __TURBOPACK__default__export__ = new PasswordService();
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
"[project]/app/api/auth/login/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$password$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/services/password-service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$jwt$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/services/jwt-service.ts [app-route] (ecmascript)");
;
;
;
;
async function POST(request) {
    try {
        const body = await request.json();
        const { email, password } = body;
        // Validate input
        if (!email || !password) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Email and password are required'
            }, {
                status: 400
            });
        }
        // Find user by email in the database
        const user = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].user.findUnique({
            where: {
                email: email
            }
        });
        if (!user) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid email or password'
            }, {
                status: 401
            });
        }
        // Verify password
        if (!user.password) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid email or password'
            }, {
                status: 401
            });
        }
        const isValidPassword = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$password$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].verifyPassword(password, user.password);
        if (!isValidPassword) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid email or password'
            }, {
                status: 401
            });
        }
        // Generate JWT token
        const token = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$jwt$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].generateToken({
            userId: user.id,
            email: user.email,
            role: user.role
        });
        // Return user data and token
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                unitId: user.unitId
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'An unexpected error occurred during login'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__dbf54a56._.js.map