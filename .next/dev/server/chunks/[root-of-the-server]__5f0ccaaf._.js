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
"[project]/lib/data/strategic_plan.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v(JSON.parse("{\"strategic_plan_meta\":{\"university\":\"Laguna State Polytechnic University\",\"period\":\"2025-2029\",\"vision\":\"A transformative university for the sustainable development of Laguna, CALABARZON, and ASEAN Region\",\"total_kras\":22},\"kras\":[{\"kra_id\":\"KRA 1\",\"kra_title\":\"Development of New Curricula Incorporating Emerging Technologies\",\"guiding_principle\":\"Excellence and Relevance in Education\",\"initiatives\":[{\"id\":\"KRA1-KPI1\",\"key_performance_indicator\":{\"outputs\":\"enhanced curricula integrated with emerging technologies (e.g., AI, IoT, drone technology, and biotechnology) into the agriculture, fisheries, forestry, engineering, medicine, law, arts, IT and education program)\",\"outcomes\":\"students equipped with cutting-edge skills and knowledge, increasing their employability and ability to contribute to modern agricultural and fisheries practices\"},\"strategies\":[\"conduct a needs assessment to identify gaps in the current curricula and opportunities for incorporating emerging technologies\",\"collaborate with industry experts, tech companies, and research institutions to design relevant course content\",\"pilot new courses and gather feedback from students and faculty to refine content and delivery methods\"],\"programs_activities\":[\"organize workshops with faculty members to assess the current curriculum\",\"initiate partnerships with relevant tech companies and research institutions to identify trends in emerging technologies\",\"form content development teams comprising faculty and industry partners to create course materials integrating emerging technologies\"],\"responsible_offices\":[\"Office of the Vice President for Academic Affairs\",\"Curriculum and Instruction Development Unit\",\"Deans\"],\"targets\":{\"type\":\"milestone\",\"timeline_data\":[{\"year\":2025,\"target_value\":\"Curriculum Updated\"},{\"year\":2026,\"target_value\":\"Curriculum Updated\"},{\"year\":2027,\"target_value\":\"Curriculum Updated\"},{\"year\":2028,\"target_value\":\"Curriculum Updated\"},{\"year\":2029,\"target_value\":\"Curriculum Updated\"}]}},{\"id\":\"KRA1-KPI2\",\"key_performance_indicator\":{\"outputs\":\"training sessions for faculty on the latest technological advancements and their applications in these fields\",\"outcomes\":\"enhanced faculty expertise in emerging technologies, leading to improved teaching quality and program relevance\"},\"strategies\":[\"collaborate with industry experts, tech companies and research institutions to design relevant course content\",\"pilot new courses and gather feedback from students and faculty to refine content and delivery methods\"],\"programs_activities\":[\"organize specialized training workshops on emerging technologies relevant to your curricula.\"],\"responsible_offices\":[\"Office of the Vice President for Academic Affairs\",\"HRMO\",\"Deans\",\"Faculty\",\"Curriculum and Instruction Development Unit\"],\"targets\":{\"type\":\"count\",\"unit_basis\":\"per program/college\",\"timeline_data\":[{\"year\":2025,\"target_value\":1},{\"year\":2026,\"target_value\":1},{\"year\":2027,\"target_value\":1},{\"year\":2028,\"target_value\":1},{\"year\":2029,\"target_value\":1}]}}]},{\"kra_id\":\"KRA 2\",\"kra_title\":\"Market-Driven Program Design and Implementation\",\"guiding_principle\":\"Excellence and Relevance in Education\",\"initiatives\":[{\"id\":\"KRA2-KPI1\",\"key_performance_indicator\":{\"outputs\":\"establishment of advisory boards comprising industry leaders and alumni, and community stakeholders to provide insights and feedback on program development\",\"outcomes\":\"programs that align closely with market demands, ensuring graduates possess the skills and knowledge required by employers\"},\"strategies\":[\"form advisory boards for agriculture, fisheries, and technology programs to facilitate ongoing dialogue with industry stakeholders\"],\"programs_activities\":[\"establish formal partnerships with industry leaders for internship placements\"],\"responsible_offices\":[\"Office of the Vice President for Academic Affairs\",\"Deans\",\"Alumni Affairs and Placement Services, Curriculum and Instruction Development Unit\"],\"targets\":{\"type\":\"milestone\",\"timeline_data\":[{\"year\":2025,\"target_value\":\"Advisory Board Established\"},{\"year\":2026,\"target_value\":\"Advisory Board Established\"},{\"year\":2027,\"target_value\":\"Advisory Board Established\"},{\"year\":2028,\"target_value\":\"Advisory Board Established\"},{\"year\":2029,\"target_value\":\"Advisory Board Established\"}]}},{\"id\":\"KRA2-KPI2\",\"key_performance_indicator\":{\"outputs\":\"regular updates to curricula based on market trends and industry needs assessments\",\"outcomes\":\"increased enrollment and retention rates as programs gain a reputation for relevance and quality\"},\"strategies\":[\"integrate experiential learning opportunities, such as internships and cooperative education, to provide students with real-world experience\",\"regularly review and update program curricula  based on feedback from advisory boards and market research findings\"],\"programs_activities\":[\"establish a framework to regularly assess program outcomes, student employment rates, and industry satisfaction\",\"create a feedback system involving students, alumni, and industry stakeholders\"],\"responsible_offices\":[\"Office of the Vice President for Academic Affairs\",\"Deans\",\"Alumni Affairs and Placement Services, Curriculum and Instruction Development Unit\"],\"targets\":{\"type\":\"milestone\",\"timeline_data\":[{\"year\":2025,\"target_value\":\"Curriculum Review Completed\"},{\"year\":2026,\"target_value\":\"Curriculum Review Completed\"},{\"year\":2027,\"target_value\":\"Curriculum Review Completed\"},{\"year\":2028,\"target_value\":\"Curriculum Review Completed\"},{\"year\":2029,\"target_value\":\"Curriculum Review Completed\"}]}}]},{\"kra_id\":\"KRA 3\",\"kra_title\":\"Quality and Relevance of Instruction\",\"guiding_principle\":\"Excellence and Relevance in Education\",\"initiatives\":[{\"id\":\"KRA3-KPI1\",\"key_performance_indicator\":{\"outputs\":\"above national passing rate for all board programs\",\"outcomes\":\"improved average percentage of passers in the licensure examination above the national passing percentage\"},\"strategies\":[\"establish an institutional in-house review center\",\"strict implementation of admission and retention policies\",\"awarding of incentives and recognition to top successful examinees\"],\"programs_activities\":[\"in-house review programs\",\"incentive grant program\"],\"responsible_offices\":[\"Office of the Vice President for Academic Affairs\",\"Deans\",\"Quality Assurance Unit\"],\"targets\":{\"type\":\"text_condition\",\"timeline_data\":[{\"year\":2025,\"target_value\":\"Above National Passing Rate\"},{\"year\":2026,\"target_value\":\"Above National Passing Rate\"},{\"year\":2027,\"target_value\":\"Above National Passing Rate\"},{\"year\":2028,\"target_value\":\"Above National Passing Rate\"},{\"year\":2029,\"target_value\":\"Above National Passing Rate\"}]}},{\"id\":\"KRA3-KPI2\",\"key_performance_indicator\":{\"outputs\":\"percentage of OJT students in related industries/institutions\",\"outcomes\":\"enhanced practical learning of students\"},\"strategies\":[\"promote student welfare through relevant programs and support services\"],\"programs_activities\":[\"host events such as career fairs, industry panels, or networking sessions\",\"regularly assess the effectiveness of OJT programs through feedback from students, industry partners, and academic staff\",\"offer incentives or recognition for industry partners who provide OJT opportunities\"],\"responsible_offices\":[\"Office of the Vice President for Academic Affairs\",\"Deans\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2025,\"target_value\":80},{\"year\":2026,\"target_value\":83},{\"year\":2027,\"target_value\":85},{\"year\":2028,\"target_value\":88},{\"year\":2029,\"target_value\":90}]}},{\"id\":\"KRA3-KPI3\",\"key_performance_indicator\":{\"outputs\":\"100% compliance of Center of Flexible Learning\",\"outcomes\":\"resilience\"},\"strategies\":[\"provide market-driven programs through responsive, relevant, and comprehensive curricula\"],\"programs_activities\":[\"monitoring of the preparation and submission of SLMs\"],\"responsible_offices\":[\"Office of the Vice Presidents\",\"Information Communication and Technology Services\",\"Curriculum Instruction Development\",\"Office of the Campus Directors\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2029,\"target_value\":100}]}},{\"id\":\"KRA3-KPI4\",\"key_performance_indicator\":{\"outputs\":\"number of courses integrated with extension learning technologies\",\"outcomes\":\"extended reach to provide quality service\"},\"strategies\":[\"build partnerships with local organizations, government agencies, and other stakeholders to enhance program reach and impact\",\"leverage the institution’s expertise and resources to design and implement programs that address community needs\"],\"programs_activities\":[\"form MOU/MOA with community groups\",\"use faculty and staff expertise in relevant fields to create programs that capitalize on the institution’s strengths\"],\"responsible_offices\":[\"Office of the Vice President for Academic Affairs\",\"Research, Extension and Innovation\",\"Deans\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":70},{\"year\":2026,\"target_value\":75},{\"year\":2027,\"target_value\":80},{\"year\":2028,\"target_value\":85},{\"year\":2029,\"target_value\":90}]}},{\"id\":\"KRA3-KPI5\",\"key_performance_indicator\":{\"outputs\":\"achieve 75% employment or entrepreneurial engagement rate among graduates 2 years after graduation, including those who start their own business or create employment opportunities (employment, entrepreneurial ventures)\",\"outcomes\":\"develop LSPU graduates who demonstrate high employability rate and are in demand across various sectors, while also functioning as key contributors to societal and economic development\"},\"strategies\":[\"enhance curriculum and program relevance\",\"strengthen career services and job\",\"alumni and employer feedback loop\"],\"programs_activities\":[\"annual graduate employability survey\",\"job fair and career expo\",\"alumni career support network\"],\"responsible_offices\":[\"Office of the Vice President for Academic Affairs\",\"Alumni Affairs and Placement Services\",\"Deans\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2025,\"target_value\":73},{\"year\":2026,\"target_value\":73},{\"year\":2027,\"target_value\":74},{\"year\":2028,\"target_value\":74},{\"year\":2029,\"target_value\":75}]}},{\"id\":\"KRA3-KPI6\",\"key_performance_indicator\":{\"outputs\":\"continuous tracer studies that assess graduates' employability, mobility, entrepreneurial activities and international career opportunities\",\"outcomes\":[\" increased understanding of graduate employability and career trajectories leading to data-driven program improvements\",\"alumni engagement strengthened\"]},\"strategies\":[\"regularly conduct of tracer study, with integration of mobility and international opportunities\",\"graduate engagement and follow-up\"],\"programs_activities\":[\"graduate support career services development\",\"development of Alumni Management System\",\"tracer studies and graduate career mobility tracking\"],\"responsible_offices\":[\"Office of the Vice President for Academic Affairs\",\"Alumni Affairs and Placement Services\",\"Research and Development Services\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":1},{\"year\":2026,\"target_value\":1},{\"year\":2027,\"target_value\":1},{\"year\":2028,\"target_value\":1},{\"year\":2029,\"target_value\":1}]}},{\"id\":\"KRA3-KPI7\",\"key_performance_indicator\":{\"outputs\":\"percentage of compliance with IA-based instrument for other campuses\",\"outcomes\":[\"increased compliance rates\",\"standardized processes\"]},\"strategies\":[\"training and awareness\",\"standardization\",\"monitoring and reporting\",\"feedback and improvement\"],\"programs_activities\":[\"compliance workshops\",\"audit simulations\",\"compliance audits\",\"feedback sessions\"],\"responsible_offices\":[\"Office of the Vice Presidents\",\"Quality Assurance Unit\",\"Office of the Campus Directors\"],\"targets\":{\"type\":\"milestone\",\"timeline_data\":[{\"year\":2028,\"target_value\":\"100% compliance Institutional Accreditation all campus\"}]}},{\"id\":\"KRA3-KPI8\",\"key_performance_indicator\":{\"outputs\":\"percentage of compliance with SUC Level IV based on SUC Levelling  Instrument\",\"outcomes\":[\"increased compliance rates\",\"standardized processes\"]},\"strategies\":[\"training and awareness\",\"standardization\",\"monitoring and reporting\",\"feedback and improvement\"],\"programs_activities\":[\"compliance workshops\",\"audit simulations\",\"compliance audits\",\"feedback sessions\"],\"responsible_offices\":[\"Office of the Vice Presidents\",\"Quality Assurance Unit\",\"Office of the Campus Directors\"],\"targets\":{\"type\":\"milestone\",\"timeline_data\":[{\"year\":2029,\"target_value\":\"SUC Level IV Compliance\"}]}},{\"id\":\"KRA3-KPI9\",\"key_performance_indicator\":{\"outputs\":\"programs accredited/candidate (Level 1 - 4)\",\"outcomes\":\"enhanced quality of education  and graduates’ competence\"},\"strategies\":[\"regularly review and update curricula to align with industry standards and technological advancements\",\"implement robust internal and external quality assurance mechanisms\",\"foster a culture of continuous improvement among faculty and staff\"],\"programs_activities\":[\"curriculum enhancement workshops\",\"faculty training and development programs\",\"research and innovation initiatives\",\"industry partnerships and internships\",\"student development programs\",\"community engagement and extension services\"],\"responsible_offices\":[\"Office of the Vice President for Academic Affairs\",\"Quality Assurance Unit\",\"Deans\",\"Curriculum and Instruction Development Unit\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2029,\"target_value\":100,\"note\":\"accredited programs\"}]}},{\"id\":\"KRA3-KPI10\",\"key_performance_indicator\":{\"outputs\":\"COD/COE program\",\"outcomes\":[\"compliance rates\",\"standardized processes\"]},\"strategies\":[\"training and awareness\",\"standardization\",\"monitoring and reporting\",\"feedback and improvement\",\"benchmark on top universities\"],\"programs_activities\":[\"assess the current state of the program and perform a gap analysis to identify areas that need improvement\",\"revise the curriculum, course content, and program structure\",\"ensure that faculty members meet the required qualifications\"],\"responsible_offices\":[\"Office of the Vice President for Academic Affairs\",\"Deans\",\"Quality Assurance Unit\",\"Curriculum and Instruction Development Unit\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2029,\"target_value\":1,\"note\":\"1 new COD/COE\"}]}},{\"id\":\"KRA3-KPI11\",\"key_performance_indicator\":{\"outputs\":\"percentage of developed instructional material (IM) per program\",\"outcomes\":\"increased quantity and quality of IM\"},\"strategies\":[\"professional development: provide ongoing training for teachers on creating high-quality instructional materials\",\"feedback mechanisms: Implement systems for regular feedback on instructional materials from both teachers and students.\"],\"programs_activities\":[\"workshops and training sessions: regular workshops focused on instructional design, use of digital tools, and curriculum alignment\",\"peer review sessions: Scheduled sessions where teachers can review and provide feedback on each other’s materials.\"],\"responsible_offices\":[\"Office of the Vice President for Academic Affairs\",\"Deans\",\"Quality Assurance Unit\",\"Curriculum and Instruction Development Unit\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2025,\"target_value\":30},{\"year\":2026,\"target_value\":33},{\"year\":2027,\"target_value\":35},{\"year\":2028,\"target_value\":38},{\"year\":2029,\"target_value\":40}]}},{\"id\":\"KRA3-KPI12\",\"key_performance_indicator\":{\"outputs\":\"ISO certification for Management Systems for Educational Organizations (ISO 21001:2018) and Quality Management System (ISO 9001:2015))\",\"outcomes\":[\"increased compliance rates\",\"standardized processes\"]},\"strategies\":[\"training and awareness\",\"standardization\",\"monitoring and reporting\",\"feedback and improvement\"],\"programs_activities\":[\"compliance workshops\",\"audit simulations\",\"compliance audits\",\"feedback sessions\"],\"responsible_offices\":[\"Office of the Vice Presidents\",\"Quality Assurance Unit\",\"Office of the Campus Directors\"],\"targets\":{\"type\":\"milestone\",\"timeline_data\":[{\"year\":2025,\"target_value\":\"Recertification\"},{\"year\":2026,\"target_value\":\"Recertification\"},{\"year\":2027,\"target_value\":\"Recertification\"},{\"year\":2028,\"target_value\":\"Recertification\"},{\"year\":2029,\"target_value\":\"Recertification\"}]}},{\"id\":\"KRA3-KPI13\",\"key_performance_indicator\":{\"outputs\":\"number of completed GAD-initiated programs every year\",\"outcomes\":\"4 activities/year\"},\"strategies\":[\"conduct trainings, seminars, fora, focus group discussions\"],\"programs_activities\":[\"trainings\",\"seminars\",\"fora\",\"focus group discussions\"],\"responsible_offices\":[\"Offices of the Vice President\",\"Gender and Development\"],\"targets\":{\"type\":\"count\",\"unit_basis\":\"per year\",\"timeline_data\":[{\"year\":2025,\"target_value\":4},{\"year\":2026,\"target_value\":4},{\"year\":2027,\"target_value\":4},{\"year\":2028,\"target_value\":4},{\"year\":2029,\"target_value\":4}]}},{\"id\":\"KRA3-KPI14\",\"key_performance_indicator\":{\"outputs\":\"percentage of faculty and staff who attended GAD mainstreaming and issue\",\"outcomes\":\"95% faculty and staff attended the GAD mainstreaming and issue\"},\"strategies\":[\"conduct of training/seminar on GAD mainstreaming\"],\"programs_activities\":[\"trainings\",\"seminars\",\"fora\",\"focus group discussions\"],\"responsible_offices\":[\"HRMO\",\"Gender and Development\",\"Offices of the Vice President\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2025,\"target_value\":95},{\"year\":2026,\"target_value\":95},{\"year\":2027,\"target_value\":95},{\"year\":2028,\"target_value\":95},{\"year\":2029,\"target_value\":95}]}},{\"id\":\"KRA3-KPI15\",\"key_performance_indicator\":{\"outputs\":\"number of enrolled foreign students\",\"outcomes\":[\"increased number of foreign students graduates across curriculum and employment after a year or two of graduation\",\"students’ very satisfactory evaluation\"]},\"strategies\":[\"offering English as a Foreign Language (EFL) as a coursework to foreign students who come for cultural immersion and summer camps, and freshmen who will enroll in any curricular program\",\"offering lower tuition and other related fees\",\"offering or assisting students in finding scholarships\",\"offering ODL\"],\"programs_activities\":[\"enrolment of students\",\"orientation for foreign students\",\"application or renewal of visa and other Bureau of Immigration & DFA documents\",\"development of Instructional materials\",\"educational tours\",\"close monitoring of students’ performance\"],\"responsible_offices\":[\"Office of the Vice President for Academic Affairs\",\"International/Local Affairs\",\"Deans\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":5,\"note\":\"new students per year\"},{\"year\":2026,\"target_value\":5,\"note\":\"new students per year\"}]}},{\"id\":\"KRA3-KPI16\",\"key_performance_indicator\":{\"outputs\":\"number of Student enrolled in CHED/RDC Priority programs\",\"outcomes\":\"increased the number of student enrolled in CHED/RDC priority programs\"},\"strategies\":[\"enhanced outreach and awareness campaigns\",\"program enhancement and innovation\",\"enhancing student support services\"],\"programs_activities\":[\"conduct of outreach and awareness campaign\",\"regularly update and enhance the curriculum of priority programs\",\"provide strong academic advising services, mentoring, monitoring and counseling\"],\"responsible_offices\":[\"Office of the Vice President for Academic Affairs\",\"International/Local Affairs\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2025,\"target_value\":55},{\"year\":2026,\"target_value\":57},{\"year\":2027,\"target_value\":58},{\"year\":2028,\"target_value\":60},{\"year\":2029,\"target_value\":62}]}}]},{\"kra_id\":\"KRA 4\",\"kra_title\":\"College and Office International Activities and Projects\",\"guiding_principle\":\"Excellence and Relevance in Education\",\"initiatives\":[{\"id\":\"KRA4-KPI1\",\"key_performance_indicator\":{\"outputs\":\"number of MOUs/MOAs per year with top 1000 World Universities\",\"outcomes\":\"increased number of international partners including one (1 per year) polytechnic university in the ASEAN region and/or international university among the top 1000 universities in the world\"},\"strategies\":[\"invite prospective international university\",\"renew old partnerships with performing universities\",\"promote LSPU through social media\",\"international conferences attendees ROI\"],\"programs_activities\":[\"benchmarking\",\"employees’ participation in international conferences\",\"constant and continued communications with the prospective partner\",\"endorsement to internal and external Offices & BOR\",\"signing\"],\"responsible_offices\":[\"Office of the Vice President for Academic Affairs\",\"International/Local Affairs\",\"Deans/Colleges\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":2},{\"year\":2026,\"target_value\":2},{\"year\":2027,\"target_value\":2},{\"year\":2028,\"target_value\":2},{\"year\":2029,\"target_value\":2}]}},{\"id\":\"KRA4-KPI2\",\"key_performance_indicator\":{\"outputs\":\"internationalization accomplishments (per college/office)\",\"outcomes\":[\"recognition from national and international award-giving organizations\",\"impact on the community\",\"secured position in World University Ranking\"]},\"strategies\":[\"coordinate university-wide international initiatives to ensure integration and coordination across the University’s international partnerships, collaborations, programs, and services\"],\"programs_activities\":[\"monitoring of international activities project\",\"regular meetings with deans & directors\",\"public promotions of internationalization accomplishments\"],\"responsible_offices\":[\"Office of the Vice President for Academic Affairs\",\"International Local/Affairs\",\"Information Office\",\"Deans\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":1},{\"year\":2026,\"target_value\":2},{\"year\":2027,\"target_value\":3},{\"year\":2028,\"target_value\":4},{\"year\":2029,\"target_value\":5}]}}]},{\"kra_id\":\"KRA 5\",\"kra_title\":\"Research, Extension, and Innovation Productivity\",\"guiding_principle\":\"Advancing Research Excellence and Community Engagement\",\"initiatives\":[{\"id\":\"KRA5-KPI1\",\"key_performance_indicator\":{\"outputs\":\"number of IP (patent, UM, copyrights, etc.) generated\",\"outcomes\":\"IP Protections and IP registrations of the university researches\"},\"strategies\":[\"assessment of researches for IP registration for potential commercialization\"],\"programs_activities\":[\"conduct of IP foundation courses, patent search trainings and patent draft training\"],\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"SAO Finance\",\"Budget and Finance\",\"Center of Innovation and Emerging Technologies\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":47},{\"year\":2026,\"target_value\":50},{\"year\":2027,\"target_value\":53},{\"year\":2028,\"target_value\":56},{\"year\":2029,\"target_value\":59}]}},{\"id\":\"KRA5-KPI2\",\"key_performance_indicator\":{\"outputs\":\"number of income-generating research-based products/outputs\",\"outcomes\":\"establish more innovative research (faculty and students) for income generation of the university, continuity of technology commercialization\"},\"strategies\":[\"secure income generating projects to strengthen industry-academic partnerships through collaboration\",\"focus on market-relevant research to identify gaps, trends, and opportunities to addressed through research-based products\",\"enhance technology transfer offices to support researchers in the commercialization process, including patenting, licensing, and marketing\"],\"programs_activities\":[\"technology transfer programs that focused on transferring research innovations, including support for patenting, licensing, and partnership development\",\"incubation and acceleration programs awareness campaign\"],\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"SAO Finance\",\"Budget and Finance\",\"Center of Innovation and Emerging Technologies\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":6},{\"year\":2026,\"target_value\":8},{\"year\":2027,\"target_value\":10},{\"year\":2028,\"target_value\":12},{\"year\":2029,\"target_value\":14}]}},{\"id\":\"KRA5-KPI3\",\"key_performance_indicator\":{\"outputs\":\"number of spinoff/start-up companies established for faculty and students\",\"outcomes\":[\"commercialization journey will encourage faculty researchers to enroll in the incubation process\",\"spin-off companies will help the community develop entrepreneurs to improved their livelihood and to improve economic status\"]},\"strategies\":[\"promote a culture of innovation – foster a culture that encourages innovation and risktaking by celebrating successful start-ups and promoting entrepreneurial success stories\",\"craft policy advocacy that supports start-ups and spin-offs, such as tax incentives, research funding, and supportive regulatory frameworks\",\"enhance IP policy manual on incentives/benefits for technology developers/creators\"],\"programs_activities\":[\"value formation through training and development for sustainability of entrepreneurial mindset\",\"offer entrepreneurship courses through seminars and workshop, business development, and commercialization for faculty and students\",\"Commercialization Assistance: Provide resources and support for turning research findings into commercial products\"],\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"SAO Finance\",\"Budget Office\",\"Center of Innovation and Emerging Technologies\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":2},{\"year\":2026,\"target_value\":3},{\"year\":2027,\"target_value\":4},{\"year\":2028,\"target_value\":5},{\"year\":2029,\"target_value\":6}]}},{\"id\":\"KRA5-KPI4\",\"key_performance_indicator\":{\"outputs\":\"number of research-based programs/projects delivered for extension to the community\",\"outcomes\":\"enhanced local knowledge and 3-5 year sustainable solutions addressing community needs\"},\"strategies\":[\"conduct in-house review of PPAs\",\"enhance REI funding and support\"],\"programs_activities\":[\"annual REI proposal writeshop\",\"monitoring of on-going PPAs\"],\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"Extension and Training Services\",\"Research and Development Services\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":3},{\"year\":2026,\"target_value\":4},{\"year\":2027,\"target_value\":5},{\"year\":2028,\"target_value\":6},{\"year\":2029,\"target_value\":7}]}},{\"id\":\"KRA5-KPI5\",\"key_performance_indicator\":{\"outputs\":\"number of faculty members with national/international awards and recognition\",\"outcomes\":\"personal and institutional prestige gained and will establish the credibility that are acknowledged by the community\"},\"strategies\":\"support for REI professional development and strengthen collaboration and partnerships with international and national organizations\",\"programs_activities\":\"nominations to REI-related award recognitions\",\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"SAO Finance\",\"Budget Office\",\"Research, Extension and Innovation Unit\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":1},{\"year\":2026,\"target_value\":1},{\"year\":2027,\"target_value\":2},{\"year\":2028,\"target_value\":2},{\"year\":2029,\"target_value\":2}]}},{\"id\":\"KRA5-KPI6\",\"key_performance_indicator\":{\"outputs\":\"number of institutional awards and recognition\",\"outcomes\":\"institutional prestige gained and will help leverage to get more funds through the trust of the funding agencies\"},\"strategies\":\"partnerships with international and national institution and organizations\",\"programs_activities\":[\"continuous effort with IP filling and registration\",\"excellent service of REI unit\"],\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"Research, Extension and Innovation Unit\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":1},{\"year\":2026,\"target_value\":1},{\"year\":2027,\"target_value\":2},{\"year\":2028,\"target_value\":2},{\"year\":2029,\"target_value\":2}]}},{\"id\":\"KRA5-KPI7\",\"key_performance_indicator\":{\"outputs\":\"number of research based policy recommendations on Fisheries, Agriculture, Academic, Gender & Development, and other emerging disciplines\",\"outcomes\":\"data-driven decisions and policies\"},\"strategies\":\"collaboration with government and industry stakeholders\",\"programs_activities\":\"conduct of trainings for policy making and establishment of a compendium for policy briefs\",\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"Research and Development Services\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":2},{\"year\":2026,\"target_value\":2},{\"year\":2027,\"target_value\":2},{\"year\":2028,\"target_value\":3},{\"year\":2029,\"target_value\":3}]}},{\"id\":\"KRA5-KPI8\",\"key_performance_indicator\":{\"outputs\":\"number of university refereed research journals\",\"outcomes\":\"enhancing the institution's academic reputation and contributing to global knowledge dissemination\"},\"strategies\":[\"promotion of the journal to attract highquality submissions\",\"given incentives to faculty researchers who published, and incentives to faculty serving as evaluators\"],\"programs_activities\":\"establish a peer-review system and support for a dedicated editorial board and review panel\",\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"Research and Development Services\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":1},{\"year\":2026,\"target_value\":1},{\"year\":2027,\"target_value\":1},{\"year\":2028,\"target_value\":1},{\"year\":2029,\"target_value\":1}]}},{\"id\":\"KRA5-KPI9\",\"key_performance_indicator\":{\"outputs\":\"number of faculty research outputs\",\"outcomes\":\"greater contribution to academic advancements and practical solutions for societal challenges\"},\"strategies\":\"deliver quality programs, projects and activities that will lead to extension, commercialization, and policy recommendations\",\"programs_activities\":\"monitoring of internally and externally funded research\",\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"SAO Finance\",\"Budget Office\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":150},{\"year\":2026,\"target_value\":152},{\"year\":2027,\"target_value\":155},{\"year\":2028,\"target_value\":157},{\"year\":2029,\"target_value\":160}]}},{\"id\":\"KRA5-KPI10\",\"key_performance_indicator\":{\"outputs\":\"number of research findings presented in reputable conferences\",\"outcomes\":\"increased visibility and recognition of research, fostering collaborations and advancing knowledge through presentations at reputable conferences\"},\"strategies\":\"provide research presentation grants and target networking opportunities\",\"programs_activities\":[\"endorse faculty researchers to international and national conferences\",\"conduct institutional REI conferences\"],\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"Research and Development Services\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":15},{\"year\":2026,\"target_value\":16},{\"year\":2027,\"target_value\":20},{\"year\":2028,\"target_value\":20},{\"year\":2029,\"target_value\":24}]}}]},{\"kra_id\":\"KRA 6\",\"kra_title\":\"Research, Extension, and Innovation Linkages\",\"guiding_principle\":\"Advancing Research Excellence and Community Engagement\",\"initiatives\":[{\"id\":\"KRA6-KPI1\",\"key_performance_indicator\":{\"outputs\":\"number of active partnerships with LGUs, industries, NGOs, NGAs, SMEs and other stakeholders\",\"outcomes\":[\"strong linkages with partner agencies\",\"enhance existing relations with community and partner agencies, locally and internationally\"]},\"strategies\":[\"increase and intensify linkages with partner institutions, community stakeholders and industries, local and international, for REI PPAs\"],\"programs_activities\":[\"conduct of needs assessments with potential partner agencies\",\"conduct of PPAs requested by partner agencies\"],\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"Research, Extension and Innovation Unit\"],\"targets\":{\"type\":\"count\",\"unit_basis\":\"total active\",\"timeline_data\":[{\"year\":2025,\"target_value\":120,\"note\":\"10 existing + 20 new\"},{\"year\":2026,\"target_value\":160},{\"year\":2027,\"target_value\":220},{\"year\":2028,\"target_value\":300},{\"year\":2029,\"target_value\":400}]}},{\"id\":\"KRA6-KPI2\",\"key_performance_indicator\":{\"outputs\":\"number of MOA/MOU with established or organized associations\",\"outcomes\":\"shared resources\"},\"strategies\":[\"forge MOA/MOU with all the partner agencies\"],\"programs_activities\":[\"conduct of REI PPAs with partner agencies\"],\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"Research, Extension and Innovation Unit\"],\"targets\":{\"type\":\"count\",\"unit_basis\":\"total active\",\"timeline_data\":[{\"year\":2025,\"target_value\":100,\"note\":\"80 existing + 20 new\"},{\"year\":2026,\"target_value\":130},{\"year\":2027,\"target_value\":170},{\"year\":2028,\"target_value\":220},{\"year\":2029,\"target_value\":280}]}}]},{\"kra_id\":\"KRA 7\",\"kra_title\":\"Research, Extension, and Innovation Resources\",\"guiding_principle\":\"Advancing Research Excellence and Community Engagement\",\"initiatives\":[{\"id\":\"KRA7-KPI1\",\"key_performance_indicator\":{\"outputs\":\"technologies/innovations adopted by the intended stakeholders. The adoption by which people become users of a technology or product, that is usable and useful and enable them to become long-term business goals\",\"outcomes\":\"increased number of technology/innovation on adopters\"},\"strategies\":[\"ensure the adoption of the technologies/innovations by the intended stakeholders\"],\"programs_activities\":[\"conduct PPAs that are needed and are beneficial to the targeted stakeholders\"],\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"Center of Innovation and Emerging Technologies\",\"Extension and Training Services\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":6},{\"year\":2026,\"target_value\":8},{\"year\":2027,\"target_value\":10},{\"year\":2028,\"target_value\":12},{\"year\":2029,\"target_value\":14}]}},{\"id\":\"KRA7-KPI2\",\"key_performance_indicator\":{\"outputs\":\"number of generated partnerships from externally-funded research\",\"outcomes\":\"sustainable projects and improved REI facilities\"},\"strategies\":[\"establish partnership with industry players, policy, and innovation centers\"],\"programs_activities\":[\"research grants and projects\"],\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"Research, Extension and Innovation Unit\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":5},{\"year\":2026,\"target_value\":7},{\"year\":2027,\"target_value\":9},{\"year\":2028,\"target_value\":11},{\"year\":2029,\"target_value\":13}]}},{\"id\":\"KRA7-KPI3\",\"key_performance_indicator\":{\"outputs\":\"established 5 state-of-the-art laboratories on fisheries, agriculture, and otheremerging disciplines\",\"outcomes\":\"more technology innovations\"},\"strategies\":[\"establish partnership with industry players, policy, and innovation center\"],\"programs_activities\":[\"submission of proposal to funding agencies\",\"establishment of REI Centers\"],\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"Project Management Office\",\"Extension and Innovation Unit\",\"Planning Office\",\"Budget and Finance Unit\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":1},{\"year\":2026,\"target_value\":1},{\"year\":2027,\"target_value\":1},{\"year\":2028,\"target_value\":1},{\"year\":2029,\"target_value\":1}]}},{\"id\":\"KRA7-KPI4\",\"key_performance_indicator\":{\"outputs\":\"number of operational/institutionalized research and development centers\",\"outcomes\":\"more technology innovations\"},\"strategies\":\"established partnership with industry players\",\"programs_activities\":[\"submission of proposal to funding agencies\",\"establishment of REI Centers\"],\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"Research and Development Services\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":0},{\"year\":2026,\"target_value\":1},{\"year\":2027,\"target_value\":1},{\"year\":2028,\"target_value\":1},{\"year\":2029,\"target_value\":1}]}},{\"id\":\"KRA7-KPI5\",\"key_performance_indicator\":{\"outputs\":\"total income from commercialized technologies (pesos)\",\"outcomes\":[\"subsidized services of the University\",\"encourage faculty researchers to enroll in the incubation process\"]},\"strategies\":[\"market expansion thru segment your market that tailor to technology that meet the specific needs of different market segments\",\"innovations - continually improved researches\"],\"programs_activities\":[\"innovation and commercialization programs thru commercialization grants\",\"technology transfer programs\",\"entrepreneurship workshops\",\"incubation and acceleration programs\",\"entrepreneurship workshops and seminars: conduct training sessions on entrepreneurship, business development, and commercialization strategies tailored for researchers and innovators\"],\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"Research, Extension and Innovation Unit\"],\"targets\":{\"type\":\"financial\",\"currency\":\"PHP\",\"timeline_data\":[{\"year\":2025,\"target_value\":375000},{\"year\":2026,\"target_value\":425000},{\"year\":2027,\"target_value\":475000},{\"year\":2028,\"target_value\":525000},{\"year\":2029,\"target_value\":550000}]}}]},{\"kra_id\":\"KRA 8\",\"kra_title\":\"Service to the Community\",\"guiding_principle\":\"Advancing Research Excellence and Community Engagement\",\"initiatives\":[{\"id\":\"KRA8-KPI1\",\"key_performance_indicator\":{\"outputs\":\"extension programs organized and supported, consistent with mandated and priority programs\",\"outcomes\":\"improved quality of life of the target beneficiaries\"},\"strategies\":\"ensure that extension programs/projects to be conducted are in line with the expertise of the faculty, and at the same time supports the mandated and priority programs offered by the University\",\"programs_activities\":[\"conduct of needs assessment among target beneficiaries\",\"conduct of in-house review for proposals\"],\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"Extension and Training Services\",\"Budget and Finance Unit\",\"SAO Finance\"],\"targets\":{\"type\":\"count\",\"note\":\"new programs\",\"timeline_data\":[{\"year\":2025,\"target_value\":40},{\"year\":2026,\"target_value\":50},{\"year\":2027,\"target_value\":60},{\"year\":2028,\"target_value\":70},{\"year\":2029,\"target_value\":80}]}},{\"id\":\"KRA8-KPI2\",\"key_performance_indicator\":{\"outputs\":\"number of GAD-related research and extension PPAs\",\"outcomes\":\"improved quality of life of beneficiaries increase in the number of GADrelated research and extension PPAs\"},\"strategies\":\"conduct gender research and extension workshops/write shops\",\"programs_activities\":\"implementation of GAD-related REI programs, projects, and activities\",\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"Gender and Development Office\",\"SAO Finance\",\"Budget and Finance\",\"Research and Development Services\",\"Extension and Training Services\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":17},{\"year\":2026,\"target_value\":19},{\"year\":2027,\"target_value\":20},{\"year\":2028,\"target_value\":23},{\"year\":2029,\"target_value\":25}]}},{\"id\":\"KRA8-KPI3\",\"key_performance_indicator\":{\"outputs\":\"number of trainees weighted by the length of training\",\"outcomes\":[\"application of skills learned for employment or livelihood\",\"employment or entrepreneurial activities that resulted from training\"]},\"strategies\":\"ensure conduct of PPAs that are beneficial to community\",\"programs_activities\":[\"conduct PPAs that are requested by the partners agencies\",\"conduct of BOR-approved extension programs/projects\"],\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"SAO Finance\",\"Budget and Finance Unit\",\"Extension and Training Services\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":17630},{\"year\":2026,\"target_value\":18030},{\"year\":2027,\"target_value\":18230},{\"year\":2028,\"target_value\":18430},{\"year\":2029,\"target_value\":18630}]}},{\"id\":\"KRA8-KPI4\",\"key_performance_indicator\":{\"outputs\":\"number of extension information materials (IEC/ICT) produced, disseminated, and utilized\",\"outcomes\":\"increase in the number of extension information materials (IEC/ICT) produced, disseminated, and utilized\"},\"strategies\":\"ensure the production, dissemination, and utilization of IEC/ICT materials\",\"programs_activities\":[\"prepare IEC/ICT materials for each and every PPA\",\"provide IEC/ICT materials on the PPAs conducted\"],\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"Extension and Training Services\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":30},{\"year\":2026,\"target_value\":35},{\"year\":2027,\"target_value\":40},{\"year\":2028,\"target_value\":45},{\"year\":2029,\"target_value\":50}]}},{\"id\":\"KRA8-KPI5\",\"key_performance_indicator\":{\"outputs\":\"100% of beneficiaries rate the training course/s and advisory services as satisfactory or higher in terms of quality and relevance\",\"outcomes\":\"quality and relevant extension PPAs\"},\"strategies\":\"boost the implementation of PPAs and ensure that such PPAs are of high quality and are relevant to the target beneficiaries\",\"programs_activities\":\"conduct of extension PPAs\",\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"Extension and Training Services\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2029,\"target_value\":100}]}}]},{\"kra_id\":\"KRA 9\",\"kra_title\":\"Implementation of Sustainable Governance\",\"guiding_principle\":\"Shaping a Sustainable Future\",\"initiatives\":[{\"id\":\"KRA9-KPI1\",\"key_performance_indicator\":{\"outputs\":\"approved harmonized manuals of operations by 2029\",\"outcomes\":[\"efficient transactions, services, and operations\",\"standard procedure\"]},\"strategies\":[\"monitoring\",\"consultation\",\"crafting/revision of university policies, standards, and guidelines\"],\"programs_activities\":[\"enhance and extended technology infrastructure towards a wireless paperless and efficient computer network\",\"build capacity of staff on operations\"],\"responsible_offices\":[\"Vice President for Administration\",\"Office of the Campus Directors\",\"All offices/units\"],\"targets\":{\"type\":\"milestone\",\"timeline_data\":[{\"year\":2029,\"target_value\":\"Approved Harmonized Manual\"}]}}]},{\"kra_id\":\"KRA 10\",\"kra_title\":\"Transforming into Green University\",\"guiding_principle\":\"Shaping a Sustainable Future\",\"initiatives\":[{\"id\":\"KRA10-KPI1\",\"key_performance_indicator\":{\"outputs\":\"100% facilities compliant with green building code by 2029\",\"outcomes\":\"climate-change conscious environment\"},\"strategies\":[\"assessment and rehabilitation of facilities\",\"adaptation of renewable energy like solar enery (solar panels)\",\"establishment of sustainable waste management system\",\"construction of MRF\"],\"programs_activities\":[\"implementation of LUDIP\",\"implementation of waste management system\"],\"responsible_offices\":[\"Office of the University President\",\"Office of the Vice Presidents\",\"Office of the Campus Director\",\"Project Management Unit\",\"Planning Office\",\"General Services Unit\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2029,\"target_value\":100}]}}]},{\"kra_id\":\"KRA 11\",\"kra_title\":\"Judicious Management of Human Resources\",\"guiding_principle\":\"Shaping a Sustainable Future\",\"initiatives\":[{\"id\":\"KRA11-KPI1\",\"key_performance_indicator\":{\"outputs\":\"aligned and specialized doctorate graduates for faculty and master's degree for non-teaching personnel by 2029\",\"outcomes\":[\"faculty and non-teaching personnel are proficient in their subject and work areas\",\"doctorate/master degree holders/unit-earners\"]},\"strategies\":[\"strengthen intellectual capital\",\"strengthen professional development program\"],\"programs_activities\":[\"scholarship program, both internal and external\"],\"responsible_offices\":[\"Vice President for Administration\",\"HRMO\",\"Office of the Campus Directors\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2025,\"target_value\":5},{\"year\":2026,\"target_value\":10},{\"year\":2027,\"target_value\":15},{\"year\":2028,\"target_value\":20},{\"year\":2029,\"target_value\":30}]}}]},{\"kra_id\":\"KRA 12\",\"kra_title\":\"Internationalized/Global University Stakeholders\",\"guiding_principle\":\"Shaping a Sustainable Future\",\"initiatives\":[{\"id\":\"KRA12-KPI1\",\"key_performance_indicator\":{\"outputs\":\"10% students, 15% faculty, 5% staff are involved in intercountry mobility across the curriculum\",\"outcomes\":\"increase number of students, staff and faculty involved in intercountry mobility across the curriculum\"},\"strategies\":[\"facilitate the early endorsement of employees’ travels\",\"offer incentives/recognition to faculty and staff who participate in international programs\",\"scout and identify international conferences held in the Philippines\"],\"programs_activities\":[\"attendance/Participation in international training programs, conferences or symposia\",\"co-organizing local and international training/seminar workshops and conferences.\"],\"responsible_offices\":[\"Office of the Vice Presidents\",\"International Local/Affairs\",\"All colleges and Offices\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2029,\"target_value\":10,\"note\":\"students\"},{\"year\":2029,\"target_value\":15,\"note\":\"faculty\"},{\"year\":2029,\"target_value\":5,\"note\":\"staff\"}]}}]},{\"kra_id\":\"KRA 13\",\"kra_title\":\"Competitive Global Human Resources\",\"guiding_principle\":\"Shaping a Sustainable Future\",\"initiatives\":[{\"id\":\"KRA13-KPI1\",\"key_performance_indicator\":{\"outputs\":\"increase in the percentage of certified faculty, personnel, and trainers (local and international certifications)\",\"outcomes\":\"graduates/professionals aligned or sustainable to the needs of the industry\"},\"strategies\":[\"offer local and international scholarships\",\"faculty and staff development plan\"],\"programs_activities\":[\"submission of application and screening\",\"partnership scholarship with external funding agencies\"],\"responsible_offices\":[\"Vice President for Administration\",\"HRMO\",\"Office of the Campus Directors\",\"International/Local Affairs\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2025,\"target_value\":5},{\"year\":2026,\"target_value\":10},{\"year\":2027,\"target_value\":15},{\"year\":2028,\"target_value\":20},{\"year\":2029,\"target_value\":25}]}},{\"id\":\"KRA13-KPI2\",\"key_performance_indicator\":{\"outputs\":\"95% of positions filled by 2029\",\"outcomes\":\"university is operating at maximum capacity a.) for personnel - efficiency of transactions b.) for faculties - proportion of student to faculty members\"},\"strategies\":[\"revisit compensation packages based on existing laws in industry\"],\"programs_activities\":[\"competency-based recruitment\",\"job satisfaction\"],\"responsible_offices\":[\"Vice President for Administration\",\"HRMO\",\"Office of the Campus Directors\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2025,\"target_value\":80},{\"year\":2026,\"target_value\":82},{\"year\":2027,\"target_value\":85},{\"year\":2028,\"target_value\":90},{\"year\":2029,\"target_value\":95}]}},{\"id\":\"KRA13-KPI3\",\"key_performance_indicator\":{\"outputs\":\"100% faculty and staff attended health and wellness program twice a week during school days\",\"outcomes\":\"improvements in fitness levels, weight management, disease prevention, and overall vitality\"},\"strategies\":[\"conduct health and wellness program twice a week\",\"survey on the wellness program to be focus on\"],\"programs_activities\":[\"health and wellness program for faculty and staff\"],\"responsible_offices\":[\"Vice President for Administration\",\"HRMO\",\"Office of the Campus Directors\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2029,\"target_value\":100}]}}]},{\"kra_id\":\"KRA 14\",\"kra_title\":\"Improved Satisfaction Rating of the Students, Faculty, and Personnel\",\"guiding_principle\":\"Shaping a Sustainable Future\",\"initiatives\":[{\"id\":\"KRA14-KPI1\",\"key_performance_indicator\":{\"outputs\":\"95% satisfaction rating on all services\",\"outcomes\":\"sustain very satisfactory or higher rating on all services annually\"},\"strategies\":[\"regular monitoring and ensuring that the client completes the CCSS survey form\",\"addressing the negative feedback from the client regarding the service of a unit\"],\"programs_activities\":[\"client satisfaction\"],\"responsible_offices\":[\"Vice President for Administration\",\"Office of the Campus Directors\",\"Management Information System\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2025,\"target_value\":95},{\"year\":2026,\"target_value\":95},{\"year\":2027,\"target_value\":95},{\"year\":2028,\"target_value\":95},{\"year\":2029,\"target_value\":95}]}}]},{\"kra_id\":\"KRA 15\",\"kra_title\":\"Certification and Compliance to Regulatory Requirements\",\"guiding_principle\":\"Shaping a Sustainable Future\",\"initiatives\":[{\"id\":\"KRA15-KPI1\",\"key_performance_indicator\":{\"outputs\":\"100% of security personnel responsible for security equipment obtained the required licenses and certifications, demonstrating full compliance with regulatory requirements\",\"outcomes\":\"highly professional security personnel maintaining peace and order in all campuses\"},\"strategies\":[\"license of security personnel-in-charge to security equipment\"],\"programs_activities\":[\"ensure proper and legal use of security equipment\"],\"responsible_offices\":[\"Vice President for Administration\",\"Office of the Campus Directors\",\"Security Management and Services\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2029,\"target_value\":100}]}}]},{\"kra_id\":\"KRA 16\",\"kra_title\":\"Updating of Learning Materials and Facilities\",\"guiding_principle\":\"Shaping a Sustainable Future\",\"initiatives\":[{\"id\":\"KRA16-KPI1\",\"key_performance_indicator\":{\"outputs\":\"increase in the percentage of subjects have at least 5 updated references, including books, journals, and electronic books available\",\"outcomes\":[\"higher user satisfaction\",\"electronic document downloads frequency\"]},\"strategies\":[\"revisit the Collection Development Plan and revise it for 2025-2029\",\"ensure that the fiduciary library funds only be used for the acquisition of Library Reference Material. Monitor and report\",\"prioritize the subscription to electronic databases with comprehensive subjects relevant to LSPU curricula\"],\"programs_activities\":[\"collection development program\",\"acquisition and linkages\"],\"responsible_offices\":[\"Vice President for Administration\",\"Library\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2025,\"target_value\":70},{\"year\":2026,\"target_value\":75},{\"year\":2027,\"target_value\":80},{\"year\":2028,\"target_value\":85},{\"year\":2029,\"target_value\":90}]}},{\"id\":\"KRA16-KPI2\",\"key_performance_indicator\":{\"outputs\":\"new building for academic space for students\",\"outcomes\":\"go beyond the minimum standard of providing enough reading space to 10% of the student population\"},\"strategies\":[\"coordinate closely with design planning to ensure planned study spaces are up to standards set by AACCUP and CHED\",\"take feedback from students and library users\",\"create welldocumented project proposals with forecasts on student population\",\"begin planning the library system towards establishing various college or separate libraries.\"],\"programs_activities\":[\"library development plan\"],\"responsible_offices\":[\"Office of the University President\",\"Library\",\"Project Management Office\",\"Planning Office\",\"Vice President for Administration\"],\"targets\":{\"type\":\"milestone\",\"timeline_data\":[{\"year\":2025,\"target_value\":\"renovate the library to accommodate 250 students\"},{\"year\":2026,\"target_value\":\"planning and benchmarking for library building standards and organization of college libraries\"},{\"year\":2027,\"target_value\":\"long term planning and design of a system of libraries and academic spaces\"},{\"year\":2028,\"target_value\":\"Phase 1 of implementing immediate plans to increase library space\"},{\"year\":2029,\"target_value\":\"New buildings to accommodate at least 1,200 students\"}]}}]},{\"kra_id\":\"KRA 17\",\"kra_title\":\"Digital Transformation and Smart Campus Enablement\",\"guiding_principle\":\"Shaping a Sustainable Future\",\"initiatives\":[{\"id\":\"KRA17-KPI1\",\"key_performance_indicator\":{\"outputs\":\"100% of offices included in the coverage area of internet\",\"outcomes\":\"improved network speed and reliability\"},\"strategies\":[\"network infrastructure improvement/maintenance\"],\"programs_activities\":[\"connection of offices to the University’s fiber backbone\",\"investment in high-quality networking devices that can retain the bandwidth and throughput of a gigabit network.\"],\"responsible_offices\":[\"Vice President for Administration\",\"Office of the CampusDirectors\",\"Information Communication and Technology Services\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2029,\"target_value\":100}]}},{\"id\":\"KRA17-KPI2\",\"key_performance_indicator\":{\"outputs\":\"100% of ICT-related projects/requests are procured/implemented\",\"outcomes\":\"enhanced performance and capacity of technology\"},\"strategies\":[\"futures planning\",\"procurement of ICT-related equipment\"],\"programs_activities\":[\"upgrade/maintenance of ICT equipment\"],\"responsible_offices\":[\"Vice President for Administration\",\"Office of the Campus Directors\",\"Information Communication and Technology Services\",\"Procurement Bids and Awards\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2025,\"target_value\":80},{\"year\":2026,\"target_value\":88},{\"year\":2027,\"target_value\":90},{\"year\":2028,\"target_value\":93},{\"year\":2029,\"target_value\":95}]}},{\"id\":\"KRA17-KPI3\",\"key_performance_indicator\":{\"outputs\":\"digitalized processes and systems in operation\",\"outcomes\":\"improved operational efficiency, with a measurable reduction in manual processes\"},\"strategies\":\"digitalization of manual workflows\",\"programs_activities\":[\"development, procurement and/or subscription of Information System modules to help in transformation of the manual processes which also aligns to the university’s ISSP\"],\"responsible_offices\":[\"Vice President for Administration\",\"Office of the Campus Directors\",\"Information Communication and Technology Services\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":6},{\"year\":2026,\"target_value\":6},{\"year\":2027,\"target_value\":6},{\"year\":2028,\"target_value\":6},{\"year\":2029,\"target_value\":6}]}},{\"id\":\"KRA17-KPI4\",\"key_performance_indicator\":{\"outputs\":\"Conduct of orientations/workshops/training sessions for the end-users of digitalized process\",\"outcomes\":\"increased staff competency in using new technologies\"},\"strategies\":[\"develop comprehensive training programs to upskill staff and faculty\"],\"programs_activities\":[\"organize ICT-related workshops and training sessions for staff and faculty\"],\"responsible_offices\":[\"Vice President for Administration\",\"Office of the Campus Directors\",\"HRMO\",\"Information Communication and Technology\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":2},{\"year\":2026,\"target_value\":2},{\"year\":2027,\"target_value\":2},{\"year\":2028,\"target_value\":2},{\"year\":2029,\"target_value\":2}]}}]},{\"kra_id\":\"KRA 18\",\"kra_title\":\"Risk Management and Compliance\",\"guiding_principle\":\"Resource Optimization and Management\",\"initiatives\":[{\"id\":\"KRA18-KPI1\",\"key_performance_indicator\":{\"outputs\":\"conducted risk assessments with zero incidence of non-compliance on financial issues\",\"outcomes\":\"smooth flow of operations and processes (full compliance)\"},\"strategies\":[\"ensure 0% incidence of non-compliance\",\"conduct regular risk assessments, internal audits, and third-party reviews\",\"Implement automated monitoring tools\",\"Provide ongoing compliance training and clear reporting channels\"],\"programs_activities\":[\"observe the protocol concerning spending and financial reporting\",\"comply with the required documentation, etc. regarding financial matters\"],\"responsible_offices\":[\"Vice President for Administration\",\"Budget Office\",\"SAO Finance\"],\"targets\":{\"type\":\"text_condition\",\"timeline_data\":[{\"year\":2029,\"target_value\":\"Zero incidence of non-compliance\"}]}}]},{\"kra_id\":\"KRA 19\",\"kra_title\":\"Revenue Growth and Operational Efficiency\",\"guiding_principle\":\"Resource Optimization and Management\",\"initiatives\":[{\"id\":\"KRA19-KPI1\",\"key_performance_indicator\":{\"outputs\":\"increase in income generated from approved IGPs\",\"outcomes\":\"increased internal funding for special funds\"},\"strategies\":[\"identify and evaluate new IGP opportunities\",\"formulation of IGP manual and financial management framework\",\"regular monitoring,evaluation and audit\"],\"programs_activities\":[\"procurement planning; implementation\",\"monitoring of planned procurement activities\",\"evaluation\",\"policy and program making for IGP *proposal making/planning for new IGPs\"],\"responsible_offices\":[\"Vice President for Administration\",\"Budget Office\",\"SAO Finance\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2025,\"target_value\":5},{\"year\":2026,\"target_value\":5},{\"year\":2027,\"target_value\":7},{\"year\":2028,\"target_value\":9},{\"year\":2029,\"target_value\":11}]}},{\"id\":\"KRA19-KPI2\",\"key_performance_indicator\":{\"outputs\":\"reduction in operational costs\",\"outcomes\":\"funds can be allocated for other important projects\"},\"strategies\":[\"develop resource utilization plans\",\"regular inventory and preventive maintenance\"],\"programs_activities\":[\"procurement planning; implementation\",\"monitoring of planned procurement activities\",\"evaluation\"],\"responsible_offices\":[\"Vice President for Administration\",\"Budget Office\",\"SAO Finance\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2025,\"target_value\":2},{\"year\":2026,\"target_value\":4},{\"year\":2027,\"target_value\":6},{\"year\":2028,\"target_value\":8},{\"year\":2029,\"target_value\":10}]}}]},{\"kra_id\":\"KRA 20\",\"kra_title\":\"Related IGP Industry Engagement\",\"guiding_principle\":\"Resource Optimization and Management\",\"initiatives\":[{\"id\":\"KRA20-KPI1\",\"key_performance_indicator\":{\"outputs\":\"total revenue generated from partnerships and collaborations\",\"outcomes\":[\"acquired expertise and investments\",\"quality of partnership agreements\",\"increased in total revenue generated from strategic partnerships and collaborations\"]},\"strategies\":[\"resource and expertise sharing\",\"joint revenue-generating initiatives\",\"strengthen human resources, organizational, and financial capital of the university\",\"strengthen intellectual capital from capital royalties from developed technologies\"],\"programs_activities\":[\"consultancy and training\",\"joint ventures using developed technologies\"],\"responsible_offices\":[\"Vice President for Administration\",\"Budget Office\",\"SAO Finance\",\"Extension and Training Services\"],\"targets\":{\"type\":\"financial\",\"currency\":\"PHP\",\"timeline_data\":[{\"year\":2025,\"target_value\":0},{\"year\":2026,\"target_value\":0},{\"year\":2027,\"target_value\":300000},{\"year\":2028,\"target_value\":330000},{\"year\":2029,\"target_value\":363000}]}},{\"id\":\"KRA20-KPI2\",\"key_performance_indicator\":{\"outputs\":\"increase in net income from non-traditional sources\",\"outcomes\":\"generate additional income from non-traditional sources\"},\"strategies\":[\"create entrepreneurial ventures\",\"strengthen the existing income-generating projects\"],\"programs_activities\":[\"events place\",\"coffee shops\",\"rental spaces\",\"commercialization of research products and services\",\"printing and binding\",\"gasoline station\",\"clothing shop\",\"grocery-style store\"],\"responsible_offices\":[\"Vice President for Administration\",\"Business Affairs Office\",\"SAO Finance\",\"Budget Office\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2025,\"target_value\":5},{\"year\":2026,\"target_value\":8},{\"year\":2027,\"target_value\":12},{\"year\":2028,\"target_value\":20},{\"year\":2029,\"target_value\":30}]}}]},{\"kra_id\":\"KRA 21\",\"kra_title\":\"Responsive Management of Resources\",\"guiding_principle\":\"Resource Optimization and Management\",\"initiatives\":[{\"id\":\"KRA21-KPI1\",\"key_performance_indicator\":{\"outputs\":\"100% budget utilization rate (disbursement)\",\"outcomes\":\"established functional and operational system for resource generation and management of resources\"},\"strategies\":[\"ensure prudent use of resources\",\"improve spending efficiency, absorptive capacity\"],\"programs_activities\":\"monitoring of the planned procurement activities\",\"responsible_offices\":[\"Vice President for Administration\",\"Budget Office\",\"SAO Finance\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2029,\"target_value\":100}]}},{\"id\":\"KRA21-KPI2\",\"key_performance_indicator\":{\"outputs\":\"100% budget utilization rate (obligation)\",\"outcomes\":\"established functional and operational system for resource generation and management of resources\"},\"strategies\":[\"ensure prudent use of resources\",\"Improve the spending efficiency; absorptive capacity\"],\"programs_activities\":[\"implementation of the planned programs, projects, and activities (PPAs)\",\"monitoring of planned procurement activities\",\"Conduct a workshop for all the offices involved\"],\"responsible_offices\":[\"Vice President for Administration\",\"Budget Office\",\"SAO Finance\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2029,\"target_value\":100}]}}]},{\"kra_id\":\"KRA 22\",\"kra_title\":\"Management of Financial Resources\",\"guiding_principle\":\"Resource Optimization and Management\",\"initiatives\":[{\"id\":\"KRA22-KPI1\",\"key_performance_indicator\":{\"outputs\":\"internally generated income\",\"outcomes\":\"established functional and operational system for resource generation and management of resources\"},\"strategies\":[\"availability of a systematic plan of action to justify every budget proposal\",\"continual improvement process\"],\"programs_activities\":[\"submit justifications to the Department of Budget and Management for the release of the actual billing\",\"training and seminars for the human resources\"],\"responsible_offices\":[\"Vice President for Administration\",\"Budget Office\",\"SAO Finance\"],\"targets\":{\"type\":\"financial\",\"currency\":\"PHP\",\"timeline_data\":[{\"year\":2025,\"target_value\":263426000},{\"year\":2026,\"target_value\":277000000},{\"year\":2027,\"target_value\":291000000},{\"year\":2028,\"target_value\":320000000},{\"year\":2029,\"target_value\":336000000}]}},{\"id\":\"KRA22-KPI2\",\"key_performance_indicator\":{\"outputs\":\"100% fund utilization on infrastructure projects\",\"outcomes\":[\"improved productivity of the human resources\",\"developed facilities, services, and systems\"]},\"strategies\":\"strengthen construction or manufacture capital\",\"programs_activities\":[\"monitoring of the planned programs\",\"conduct of Early Procurement Activities (EPA)\",\"approval of PPMP/APP\",\"BOR approval\"],\"responsible_offices\":[\"Vice President for Administration\",\"Project Management Unit\",\"Planning Unit\",\"SAO Finance\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2029,\"target_value\":100}]}},{\"id\":\"KRA22-KPI3\",\"key_performance_indicator\":{\"outputs\":\"100% fund utilization on repairs/rehabilitation of buildings, vehicles, drainage and roads, land, material recovery facilities and electrical facilities\",\"outcomes\":[\"less funds for repair and rehabilitation\",\"less disruption to operation\"]},\"strategies\":[\"strengthen construction or manufacture capital\",\"implement regular preventive maintenance\"],\"programs_activities\":[\"conduct of Early Procurement Activities (EPA)\",\"approval of the Head of Agency\",\"approval of PPMP/APP\",\"bidding\",\"contracting by Administration\"],\"responsible_offices\":[\"Vice President for Administration\",\"General Services Office\",\"SAO Finance\",\"Budget Office\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2029,\"target_value\":100}]}},{\"id\":\"KRA22-KPI4\",\"key_performance_indicator\":{\"outputs\":\"100% fund utilization in the acquisition of new equipment\",\"outcomes\":[\"responsive to the needs of the end-users\",\"efficiency in the procurement of equipment needed\"]},\"strategies\":[\"assessment of the needs of the end-users\",\"consider the budget and maintenance cost\"],\"programs_activities\":[\"conduct of Early Procurement Activities (EPA)\",\"approval of the Head of Agency\",\"approval of PPMP/APP\",\"bidding\"],\"responsible_offices\":[\"Vice President for Administration\",\"Budget Office\",\"SAO Finance\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2029,\"target_value\":100}]}}]}]}"));}),
"[project]/lib/utils/qpro-aggregation.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "averageNumbers",
    ()=>averageNumbers,
    "computeAggregatedAchievement",
    ()=>computeAggregatedAchievement,
    "findInitiative",
    ()=>findInitiative,
    "getInitiativeTargetMeta",
    ()=>getInitiativeTargetMeta,
    "getTargetValueForYear",
    ()=>getTargetValueForYear,
    "normalizeInitiativeId",
    ()=>normalizeInitiativeId,
    "normalizeKraId",
    ()=>normalizeKraId,
    "sumNumbers",
    ()=>sumNumbers,
    "toNumberOrNull",
    ()=>toNumberOrNull
]);
function toNumberOrNull(value) {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    const cleaned = String(value).replace(/,/g, '').trim();
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
}
function getTargetValueForYear(timeline, year) {
    if (!Array.isArray(timeline) || timeline.length === 0) return null;
    const exact = timeline.find((t)=>Number(t?.year) === year);
    const exactValue = toNumberOrNull(exact?.target_value);
    if (exactValue !== null) return exactValue;
    const candidates = timeline.map((t)=>({
            year: Number(t?.year),
            target: toNumberOrNull(t?.target_value)
        })).filter((t)=>Number.isFinite(t.year) && t.target !== null);
    const pastOrEqual = candidates.filter((t)=>t.year <= year).sort((a, b)=>b.year - a.year);
    if (pastOrEqual.length > 0) return pastOrEqual[0].target;
    const future = candidates.sort((a, b)=>a.year - b.year);
    return future.length > 0 ? future[0].target : null;
}
function normalizeInitiativeId(id) {
    return String(id || '').replace(/\s+/g, '');
}
function normalizeKraId(kraId) {
    const cleaned = String(kraId || '').trim().replace(/\s+/g, ' ');
    // Match "KRA" followed by number(s), normalize to "KRA {number}"
    const match = cleaned.match(/^KRA\s*(\d+)$/i);
    if (match) {
        return `KRA ${match[1]}`;
    }
    return cleaned;
}
function findInitiative(plan, kraId, initiativeId) {
    if (!kraId || !initiativeId) return null;
    const kras = plan?.kras || [];
    const normalizedKraId = normalizeKraId(kraId);
    const kra = kras.find((k)=>normalizeKraId(k.kra_id) === normalizedKraId);
    if (!kra?.initiatives) return null;
    const normalizedId = normalizeInitiativeId(String(initiativeId));
    let initiative = kra.initiatives.find((i)=>normalizeInitiativeId(String(i.id)) === normalizedId);
    if (!initiative) {
        const kpiMatch = String(initiativeId).match(/KPI(\d+)/i);
        if (kpiMatch) {
            initiative = kra.initiatives.find((i)=>String(i.id).includes(`KPI${kpiMatch[1]}`));
        }
    }
    return initiative || null;
}
function getInitiativeTargetMeta(plan, kraId, initiativeId, year) {
    const initiative = findInitiative(plan, kraId, initiativeId);
    const targetType = initiative?.targets?.type ?? null;
    const unitBasis = typeof initiative?.targets?.unit_basis === 'string' ? initiative.targets.unit_basis : null;
    // IMPORTANT DEFAULT:
    // If strategic_plan.json doesn't explicitly specify scope, treat targets as INSTITUTIONAL
    // to prevent accidental inflation (e.g., multiplying by activities/programs).
    const targetScope = initiative?.targets?.target_scope === 'PER_UNIT' ? 'PER_UNIT' : 'INSTITUTIONAL';
    const timeline = initiative?.targets?.timeline_data || [];
    const targetValue = getTargetValueForYear(timeline, year);
    return {
        targetType,
        targetValue,
        targetScope,
        unitBasis
    };
}
function sumNumbers(values) {
    return values.reduce((acc, v)=>acc + (typeof v === 'number' && Number.isFinite(v) ? v : 0), 0);
}
function averageNumbers(values) {
    const nums = values.filter((v)=>typeof v === 'number' && Number.isFinite(v));
    if (nums.length === 0) return 0;
    return nums.reduce((acc, n)=>acc + n, 0) / nums.length;
}
function computeAggregatedAchievement(args) {
    const { targetType, targetValue, targetScope = 'INSTITUTIONAL', unitMultiplier, activities } = args;
    const normalizedType = String(targetType || '').toLowerCase();
    // IMPORTANT: targets are applied ONCE per KPI by default.
    // If a KPI explicitly declares PER_UNIT scope, callers should pass a true unitMultiplier
    // (e.g., number of programs/units). We intentionally default to 1 (not activities.length)
    // because an activity count is not the same as a unit count.
    const effectiveTarget = targetScope === 'PER_UNIT' ? targetValue * (typeof unitMultiplier === 'number' && Number.isFinite(unitMultiplier) ? unitMultiplier : 1) : targetValue;
    // Rate metrics: use mean reported against single target
    if (normalizedType === 'percentage') {
        // Percent KPIs need special handling:
        // - If reported is already 0..100, use it.
        // - If reported is a count (e.g., 154 employed) and activity.target is a denominator (e.g., 200 graduates),
        //   convert to percent: (reported/target)*100.
        // - Ignore invalid values we can't normalize (prevents nonsense like 154% being treated as a percent).
        const toNormalizedPercent = (a)=>{
            const reported = toNumberOrNull(a.reported);
            if (reported === null) return null;
            // Already a valid percent
            if (reported >= 0 && reported <= 100) return reported;
            // Try to normalize count/denominator into a percent
            const denom = toNumberOrNull(a.target);
            if (denom !== null && denom > 0 && reported >= 0) {
                const pct = reported / denom * 100;
                if (pct >= 0 && pct <= 100) return pct;
            }
            return null;
        };
        const avgReported = averageNumbers(activities.map(toNormalizedPercent));
        const achievementPercent = effectiveTarget > 0 ? avgReported / effectiveTarget * 100 : 0;
        return {
            totalReported: avgReported,
            totalTarget: effectiveTarget,
            achievementPercent
        };
    }
    // Financial and counts: additive
    if (normalizedType === 'financial' || normalizedType === 'count') {
        const sumReported = sumNumbers(activities.map((a)=>toNumberOrNull(a.reported)));
        const achievementPercent = effectiveTarget > 0 ? sumReported / effectiveTarget * 100 : 0;
        return {
            totalReported: sumReported,
            totalTarget: effectiveTarget,
            achievementPercent
        };
    }
    // Milestone / text_condition: interpret as completed if any reported is truthy
    if (normalizedType === 'milestone' || normalizedType === 'text_condition') {
        const anyReported = activities.some((a)=>{
            const v = a.reported;
            if (typeof v === 'number') return v > 0;
            if (typeof v === 'string') return v.trim().length > 0;
            return false;
        });
        const achievementPercent = anyReported ? 100 : 0;
        return {
            totalReported: anyReported ? 1 : 0,
            totalTarget: 1,
            achievementPercent
        };
    }
    // Default: treat as additive numeric
    const sumReported = sumNumbers(activities.map((a)=>toNumberOrNull(a.reported)));
    const achievementPercent = effectiveTarget > 0 ? sumReported / effectiveTarget * 100 : 0;
    return {
        totalReported: sumReported,
        totalTarget: effectiveTarget,
        achievementPercent
    };
}
}),
"[project]/lib/utils/target-type-utils.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Utility functions for handling target types in KPI progress tracking
 */ __turbopack_context__.s([
    "calculateAchievement",
    ()=>calculateAchievement,
    "determineStatus",
    ()=>determineStatus,
    "formatCurrentValueForDB",
    ()=>formatCurrentValueForDB,
    "mapTargetType",
    ()=>mapTargetType,
    "parseCurrentValue",
    ()=>parseCurrentValue
]);
function mapTargetType(planType) {
    if (!planType) return 'COUNT'; // Default to count
    const normalized = planType.toLowerCase().trim();
    // Milestone/binary targets
    if (normalized.includes('milestone') || normalized.includes('binary') || normalized === 'boolean') {
        return 'MILESTONE';
    }
    // Percentage targets
    if (normalized.includes('percentage') || normalized.includes('percent') || normalized.includes('rate')) {
        return 'PERCENTAGE';
    }
    // Financial targets
    if (normalized.includes('currency') || normalized.includes('financial') || normalized.includes('budget') || normalized.includes('revenue') || normalized.includes('cost')) {
        return 'FINANCIAL';
    }
    // Text/qualitative conditions
    if (normalized.includes('text') || normalized.includes('condition') || normalized.includes('status') || normalized.includes('qualitative')) {
        return 'TEXT_CONDITION';
    }
    // Count/numeric (default)
    if (normalized.includes('count') || normalized.includes('numeric') || normalized.includes('number') || normalized.includes('quantity')) {
        return 'COUNT';
    }
    // Default to count for any unrecognized type
    return 'COUNT';
}
function parseCurrentValue(currentValue, targetType) {
    if (!currentValue && currentValue !== '0') {
        // Return appropriate default based on type
        if (targetType === 'MILESTONE') return 0;
        if (targetType === 'TEXT_CONDITION') return '';
        return 0;
    }
    switch(targetType){
        case 'MILESTONE':
            // Parse as 0 or 1
            return parseInt(currentValue) === 1 ? 1 : 0;
        case 'COUNT':
            // Parse as integer
            return parseInt(currentValue) || 0;
        case 'PERCENTAGE':
        case 'FINANCIAL':
            // Parse as decimal
            return parseFloat(currentValue) || 0;
        case 'TEXT_CONDITION':
            // Return as string
            return currentValue;
        default:
            return parseFloat(currentValue) || 0;
    }
}
function formatCurrentValueForDB(value) {
    if (value === null || value === undefined || value === '') return null;
    return String(value);
}
function calculateAchievement(currentValue, targetValue, targetType) {
    switch(targetType){
        case 'MILESTONE':
            // Binary: 0% or 100%
            return currentValue === 1 || currentValue === '1' ? 100 : 0;
        case 'TEXT_CONDITION':
            // Qualitative mapping
            if (currentValue === 'Met') return 100;
            if (currentValue === 'In Progress') return 50;
            return 0; // Not Met
        case 'COUNT':
        case 'PERCENTAGE':
        case 'FINANCIAL':
            // Numeric calculation
            const current = typeof currentValue === 'string' ? parseFloat(currentValue.replace(/,/g, '')) : currentValue;
            const target = typeof targetValue === 'string' ? parseFloat(targetValue.replace(/,/g, '')) : targetValue;
            if (!target || target === 0) return 0;
            return current / target * 100;
        default:
            return 0;
    }
}
function determineStatus(achievementPercent, targetType, currentValue) {
    // Special handling for text conditions
    if (targetType === 'TEXT_CONDITION') {
        if (currentValue === 'Met') return 'MET';
        if (currentValue === 'In Progress') return 'ON_TRACK';
        if (currentValue === 'Not Met') return 'MISSED';
        return 'PENDING';
    }
    // Milestone: only MET or PENDING
    if (targetType === 'MILESTONE') {
        return achievementPercent === 100 ? 'MET' : 'PENDING';
    }
    // Numeric thresholds
    if (achievementPercent >= 100) return 'MET';
    if (achievementPercent >= 80) return 'ON_TRACK';
    if (achievementPercent > 0) return 'MISSED';
    return 'PENDING';
}
}),
"[project]/app/api/kpi-progress/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "PATCH",
    ()=>PATCH
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$middleware$2f$auth$2d$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/middleware/auth-middleware.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2f$strategic_plan$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/lib/data/strategic_plan.json (json)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$qpro$2d$aggregation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils/qpro-aggregation.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$target$2d$type$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils/target-type-utils.ts [app-route] (ecmascript)");
;
;
;
;
;
;
// Helper to map strategic plan target types
function mapTargetTypeFromPlan(planType) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$target$2d$type$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mapTargetType"])(planType);
}
async function GET(request) {
    try {
        const authResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$middleware$2f$auth$2d$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireAuth"])(request);
        if ('status' in authResult) return authResult;
        const { searchParams } = new URL(request.url);
        const kraId = searchParams.get('kraId');
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
        const quarter = searchParams.get('quarter') ? parseInt(searchParams.get('quarter')) : undefined;
        // Get KRA from strategic plan using normalized ID
        const allKras = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2f$strategic_plan$2e$json__$28$json$29$__["default"].kras || [];
        const normalizedKraIdParam = kraId ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$qpro$2d$aggregation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeKraId"])(kraId) : null;
        const targetKra = normalizedKraIdParam ? allKras.find((k)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$qpro$2d$aggregation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeKraId"])(k.kra_id) === normalizedKraIdParam) : null;
        if (kraId && !targetKra) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'KRA not found'
            }, {
                status: 404
            });
        }
        // Build query conditions for aggregation activities
        const whereConditions = {
            isApproved: true
        };
        // Get approved aggregation activities
        const aggregationActivities = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].aggregationActivity.findMany({
            where: whereConditions,
            include: {
                qproAnalysis: {
                    select: {
                        year: true,
                        quarter: true,
                        unitId: true,
                        unit: {
                            select: {
                                id: true,
                                name: true,
                                code: true
                            }
                        }
                    }
                }
            }
        });
        // Also get from KRAggregation table for aggregated data
        // NOTE: kra_id may be stored as "KRA3" or "KRA 3" depending on historical data.
        const kraIdVariants = (()=>{
            if (!kraId) return null;
            const normalized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$qpro$2d$aggregation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeKraId"])(kraId);
            const compact = normalized.replace(/\s+/g, '');
            return Array.from(new Set([
                kraId,
                normalized,
                compact
            ]));
        })();
        // Get KPIContributions - the source of truth for per-document contributions
        const kpiContributions = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].kPIContribution.findMany({
            where: {
                year,
                ...quarter && {
                    quarter
                },
                ...kraIdVariants && {
                    kra_id: {
                        in: kraIdVariants
                    }
                }
            }
        });
        // Build contribution totals by KPI (sum of all per-document contributions)
        const contributionTotals = new Map();
        for (const contrib of kpiContributions){
            const key = `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$qpro$2d$aggregation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeKraId"])(contrib.kra_id)}|${contrib.initiative_id}|${contrib.year}|${contrib.quarter}`;
            const existing = contributionTotals.get(key) || {
                total: 0,
                count: 0,
                targetType: contrib.target_type
            };
            existing.total += contrib.value;
            existing.count += 1;
            contributionTotals.set(key, existing);
        }
        const kraAggregations = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].kRAggregation.findMany({
            where: {
                year,
                ...quarter && {
                    quarter
                },
                ...kraIdVariants && {
                    kra_id: {
                        in: kraIdVariants
                    }
                }
            }
        });
        // Build progress map
        const progressMap = new Map();
        const toFiniteNumber = (raw)=>{
            if (raw === null || raw === undefined) return null;
            const n = typeof raw === 'number' ? raw : Number(String(raw).replace(/,/g, '').trim());
            return Number.isFinite(n) ? n : null;
        };
        // Process aggregation activities
        for (const activity of aggregationActivities){
            const qpro = activity.qproAnalysis;
            if (!qpro) continue;
            // Filter by year and quarter
            if (qpro.year !== year) continue;
            if (quarter && qpro.quarter !== quarter) continue;
            const initiativeId = activity.initiative_id;
            // Extract KRA from initiative ID (e.g., "KRA1-KPI1" -> "KRA 1") using normalized format
            const kraMatch = initiativeId.match(/^(KRA\s?\d+)/i);
            const rawKraId = kraMatch ? kraMatch[1] : null;
            const activityKraId = rawKraId ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$qpro$2d$aggregation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeKraId"])(rawKraId) : null;
            // Use normalized comparison for KRA ID filtering
            if (kraId && activityKraId !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$qpro$2d$aggregation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeKraId"])(kraId)) continue;
            if (!activityKraId) continue;
            // Initialize maps
            if (!progressMap.has(activityKraId)) {
                progressMap.set(activityKraId, new Map());
            }
            const kraMap = progressMap.get(activityKraId);
            if (!kraMap.has(initiativeId)) {
                kraMap.set(initiativeId, []);
            }
            const progressItems = kraMap.get(initiativeId);
            // Find or create progress item for this year/quarter
            let progressItem = progressItems.find((p)=>p.year === qpro.year && p.quarter === qpro.quarter);
            if (!progressItem) {
                // Get target from strategic plan using normalized KRA ID
                const normalizedActKraId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$qpro$2d$aggregation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeKraId"])(activityKraId);
                const kra = allKras.find((k)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$qpro$2d$aggregation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeKraId"])(k.kra_id) === normalizedActKraId);
                const initiative = kra?.initiatives.find((i)=>i.id === initiativeId);
                const timelineData = initiative?.targets?.timeline_data?.find((t)=>t.year === qpro.year);
                // Map target type from strategic plan
                const planTargetType = initiative?.targets?.type || 'count';
                const targetType = mapTargetTypeFromPlan(planTargetType);
                progressItem = {
                    initiativeId,
                    year: qpro.year,
                    quarter: qpro.quarter,
                    targetValue: timelineData?.target_value ?? 0,
                    currentValue: 0,
                    achievementPercent: 0,
                    status: 'PENDING',
                    submissionCount: 0,
                    participatingUnits: [],
                    targetType,
                    manualOverride: null,
                    manualOverrideReason: null,
                    manualOverrideBy: null,
                    manualOverrideAt: null,
                    valueSource: 'none'
                };
                progressItems.push(progressItem);
            }
            // Aggregate reported values.
            // NOTE: For percentage KPIs we must NOT sum across units/activities; we aggregate as a mean measurement.
            if (activity.reported != null) {
                const reported = toFiniteNumber(activity.reported);
                if (reported !== null) {
                    const meta = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$qpro$2d$aggregation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getInitiativeTargetMeta"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2f$strategic_plan$2e$json__$28$json$29$__["default"], activityKraId, initiativeId, qpro.year);
                    const targetType = String(meta.targetType || '').toLowerCase();
                    if (targetType === 'percentage') {
                        // Normalize percent:
                        // - Accept 0..100
                        // - If reported is a count and activity.target is a denominator, convert to percent
                        let pct = null;
                        if (reported >= 0 && reported <= 100) {
                            pct = reported;
                        } else {
                            const denom = toFiniteNumber(activity.target);
                            if (denom !== null && denom > 0 && reported >= 0) {
                                const computed = reported / denom * 100;
                                if (computed >= 0 && computed <= 100) pct = computed;
                            }
                        }
                        if (pct !== null) {
                            const sumKey = '_pctSum';
                            const countKey = '_pctCount';
                            progressItem[sumKey] = (progressItem[sumKey] || 0) + pct;
                            progressItem[countKey] = (progressItem[countKey] || 0) + 1;
                        }
                    } else {
                        const currentNum = typeof progressItem.currentValue === 'number' ? progressItem.currentValue : 0;
                        progressItem.currentValue = currentNum + reported;
                    }
                }
            }
            progressItem.submissionCount++;
            // Track participating units
            if (qpro.unit && !progressItem.participatingUnits.includes(qpro.unit.code)) {
                progressItem.participatingUnits.push(qpro.unit.code);
            }
        }
        // Also use KRAggregation data for more accurate totals
        for (const agg of kraAggregations){
            const kraMapKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$qpro$2d$aggregation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeKraId"])(agg.kra_id);
            if (!progressMap.has(kraMapKey)) {
                progressMap.set(kraMapKey, new Map());
            }
            const kraMap = progressMap.get(kraMapKey);
            if (!kraMap.has(agg.initiative_id)) {
                kraMap.set(agg.initiative_id, []);
            }
            const progressItems = kraMap.get(agg.initiative_id);
            // Find or update progress item
            let progressItem = progressItems.find((p)=>p.year === agg.year && p.quarter === agg.quarter);
            // Determine value source and final current value
            const hasManualOverride = agg.manual_override !== null && agg.manual_override !== undefined;
            const qproValue = agg.total_reported ?? 0;
            const finalValue = hasManualOverride ? agg.manual_override?.toNumber() ?? qproValue : qproValue;
            const valueSource = hasManualOverride ? 'manual' : qproValue > 0 ? 'qpro' : 'none';
            if (!progressItem) {
                progressItem = {
                    initiativeId: agg.initiative_id,
                    year: agg.year,
                    quarter: agg.quarter,
                    targetValue: agg.target_value?.toNumber() ?? 0,
                    currentValue: finalValue,
                    achievementPercent: agg.achievement_percent?.toNumber() ?? 0,
                    status: agg.status || 'PENDING',
                    submissionCount: agg.submission_count,
                    participatingUnits: agg.participating_units || [],
                    targetType: agg.target_type || 'COUNT',
                    manualOverride: hasManualOverride ? agg.manual_override?.toNumber() : null,
                    manualOverrideReason: agg.manual_override_reason || null,
                    manualOverrideBy: agg.manual_override_by || null,
                    manualOverrideAt: agg.manual_override_at?.toISOString() || null,
                    valueSource
                };
                progressItems.push(progressItem);
            } else {
                // Update with aggregation data (more accurate)
                progressItem.currentValue = finalValue;
                if (agg.achievement_percent != null) {
                    progressItem.achievementPercent = agg.achievement_percent.toNumber();
                }
                if (agg.status) {
                    progressItem.status = agg.status;
                }
                // Add manual override info
                progressItem.manualOverride = hasManualOverride ? agg.manual_override?.toNumber() : null;
                progressItem.manualOverrideReason = agg.manual_override_reason || null;
                progressItem.manualOverrideBy = agg.manual_override_by || null;
                progressItem.manualOverrideAt = agg.manual_override_at?.toISOString() || null;
                progressItem.valueSource = valueSource;
            }
        }
        // Finalize percentage KPI averages and calculate achievement/status for items without aggregation data
        for (const [kraIdKey, kraMap] of progressMap){
            for (const [initiativeIdKey, progressItems] of kraMap){
                for (const item of progressItems){
                    // If we accumulated pct values, convert to mean
                    const pctCount = item._pctCount;
                    const pctSum = item._pctSum;
                    if (pctCount && pctSum !== undefined) {
                        // Store as an integer percent for consistency with DB/UI inputs.
                        item.currentValue = Math.round(pctSum / pctCount);
                    }
                    // Prefer explicit aggregation table if present; otherwise compute from current/target.
                    const currentNum = typeof item.currentValue === 'number' ? item.currentValue : parseFloat(String(item.currentValue)) || 0;
                    if (item.achievementPercent === 0 && currentNum > 0) {
                        const target = typeof item.targetValue === 'number' ? item.targetValue : parseFloat(String(item.targetValue)) || 0;
                        if (target > 0) {
                            item.achievementPercent = Math.round(currentNum / target * 100 * 100) / 100;
                        }
                    }
                    // Clamp for UI progress bars
                    item.achievementPercent = Math.min(100, Math.max(0, item.achievementPercent || 0));
                    // Only clamp currentValue for percentage KPIs.
                    const meta = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$qpro$2d$aggregation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getInitiativeTargetMeta"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2f$strategic_plan$2e$json__$28$json$29$__["default"], kraIdKey, initiativeIdKey, item.year);
                    const targetType = String(meta.targetType || '').toLowerCase();
                    if (targetType === 'percentage') {
                        item.currentValue = Math.min(100, Math.max(0, currentNum));
                    }
                    // Update status based on achievement
                    if (item.status === 'PENDING' && item.achievementPercent > 0) {
                        if (item.achievementPercent >= 100) {
                            item.status = 'MET';
                        } else if (item.achievementPercent >= 80) {
                            item.status = 'ON_TRACK';
                        } else {
                            item.status = 'MISSED';
                        }
                    }
                }
            }
        }
        // Build response
        const krasToProcess = kraId ? [
            targetKra
        ] : allKras;
        const response = [];
        for (const kra of krasToProcess){
            if (!kra) continue;
            // Use normalized KRA ID for consistent lookup
            const normalizedKraIdForLookup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$qpro$2d$aggregation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeKraId"])(kra.kra_id);
            const kraProgress = {
                kraId: kra.kra_id,
                kraTitle: kra.kra_title,
                initiatives: []
            };
            for (const initiative of kra.initiatives || []){
                const kraMap = progressMap.get(normalizedKraIdForLookup);
                const progressItems = kraMap?.get(initiative.id) || [];
                // If no progress data exists, create empty entries for the year
                if (progressItems.length === 0) {
                    const timelineData = initiative.targets?.timeline_data?.find((t)=>t.year === year);
                    if (timelineData) {
                        // Create entries for all quarters if no specific quarter requested
                        const quartersToCreate = quarter ? [
                            quarter
                        ] : [
                            1,
                            2,
                            3,
                            4
                        ];
                        for (const q of quartersToCreate){
                            // Map target type from strategic plan
                            const planTargetType = initiative.targets?.type || 'count';
                            const targetType = mapTargetTypeFromPlan(planTargetType);
                            progressItems.push({
                                initiativeId: initiative.id,
                                year,
                                quarter: q,
                                targetValue: timelineData.target_value,
                                currentValue: 0,
                                achievementPercent: 0,
                                status: 'PENDING',
                                submissionCount: 0,
                                participatingUnits: [],
                                targetType,
                                manualOverride: null,
                                manualOverrideReason: null,
                                manualOverrideBy: null,
                                manualOverrideAt: null,
                                valueSource: 'none'
                            });
                        }
                    }
                }
                kraProgress.initiatives.push({
                    id: initiative.id,
                    outputs: initiative.key_performance_indicator?.outputs || '',
                    outcomes: initiative.key_performance_indicator?.outcomes || '',
                    targetType: initiative.targets?.type || 'count',
                    progress: progressItems
                });
            }
            response.push(kraProgress);
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            year,
            quarter,
            data: kraId ? response[0] : response
        });
    } catch (error) {
        console.error('Error fetching KPI progress:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to fetch KPI progress',
            details: error.message
        }, {
            status: 500
        });
    }
}
async function PATCH(request) {
    try {
        const authResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$middleware$2f$auth$2d$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireAuth"])(request);
        if ('status' in authResult) return authResult;
        const { user } = authResult;
        const body = await request.json();
        const { kraId, initiativeId, year, quarter, value, reason, targetType } = body;
        // Validate required fields
        if (!kraId || !initiativeId || !year || !quarter) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Missing required fields: kraId, initiativeId, year, quarter'
            }, {
                status: 400
            });
        }
        // Determine targetType if not provided
        let finalTargetType = targetType;
        if (!finalTargetType) {
            // Get from strategic plan
            const allKras = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2f$strategic_plan$2e$json__$28$json$29$__["default"].kras || [];
            const normalizedKraId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$qpro$2d$aggregation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeKraId"])(kraId);
            const targetKra = allKras.find((k)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$qpro$2d$aggregation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeKraId"])(k.kra_id) === normalizedKraId);
            const initiative = targetKra?.initiatives?.find((i)=>i.id === initiativeId);
            finalTargetType = mapTargetTypeFromPlan(initiative?.targets?.type || 'count');
        }
        // Normalize KRA ID for database lookup
        const normalizedKraId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$qpro$2d$aggregation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeKraId"])(kraId);
        const kraIdVariants = [
            kraId,
            normalizedKraId,
            normalizedKraId.replace(/\s+/g, '')
        ];
        // Find existing aggregation record
        const existingAgg = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].kRAggregation.findFirst({
            where: {
                kra_id: {
                    in: kraIdVariants
                },
                initiative_id: initiativeId,
                year,
                quarter
            }
        });
        if (!existingAgg) {
            // Create a new aggregation record if it doesn't exist
            // Get target from strategic plan
            const allKras = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2f$strategic_plan$2e$json__$28$json$29$__["default"].kras || [];
            const targetKra = allKras.find((k)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$qpro$2d$aggregation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeKraId"])(k.kra_id) === normalizedKraId);
            const initiative = targetKra?.initiatives?.find((i)=>i.id === initiativeId);
            const timelineData = initiative?.targets?.timeline_data?.find((t)=>t.year === year);
            const targetValue = timelineData?.target_value ?? 0;
            // Calculate achievement based on target type
            let achievementPercent = 0;
            let manualOverrideNum = null;
            let status = 'NOT_APPLICABLE';
            if (value !== null) {
                if (finalTargetType === 'TEXT_CONDITION') {
                    // Qualitative mapping for text conditions
                    if (value === 'Met') {
                        achievementPercent = 100;
                        status = 'MET';
                    } else if (value === 'In Progress') {
                        achievementPercent = 50;
                        status = 'ON_TRACK';
                    } else {
                        achievementPercent = 0;
                        status = 'MISSED';
                    }
                // Don't set manualOverrideNum for TEXT_CONDITION - keep it null
                } else if (finalTargetType === 'MILESTONE') {
                    // Binary: 0% or 100%
                    achievementPercent = value === 1 || value === '1' ? 100 : 0;
                    manualOverrideNum = value === 1 || value === '1' ? 1 : 0;
                    status = value === 1 || value === '1' ? 'MET' : 'NOT_APPLICABLE';
                } else {
                    // Numeric types: COUNT, PERCENTAGE, FINANCIAL
                    const numValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/,/g, '')) || 0;
                    const targetNum = typeof targetValue === 'number' ? targetValue : parseFloat(String(targetValue)) || 0;
                    achievementPercent = targetNum > 0 ? numValue / targetNum * 100 : 0;
                    manualOverrideNum = numValue;
                    // Determine status
                    if (achievementPercent >= 100) {
                        status = 'MET';
                    } else if (achievementPercent >= 80) {
                        status = 'ON_TRACK';
                    } else if (numValue > 0) {
                        status = 'MISSED';
                    }
                }
            }
            const newAgg = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].kRAggregation.create({
                data: {
                    kra_id: normalizedKraId,
                    kra_title: targetKra?.kra_title || '',
                    initiative_id: initiativeId,
                    year,
                    quarter,
                    total_reported: 0,
                    target_value: typeof targetValue === 'number' ? targetValue : parseFloat(String(targetValue)) || 0,
                    achievement_percent: achievementPercent,
                    submission_count: 0,
                    participating_units: [],
                    status,
                    target_type: finalTargetType,
                    current_value: value !== null ? String(value) : null,
                    manual_override: manualOverrideNum,
                    manual_override_reason: reason || null,
                    manual_override_by: user.id,
                    manual_override_at: new Date()
                }
            });
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                message: 'Manual override created',
                data: {
                    id: newAgg.id,
                    kraId: normalizedKraId,
                    initiativeId,
                    year,
                    quarter,
                    value: value,
                    valueSource: value !== null ? 'manual' : 'none'
                }
            });
        }
        // Update existing record with manual override
        const targetValue = existingAgg.target_value?.toNumber() ?? 0;
        // Calculate achievement and status based on target type
        let achievementPercent = 0;
        let effectiveValue = value !== null ? value : existingAgg.total_reported ?? 0;
        let manualOverrideNum = null;
        let status = 'NOT_APPLICABLE';
        if (value !== null) {
            if (finalTargetType === 'TEXT_CONDITION') {
                // Qualitative mapping for text conditions
                if (value === 'Met') {
                    achievementPercent = 100;
                    status = 'MET';
                } else if (value === 'In Progress') {
                    achievementPercent = 50;
                    status = 'ON_TRACK';
                } else {
                    achievementPercent = 0;
                    status = 'MISSED';
                }
                effectiveValue = String(value);
            } else if (finalTargetType === 'MILESTONE') {
                // Binary: 0% or 100%
                const isAchieved = value === 1 || value === '1';
                achievementPercent = isAchieved ? 100 : 0;
                status = isAchieved ? 'MET' : 'NOT_APPLICABLE';
                manualOverrideNum = isAchieved ? 1 : 0;
                effectiveValue = manualOverrideNum;
            } else {
                // Numeric types: COUNT, PERCENTAGE, FINANCIAL
                const numValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/,/g, '')) || 0;
                effectiveValue = numValue;
                manualOverrideNum = numValue;
                if (targetValue > 0) {
                    achievementPercent = numValue / targetValue * 100;
                }
                // Determine status based on achievement
                if (achievementPercent >= 100) {
                    status = 'MET';
                } else if (achievementPercent >= 80) {
                    status = 'ON_TRACK';
                } else if (numValue > 0) {
                    status = 'MISSED';
                }
            }
        } else {
            // Clearing override - use existing QPRO value
            const qproValue = existingAgg.total_reported ?? 0;
            effectiveValue = qproValue;
            if (targetValue > 0 && qproValue > 0) {
                achievementPercent = qproValue / targetValue * 100;
                if (achievementPercent >= 100) status = 'MET';
                else if (achievementPercent >= 80) status = 'ON_TRACK';
                else status = 'MISSED';
            }
        }
        const updatedAgg = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].kRAggregation.update({
            where: {
                id: existingAgg.id
            },
            data: {
                target_type: finalTargetType,
                current_value: value !== null ? String(value) : existingAgg.current_value,
                manual_override: manualOverrideNum,
                manual_override_reason: value !== null ? reason || null : null,
                manual_override_by: value !== null ? user.id : null,
                manual_override_at: value !== null ? new Date() : null,
                achievement_percent: achievementPercent,
                status
            }
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: value !== null ? 'Manual override saved' : 'Manual override cleared',
            data: {
                id: updatedAgg.id,
                kraId: existingAgg.kra_id,
                initiativeId,
                year,
                quarter,
                currentValue: effectiveValue,
                manualOverride: value,
                qproValue: existingAgg.total_reported,
                achievementPercent,
                status,
                targetType: finalTargetType,
                valueSource: value !== null ? 'manual' : (existingAgg.total_reported ?? 0) > 0 ? 'qpro' : 'none'
            }
        });
    } catch (error) {
        console.error('Error saving KPI manual override:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to save manual override',
            details: error.message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__5f0ccaaf._.js.map