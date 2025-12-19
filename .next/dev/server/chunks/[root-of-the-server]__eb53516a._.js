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
"[project]/lib/services/document-section-detector.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * DocumentSectionDetector Service
 * 
 * Identifies and extracts document sections (e.g., Alumni Employment, Research Projects, Training)
 * before text extraction to provide context for LLM analysis.
 * 
 * Solves Problem #1: Missing Document Sections
 * - Detects document structure before processing
 * - Provides section boundaries to LLM
 * - Enables targeted extraction per section
 */ __turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "documentSectionDetector",
    ()=>documentSectionDetector
]);
class DocumentSectionDetector {
    /**
   * Section patterns organized by type with priority ordering
   * Higher priority patterns are checked first
   */ sectionPatterns = {
        TRAINING: [
            // Primary patterns - highest confidence
            {
                pattern: /(?:training|seminar|workshop|conference)[\s\w]*(?:report|accomplished)?(?:\n|:|$)/i,
                priority: 1,
                confidence: 0.95
            },
            {
                pattern: /training.*table|training.*entries/i,
                priority: 1,
                confidence: 0.95
            },
            {
                pattern: /^(faculty|staff)?\s*training\s+(report|activities)?/im,
                priority: 1,
                confidence: 0.90
            },
            // Secondary patterns
            {
                pattern: /conducted\s+(training|workshop|seminar)/i,
                priority: 2,
                confidence: 0.85
            },
            {
                pattern: /participants?\s*:.*\d+|attendee|trained/i,
                priority: 2,
                confidence: 0.80
            },
            {
                pattern: /introduction\s+to|orientation|skill\s+development/i,
                priority: 2,
                confidence: 0.75
            }
        ],
        ALUMNI_EMPLOYMENT: [
            // Primary patterns
            {
                pattern: /alumni\s+(employment|tracking|survey|profile|database)/i,
                priority: 1,
                confidence: 0.98
            },
            {
                pattern: /graduate.*employment|employment.*graduate/i,
                priority: 1,
                confidence: 0.95
            },
            {
                pattern: /alumni\s+(?:activities|report|data)/i,
                priority: 1,
                confidence: 0.92
            },
            // Secondary patterns
            {
                pattern: /employed|placement|job\s+placement|career/i,
                priority: 2,
                confidence: 0.80
            },
            {
                pattern: /alumni|graduate\s+tracking/i,
                priority: 2,
                confidence: 0.78
            }
        ],
        RESEARCH: [
            // Primary patterns
            {
                pattern: /research\s+(output|project|publication|activity|paper|study)/i,
                priority: 1,
                confidence: 0.97
            },
            {
                pattern: /published|publication|journal.*article/i,
                priority: 1,
                confidence: 0.95
            },
            {
                pattern: /research\s+(?:accomplishment|report|result)/i,
                priority: 1,
                confidence: 0.93
            },
            // Secondary patterns
            {
                pattern: /study|investigation|scholarly\s+work/i,
                priority: 2,
                confidence: 0.75
            },
            {
                pattern: /conference\s+paper|research\s+grant/i,
                priority: 2,
                confidence: 0.85
            }
        ],
        COMMUNITY_ENGAGEMENT: [
            // Primary patterns
            {
                pattern: /extension|outreach|community\s+(service|program|engagement)/i,
                priority: 1,
                confidence: 0.96
            },
            {
                pattern: /community.*service|outreach.*program/i,
                priority: 1,
                confidence: 0.94
            },
            {
                pattern: /livelihood|skills?\s+training.*community/i,
                priority: 1,
                confidence: 0.92
            },
            // Secondary patterns
            {
                pattern: /beneficiary|assisted|served.*community/i,
                priority: 2,
                confidence: 0.80
            },
            {
                pattern: /program.*community|community.*initiative/i,
                priority: 2,
                confidence: 0.78
            }
        ]
    };
    /**
   * Detects document format by analyzing structural patterns
   */ detectDocumentType(text) {
        // Count table indicators
        const tableIndicators = (text.match(/\t|\|/g) || []).length;
        const lineBreaks = (text.match(/\n/g) || []).length;
        const tableRatio = tableIndicators / Math.max(lineBreaks, 1);
        // Count narrative indicators
        const sentences = (text.match(/\.\s+[A-Z]/g) || []).length;
        const paragraphs = (text.match(/\n\n+/g) || []).length;
        // Determine type based on ratios
        if (tableRatio > 0.3) {
            return 'TABLE';
        } else if (sentences > 5 && paragraphs > 2) {
            return 'NARRATIVE';
        } else if (tableRatio > 0.1 && sentences > 3) {
            return 'MIXED';
        } else {
            return 'UNSTRUCTURED';
        }
    }
    /**
   * Identifies section boundaries using pattern matching
   */ identifySectionBoundaries(text) {
        const boundaries = [];
        // Search for each section type
        for (const [sectionType, patterns] of Object.entries(this.sectionPatterns)){
            for (const { pattern } of patterns){
                let match;
                const regex = new RegExp(pattern.source, 'gi');
                while((match = regex.exec(text)) !== null){
                    const startIndex = match.index;
                    // Find next section boundary or end of text
                    let endIndex = text.length;
                    const nextSectionMatch = this.findNextSectionBoundary(text, startIndex + match[0].length);
                    if (nextSectionMatch) {
                        endIndex = nextSectionMatch;
                    }
                    boundaries.push({
                        startIndex,
                        endIndex,
                        title: match[0].trim(),
                        type: sectionType
                    });
                }
            }
        }
        // Remove overlapping boundaries and sort by start index
        return this.deduplicateBoundaries(boundaries).sort((a, b)=>a.startIndex - b.startIndex);
    }
    /**
   * Finds the next section boundary by looking for section headers
   */ findNextSectionBoundary(text, startFrom) {
        const headerPattern = /\n[A-Z][A-Z\s:]+\n/g;
        let match;
        while((match = headerPattern.exec(text)) !== null){
            if (match.index > startFrom) {
                return match.index;
            }
        }
        return null;
    }
    /**
   * Removes overlapping boundaries, keeping the one with higher priority
   */ deduplicateBoundaries(boundaries) {
        const sorted = boundaries.sort((a, b)=>{
            // Sort by start index, then by span size
            if (a.startIndex !== b.startIndex) {
                return a.startIndex - b.startIndex;
            }
            return a.endIndex - b.endIndex;
        });
        const deduplicated = [];
        for (const boundary of sorted){
            const overlaps = deduplicated.some((b)=>boundary.startIndex >= b.startIndex && boundary.startIndex < b.endIndex);
            if (!overlaps) {
                deduplicated.push(boundary);
            }
        }
        return deduplicated;
    }
    /**
   * Calculates confidence score for section type detection
   */ calculateConfidence(content, sectionType) {
        const patterns = this.sectionPatterns[sectionType];
        let maxConfidence = 0;
        let matchCount = 0;
        for (const { pattern, confidence } of patterns){
            if (pattern.test(content)) {
                matchCount++;
                maxConfidence = Math.max(maxConfidence, confidence);
            }
        }
        // Boost confidence if multiple patterns match
        const confidenceBoost = Math.min(matchCount * 0.05, 0.1);
        return Math.min(maxConfidence + confidenceBoost, 1.0);
    }
    /**
   * Main method: Detects all sections in a document
   */ async detectSections(text) {
        if (!text || text.trim().length === 0) {
            return {
                sections: [],
                documentType: 'UNSTRUCTURED',
                totalSections: 0,
                analysisMetadata: {
                    textLength: 0,
                    detectionConfidence: 0,
                    sectionsDetected: []
                }
            };
        }
        // Detect document type
        const documentType = this.detectDocumentType(text);
        // Identify section boundaries
        const boundaries = this.identifySectionBoundaries(text);
        // Extract sections with content
        const sections = boundaries.map((boundary)=>({
                type: this.mapSectionType(boundary.type),
                title: boundary.title,
                startIndex: boundary.startIndex,
                endIndex: boundary.endIndex,
                content: text.substring(boundary.startIndex, boundary.endIndex),
                confidence: this.calculateConfidence(text.substring(boundary.startIndex, boundary.endIndex), boundary.type)
            }));
        // Calculate overall detection confidence
        const overallConfidence = sections.length > 0 ? sections.reduce((sum, s)=>sum + s.confidence, 0) / sections.length : 0;
        return {
            sections,
            documentType,
            totalSections: sections.length,
            analysisMetadata: {
                textLength: text.length,
                detectionConfidence: overallConfidence,
                sectionsDetected: [
                    ...new Set(sections.map((s)=>s.type))
                ]
            }
        };
    }
    /**
   * Maps section type string to enum value
   */ mapSectionType(type) {
        const typeMap = {
            TRAINING: 'TRAINING',
            ALUMNI_EMPLOYMENT: 'ALUMNI_EMPLOYMENT',
            RESEARCH: 'RESEARCH',
            COMMUNITY_ENGAGEMENT: 'COMMUNITY_ENGAGEMENT'
        };
        return typeMap[type] || 'UNKNOWN';
    }
    /**
   * Extracts specific section by type
   */ getSectionByType(sections, type) {
        return sections.find((s)=>s.type === type);
    }
    /**
   * Extracts all sections of a specific type
   */ getSectionsByType(sections, type) {
        return sections.filter((s)=>s.type === type);
    }
    /**
   * Generates section summary for logging/debugging
   */ generateSectionSummary(result) {
        const lines = [
            `Document Type: ${result.documentType}`,
            `Total Sections Detected: ${result.totalSections}`,
            `Overall Detection Confidence: ${(result.analysisMetadata.detectionConfidence * 100).toFixed(1)}%`,
            `Document Length: ${result.analysisMetadata.textLength} characters`,
            '',
            'Sections Found:'
        ];
        for (const section of result.sections){
            lines.push(`  - ${section.type} (${section.title}): ${section.content.length} chars, ${(section.confidence * 100).toFixed(1)}% confidence`);
        }
        return lines.join('\n');
    }
}
const documentSectionDetector = new DocumentSectionDetector();
const __TURBOPACK__default__export__ = documentSectionDetector;
}),
"[project]/lib/services/summary-extractor.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * SummaryExtractor Service
 * 
 * Extracts summary metrics and aggregate values from documents
 * (e.g., "Total No. of Attendees: 9") to use for achievement calculations
 * instead of counting extracted rows.
 * 
 * Solves Problems #2 and #3:
 * - Problem #2: Incomplete Data Extraction (system should use summary totals)
 * - Problem #3: Wrong Achievement Calculations (prioritize summary metrics)
 */ __turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "summaryExtractor",
    ()=>summaryExtractor
]);
class SummaryExtractor {
    /**
   * Patterns for extracting summary metrics
   * Organized by priority and metric type
   */ summaryPatterns = {
        // Highest priority: "Total No. of X" patterns
        totalMetrics: [
            {
                pattern: /total\s+(?:no\.|number)\s+(?:of\s+)?([a-z\s]+)[\s:]*(\d+)/gi,
                metricType: 'TOTAL',
                confidence: 0.98,
                valueGroup: 2
            },
            {
                pattern: /total\s+([a-z\s]+)[\s:]*(\d+)/gi,
                metricType: 'TOTAL',
                confidence: 0.95,
                valueGroup: 2
            },
            {
                pattern: /(?:total|sum|cumulative)\s+([a-z\s]+)[\s:]*(\d+)/gi,
                metricType: 'COUNT',
                confidence: 0.92,
                valueGroup: 2
            }
        ],
        // Attendance/participant metrics
        participantMetrics: [
            {
                pattern: /attendee|participant|trained|beneficiary[\s\w]*[\s:]*(\d+)/gi,
                metricType: 'COUNT',
                confidence: 0.90,
                valueGroup: 1
            },
            {
                pattern: /(?:no\.|number)\s+of\s+(?:attendee|participant|trainee|beneficiary)[\s:]*(\d+)/gi,
                metricType: 'COUNT',
                confidence: 0.93,
                valueGroup: 1
            },
            {
                pattern: /attended|participated[\s\w]*:\s*(\d+)/gi,
                metricType: 'COUNT',
                confidence: 0.88,
                valueGroup: 1
            }
        ],
        // Financial metrics
        financialMetrics: [
            {
                pattern: /(?:budget|cost|amount|fund)[\s\w]*[\s:]*(?:php|₱)?[\s]*([0-9,\.]+)/gi,
                metricType: 'FINANCIAL',
                confidence: 0.90,
                valueGroup: 1
            },
            {
                pattern: /(?:peso|php)[\s]*([0-9,\.]+)/gi,
                metricType: 'FINANCIAL',
                confidence: 0.92,
                valueGroup: 1
            }
        ],
        // Percentage metrics
        percentageMetrics: [
            {
                pattern: /(\d+(?:\.\d+)?)\s*%/g,
                metricType: 'PERCENTAGE',
                confidence: 0.85,
                valueGroup: 1
            },
            {
                pattern: /(?:completion|success|achievement)\s+rate[\s:]*(\d+(?:\.\d+)?)\s*%/gi,
                metricType: 'PERCENTAGE',
                confidence: 0.92,
                valueGroup: 1
            }
        ],
        // Milestone metrics (yes/no, completed, achieved)
        milestoneMetrics: [
            {
                pattern: /(?:completed|achieved|accomplished|finished|done)[\s\w]*[:=]\s*(?:yes|true|1|done|completed)/gi,
                metricType: 'MILESTONE',
                confidence: 0.90,
                valueGroup: 0
            }
        ]
    };
    /**
   * Extracts all summary metrics from text
   */ async extractSummaries(text) {
        if (!text || text.trim().length === 0) {
            return {
                summaries: [],
                totalExtracted: 0,
                extractionMetadata: {
                    textLength: 0,
                    metricsFound: 0,
                    highConfidenceCount: 0
                }
            };
        }
        const summaries = [];
        const seenMetrics = new Set();
        // Extract from each pattern category
        for (const [categoryName, patterns] of Object.entries(this.summaryPatterns)){
            for (const patternObj of patterns){
                let match;
                const regex = new RegExp(patternObj.pattern.source, 'gi');
                while((match = regex.exec(text)) !== null){
                    // Extract value from the appropriate group
                    const rawValue = patternObj.valueGroup === 0 ? 1 : match[patternObj.valueGroup];
                    // Skip if value doesn't exist
                    if (rawValue === undefined) {
                        continue;
                    }
                    const value = String(rawValue);
                    const metricName = match[1] || categoryName;
                    const metricKey = `${patternObj.metricType}:${metricName}:${value}`;
                    // Skip duplicates
                    if (seenMetrics.has(metricKey)) {
                        continue;
                    }
                    seenMetrics.add(metricKey);
                    const extractedSummary = {
                        metricType: patternObj.metricType,
                        metricName: this.normalizeName(metricName),
                        value: this.parseValue(value, patternObj.metricType),
                        confidence: patternObj.confidence,
                        rawText: match[0],
                        unit: this.extractUnit(match[0], patternObj.metricType)
                    };
                    summaries.push(extractedSummary);
                }
            }
        }
        // Remove near-duplicates and sort by confidence
        const deduplicated = this.deduplicateSummaries(summaries);
        deduplicated.sort((a, b)=>b.confidence - a.confidence);
        // Identify prioritized/recommended value
        let prioritizedValue;
        if (deduplicated.length > 0) {
            // Priority: TOTAL > COUNT > PERCENTAGE > FINANCIAL > MILESTONE
            const priorityOrder = [
                'TOTAL',
                'COUNT',
                'PERCENTAGE',
                'FINANCIAL',
                'MILESTONE'
            ];
            const topMetric = deduplicated.sort((a, b)=>{
                const priorityDiff = priorityOrder.indexOf(a.metricType) - priorityOrder.indexOf(b.metricType);
                if (priorityDiff !== 0) return priorityDiff;
                return b.confidence - a.confidence;
            })[0];
            prioritizedValue = {
                metricName: topMetric.metricName,
                value: topMetric.value,
                metricType: topMetric.metricType,
                confidence: topMetric.confidence
            };
        }
        const highConfidenceCount = deduplicated.filter((s)=>s.confidence >= 0.9).length;
        return {
            summaries: deduplicated,
            totalExtracted: deduplicated.length,
            prioritizedValue,
            extractionMetadata: {
                textLength: text.length,
                metricsFound: deduplicated.length,
                highConfidenceCount,
                recommendedTargetValue: prioritizedValue && typeof prioritizedValue.value === 'number' ? prioritizedValue.value : undefined
            }
        };
    }
    /**
   * Extracts summary metrics from a specific section
   */ async extractFromSection(sectionContent, sectionType) {
        const result = await this.extractSummaries(sectionContent);
        // Filter metrics relevant to this section type
        const contextualSummaries = result.summaries.filter((summary)=>{
            return this.isRelevantToSection(summary.metricName, sectionType);
        });
        return {
            summaries: contextualSummaries,
            totalExtracted: contextualSummaries.length,
            prioritizedValue: contextualSummaries[0] ? {
                metricName: contextualSummaries[0].metricName,
                value: contextualSummaries[0].value,
                metricType: contextualSummaries[0].metricType,
                confidence: contextualSummaries[0].confidence
            } : undefined,
            extractionMetadata: {
                textLength: sectionContent.length,
                metricsFound: contextualSummaries.length,
                highConfidenceCount: contextualSummaries.filter((s)=>s.confidence >= 0.9).length,
                recommendedTargetValue: contextualSummaries[0] && typeof contextualSummaries[0].value === 'number' ? contextualSummaries[0].value : undefined
            }
        };
    }
    /**
   * Normalizes metric names to standard format
   */ normalizeName(name) {
        return name.toLowerCase().trim().replace(/\s+/g, ' ').replace(/^(of|no\.|number)\s+/i, '').split(' ').map((word)=>word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
    /**
   * Parses value to appropriate type
   */ parseValue(value, metricType) {
        if (metricType === 'FINANCIAL') {
            // Remove currency symbols and commas
            const cleaned = value.replace(/[^0-9.]/g, '');
            return parseFloat(cleaned) || value;
        }
        if (metricType === 'PERCENTAGE') {
            return parseFloat(value) || 0;
        }
        if (metricType === 'COUNT' || metricType === 'TOTAL') {
            // Remove commas and parse as number
            const cleaned = value.replace(/,/g, '');
            return parseInt(cleaned, 10) || 0;
        }
        if (metricType === 'MILESTONE') {
            return 1; // Milestone achieved = 1
        }
        return value;
    }
    /**
   * Extracts unit from metric text
   */ extractUnit(text, metricType) {
        if (metricType === 'FINANCIAL') {
            if (text.match(/php|₱/i)) return 'PHP';
            if (text.match(/peso/i)) return 'PHP';
        }
        if (metricType === 'PERCENTAGE') {
            return '%';
        }
        if (metricType === 'COUNT' || metricType === 'TOTAL') {
            const unitMatch = text.match(/(?:unit|person|participant|attendee|session)/i);
            if (unitMatch) return unitMatch[0];
        }
        return undefined;
    }
    /**
   * Removes near-duplicate summaries
   */ deduplicateSummaries(summaries) {
        const seen = new Map();
        for (const summary of summaries){
            const key = `${summary.metricType}:${summary.metricName}`;
            if (!seen.has(key)) {
                seen.set(key, summary);
            } else {
                // Keep the one with higher confidence
                const existing = seen.get(key);
                if (summary.confidence > existing.confidence) {
                    seen.set(key, summary);
                }
            }
        }
        return Array.from(seen.values());
    }
    /**
   * Checks if metric is relevant to section type
   */ isRelevantToSection(metricName, sectionType) {
        const relevanceMap = {
            TRAINING: /attendee|participant|trained|person|session/i,
            ALUMNI_EMPLOYMENT: /employed|placement|graduate|alumni|job/i,
            RESEARCH: /publication|paper|study|research|output/i,
            COMMUNITY_ENGAGEMENT: /beneficiary|participant|community|served|assisted/i
        };
        const pattern = relevanceMap[sectionType];
        return !pattern || pattern.test(metricName);
    }
    /**
   * Generates extraction summary for logging/debugging
   */ generateExtractionSummary(result) {
        const lines = [
            `Total Metrics Extracted: ${result.totalExtracted}`,
            `High Confidence (≥90%): ${result.extractionMetadata.highConfidenceCount}`,
            `Document Length: ${result.extractionMetadata.textLength} characters`,
            '',
            'Extracted Summaries:'
        ];
        for (const summary of result.summaries){
            lines.push(`  - ${summary.metricType}: ${summary.metricName} = ${summary.value}${summary.unit ? ' ' + summary.unit : ''} (${(summary.confidence * 100).toFixed(0)}% confidence)`);
        }
        if (result.prioritizedValue) {
            lines.push('');
            lines.push(`Recommended Target Value: ${result.prioritizedValue.value} (${result.prioritizedValue.metricType})`);
        }
        return lines.join('\n');
    }
}
const summaryExtractor = new SummaryExtractor();
const __TURBOPACK__default__export__ = summaryExtractor;
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[project]/lib/services/redis-service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "redisService",
    ()=>redisService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$upstash$2f$redis$2f$nodejs$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@upstash/redis/nodejs.mjs [app-route] (ecmascript) <locals>");
;
class RedisService {
    redis;
    constructor(){
        this.redis = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$upstash$2f$redis$2f$nodejs$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Redis"]({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN
        });
    }
    // Generic methods for common operations
    async get(key) {
        try {
            const value = await this.redis.get(key);
            return value;
        } catch (error) {
            console.error(`Error getting key ${key}:`, error);
            return null;
        }
    }
    async set(key, value, ttl) {
        try {
            if (ttl) {
                await this.redis.setex(key, ttl, value);
            } else {
                await this.redis.set(key, value);
            }
            return true;
        } catch (error) {
            console.error(`Error setting key ${key}:`, error);
            return false;
        }
    }
    async del(key) {
        try {
            await this.redis.del(key);
            return true;
        } catch (error) {
            console.error(`Error deleting key ${key}:`, error);
            return false;
        }
    }
    async exists(key) {
        try {
            const result = await this.redis.exists(key);
            return result === 1;
        } catch (error) {
            console.error(`Error checking key ${key}:`, error);
            return false;
        }
    }
    async expire(key, ttl) {
        try {
            await this.redis.expire(key, ttl);
            return true;
        } catch (error) {
            console.error(`Error setting expiration for key ${key}:`, error);
            return false;
        }
    }
    async keys(pattern) {
        try {
            return await this.redis.keys(pattern);
        } catch (error) {
            console.error(`Error getting keys with pattern ${pattern}:`, error);
            return [];
        }
    }
}
const redisService = new RedisService();
const __TURBOPACK__default__export__ = RedisService;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/node:fs [external] (node:fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs", () => require("node:fs"));

module.exports = mod;
}),
"[externals]/node:fs/promises [external] (node:fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs/promises", () => require("node:fs/promises"));

