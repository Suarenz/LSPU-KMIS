(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/theme-provider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ThemeProvider",
    ()=>ThemeProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-themes/dist/index.mjs [app-client] (ecmascript)");
'use client';
;
;
function ThemeProvider({ children, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ThemeProvider"], {
        ...props,
        children: children
    }, void 0, false, {
        fileName: "[project]/components/theme-provider.tsx",
        lineNumber: 10,
        columnNumber: 10
    }, this);
}
_c = ThemeProvider;
var _c;
__turbopack_context__.k.register(_c, "ThemeProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/services/jwt-service.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// This service is for handling custom JWT tokens for database authentication
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
class JWTService {
    secret;
    constructor(){
        this.secret = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.JWT_SECRET || '6dFk5d0vbyLnZC0Amy83LtI47DsNr/KB4M+FgbUc6njd4cjk7XB2/8nTuhQDWW8OOgQ6fI74huxJE3a/RP2giw==';
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/services/auth-service.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$jwt$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/services/jwt-service.ts [app-client] (ecmascript)");
;
// Cache configuration
const SESSION_CACHE_KEY = 'lspu_kmis_session_cache';
const LAST_CHECK_KEY = 'lspu_kmis_last_auth_check';
const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
class DatabaseAuthService {
    sessionValidationDebounce = null;
    constructor(){
    // No external client initialization needed
    }
    /**
   * Get cached session data if it exists and hasn't expired
   */ getCachedSession() {
        if ("TURBOPACK compile-time truthy", 1) {
            const cached = localStorage.getItem(SESSION_CACHE_KEY);
            if (cached) {
                try {
                    const { data, expiration } = JSON.parse(cached);
                    // Only use cache if not expired
                    if (Date.now() < expiration) {
                        return data;
                    } else {
                        // Clear expired cache
                        localStorage.removeItem(SESSION_CACHE_KEY);
                    }
                } catch (error) {
                    console.error('Error parsing cached session:', error);
                    localStorage.removeItem(SESSION_CACHE_KEY);
                }
            }
        }
        return null;
    }
    /**
   * Set cached session data with expiration
   */ setCachedSession(sessionData, ttl = DEFAULT_CACHE_TTL) {
        if ("TURBOPACK compile-time truthy", 1) {
            const expiration = Date.now() + ttl;
            try {
                localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify({
                    data: sessionData,
                    expiration
                }));
            } catch (error) {
                console.error('Error caching session:', error);
            }
        }
    }
    /**
   * Clear cached session
   */ clearCachedSession() {
        if ("TURBOPACK compile-time truthy", 1) {
            localStorage.removeItem(SESSION_CACHE_KEY);
            localStorage.removeItem(LAST_CHECK_KEY);
        }
    }
    /**
   * Get the last auth check timestamp
   */ getLastAuthCheck() {
        if ("TURBOPACK compile-time truthy", 1) {
            const lastCheck = localStorage.getItem(LAST_CHECK_KEY);
            return lastCheck ? parseInt(lastCheck) : null;
        }
        //TURBOPACK unreachable
        ;
    }
    /**
   * Set the last auth check timestamp
   */ setLastAuthCheck(timestamp) {
        if ("TURBOPACK compile-time truthy", 1) {
            localStorage.setItem(LAST_CHECK_KEY, timestamp.toString());
        }
    }
    /**
   * Validate session without triggering loading state
   */ async validateSessionWithoutLoading() {
        if (this.sessionValidationDebounce) {
            clearTimeout(this.sessionValidationDebounce);
        }
        return new Promise((resolve)=>{
            this.sessionValidationDebounce = setTimeout(async ()=>{
                try {
                    const token = this.getAccessTokenFromStorage();
                    if (!token) {
                        resolve(false);
                        return;
                    }
                    // Check if we're in the browser environment
                    if ("TURBOPACK compile-time truthy", 1) {
                        // In browser, check if token is expired without full verification
                        const isExpired = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$jwt$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isTokenExpired(token);
                        if (isExpired) {
                            // Try to refresh the token
                            const refreshed = await this.refreshToken();
                            resolve(refreshed);
                        } else {
                            resolve(true);
                        }
                    } else //TURBOPACK unreachable
                    ;
                } catch (error) {
                    console.error('Session validation error:', error);
                    resolve(false);
                }
            }, 500); // Only validate after 500ms of inactivity
        });
    }
    getAccessTokenFromStorage() {
        if ("TURBOPACK compile-time truthy", 1) {
            return localStorage.getItem('access_token');
        }
        //TURBOPACK unreachable
        ;
    }
    setAccessTokenInStorage(token) {
        if ("TURBOPACK compile-time truthy", 1) {
            localStorage.setItem('access_token', token);
        }
    }
    removeAccessTokenFromStorage() {
        if ("TURBOPACK compile-time truthy", 1) {
            localStorage.removeItem('access_token');
        }
    }
    async login(email, password) {
        try {
            // Call the API route to perform login
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });
            if (!response.ok) {
                const errorData = await response.json().catch(()=>({}));
                return {
                    success: false,
                    error: errorData.error || 'Login failed'
                };
            }
            const data = await response.json();
            if (data.success && data.token && data.user) {
                // Store the access token in localStorage
                this.setAccessTokenInStorage(data.token);
                // Generate a mock refresh token and store it
                const refreshToken = this.generateMockRefreshToken();
                localStorage.setItem('refresh_token', refreshToken);
                // Store refresh token in mock store
                this.refreshTokensStore.set(refreshToken, {
                    userId: data.user.id,
                    email: data.user.email,
                    role: data.user.role
                });
                // Return user data
                const userData = {
                    id: data.user.id,
                    email: data.user.email,
                    name: data.user.name,
                    role: data.user.role,
                    unitId: data.user.unitId || undefined
                };
                return {
                    success: true,
                    user: userData
                };
            } else {
                return {
                    success: false,
                    error: data.error || 'Login failed'
                };
            }
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: 'An unexpected error occurred during login'
            };
        }
    }
    async signup(email, password, name, role = 'STUDENT', department) {
        try {
            // Call the API route to perform signup
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password,
                    name,
                    role,
                    department
                })
            });
            if (!response.ok) {
                const errorData = await response.json().catch(()=>({}));
                return {
                    success: false,
                    error: errorData.error || 'Signup failed'
                };
            }
            const data = await response.json();
            if (data.success && data.token && data.user) {
                // Store the access token in localStorage
                this.setAccessTokenInStorage(data.token);
                // Generate a mock refresh token and store it
                const refreshToken = this.generateMockRefreshToken();
                localStorage.setItem('refresh_token', refreshToken);
                // Store refresh token in mock store
                this.refreshTokensStore.set(refreshToken, {
                    userId: data.user.id,
                    email: data.user.email,
                    role: data.user.role
                });
                // Return user data
                const userData = {
                    id: data.user.id,
                    email: data.user.email,
                    name: data.user.name,
                    role: data.user.role,
                    unitId: data.user.unitId || undefined
                };
                return {
                    success: true,
                    user: userData
                };
            } else {
                return {
                    success: false,
                    error: data.error || 'Signup failed'
                };
            }
        } catch (error) {
            console.error('Signup error:', error);
            return {
                success: false,
                error: 'An unexpected error occurred during signup'
            };
        }
    }
    async logout() {
        try {
            // Call the API route to perform logout (optional - mainly for server-side cleanup)
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAccessTokenFromStorage()}`
                }
            });
            // Remove the tokens from localStorage
            const refreshToken = localStorage.getItem('refresh_token');
            this.removeAccessTokenFromStorage();
            localStorage.removeItem('refresh_token');
            // Remove refresh token from mock store if it exists
            if (refreshToken) {
                this.refreshTokensStore.delete(refreshToken);
            }
        } catch (error) {
            console.error('Logout error:', error);
            // Still remove the tokens from localStorage even if API call fails
            const refreshToken = localStorage.getItem('refresh_token');
            this.removeAccessTokenFromStorage();
            localStorage.removeItem('refresh_token');
            // Remove refresh token from mock store if it exists
            if (refreshToken) {
                this.refreshTokensStore.delete(refreshToken);
            }
        }
    }
    async getCurrentUser() {
        try {
            const token = this.getAccessTokenFromStorage();
            if (!token) {
                return null;
            }
            // Check if we're in the browser environment
            if ("TURBOPACK compile-time truthy", 1) {
                // In browser, check if token is expired without full verification
                const isExpired = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$jwt$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isTokenExpired(token);
                if (isExpired) {
                    // Try to refresh the token
                    const refreshed = await this.refreshToken();
                    if (refreshed) {
                        // Get the new token after refresh
                        const refreshedToken = this.getAccessTokenFromStorage();
                        if (refreshedToken) {
                            // Fetch user data from the API route with the refreshed token
                            const response = await fetch('/api/auth/me', {
                                headers: {
                                    'Authorization': `Bearer ${refreshedToken}`,
                                    'Content-Type': 'application/json'
                                }
                            });
                            if (!response.ok) {
                                return null;
                            }
                            const data = await response.json();
                            if (data.user) {
                                return {
                                    id: data.user.id,
                                    email: data.user.email,
                                    name: data.user.name,
                                    role: data.user.role,
                                    unitId: data.user.unitId || undefined
                                };
                            } else {
                                return null;
                            }
                        } else {
                            return null; // If no new token after refresh, return null
                        }
                    } else {
                        return null; // If refresh failed, return null
                    }
                }
            } else //TURBOPACK unreachable
            ;
            // Fetch user data from the API route
            const response = await fetch('/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                // If the response is 401 (unauthorized), try to refresh the token
                if (response.status === 401) {
                    const refreshed = await this.refreshToken();
                    if (refreshed) {
                        // If token was refreshed, try the request again
                        const newToken = this.getAccessTokenFromStorage();
                        if (newToken) {
                            const retryResponse = await fetch('/api/auth/me', {
                                headers: {
                                    'Authorization': `Bearer ${newToken}`,
                                    'Content-Type': 'application/json'
                                }
                            });
                            if (!retryResponse.ok) {
                                return null;
                            }
                            const retryData = await retryResponse.json();
                            if (retryData.user) {
                                return {
                                    id: retryData.user.id,
                                    email: retryData.user.email,
                                    name: retryData.user.name,
                                    role: retryData.user.role,
                                    unitId: retryData.user.unitId || undefined
                                };
                            }
                        }
                    }
                }
                return null;
            }
            const data = await response.json();
            if (data.user) {
                return {
                    id: data.user.id,
                    email: data.user.email,
                    name: data.user.name,
                    role: data.user.role,
                    unitId: data.user.unitId || undefined
                };
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error in getCurrentUser:', error);
            return null;
        }
    }
    async getSession() {
        const token = this.getAccessTokenFromStorage();
        if (!token) {
            return null;
        }
        // Check if we're in the browser environment
        if ("TURBOPACK compile-time truthy", 1) {
            // In browser, decode token without verification
            const decoded = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$jwt$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].decodeToken(token);
            if (!decoded) {
                // If we can't decode the token, try to refresh it
                const refreshed = await this.refreshToken();
                if (refreshed) {
                    const newToken = this.getAccessTokenFromStorage();
                    if (newToken) {
                        const newDecoded = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$jwt$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].decodeToken(newToken);
                        return newDecoded ? {
                            access_token: newToken,
                            expires_at: newDecoded.exp
                        } : null;
                    }
                }
                return null;
            }
            return decoded ? {
                access_token: token,
                expires_at: decoded.exp
            } : null;
        } else //TURBOPACK unreachable
        ;
    }
    async getUser() {
        return await this.getCurrentUser();
    }
    // Mock refresh token store - in a real implementation this would be a database
    refreshTokensStore = new Map();
    generateMockRefreshToken() {
        // Generate a mock refresh token
        return `mock_refresh_token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }
    async refreshToken() {
        try {
            // Get the refresh token from storage
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
                return false;
            }
            // Call the refresh endpoint
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    refreshToken
                })
            });
            if (!response.ok) {
                // If refresh fails, clear all tokens
                this.removeAccessTokenFromStorage();
                localStorage.removeItem('refresh_token');
                // Remove refresh token from mock store if it exists
                this.refreshTokensStore.delete(refreshToken);
                return false;
            }
            const data = await response.json();
            if (data.token) {
                // Store the new access token
                this.setAccessTokenInStorage(data.token);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error refreshing token:', error);
            return false;
        }
    }
    async updatePassword(newPassword) {
        try {
            const token = await this.getAccessToken();
            if (!token) {
                return {
                    error: 'User not authenticated'
                };
            }
            const response = await fetch('/api/auth/update-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    newPassword
                })
            });
            if (!response.ok) {
                // If the response is 401 (unauthorized), try to refresh the token
                if (response.status === 401) {
                    const refreshed = await this.refreshToken();
                    if (refreshed) {
                        // Get the new token after refresh
                        const newToken = await this.getAccessToken();
                        if (newToken) {
                            // Try the request again with the new token
                            const retryResponse = await fetch('/api/auth/update-password', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${newToken}`
                                },
                                body: JSON.stringify({
                                    newPassword
                                })
                            });
                            if (!retryResponse.ok) {
                                const errorData = await retryResponse.json().catch(()=>({}));
                                return {
                                    error: errorData.error || 'Failed to update password'
                                };
                            }
                            return {
                                error: null
                            };
                        }
                    }
                }
                const errorData = await response.json().catch(()=>({}));
                return {
                    error: errorData.error || 'Failed to update password'
                };
            }
            return {
                error: null
            };
        } catch (error) {
            console.error('Error updating password:', error);
            return {
                error: 'Failed to update password'
            };
        }
    }
    async resetPassword(email) {
        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email
                })
            });
            if (!response.ok) {
                const errorData = await response.json().catch(()=>({}));
                return {
                    error: errorData.error || 'Failed to reset password'
                };
            }
            return {
                error: null
            };
        } catch (error) {
            console.error('Error resetting password:', error);
            return {
                error: 'Failed to reset password'
            };
        }
    }
    async isAuthenticated() {
        try {
            const token = this.getAccessTokenFromStorage();
            if (!token) {
                return false;
            }
            // Check if we're in the browser environment
            if ("TURBOPACK compile-time truthy", 1) {
                // In browser, check if token is expired without full verification
                const isExpired = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$jwt$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isTokenExpired(token);
                if (isExpired) {
                    // Try to refresh the token
                    const refreshed = await this.refreshToken();
                    return refreshed;
                }
                return true;
            } else //TURBOPACK unreachable
            ;
        } catch (error) {
            console.error('Error in isAuthenticated:', error);
            return false;
        }
    }
    async getAccessToken() {
        try {
            const token = this.getAccessTokenFromStorage();
            if (!token) {
                return null;
            }
            // Check if we're in the browser environment
            if ("TURBOPACK compile-time truthy", 1) {
                // In browser, check if token is expired without full verification
                const isExpired = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$jwt$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isTokenExpired(token);
                if (isExpired) {
                    // Try to refresh the token
                    const refreshed = await this.refreshToken();
                    if (refreshed) {
                        // Get the new token after refresh
                        const newToken = this.getAccessTokenFromStorage();
                        return newToken;
                    } else {
                        return null; // If refresh failed, return null
                    }
                }
                return token;
            } else //TURBOPACK unreachable
            ;
        } catch (error) {
            console.error('Error getting access token:', error);
            return null;
        }
    }
    /**
   * Fetch comprehensive user data in a single call to optimize performance
   * This method uses the new /api/auth/me endpoint to get all user information at once
   */ async getComprehensiveUserData() {
        try {
            // Check if we have cached session data and it's still valid
            const cachedSession = this.getCachedSession();
            if (cachedSession) {
                return cachedSession;
            }
            const token = await this.getAccessToken();
            if (!token) {
                // If no token is available, check if user is authenticated before throwing error
                const isAuthenticated = await this.isAuthenticated();
                if (!isAuthenticated) {
                    // User is not authenticated, return null to indicate this
                    return {
                        authenticated: false,
                        user: null
                    };
                } else {
                    // User is authenticated but we can't get a token, return not authenticated
                    return {
                        authenticated: false,
                        user: null
                    };
                }
            }
            const response = await fetch('/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                // If the error is authentication-related, try to refresh the token
                if (response.status === 401 || response.status === 404) {
                    // Try to refresh the token
                    const refreshed = await this.refreshToken();
                    if (refreshed) {
                        // Get the new token after refresh
                        const refreshedToken = await this.getAccessToken();
                        if (refreshedToken) {
                            // Try the request again with the refreshed token
                            const retryResponse = await fetch('/api/auth/me', {
                                headers: {
                                    'Authorization': `Bearer ${refreshedToken}`,
                                    'Content-Type': 'application/json'
                                }
                            });
                            if (!retryResponse.ok) {
                                // Clear cache on authentication failure
                                this.clearCachedSession();
                                return {
                                    authenticated: false,
                                    user: null
                                };
                            }
                            const retryData = await retryResponse.json();
                            // Cache the comprehensive user data
                            this.setCachedSession(retryData);
                            return retryData;
                        }
                    }
                    // Clear cache on authentication failure
                    this.clearCachedSession();
                    return {
                        authenticated: false,
                        user: null
                    };
                }
                const errorData = await response.json().catch(()=>({}));
                throw new Error(errorData.error || `Failed to fetch user data: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            // Cache the comprehensive user data
            this.setCachedSession(data);
            return data;
        } catch (error) {
            console.error('Error fetching comprehensive user data:', error);
            // Check if this is an authentication error
            if (error instanceof Error && error.message.includes('No authentication token available')) {
                // Clear cache on authentication failure
                this.clearCachedSession();
                return {
                    authenticated: false,
                    user: null
                };
            }
            // For any other error, return not authenticated to prevent the error from propagating
            this.clearCachedSession();
            return {
                authenticated: false,
                user: null
            };
        }
    }
    /**
   * Clear cached session data
   */ clearCache() {
        this.clearCachedSession();
    }
}
const __TURBOPACK__default__export__ = new DatabaseAuthService();
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/auth-context.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$auth$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/services/auth-service.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
// Create a default context value to prevent hydration errors
const defaultContextValue = {
    user: null,
    login: async ()=>({
            success: false,
            error: 'Auth service not initialized'
        }),
    logout: async ()=>{},
    isAuthenticated: false,
    isLoading: true,
    error: null
};
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function AuthProvider({ children }) {
    _s();
    // Initialize with default values that match between server and client
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isAuthenticated, setIsAuthenticated] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true) // Start as true initially
    ;
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Initialize AuthService after component mounts to ensure window is available
    const [authService] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$auth$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            let isMounted = true; // Track if component is still mounted
            // Immediately check session on mount to get initial state quickly
            const checkInitialSession = {
                "AuthProvider.useEffect.checkInitialSession": async ()=>{
                    try {
                        // Use the new comprehensive endpoint if available, otherwise fall back to existing method
                        try {
                            const comprehensiveData = await authService.getComprehensiveUserData();
                            if (comprehensiveData && comprehensiveData.authenticated) {
                                // Set basic auth state immediately to prevent loading
                                if (isMounted) {
                                    setIsAuthenticated(true);
                                    setUser(comprehensiveData.user);
                                    setIsLoading(false);
                                }
                            } else {
                                if (isMounted) {
                                    setUser(null);
                                    setIsAuthenticated(false);
                                    setIsLoading(false);
                                }
                            }
                        } catch (comprehensiveError) {
                            console.warn('Comprehensive user data fetch failed, falling back to standard method:', comprehensiveError);
                            // Fallback to the original method
                            try {
                                // Use the database authentication method
                                const currentUser = await authService.getCurrentUser();
                                if (currentUser) {
                                    // Set basic auth state immediately to prevent loading
                                    if (isMounted) {
                                        setIsAuthenticated(true);
                                        setIsLoading(true); // Set loading to true while we fetch user details
                                    }
                                    // Fetch user profile in background
                                    if (isMounted) {
                                        setUser(currentUser);
                                        setIsLoading(false);
                                    }
                                } else {
                                    if (isMounted) {
                                        setUser(null);
                                        setIsAuthenticated(false);
                                        setIsLoading(false);
                                    }
                                }
                            } catch (sessionError) {
                                console.error('Session check error during initial load:', sessionError);
                                if (isMounted) {
                                    setUser(null);
                                    setIsAuthenticated(false);
                                    setIsLoading(false);
                                }
                            }
                        }
                    } catch (err) {
                        console.error('Initial session check error:', err);
                        if (isMounted) {
                            setUser(null);
                            setIsAuthenticated(false);
                            setIsLoading(false);
                        }
                    }
                }
            }["AuthProvider.useEffect.checkInitialSession"];
            // Add page visibility change handler to prevent loading state on tab focus
            const handleVisibilityChange = {
                "AuthProvider.useEffect.handleVisibilityChange": async ()=>{
                    if (document.visibilityState === 'visible') {
                        // Only validate if it's been more than 10 minutes since last check
                        const lastChecked = authService.getLastAuthCheck();
                        const now = Date.now();
                        // Only re-validate if more than 10 minutes have passed
                        if (!lastChecked || now - lastChecked > 10 * 60 * 1000) {
                            // Perform lightweight session validation without showing loading
                            const isValid = await authService.validateSessionWithoutLoading();
                            if (!isValid) {
                                // Session is no longer valid, clear user state
                                if (isMounted) {
                                    setUser(null);
                                    setIsAuthenticated(false);
                                }
                            }
                            // Update last check timestamp
                            authService.setLastAuthCheck(now);
                        }
                    }
                }
            }["AuthProvider.useEffect.handleVisibilityChange"];
            // Run initial session check
            if ("TURBOPACK compile-time truthy", 1) {
                // Add a small delay to ensure React hydration is complete
                const timer = setTimeout({
                    "AuthProvider.useEffect.timer": ()=>{
                        if (isMounted) {
                            checkInitialSession();
                        }
                    }
                }["AuthProvider.useEffect.timer"], 0);
                // Add visibility change listener
                document.addEventListener('visibilitychange', handleVisibilityChange);
                return ({
                    "AuthProvider.useEffect": ()=>{
                        clearTimeout(timer);
                        isMounted = false;
                        // Remove visibility change listener
                        if ("TURBOPACK compile-time truthy", 1) {
                            document.removeEventListener('visibilitychange', handleVisibilityChange);
                        }
                    }
                })["AuthProvider.useEffect"];
            } else //TURBOPACK unreachable
            ;
        }
    }["AuthProvider.useEffect"], []); // Empty dependency array since we only want to run this once on mount
    const login = async (email, password)=>{
        setIsLoading(true);
        setError(null);
        try {
            const result = await authService.login(email, password);
            if (result.success && result.user) {
                // Set user and authentication state immediately to allow faster redirects
                setUser(result.user);
                setIsAuthenticated(true);
                setIsLoading(false); // Set loading to false after successful login
                return result;
            } else {
                setError(result.error || 'Login failed');
                setIsLoading(false); // Explicitly set loading to false on error
                return result;
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('An error occurred during login');
            setIsLoading(false); // Explicitly set loading to false on error
            return {
                success: false,
                error: 'An error occurred during login'
            };
        }
    };
    const logout = async ()=>{
        setIsLoading(true);
        try {
            await authService.logout();
            // Clear user state immediately to allow faster UI updates
            setUser(null);
            setIsAuthenticated(false);
            setIsLoading(false);
        } catch (err) {
            console.error('Logout error:', err);
            // Still clear local state even if API call fails
            setUser(null);
            setIsAuthenticated(false);
            setIsLoading(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            login,
            logout,
            isAuthenticated,
            isLoading,
            error
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/lib/auth-context.tsx",
        lineNumber: 209,
        columnNumber: 5
    }, this);
}
_s(AuthProvider, "2GUTXxrSybP7KTesXnz9Pn9h8DA=");
_c = AuthProvider;
function useAuth() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (context === undefined) {
        // During server-side rendering, return the default context value
        // This prevents the error while maintaining type safety
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        else {
            throw new Error("useAuth must be used within an AuthProvider");
        }
    }
    return context;
}
_s1(useAuth, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/auth-provider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth-context.tsx [app-client] (ecmascript)");
"use client";
;
;
function AuthProvider({ children }) {
    // Render the AuthProvider directly - it handles server/client differences internally
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AuthProvider"], {
        children: children
    }, void 0, false, {
        fileName: "[project]/components/auth-provider.tsx",
        lineNumber: 8,
        columnNumber: 9
    }, this);
}
_c = AuthProvider;
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_f475bc03._.js.map