module.exports = mod;
}),
"[externals]/node:events [external] (node:events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:events", () => require("node:events"));

module.exports = mod;
}),
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/node:process [external] (node:process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:process", () => require("node:process"));

module.exports = mod;
}),
"[externals]/node:console [external] (node:console, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:console", () => require("node:console"));

module.exports = mod;
}),
"[project]/lib/services/analysis-engine-service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Router-Extractor Architecture: JSON-Guided Deterministic Flow
// This replaces the fuzzy vector search with a deterministic logic flow using strategic_plan.json
// Import Strategic Plan JSON (deterministic source of truth)
// Use the lib/data copy to keep API + UI consistent.
__turbopack_context__.s([
    "ActivitySchema",
    ()=>ActivitySchema,
    "KRASummarySchema",
    ()=>KRASummarySchema,
    "PrescriptiveItemSchema",
    ()=>PrescriptiveItemSchema,
    "QPROAnalysisOutputSchema",
    ()=>QPROAnalysisOutputSchema,
    "analysisEngineService",
    ()=>analysisEngineService,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2f$strategic_plan$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/lib/data/strategic_plan.json (json)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$qpro$2d$aggregation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils/qpro-aggregation.ts [app-route] (ecmascript)");
// Keep these for section detection and summary extraction (useful preprocessing)
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$document$2d$section$2d$detector$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/services/document-section-detector.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$summary$2d$extractor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/services/summary-extractor.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$openai$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@langchain/openai/dist/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$openai$2f$dist$2f$chat_models$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@langchain/openai/dist/chat_models/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@langchain/core/dist/prompts/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$prompt$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@langchain/core/dist/prompts/prompt.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$redis$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/services/redis-service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
// Import pdf2json and mammoth using CommonJS style since they use export = syntax
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$mammoth$2f$lib$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/mammoth/lib/index.js [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
const PDFParser = __turbopack_context__.r("[project]/node_modules/pdf2json/dist/pdfparser.cjs [app-route] (ecmascript)");
// ========== ROUTER-EXTRACTOR MODELS ==========
// Router Model: Fast/cheap for classification (gpt-4o-mini)
const routerModel = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$openai$2f$dist$2f$chat_models$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ChatOpenAI"]({
    modelName: "gpt-4o-mini",
    temperature: 0,
    maxTokens: 500,
    modelKwargs: {
        response_format: {
            type: "json_object"
        },
        seed: 42
    }
});
// Extractor Model: Use gpt-4o-mini for extraction (cost/speed parity with router)
const extractorModel = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$openai$2f$dist$2f$chat_models$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ChatOpenAI"]({
    modelName: "gpt-4o-mini",
    temperature: 0,
    maxTokens: 3500,
    modelKwargs: {
        response_format: {
            type: "json_object"
        },
        seed: 42
    }
});
// ========== HELPER FUNCTIONS ==========
/**
 * Safely converts string or string[] to a single text block.
 * Handles inconsistent JSON data types in strategic_plan.json
 */ function formatList(data) {
    if (!data) return "N/A";
    if (Array.isArray(data)) {
        return data.join("; ");
    }
    return data; // It's already a string
}
function normalizePercentageReported(raw) {
    const n = typeof raw === 'number' ? raw : Number(String(raw ?? '').replace(/,/g, '').trim());
    if (!Number.isFinite(n)) return 0;
    // Common extraction artifact: decimals stripped (e.g., "19.2%" -> 192)
    let v = n;
    while(v > 100 && v <= 1000){
        v = v / 10;
    }
    // Clamp to valid percentage range
    v = Math.min(100, Math.max(0, v));
    // DB uses Int for reported; store whole-number percent
    return Math.round(v);
}
// ========== ROUTER FUNCTION ==========
/**
 * Phase 1: Router - Classify document to a single dominant KRA
 * Analyzes filename and text preview to deterministically select ONE KRA
 * This replaces the fuzzy vector search step
 */ async function classifyDominantKRA(filename, textPreview) {
    console.log("🚀 [ROUTER] Classifying document...");
    console.log(`[ROUTER] Filename: "${filename}"`);
    console.log(`[ROUTER] Text preview length: ${textPreview.length} chars`);
    // 1. Build the "Menu" from Strategic Plan JSON
    // Include Responsible Offices as strong signals (e.g., "HRMO" -> KRA 11/13)
    const kraMenu = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2f$strategic_plan$2e$json__$28$json$29$__["default"].kras.map((kra)=>{
        const offices = [
            ...new Set(kra.initiatives.flatMap((i)=>i.responsible_offices))
        ].join(', ');
        const kpiOutputs = kra.initiatives.map((i)=>i.key_performance_indicator?.outputs || '').filter(Boolean).join('; ').substring(0, 200);
        return `ID: "${kra.kra_id}" | Title: "${kra.kra_title}" | Offices: [${offices}] | KPIs: [${kpiOutputs}...]`;
    }).join('\n');
    // 2. Strict Classification Prompt
    const prompt = `
ROLE: Strategic Document Router for Laguna State Polytechnic University.
TASK: Map the uploaded document to EXACTLY ONE Key Result Area (KRA) from the list below.

DOCUMENT CONTEXT:
Title/Filename: "${filename}"
Excerpt (first 1500 chars): "${textPreview.substring(0, 1500)}..."

AVAILABLE KRAS:
${kraMenu}

LOGIC RULES (Follow in order):
1. **Check Document Title First (HIGHEST PRIORITY)**:
   - "Alumni" or "Employment" or "Graduate Tracer" -> KRA 3
   - "Research" or "Publication" or "Citation" -> KRA 5
   - "Training" or "Seminar" or "Workshop" or "Faculty Development" -> KRA 11
   - "International" or "MOU" or "Exchange" or "Global" -> KRA 4
   - "Curriculum" or "Course" or "Program" -> KRA 1
   - "Extension" or "Community" -> KRA 6, 7, or 8
   - "Health" or "Wellness" or "Fitness" -> KRA 13
   - "Budget" or "Financial" or "Utilization" -> KRA 21 or 22
   - "Licensure" or "Board Exam" -> KRA 2

2. **Check Responsible Offices (if title unclear)**:
   - Document mentions "HR", "HRMO" -> KRA 11 or KRA 13
   - Document mentions "Research Office" -> KRA 5
   - Document mentions "Registrar" -> KRA 2 or KRA 3
   - Document mentions "OVPAA", "Academic Affairs" -> KRA 1

3. **Content Keywords**:
   - Employment rates, tracer study, alumni -> KRA 3
   - Research papers, publications, citations -> KRA 5
   - Training attended, seminars, workshops -> KRA 11
   - Health programs, wellness activities -> KRA 13
   - International partnerships, foreign exchange -> KRA 4

OUTPUT FORMAT (JSON):
{
  "kraId": "KRA X",
  "confidence": 0.95,
  "reasoning": "Brief explanation of why this KRA was selected"
}

If genuinely unsure, return: { "kraId": "UNKNOWN", "confidence": 0.0, "reasoning": "explanation" }
`;
    try {
        const result = await routerModel.invoke([
            {
                role: "system",
                content: "You are a document classifier that outputs only JSON."
            },
            {
                role: "user",
                content: prompt
            }
        ]);
        const responseText = typeof result.content === 'string' ? result.content : JSON.stringify(result.content);
        const parsed = JSON.parse(responseText);
        const kraId = parsed.kraId?.trim().replace(/['"]/g, '');
        const confidence = parsed.confidence || 0.5;
        console.log(`[ROUTER] Classification result: ${kraId} (confidence: ${confidence})`);
        console.log(`[ROUTER] Reasoning: ${parsed.reasoning || 'N/A'}`);
        // Validate ID exists in JSON (use normalized KRA ID for comparison)
        const normalizedKraId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$qpro$2d$aggregation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeKraId"])(kraId);
        const exists = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2f$strategic_plan$2e$json__$28$json$29$__["default"].kras.find((k)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$qpro$2d$aggregation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeKraId"])(k.kra_id) === normalizedKraId);
        if (exists) {
            return {
                kraId: normalizedKraId,
                confidence
            }; // Return normalized kraId
        } else if (kraId === 'UNKNOWN') {
            console.log('[ROUTER] Document could not be classified to a specific KRA');
            return null;
        } else {
            console.warn(`[ROUTER] KRA ID "${kraId}" not found in strategic plan`);
            return null;
        }
    } catch (error) {
        console.error('[ROUTER] Classification failed:', error);
        return null;
    }
}
// ========== EXTRACTOR FUNCTION ==========
/**
 * Phase 2: Extractor - Extract activities using only the relevant KRA's KPIs
 * This provides the AI with focused context, eliminating KRA confusion
 */ async function extractActivitiesForKRA(fullText, kraId, reportYear = 2025) {
    console.log(`🚀 [EXTRACTOR] Extracting for ${kraId} (Year: ${reportYear})...`);
    // 1. Get the Specific KRA from JSON (use normalized KRA ID for comparison)
    const normalizedKraIdVal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$qpro$2d$aggregation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeKraId"])(kraId);
    const targetKRA = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2f$strategic_plan$2e$json__$28$json$29$__["default"].kras.find((k)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$qpro$2d$aggregation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeKraId"])(k.kra_id) === normalizedKraIdVal);
    if (!targetKRA) {
        throw new Error(`Invalid KRA ID: ${kraId}`);
    }
    console.log(`[EXTRACTOR] Target KRA: "${targetKRA.kra_title}"`);
    console.log(`[EXTRACTOR] Number of initiatives: ${targetKRA.initiatives.length}`);
    // 2. Build Context ONLY for this KRA and Year
    const kpiContext = targetKRA.initiatives.map((init)=>{
        const yearTarget = init.targets?.timeline_data?.find((t)=>t.year === reportYear);
        const targetValue = yearTarget?.target_value ?? 'N/A';
        // Use the formatList helper to handle both Arrays and Strings safely
        const strategiesText = formatList(init.strategies);
        const activitiesText = formatList(init.programs_activities);
        return `
--------------------------------
KPI ID: "${init.id}"
Description: "${init.key_performance_indicator?.outputs || 'N/A'}"
Expected Outcomes: "${init.key_performance_indicator?.outcomes || 'N/A'}"
Context (Strategies): "${strategiesText}"
Context (Activities): "${activitiesText}"
Target Value (${reportYear}): "${targetValue}"
Unit: "${init.targets?.type || 'count'}"
    `;
    }).join('\n--------------------------------\n');
    // 3. The Extraction Prompt with strict rules
    const prompt = `
ROLE: Strategic Data Analyst for Laguna State Polytechnic University.
CONTEXT: Analyzing QPRO report for "${targetKRA.kra_title}" (${targetKRA.kra_id}).

TASK: Extract ALL activities/accomplishments from the document that relate to the KPIs below.

TARGET KPIs FOR THIS KRA:
${kpiContext}

DOCUMENT TYPE DETECTION:
- If this is a **Research Report**: Each completed research/publication/study = 1 activity
- If this is a **Training Report**: Each training/seminar attended = 1 activity  
- If this is an **Employment/Tracer Report**: Each program's employment rate = 1 activity
- If this is a **Financial Report**: Each budget item = 1 activity

CRITICAL EXTRACTION RULES:

1. **For Research/Publication Documents:**
   - Each research title = 1 activity with reported_value = 1
   - Count total completed researches for the aggregate
   - Extract: researcher name, title, date completed, publication venue
   - Match to KPIs about "research outputs", "publications", "completed researches"

2. **For Training Documents:**
   - Each training session attended = 1 activity
   - Extract: training title, attendee count, date
   - Match to KPIs about "training", "capacity building", "faculty development"

3. **For Academic/Employment Reports:**
   - Extract actual percentages or counts from tables
   - Match to KPIs about "employment rate", "licensure passing", "graduates"

4. **Value Extraction:**
   - For counts (research, training): reported_value = number of items (e.g., 5 researches = 5)
   - For percentages: reported_value = the percentage number (e.g., 85.5)
   - For milestones: reported_value = 1 if completed, 0 if not

5. **Target Lookup:**
   - Use Target values from KPI context above for year ${reportYear}
   - Calculate: achievement = (reported_value / target_value) * 100

6. **MUST EXTRACT SOMETHING:**
   - If the document mentions ANY accomplishments related to this KRA, extract them
   - Even if exact values aren't clear, estimate based on listed items
   - Count rows/entries if they represent individual accomplishments

OUTPUT FORMAT (JSON):
{
  "activities": [
    {
      "name": "Completed Research: IT Infrastructure Assessment Study",
      "reported_value": 1,
      "target_value": 10,
      "achievement": 10,
      "status": "MISSED",
      "kpi_id": "KRA5-KPI1",
      "data_type": "count",
      "evidence_snippet": "REYNALEN C. JUSTO - IT Infrastructure Assessment...",
      "unit": "LSPU - Santa Cruz Campus"
    }
  ],
  "summary": {
    "total_activities": 5,
    "met_count": 2,
    "missed_count": 3
  }
}

NOTE FOR PERCENTAGE VALUES:
- Keep reported_value within 0-100.
- If you extracted something like 192 but it likely means 19.2%, interpret it as 19.2 (and round to 19 if needed).

IMPORTANT: You MUST extract at least 1 activity if the document contains any accomplishments.
If you see a list of researches, each research = 1 activity.
If you see a table, each meaningful row = 1 activity.

DOCUMENT TEXT:
${fullText}
`;
    try {
        const response = await extractorModel.invoke([
            {
                role: "system",
                content: "You are a precise data extractor that outputs only valid JSON."
            },
            {
                role: "user",
                content: prompt
            }
        ]);
        const responseText = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
        const parsed = JSON.parse(responseText);
        const activities = parsed.activities || [];
        console.log(`[EXTRACTOR] Extracted ${activities.length} activities for ${kraId}`);
        // Enrich with KRA metadata
        return activities.map((act)=>({
                ...act,
                kraId: kraId,
                kraTitle: targetKRA.kra_title,
                initiativeId: act.kpi_id || act.initiativeId,
                reported: act.reported_value ?? act.reported ?? 0,
                target: act.target_value ?? act.target ?? 0,
                dataType: act.data_type || act.dataType || 'count',
                evidenceSnippet: act.evidence_snippet || act.evidenceSnippet || ''
            }));
    } catch (error) {
        console.error('[EXTRACTOR] Extraction failed:', error);
        throw error;
    }
}
// ========== PRESCRIPTIVE ANALYSIS GENERATOR ==========
/**
 * Phase 3: Generate prescriptive analysis based on extracted activities
 */ async function generatePrescriptiveAnalysis(activities, kraId, kraTitle, reportYear) {
    const extractJsonObjectCandidate = (rawText)=>{
        const text = String(rawText || '').trim();
        if (!text) return '';
        // Strip markdown fences if present
        const unfenced = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
        // If it already looks like JSON, keep it
        if (unfenced.startsWith('{') && unfenced.endsWith('}')) return unfenced;
        // Try to extract the first JSON object-like block
        const start = unfenced.indexOf('{');
        const end = unfenced.lastIndexOf('}');
        if (start >= 0 && end > start) return unfenced.slice(start, end + 1);
        return unfenced;
    };
    const tryParseJson = (rawText)=>{
        const candidate = extractJsonObjectCandidate(rawText);
        if (!candidate) return null;
        // Common LLM issues: smart quotes + trailing commas
        const normalized = candidate.replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'").replace(/,\s*([}\]])/g, '$1');
        try {
            return JSON.parse(normalized);
        } catch  {
            return null;
        }
    };
    console.log(`🚀 [PRESCRIPTIVE] Generating analysis for ${kraId}...`);
    // Use normalized KRA ID for consistent lookup
    const normalizedKraIdForPrescriptive = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$qpro$2d$aggregation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeKraId"])(kraId);
    const targetKRA = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2f$strategic_plan$2e$json__$28$json$29$__["default"].kras.find((k)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$qpro$2d$aggregation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeKraId"])(k.kra_id) === normalizedKraIdForPrescriptive);
    const strategies = targetKRA?.initiatives.flatMap((i)=>i.strategies || []).join('; ') || 'N/A';
    // KPI-level aggregation (prevents per-item target inflation and average-of-tiny-percent bug)
    const byInitiative = new Map();
    for (const a of activities){
        const initiativeId = String(a.initiativeId || a.kpi_id || '').trim() || `${normalizedKraIdForPrescriptive}-KPI1`;
        if (!byInitiative.has(initiativeId)) byInitiative.set(initiativeId, []);
        byInitiative.get(initiativeId).push(a);
    }
    const kpiSummaries = Array.from(byInitiative.entries()).map(([initiativeId, acts])=>{
        const meta = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$qpro$2d$aggregation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getInitiativeTargetMeta"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2f$strategic_plan$2e$json__$28$json$29$__["default"], normalizedKraIdForPrescriptive, initiativeId, reportYear);
        const fallbackTarget = typeof acts[0]?.initiativeTarget === 'number' ? acts[0].initiativeTarget : typeof acts[0]?.target === 'number' ? acts[0].target : Number(acts[0]?.target || 0);
        const targetValue = meta.targetValue ?? (Number.isFinite(fallbackTarget) && fallbackTarget > 0 ? fallbackTarget : 0);
        const aggregated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$qpro$2d$aggregation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["computeAggregatedAchievement"])({
            targetType: meta.targetType,
            targetValue,
            targetScope: meta.targetScope,
            activities: acts
        });
        const achievement = Math.min(100, Math.max(0, aggregated.achievementPercent));
        const status = achievement >= 100 ? 'MET' : achievement >= 80 ? 'ON_TRACK' : 'MISSED';
        // Provide sample outputs (titles) but avoid repeating target/gap per item.
        const samples = acts.map((x)=>String(x.name || '').trim()).filter(Boolean).slice(0, 5);
        return {
            initiativeId,
            targetType: meta.targetType || acts[0]?.dataType || acts[0]?.data_type || 'count',
            totalReported: aggregated.totalReported,
            totalTarget: aggregated.totalTarget,
            achievementPercent: achievement,
            status,
            samples
        };
    });
    const overallAchievement = kpiSummaries.length > 0 ? kpiSummaries.reduce((sum, k)=>sum + (k.achievementPercent || 0), 0) / kpiSummaries.length : 0;
    const maxAchievement = kpiSummaries.length > 0 ? Math.max(...kpiSummaries.map((k)=>Number(k.achievementPercent || 0))) : 0;
    const metCount = kpiSummaries.filter((k)=>k.status === 'MET').length;
    const missedCount = kpiSummaries.filter((k)=>k.status === 'MISSED').length;
    const normalizeId = (value)=>String(value || '').replace(/\s+/g, '').trim().toLowerCase();
    const planSnapshotText = kpiSummaries.map((k)=>{
        const initiative = targetKRA?.initiatives?.find((i)=>normalizeId(i.id) === normalizeId(k.initiativeId));
        const outputs = initiative?.key_performance_indicator?.outputs || 'N/A';
        const outcomes = initiative?.key_performance_indicator?.outcomes || 'N/A';
        const yearTarget = initiative?.targets?.timeline_data?.find((t)=>t.year === reportYear)?.target_value;
        const unit = initiative?.targets?.type || k.targetType || 'count';
        const strategiesText = formatList(initiative?.strategies);
        return `- ${k.initiativeId}: Outputs="${outputs}" | Outcomes="${outcomes}" | Target(${reportYear})=${yearTarget ?? 'N/A'} (${unit}) | Strategies="${strategiesText}"`;
    }).join('\n');
    const kpiSummaryText = kpiSummaries.map((k)=>{
        const reportedStr = typeof k.totalReported === 'number' ? k.totalReported.toFixed(k.targetType === 'percentage' ? 1 : 0) : String(k.totalReported);
        const targetStr = typeof k.totalTarget === 'number' ? k.totalTarget.toFixed(k.targetType === 'percentage' ? 1 : 0) : String(k.totalTarget);
        const sampleText = k.samples.length > 0 ? ` | Examples: ${k.samples.join('; ')}` : '';
        return `- ${k.initiativeId}: ${reportedStr} vs ${targetStr} (${k.achievementPercent.toFixed(1)}%) [${k.status}]${sampleText}`;
    }).join('\n');
    const prompt = `
ROLE: Strategic Planning Advisor for LSPU.
CONTEXT: Analyzing performance for "${kraTitle}" (${kraId}).

STRATEGIC PLAN SNAPSHOT (KRA-only, authoritative):
${planSnapshotText || 'N/A'}

PERFORMANCE DATA:
${kpiSummaryText}

SUMMARY:
- Total Extracted Items (evidence): ${activities.length}
- KPIs Evaluated: ${kpiSummaries.length}
- KPIs Met: ${metCount}
- KPIs Missed: ${missedCount}
- Overall Achievement (KPI-level): ${overallAchievement.toFixed(1)}%
- Highest KPI Achievement: ${maxAchievement.toFixed(1)}%

AUTHORIZED STRATEGIES FOR THIS KRA:
${strategies}

TASK:
1) Write a single Document Insight paragraph (2–4 sentences) grounded on the performance data and the strategic plan snapshot.
   - Must reference the overall achievement percentage.
   - Must identify the primary bottleneck KPI (lowest achievement) using the KPI ID and its reported vs target.
2) Produce Prescriptive Analysis as 2–3 items, each with:
   - title (short)
   - issue (one sentence)
   - action (specific, with timeframe when possible)
   - nextStep (optional, immediate next action)
  RULE: Only include a "Sustain"/"high performers" item if at least one KPI has >80% achievement. If none are >80%, DO NOT generate that item.
3) Also provide brief supporting fields (alignment/opportunities/gaps/recommendations) for backward compatibility.

OUTPUT FORMAT (JSON):
{
  "documentInsight": "...",
  "prescriptiveItems": [
    { "title": "...", "issue": "...", "action": "...", "nextStep": "..." }
  ],
  "alignment": "2-3 sentences on strategic alignment",
  "opportunities": ["..."],
  "gaps": "Specific gaps with numbers",
  "recommendations": ["..."]
}

IMPORTANT GUIDANCE:
- Do NOT critique individual documents/files as if each one must meet the full institutional target.
- For count-based KPIs (e.g., research outputs), interpret gaps as volume shortfalls at the KRA/KPI level ("need X more outputs"), not "improve Paper A by 149".
- Avoid repetitive per-item gap statements; synthesize patterns and provide 3-6 concise bullets.

STRICT OUTPUT RULES:
- Output MUST be valid JSON only (no extra commentary, no markdown code fences).
- All JSON string values must be single-line. Do not include literal line breaks inside strings (use spaces or \\n).
`;
    try {
        const response = await routerModel.invoke([
            {
                role: "system",
                content: "You are a strategic planning advisor. Output only JSON."
            },
            {
                role: "user",
                content: prompt
            }
        ]);
        const responseText = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
        const parsed = tryParseJson(responseText);
        if (!parsed) {
            throw new Error('LLM returned non-JSON or invalid JSON.');
        }
        const safeString = (v)=>typeof v === 'string' ? v.trim() : '';
        const rawItems = Array.isArray(parsed.prescriptiveItems) ? parsed.prescriptiveItems.filter((x)=>x && typeof x === 'object').slice(0, 5).map((x)=>({
                title: safeString(x.title) || 'Recommendation',
                issue: safeString(x.issue) || 'Issue not specified.',
                action: safeString(x.action) || 'Action not specified.',
                nextStep: safeString(x.nextStep) || undefined
            })) : [];
        const shouldAllowSustain = maxAchievement > 80;
        const prescriptiveItems = shouldAllowSustain ? rawItems : rawItems.filter((x)=>!/\bsustain\b|high\s*perform(er|ers)|preserv(e|ing)\s+strong/i.test(`${x.title} ${x.issue} ${x.action}`));
        return {
            documentInsight: safeString(parsed.documentInsight) || 'Insight pending.',
            prescriptiveItems,
            alignment: parsed.alignment || 'Analysis pending.',
            opportunities: parsed.opportunities || 'No opportunities identified.',
            gaps: parsed.gaps || 'No gaps identified.',
            recommendations: parsed.recommendations || 'No recommendations.',
            overallAchievement: Math.round(overallAchievement * 100) / 100
        };
    } catch (error) {
        console.error('[PRESCRIPTIVE] Analysis generation failed:', error);
        // Deterministic fallback: never return empty insights just because JSON parsing failed.
        const bottleneck = kpiSummaries.slice().sort((a, b)=>Number(a.achievementPercent || 0) - Number(b.achievementPercent || 0))[0];
        const strongest = kpiSummaries.filter((k)=>Number(k.achievementPercent || 0) > 80).slice().sort((a, b)=>Number(b.achievementPercent || 0) - Number(a.achievementPercent || 0))[0];
        const bottleneckReported = bottleneck ? typeof bottleneck.totalReported === 'number' ? bottleneck.totalReported.toFixed(bottleneck.targetType === 'percentage' ? 1 : 0) : String(bottleneck.totalReported ?? 'N/A') : 'N/A';
        const bottleneckTarget = bottleneck ? typeof bottleneck.totalTarget === 'number' ? bottleneck.totalTarget.toFixed(bottleneck.targetType === 'percentage' ? 1 : 0) : String(bottleneck.totalTarget ?? 'N/A') : 'N/A';
        const documentInsightParts = [];
        documentInsightParts.push(`Overall achievement is ${overallAchievement.toFixed(1)}% across ${kpiSummaries.length} KPI(s) for ${kraId}.`);
        if (bottleneck?.initiativeId) {
            documentInsightParts.push(`The primary bottleneck is ${bottleneck.initiativeId} at ${Number(bottleneck.achievementPercent || 0).toFixed(1)}% (reported ${bottleneckReported} vs target ${bottleneckTarget}).`);
        }
        if (strongest?.initiativeId) {
            documentInsightParts.push(`A relative strength is ${strongest.initiativeId} at ${Number(strongest.achievementPercent || 0).toFixed(1)}%.`);
        }
        const fallbackItems = [];
        fallbackItems.push({
            title: 'Address the primary performance gap',
            issue: bottleneck?.initiativeId ? `${bottleneck.initiativeId} is at ${Number(bottleneck.achievementPercent || 0).toFixed(1)}% (reported ${bottleneckReported} vs target ${bottleneckTarget}), limiting overall achievement.` : 'At least one KPI remains below target, limiting overall achievement.',
            action: 'Assign an owner to the lowest-performing KPI, confirm the data pipeline and evidence rules, and implement a corrective plan within the next reporting cycle (2–4 weeks).',
            nextStep: bottleneck?.initiativeId ? `Validate the latest reported/target values for ${bottleneck.initiativeId} within 7 days.` : 'Validate the latest reported/target values within 7 days.'
        });
        if (strongest?.initiativeId) {
            fallbackItems.push({
                title: 'Sustain and operationalize high performers',
                issue: `${strongest.initiativeId} is performing relatively well (${Number(strongest.achievementPercent || 0).toFixed(1)}%) and should be protected from regression while gaps are addressed.`,
                action: 'Document the operating steps and evidence artifacts, then standardize reporting and accountability within the next quarter.',
                nextStep: `Assign an evidence custodian for ${strongest.initiativeId} within 2 weeks.`
            });
        }
        fallbackItems.push({
            title: 'Data quality review',
            issue: 'Minor definition or measurement mismatches (rate vs count, evidence criteria, year alignment) can materially distort KPI achievement calculations.',
            action: 'Confirm KPI measurement definitions and evidence rules, then update reporting instructions before the next submission window.'
        });
        return {
            documentInsight: documentInsightParts.join(' '),
            prescriptiveItems: fallbackItems.slice(0, 3),
            alignment: `Analysis completed for ${kraTitle} (${kraId}) based on extracted KPI performance and the strategic plan snapshot.`,
            opportunities: strongest?.initiativeId ? `High-performing KPI observed: ${strongest.initiativeId} (${Number(strongest.achievementPercent || 0).toFixed(1)}%).` : 'No KPI exceeded the high-performer threshold (>80%).',
            gaps: bottleneck?.initiativeId ? `Largest gap is ${bottleneck.initiativeId}: ${Number(bottleneck.achievementPercent || 0).toFixed(1)}% achieved (reported ${bottleneckReported} vs target ${bottleneckTarget}).` : `${missedCount} KPI(s) are below target.`,
            recommendations: 'Use the structured prescriptive items as the immediate action plan for the next reporting cycle.',
            overallAchievement: Math.round(overallAchievement * 100) / 100
        };
    }
}
// Helper to sanitize AI status values: convert spaces to underscores, normalize to uppercase
const sanitizeStatus = (val)=>{
    if (typeof val !== 'string') return String(val);
    return val.trim().toUpperCase().replace(/\s+/g, '_');
};
// Phase 2: Enhanced Noise Filtering with Regex (Universal)
const NOISE_REGEX = /^(REMARKS|TOTAL|GRAND TOTAL|NOTE|NOTES|PREPARED BY|APPROVED BY|TARGET|ACCOMPLISHMENT|VARIANCE|QUARTER|YEAR|N\/A|NA|NONE|TBD|GRADUATED|OUTCOME|SE|NO\.|NUMBER|COLUMN|ROW|HEADER)$/i;
/**
 * Filter noise entries from extracted activities
 * Removes headers, generic terms, and invalid entries
 */ function filterNoiseActivities(activities) {
    const beforeCount = activities.length;
    const filtered = activities.filter((act)=>{
        if (!act.name || typeof act.name !== 'string') return false;
        const name = act.name.trim();
        const nameUpper = name.toUpperCase();
        // 1. Regex blocklist check for exact matches
        if (NOISE_REGEX.test(nameUpper)) {
            console.log(`[NOISE FILTER] Removed: "${name}" (regex blocklist)`);
            return false;
        }
        // 2. Header Heuristic: If value is 1 and name is short/generic, likely a table header
        if (Number(act.reported) === 1 && name.split(' ').length <= 2 && name.length < 15) {
            // Check if it looks like a column header
            const headerPatterns = /^(total|count|number|amount|rate|percentage|status|date|year|quarter)/i;
            if (headerPatterns.test(name)) {
                console.log(`[NOISE FILTER] Removed: "${name}" (header pattern with value=1)`);
                return false;
            }
        }
        // 3. Drop entries that are just numbers, single letters, or special characters
        if (/^[\d\s.,%₱$]+$/.test(name) || /^[A-Z]$/i.test(name)) {
            console.log(`[NOISE FILTER] Removed: "${name}" (numeric/single letter)`);
            return false;
        }
        // 4. Drop entries with parenthetical column references like "(1)", "(2)", "[(4/2)]*100"
        if (/^\(?\d+\)?$/.test(name) || /\[\(.*\)\]\*\d+/.test(name)) {
            console.log(`[NOISE FILTER] Removed: "${name}" (column reference pattern)`);
            return false;
        }
        // 5. Drop very short names (less than 3 chars) unless they have actual values > 1
        if (name.length < 3 && Number(act.reported) <= 1) {
            console.log(`[NOISE FILTER] Removed: "${name}" (too short)`);
            return false;
        }
        return true;
    });
    console.log(`[NOISE FILTER] Filtered: ${beforeCount} -> ${filtered.length} activities (removed ${beforeCount - filtered.length})`);
    return filtered;
}
/**
 * Consolidate KRAs using "Dominant KRA" logic
 * Ensures all activities from the same document use consistent KRA assignment
 * Prevents mismatch where alumni employment appears under international MOUs
 */ function consolidateKRAs(activities) {
    if (activities.length === 0) return activities;
    // 1. Count frequency of detected KRAs
    const counts = {};
    activities.forEach((a)=>{
        if (a.kraId) {
            counts[a.kraId] = (counts[a.kraId] || 0) + 1;
        }
    });
    // 2. Find the dominant KRA (the one with most activities)
    const dominantKRA = Object.keys(counts).reduce((a, b)=>counts[a] > counts[b] ? a : b, Object.keys(counts)[0] || '');
    if (!dominantKRA) return activities;
    // 3. Check for outliers - if a KRA has < 20% of the dominant, it might be misclassified
    const dominantCount = counts[dominantKRA] || 0;
    const threshold = Math.max(1, dominantCount * 0.2);
    console.log(`[KRA CONSOLIDATE] Dominant KRA: ${dominantKRA} (${dominantCount} activities)`);
    return activities.map((act)=>{
        // If activity has no KRA or has a rare KRA, consider reassignment
        if (!act.kraId) {
            console.log(`[KRA CONSOLIDATE] Assigned missing KRA to dominant: ${dominantKRA} for "${act.name}"`);
            return {
                ...act,
                kraId: dominantKRA
            };
        }
        // If this KRA appears very rarely compared to dominant, flag it but don't force change
        // (User can override in review modal)
        if (counts[act.kraId] < threshold && act.kraId !== dominantKRA) {
            console.log(`[KRA CONSOLIDATE] Potential mismatch: "${act.name}" has ${act.kraId} but dominant is ${dominantKRA}`);
            // Add a flag for review
            return {
                ...act,
                kraConflict: true,
                suggestedKraId: dominantKRA
            };
        }
        return act;
    });
}
const ActivitySchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().describe('Activity description from QPRO document'),
    kraId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().describe('Matched KRA ID (e.g., "KRA 1")'),
    initiativeId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().describe('Matched initiative ID (e.g., "KRA1-KPI1")'),
    reported: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().describe('Reported/accomplished value'),
    target: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().describe('Target value from Strategic Plan timeline_data for the reporting year'),
    achievement: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(0).max(100).describe('Achievement percentage'),
    status: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].preprocess(sanitizeStatus, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        "MET",
        "MISSED"
    ])).describe('Status of target achievement - MET if achievement >= 100%, MISSED otherwise'),
    authorizedStrategy: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().describe('Exact strategy text copied from Strategic Plan context'),
    aiInsight: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().describe('AI-generated insight for this activity'),
    prescriptiveAnalysis: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().describe('Prescriptive analysis based on CALCULATED status (not raw numbers). Always reference the status field. For MET: focus on sustainability. For MISSED: focus on immediate corrective actions.'),
    confidence: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(0).max(1).describe('Confidence score for KRA matching (0-1)'),
    unit: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().describe('Unit mentioned in context'),
    evidenceSnippet: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().describe('Exact text snippet from QPRO document that supports this value'),
    dataType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].preprocess((val)=>typeof val === 'string' ? val.trim().toLowerCase().replace(/\s+/g, '_') : val, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        'percentage',
        'currency',
        'low_count',
        'high_count',
        'milestone'
    ])).optional().describe('Data type for visualization: percentage (%), currency (PHP), low_count (<=10), high_count (>10), milestone (text/yes-no)'),
    rootCause: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().describe('Inferred root cause if target is missed (e.g., budget delay, lack of participants)'),
    suggestedStatus: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].preprocess(sanitizeStatus, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        'MET',
        'ON_TRACK',
        'DELAYED',
        'AT_RISK'
    ])).optional().describe('Suggested status for review')
});
const KRASummarySchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    kraId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    kraTitle: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    achievementRate: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(0).max(100),
    activities: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].union([
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(ActivitySchema),
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()),
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].any())
    ]).transform((val)=>{
        // If activities are strings, convert to activity name references
        if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'string') {
            return val.map((name)=>({
                    name: name,
                    kraId: '',
                    reported: 0,
                    target: 0,
                    achievement: 0,
                    status: 'MISSED',
                    authorizedStrategy: '',
                    aiInsight: '',
                    prescriptiveAnalysis: '',
                    confidence: 0
                }));
        }
        return val;
    }),
    strategicAlignment: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().describe('How this KRA aligns with strategic plan'),
    prescriptiveAnalysis: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().describe('Overall prescriptive analysis for this KRA if behind target'),
    rootCause: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().describe('Inferred root cause for gaps in this KRA'),
    actionItems: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()).optional().describe('Specific action items to address gaps')
});
const PrescriptiveItemSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    title: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).describe('Short title for the prescriptive item'),
    issue: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).describe('The concrete issue or constraint identified'),
    action: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).describe('Concrete action to address the issue (with timeframe when possible)'),
    nextStep: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().describe('Optional immediate next step to execute the action')
});
const QPROAnalysisOutputSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    activities: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(ActivitySchema).describe('All extracted activities with KRA matches'),
    kras: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(KRASummarySchema).describe('Summary grouped by KRA'),
    documentInsight: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().default('').describe('Document-level insight paragraph grounded on KPI performance and the strategic plan'),
    prescriptiveItems: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(PrescriptiveItemSchema).default([]).describe('Document-level prescriptive analysis items (Issue/Action/Next Step)'),
    alignment: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().describe('Overall strategic alignment analysis'),
    opportunities: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].union([
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string())
    ]).transform((val)=>{
        // Convert array to bullet-point string
        return Array.isArray(val) ? '• ' + val.join('\n• ') : val;
    }).describe('Strategic opportunities identified'),
    gaps: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().describe('Gaps or conflicts identified'),
    recommendations: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].union([
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string())
    ]).transform((val)=>{
        // Convert array to bullet-point string
        return Array.isArray(val) ? '• ' + val.join('\n• ') : val;
    }).describe('Actionable recommendations'),
    overallAchievement: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(0).max(100).describe('Overall achievement score')
});
class AnalysisEngineService {
    llm;
    promptTemplate;
    constructor(){
        const modelName = "gpt-4o-mini";
        // Enforce a safe output cap for gpt-4o-mini to avoid overly long outputs
        const GPT4O_MINI_MAX_OUTPUT = 4096;
        const modelKwargs = {
            response_format: {
                type: "json_object"
            },
            seed: 42
        };
        this.llm = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$openai$2f$dist$2f$chat_models$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ChatOpenAI"]({
            modelName,
            temperature: 0,
            maxTokens: GPT4O_MINI_MAX_OUTPUT,
            modelKwargs
        });
        this.promptTemplate = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$prompt$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PromptTemplate"].fromTemplate(`
You are an expert strategic planning analyst for Laguna State Polytechnic University. Analyze a Quarterly Physical Report of Operations (QPRO) document against the university's strategic plan.

## Strategic Plan Context (Top 10 Most Relevant KRAs/Initiatives):
{strategic_context}

## QPRO Document Text:
{user_input}

## Document Section Analysis:
{section_analysis}

## Document Format Recognition:
- If the document is a **table/spreadsheet format** (e.g., "Training/Seminar Report", "Faculty/Staff Training"), extract EVERY single row as a separate activity
- If the document is a **narrative format**, extract all mentioned activities with quantifiable metrics
- Each row in a training table = one individual activity entry
- **CRITICAL**: For summary metrics (e.g., "Total No. of Attendees: 9"), prioritize using summary totals for achievement calculations instead of counting extracted rows

## Your Task:
Extract ALL activities from the QPRO document. For training tables, create one activity entry per row (do not skip any rows).

**CRITICAL - EXTRACT EVERY ACTIVITY**: This is a table-format document with many rows. You MUST extract every single training/seminar/activity mentioned. If you see a table, count the rows and extract exactly that many activities. Do NOT summarize, consolidate, or skip any rows. Each row = one activity entry.

**IMPORTANT - Summary Metrics Priority**: If the document contains summary sections with aggregate metrics (e.g., "Total No. of X: Y"), use these summary values as the primary reported value instead of counting individual rows. This ensures achievement calculations are based on official summaries.

For each activity:
1. **Identify the activity name** (exact title from the document, e.g., "Introduction to AI, ML and DP")
2. **Extract reported/accomplished value**:
   - For training tables: reported = 1 (one instance of this training attended)
   - For narrative reports: extract the actual number from the text
   - **IMPORTANT**: If the same training appears multiple times in the table (multiple faculty attended), create SEPARATE activity entries for each row - do NOT consolidate
3. **Look up target value** from the Strategic Plan Context above. Find the matched initiative's "Targets" object and use the target_value from timeline_data for year 2025. DO NOT extract targets from the QPRO document text. The target MUST come from the Strategic Plan's timeline_data.

## CRITICAL: KRA MATCHING STRATEGY - PRIORITIZE KPI & STRATEGIES
**Match activities to KRAs using this PRIORITY ORDER:**

## STRICT KRA ALIGNMENT DEFINITIONS (MUST FOLLOW):
Before matching, understand what each KRA category covers:

**KRA 3 (Quality of Instruction):** 
- Graduate employment rates, licensure exam results, curriculum effectiveness
- Alumni tracer studies, employment statistics
- *INCLUDES*: "Alumni Employment", "Graduate Tracer", "Licensure Passing Rate"

**KRA 4 (International Activities):**
- MUST involve foreign partners, international exchange, or cross-border MOUs
- International students, faculty exchange programs, global partnerships
- *EXCLUDES*: Local degree programs, domestic employment rates
- *If document says "Alumni Employment" or "Graduate Employment", it is NOT KRA 4*

**KRA 5 (Research):**
- Research publications, citations, patents, research awards
- *INCLUDES*: Papers published, citation counts, research grants

**KRA 11 (Human Resource Management):**
- Faculty training, staff development, HR policies
- *INCLUDES*: Training reports, seminar attendance, faculty development

**KRA 13 (Competitive HR):**
- Health and wellness programs, employee satisfaction
- *INCLUDES*: Wellness activities, fitness programs

**DOCUMENT TITLE CHECK (CRITICAL):**
- If document title contains "Alumni" or "Employment" or "Graduate Tracer" -> Use KRA 3
- If document title contains "International" or "MOU" or "Exchange" -> Use KRA 4
- If document title contains "Research" or "Publication" -> Use KRA 5
- If document title contains "Training" or "Seminar" or "Workshop" -> Use KRA 11

**STEP 1: STRATEGY MATCHING (Highest Priority)**
- First, check if the QPRO activity directly implements one of the **Strategies** listed in the KRA
- Example: If KRA 13 has strategy "conduct health and wellness program twice a week" and QPRO reports "health and wellness program", this is a STRONG match
- Use exact or near-exact keyword matching for strategy alignment

**STEP 2: KPI VALIDATION (Second Priority)**
- Verify if the activity contributes to the **Key Performance Indicator (KPI)** outputs/outcomes
- Example: If KRA 13 KPI output is "100% faculty and staff attended health and wellness program" and QPRO reports staff attending health program, this validates the KRA match
- Check if reported outcomes align with expected KPI outcomes (e.g., improvements in fitness levels, wellness metrics)

**STEP 3: TYPE-BASED CATEGORIZATION (Tertiary Priority)**
- If neither strategy nor KPI directly match, use activity TYPE to narrow down:
  - **Training/Seminars/Workshops/Conferences** → Only KRA 11 or KRA 13 (HR Development)
  - **Curriculum Development/Course Updates** → Only KRA 1
  - **Research/Publications** → Only KRA 3, 4, 5 (Research KRAs)
  - **Digital Systems/Infrastructure** → Only KRA 17
  - **Health/Wellness Programs** → Only KRA 13
  - **Community/Extension Programs** → Only KRA 6, 7, 8 (Community Engagement)
  - **Alumni/Graduate Employment** → ONLY KRA 3 (NEVER KRA 4)

**STEP 4: SEMANTIC SIMILARITY (Lowest Priority)**
- Only use general semantic similarity if strategies and KPI don't provide clear alignment
- Ensure the selected KRA is compatible with the activity type from Step 3

4. **Calculate achievement percentage** = (reported / target) * 100
5. **Determine status**: If achievement >= 100%, status = "MET"; otherwise, status = "MISSED".
6. **Copy authorized strategy**: Select and copy the EXACT text of the most relevant strategy from the "Strategies" field in the Strategic Plan Context above for the specific KRA being matched. Do not paraphrase or create new strategies.
7. **AI Insight**: Write a concise, data-driven insight for this activity (1-2 sentences). BE SPECIFIC with actual numbers.
   - **BAD**: "Good research output."
   - **GOOD**: "Strong research performance with 5 new papers published (target: 3) achieving 167% of goal."
   - Always include the actual reported value and target in the insight text.
8. **Prescriptive Analysis**: Based on the CALCULATED STATUS and authorized strategy, write ACTION-ORIENTED prescriptive analysis (do NOT just state the gap - provide concrete steps). CRITICAL: Use the status value, NOT raw number comparison:
   - If status is "MET": "To sustain this achievement, continue implementing [exact authorized strategy]. Consider [specific sustainability action like expanding scope, documenting best practices, or mentoring other units]."
   - If status is "MISSED": "To close this gap, immediately implement [exact authorized strategy]. Specific actions: [concrete steps with timeline like 'Schedule 2 additional sessions before Q4 ends' or 'Partner with 3 industry experts by December 2025']."
   - Be SPECIFIC with timelines (e.g., "by Q4 2025", "before semester end", "by [month] [year]") and quantifiable actions (e.g., "2 additional sessions", "3 partner organizations", "increase by 50%")
   - NEVER use the raw comparison (reported vs target) to determine advice tone; ALWAYS use the calculated status field.
9. **Assign confidence score** (0.0-1.0) for the KRA match based on strategy alignment first, then KPI validation, then semantic similarity:
   - 0.95-1.0: Perfect strategy + KPI match
   - 0.85-0.94: Strong strategy match + partial KPI alignment
   - 0.75-0.84: Type match + some semantic alignment
   - Below 0.75: Only semantic similarity available
10. **Extract unit/office** mentioned if available.

## VALIDATION BEFORE OUTPUT:
1. **Keep ALL activities**: Do NOT delete duplicates even if activity names are similar. Each row entry must be preserved.
2. **Verify target source**: Ensure every target value comes from the Strategic Plan's timeline_data, NOT from counting QPRO entries.
3. **Verify KRA matching**: For each activity, verify it was matched to an appropriate KRA using the priority order above.
4. **Count check**: Your activities array should have at least 70+ entries for training table documents.

## Important Guidelines:
- **COUNT ALL TRAINING SESSIONS**: For training/seminar tables, extract EVERY single row as individual activities with reported=1 each
- **KEEP ALL ACTIVITIES - DO NOT DEDUPLICATE FOR DISPLAY**: Each row in the table is a separate activity entry, even if the training name appears multiple times (different faculty may have attended the same training). Include all of them.
- **CRITICAL - TARGETS FROM STRATEGIC PLAN JSON**: 
  - Targets MUST come from the Strategic Plan's timeline_data for year 2025, NOT from QPRO document content
  - For each activity, look up the matched KRA's initiative and extract target_value from timeline_data[2025]
  - If the KRA has multiple initiatives (KPIs), select the one with highest semantic match to the activity

## FINAL OUTPUT REQUIREMENTS:
- **Minimum activities in array**: At least 70 activities if the document has a training table with 90+ rows
- **Include ALL unique attendance records**: If "Data Privacy Training" appears in 5 rows (5 different faculty), create 5 separate activity entries (one per row)
- **No consolidation or grouping**: Each row = one activity, period
  - If target_value is non-numeric (e.g., "Curriculum Updated"), convert to 1 (treat as 1 milestone unit)
  - DO NOT count how many activities you extracted as the target
  - DO NOT use the number of rows in the QPRO document as the target
  - The target is a FIXED number from the strategic plan JSON, independent of the QPRO document content
  - Example: If Strategic Plan says target_value = 2 for 2025, use 2 even if QPRO has 9 training entries. Achievement = 9/2 = 450%
- **STRATEGY-FIRST MATCHING**: Always check the Strategies field first before considering semantic similarity
- **SINGLE BEST-FIT KRA**: Each activity matches to ONLY ONE KRA based on strategy alignment first, then type matching
- **Return initiativeId**: Include the specific initiative/KPI ID (e.g., "KRA13-KPI1") to enable post-processing validation and proper target lookup
- The authorizedStrategy field MUST be an exact copy from the Strategic Plan Context strategies list for the matched KRA

## DATA TYPE DETECTION:
For each KPI, identify the data type based on the target value:
- **percentage**: If target contains "%" or is a rate/ratio (e.g., "80% passing rate")
- **currency**: If target contains "PHP", "Php", "₱" or is a monetary value (e.g., "Php 375,000")
- **low_count**: If target is a number <= 10 (e.g., "2 MOUs", "1 tracer study")
- **high_count**: If target is a number > 10 (e.g., "47 IP generated", "150 research findings")
- **milestone**: If target is text-based/qualitative (e.g., "ISO Recertified", "Curriculum Updated")

## PRESCRIPTIVE ANALYSIS REQUIREMENTS:
For EVERY activity where status is "MISSED" or achievement < 100%, generate:
1. **rootCause**: Infer the likely root cause from the document text (e.g., "budget delay", "lack of participants", "scheduling conflicts", "resource constraints")
2. **actionItems**: Suggest 1-3 specific, actionable interventions with timelines

## EVIDENCE EXTRACTION:
For each activity, extract the **evidenceSnippet** - the exact text from the document that proves/supports the reported value. This should be a direct quote from the QPRO document.

## Output Format:
Return ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:

{{
  "activities": [
    {{
      "name": "Faculty training workshops",
      "kraId": "KRA 1",
      "initiativeId": "KRA1-KPI1",
      "reported": 8,
      "target": 10,
      "achievement": 80.0,
      "status": "MISSED",
      "suggestedStatus": "DELAYED",
      "dataType": "low_count",
      "evidenceSnippet": "Table 2 shows 8 faculty members completed the training program...",
      "rootCause": "Limited budget allocation for Q3 training activities",
      "authorizedStrategy": "collaborate with industry experts, tech companies and research institutions to design relevant course content",
      "aiInsight": "Training completion at 80% indicates good progress but falls short of the annual target.",
      "prescriptiveAnalysis": "Based on Strategic Plan strategy: collaborate with industry experts, tech companies and research institutions to design relevant course content. To address the gap of 2 workshops, prioritize partnerships with at least 2 additional industry experts before Q4.",
      "confidence": 0.95,
      "unit": "Office of the VP for Academic Affairs"
    }}
  ],
  "kras": [
    {{
      "kraId": "KRA 1",
      "kraTitle": "Development of New Curricula...",
      "achievementRate": 75.5,
      "activities": [...activities for this KRA...],
      "strategicAlignment": "This KRA shows strong alignment with curriculum development initiatives...",
      "prescriptiveAnalysis": "Overall KRA is behind target. Focus on accelerating curriculum updates and faculty training.",
      "rootCause": "Delayed curriculum review process",
      "actionItems": ["Schedule 2 additional curriculum workshops by Q4 2025", "Partner with 3 industry experts by December 2025"]
    }}
  ],
  "alignment": "Overall strategic alignment analysis (2-3 paragraphs)",
  "opportunities": "Strategic opportunities identified (bullet points or paragraphs)",
  "gaps": "Gaps or conflicts between QPRO and strategic plan (specific gaps with numbers)",
  "recommendations": "Actionable recommendations (prioritized list)",
  "overallAchievement": 72.3
}}

## Calculation Notes:
- **achievementRate per KRA** = average of all activities' achievement % for that KRA
- **overallAchievement** = weighted average of all KRAs' achievementRate

Return ONLY the JSON object. No additional text.
    `);
    }
    /**
   * Extract ALL activities from QPRO document WITHOUT KRA matching
   * This is pass 1 of the two-pass approach for better accuracy with large documents
   * Results are cached in Redis to avoid re-extracting from identical documents
   */ async extractAllActivities(userText) {
        try {
            // Generate cache key from document content hash
            const contentHash = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["createHash"])('sha256').update(userText).digest('hex');
            const cacheKey = `qpro:extract:${contentHash}`;
            // Check if we have cached results
            const cachedActivities = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$redis$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redisService"].get(cacheKey);
            if (cachedActivities && cachedActivities.length > 0) {
                console.log(`[EXTRACTION] Cache HIT: Retrieved ${cachedActivities.length} activities from Redis`);
                return cachedActivities;
            }
            console.log('[EXTRACTION] Cache MISS: Extracting activities from LLM...');
            const extractionPrompt = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$prompt$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PromptTemplate"].fromTemplate(`
ROLE: Strategic Data Analyst for Laguna State Polytechnic University.
TASK: Extract specific performance metrics from the provided QPRO document text/tables.

## QPRO Document Text:
{user_input}

## CRITICAL RULES FOR EXTRACTION:

### 1. SUBJECT-METRIC MAPPING (Row + Column):
   - Do NOT extract Row Labels as standalone activities.
   - COMBINE the Row Label with the Column Header to form the Activity Name.
   - Examples:
     * Academic: Row="BS CS", Col="Employment %" -> Activity="BS CS Employment Rate"
     * Financial: Row="ICT Equipment", Col="Obligated" -> Activity="ICT Equipment Obligation"
     * Research: Row="Engineering Dept", Col="Papers Published" -> Activity="Engineering Research Papers"
     * Training: Row="Faculty Name", Col="Training Title" -> Activity="[Training Title] Attendance"

### 2. VALUE EXTRACTION:
   - Extract the ACTUAL quantitative number/percentage found in the cell (e.g., 16.36, 50000, 85%).
   - **NEVER** default to "1" unless the report is explicitly counting a single occurrence.
   - If the value is a percentage, extract the number (e.g., "16.36%" -> reported: 16.36, dataType: "percentage").
   - If the value is currency, extract the number (e.g., "₱50,000" -> reported: 50000, dataType: "currency").

### 3. NOISE EXCLUSION (STRICT):
   - IGNORE these completely - do NOT create activities for:
     * Generic headers: "Remarks", "Total", "Grand Total", "Note", "Target", "Accomplishment", "Variance"
     * Column labels: "(1)", "(2)", "[(4/2)]*100", "Number of", "Total Number of"
     * Empty or N/A values
     * Summary rows at the bottom of tables
   - If you're unsure whether something is data or a header, check if it has a meaningful numeric value.

### 4. DOCUMENT TYPE DETECTION:
   - Look at the document title to understand context:
     * "Alumni Employment" / "Graduate Tracer" -> This is academic/employment data
     * "Financial Report" / "Budget" -> This is financial data
     * "Research Output" / "Publications" -> This is research data
     * "Training Report" / "Seminar" -> This is HR development data

Return a JSON object with this structure:
{{
  "documentType": "academic|financial|research|training|other",
  "activities": [
    {{
      "name": "BS CS Employment Rate",
      "reported": 16.36,
      "unit": "Campus Name or Department",
      "description": "Employment rate for BS CS graduates within 2 years",
      "dataType": "percentage"
    }}
  ]
}}

CRITICAL REMINDERS:
- Combine row + column context to form meaningful activity names
- Use the ACTUAL numerical value from the document
- Skip all header rows and summary rows
- Return ONLY valid JSON, no other text
      `);
            const chain = extractionPrompt.pipe(this.llm);
            const result = await chain.invoke({
                user_input: userText
            });
            // Parse the response
            const responseText = typeof result === 'string' ? result : result.content;
            let activities = [];
            try {
                const parsed = JSON.parse(responseText);
                activities = parsed.activities || [];
                console.log('[EXTRACTION] Extracted', activities.length, 'activities from document');
            } catch (parseError) {
                console.error('[EXTRACTION] Failed to parse LLM response:', parseError);
                // Fallback: try to extract activities from the text response
                const lines = responseText.split('\n').filter((line)=>line.match(/^\d+\.\s+/) || line.includes('Activity') || line.includes('Training'));
                activities = lines.map((line)=>({
                        name: line.replace(/^\d+\.\s+/, '').trim(),
                        reported: 1,
                        unit: null,
                        description: ''
                    }));
            }
            // Apply enhanced noise filtering using the global filterNoiseActivities function
            activities = filterNoiseActivities(activities);
            // Apply Dominant KRA consolidation to prevent mismatched KRA assignments
            // e.g., Alumni Employment should all be KRA 3, not split between KRA 3 and KRA 4
            activities = consolidateKRAs(activities);
            // Cache results for 24 hours (86400 seconds)
            const ttl = 24 * 60 * 60;
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$redis$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redisService"].set(cacheKey, activities, ttl);
            console.log(`[EXTRACTION] Cached ${activities.length} activities in Redis with TTL=${ttl}s`);
            return activities;
        } catch (error) {
            console.error('[EXTRACTION] Error extracting activities:', error);
            throw error;
        }
    }
    async processQPRO(fileBuffer, fileType, unitId, reportYearOverride) {
        try {
            // Validate input
            if (!fileBuffer || fileBuffer.length === 0) {
                throw new Error('File buffer is empty');
            }
            let userText;
            // Extract text based on file type
            if (fileType.toLowerCase() === 'application/pdf') {
                // Extract text from PDF using pdf2json
                const pdfParser = new PDFParser();
                // Create a promise to handle the event-driven pdf2json
                userText = await new Promise((resolve, reject)=>{
                    pdfParser.on('pdfParser_dataError', (errData)=>{
                        reject(errData.parserError);
                    });
                    pdfParser.on('pdfParser_dataReady', (pdfData)=>{
                        let textContent = '';
                        if (pdfData && pdfData.formImage && pdfData.formImage.Pages) {
                            pdfData.formImage.Pages.forEach((page)=>{
                                if (page.Texts) {
                                    page.Texts.forEach((textItem)=>{
                                        textContent += textItem.R && Array.isArray(textItem.R) ? textItem.R.map((run)=>this.decodeText(run.T)).join(' ') + ' ' : this.decodeText(textItem.T) + ' ';
                                    });
                                    textContent += '\n';
                                }
                            });
                        }
                        resolve(textContent);
                    });
                    pdfParser.parseBuffer(fileBuffer);
                });
            } else if (fileType.toLowerCase() === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                // Enhanced DOCX extraction - extract both raw text AND convert to HTML for table content
                const rawTextResult = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$mammoth$2f$lib$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].extractRawText({
                    buffer: fileBuffer
                });
                const userTextRaw = rawTextResult.value || '';
                // Also extract HTML to better preserve table structure
                const htmlResult = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$mammoth$2f$lib$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].convertToHtml({
                    buffer: fileBuffer
                });
                const htmlContent = htmlResult.value || '';
                console.log('[QPRO DIAGNOSTIC] HTML content length:', htmlContent.length);
                // More robust table extraction - handle nested HTML and complex structures
                let tableText = '';
                // Method 1: Extract table rows with improved regex
                const tableRowsRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
                let rowMatch;
                let rowCount = 0;
                while((rowMatch = tableRowsRegex.exec(htmlContent)) !== null){
                    const rowContent = rowMatch[1];
                    // Extract cell content from <td> and <th> tags
                    const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
                    const cells = [];
                    let cellMatch;
                    while((cellMatch = cellRegex.exec(rowContent)) !== null){
                        // Remove all HTML tags and decode entities
                        let cellText = cellMatch[1].replace(/<[^>]*>/g, ' ') // Remove all HTML tags
                        .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
                        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim();
                        // Clean up multiple spaces
                        cellText = cellText.replace(/\s+/g, ' ');
                        if (cellText.length > 0) {
                            cells.push(cellText);
                        }
                    }
                    if (cells.length > 0) {
                        tableText += cells.join(' | ') + '\n';
                        rowCount++;
                    }
                }
                console.log('[QPRO DIAGNOSTIC] Extracted', rowCount, 'table rows from HTML');
                // Pre-process table text to make it LLM-friendly
                // Convert pipe-separated rows into numbered list format
                const tableLines = tableText.split('\n').filter((line)=>line.trim().length > 0);
                let processedTableText = 'EXTRACTED TABLE ACTIVITIES (COMPLETE LIST):\n';
                processedTableText += '='.repeat(50) + '\n';
                tableLines.forEach((line, idx)=>{
                    // Skip header rows (lines with pipes that are mostly short text)
                    const cells = line.split('|').map((c)=>c.trim());
                    const avgCellLength = cells.reduce((sum, c)=>sum + c.length, 0) / cells.length;
                    // Only include rows that have meaningful content (not headers)
                    if (avgCellLength > 3 && cells.some((c)=>c.length > 5)) {
                        // Extract the activity name (usually first or most descriptive cell)
                        const activityName = cells.find((c)=>c.length > 10) || cells[0];
                        if (activityName && activityName.length > 3) {
                            processedTableText += `${idx + 1}. ${activityName}\n`;
                        }
                    }
                });
                processedTableText += '='.repeat(50) + '\n';
                // Combine raw text with processed table content
                userText = userTextRaw + '\n\n' + processedTableText + '\n\n' + tableText;
            } else {
                throw new Error(`Unsupported file type: ${fileType}`);
            }
            // Diagnostic logging: output raw extracted text metadata
            console.log('[QPRO DIAGNOSTIC] ========== RAW TEXT EXTRACTION ==========');
            console.log('[QPRO DIAGNOSTIC] File type:', fileType);
            console.log('[QPRO DIAGNOSTIC] Raw text length (chars):', userText?.length || 0);
            console.log('[QPRO DIAGNOSTIC] Raw text preview (first 500 chars):', userText?.substring(0, 500));
            console.log('[QPRO DIAGNOSTIC] Raw text preview (last 500 chars):', userText?.substring(userText.length - 500));
            // Count extracted activities from the preprocessed list
            const activityListMatches = userText.match(/^\d+\.\s+.+$/gm);
            console.log('[QPRO DIAGNOSTIC] Total activities in preprocessed list:', activityListMatches ? activityListMatches.length : 0);
            // Also count lines with content (each line might be an activity in a table)
            const nonEmptyLines = userText.split('\n').filter((line)=>line.trim().length > 5).length;
            console.log('[QPRO DIAGNOSTIC] Non-empty content lines:', nonEmptyLines);
            console.log('[QPRO DIAGNOSTIC] ==========================================');
            // Validate extracted text
            if (!userText || userText.trim().length === 0) {
                throw new Error('No text could be extracted from the document');
            }
            // ========== NEW ROUTER-EXTRACTOR ARCHITECTURE ==========
            // This replaces the fuzzy vector search with deterministic JSON-guided logic
            // ========== PHASE 1: SECTION DETECTION (Preprocessing) ==========
            console.log('[QPRO DIAGNOSTIC] ========== SECTION DETECTION ==========');
            const sectionDetectionResult = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$document$2d$section$2d$detector$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["documentSectionDetector"].detectSections(userText);
            console.log(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$document$2d$section$2d$detector$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["documentSectionDetector"].generateSectionSummary(sectionDetectionResult));
            console.log('[QPRO DIAGNOSTIC] ==========================================');
            // ========== PHASE 2: SUMMARY EXTRACTION (Preprocessing) ==========
            console.log('[QPRO DIAGNOSTIC] ========== SUMMARY EXTRACTION ==========');
            const summaryExtractionResult = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$summary$2d$extractor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["summaryExtractor"].extractSummaries(userText);
            console.log(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$summary$2d$extractor$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["summaryExtractor"].generateExtractionSummary(summaryExtractionResult));
            console.log('[QPRO DIAGNOSTIC] ==========================================');
            // Extract document title from section detection or use generic title
            const documentTitle = sectionDetectionResult.sections[0]?.title || sectionDetectionResult.documentType || 'QPRO Document';
            // Determine report year (prefer caller-provided year)
            const reportYear = Number.isFinite(reportYearOverride) ? Math.trunc(Number(reportYearOverride)) : new Date().getFullYear();
            console.log(`[QPRO DIAGNOSTIC] Document Title: "${documentTitle}"`);
            console.log(`[QPRO DIAGNOSTIC] Report Year: ${reportYear}`);
            // ========== PHASE 3: ROUTER - Classify to Single Dominant KRA ==========
            console.log('[QPRO DIAGNOSTIC] ========== ROUTER: KRA CLASSIFICATION ==========');
            const routerResult = await classifyDominantKRA(documentTitle, userText);
            if (!routerResult) {
                console.error('[ROUTER] Could not classify document to a specific KRA');
                throw new Error('Document could not be classified into a Strategic Plan KRA. Please ensure the document contains relevant content.');
            }
            const { kraId: dominantKRA, confidence: routerConfidence } = routerResult;
            // Use normalized KRA ID for consistent lookup
            const normalizedDominantKRA = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$qpro$2d$aggregation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeKraId"])(dominantKRA);
            const targetKRA = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2f$strategic_plan$2e$json__$28$json$29$__["default"].kras.find((k)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$qpro$2d$aggregation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeKraId"])(k.kra_id) === normalizedDominantKRA);
            console.log(`[ROUTER] ✅ Dominant KRA: ${normalizedDominantKRA} - "${targetKRA?.kra_title}"`);
            console.log(`[ROUTER] Confidence: ${(routerConfidence * 100).toFixed(1)}%`);
            console.log('[QPRO DIAGNOSTIC] ==========================================');
            // ========== PHASE 4: EXTRACTOR - Extract Activities for This KRA Only ==========
            console.log('[QPRO DIAGNOSTIC] ========== EXTRACTOR: ACTIVITY EXTRACTION ==========');
            const extractedActivities = await extractActivitiesForKRA(userText, normalizedDominantKRA, reportYear);
            console.log(`[EXTRACTOR] Extracted ${extractedActivities.length} activities for ${normalizedDominantKRA}`);
            console.log('[QPRO DIAGNOSTIC] ==========================================');
            // ========== PHASE 5: NOISE FILTER - Clean Extracted Activities ==========
            console.log('[QPRO DIAGNOSTIC] ========== NOISE FILTER ==========');
            const cleanedActivities = filterNoiseActivities(extractedActivities);
            console.log(`[NOISE FILTER] After filtering: ${cleanedActivities.length} activities`);
            console.log('[QPRO DIAGNOSTIC] ==========================================');
            // ========== PHASE 6: ENRICH ACTIVITIES - Add Required Fields ==========
            console.log('[QPRO DIAGNOSTIC] ========== ACTIVITY ENRICHMENT ==========');
            const enrichedActivities = cleanedActivities.map((act)=>{
                let reported = act.reported || act.reported_value || 0;
                const initiativeId = act.initiativeId || act.kpi_id || `${normalizedDominantKRA}-KPI1`;
                // Resolve KPI target meta (single institutional target per KPI)
                const meta = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$qpro$2d$aggregation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getInitiativeTargetMeta"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2f$strategic_plan$2e$json__$28$json$29$__["default"], normalizedDominantKRA, initiativeId, reportYear);
                const initiativeTarget = typeof act.target === 'number' ? act.target : act.target_value !== undefined ? Number(act.target_value) : Number(act.target || 0);
                const resolvedInitiativeTarget = meta.targetValue ?? (Number.isFinite(initiativeTarget) && initiativeTarget > 0 ? initiativeTarget : 0);
                // Activity-level semantics:
                // - For count-based KPIs where each extracted row/title is an item, each item is a contribution (target=1).
                //   KPI-level progress is computed by summing items and comparing to the single institutional target.
                const targetType = String(meta.targetType || act.dataType || act.data_type || 'count').toLowerCase();
                // Ensure percentage KPIs remain in 0-100 range (and avoid decimal-stripping artifacts)
                if (targetType === 'percentage') {
                    reported = normalizePercentageReported(reported);
                }
                // Activity achievement/status should be computed against the KPI's institutional target.
                // Using a per-row target of 1 for count KPIs incorrectly marks partial progress as "MET"
                // (e.g., 4 outputs vs 150 target would appear as 100%).
                const activityTarget = resolvedInitiativeTarget || 1;
                const achievementRaw = activityTarget > 0 ? Number(reported) / activityTarget * 100 : 0;
                const achievement = Math.min(100, Math.max(0, achievementRaw));
                const status = achievement >= 100 ? 'MET' : 'MISSED';
                // Get authorized strategy from the KRA
                const initiative = targetKRA?.initiatives.find((i)=>i.id === act.initiativeId || i.id === act.kpi_id);
                const authorizedStrategy = initiative?.strategies?.[0] || 'Strategy from Strategic Plan';
                // Activity-level AI messages must not treat each document as needing to meet the full target.
                // For count KPIs, show the current contribution vs the institutional target.
                const aiInsight = targetType === 'count' ? `Recorded ${reported} toward the KPI target (${resolvedInitiativeTarget || 'N/A'} for ${reportYear}).` : status === 'MET' ? `Target achieved: ${reported} vs ${resolvedInitiativeTarget || activityTarget} (${achievement.toFixed(1)}%).` : `Below target: ${reported} vs ${resolvedInitiativeTarget || activityTarget} (${achievement.toFixed(1)}%).`;
                const prescriptiveAnalysis = targetType === 'count' ? `Continue implementing: "${authorizedStrategy}". Focus on increasing total outputs toward the KPI target across the reporting period.` : status === 'MET' ? `Sustain performance by continuing: "${authorizedStrategy}".` : `Improve results by implementing: "${authorizedStrategy}" within the current reporting period.`;
                // Determine suggested status with proper typing
                const suggestedStatus = status === 'MET' ? 'MET' : achievement >= 75 ? 'ON_TRACK' : achievement >= 50 ? 'DELAYED' : 'AT_RISK';
                return {
                    name: act.name,
                    kraId: normalizedDominantKRA,
                    initiativeId: act.initiativeId || act.kpi_id || `${normalizedDominantKRA}-KPI1`,
                    reported: reported,
                    target: activityTarget,
                    initiativeTarget: resolvedInitiativeTarget,
                    achievement: Math.round(achievement * 100) / 100,
                    status: status,
                    authorizedStrategy: authorizedStrategy,
                    aiInsight: aiInsight,
                    prescriptiveAnalysis: prescriptiveAnalysis,
                    confidence: routerConfidence,
                    unit: act.unit || '',
                    evidenceSnippet: act.evidenceSnippet || act.evidence_snippet || '',
                    dataType: act.dataType || act.data_type || 'count',
                    rootCause: status === 'MISSED' ? 'Performance below target - review resource allocation and timeline' : undefined,
                    suggestedStatus: suggestedStatus
                };
            });
            console.log(`[ENRICHMENT] Enriched ${enrichedActivities.length} activities`);
            console.log('[QPRO DIAGNOSTIC] ==========================================');
            // ========== PHASE 7: PRESCRIPTIVE ANALYSIS - Generate Insights ==========
            console.log('[QPRO DIAGNOSTIC] ========== PRESCRIPTIVE ANALYSIS ==========');
            const prescriptiveResult = await generatePrescriptiveAnalysis(enrichedActivities, normalizedDominantKRA, targetKRA?.kra_title || normalizedDominantKRA, reportYear);
            console.log(`[PRESCRIPTIVE] Overall Achievement: ${prescriptiveResult.overallAchievement}%`);
            console.log('[QPRO DIAGNOSTIC] ==========================================');
            // ========== PHASE 8: BUILD FINAL OUTPUT ==========
            const kraSummary = {
                kraId: normalizedDominantKRA,
                kraTitle: targetKRA?.kra_title || normalizedDominantKRA,
                achievementRate: prescriptiveResult.overallAchievement,
                activities: enrichedActivities,
                strategicAlignment: prescriptiveResult.alignment,
                prescriptiveAnalysis: prescriptiveResult.recommendations,
                rootCause: enrichedActivities.some((a)=>a.status === 'MISSED') ? 'Some targets missed - review implementation strategies' : undefined,
                actionItems: enrichedActivities.filter((a)=>a.status === 'MISSED').slice(0, 3).map((a)=>`Address gap in: ${a.name}`)
            };
            const finalOutput = {
                activities: enrichedActivities,
                kras: [
                    kraSummary
                ],
                documentInsight: prescriptiveResult.documentInsight,
                prescriptiveItems: prescriptiveResult.prescriptiveItems,
                alignment: prescriptiveResult.alignment,
                opportunities: prescriptiveResult.opportunities,
                gaps: prescriptiveResult.gaps,
                recommendations: prescriptiveResult.recommendations,
                overallAchievement: prescriptiveResult.overallAchievement
            };
            console.log('[QPRO DIAGNOSTIC] ========== FINAL OUTPUT SUMMARY ==========');
            console.log(`[FINAL] Dominant KRA: ${normalizedDominantKRA}`);
            console.log(`[FINAL] Total Activities: ${finalOutput.activities.length}`);
            console.log(`[FINAL] Overall Achievement: ${finalOutput.overallAchievement}%`);
            console.log('[QPRO DIAGNOSTIC] ==========================================');
            return finalOutput;
        } catch (error) {
            console.error('Error in processQPRO:', error);
            throw error;
        }
    }
    /**
   * Analyze with exponential backoff retry and LLM fallback
   */ async analyzeWithRetry(strategicContext, userText, sectionAnalysis = '', maxRetries = 3) {
        let lastError;
        // Validate inputs before attempting LLM call
        if (!strategicContext || strategicContext.trim().length === 0) {
            throw new Error('strategicContext cannot be empty');
        }
        if (!userText || userText.trim().length === 0) {
            throw new Error('userText cannot be empty');
        }
        for(let attempt = 1; attempt <= maxRetries; attempt++){
            try {
                console.log(`[AnalysisEngine] Attempt ${attempt}/${maxRetries} with GPT-4o-mini`);
                console.log(`[AnalysisEngine] strategicContext length: ${strategicContext.length}`);
                console.log(`[AnalysisEngine] userText length: ${userText.length}`);
                // Combine user input with strategic context
                const chain = this.promptTemplate.pipe(this.llm);
                const result = await chain.invoke({
                    strategic_context: strategicContext,
                    user_input: userText,
                    section_analysis: sectionAnalysis
                });
                // Parse and validate JSON response
                const rawContent = result.content;
                return this.parseAndValidateLLMResponse(rawContent);
            } catch (error) {
                lastError = error;
                console.error(`[AnalysisEngine] Attempt ${attempt} failed:`, error);
                // If this was the last retry, try fallback providers
                if (attempt === maxRetries) {
                    console.log('[AnalysisEngine] All GPT-4o-mini attempts failed, trying fallback providers...');
                    // Try Qwen fallback
                    try {
                        return await this.analyzeWithQwen(strategicContext, userText, sectionAnalysis);
                    } catch (qwenError) {
                        console.error('[AnalysisEngine] Qwen fallback failed:', qwenError);
                        // Try Gemini as last resort
                        try {
                            return await this.analyzeWithGemini(strategicContext, userText, sectionAnalysis);
                        } catch (geminiError) {
                            console.error('[AnalysisEngine] Gemini fallback failed:', geminiError);
                            throw new Error(`All LLM providers failed. Last error: ${lastError.message}`);
                        }
                    }
                }
                // Exponential backoff: wait 2^attempt seconds
                const waitTime = Math.pow(2, attempt) * 1000;
                console.log(`[AnalysisEngine] Waiting ${waitTime}ms before retry...`);
                await new Promise((resolve)=>setTimeout(resolve, waitTime));
            }
        }
        throw lastError;
    }
    /**
   * Fallback analysis using Qwen
   */ async analyzeWithQwen(strategicContext, userText, sectionAnalysis = '') {
        console.log('[AnalysisEngine] Using Qwen fallback provider');
        const qwenClient = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$openai$2f$dist$2f$chat_models$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ChatOpenAI"]({
            modelName: "qwen/qwen-2.5-72b-instruct",
            temperature: 0.2,
            maxTokens: 3500,
            configuration: {
                baseURL: process.env.OPENAI_BASE_URL || "https://openrouter.ai/api/v1",
                apiKey: process.env.OPENAI_API_KEY
            },
            modelKwargs: {
                response_format: {
                    type: "json_object"
                }
            }
        });
        const chain = this.promptTemplate.pipe(qwenClient);
        const result = await chain.invoke({
            strategic_context: strategicContext,
            user_input: userText,
            section_analysis: sectionAnalysis
        });
        return this.parseAndValidateLLMResponse(result.content);
    }
    /**
   * Fallback analysis using Gemini
   */ async analyzeWithGemini(strategicContext, userText, sectionAnalysis = '') {
        console.log('[AnalysisEngine] Using Gemini fallback provider');
        // Note: Gemini doesn't support JSON mode the same way, so we rely on prompt engineering
        const geminiPrompt = `${this.promptTemplate.template}\n\nIMPORTANT: Return ONLY valid JSON in the exact format specified above. No markdown, no code blocks, just the JSON object.`;
        const geminiClient = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$openai$2f$dist$2f$chat_models$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ChatOpenAI"]({
            modelName: "gemini-2.0-flash-001",
            temperature: 0.2,
            maxTokens: 3500,
            configuration: {
                baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
                apiKey: process.env.GOOGLE_AI_API_KEY
            }
        });
        const geminiTemplate = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$langchain$2f$core$2f$dist$2f$prompts$2f$prompt$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PromptTemplate"].fromTemplate(geminiPrompt);
        const chain = geminiTemplate.pipe(geminiClient);
        const result = await chain.invoke({
            strategic_context: strategicContext,
            user_input: userText,
            section_analysis: sectionAnalysis
        });
        return this.parseAndValidateLLMResponse(result.content);
    }
    /**
   * Helper method to decode hex-encoded text from pdf2json
   */ decodeText(hexText) {
        if (!hexText) return '';
        try {
            // Remove the forward slash and replace #20 with space if needed
            hexText = hexText.replace(/\//g, '').replace(/#20/g, ';');
            // Decode hex to string
            const text = hexText.replace(/#([0-9A-Fa-f]{2})/g, (match, hex)=>{
                return String.fromCharCode(parseInt(hex, 16));
            });
            return decodeURIComponent(escape(text));
        } catch (error) {
            console.error('Error decoding text:', error);
            return hexText || '';
        }
    }
    /**
   * Generate cache key for vector search results
   */ generateCacheKey(text, unitId) {
        const textHash = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["createHash"])('md5').update(text.slice(0, 1000)).digest('hex');
        return `qpro:vector-search:${textHash}:${unitId || 'all'}`;
    }
    /**
   * Implement "Winner Takes All" deduplication
   * Removes semantic duplicates from search results, keeping only the highest-scoring entry
   * for each KRA/initiative combination to prevent double-counting activities
   */ deduplicateSearchResults(results) {
        if (results.length === 0) return results;
        // Group results by KRA ID to identify duplicates
        const kraMap = new Map();
        results.forEach((result)=>{
            const kraId = result.metadata?.kra_id;
            if (!kraId) {
                return; // Skip results without KRA ID
            }
            // If we haven't seen this KRA yet, or this result has a higher score, keep it
            if (!kraMap.has(kraId) || (result.score || 0) > (kraMap.get(kraId).score || 0)) {
                kraMap.set(kraId, result);
                console.log(`[DEDUP] KRA ${kraId}: score=${result.score?.toFixed(3)}`);
            } else {
                console.log(`[DEDUP] Skipping duplicate KRA ${kraId} (lower score: ${result.score?.toFixed(3)} < ${kraMap.get(kraId).score?.toFixed(3)})`);
            }
        });
        // Convert map back to array, sorted by score descending
        const deduped = Array.from(kraMap.values()).sort((a, b)=>(b.score || 0) - (a.score || 0));
        console.log(`[DEDUP] Deduplicated ${results.length} results to ${deduped.length} unique KRAs`);
        return deduped;
    }
    /**
   * Parse and validate LLM JSON response
   */ parseAndValidateLLMResponse(rawContent) {
        try {
            let parsed;
            // If rawContent is already an object, use it directly
            if (typeof rawContent === 'object' && rawContent !== null) {
                console.log('[AnalysisEngine] Content is already an object, using directly');
                parsed = rawContent;
            } else {
                // If it's a string, parse it
                let cleanedContent = String(rawContent).trim();
                // Remove markdown code blocks if present
                if (cleanedContent.startsWith('```')) {
                    cleanedContent = cleanedContent.replace(/^```json\n?/, '').replace(/\n?```$/, '');
                }
                // Parse JSON
                parsed = JSON.parse(cleanedContent);
            }
            // Validate with Zod schema
            const validated = QPROAnalysisOutputSchema.parse(parsed);
            console.log('[AnalysisEngine] Successfully validated LLM response');
            console.log(`[AnalysisEngine] Extracted ${validated.activities.length} activities across ${validated.kras.length} KRAs`);
            return validated;
        } catch (error) {
            if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].ZodError) {
                console.error('[AnalysisEngine] Zod validation failed:', error.errors);
                throw new Error(`LLM output validation failed: ${error.errors.map((e)=>`${e.path.join('.')}: ${e.message}`).join(', ')}`);
            }
            console.error('[AnalysisEngine] JSON parsing failed:', error);
            console.error('[AnalysisEngine] Raw content type:', typeof rawContent);
            console.error('[AnalysisEngine] Raw content preview:', String(rawContent).substring(0, 200));
            throw new Error(`Failed to parse LLM response as JSON: ${error}`);
        }
    }
}
const analysisEngineService = new AnalysisEngineService();
const __TURBOPACK__default__export__ = AnalysisEngineService;
}),
"[externals]/node:os [external] (node:os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:os", () => require("node:os"));

module.exports = mod;
}),
"[externals]/node:util [external] (node:util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:util", () => require("node:util"));

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
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[project]/lib/services/qpro-analysis-service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "QPROAnalysisService",
    ()=>QPROAnalysisService,
    "qproAnalysisService",
    ()=>qproAnalysisService
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$analysis$2d$engine$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/services/analysis-engine-service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$azure$2f$storage$2d$blob$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@azure/storage-blob/dist/esm/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$azure$2f$storage$2d$blob$2f$dist$2f$esm$2f$BlobServiceClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@azure/storage-blob/dist/esm/BlobServiceClient.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$qpro$2d$aggregation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils/qpro-aggregation.ts [app-route] (ecmascript)");
;
;
;
;
const prisma = new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["PrismaClient"]();
// ========== PRISMA HELPERS ==========
/**
 * Convert undefined to null for Prisma compatibility.
 * Prisma/SQL doesn't accept JavaScript `undefined` - must be `null`.
 */ const toPrisma = (val)=>val === undefined ? null : val;
/**
 * Ensure a value is an array (for JSON array fields).
 */ const toArray = (val)=>Array.isArray(val) ? val : [];
/**
 * Convert array or object to string for String fields in Prisma.
 * Handles arrays of strings, arrays of objects, or plain strings.
 */ const toString = (val)=>{
    if (!val) return null;
    if (typeof val === 'string') return val;
    if (Array.isArray(val)) {
        if (val.length === 0) return null; // Empty array -> null
        // If array of objects with 'action' field (recommendations), format them
        if (val.length > 0 && typeof val[0] === 'object' && val[0].action) {
            return val.map((item)=>`• ${item.action}${item.timeline ? ` (${item.timeline})` : ''}`).join('\n');
        }
        // Otherwise, join array items with bullet points
        return val.map((item)=>`• ${typeof item === 'string' ? item : JSON.stringify(item)}`).join('\n');
    }
    // For plain objects, convert to JSON string
    return JSON.stringify(val);
};
// Initialize Azure Blob Storage client
const blobServiceClient = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$azure$2f$storage$2d$blob$2f$dist$2f$esm$2f$BlobServiceClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["BlobServiceClient"].fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
class QPROAnalysisService {
    /**
   * Calculate type detection score based on keyword presence and importance
   * Gives higher weight to primary keywords and phrases
   */ calculateTypeScore(text, keywords, primaryKeywords) {
        let score = 0;
        const textLower = text.toLowerCase();
        // Primary keywords get 2 points each
        for (const pkw of primaryKeywords){
            if (textLower.includes(pkw.toLowerCase())) {
                score += 2;
            }
        }
        // Secondary keywords get 1 point each
        for (const kw of keywords){
            if (!primaryKeywords.includes(kw) && textLower.includes(kw.toLowerCase())) {
                score += 1;
            }
        }
        return score;
    }
    /**
   * Calculate semantic similarity score between activity and KRA content
   * Considers word overlap, phrase matching, and contextual relevance
   */ calculateSemanticScore(activityText, kraText) {
        const activityLower = activityText.toLowerCase();
        const kraLower = kraText.toLowerCase();
        const activityWords = new Set(activityLower.split(/\s+/).filter((w)=>w.length > 3));
        const kraWords = new Set(kraLower.split(/\s+/).filter((w)=>w.length > 3));
        // Calculate Jaccard similarity
        let commonWords = 0;
        activityWords.forEach((word)=>{
            if (kraWords.has(word)) {
                commonWords++;
            }
        });
        const totalUnique = activityWords.size + kraWords.size - commonWords;
        const jaccardScore = totalUnique > 0 ? commonWords / totalUnique * 10 : 0;
        // Bonus for phrase matches (2+ word sequences)
        let phraseBonus = 0;
        const activityPhrases = this.extractPhrases(activityLower);
        const kraPhrases = this.extractPhrases(kraLower);
        for (const phrase of activityPhrases){
            if (kraLower.includes(phrase)) {
                phraseBonus += 3; // Phrases are worth more
            }
        }
        return jaccardScore + phraseBonus;
    }
    /**
   * Extract meaningful phrases from text (2-3 word sequences)
   */ extractPhrases(text) {
        const words = text.toLowerCase().split(/\s+/).filter((w)=>w.length > 2);
        const phrases = [];
        for(let i = 0; i < words.length - 1; i++){
            phrases.push(words.slice(i, i + 2).join(' '));
            if (i < words.length - 2) {
                phrases.push(words.slice(i, i + 3).join(' '));
            }
        }
        return phrases;
    }
    /**
   * Validate and fix KRA assignments based on activity type matching rules
   * Post-processes LLM output to enforce strict type-to-KRA mapping
   */ validateAndFixActivityKRAMatches(activities, strategicPlan) {
        const correctedActivities = activities.map((activity)=>{
            const activityName = activity.name.toLowerCase();
            const currentKraId = activity.kraId;
            // Enrich all activities with KRA and KPI titles from strategic plan
            const enrichActivity = (act, kraIdToEnrich, initiativeId)=>{
                const strategicPlanKras = strategicPlan && strategicPlan.kras || [];
                // Use normalized KRA ID for consistent lookup
                const normalizedKraIdToEnrich = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$qpro$2d$aggregation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeKraId"])(kraIdToEnrich);
                const kra = strategicPlanKras.find((k)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$qpro$2d$aggregation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeKraId"])(k.kra_id) === normalizedKraIdToEnrich);
                const enrichedData = {
                    ...act
                };
                if (kra) {
                    enrichedData.kraTitle = kra.kra_title || kraIdToEnrich;
                    // If we have an initiativeId, find the matching initiative
                    if (initiativeId && kra.initiatives) {
                        const initiative = kra.initiatives.find((init)=>init.id === initiativeId);
                        if (initiative) {
                            enrichedData.kpiTitle = initiative.key_performance_indicator?.outputs || initiativeId;
                        }
                    }
                }
                return enrichedData;
            };
            // Enhanced Activity type detection with semantic understanding
            const detectionScores = {
                training: this.calculateTypeScore(activityName, [
                    'train',
                    'seminar',
                    'workshop',
                    'course',
                    'capacity',
                    'upskill',
                    'certification',
                    'program'
                ], [
                    'training',
                    'seminar',
                    'workshop'
                ]),
                curriculum: this.calculateTypeScore(activityName, [
                    'curriculum',
                    'course content',
                    'syllabus',
                    'learning material',
                    'instructional'
                ], [
                    'curriculum',
                    'syllabus'
                ]),
                digital: this.calculateTypeScore(activityName, [
                    'digital',
                    'system',
                    'platform',
                    'portal',
                    'infrastructure',
                    'technology',
                    'e-',
                    'cyber',
                    'electronic'
                ], [
                    'digital',
                    'portal',
                    'platform'
                ]),
                research: this.calculateTypeScore(activityName, [
                    'research',
                    'study',
                    'publication',
                    'paper',
                    'journal',
                    'investigation',
                    'scholarly'
                ], [
                    'research',
                    'publication',
                    'journal'
                ]),
                extension: this.calculateTypeScore(activityName, [
                    'extension',
                    'outreach',
                    'community service',
                    'outreach',
                    'engagement',
                    'partnership'
                ], [
                    'extension',
                    'outreach'
                ])
            };
            let expectedKraTypes = [];
            let primaryType = '';
            // Determine expected KRA type based on highest scoring type
            const sortedTypes = Object.entries(detectionScores).sort(([, a], [, b])=>b - a);
            const [topType, topScore] = sortedTypes[0];
            if (topScore > 0) {
                primaryType = topType;
                if (topType === 'training') {
                    expectedKraTypes = [
                        'KRA 13',
                        'KRA 11'
                    ]; // HR Development/Capacity Building
                } else if (topType === 'curriculum') {
                    expectedKraTypes = [
                        'KRA 1',
                        'KRA 13'
                    ]; // Curriculum/Program Development
                } else if (topType === 'digital') {
                    expectedKraTypes = [
                        'KRA 17',
                        'KRA 4',
                        'KRA 5'
                    ]; // Digital Transformation/Innovation
                } else if (topType === 'research') {
                    expectedKraTypes = [
                        'KRA 3',
                        'KRA 4',
                        'KRA 5'
                    ]; // Research & Development KRAs
                } else if (topType === 'extension') {
                    expectedKraTypes = [
                        'KRA 6',
                        'KRA 7'
                    ]; // Extension & Community Service
                }
            }
            // Check if current KRA matches expected type
            const isCorrectType = expectedKraTypes.length === 0 || expectedKraTypes.includes(currentKraId);
            if (!isCorrectType && expectedKraTypes.length > 0) {
                console.log(`[QPRO VALIDATION] Activity "${activity.name}" was matched to ${currentKraId} but expected type is ${expectedKraTypes.join(' or ')}`);
                console.log(`  Activity type detected: ${primaryType} (score=${topScore.toFixed(2)}) | Full scores: training=${detectionScores.training.toFixed(2)}, curriculum=${detectionScores.curriculum.toFixed(2)}, digital=${detectionScores.digital.toFixed(2)}, research=${detectionScores.research.toFixed(2)}`);
                // Reassign to correct KRA using semantic matching
                const strategicPlanKras = strategicPlan && strategicPlan.kras || [];
                const targetKra = strategicPlanKras.find((kra)=>expectedKraTypes.includes(kra.kra_id));
                if (targetKra && targetKra.initiatives && targetKra.initiatives.length > 0) {
                    // Find best-fit initiative/KPI within the target KRA using semantic similarity
                    let bestInitiative = targetKra.initiatives[0];
                    let bestScore = 0;
                    targetKra.initiatives.forEach((initiative)=>{
                        const kraText = [
                            targetKra.kra_title,
                            initiative.key_performance_indicator?.outputs || '',
                            Array.isArray(initiative.strategies) ? initiative.strategies.join(' ') : '',
                            Array.isArray(initiative.programs_activities) ? initiative.programs_activities.join(' ') : ''
                        ].join(' ').toLowerCase();
                        // Semantic similarity: score based on content overlap and context
                        const score = this.calculateSemanticScore(activityName, kraText);
                        if (score > bestScore) {
                            bestScore = score;
                            bestInitiative = initiative;
                        }
                    });
                    // Extract target from timeline_data
                    let targetValue = 1;
                    if (bestInitiative.targets && bestInitiative.targets.timeline_data) {
                        const timelineData = bestInitiative.targets.timeline_data.find((t)=>t.year === 2025);
                        if (timelineData) {
                            targetValue = typeof timelineData.target_value === 'number' ? timelineData.target_value : 1;
                        }
                    }
                    // Calculate confidence: combine type detection score + semantic match score
                    const typeConfidence = Math.min(1.0, topScore / 2); // Type detection contributes up to 0.5
                    const semanticConfidence = Math.min(0.5, bestScore / 10); // Semantic match contributes up to 0.5
                    const newConfidence = Math.min(0.95, Math.max(0.55, typeConfidence + semanticConfidence));
                    // Extract KPI title from the initiative
                    const kpiTitle = bestInitiative.key_performance_indicator?.outputs || bestInitiative.id || '';
                    console.log(`  ✓ Reassigned to ${targetKra.kra_id} (${bestInitiative.id}) with target=${targetValue}, confidence=${newConfidence.toFixed(2)} (type=${typeConfidence.toFixed(2)} + semantic=${semanticConfidence.toFixed(2)})`);
                    const reportedValue = activity.reported || 0;
                    const achievementPercent = targetValue > 0 ? reportedValue / targetValue * 100 : 0;
                    return {
                        ...activity,
                        kraId: targetKra.kra_id,
                        kraTitle: targetKra.kra_title || targetKra.kra_id,
                        initiativeId: bestInitiative.id,
                        kpiTitle: kpiTitle,
                        target: targetValue,
                        confidence: newConfidence,
                        achievement: achievementPercent,
                        status: achievementPercent >= 100 ? 'MET' : achievementPercent > 0 ? 'PARTIAL' : 'NOT_STARTED'
                    };
                }
            }
            // If activity is already classified, enrich with KRA/KPI titles
            if (currentKraId && currentKraId !== 'UNCLASSIFIED') {
                return enrichActivity(activity, currentKraId, activity.initiativeId);
            }
            return activity;
        });
        return correctedActivities;
    }
    async createQPROAnalysis(input) {
        try {
            console.log('[QPROAnalysisService] Creating analysis for document:', input.documentId);
            // Step 1: Get file buffer from blob storage
            console.log('[QPROAnalysisService] Downloading file from blob storage:', input.documentPath);
            let fileBuffer;
            try {
                fileBuffer = await this.getFileBuffer(input.documentPath);
                console.log('[QPROAnalysisService] File downloaded successfully, size:', fileBuffer.length, 'bytes');
            } catch (blobError) {
                console.error('[QPROAnalysisService] Failed to download file:', blobError);
                throw new Error(`Failed to download file from blob storage: ${blobError instanceof Error ? blobError.message : String(blobError)}`);
            }
            // Step 2: Process with analysis engine
            console.log('[QPROAnalysisService] Starting PDF/DOCX analysis...');
            let analysisOutput;
            try {
                analysisOutput = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$analysis$2d$engine$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["analysisEngineService"].processQPRO(fileBuffer, input.documentType, input.unitId || undefined, input.year || 2025);
                console.log('[QPROAnalysisService] Analysis complete, extracted activities:', analysisOutput.activities?.length || 0);
            } catch (analysisError) {
                console.error('[QPROAnalysisService] Analysis engine failed:', analysisError);
                throw new Error(`Text extraction and analysis failed: ${analysisError instanceof Error ? analysisError.message : String(analysisError)}`);
            }
            // Load strategic plan for validation
            console.log('[QPROAnalysisService] Loading strategic plan for validation...');
            const strategicPlan = await this.loadStrategicPlan();
            // Post-LLM validation: fix any KRA assignments that violate type rules
            let validatedActivities = analysisOutput.activities || [];
            if (strategicPlan && strategicPlan.kras) {
                validatedActivities = this.validateAndFixActivityKRAMatches(validatedActivities, strategicPlan);
            }
            // Rebuild KRA summaries with corrected activities
            const correctedKras = (analysisOutput.kras || []).map((kra)=>({
                    ...kra,
                    activities: validatedActivities.filter((act)=>act.kraId === kra.kraId)
                }));
            // Extract structured data from validated output
            const { alignment, opportunities, gaps, recommendations, overallAchievement, documentInsight, prescriptiveItems } = analysisOutput;
            const buildDocumentLevelAnalysis = (activities, plan, year)=>{
                const allKRAs = plan?.kras || [];
                // normalizeKraId is imported from qpro-aggregation.ts
                const getInitiative = (kraId, initiativeId)=>{
                    const normalizedKraIdVal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$qpro$2d$aggregation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeKraId"])(kraId);
                    const kra = allKRAs.find((k)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$qpro$2d$aggregation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["normalizeKraId"])(k.kra_id) === normalizedKraIdVal);
                    if (!kra?.initiatives) return null;
                    const normalizedId = String(initiativeId).replace(/\s+/g, '');
                    let initiative = kra.initiatives.find((i)=>String(i.id).replace(/\s+/g, '') === normalizedId);
                    if (!initiative) {
                        const kpiMatch = String(initiativeId).match(/KPI(\d+)/i);
                        if (kpiMatch) {
                            initiative = kra.initiatives.find((i)=>String(i.id).includes(`KPI${kpiMatch[1]}`));
                        }
                    }
                    return initiative || null;
                };
                const formatNumber = (n, digits = 2)=>{
                    if (!Number.isFinite(n)) return '0';
                    return n.toFixed(digits);
                };
                // Group by KRA + initiative (KPI)
                const groups = new Map();
                for (const act of activities){
                    const kraId = String(act.kraId || act.kra_id || '').trim();
                    const initiativeId = String(act.initiativeId || act.initiative_id || '').trim();
                    if (!kraId || !initiativeId) continue;
                    const key = `${kraId}::${initiativeId}`;
                    if (!groups.has(key)) {
                        const initiative = getInitiative(kraId, initiativeId);
                        const type = initiative?.targets?.type ? String(initiative.targets.type) : null;
                        const title = initiative?.key_performance_indicator?.outputs ? String(initiative.key_performance_indicator.outputs) : initiativeId;
                        const meta = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$qpro$2d$aggregation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getInitiativeTargetMeta"])(plan, kraId, initiativeId, year);
                        // Fallback: if plan lookup fails, fall back to the first activity target (NOT sum)
                        const fallbackTarget = typeof act.target === 'number' ? act.target : Number(act.target);
                        const targetValue = meta.targetValue ?? (Number.isFinite(fallbackTarget) && fallbackTarget > 0 ? fallbackTarget : null);
                        groups.set(key, {
                            kraId,
                            initiativeId,
                            title,
                            type: meta.targetType ? String(meta.targetType) : type,
                            targetScope: meta.targetScope,
                            targetValue,
                            reported: [],
                            missed: 0,
                            met: 0
                        });
                    }
                    const g = groups.get(key);
                    const reportedNum = typeof act.reported === 'number' ? act.reported : Number(act.reported);
                    if (Number.isFinite(reportedNum)) g.reported.push(reportedNum);
                    // IMPORTANT: For count-based institutional targets, each extracted item is not a "miss".
                    // The pass/fail is computed at KPI (initiative) level; here we only track extraction volume.
                    // Keep legacy counters but base them on per-activity completion, not target achievement.
                    if (Number.isFinite(reportedNum) && reportedNum > 0) g.met += 1;
                    else g.missed += 1;
                }
                const groupSummaries = [];
                groups.forEach((g)=>{
                    if (g.targetValue === null || !Number.isFinite(g.targetValue) || g.targetValue <= 0) {
                        groupSummaries.push({
                            kraId: g.kraId,
                            initiativeId: g.initiativeId,
                            title: g.title,
                            type: g.type,
                            target: null,
                            actual: null,
                            achievementPercent: null,
                            met: g.met,
                            missed: g.missed
                        });
                        return;
                    }
                    const aggregated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$qpro$2d$aggregation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["computeAggregatedAchievement"])({
                        targetType: g.type,
                        targetValue: g.targetValue,
                        targetScope: g.targetScope,
                        activities: g.reported.map((r)=>({
                                reported: r
                            }))
                    });
                    const target = aggregated.totalTarget;
                    const actual = aggregated.totalReported;
                    const achievementPercent = aggregated.achievementPercent;
                    groupSummaries.push({
                        kraId: g.kraId,
                        initiativeId: g.initiativeId,
                        title: g.title,
                        type: g.type,
                        target,
                        actual,
                        achievementPercent,
                        met: g.met,
                        missed: g.missed
                    });
                });
                // Root-cause notes (if any)
                const rootCauseNotes = Array.from(new Set(activities.map((a)=>typeof a.rootCause === 'string' ? a.rootCause.trim() : '').filter((s)=>s.length > 0)));
                const kraIds = Array.from(new Set(activities.map((a)=>a.kraId).filter(Boolean)));
                const initiativeIds = Array.from(new Set(activities.map((a)=>a.initiativeId).filter(Boolean)));
                // Document Insight: factual interpretation only (no recommendations)
                const topUnderperforming = groupSummaries.filter((g)=>typeof g.achievementPercent === 'number').sort((a, b)=>(a.achievementPercent ?? 0) - (b.achievementPercent ?? 0)).slice(0, 5);
                const computedOverall = (()=>{
                    const vals = groupSummaries.map((g)=>typeof g.achievementPercent === 'number' ? g.achievementPercent : null).filter((v)=>typeof v === 'number' && Number.isFinite(v));
                    if (vals.length === 0) return 0;
                    return vals.reduce((s, n)=>s + n, 0) / vals.length;
                })();
                const insightLines = [];
                insightLines.push('### Summary');
                insightLines.push(`- Reporting period: ${year}`);
                insightLines.push(`- Activities extracted: ${activities.length}`);
                insightLines.push(`- KRAs covered: ${kraIds.length}`);
                insightLines.push(`- KPIs covered: ${initiativeIds.length}`);
                insightLines.push(`- Overall achievement score: ${formatNumber(computedOverall, 2)}%`);
                if (topUnderperforming.length > 0) {
                    insightLines.push('');
                    insightLines.push('### Key performance signals');
                    topUnderperforming.forEach((g)=>{
                        const isRate = g.type === 'percentage';
                        const suffix = isRate ? '%' : '';
                        const targetStr = g.target === null ? 'N/A' : `${formatNumber(g.target, 2)}${suffix}`;
                        const actualStr = g.actual === null ? 'N/A' : `${formatNumber(g.actual, 2)}${suffix}`;
                        const achStr = g.achievementPercent === null ? 'N/A' : `${formatNumber(g.achievementPercent, 1)}% of target`;
                        insightLines.push(`- ${g.kraId} / ${g.initiativeId}: Reported ${actualStr} vs Target ${targetStr} (${achStr})`);
                    });
                }
                if (rootCauseNotes.length > 0) {
                    insightLines.push('');
                    insightLines.push('### Observed contributing factors (from extracted notes)');
                    rootCauseNotes.slice(0, 5).forEach((note)=>insightLines.push(`- ${note}`));
                }
                const documentInsight = insightLines.join('\n');
                // Prescriptive Analysis: actionable steps (imperative verbs + timeframes)
                let prescriptiveLines = [];
                prescriptiveLines.push('### Prescriptive analysis');
                prescriptiveLines.push('- Conduct a focused review of the lowest-performing KPI areas within 2–4 weeks.');
                prescriptiveLines.push('- Define measurable corrective actions per KPI and assign owners within 1 month.');
                prescriptiveLines.push('- Establish a monthly monitoring cadence to track movement versus target.');
                prescriptiveLines.push('- Validate that reported values match the KPI target type (percentage vs count) before final submission each quarter.');
                // Deduplicate prescriptive sections (e.g., Address the primary performance gap, Data quality review)
                // If these sections are generated elsewhere and pushed into prescriptiveLines, deduplicate here:
                prescriptiveLines = prescriptiveLines.filter((line, idx, arr)=>arr.findIndex((l)=>l.trim().toLowerCase() === line.trim().toLowerCase()) === idx);
                const prescriptiveAnalysis = prescriptiveLines.join('\n');
                return {
                    documentInsight,
                    prescriptiveAnalysis,
                    summary: {
                        year,
                        activities: activities.length,
                        kras: kraIds.length,
                        kpis: initiativeIds.length,
                        overallAchievement: computedOverall
                    }
                };
            };
            // Create full analysis result text for reference
            const analysisResult = this.formatAnalysisForStorage({
                ...analysisOutput,
                activities: validatedActivities,
                kras: correctedKras
            });
            const reportYear = input.year || 2025;
            const docLevelFallback = buildDocumentLevelAnalysis(validatedActivities, strategicPlan, reportYear);
            const formatPrescriptiveItemsAsText = (items)=>{
                return items.filter((x)=>x && typeof x.title === 'string' && typeof x.issue === 'string' && typeof x.action === 'string').slice(0, 5).map((x, idx)=>{
                    const lines = [
                        `${idx + 1}. ${x.title.trim()}`,
                        `- Issue: ${x.issue.trim()}`,
                        `- Action: ${x.action.trim()}`
                    ];
                    if (x.nextStep && x.nextStep.trim()) {
                        lines.push(`- Next Step: ${x.nextStep.trim()}`);
                    }
                    return lines.join('\n');
                }).join('\n\n');
            };
            const llmDocumentInsight = typeof documentInsight === 'string' ? documentInsight.trim() : '';
            const llmPrescriptiveItems = Array.isArray(prescriptiveItems) ? prescriptiveItems.filter((x)=>x && typeof x === 'object').slice(0, 5).map((x)=>({
                    title: String(x.title || '').trim(),
                    issue: String(x.issue || '').trim(),
                    action: String(x.action || '').trim(),
                    nextStep: x.nextStep ? String(x.nextStep).trim() : undefined
                })).filter((x)=>x.title && x.issue && x.action) : [];
            const llmPrescriptiveText = llmPrescriptiveItems.length > 0 ? formatPrescriptiveItemsAsText(llmPrescriptiveItems) : '';
            const docLevel = {
                documentInsight: llmDocumentInsight || docLevelFallback.documentInsight,
                prescriptiveAnalysis: llmPrescriptiveText || docLevelFallback.prescriptiveAnalysis,
                prescriptiveItems: llmPrescriptiveItems.length > 0 ? llmPrescriptiveItems : undefined,
                summary: {
                    ...docLevelFallback.summary,
                    year: reportYear,
                    overallAchievement: Number.isFinite(overallAchievement) ? overallAchievement : docLevelFallback.summary.overallAchievement
                }
            };
            // Create the QPRO analysis record in the database with DRAFT status
            // Activities are staged and not committed to live dashboard until approved
            const qproAnalysis = await prisma.qPROAnalysis.create({
                data: {
                    documentId: input.documentId,
                    documentTitle: input.documentTitle,
                    documentPath: input.documentPath,
                    documentType: input.documentType,
                    analysisResult,
                    // Keep these fields for backward compatibility, but ensure they remain factual (no recommendations bleeding into insight).
                    alignment: docLevel.documentInsight || toString(alignment) || 'Analysis completed',
                    opportunities: '',
                    gaps: '',
                    recommendations: docLevel.prescriptiveAnalysis || toString(recommendations),
                    kras: correctedKras,
                    activities: validatedActivities,
                    achievementScore: docLevel.summary.overallAchievement,
                    prescriptiveAnalysis: {
                        documentInsight: docLevel.documentInsight,
                        prescriptiveAnalysis: docLevel.prescriptiveAnalysis,
                        prescriptiveItems: docLevel.prescriptiveItems,
                        summary: docLevel.summary,
                        generatedAt: new Date().toISOString(),
                        source: 'analysis-engine'
                    },
                    status: 'DRAFT',
                    uploadedById: input.uploadedById,
                    unitId: input.unitId,
                    year: reportYear,
                    quarter: input.quarter || 1
                },
                include: {
                    document: true,
                    user: true,
                    unit: true
                }
            });
            // Create staged AggregationActivity records (not linked to live aggregation yet)
            // These will be committed to the live dashboard only after approval
            try {
                for (const activity of validatedActivities){
                    if (activity.kraId && activity.initiativeId) {
                        await prisma.aggregationActivity.create({
                            data: {
                                // aggregation_id is NULL for DRAFT - will be linked on approval
                                aggregation_id: null,
                                qpro_analysis_id: qproAnalysis.id,
                                unit_id: toPrisma(input.unitId),
                                activity_name: activity.name || 'Unknown Activity',
                                reported: activity.reported ?? 0,
                                target: activity.target ?? 0,
                                achievement: activity.achievement ?? 0,
                                activity_type: activity.dataType || 'count',
                                initiative_id: activity.initiativeId,
                                evidenceSnippet: toPrisma(activity.evidenceSnippet),
                                confidenceScore: toPrisma(activity.confidence),
                                suggestedStatus: toPrisma(activity.suggestedStatus || activity.status),
                                dataType: toPrisma(activity.dataType),
                                prescriptiveNote: toPrisma(activity.prescriptiveAnalysis),
                                isApproved: false // Staged, not approved yet
                            }
                        });
                    }
                }
                console.log('[QPROAnalysisService] Created', validatedActivities.length, 'staged activities for review');
            } catch (stagingError) {
                console.error('Error creating staged activities:', stagingError);
            // Log but don't throw - staging errors shouldn't prevent QPRO analysis from being saved
            }
            // NOTE: We no longer directly upsert to KRAggregation table here
            // That happens in the approval endpoint after user review
            return qproAnalysis;
        } catch (error) {
            console.error('========== ERROR IN QPRO ANALYSIS ==========');
            console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
            console.error('Error message:', error instanceof Error ? error.message : String(error));
            if (error instanceof Error && error.stack) {
                console.error('Stack trace:', error.stack);
            }
            console.error('==========================================');
            throw error;
        }
    }
    async getQPROAnalysisById(id) {
        try {
            const analysis = await prisma.qPROAnalysis.findUnique({
                where: {
                    id
                },
                include: {
                    document: {
                        select: {
                            title: true,
                            fileName: true,
                            fileType: true,
                            fileUrl: true
                        }
                    },
                    user: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                }
            });
            return analysis;
        } catch (error) {
            console.error('Error fetching QPRO analysis:', error);
            throw error;
        }
    }
    async getQPROAnalysesByUser(userId) {
        try {
            const analyses = await prisma.qPROAnalysis.findMany({
                where: {
                    uploadedById: userId
                },
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    document: {
                        select: {
                            title: true,
                            fileName: true
                        }
                    }
                }
            });
            return analyses;
        } catch (error) {
            console.error('Error fetching QPRO analyses for user:', error);
            throw error;
        }
    }
    async getQPROAnalysesByDocument(documentId) {
        try {
            const analyses = await prisma.qPROAnalysis.findMany({
                where: {
                    documentId
                },
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    user: {
                        select: {
                            name: true
                        }
                    }
                }
            });
            return analyses;
        } catch (error) {
            console.error('Error fetching QPRO analyses for document:', error);
            throw error;
        }
    }
    async getQPROAnalyses(filter) {
        try {
            const whereClause = {};
            if (filter.unitId) {
                whereClause.unitId = filter.unitId;
            }
            if (filter.year !== undefined) {
                whereClause.year = filter.year;
            }
            if (filter.quarter !== undefined) {
                whereClause.quarter = filter.quarter;
            }
            if (filter.userId) {
                whereClause.uploadedById = filter.userId;
            }
            const analyses = await prisma.qPROAnalysis.findMany({
                where: whereClause,
                orderBy: {
                    createdAt: 'desc'
                },
                take: filter.limit,
                include: {
                    document: {
                        select: {
                            title: true,
                            fileName: true,
                            fileType: true
                        }
                    },
                    user: {
                        select: {
                            name: true,
                            email: true
                        }
                    },
                    unit: {
                        select: {
                            name: true,
                            code: true
                        }
                    }
                }
            });
            return analyses;
        } catch (error) {
            console.error('Error fetching QPRO analyses:', error);
            throw error;
        }
    }
    async getFileBuffer(blobPath) {
        try {
            // Get the blob from the QPRO-specific container
            const containerName = 'qpro-files';
            const containerClient = blobServiceClient.getContainerClient(containerName);
            const blobClient = containerClient.getBlobClient(blobPath);
            // Download the blob content
            const downloadResponse = await blobClient.download();
            // Read the stream into a buffer
            const buffer = await this.streamToBuffer(downloadResponse.readableStreamBody);
            return buffer;
        } catch (error) {
            console.error(`Error downloading blob from path ${blobPath}:`, error);
            throw error;
        }
    }
    async streamToBuffer(stream) {
        return new Promise((resolve, reject)=>{
            const chunks = [];
            stream.on('data', (chunk)=>{
                chunks.push(chunk);
            });
            stream.on('error', reject);
            stream.on('end', ()=>{
                resolve(Buffer.concat(chunks));
            });
        });
    }
    /**
   * Format structured analysis output into readable text for storage
   */ formatAnalysisForStorage(analysis) {
        const sections = [
            '# QPRO Analysis Report',
            '',
            `## Overall Achievement Score: ${(analysis.overallAchievement || 0).toFixed(2)}%`,
            '',
            '## Strategic Alignment',
            analysis.alignment || 'N/A',
            '',
            '## Opportunities',
            analysis.opportunities || 'N/A',
            '',
            '## Gaps Identified',
            analysis.gaps || 'N/A',
            '',
            '## Recommendations',
            analysis.recommendations || 'N/A',
            '',
            '## KRA Summary',
            ...(analysis.kras || []).map((kra)=>`
### ${kra.kraId}: ${kra.kraTitle}
**Achievement Rate:** ${(kra.achievementRate || 0).toFixed(2)}%
**Activities:** ${(kra.activities || []).length}
**Alignment:** ${kra.strategicAlignment || 'N/A'}
`),
            '',
            '## Detailed Activities',
            ...(analysis.activities || []).map((activity)=>`
- **${activity.name}**
  - KRA: ${activity.kraId || 'N/A'}
  - Target: ${activity.target || 0}, Reported: ${activity.reported || 0}
  - Achievement: ${(activity.achievement || 0).toFixed(2)}%
  - Confidence: ${((activity.confidence || 0) * 100).toFixed(0)}%
  - Unit: ${activity.unit || 'N/A'}
`)
        ];
        return sections.join('\n');
    }
    /**
   * Load strategic plan JSON for validation
   */ async loadStrategicPlan() {
        try {
            // Import strategic plan JSON (works in Node.js context)
            const strategicPlan = await __turbopack_context__.A("[project]/lib/data/strategic_plan.json (json, async loader)").then((m)=>m.default).catch(()=>null);
            return strategicPlan;
        } catch (error) {
            console.error('Error loading strategic plan:', error);
            return null;
        }
    }
}
const qproAnalysisService = new QPROAnalysisService();
}),
"[project]/app/api/qpro-analyses/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$middleware$2f$auth$2d$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/middleware/auth-middleware.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$qpro$2d$analysis$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/services/qpro-analysis-service.ts [app-route] (ecmascript)");
;
;
async function GET(request) {
    try {
        // Check authentication
        const authResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$middleware$2f$auth$2d$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireAuth"])(request);
        if ('status' in authResult) {
            return authResult; // Return the NextResponse error
        }
        const user = authResult.user;
        // Get query parameters
        const { searchParams } = new URL(request.url);
        const documentId = searchParams.get('documentId');
        const analysisId = searchParams.get('id');
        const unitId = searchParams.get('unitId');
        const year = searchParams.get('year') ? parseInt(searchParams.get('year')) : undefined;
        const quarter = searchParams.get('quarter') ? parseInt(searchParams.get('quarter')) : undefined;
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')) : undefined;
        if (analysisId) {
            // Get specific analysis by ID
            const analysis = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$qpro$2d$analysis$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["qproAnalysisService"].getQPROAnalysisById(analysisId);
            if (!analysis) {
                return Response.json({
                    error: 'Analysis not found'
                }, {
                    status: 404
                });
            }
            // Check if user has permission to access this analysis
            if (analysis.uploadedById !== user.id && user.role !== 'ADMIN') {
                return Response.json({
                    error: 'Unauthorized to access this analysis'
                }, {
                    status: 403
                });
            }
            return Response.json({
                analysis
            });
        } else if (documentId) {
            // Get all analyses for a specific document
            const analyses = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$qpro$2d$analysis$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["qproAnalysisService"].getQPROAnalysesByDocument(documentId);
            // Check if user has permission to access analyses for this document
            const hasPermission = analyses.some((analysis)=>analysis.uploadedById === user.id);
            if (!hasPermission && user.role !== 'ADMIN') {
                return Response.json({
                    error: 'Unauthorized to access analyses for this document'
                }, {
                    status: 403
                });
            }
            return Response.json({
                analyses
            });
        } else if (unitId || year || quarter) {
            // Get analyses filtered by unit, year, and/or quarter
            const analyses = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$qpro$2d$analysis$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["qproAnalysisService"].getQPROAnalyses({
                unitId: unitId || undefined,
                year,
                quarter,
                limit,
                userId: user.role === 'ADMIN' ? undefined : user.id
            });
            return Response.json({
                analyses,
                total: analyses.length
            });
        } else {
            // Get all analyses for the current user
            const analyses = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$qpro$2d$analysis$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["qproAnalysisService"].getQPROAnalysesByUser(user.id);
            return Response.json({
                analyses
            });
        }
    } catch (error) {
        console.error('Error fetching QPRO analyses:', error);
        return Response.json({
            error: 'Failed to fetch QPRO analyses'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__eb53516a._.js.map