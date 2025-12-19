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
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

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
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/http2 [external] (http2, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http2", () => require("http2"));

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
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

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
"[project]/lib/services/enhanced-document-service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$colivara$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/services/colivara-service.ts [app-route] (ecmascript)");
;
;
const colivaraService = new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$colivara$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"]();
class EnhancedDocumentService {
    /**
   * Get all documents with optional filtering and pagination
   * Enhanced with unit, year, quarter filtering capabilities
   */ async getDocuments(page = 1, limit = 10, category, search, userId, sort, order = 'desc', unitId, year, quarter// NEW: Filter by reporting quarter
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
            whereClause.unitId = unitId; // Using the new field name that was renamed from departmentId
        }
        // Add year filter if provided
        if (year) {
            whereClause.year = year;
        }
        // Add quarter filter if provided
        if (quarter) {
            whereClause.quarter = quarter;
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
            // First, try to find the user by the provided userId (which might be the database ID)
            const user = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].user.findUnique({
                where: {
                    id: userId
                }
            });
            // In the new system, we only use the database ID
            // If not found by database ID, we just continue with the assumption that the user doesn't have access
            // The permission checks later will handle access control
            if (user && user.role !== 'ADMIN' && user.role !== 'FACULTY') {
                // For non-admin and non-faculty users, we need to check document permissions
                // This is a simplified approach - in a real system, you'd have more complex permission logic
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
                        }
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
                        tags: Array.isArray(doc.tags) ? doc.tags : [],
                        unitId: doc.unitId ?? undefined,
                        year: doc.year ?? undefined,
                        quarter: doc.quarter ?? undefined,
                        isQproDocument: doc.isQproDocument ?? false,
                        versionNotes: doc.versionNotes ?? undefined,
                        uploadedBy: doc.uploadedByUser?.name || doc.uploadedBy,
                        status: doc.status,
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
                        // Colivara fields
                        colivaraDocumentId: doc.colivaraDocumentId ?? undefined,
                        colivaraProcessingStatus: doc.colivaraProcessingStatus ?? undefined,
                        colivaraProcessedAt: doc.colivaraProcessedAt ? new Date(doc.colivaraProcessedAt) : undefined,
                        colivaraChecksum: doc.colivaraChecksum ?? undefined
                    })),
                total
            };
        } catch (error) {
            console.error('Database connection error in getDocuments:', error);
            throw error; // Re-throw to be handled by the calling function
        }
    }
    /**
   * Get a specific document by ID
   * Enhanced with unit access controls
   */ async getDocumentById(id, userId) {
        try {
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
                // First, try to find the user by the provided userId (which might be the database ID)
                const user = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].user.findUnique({
                    where: {
                        id: userId
                    }
                });
                // In the new system, we only use the database ID
                // If not found by database ID, we just continue with the assumption that the user doesn't have access
                // The permission checks later will handle access control
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
                id: document.id,
                title: document.title,
                description: document.description,
                category: document.category,
                tags: Array.isArray(document.tags) ? document.tags : [],
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
                year: document.year ?? undefined,
                quarter: document.quarter ?? undefined,
                isQproDocument: document.isQproDocument ?? false,
                unit: document.documentUnit ? {
                    id: document.documentUnit.id,
                    name: document.documentUnit.name,
                    code: document.documentUnit.code || "",
                    description: document.documentUnit.description || undefined,
                    createdAt: document.documentUnit.createdAt,
                    updatedAt: document.documentUnit.updatedAt
                } : undefined,
                // Colivara fields
                colivaraDocumentId: document.colivaraDocumentId ?? undefined,
                colivaraProcessingStatus: document.colivaraProcessingStatus ?? undefined,
                colivaraProcessedAt: document.colivaraProcessedAt ? new Date(document.colivaraProcessedAt) : undefined,
                colivaraChecksum: document.colivaraChecksum ?? undefined
            };
        } catch (error) {
            console.error('Database connection error in getDocumentById:', error);
            throw error; // Re-throw to be handled by the calling function
        }
    }
    /**
   * Create a new document
   * Enhanced with unit assignment and QPRO support (year, quarter)
   */ async createDocument(title, description, category, tags, uploadedBy, fileUrl, fileName, fileType, fileSize, userId, unitId, base64Content, blobName, options) {
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
            // First, check if userId is defined
            if (!userId) {
                console.error('No userId provided to createDocument function');
                throw new Error('User ID is required to upload documents');
            }
            console.log('Attempting to find user with ID:', userId);
            // First, try to find user by the provided userId (which might be the database ID)
            const user = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].user.findUnique({
                where: {
                    id: userId
                }
            });
            // In the new system, we only use the database ID
            // If not found by database ID, we return null
            if (!user) {
                console.error('User not found with provided ID:', userId);
                throw new Error('Only admins and faculty can upload documents');
            }
            console.log('User lookup result:', {
                user: !!user,
                role: user?.role,
                id: user?.id
            });
            if (!user || ![
                'ADMIN',
                'FACULTY'
            ].includes(user.role)) {
                console.error('User does not have required role to upload documents:', user?.role);
                throw new Error('Only admins and faculty can upload documents');
            }
            const document = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].document.create({
                data: {
                    title,
                    description: description || "",
                    category: category || "Uncategorized",
                    tags: tags || [],
                    uploadedBy: user.name,
                    uploadedById: user.id,
                    fileUrl,
                    blobName: blobName || undefined,
                    fileName,
                    fileType,
                    fileSize,
                    unitId: unitId || null,
                    year: options?.year || null,
                    quarter: options?.quarter || null,
                    isQproDocument: options?.isQproDocument || false,
                    status: 'ACTIVE',
                    colivaraProcessingStatus: 'PENDING'
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
            // Get the updated document to ensure we have the latest unitId value after creation
            const finalDocument = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].document.findUnique({
                where: {
                    id: document.id
                },
                include: {
                    uploadedByUser: true,
                    documentUnit: true
                }
            });
            if (!finalDocument) {
                throw new Error(`Document with id ${document.id} not found after creation`);
            }
            // Trigger Colivara processing asynchronously without blocking document creation
            try {
                colivaraService.processNewDocument(finalDocument, fileUrl, base64Content);
            } catch (processingError) {
                console.error(`Error triggering Colivara processing for document ${document.id}:`, processingError);
            // Don't throw error as we don't want to fail the document creation due to processing issues
            }
            return {
                id: finalDocument.id,
                title: finalDocument.title,
                description: finalDocument.description,
                category: finalDocument.category,
                tags: Array.isArray(finalDocument.tags) ? finalDocument.tags : [],
                uploadedBy: finalDocument.uploadedByUser?.name || finalDocument.uploadedBy,
                uploadedById: finalDocument.uploadedById,
                uploadedAt: new Date(finalDocument.uploadedAt),
                fileUrl: finalDocument.fileUrl,
                fileName: finalDocument.fileName,
                fileType: finalDocument.fileType,
                fileSize: finalDocument.fileSize,
                downloadsCount: finalDocument.downloadsCount || 0,
                viewsCount: finalDocument.viewsCount || 0,
                version: finalDocument.version || 1,
                versionNotes: finalDocument.versionNotes ?? undefined,
                status: finalDocument.status,
                createdAt: new Date(finalDocument.createdAt),
                updatedAt: new Date(finalDocument.updatedAt),
                unitId: finalDocument.unitId ?? undefined,
                year: finalDocument.year ?? undefined,
                quarter: finalDocument.quarter ?? undefined,
                isQproDocument: finalDocument.isQproDocument ?? false,
                unit: finalDocument.documentUnit ? {
                    id: finalDocument.documentUnit.id,
                    name: finalDocument.documentUnit.name,
                    code: finalDocument.documentUnit.code || "",
                    description: finalDocument.documentUnit.description || undefined,
                    createdAt: finalDocument.documentUnit.createdAt,
                    updatedAt: finalDocument.documentUnit.updatedAt
                } : undefined,
                // Colivara fields
                colivaraDocumentId: finalDocument.colivaraDocumentId ?? undefined,
                colivaraProcessingStatus: finalDocument.colivaraProcessingStatus ?? undefined,
                colivaraProcessedAt: finalDocument.colivaraProcessedAt ? new Date(finalDocument.colivaraProcessedAt) : undefined,
                colivaraChecksum: finalDocument.colivaraChecksum ?? undefined
            };
        } catch (error) {
            console.error('Database connection error in createDocument:', error);
            throw error; // Re-throw to be handled by the calling function
        }
    }
    /**
   * Update a document
   * Enhanced with unit assignment
   */ async updateDocument(id, title, description, category, tags, unitId, userId, fileUrl, base64Content// NEW: Base64 content for Colivara processing
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
                // First, try to find the user by the provided userId (which might be the database ID)
                user = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].user.findUnique({
                    where: {
                        id: userId
                    }
                });
                // In the new system, we only use the database ID
                // If not found by database ID, we just continue with the assumption that the user doesn't have access
                // The permission checks later will handle access control
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
                    ...description !== undefined && {
                        description: description || ""
                    },
                    ...category !== undefined && {
                        category: category || "Uncategorized"
                    },
                    ...tags !== undefined && {
                        tags: tags || []
                    },
                    ...unitId !== undefined && {
                        unitId: unitId
                    },
                    updatedAt: new Date()
                },
                include: {
                    uploadedByUser: true,
                    documentUnit: true
                }
            });
            // Get the updated document
            const finalDocument = updatedDocument;
            if (!finalDocument) {
                throw new Error(`Document with id ${id} not found after update`);
            }
            // Check if file URL has changed to determine if we need to reprocess with Colivara
            // In this implementation, we pass fileUrl as an optional parameter to determine if reprocessing is needed
            if (fileUrl) {
                try {
                    colivaraService.handleDocumentUpdate(id, finalDocument, fileUrl, base64Content);
                } catch (processingError) {
                    console.error(`Error triggering Colivara reprocessing for document ${id}:`, processingError);
                // Don't throw error as we don't want to fail the document update due to processing issues
                }
            }
            return {
                id: finalDocument.id,
                title: finalDocument.title,
                description: finalDocument.description,
                category: finalDocument.category,
                tags: Array.isArray(finalDocument.tags) ? finalDocument.tags : [],
                uploadedBy: finalDocument.uploadedByUser?.name || finalDocument.uploadedBy,
                uploadedById: finalDocument.uploadedById,
                uploadedAt: new Date(finalDocument.uploadedAt),
                fileUrl: finalDocument.fileUrl,
                fileName: finalDocument.fileName,
                fileType: finalDocument.fileType,
                fileSize: finalDocument.fileSize,
                downloadsCount: finalDocument.downloadsCount || 0,
                viewsCount: finalDocument.viewsCount || 0,
                version: finalDocument.version || 1,
                versionNotes: finalDocument.versionNotes ?? undefined,
                status: finalDocument.status,
                createdAt: new Date(finalDocument.createdAt),
                updatedAt: new Date(finalDocument.updatedAt),
                unitId: finalDocument.unitId ?? undefined,
                unit: finalDocument.documentUnit ? {
                    id: finalDocument.documentUnit.id,
                    name: finalDocument.documentUnit.name,
                    code: finalDocument.documentUnit.code || "",
                    description: finalDocument.documentUnit.description || undefined,
                    createdAt: finalDocument.documentUnit.createdAt,
                    updatedAt: finalDocument.documentUnit.updatedAt
                } : undefined,
                // Colivara fields
                colivaraDocumentId: finalDocument.colivaraDocumentId ?? undefined,
                colivaraProcessingStatus: finalDocument.colivaraProcessingStatus ?? undefined,
                colivaraProcessedAt: finalDocument.colivaraProcessedAt ? new Date(finalDocument.colivaraProcessedAt) : undefined,
                colivaraChecksum: finalDocument.colivaraChecksum ?? undefined
            };
        } catch (error) {
            console.error('Database connection error in updateDocument:', error);
            throw error; // Re-throw to be handled by the calling function
        }
    }
    /**
   * Get documents by unit
   */ async getDocumentsByUnit(unitId, page = 1, limit = 10, userId) {
        return this.getDocuments(page, limit, undefined, undefined, userId, undefined, 'desc', unitId);
    }
    /**
   * Get documents by unit that were uploaded by admin users only
   */ async getAdminDocumentsByUnit(unitId, page = 1, limit = 10, userId) {
        const skip = (page - 1) * limit;
        // Build where clause based on permissions and filters
        const whereClause = {
            status: 'ACTIVE',
            unitId: unitId
        };
        // If user is not admin, only show documents they have access to
        if (userId) {
            // First, try to find the user by the provided userId (which might be the database ID)
            const user = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].user.findUnique({
                where: {
                    id: userId
                }
            });
            // In the new system, we only use the database ID
            // If not found by database ID, we just continue with the assumption that the user doesn't have access
            // The permission checks later will handle access control
            if (user && user.role === 'ADMIN') {
            // Admins can see all documents in the unit regardless of who uploaded them
            // No additional filtering needed for admins
            } else if (user && user.role !== 'FACULTY') {
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
                        }
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
                    orderBy: {
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
                        tags: Array.isArray(doc.tags) ? doc.tags : [],
                        unitId: doc.unitId ?? undefined,
                        versionNotes: doc.versionNotes ?? undefined,
                        uploadedBy: doc.uploadedByUser?.name || doc.uploadedBy,
                        status: doc.status,
                        unit: doc.documentUnit ? {
                            id: doc.documentUnit.id,
                            name: doc.documentUnit.name,
                            code: doc.documentUnit.code || "",
                            description: doc.documentUnit.description || undefined,
                            createdAt: doc.documentUnit.createdAt,
                            updatedAt: doc.documentUnit.updatedAt
                        } : undefined,
                        uploadedAt: new Date(doc.uploadedAt),
                        createdAt: new Date(doc.createdAt),
                        updatedAt: new Date(doc.updatedAt),
                        // Colivara fields
                        colivaraDocumentId: doc.colivaraDocumentId ?? undefined,
                        colivaraProcessingStatus: doc.colivaraProcessingStatus ?? undefined,
                        colivaraProcessedAt: doc.colivaraProcessedAt ? new Date(doc.colivaraProcessedAt) : undefined,
                        colivaraChecksum: doc.colivaraChecksum ?? undefined
                    })),
                total
            };
        } catch (error) {
            console.error('Database connection error in getAdminDocumentsByUnit:', error);
            throw error; // Re-throw to be handled by the calling function
        }
    }
    /**
   * Get user's unit permissions
   */ async getUserUnitPermissions(userId, unitId) {
        // This method is actually part of the unit permission service, not document service
        // Placeholder implementation - this should be moved to the unit permission service
        return null;
    }
    /**
   * Search documents with unit filters
   */ async searchDocuments(query, unitId, category, tags, userId, page = 1, limit = 10) {
        return this.getDocuments(page, limit, category, query, userId, undefined, 'desc', unitId);
    }
}
const __TURBOPACK__default__export__ = new EnhancedDocumentService();
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
"[externals]/punycode [external] (punycode, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("punycode", () => require("punycode"));

module.exports = mod;
}),
"[externals]/node:fs [external] (node:fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs", () => require("node:fs"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/node:stream/web [external] (node:stream/web, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:stream/web", () => require("node:stream/web"));

module.exports = mod;
}),
"[project]/lib/services/config-service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
class ConfigService {
    static instance;
    config;
    requestCounts = new Map();
    constructor(){
        this.config = {
            rateLimit: {
                maxRequests: parseInt(process.env.AI_MAX_REQUESTS_PER_HOUR || '60', 10),
                windowMs: 60 * 60 * 1000
            },
            apiKeyRotationInterval: parseInt(process.env.API_KEY_ROTATION_INTERVAL_HOURS || '24', 10),
            requestTimeout: parseInt(process.env.AI_REQUEST_TIMEOUT || '30000', 10)
        };
    }
    static getInstance() {
        if (!ConfigService.instance) {
            ConfigService.instance = new ConfigService();
        }
        return ConfigService.instance;
    }
    /**
   * Check if a request from a given user/identifier is allowed based on rate limiting
   */ isRequestAllowed(identifier) {
        const now = Date.now();
        const windowStart = now - this.config.rateLimit.windowMs;
        const record = this.requestCounts.get(identifier);
        if (!record) {
            // First request from this identifier
            this.requestCounts.set(identifier, {
                count: 1,
                resetTime: now + this.config.rateLimit.windowMs
            });
            return true;
        }
        // Clean up old records
        if (record.resetTime < now) {
            this.requestCounts.set(identifier, {
                count: 1,
                resetTime: now + this.config.rateLimit.windowMs
            });
            return true;
        }
        // Check if limit is exceeded
        if (record.count >= this.config.rateLimit.maxRequests) {
            return false;
        }
        // Increment count
        this.requestCounts.set(identifier, {
            count: record.count + 1,
            resetTime: record.resetTime
        });
        return true;
    }
    /**
   * Get remaining requests for a given identifier
   */ getRemainingRequests(identifier) {
        const now = Date.now();
        const record = this.requestCounts.get(identifier);
        if (!record || record.resetTime < now) {
            return this.config.rateLimit.maxRequests;
        }
        return Math.max(0, this.config.rateLimit.maxRequests - record.count);
    }
    /**
   * Get rate limit reset time for a given identifier
   */ getResetTime(identifier) {
        const record = this.requestCounts.get(identifier);
        return record ? record.resetTime : Date.now() + this.config.rateLimit.windowMs;
    }
    /**
   * Get the current security configuration
   */ getSecurityConfig() {
        return {
            ...this.config
        };
    }
    /**
   * Validate API key format
   */ validateApiKey(apiKey) {
        // Basic validation - check if API key has content
        return apiKey.trim().length > 0;
    }
    /**
   * Health check for the AI API
   */ async healthCheck() {
        try {
            const apiKey = process.env.AI_API_KEY;
            if (!apiKey) {
                console.error('AI_API_KEY is not set');
                return false;
            }
            // For now, we'll just check if the API key exists and has some content
            // A more comprehensive health check would require knowing which service is using this config
            if (!apiKey.trim()) {
                console.error('AI_API_KEY is empty');
                return false;
            }
            // This is a basic health check that just confirms the API key exists
            // More specific health checks should be implemented in the respective services
            return true;
        } catch (error) {
            console.error('AI API health check failed:', error);
            return false;
        }
    }
}
const __TURBOPACK__default__export__ = ConfigService;
}),
"[project]/lib/services/monitoring-service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
class MonitoringService {
    static instance;
    config;
    metrics = [];
    maxMetricsStored = 1000;
    constructor(){
        this.config = {
            logPerformance: process.env.LOG_PERFORMANCE === 'true' || true,
            logErrors: process.env.LOG_ERRORS === 'true' || true,
            logUsage: process.env.LOG_USAGE === 'true' || true,
            performanceThreshold: parseInt(process.env.PERFORMANCE_THRESHOLD_MS || '5000', 10)
        };
    }
    static getInstance() {
        if (!MonitoringService.instance) {
            MonitoringService.instance = new MonitoringService();
        }
        return MonitoringService.instance;
    }
    /**
   * Log a performance metric
   */ logMetric(metric) {
        if (!this.config.logPerformance && !this.config.logUsage) {
            return; // Skip logging if not enabled
        }
        const fullMetric = {
            ...metric,
            timestamp: new Date()
        };
        // Add to metrics array
        this.metrics.push(fullMetric);
        // Keep only the most recent metrics
        if (this.metrics.length > this.maxMetricsStored) {
            this.metrics = this.metrics.slice(-this.maxMetricsStored);
        }
        // Log to console based on configuration
        if (metric.success) {
            if (this.config.logPerformance) {
                console.log(`[PERFORMANCE] ${metric.endpoint} took ${metric.responseTime}ms for user ${metric.userId || 'unknown'}`);
            }
        } else {
            if (this.config.logErrors) {
                console.error(`[ERROR] ${metric.endpoint} failed for user ${metric.userId || 'unknown'}: ${metric.error}`);
            }
        }
        // Alert if response time exceeds threshold
        if (metric.responseTime > this.config.performanceThreshold) {
            console.warn(`[PERFORMANCE ALERT] ${metric.endpoint} exceeded threshold: ${metric.responseTime}ms > ${this.config.performanceThreshold}ms`);
        }
    }
    /**
   * Track API usage
   */ trackUsage(userId, endpoint, model) {
        if (!this.config.logUsage) {
            return;
        }
        console.log(`[USAGE] User ${userId} accessed ${endpoint}${model ? ` using model ${model}` : ''} at ${new Date().toISOString()}`);
    }
    /**
   * Track generation performance
   */ trackGeneration(userId, query, responseTime, success, error, model) {
        this.logMetric({
            endpoint: 'ai-generation',
            responseTime,
            userId,
            query,
            success,
            error,
            model
        });
    }
    /**
   * Track search performance
   */ trackSearch(userId, query, responseTime, success, error) {
        this.logMetric({
            endpoint: 'search',
            responseTime,
            userId,
            query,
            success,
            error
        });
    }
    /**
   * Get performance summary for an endpoint
   */ getPerformanceSummary(endpoint) {
        const endpointMetrics = this.metrics.filter((m)=>m.endpoint === endpoint);
        if (endpointMetrics.length === 0) {
            return {
                avgResponseTime: 0,
                minResponseTime: 0,
                maxResponseTime: 0,
                totalRequests: 0,
                successfulRequests: 0,
                failedRequests: 0,
                errorRate: 0
            };
        }
        const responseTimes = endpointMetrics.map((m)=>m.responseTime);
        const successful = endpointMetrics.filter((m)=>m.success).length;
        const failed = endpointMetrics.filter((m)=>!m.success).length;
        const avgResponseTime = responseTimes.reduce((a, b)=>a + b, 0) / responseTimes.length;
        const minResponseTime = Math.min(...responseTimes);
        const maxResponseTime = Math.max(...responseTimes);
        const totalRequests = endpointMetrics.length;
        const errorRate = failed / totalRequests;
        return {
            avgResponseTime,
            minResponseTime,
            maxResponseTime,
            totalRequests,
            successfulRequests: successful,
            failedRequests: failed,
            errorRate
        };
    }
    /**
   * Get all metrics (for debugging/monitoring purposes)
   */ getAllMetrics() {
        return [
            ...this.metrics
        ]; // Return a copy to prevent external modification
    }
    /**
   * Clear all stored metrics
   */ clearMetrics() {
        this.metrics = [];
    }
    /**
   * Get current configuration
   */ getConfig() {
        return {
            ...this.config
        };
    }
    /**
   * Update configuration
   */ updateConfig(newConfig) {
        this.config = {
            ...this.config,
            ...newConfig
        };
    }
}
const __TURBOPACK__default__export__ = MonitoringService;
}),
"[project]/lib/services/qwen-generation-service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/openai/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$config$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/services/config-service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$monitoring$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/services/monitoring-service.ts [app-route] (ecmascript)");
;
;
;
class QwenGenerationService {
    openai;
    config;
    configService;
    monitoringService;
    constructor(config){
        const apiKey = process.env.QWEN_API_KEY || config?.apiKey || '';
        if (!apiKey) {
            throw new Error('Qwen API key is required for Qwen Generation Service');
        }
        this.config = {
            apiKey,
            model: config?.model || process.env.QWEN_MODEL || 'qwen/qwen-2.5-vl-72b-instruct',
            baseURL: config?.baseURL || process.env.QWEN_BASE_URL || 'https://openrouter.ai/api/v1',
            generationConfig: config?.generationConfig || {
                temperature: 0.2,
                maxOutputTokens: 8192,
                topP: 0.95,
                topK: 40
            }
        };
        // Enforce a safe cap for gpt-4o-mini / 4o models to avoid excessive outputs
        try {
            const GPT4O_MINI_MAX_OUTPUT = 4096;
            if (this.config.model && this.config.model.includes('4o')) {
                this.config.generationConfig = this.config.generationConfig || {};
                this.config.generationConfig.maxOutputTokens = Math.min(this.config.generationConfig.maxOutputTokens || GPT4O_MINI_MAX_OUTPUT, GPT4O_MINI_MAX_OUTPUT);
            }
        } catch (e) {
        // ignore errors here - defensive programming
        }
        this.openai = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"]({
            apiKey: this.config.apiKey,
            baseURL: this.config.baseURL
        });
        this.configService = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$config$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].getInstance();
        this.monitoringService = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$monitoring$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].getInstance();
    }
    /**
   * Generate a response based on search results and user query
   * @param query User's search query
   * @param searchResults Results from Colivara semantic search
   * @param options Generation options
   * @param userId User identifier for rate limiting
   */ async generateResponse(query, searchResults, options = {}, userId) {
        const startTime = Date.now();
        try {
            // Use user ID for rate limiting, fallback to a general identifier if not provided
            const identifier = userId || 'anonymous';
            // Check if request is allowed based on rate limiting
            if (!this.configService.isRequestAllowed(identifier)) {
                const remainingRequests = this.configService.getRemainingRequests(identifier);
                const resetTime = this.configService.getResetTime(identifier);
                const resetTimeFormatted = new Date(resetTime).toLocaleTimeString();
                const error = new Error(`Rate limit exceeded. You can make ${remainingRequests} more requests after ${resetTimeFormatted}.`);
                // Track the failed request
                this.monitoringService.trackGeneration(userId || 'unknown', query, Date.now() - startTime, false, error.message, this.config.model);
                throw error;
            }
            // Limit the number of results to process
            const maxResults = options.maxResults || 6;
            const limitedResults = searchResults.slice(0, maxResults);
            if (limitedResults.length === 0) {
                const response = "I couldn't find any relevant documents to answer your query. Please try a different search term.";
                // Track the successful request with no results
                this.monitoringService.trackGeneration(userId || 'unknown', query, Date.now() - startTime, true, undefined, this.config.model);
                return response;
            }
            // Check if the query is asking for comprehensive information (like lists of faculty/trainings)
            const isComprehensiveQuery = query.toLowerCase().includes('list') || query.toLowerCase().includes('all') || query.toLowerCase().includes('every') || query.toLowerCase().includes('faculty') || query.toLowerCase().includes('training') || query.toLowerCase().includes('seminar') || query.toLowerCase().includes('attended') || query.toLowerCase().includes('presentation') || query.toLowerCase().includes('research') || query.toLowerCase().includes('what') && query.toLowerCase().includes('training') || query.toLowerCase().includes('what') && query.toLowerCase().includes('seminar') || query.toLowerCase().includes('which') && query.toLowerCase().includes('training') || query.toLowerCase().includes('which') && query.toLowerCase().includes('seminar');
            // For comprehensive queries, ensure we use more results
            const resultsForGeneration = isComprehensiveQuery ? searchResults.slice(0, 6) : limitedResults; // Use the limited results for specific queries
            // Prepare the content for the model based on options
            // Check if any results have visual content to determine if we should use multimodal processing
            const hasVisualContent = resultsForGeneration.some((result)=>result.visualContent || result.screenshots && result.screenshots.length > 0);
            // Also check if the model supports image inputs
            const isImageSupported = this.config.model && (this.config.model.includes('vl') || this.config.model.includes('vision') || this.config.model.includes('106') || // newer models often support images
            this.config.model.includes('1106-preview') || this.config.model.includes('4-turbo') || this.config.model.includes('4o'));
            let result;
            if (options.textOnly || !hasVisualContent || !isImageSupported) {
                result = await this.generateTextOnlyResponse(query, resultsForGeneration, options);
            } else {
                result = await this.generateMultimodalResponse(query, resultsForGeneration, options);
            }
            // Track the successful request
            this.monitoringService.trackGeneration(userId || 'unknown', query, Date.now() - startTime, true, undefined, this.config.model);
            return result;
        } catch (error) {
            console.error('Error generating response with Qwen:', error);
            // Track the failed request
            this.monitoringService.trackGeneration(userId || 'unknown', query, Date.now() - startTime, false, error instanceof Error ? error.message : 'Unknown error', this.config.model);
            throw error;
        }
    }
    /**
   * Generate a text-only response using search results
   */ async generateTextOnlyResponse(query, searchResults, options) {
        // Format the search results into a context string
        const context = searchResults.map((result, index)=>{
            const content = result.content || result.snippet || '';
            const title = result.title || 'Untitled Document';
            const pageNumbers = result.pageNumbers?.length ? ` (pages: ${result.pageNumbers.join(', ')})` : '';
            const score = result.confidenceScore ? ` (relevance: ${(result.confidenceScore * 100).toFixed(1)}%)` : '';
            const hasVisuals = result.screenshots && result.screenshots.length > 0;
            let resultText = `Document ${index + 1}: ${title}${pageNumbers}${score}\n`;
            if (hasVisuals) {
                resultText += `[VISUAL DATA: This document contains ${result.screenshots.length} image(s). Read any tables, numbers, or text visually present in the images.]\n`;
            }
            resultText += `Content: ${content}\n`;
            return resultText;
        }).join('\n---\n');
        // Check if the query is asking for comprehensive information (like lists of faculty/trainings)
        const isComprehensiveQuery = query.toLowerCase().includes('list') || query.toLowerCase().includes('all') || query.toLowerCase().includes('every') || query.toLowerCase().includes('faculty') || query.toLowerCase().includes('training') || query.toLowerCase().includes('seminar') || query.toLowerCase().includes('attended') || query.toLowerCase().includes('presentation') || query.toLowerCase().includes('research') || query.toLowerCase().includes('what') && query.toLowerCase().includes('training') || query.toLowerCase().includes('what') && query.toLowerCase().includes('seminar') || query.toLowerCase().includes('which') && query.toLowerCase().includes('training') || query.toLowerCase().includes('which') && query.toLowerCase().includes('seminar');
        // Create the prompt with specific instructions for comprehensive queries
        const prompt = options.customPrompt || `Based on the following documents, provide a clear, direct answer to the user's query. If the documents don't contain the information needed to answer the query, state this clearly.

Documents:
${context}

User Query: ${query}

${isComprehensiveQuery ? `### SPECIAL INSTRUCTION FOR COMPREHENSIVE QUERIES: When the user asks for a list of items (such as faculty and their trainings/seminars), you MUST provide ALL the information found in the documents. Do not summarize or abbreviate. If multiple documents contain relevant information, combine and present ALL the data from all documents. Use a clear format like bullet points or structured lists to make the information easy to read. CRITICAL: If you state that you are providing a list, you MUST actually provide the complete list content. Do not just say "Here is the list..." without providing the actual items in the list. READ EVERY DOCUMENT CAREFULLY and extract ALL relevant information BEFORE forming your response. Do not stop at the first few items you find - continue reading through all documents to ensure you have collected all relevant information.` : ''}

Please provide a straightforward, direct answer to the query based on the provided documents. Focus on information that directly addresses the question. If the information is not available in the documents, say so clearly.`;
        // Generate content using the model
        const completion = await this.openai.chat.completions.create({
            model: this.config.model,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: this.config.generationConfig?.temperature,
            max_tokens: this.config.generationConfig?.maxOutputTokens,
            top_p: this.config.generationConfig?.topP
        });
        return completion.choices[0].message.content || '';
    }
    /**
   * Generate a multimodal response using search results that may include visual content
   */ async generateMultimodalResponse(query, searchResults, options) {
        // Check if the model supports image inputs by checking the model name
        const isImageSupported = this.config.model && (this.config.model.includes('vl') || this.config.model.includes('vision') || this.config.model.includes('106') || // newer models often support images
        this.config.model.includes('1106-preview') || this.config.model.includes('4-turbo') || this.config.model.includes('4o'));
        // If image input is not supported by this model, fall back to text-only
        if (!isImageSupported) {
            console.log(`Model ${this.config.model} does not support image input, falling back to text-only generation`);
            return await this.generateTextOnlyResponse(query, searchResults, options);
        }
        // Check if the query is asking for comprehensive information (like lists of faculty/trainings)
        const isComprehensiveQuery = query.toLowerCase().includes('list') || query.toLowerCase().includes('all') || query.toLowerCase().includes('every') || query.toLowerCase().includes('faculty') || query.toLowerCase().includes('training') || query.toLowerCase().includes('seminar') || query.toLowerCase().includes('attended') || query.toLowerCase().includes('presentation') || query.toLowerCase().includes('research') || query.toLowerCase().includes('what') && query.toLowerCase().includes('training') || query.toLowerCase().includes('what') && query.toLowerCase().includes('seminar') || query.toLowerCase().includes('which') && query.toLowerCase().includes('training') || query.toLowerCase().includes('which') && query.toLowerCase().includes('seminar');
        // Format the search results into a context string with visual content
        const multimodalContent = [];
        multimodalContent.push({
            type: 'text',
            text: `
You are an intelligent assistant capable of reading documents and extracting specific details.
Your goal is to answer the user's question accurately based ONLY on the provided document images.

### DATA EXTRACTION RULES:
1. **Read the Visuals:** The documents may contain tables, lists, or spreadsheets. Scan them carefully row-by-row.
2. **Be Thorough:** If the user asks for a list (e.g., "all faculty"), extract EVERY name you see in the document images. Do not summarize.
3. ** OCR Handling:** If text is slightly blurry, use your best judgment to correct obvious spelling errors (e.g., interpret "M@rk" as "Mark").

### OUTPUT FORMATTING:
If the data involves multiple items (like names and trainings), you must use a **Nested Bullet List** format:

* **Name of Person**
 * Training Title A
 * Training Title B

If the answer is simple text, use a natural paragraph.

${isComprehensiveQuery ? `### SPECIAL INSTRUCTION FOR COMPREHENSIVE QUERIES: When the user asks for a list of items (such as faculty and their trainings/seminars), you MUST provide ALL the information found in the documents. Do not summarize or abbreviate. If multiple documents contain relevant information, combine and present ALL the data from all documents. Use a clear format like bullet points or structured lists to make the information easy to read. CRITICAL: If you state that you are providing a list, you MUST actually provide the complete list content. Do not just say "Here is the list..." without providing the actual items in the list. READ EVERY DOCUMENT CAREFULLY and extract ALL relevant information BEFORE forming your response. Do not stop at the first few items you find - continue reading through all documents to ensure you have collected all relevant information.` : ''}
-------------------------------------------------------
`
        });
        // Process each result to provide to the model
        for (const result of searchResults.slice(0, 6)){
            const hasVisuals = result.screenshots && result.screenshots.length > 0;
            const hasText = result.extractedText && result.extractedText.trim().length > 0;
            // Divider
            multimodalContent.push({
                type: 'text',
                text: `\n\n=== Document: "${result.title}" ===\n`
            });
            // 1. Provide the Visuals (Universal for PDF, PNG, Excel, etc.)
            if (hasVisuals && result.screenshots) {
                for (const screenshot of result.screenshots){
                    // MAGIC FIX: Detect Type from the string signature
                    // Colivara converts PDFs to PNG screenshots, so we must detect 'iVBOR'
                    let realMimeType = 'image/jpeg';
                    if (typeof screenshot === 'string') {
                        if (screenshot.startsWith('iVBOR')) {
                            realMimeType = 'image/png'; // <--- This is the key fix for your PDFs
                        } else if (screenshot.startsWith('/9j/')) {
                            realMimeType = 'image/jpeg';
                        } else if (screenshot.startsWith('iVBO')) {
                            realMimeType = 'image/png';
                        }
                    }
                    console.log(`Sending to Qwen as: ${realMimeType}`); // Debug log
                    // Convert base64 image to data URL format
                    const dataUrl = `data:${realMimeType};base64,${screenshot}`;
                    multimodalContent.push({
                        type: 'image_url',
                        image_url: {
                            url: dataUrl
                        }
                    });
                }
                // Prompt for Visuals
                multimodalContent.push({
                    type: 'text',
                    text: `\n[VISUAL CONTENT: The above image contains the document content. Extract relevant information to answer: "${query}"]\n`
                });
            }
            // 2. Provide the Text (Universal for PDF, Word, etc.)
            if (hasText) {
                multimodalContent.push({
                    type: 'text',
                    text: `\n[TEXT CONTENT: ${result.extractedText}]\n`
                });
            } else {
                // 3. Handle "Visual Only" Files (Scans/Images)
                multimodalContent.push({
                    type: 'text',
                    text: `\n[NO TEXT EXTRACTED: Focus on visual content to answer: "${query}"]\n`
                });
            }
        }
        // Add final instruction to ensure the model responds directly to the query
        multimodalContent.push({
            type: 'text',
            text: `\n\n${isComprehensiveQuery ? `### SPECIAL INSTRUCTION FOR COMPREHENSIVE QUERIES: When the user asks for a list of items (such as faculty and their trainings/seminars), you MUST provide ALL the information found in the documents. Do not summarize or abbreviate. If multiple documents contain relevant information, combine and present ALL the data from all documents. Use a clear format like bullet points or structured lists to make the information easy to read. CRITICAL: If you state that you are providing a list, you MUST actually provide the complete list content. Do not just say "Here is the list..." without providing the actual items in the list. READ EVERY DOCUMENT CAREFULLY and extract ALL relevant information BEFORE forming your response. Do not stop at the first few items you find - continue reading through all documents to ensure you have collected all relevant information.` : ''}\n\nBased on the above documents, provide a clear, direct answer to this query: "${query}". Answer the question directly using specific information from the documents. If the documents don't contain the answer, say so clearly.`
        });
        try {
            // Generate content using the model
            const completion = await this.openai.chat.completions.create({
                model: this.config.model,
                messages: [
                    {
                        role: 'user',
                        content: multimodalContent
                    }
                ],
                temperature: this.config.generationConfig?.temperature,
                max_tokens: this.config.generationConfig?.maxOutputTokens,
                top_p: this.config.generationConfig?.topP
            });
            return completion.choices[0].message.content || '';
        } catch (error) {
            // If image input fails, fall back to text-only processing
            if (error.status === 404 && error.message.includes('image input')) {
                console.log('Image input not supported by model, falling back to text-only generation');
                return await this.generateTextOnlyResponse(query, searchResults, options);
            }
            throw error;
        }
    }
    /**
   * Generate insights from search results
   * @param query User's search query
   * @param searchResults Results from Colivara semantic search
   * @param userId User identifier for rate limiting
   */ async generateInsights(query, searchResults, userId) {
        const startTime = Date.now();
        try {
            // Use user ID for rate limiting, fallback to a general identifier if not provided
            const identifier = userId || 'anonymous';
            // Check if request is allowed based on rate limiting
            if (!this.configService.isRequestAllowed(identifier)) {
                const remainingRequests = this.configService.getRemainingRequests(identifier);
                const resetTime = this.configService.getResetTime(identifier);
                const resetTimeFormatted = new Date(resetTime).toLocaleTimeString();
                const error = new Error(`Rate limit exceeded. You can make ${remainingRequests} more requests after ${resetTimeFormatted}.`);
                // Track the failed request
                this.monitoringService.trackGeneration(userId || 'unknown', query, Date.now() - startTime, false, error.message, this.config.model);
                throw error;
            }
            const maxResults = 6;
            const limitedResults = searchResults.slice(0, maxResults);
            if (limitedResults.length === 0) {
                const result = {
                    summary: "No relevant documents found to generate insights.",
                    keyPoints: [],
                    sources: []
                };
                // Track the successful request with no results
                this.monitoringService.trackGeneration(userId || 'unknown', query, Date.now() - startTime, true, undefined, this.config.model);
                return result;
            }
            // Format the search results into a context string with visual content for insights
            const multimodalContent = [];
            multimodalContent.push({
                type: 'text',
                text: `
You are an intelligent assistant capable of reading documents and extracting specific details.
Your goal is to answer the user's question accurately based ONLY on the provided document images.

### DATA EXTRACTION RULES:
1. **Read the Visuals:** The documents may contain tables, lists, or spreadsheets. Scan them carefully row-by-row.
2. **Be Thorough:** If the user asks for a list (e.g., "all faculty"), extract EVERY name you see in the document images. Do not summarize.
3. ** OCR Handling:** If text is slightly blurry, use your best judgment to correct obvious spelling errors (e.g., interpret "M@rk" as "Mark").

### OUTPUT FORMATTING:
If the data involves multiple items (like names and trainings), you must use a **Nested Bullet List** format:

* **Name of Person**
  * Training Title A
  * Training Title B

If the answer is simple text, use a natural paragraph.
-------------------------------------------------------
`
            });
            // Process each result
            for (const result of limitedResults){
                const hasVisuals = result.screenshots && result.screenshots.length > 0;
                const hasText = result.extractedText && result.extractedText.trim().length > 0;
                const title = result.title || 'Untitled Document';
                const confidence = result.confidenceScore || 0;
                // Add document header
                multimodalContent.push({
                    type: 'text',
                    text: `\n\n=== Document: "${title}" (relevance: ${(confidence * 100).toFixed(1)}%) ===\n`
                });
                // 1. Provide the Visuals (Universal for PDF, PNG, Excel, etc.)
                if (hasVisuals && result.screenshots) {
                    for (const screenshot of result.screenshots){
                        // MAGIC FIX: Detect Type from the string signature
                        let realMimeType = 'image/jpeg';
                        if (typeof screenshot === 'string') {
                            if (screenshot.startsWith('iVBOR')) {
                                realMimeType = 'image/png';
                            } else if (screenshot.startsWith('/9j/')) {
                                realMimeType = 'image/jpeg';
                            } else if (screenshot.startsWith('iVBO')) {
                                realMimeType = 'image/png';
                            }
                        }
                        console.log(`Sending to Qwen as: ${realMimeType}`); // Debug log
                        // Convert base64 image to data URL format
                        const dataUrl = `data:${realMimeType};base64,${screenshot}`;
                        multimodalContent.push({
                            type: 'image_url',
                            image_url: {
                                url: dataUrl
                            }
                        });
                    }
                    // Prompt for Visuals
                    multimodalContent.push({
                        type: 'text',
                        text: `\n[VISUAL CONTENT: The above image contains document information. Extract data relevant to: "${query}"]\n`
                    });
                }
                // 2. Provide the Text (Universal for PDF, Word, etc.)
                if (hasText) {
                    multimodalContent.push({
                        type: 'text',
                        text: `\n[TEXT CONTENT: ${result.extractedText}]\n`
                    });
                } else {
                    // 3. Handle "Visual Only" Files (Scans/Images)
                    multimodalContent.push({
                        type: 'text',
                        text: `\n[NO TEXT EXTRACTED: Focus on visual content to answer: "${query}"]\n`
                    });
                }
            }
            // Check if the query is asking for comprehensive information (like lists of faculty/trainings)
            const isComprehensiveQuery = query.toLowerCase().includes('list') || query.toLowerCase().includes('all') || query.toLowerCase().includes('every') || query.toLowerCase().includes('faculty') || query.toLowerCase().includes('training') || query.toLowerCase().includes('seminar') || query.toLowerCase().includes('attended') || query.toLowerCase().includes('presentation') || query.toLowerCase().includes('research') || query.toLowerCase().includes('what') && query.toLowerCase().includes('training') || query.toLowerCase().includes('what') && query.toLowerCase().includes('seminar') || query.toLowerCase().includes('which') && query.toLowerCase().includes('training') || query.toLowerCase().includes('which') && query.toLowerCase().includes('seminar');
            // Add special instruction for comprehensive queries
            multimodalContent.push({
                type: 'text',
                text: `\n\n${isComprehensiveQuery ? `### SPECIAL INSTRUCTION FOR COMPREHENSIVE QUERIES: When the user asks for a list of items (such as faculty and their trainings/seminars), you MUST provide ALL the information found in the documents. Do not summarize or abbreviate. If multiple documents contain relevant information, combine and present ALL the data from all documents. Use a clear format like bullet points or structured lists to make the information easy to read. CRITICAL: If you state that you are providing a list, you MUST actually provide the complete list content. Do not just say "Here is the list..." without providing the actual items in the list. READ EVERY DOCUMENT CAREFULLY and extract ALL relevant information BEFORE forming your response. Do not stop at the first few items you find - continue reading through all documents to ensure you have collected all relevant information.` : ''}\n\nBased on the above documents, provide a clear, direct answer to "${query}". Format your response as JSON with the following structure: { "summary": "Direct answer to the user's query based on document content", "keyPoints": ["Concise points that directly address the query", "Relevant information from documents"], "sources": [ { "title": "Document title", "documentId": "Document ID if available", "confidence": "Confidence score between 0 and 1" } ] }`
            });
            const prompt = `Based on the following documents, please provide a summary, key points, and sources related to the query: ${query}

Documents:
[MULTIMODAL CONTENT PROVIDED IN THE REQUEST]

Please format your response as JSON with the following structure:
{
 "summary": "Brief summary of the documents in relation to the query",
 "keyPoints": ["List of key points from the documents", "Each point should be concise and informative"],
 "sources": [
   {
     "title": "Document title",
     "documentId": "Document ID if available",
     "confidence": "Confidence score between 0 and 1"
   }
 ]
}`;
            // Check if the model supports image inputs by checking the model name
            const isImageSupported = this.config.model && (this.config.model.includes('vl') || this.config.model.includes('vision') || this.config.model.includes('106') || // newer models often support images
            this.config.model.includes('1106-preview') || this.config.model.includes('4-turbo') || this.config.model.includes('4o'));
            // If image input is not supported by this model, fall back to text-only
            if (!isImageSupported) {
                console.log(`Model ${this.config.model} does not support image input, falling back to text-only generation for insights`);
                // Use text-only processing by calling generateTextOnlyResponse and formatting appropriately
                const textResponse = await this.generateTextOnlyResponse(query, limitedResults, {});
                // Return a structured response similar to what the JSON format would provide
                const fallbackResult = {
                    summary: textResponse,
                    keyPoints: [
                        textResponse.substring(0, 200)
                    ],
                    sources: limitedResults.map((result)=>({
                            title: result.title || 'Untitled Document',
                            documentId: result.documentId || '',
                            confidence: result.confidenceScore || 0
                        }))
                };
                // Track the successful request with fallback
                this.monitoringService.trackGeneration(userId || 'unknown', query, Date.now() - startTime, true, 'Fallback to text-only due to image input not supported', this.config.model);
                return fallbackResult;
            }
            let completion;
            try {
                completion = await this.openai.chat.completions.create({
                    model: this.config.model,
                    messages: [
                        {
                            role: 'user',
                            content: multimodalContent
                        }
                    ],
                    temperature: this.config.generationConfig?.temperature,
                    max_tokens: this.config.generationConfig?.maxOutputTokens,
                    top_p: this.config.generationConfig?.topP,
                    response_format: {
                        type: "json_object"
                    }
                });
            } catch (error) {
                // If image input fails, fall back to text-only processing
                if (error.status === 404 && error.message.includes('image input')) {
                    console.log('Image input not supported by model, falling back to text-only generation for insights');
                    // Use text-only processing by calling generateTextOnlyResponse and formatting appropriately
                    const textResponse = await this.generateTextOnlyResponse(query, limitedResults, {});
                    // Return a structured response similar to what the JSON format would provide
                    const fallbackResult = {
                        summary: textResponse,
                        keyPoints: [
                            textResponse.substring(0, 200)
                        ],
                        sources: limitedResults.map((result)=>({
                                title: result.title || 'Untitled Document',
                                documentId: result.documentId || '',
                                confidence: result.confidenceScore || 0
                            }))
                    };
                    // Track the successful request with fallback
                    this.monitoringService.trackGeneration(userId || 'unknown', query, Date.now() - startTime, true, 'Fallback to text-only due to image input error', this.config.model);
                    return fallbackResult;
                }
                throw error;
            }
            const text = completion.choices[0].message.content || '';
            // Parse the JSON response
            try {
                const parsed = JSON.parse(text);
                // Track the successful request
                this.monitoringService.trackGeneration(userId || 'unknown', query, Date.now() - startTime, true, undefined, this.config.model);
                return parsed;
            } catch (parseError) {
                console.error('Error parsing Qwen JSON response:', parseError);
                // Fallback: return a basic structure
                const fallbackResult = {
                    summary: text.substring(0, 500) + (text.length > 50 ? '...' : ''),
                    keyPoints: [
                        text.substring(0, 200)
                    ],
                    sources: limitedResults.map((result)=>({
                            title: result.title || 'Untitled Document',
                            documentId: result.documentId || '',
                            confidence: result.confidenceScore || 0
                        }))
                };
                // Track the successful request with fallback
                this.monitoringService.trackGeneration(userId || 'unknown', query, Date.now() - startTime, true, 'Fallback due to JSON parsing error', this.config.model);
                return fallbackResult;
            }
        } catch (error) {
            console.error('Error generating insights with Qwen:', error);
            // Track the failed request
            this.monitoringService.trackGeneration(userId || 'unknown', query, Date.now() - startTime, false, error instanceof Error ? error.message : 'Unknown error', this.config.model);
            throw error;
        }
    }
    /**
   * Check if the service is properly initialized and API key is valid
   */ async healthCheck() {
        const startTime = Date.now();
        try {
            // Try to get model information as a basic health check
            const completion = await this.openai.chat.completions.create({
                model: this.config.model,
                messages: [
                    {
                        role: 'user',
                        content: 'Hello'
                    }
                ],
                temperature: 0,
                max_tokens: 5
            });
            // Track the successful health check
            this.monitoringService.logMetric({
                endpoint: 'qwen-health-check',
                responseTime: Date.now() - startTime,
                success: true,
                model: this.config.model
            });
            return true;
        } catch (error) {
            console.error('Qwen service health check failed:', error);
            // Track the failed health check
            this.monitoringService.logMetric({
                endpoint: 'qwen-health-check',
                responseTime: Date.now() - startTime,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                model: this.config.model
            });
            return false;
        }
    }
}
const __TURBOPACK__default__export__ = QwenGenerationService;
}),
"[project]/lib/utils/super-mapper.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Super Mapper - A utility to handle document field mapping across different data sources
 * This solution addresses the need to look for document data under various possible field names
 */ __turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
/**
 * Generic function to extract a value from an object trying multiple possible field names
 */ function extractValue(obj, possibleFieldNames) {
    for (const field of possibleFieldNames){
        if (obj && obj[field] !== undefined && obj[field] !== null) {
            return obj[field];
        }
    }
    return undefined;
}
/**
 * Super Mapper class to handle document field mapping
 */ class SuperMapper {
    /**
   * Maps document data from various sources to a consistent format
   * Tries multiple possible field names for each property
   */ static mapDocumentData(rawData) {
        if (!rawData) {
            return {};
        }
        return {
            // Title mapping - try various possible field names for document title
            title: extractValue(rawData, [
                'title',
                'document_title',
                'originalName',
                'name',
                'fileName',
                'file_name',
                'documentName',
                'document_name'
            ]),
            // Description mapping
            description: extractValue(rawData, [
                'description',
                'content',
                'text',
                'summary',
                'desc',
                'body',
                'details'
            ]),
            // File name mapping
            fileName: extractValue(rawData, [
                'fileName',
                'file_name',
                'originalFileName',
                'original_file_name',
                'filename',
                'name'
            ]),
            // File URL mapping
            fileUrl: extractValue(rawData, [
                'fileUrl',
                'file_url',
                'url',
                'documentUrl',
                'document_url',
                'source',
                'path'
            ]),
            // ID mapping
            id: extractValue(rawData, [
                'id',
                'documentId',
                'document_id',
                'docId',
                'doc_id',
                '_id',
                'identifier'
            ]),
            // Category mapping
            category: extractValue(rawData, [
                'category',
                'category_name',
                'type',
                'documentType',
                'document_type',
                'classification'
            ]),
            // Tags mapping
            tags: extractValue(rawData, [
                'tags',
                'tag_list',
                'tagList',
                'keywords',
                'keyword_list',
                'keywordList'
            ]),
            // Uploaded by mapping
            uploadedBy: extractValue(rawData, [
                'uploadedBy',
                'uploaded_by',
                'uploadedByUser',
                'uploaded_by_user',
                'author',
                'creator',
                'uploader'
            ]),
            // Upload date mapping
            uploadedAt: extractValue(rawData, [
                'uploadedAt',
                'uploaded_at',
                'uploadDate',
                'upload_date',
                'createdAt',
                'created_at',
                'date'
            ]),
            // File type mapping
            fileType: extractValue(rawData, [
                'fileType',
                'file_type',
                'mimeType',
                'mime_type',
                'type',
                'extension'
            ]),
            // File size mapping
            fileSize: extractValue(rawData, [
                'fileSize',
                'file_size',
                'size',
                'fileSizeBytes',
                'file_size_bytes'
            ])
        };
    }
    /**
   * Gets a specific field value trying multiple possible names
   */ static getFieldValue(obj, fieldPath) {
        if (!obj) return undefined;
        // If fieldPath is a string, split it by dots to handle nested properties
        const fields = Array.isArray(fieldPath) ? fieldPath : fieldPath.split('.');
        // If we have a single field name, try multiple possible variants
        if (fields.length === 1) {
            const fieldName = fields[0];
            // Define possible variations for common field names
            const possibleNames = {
                title: [
                    'title',
                    'document_title',
                    'originalName',
                    'name',
                    'fileName',
                    'file_name',
                    'documentName'
                ],
                description: [
                    'description',
                    'content',
                    'text',
                    'summary',
                    'desc',
                    'body'
                ],
                fileName: [
                    'fileName',
                    'file_name',
                    'originalFileName',
                    'original_file_name',
                    'filename'
                ],
                fileUrl: [
                    'fileUrl',
                    'file_url',
                    'url',
                    'documentUrl',
                    'document_url',
                    'source'
                ],
                id: [
                    'id',
                    'documentId',
                    'document_id',
                    'docId',
                    'doc_id',
                    '_id'
                ],
                category: [
                    'category',
                    'category_name',
                    'type',
                    'documentType',
                    'document_type'
                ],
                tags: [
                    'tags',
                    'tag_list',
                    'tagList',
                    'keywords',
                    'keyword_list',
                    'keywordList'
                ],
                uploadedBy: [
                    'uploadedBy',
                    'uploaded_by',
                    'uploadedByUser',
                    'uploaded_by_user',
                    'author',
                    'creator'
                ],
                uploadedAt: [
                    'uploadedAt',
                    'uploaded_at',
                    'uploadDate',
                    'upload_date',
                    'createdAt',
                    'created_at'
                ],
                fileType: [
                    'fileType',
                    'file_type',
                    'mimeType',
                    'mime_type',
                    'type',
                    'extension'
                ],
                fileSize: [
                    'fileSize',
                    'file_size',
                    'size',
                    'fileSizeBytes',
                    'file_size_bytes'
                ]
            };
            const possibleFieldNames = possibleNames[fieldName] || [
                fieldName
            ];
            return extractValue(obj, possibleFieldNames);
        }
        // For nested properties, try to access the path directly first
        let result = obj;
        for (const field of fields){
            if (result && result[field] !== undefined) {
                result = result[field];
            } else {
                result = undefined;
                break;
            }
        }
        if (result !== undefined) {
            return result;
        }
        // If direct access fails, try common variations of the first field
        const firstField = fields[0];
        const remainingPath = fields.slice(1).join('.');
        const possibleNames = {
            metadata: [
                'metadata',
                'meta',
                'data',
                'info',
                'document_metadata'
            ],
            document: [
                'document',
                'doc',
                'result',
                'item',
                'data',
                'record'
            ]
        };
        const possibleFieldNames = possibleNames[firstField] || [
            firstField
        ];
        for (const possibleName of possibleFieldNames){
            const nestedObj = obj[possibleName];
            if (nestedObj) {
                // Recursively call for the remaining path
                const nestedResult = this.getFieldValue(nestedObj, remainingPath);
                if (nestedResult !== undefined) {
                    return nestedResult;
                }
            }
        }
        return undefined;
    }
    /**
   * Creates a mapped document object with standardized field names
   */ static createStandardDocument(rawData) {
        const mappedData = this.mapDocumentData(rawData);
        // Create a standard document object using the mapped values
        // Only apply defaults if no value was found from any of the possible field names
        return {
            ...rawData,
            id: mappedData.id || rawData.id || rawData.documentId || (rawData.document ? rawData.document.id : undefined),
            title: mappedData.title || rawData.title || rawData.originalName || rawData.name || 'Untitled Document',
            description: mappedData.description || rawData.description || rawData.content || rawData.text || rawData.summary || '',
            fileName: mappedData.fileName || rawData.fileName || rawData.originalFileName || rawData.name || 'unknown.pdf',
            fileUrl: mappedData.fileUrl || rawData.fileUrl || rawData.url || rawData.documentUrl || rawData.source,
            category: mappedData.category || rawData.category || rawData.type || rawData.documentType || 'Uncategorized',
            tags: mappedData.tags || rawData.tags || rawData.keywords || [],
            uploadedBy: mappedData.uploadedBy || rawData.uploadedBy || rawData.author || rawData.creator || rawData.uploader || 'Unknown',
            uploadedAt: mappedData.uploadedAt ? new Date(mappedData.uploadedAt) : rawData.uploadedAt ? new Date(rawData.uploadedAt) : rawData.uploadDate ? new Date(rawData.uploadDate) : rawData.createdAt ? new Date(rawData.createdAt) : new Date(),
            fileType: mappedData.fileType || rawData.fileType || rawData.mimeType || rawData.type || 'unknown',
            fileSize: mappedData.fileSize || rawData.fileSize || rawData.size || 0
        };
    }
}
const __TURBOPACK__default__export__ = SuperMapper;
}),
"[project]/lib/utils/document-utils.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Utility functions for handling document titles and names
 */ /**
 * Cleans a document title by removing the alphanumeric prefix that is added during Colivara processing
 * @param title The original document title that may contain an alphanumeric prefix
 * @returns The cleaned document title with the prefix removed
 * 
 * Example: 
 * Input: "cmicq4gtx0001lvg4tzbcpqgz_QPRO - 3RD QUARTER - JULY TO SEPTEMBER 2025.pdf"
 * Output: "QPRO - 3RD QUARTER - JULY TO SEPTEMBER 2025.pdf"
 */ __turbopack_context__.s([
    "cleanDocumentTitle",
    ()=>cleanDocumentTitle,
    "cleanDocumentTitles",
    ()=>cleanDocumentTitles
]);
function cleanDocumentTitle(title) {
    if (!title) {
        return title;
    }
    // Pattern to match the alphanumeric prefix followed by an underscore
    // This matches the pattern: alphanumeric_string_original_filename
    // The prefix is typically a longer random alphanumeric string (like a UUID), followed by an underscore
    // Then followed by the actual filename that starts with a non-underscore character
    const prefixPattern = /^[a-zA-Z0-9]{10,}_([^_].*)$/;
    const match = title.match(prefixPattern);
    if (match) {
        // Return the part after the underscore
        return match[1];
    }
    // If no match, return the original title
    return title;
}
function cleanDocumentTitles(titles) {
    return titles.map((title)=>cleanDocumentTitle(title));
}
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
"[project]/lib/services/search-cache-service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SearchCacheService",
    ()=>SearchCacheService,
    "searchCacheService",
    ()=>searchCacheService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$redis$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/services/redis-service.ts [app-route] (ecmascript)");
;
// Cache configuration - TTL in seconds for Redis
const DEFAULT_CACHE_TTL = 30 * 60; // 30 minutes in seconds
const MAX_CACHE_SIZE = 50; // Maximum number of cached search results
class SearchCacheService {
    maxCacheSize;
    metrics = {
        hits: 0,
        misses: 0,
        totalRequests: 0,
        averageResponseTime: 0,
        hitRate: 0
    };
    constructor(maxSize = MAX_CACHE_SIZE){
        this.maxCacheSize = maxSize;
    }
    /**
   * Generate a cache key based on search parameters
   */ generateCacheKey(query, unitId, category, filters) {
        // Ensure query is a string and handle null/undefined
        const safeQuery = (query || '').toLowerCase().trim();
        // Convert "undefined" string to proper undefined/null for consistent cache keys
        const safeUnitId = unitId === 'undefined' || unitId === undefined || unitId === null ? 'all' : unitId;
        const safeCategory = category === 'undefined' || category === undefined || category === null ? 'all' : category;
        // Ensure filters is a valid object and stringify it safely
        let filtersString = '{}';
        try {
            // Convert "undefined" string to empty object for consistent cache keys
            const safeFilters = filters === 'undefined' || filters === undefined || filters === null ? {} : filters;
            filtersString = JSON.stringify(safeFilters);
        } catch (error) {
            console.error('Error stringifying filters for cache key:', error);
            filtersString = '{}'; // Fallback to empty object
        }
        const params = [
            safeQuery,
            safeUnitId,
            safeCategory,
            filtersString
        ];
        // Create a hash-based cache key to avoid special character issues
        const keyString = params.join('|');
        // Create a simple hash function to generate a consistent key
        let hash = 0;
        for(let i = 0; i < keyString.length; i++){
            const char = keyString.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        // Create a readable key with the hash to ensure uniqueness
        const readablePrefix = safeQuery.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_');
        return `search:${readablePrefix}_${Math.abs(hash).toString(36)}`;
    }
    /**
   * Check if a cached result exists and is still valid
   */ async getCachedResult(query, unitId, category, filters) {
        this.metrics.totalRequests++;
        // Normalize parameters to handle "undefined" strings consistently
        const normalizedUnitId = unitId === 'undefined' ? undefined : unitId;
        const normalizedCategory = category === 'undefined' ? undefined : category;
        const normalizedFilters = filters === 'undefined' ? undefined : filters;
        const cacheKey = this.generateCacheKey(query, normalizedUnitId, normalizedCategory, normalizedFilters);
        const cachedResult = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$redis$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redisService"].get(cacheKey);
        if (!cachedResult) {
            this.metrics.misses++;
            this.updateHitRate();
            return null;
        }
        // Check if cache is expired (note: Redis handles TTL automatically, but we still check timestamp for consistency)
        if (Date.now() - cachedResult.timestamp > cachedResult.ttl) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$redis$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redisService"].del(cacheKey);
            this.metrics.misses++;
            this.updateHitRate();
            return null;
        }
        this.metrics.hits++;
        this.updateHitRate();
        return cachedResult.results;
    }
    /**
   * Store search results in cache
   */ async setCachedResult(query, results, unitId, category, filters, ttl = DEFAULT_CACHE_TTL) {
        // Normalize parameters to handle "undefined" strings consistently
        const normalizedUnitId = unitId === 'undefined' ? undefined : unitId;
        const normalizedCategory = category === 'undefined' ? undefined : category;
        const normalizedFilters = filters === 'undefined' ? undefined : filters;
        const cacheKey = this.generateCacheKey(query, normalizedUnitId, normalizedCategory, normalizedFilters);
        const cachedResult = {
            query,
            unitId: normalizedUnitId,
            category: normalizedCategory,
            filters: normalizedFilters,
            results,
            timestamp: Date.now(),
            ttl: ttl * 1000 // Convert to milliseconds for timestamp comparison
        };
        // Store in Redis with TTL
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$redis$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redisService"].set(cacheKey, cachedResult, ttl);
    }
    /**
   * Remove a specific cached result
   */ async removeCachedResult(query, unitId, category, filters) {
        // Normalize parameters to handle "undefined" strings consistently
        const normalizedUnitId = unitId === 'undefined' ? undefined : unitId;
        const normalizedCategory = category === 'undefined' ? undefined : category;
        const normalizedFilters = filters === 'undefined' ? undefined : filters;
        const cacheKey = this.generateCacheKey(query, normalizedUnitId, normalizedCategory, normalizedFilters);
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$redis$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redisService"].del(cacheKey);
    }
    /**
   * Clear all cached search results
   */ async clearCache() {
        const keys = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$redis$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redisService"].keys('search:*');
        if (keys.length > 0) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$redis$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redisService"].redis.del(...keys);
        }
    }
    /**
   * Invalidate cache entries that might be affected by document changes
   */ async invalidateCacheForDocument(documentId) {
        // This is more complex with Redis - we'd need to maintain a reverse mapping
        // For now, we'll clear all search cache when a document is updated
        await this.clearCache();
    }
    /**
   * Invalidate cache entries that match a specific query pattern
   */ async invalidateCacheByQuery(queryPattern) {
        const pattern = `*${queryPattern.toLowerCase()}*`;
        const keys = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$redis$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redisService"].keys(pattern);
        if (keys.length > 0) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$redis$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redisService"].redis.del(...keys);
        }
    }
    /**
   * Invalidate cache entries by unit ID
   */ async invalidateCacheByUnit(unitId) {
        // For a more sophisticated implementation, you'd need to maintain tags for cache invalidation
        // For now, we'll clear all search cache when a unit is updated
        await this.clearCache();
    }
    /**
   * Invalidate cache entries by category
   */ async invalidateCacheByCategory(category) {
        // For a more sophisticated implementation, you'd need to maintain tags for cache invalidation
        // For now, we'll clear all search cache when a category is updated
        await this.clearCache();
    }
    /**
   * Get cache statistics
   */ async getCacheStats() {
        const keys = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$redis$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["redisService"].keys('search:*');
        return {
            size: keys.length,
            keys
        };
    }
    /**
   * Pre-warm the cache with frequently searched queries
   */ async prewarmCache(queries) {
        for (const { query, results, unitId, category, filters } of queries){
            // Normalize parameters to handle "undefined" strings consistently
            const normalizedUnitId = unitId === 'undefined' ? undefined : unitId;
            const normalizedCategory = category === 'undefined' ? undefined : category;
            const normalizedFilters = filters === 'undefined' ? undefined : filters;
            await this.setCachedResult(query, results, normalizedUnitId, normalizedCategory, normalizedFilters);
        }
    }
    /**
   * Get the most frequently searched queries from cache usage
   */ getFrequentQueries(limit = 10) {
        // This would normally track usage statistics over time
        // For now, we'll return an empty array - in a real implementation,
        // you'd track query usage and return the most frequent ones
        return [];
    }
    /**
   * Update the cache hit rate metric
   */ updateHitRate() {
        if (this.metrics.totalRequests > 0) {
            this.metrics.hitRate = this.metrics.hits / this.metrics.totalRequests;
        }
    }
    /**
   * Get cache metrics
   */ getCacheMetrics() {
        return {
            ...this.metrics
        };
    }
    /**
   * Reset cache metrics
   */ resetMetrics() {
        this.metrics = {
            hits: 0,
            misses: 0,
            totalRequests: 0,
            averageResponseTime: 0,
            hitRate: 0
        };
    }
}
const searchCacheService = new SearchCacheService();
;
}),
"[project]/app/api/search/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$enhanced$2d$document$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/services/enhanced-document-service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$middleware$2f$auth$2d$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/middleware/auth-middleware.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$colivara$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/services/colivara-service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$qwen$2d$generation$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/services/qwen-generation-service.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$super$2d$mapper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils/super-mapper.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$document$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils/document-utils.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$search$2d$cache$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/services/search-cache-service.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
// Helper function to generate consistent cache keys
function generateCacheKey(query, unitId, category, filters) {
    // Convert "undefined" string to proper undefined/null for consistent cache keys
    const safeUnitId = unitId === 'undefined' || unitId === undefined || unitId === null ? 'all' : unitId;
    const safeCategory = category === 'undefined' || category === undefined || category === null ? 'all' : category;
    const safeFilters = filters === 'undefined' || filters === undefined || filters === null ? {} : filters;
    return btoa([
        query.toLowerCase().trim(),
        safeUnitId,
        safeCategory,
        JSON.stringify(safeFilters)
    ].join('|')).replace(/[^a-zA-Z0-9]/g, '_');
}
const qwenService = new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$qwen$2d$generation$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"]({
    model: process.env.QWEN_MODEL || 'qwen/qwen-2.5-vl-72b-instruct'
});
const colivaraService = new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$colivara$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"]();
// Helper function to deduplicate search results based on document ID
function deduplicateResults(results) {
    const seenIds = new Set();
    const uniqueResults = [];
    for (const result of results){
        // Use the document ID for deduplication - try multiple possible locations
        const docId = result.id || result.documentId || result.document && result.document.id || result.metadata && result.metadata.documentId || result.document && result.document.metadata.documentId || undefined;
        if (docId && !seenIds.has(docId)) {
            seenIds.add(docId);
            uniqueResults.push(result);
        } else if (!docId) {
            // If no ID is available, add it anyway (though this shouldn't happen with proper data)
            console.warn('Result without valid document ID in deduplicateResults:', result);
            uniqueResults.push(result);
        }
    }
    return uniqueResults;
}
// Group similar search results by document ID to consolidate duplicates
function groupResults(results) {
    const groupedMap = new Map();
    for (const result of results){
        // Use the document ID as the grouping key - try multiple possible locations
        const docId = result.id || result.documentId || result.document && result.document.id || result.metadata && result.metadata.documentId || result.document && result.document.metadata.documentId || undefined;
        if (docId) {
            if (groupedMap.has(docId)) {
                // If we already have a result for this document, we'll keep the one with higher score
                const existingResult = groupedMap.get(docId);
                const currentScore = result.score || result.confidenceScore || 0;
                const existingScore = existingResult.score || existingResult.confidenceScore || 0;
                // Keep the result with higher score
                if (currentScore > existingScore) {
                    groupedMap.set(docId, result);
                }
            } else {
                groupedMap.set(docId, result);
            }
        } else {
            // If no ID, add it directly (shouldn't happen in normal cases after our filtering)
            console.warn('Result without valid document ID:', result);
            groupedMap.set(`fallback_${results.indexOf(result)}`, result);
        }
    }
    return Array.from(groupedMap.values());
}
// Mapper function to convert Colivara search results to the standard format expected by the frontend
async function mapColivaraResultsToDocuments(colivaraResults) {
    // Create a set of document IDs from the search results to fetch from the database, ensuring they are valid strings
    // Extract document IDs from the Colivara results - the ID should come from the metadata of the Colivara document
    const allIds = colivaraResults.map((result)=>{
        // Try multiple possible locations for the document ID
        return result.documentId || result.id || result.document && result.document.id || result.metadata && result.metadata.documentId || result.document && result.document.metadata && result.document.metadata.documentId || // Nested check
        undefined;
    });
    // Log problematic IDs for debugging
    const problematicIds = allIds.filter((id)=>typeof id !== 'string' || id === undefined || id === null || id.trim() === '' || id.length === 0);
    if (problematicIds.length > 0) {
        console.warn('Found problematic document IDs in mapColivaraResultsToDocuments:', problematicIds);
        console.warn('Sample of problematic results:', colivaraResults.slice(0, 5).map((r)=>({
                documentId: r.documentId,
                id: r.id,
                metadata: r.metadata,
                document: r.document,
                hasDocument: !!r.document,
                documentIdFromDoc: r.document?.id,
                documentIdFromMetadata: r.metadata?.documentId
            })));
    }
    const documentIds = allIds.filter((id)=>{
        // Only include IDs that are valid strings
        return typeof id === 'string' && id.trim() !== '' && id.length > 0;
    });
    // Remove duplicates from documentIds
    const uniqueDocumentIds = [
        ...new Set(documentIds)
    ];
    // Fetch actual document data from the database to ensure correct titles and descriptions
    let dbDocMap = new Map();
    if (uniqueDocumentIds.length > 0) {
        const dbDocuments = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].document.findMany({
            where: {
                id: {
                    in: uniqueDocumentIds
                },
                status: 'ACTIVE' // Only include active documents
            },
            include: {
                uploadedByUser: true,
                documentUnit: true
            }
        });
        // Create a map for quick lookup of database document data
        dbDocMap = new Map(dbDocuments.map((doc)=>[
                doc.id,
                doc
            ]));
    }
    // Process results and map them to proper document format
    const mappedResults = [];
    for (const result of colivaraResults){
        // Get the document ID from the result - try multiple possible locations
        const rawId = result.documentId || result.id || result.document && result.document.id || result.metadata && result.metadata.documentId || result.document && result.document.metadata && result.document.metadata.documentId || undefined;
        // Only process if we have a valid document ID
        if (typeof rawId === 'string' && rawId.trim() !== '' && rawId.length > 0) {
            // Get the corresponding database document if it exists
            const dbDoc = dbDocMap.get(rawId);
            // If the document exists in the database, use its data as the primary source
            if (dbDoc) {
                // Use database document as primary source but override with search-specific data
                const mappedDocument = {
                    ...dbDoc,
                    tags: Array.isArray(dbDoc.tags) ? dbDoc.tags : [],
                    unitId: dbDoc.unitId ?? undefined,
                    versionNotes: dbDoc.versionNotes ?? undefined,
                    uploadedBy: dbDoc.uploadedByUser?.name || dbDoc.uploadedBy,
                    status: dbDoc.status,
                    unit: dbDoc.documentUnit ? {
                        id: dbDoc.documentUnit.id,
                        name: dbDoc.documentUnit.name,
                        code: dbDoc.documentUnit.code,
                        description: dbDoc.documentUnit.description || undefined,
                        createdAt: dbDoc.documentUnit.createdAt,
                        updatedAt: dbDoc.documentUnit.updatedAt
                    } : undefined,
                    uploadedAt: new Date(dbDoc.uploadedAt),
                    createdAt: new Date(dbDoc.createdAt),
                    updatedAt: new Date(dbDoc.updatedAt),
                    // Colivara fields
                    colivaraDocumentId: dbDoc.colivaraDocumentId ?? undefined,
                    colivaraProcessingStatus: dbDoc.colivaraProcessingStatus ?? undefined,
                    colivaraProcessedAt: dbDoc.colivaraProcessedAt ? new Date(dbDoc.colivaraProcessedAt) : undefined,
                    colivaraChecksum: dbDoc.colivaraChecksum ?? undefined
                };
                // Override with search-specific data if available in the result
                mappedResults.push({
                    ...mappedDocument,
                    title: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$document$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cleanDocumentTitle"])(dbDoc.title || result.title || result.originalName || result.document_name || result.document && result.document.title || dbDoc.fileName || 'Untitled Document'),
                    // For content, use robust fallback logic
                    content: (()=>{
                        const rawContent = result.content || result.text || result.extractedText || dbDoc.description || '';
                        const hasRealText = typeof rawContent === 'string' && rawContent.trim().length > 0;
                        if (hasRealText) {
                            return rawContent;
                        } else {
                            return 'Visual Content'; // This fixes "undefined" in content field
                        }
                    })(),
                    // For snippet, try Colivara result first, then fallback to database description
                    snippet: (()=>{
                        // Robust Text Fallback - check if content exists and is a string with length
                        const rawContent = result.content || result.text || result.extractedText || dbDoc.description || '';
                        const hasRealText = typeof rawContent === 'string' && rawContent.trim().length > 0;
                        if (hasRealText) {
                            return rawContent.substring(0, 200) + '...';
                        } else {
                            return dbDoc.description || 'Visual Document (Chart/Table/Image)'; // Use database description if available
                        }
                    })(),
                    // Add search-specific fields
                    score: (()=>{
                        const rawScore = result.score || result.confidenceScore;
                        return typeof rawScore === 'number' ? rawScore : 0.85; // Default to high relevance if Colivara found it
                    })(),
                    pageNumbers: result.pageNumbers || [],
                    documentSection: result.documentSection || '',
                    confidenceScore: (()=>{
                        const rawScore = result.confidenceScore || result.score;
                        return typeof rawScore === 'number' ? rawScore : 0.85; // Default to high relevance if Colivara found it
                    })(),
                    visualContent: result.visualContent,
                    extractedText: result.extractedText
                });
            } else {
                // If no database document exists (shouldn't happen after zombie filtering), log a warning
                console.warn(`Document with ID ${rawId} not found in database but returned by Colivara search`);
            }
        } else {
            // If no valid document ID found, log for debugging but skip this result
            console.warn('Skipping result with no valid document ID:', {
                documentId: result.documentId,
                id: result.id,
                metadata: result.metadata,
                document: result.document
            });
        }
    }
    return mappedResults;
}
// Function to remove zombie documents (documents that exist in Colivara but not in Prisma)
async function filterZombieDocuments(results) {
    // Create a set of document IDs from the search results, ensuring they are valid strings
    // Extract document IDs from the Colivara results - the ID should come from the metadata of the Colivara document
    const allIds = results.map((result)=>{
        // Try multiple possible locations for the document ID
        return result.documentId || result.id || result.document && result.document.id || result.metadata && result.metadata.documentId || result.document && result.document.metadata && result.document.metadata.documentId || // Nested check
        undefined;
    });
    // Log problematic IDs for debugging
    const problematicIds = allIds.filter((id)=>typeof id !== 'string' || id === undefined || id === null || id.trim() === '' || id.length === 0);
    if (problematicIds.length > 0) {
        console.warn('Found problematic document IDs in search results:', problematicIds);
        console.warn('Sample of search results:', results.slice(0, 3).map((r)=>({
                documentId: r.documentId,
                id: r.id,
                metadata: r.metadata,
                hasDocument: !!r.document,
                documentIdFromDoc: r.document?.id,
                documentIdFromMetadata: r.metadata?.documentId
            })));
    }
    const documentIds = allIds.filter((id)=>{
        // Only include IDs that are valid strings
        return typeof id === 'string' && id.trim() !== '' && id.length > 0;
    });
    // Remove duplicates from documentIds
    const uniqueDocumentIds = [
        ...new Set(documentIds)
    ];
    if (uniqueDocumentIds.length === 0) {
        console.warn('No valid document IDs found in search results');
        return results;
    }
    // Query Prisma to get the actual documents that exist in the database
    const existingDocs = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].document.findMany({
        where: {
            id: {
                in: uniqueDocumentIds
            },
            status: 'ACTIVE' // Only include active documents
        },
        select: {
            id: true
        }
    });
    // Create a Set of existing document IDs for fast lookup
    const existingDocIds = new Set(existingDocs.map((doc)=>doc.id));
    // Filter out results that don't exist in the database (zombie documents)
    return results.filter((result)=>{
        // Try multiple possible locations for the document ID
        const docId = result.documentId || result.id || result.document && result.document.id || result.metadata && result.metadata.documentId || result.document && result.document.metadata && result.document.metadata.documentId || undefined;
        return typeof docId === 'string' && docId.trim() !== '' && existingDocIds.has(docId);
    });
}
// Function to enhance results with visual content for multimodal processing
async function enhanceResultsWithVisualContent(results, query, userId) {
    // For each result, try to add visual content if it's missing but available from Colivara
    const enhancedResults = [];
    for (const result of results){
        // If the result already has visual content, return as is
        if (result.screenshots && result.screenshots.length > 0) {
            enhancedResults.push(result);
            continue;
        }
        // Otherwise, try to fetch visual content from Colivara for this specific document
        try {
            // Try to get visual content for this document from Colivara if available
            // This is a simplified approach - in reality, you'd need to call Colivara to get the visual content
            const enhancedResult = {
                ...result
            };
            // Add any missing visual content fields that might be needed for multimodal processing
            if (!enhancedResult.screenshots) {
                enhancedResult.screenshots = [];
            }
            if (!enhancedResult.visualContent) {
                enhancedResult.visualContent = result.visualContent || null;
            }
            if (!enhancedResult.extractedText) {
                enhancedResult.extractedText = result.extractedText || '';
            }
            enhancedResults.push(enhancedResult);
        } catch (error) {
            console.error(`Error enhancing result with visual content for document ${result.documentId}:`, error);
            // Return the original result if enhancement fails
            enhancedResults.push(result);
        }
    }
    return enhancedResults;
}
async function GET(request) {
    try {
        // Verify authentication
        const authResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$middleware$2f$auth$2d$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireAuth"])(request);
        if ('status' in authResult) {
            return authResult;
        }
        const { user } = authResult;
        // Extract query parameters
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || searchParams.get('query') || '';
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10'))); // Limit to 50 max
        const unitId = searchParams.get('unit') || undefined;
        const category = searchParams.get('category') || undefined;
        const useSemantic = searchParams.get('semantic') === 'true' || true; // Default to true for semantic search
        if (!query) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Query parameter is required'
            }, {
                status: 400
            });
        }
        const userId = user.id;
        // Extract additional parameters for generation
        const generateResponse = searchParams.get('generate') === 'true';
        const generationType = searchParams.get('generationType') || 'text-only'; // 'text-only' or 'multimodal'
        // Check cache first before making expensive API calls
        // For GET requests, there are no filters from request body, so pass an empty object to ensure consistent cache keys
        // Using {} instead of undefined ensures cache key consistency between GET and POST requests
        // Normalize "undefined" strings to proper undefined values
        const normalizedUnitId = unitId === 'undefined' ? undefined : unitId;
        const normalizedCategory = category === 'undefined' ? undefined : category;
        console.log(`Checking cache for query: "${query}", unitId: "${normalizedUnitId}", category: "${normalizedCategory}"`);
        const cachedResult = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$search$2d$cache$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["searchCacheService"].getCachedResult(query, normalizedUnitId, normalizedCategory, {});
        if (cachedResult) {
            console.log(`Cache hit for query: ${query}`);
            console.log(`Cache key used: ${generateCacheKey(query, unitId, category, {})}`);
            // Enhance cached results with visual content if needed for multimodal processing
            let enhancedCachedResults = cachedResult.results;
            if (generateResponse) {
                enhancedCachedResults = await enhanceResultsWithVisualContent(cachedResult.results, query, userId);
            }
            // Create a new cached result object with enhanced results
            const enhancedCachedResult = {
                ...cachedResult,
                results: enhancedCachedResults
            };
            // If we're generating a response, we still need to call the generation service
            // because the generated content might not be cached or might have expired
            if (generateResponse) {
                try {
                    const qwenService = new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$qwen$2d$generation$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"]({
                        model: process.env.QWEN_MODEL || 'qwen/qwen-2.5-vl-72b-instruct'
                    });
                    // For comprehensive queries (like "what trainings/seminars did..."), use more results
                    const isComprehensiveQuery = query.toLowerCase().includes('list') || query.toLowerCase().includes('all') || query.toLowerCase().includes('every') || query.toLowerCase().includes('faculty') || query.toLowerCase().includes('training') || query.toLowerCase().includes('seminar') || query.toLowerCase().includes('attended') || query.toLowerCase().includes('presentation') || query.toLowerCase().includes('research') || query.toLowerCase().includes('what') && query.toLowerCase().includes('training') || query.toLowerCase().includes('what') && query.toLowerCase().includes('seminar') || query.toLowerCase().includes('which') && query.toLowerCase().includes('training') || query.toLowerCase().includes('which') && query.toLowerCase().includes('seminar');
                    // Use more results for comprehensive queries, but make sure we don't exceed what we have
                    const resultsForGeneration = isComprehensiveQuery ? enhancedCachedResult.results.slice(0, Math.min(6, enhancedCachedResult.results.length)) : enhancedCachedResult.results.slice(0, 1); // Use only top result for specific queries
                    const qwenResult = await qwenService.generateInsights(query, resultsForGeneration, userId);
                    // Add generated response to cached results
                    const responseWithGeneration = {
                        ...enhancedCachedResult,
                        generatedResponse: qwenResult.summary,
                        generationType: generationType,
                        sources: qwenResult.sources
                    };
                    // Include the document URL for the relevant document in the response
                    if (enhancedCachedResult.results.length > 0 && responseWithGeneration.sources.length > 0) {
                        // Find the document that corresponds to the source and add its URL
                        const relevantDoc = enhancedCachedResult.results.find((doc)=>doc.documentId === responseWithGeneration.sources[0].documentId);
                        if (relevantDoc) {
                            // Access documentUrl from the relevantDoc if it exists
                            const docWithUrl = relevantDoc;
                            if (docWithUrl.documentUrl) {
                                responseWithGeneration.relevantDocumentUrl = docWithUrl.documentUrl;
                            }
                        }
                    }
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(responseWithGeneration);
                } catch (generationError) {
                    console.error('Qwen generation failed:', generationError);
                    // Return cached results even if generation fails
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(enhancedCachedResult);
                }
            }
            // Return cached result directly if no generation needed
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(enhancedCachedResult);
        }
        console.log(`Cache miss for query: ${query}, making API calls...`);
        console.log(`Cache key that was not found: ${generateCacheKey(query, unitId, category, {})}`);
        if ("TURBOPACK compile-time truthy", 1) {
            // Use Colivara hybrid search
            try {
                const colivaraResults = await colivaraService.performHybridSearch(query, {
                    unitId,
                    category
                }, userId);
                // --- ADD THIS ---
                console.log("🔍 SEARCH RESULTS LOG:", JSON.stringify(colivaraResults, null, 2));
                // ----------------
                // Filter out zombie documents (deleted from Prisma but still in Colivara) first
                const filteredResults = await filterZombieDocuments(colivaraResults.results);
                // Map Colivara results to standard document format using database data
                let mappedResults = await mapColivaraResultsToDocuments(filteredResults);
                // Group and deduplicate results to avoid showing the same document multiple times
                mappedResults = groupResults(mappedResults);
                // Create response object
                let responseResults = mappedResults;
                // If generateResponse is true, limit results to the most relevant document
                if (generateResponse && mappedResults && mappedResults.length > 0) {
                    // Use only the top result for display when generating AI response
                    responseResults = mappedResults.slice(0, 1);
                }
                const response = {
                    results: responseResults,
                    total: responseResults.length,
                    page,
                    limit,
                    totalPages: Math.ceil(mappedResults.length / limit),
                    query: colivaraResults.query,
                    processingTime: colivaraResults.processingTime,
                    searchType: 'hybrid'
                };
                // If generateResponse is true, use Qwen to generate a response based on the search results
                if (generateResponse && mappedResults && mappedResults.length > 0) {
                    // First, get valid document IDs to filter zombie documents
                    const validDocumentIds = new Set(filteredResults.map((result)=>{
                        return result.documentId || result.id || result.document && result.document.id || result.metadata && result.metadata.documentId || result.document && result.document.metadata.documentId || undefined;
                    }).filter((id)=>typeof id === 'string' && id.trim() !== '' && id.length > 0));
                    // 1. MAP (Universal) - This creates the multimodal content needed for Qwen
                    // First, collect all Colivara document IDs to map to database IDs in a single query
                    const colivaraDocIds = colivaraResults.results.filter((item)=>{
                        // Only include items that have a valid document ID that exists in our filtered results
                        const docId = item.documentId || item.id || item.document && item.document.id || item.metadata && item.metadata.documentId || item.document && item.document.metadata && item.document.metadata.documentId || undefined;
                        return typeof docId === 'string' && docId.trim() !== '' && validDocumentIds.has(docId);
                    }).map((item)=>{
                        // Get the Colivara document ID
                        const docData = item.document || item;
                        const metadata = docData.metadata || item.metadata || {};
                        // Validate that the document ID is in proper CUID format before using it
                        const documentId = item.documentId || docData.document_id || docData.id?.toString() || "";
                        const isValidDocumentId = documentId && documentId !== 'undefined' && !documentId.includes('undefined') && /^[a-z0-9]+$/i.test(documentId) && documentId.length >= 20 && documentId.length <= 30;
                        // Extract the original database document ID from metadata if available
                        const originalDocumentId = metadata.documentId || docData.metadata && docData.metadata.documentId || item.metadata?.documentId;
                        const hasValidOriginalId = originalDocumentId && typeof originalDocumentId === 'string' && /^[a-z0-9]+$/i.test(originalDocumentId) && originalDocumentId.length >= 20 && originalDocumentId.length <= 30;
                        return {
                            colivaraDocumentId: isValidDocumentId ? documentId : "",
                            originalDocumentId: hasValidOriginalId ? originalDocumentId : undefined,
                            item: item,
                            index: colivaraResults.results.indexOf(item) // Keep track of the index
                        };
                    }).filter((mapping)=>mapping.colivaraDocumentId); // Only keep items with valid Colivara IDs
                    // Query the database to map Colivara document IDs to database document IDs
                    const colivaraIdsToMap = colivaraDocIds.filter((mapping)=>!mapping.originalDocumentId) // Only map if we don't already have the original DB ID
                    .map((mapping)=>mapping.colivaraDocumentId);
                    let colivaraToDbMap = new Map(); // Initialize as empty map
                    if (colivaraIdsToMap.length > 0) {
                        try {
                            // Query the database to find documents that have these colivaraDocumentIds
                            const dbDocuments = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].document.findMany({
                                where: {
                                    colivaraDocumentId: {
                                        in: colivaraIdsToMap
                                    }
                                },
                                select: {
                                    id: true,
                                    colivaraDocumentId: true
                                }
                            });
                            // Create a map from Colivara ID to database ID
                            colivaraToDbMap = new Map(dbDocuments.map((doc)=>[
                                    doc.colivaraDocumentId,
                                    doc.id
                                ]));
                        } catch (error) {
                            console.error('Error querying database for colivara document IDs:', error);
                        }
                    }
                    // Now map the results with proper document IDs
                    const rawMapped = colivaraResults.results.filter((item)=>{
                        // Only include items that have a valid document ID that exists in our filtered results
                        const docId = item.documentId || item.id || item.document && item.document.id || item.metadata && item.metadata.documentId || item.document && item.document.metadata && item.document.metadata.documentId || undefined;
                        return typeof docId === 'string' && docId.trim() !== '' && validDocumentIds.has(docId);
                    }).map((item, index)=>{
                        const docData = item.document || item;
                        const metadata = docData.metadata || item.metadata || {};
                        // 1. Get Raw Image - Try multiple possible locations for image data
                        let rawImage = docData.img_base64 || item.img_base64 || docData.image || metadata.image || item.visualContent || item.document && item.document.visualContent || item.extracted_content && item.extracted_content.image || null;
                        // 1. Clean the string if it has data URL prefix
                        if (rawImage && typeof rawImage === 'string') {
                            rawImage = rawImage.replace(/^data:image\/[a-z]+;base64,/, "");
                        }
                        // 2. DETECT MIME TYPE FROM DATA (The Fix)
                        // Don't rely on the filename. Look at the first few characters of the code.
                        let mimeType = 'image/jpeg'; // Default
                        if (rawImage && typeof rawImage === 'string') {
                            if (rawImage.startsWith('iVBOR')) {
                                mimeType = 'image/png';
                            } else if (rawImage.startsWith('/9j/')) {
                                mimeType = 'image/jpeg';
                            }
                        }
                        // Helper to find text - Try multiple possible locations for extracted text
                        const txt = docData.text || item.content || metadata.text || item.extractedText || item.document && item.document.extractedText || item.extracted_content && item.extracted_content.text || item.extracted_content && item.extracted_content.content || metadata.extracted_text || "";
                        // SCORE FIX: If Colivara returns 0 but it's the top result, imply relevance based on rank
                        let score = docData.raw_score || docData.score || item.score || 0;
                        if (score === 0 && index === 0) score = 0.99; // Top result is logically relevant
                        if (score === 0 && index === 1) score = 0.80;
                        // IMAGE DEBUG: Log image size and header
                        if (rawImage && typeof rawImage === 'string') {
                            console.log(`📸 IMAGE DEBUG [${metadata.originalName || metadata.title || docData.document_name || "Untitled"}]: Size = ${rawImage.length} characters`);
                            console.log(`   Header check: ${rawImage.substring(0, 30)}...`);
                        } else {
                            console.log(`❌ NO IMAGE found for ${metadata.originalName || metadata.title || docData.document_name || "Untitled"}`);
                        }
                        // Validate that the document ID is in proper CUID format before using it
                        const documentId = item.documentId || docData.document_id || docData.id?.toString() || "";
                        const isValidDocumentId = documentId && documentId !== 'undefined' && !documentId.includes('undefined') && /^[a-z0-9]+$/i.test(documentId) && documentId.length >= 20 && documentId.length <= 30;
                        // Extract the original database document ID from metadata if available
                        const originalDocumentId = metadata.documentId || docData.metadata && docData.metadata.documentId || item.metadata?.documentId;
                        const hasValidOriginalId = originalDocumentId && typeof originalDocumentId === 'string' && /^[a-z0-9]+$/i.test(originalDocumentId) && originalDocumentId.length >= 20 && originalDocumentId.length <= 30;
                        // Try to get the database document ID by looking up the Colivara ID in our map
                        let finalDocumentId = hasValidOriginalId ? originalDocumentId : undefined;
                        if (!finalDocumentId && isValidDocumentId && colivaraToDbMap.has(documentId)) {
                            finalDocumentId = colivaraToDbMap.get(documentId);
                        }
                        // Use the final document ID (database ID) for the URL, fallback to Colivara ID if not found
                        const previewDocumentId = finalDocumentId || (isValidDocumentId ? documentId : undefined);
                        return {
                            documentId: isValidDocumentId ? documentId : "",
                            originalDocumentId: finalDocumentId,
                            title: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$document$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cleanDocumentTitle"])(metadata.originalName || metadata.title || docData.document_name || docData.title && (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$document$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cleanDocumentTitle"])(docData.title) || item.title && (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$document$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cleanDocumentTitle"])(item.title) || "Untitled"),
                            content: txt || "Visual content only",
                            // UI Snippet: Show what we actually found
                            snippet: txt ? txt.substring(0, 150) + "..." : "Visual Document (Table/Chart/Scan)",
                            score: score,
                            pageNumbers: [],
                            document: {},
                            screenshots: rawImage ? [
                                rawImage
                            ] : [],
                            mimeType: mimeType,
                            extractedText: txt,
                            // Include document URL for redirect functionality - use the database document ID if available
                            documentUrl: finalDocumentId ? `/repository/preview/${finalDocumentId}` : undefined
                        };
                    });
                    // 2. DEDUPLICATE (Kill the Zombies)
                    const uniqueMap = new Map();
                    const cleanResults = [];
                    for (const doc of rawMapped){
                        // Use documentId or Title as unique key to prevent duplicates
                        const key = doc.documentId || doc.title;
                        if (!uniqueMap.has(key)) {
                            uniqueMap.set(key, true);
                            cleanResults.push(doc);
                        }
                    }
                    try {
                        // Use generateInsights to get both the response and the sources used
                        // For queries asking for comprehensive lists (like faculty and their trainings), use more results
                        const isComprehensiveQuery = query.toLowerCase().includes('list') || query.toLowerCase().includes('all') || query.toLowerCase().includes('every') || query.toLowerCase().includes('faculty') || query.toLowerCase().includes('training') || query.toLowerCase().includes('seminar') || query.toLowerCase().includes('attended') || query.toLowerCase().includes('presentation') || query.toLowerCase().includes('research') || query.toLowerCase().includes('what') && query.toLowerCase().includes('training') || query.toLowerCase().includes('what') && query.toLowerCase().includes('seminar') || query.toLowerCase().includes('which') && query.toLowerCase().includes('training') || query.toLowerCase().includes('which') && query.toLowerCase().includes('seminar');
                        // Use more results for comprehensive queries, but make sure we don't exceed what we have
                        const resultsForGeneration = isComprehensiveQuery ? cleanResults.slice(0, Math.min(6, cleanResults.length)) : cleanResults.slice(0, 1); // Use only top result for specific queries
                        const qwenResult = await qwenService.generateInsights(query, resultsForGeneration);
                        response.generatedResponse = qwenResult.summary;
                        response.generationType = generationType;
                        // Include all relevant sources for comprehensive queries, otherwise just the top one
                        // Clean the title in the source and ensure we have the database document ID
                        const cleanedSources = qwenResult.sources && qwenResult.sources.length > 0 ? qwenResult.sources.map((source)=>{
                            // Try to get the database document ID from the resultsForGeneration
                            const originalResult = resultsForGeneration.find((result)=>result.documentId === source.documentId || result.originalDocumentId === source.documentId);
                            // Use the database document ID if available, otherwise fallback to the source.documentId
                            const databaseDocumentId = originalResult?.originalDocumentId || source.documentId;
                            return {
                                ...source,
                                title: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$document$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cleanDocumentTitle"])(source.title),
                                documentId: databaseDocumentId // Use the database document ID for clicking
                            };
                        }) : [];
                        response.sources = cleanedSources;
                        // Include the document URL for the relevant document in the response
                        if (cleanResults.length > 0 && response.sources.length > 0) {
                            // Find the document that corresponds to the source and add its URL
                            const relevantDoc = cleanResults.find((doc)=>doc.documentId === response.sources[0].documentId);
                            if (relevantDoc && relevantDoc.documentUrl) {
                                response.relevantDocumentUrl = relevantDoc.documentUrl;
                            } else {
                                // Fallback: try to find document by originalDocumentId if documentId doesn't match
                                const relevantDocFallback = cleanResults.find((doc)=>doc.originalDocumentId === response.sources[0].documentId);
                                if (relevantDocFallback && relevantDocFallback.documentUrl) {
                                    response.relevantDocumentUrl = relevantDocFallback.documentUrl;
                                }
                            }
                        }
                        // Update the response results to include the visual content for caching
                        // This ensures that when the response is cached, it includes the visual content needed for multimodal processing
                        if (cleanResults.length > 0) {
                            // Map the cleanResults (with visual content) to the response results
                            response.results = cleanResults.slice(0, 1); // Use only top result for display when generating AI response
                        }
                    } catch (generationError) {
                        console.error('Qwen generation failed:', generationError);
                    // Don't fail the entire request if generation fails, just return search results
                    }
                }
                // Store results in cache before returning - use empty object for consistency with cache retrieval
                // Before caching, ensure the response results include visual content if it exists
                await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$search$2d$cache$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["searchCacheService"].setCachedResult(query, response, normalizedUnitId, normalizedCategory, {});
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(response);
            } catch (colivaraError) {
                console.error('Colivara search failed, falling back to traditional search:', colivaraError);
                // Fall back to traditional search if Colivara fails
                // Use traditional search
                console.log(`Colivara search failed for query: ${query}, falling back to traditional search`);
                const traditionalResults = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$enhanced$2d$document$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].searchDocuments(query, unitId, category, undefined, userId, page, limit);
                // Format traditional results to match expected response structure
                // Map traditional results to the same format as Colivara results using SuperMapper
                const formattedResults = traditionalResults.documents.map((doc)=>({
                        documentId: doc.id,
                        title: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$document$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cleanDocumentTitle"])(doc.title || doc.fileName || 'Untitled Document'),
                        content: doc.description || '',
                        score: 0.5,
                        pageNumbers: [],
                        documentSection: 'description',
                        confidenceScore: 0.5,
                        snippet: doc.description ? doc.description.substring(0, 200) + '...' : 'No preview available',
                        document: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$super$2d$mapper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].createStandardDocument(doc) // Process through SuperMapper
                    }));
                // Group and deduplicate results to avoid showing the same document multiple times
                const groupedResults = groupResults(formattedResults);
                // Create response object
                const response = {
                    results: groupedResults,
                    total: groupedResults.length,
                    page,
                    limit,
                    totalPages: Math.ceil(groupedResults.length / limit),
                    query,
                    processingTime: 0,
                    searchType: 'traditional'
                };
                // If generateResponse is true, use Qwen to generate a response based on the search results
                if (generateResponse && groupedResults && groupedResults.length > 0) {
                    try {
                        // For traditional search, handle comprehensive queries similarly
                        const isComprehensiveQuery = query.toLowerCase().includes('list') || query.toLowerCase().includes('all') || query.toLowerCase().includes('every') || query.toLowerCase().includes('faculty') || query.toLowerCase().includes('training') || query.toLowerCase().includes('seminar') || query.toLowerCase().includes('attended') || query.toLowerCase().includes('presentation') || query.toLowerCase().includes('research') || query.toLowerCase().includes('what') && query.toLowerCase().includes('training') || query.toLowerCase().includes('what') && query.toLowerCase().includes('seminar') || query.toLowerCase().includes('which') && query.toLowerCase().includes('training') || query.toLowerCase().includes('which') && query.toLowerCase().includes('seminar');
                        // Use more results for comprehensive queries, but make sure we don't exceed what we have
                        const resultsForGeneration = isComprehensiveQuery ? groupedResults.slice(0, Math.min(6, groupedResults.length)) : groupedResults.slice(0, 1); // Use only top result for specific queries
                        // Use generateInsights to get both the response and the sources used
                        const qwenService = new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$qwen$2d$generation$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"]({
                            model: process.env.QWEN_MODEL || 'qwen/qwen-2.5-vl-72b-instruct'
                        });
                        const qwenResult = await qwenService.generateInsights(query, resultsForGeneration, userId);
                        response.generatedResponse = qwenResult.summary;
                        response.generationType = generationType;
                        // Include all relevant sources for comprehensive queries, otherwise just the top one
                        const cleanedSources = qwenResult.sources && qwenResult.sources.length > 0 ? qwenResult.sources.map((source)=>({
                                ...source,
                                title: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$document$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cleanDocumentTitle"])(source.title)
                            })) : [];
                        response.sources = cleanedSources;
                    } catch (generationError) {
                        console.error('Qwen generation failed:', generationError);
                    // Don't fail the entire request if generation fails, just return search results
                    }
                }
                // Store results in cache before returning - use empty object for consistency with cache retrieval
                // Before caching, ensure the response results include visual content if it exists
                await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$search$2d$cache$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["searchCacheService"].setCachedResult(query, response, normalizedUnitId, normalizedCategory, {});
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(response);
            }
        } else //TURBOPACK unreachable
        ;
    } catch (error) {
        console.error('Error in search API:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error during search'
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        // Verify authentication
        const authResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$middleware$2f$auth$2d$middleware$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireAuth"])(request);
        if ('status' in authResult) {
            return authResult;
        }
        const { user } = authResult;
        // Parse request body
        const body = await request.json();
        const { query, unitId, category, filters, page = 1, limit = 10, useSemantic = true, generateResponse = false, generationType = 'text-only' } = body;
        if (!query) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Query parameter is required'
            }, {
                status: 400
            });
        }
        const userId = user.id;
        // Check cache first before making expensive API calls
        // Using filters object directly for POST requests to maintain consistency with request parameters
        // Normalize "undefined" strings to proper undefined values
        const normalizedUnitId = unitId === 'undefined' ? undefined : unitId;
        const normalizedCategory = category === 'undefined' ? undefined : category;
        const normalizedFilters = filters === 'undefined' ? {} : filters;
        console.log(`Checking cache for POST query: "${query}", unitId: "${normalizedUnitId}", category: "${normalizedCategory}", filters:`, normalizedFilters);
        const cachedResult = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$search$2d$cache$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["searchCacheService"].getCachedResult(query, normalizedUnitId, normalizedCategory, normalizedFilters);
        if (cachedResult) {
            console.log(`Cache hit for POST query: ${query}`);
            console.log(`Cache key used: ${generateCacheKey(query, unitId, category, filters)}`);
            // Enhance cached results with visual content if needed for multimodal processing
            let enhancedCachedResults = cachedResult.results;
            if (generateResponse) {
                enhancedCachedResults = await enhanceResultsWithVisualContent(cachedResult.results, query, userId);
            }
            // Create a new cached result object with enhanced results
            const enhancedCachedResult = {
                ...cachedResult,
                results: enhancedCachedResults
            };
            // If we're generating a response, we still need to call the generation service
            // because the generated content might not be cached or might have expired
            if (generateResponse) {
                try {
                    const qwenService = new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$qwen$2d$generation$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"]({
                        model: process.env.QWEN_MODEL || 'qwen/qwen-2.5-vl-72b-instruct'
                    });
                    // For comprehensive queries (like "what trainings/seminars did..."), use more results
                    const isComprehensiveQuery = query.toLowerCase().includes('list') || query.toLowerCase().includes('all') || query.toLowerCase().includes('every') || query.toLowerCase().includes('faculty') || query.toLowerCase().includes('training') || query.toLowerCase().includes('seminar') || query.toLowerCase().includes('attended') || query.toLowerCase().includes('presentation') || query.toLowerCase().includes('research') || query.toLowerCase().includes('what') && query.toLowerCase().includes('training') || query.toLowerCase().includes('what') && query.toLowerCase().includes('seminar') || query.toLowerCase().includes('which') && query.toLowerCase().includes('training') || query.toLowerCase().includes('which') && query.toLowerCase().includes('seminar');
                    // Use more results for comprehensive queries, but make sure we don't exceed what we have
                    const resultsForGeneration = isComprehensiveQuery ? enhancedCachedResult.results.slice(0, Math.min(6, enhancedCachedResult.results.length)) : enhancedCachedResult.results.slice(0, 1); // Use only top result for specific queries
                    const qwenResult = await qwenService.generateInsights(query, resultsForGeneration, userId);
                    // Add generated response to cached results
                    const responseWithGeneration = {
                        ...enhancedCachedResult,
                        generatedResponse: qwenResult.summary,
                        generationType: generationType,
                        sources: qwenResult.sources
                    };
                    // Include the document URL for the relevant document in the response
                    if (enhancedCachedResult.results.length > 0 && responseWithGeneration.sources.length > 0) {
                        // Find the document that corresponds to the source and add its URL
                        const relevantDoc = enhancedCachedResult.results.find((doc)=>doc.documentId === responseWithGeneration.sources[0].documentId);
                        if (relevantDoc) {
                            // Access documentUrl from the relevantDoc if it exists
                            const docWithUrl = relevantDoc;
                            if (docWithUrl.documentUrl) {
                                responseWithGeneration.relevantDocumentUrl = docWithUrl.documentUrl;
                            }
                        }
                    }
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(responseWithGeneration);
                } catch (generationError) {
                    console.error('Qwen generation failed:', generationError);
                    // Return cached results even if generation fails
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(enhancedCachedResult);
                }
            }
            // Return cached result directly if no generation needed
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(enhancedCachedResult);
        }
        console.log(`Cache miss for POST query: ${query}, making API calls...`);
        console.log(`Cache key that was not found: ${generateCacheKey(query, unitId, category, filters)}`);
        let searchResults;
        let searchType = '';
        let processingTime = 0;
        if (useSemantic) {
            // Use Colivara hybrid search
            try {
                const colivaraResults = await colivaraService.performHybridSearch(query, {
                    unitId: normalizedUnitId,
                    category: normalizedCategory,
                    ...normalizedFilters
                }, userId);
                // --- ADD THIS ---
                console.log("🔍 SEARCH RESULTS LOG:", JSON.stringify(colivaraResults, null, 2));
                // ----------------
                searchType = 'hybrid';
                processingTime = colivaraResults.processingTime;
                // Filter out zombie documents (deleted from Prisma but still in Colivara) first
                const filteredResults = await filterZombieDocuments(colivaraResults.results);
                // Map Colivara results to standard document format using database data
                let mappedResults = await mapColivaraResultsToDocuments(filteredResults);
                // Group and deduplicate results to avoid showing the same document multiple times
                mappedResults = groupResults(mappedResults);
                // First, get valid document IDs to filter zombie documents
                const validDocumentIds = new Set(filteredResults.map((result)=>{
                    return result.documentId || result.id || result.document && result.document.id || result.metadata && result.metadata.documentId || result.document && result.document.metadata.documentId || undefined;
                }).filter((id)=>typeof id === 'string' && id.trim() !== '' && id.length > 0));
                // 1. MAP (Universal) - First, collect all Colivara document IDs to map to database IDs in a single query
                const colivaraDocIds = colivaraResults.results.filter((item)=>{
                    // Only include items that have a valid document ID that exists in our filtered results
                    const docId = item.documentId || item.id || item.document && item.document.id || item.metadata && item.metadata.documentId || item.document && item.document.metadata && item.document.metadata.documentId || undefined;
                    return typeof docId === 'string' && docId.trim() !== '' && validDocumentIds.has(docId);
                }).map((item)=>{
                    // Get the Colivara document ID
                    const docData = item.document || item;
                    const metadata = docData.metadata || item.metadata || {};
                    // Validate that the document ID is in proper CUID format before using it
                    const documentId = item.documentId || docData.document_id || docData.id?.toString() || "";
                    const isValidDocumentId = documentId && documentId !== 'undefined' && !documentId.includes('undefined') && /^[a-z0-9]+$/i.test(documentId) && documentId.length >= 20 && documentId.length <= 30;
                    // Extract the original database document ID from metadata if available
                    const originalDocumentId = metadata.documentId || docData.metadata && docData.metadata.documentId || item.metadata?.documentId;
                    const hasValidOriginalId = originalDocumentId && typeof originalDocumentId === 'string' && /^[a-z0-9]+$/i.test(originalDocumentId) && originalDocumentId.length >= 20 && originalDocumentId.length <= 30;
                    return {
                        colivaraDocumentId: isValidDocumentId ? documentId : "",
                        originalDocumentId: hasValidOriginalId ? originalDocumentId : undefined,
                        item: item,
                        index: colivaraResults.results.indexOf(item) // Keep track of the index
                    };
                }).filter((mapping)=>mapping.colivaraDocumentId); // Only keep items with valid Colivara IDs
                // Query the database to map Colivara document IDs to database document IDs
                const colivaraIdsToMap = colivaraDocIds.filter((mapping)=>!mapping.originalDocumentId) // Only map if we don't already have the original DB ID
                .map((mapping)=>mapping.colivaraDocumentId);
                let colivaraToDbMap = new Map(); // Initialize as empty map
                if (colivaraIdsToMap.length > 0) {
                    try {
                        // Query the database to find documents that have these colivaraDocumentIds
                        const dbDocuments = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].document.findMany({
                            where: {
                                colivaraDocumentId: {
                                    in: colivaraIdsToMap
                                }
                            },
                            select: {
                                id: true,
                                colivaraDocumentId: true
                            }
                        });
                        // Create a map from Colivara ID to database ID
                        colivaraToDbMap = new Map(dbDocuments.map((doc)=>[
                                doc.colivaraDocumentId,
                                doc.id
                            ]));
                    } catch (error) {
                        console.error('Error querying database for colivara document IDs:', error);
                    }
                }
                // Now map the results with proper document IDs
                const rawMapped = colivaraResults.results.filter((item)=>{
                    // Only include items that have a valid document ID that exists in our filtered results
                    const docId = item.documentId || item.id || item.document && item.document.id || item.metadata && item.metadata.documentId || item.document && item.document.metadata && item.document.metadata.documentId || undefined;
                    return typeof docId === 'string' && docId.trim() !== '' && validDocumentIds.has(docId);
                }).map((item, index)=>{
                    const docData = item.document || item;
                    const metadata = docData.metadata || item.metadata || {};
                    // 1. Get Raw Image - Try multiple possible locations for image data
                    let rawImage = docData.img_base64 || item.img_base64 || docData.image || metadata.image || item.visualContent || item.document && item.document.visualContent || item.extracted_content && item.extracted_content.image || null;
                    // 1. Clean the string if it has data URL prefix
                    if (rawImage && typeof rawImage === 'string') {
                        rawImage = rawImage.replace(/^data:image\/[a-z]+;base64,/, "");
                    }
                    // 2. DETECT MIME TYPE FROM DATA (The Fix)
                    // Don't rely on the filename. Look at the first few characters of the code.
                    let mimeType = 'image/jpeg'; // Default
                    if (rawImage && typeof rawImage === 'string') {
                        if (rawImage.startsWith('iVBOR')) {
                            mimeType = 'image/png';
                        } else if (rawImage.startsWith('/9j/')) {
                            mimeType = 'image/jpeg';
                        }
                    }
                    // Helper to find text - Try multiple possible locations for extracted text
                    const txt = docData.text || item.content || metadata.text || item.extractedText || item.document && item.document.extractedText || item.extracted_content && item.extracted_content.text || item.extracted_content && item.extracted_content.content || metadata.extracted_text || "";
                    // SCORE FIX: If Colivara returns 0 but it's the top result, imply relevance based on rank
                    let score = docData.raw_score || docData.score || item.score || 0;
                    if (score === 0 && index === 0) score = 0.99; // Top result is logically relevant
                    if (score === 0 && index === 1) score = 0.80;
                    // 2. DETECT MIME TYPE FROM DATA (The Fix)
                    // Don't rely on the filename. Look at the first few characters of the code.
                    let detectedMimeType = 'image/jpeg'; // Default
                    if (rawImage && typeof rawImage === 'string') {
                        if (rawImage.startsWith('iVBOR')) {
                            detectedMimeType = 'image/png';
                        } else if (rawImage.startsWith('/9j/')) {
                            detectedMimeType = 'image/jpeg';
                        }
                    }
                    // IMAGE DEBUG: Log image size and header
                    if (rawImage && typeof rawImage === 'string') {
                        console.log(`📸 IMAGE DEBUG [${metadata.originalName || metadata.title || docData.document_name || "Untitled"}]: Size = ${rawImage.length} characters`);
                        console.log(`   Header check: ${rawImage.substring(0, 30)}...`);
                    } else {
                        console.log(`❌ NO IMAGE found for ${metadata.originalName || metadata.title || docData.document_name || "Untitled"}`);
                    }
                    // Validate that the document ID is in proper CUID format before using it
                    const documentId = item.documentId || docData.document_id || docData.id?.toString() || "";
                    const isValidDocumentId = documentId && documentId !== 'undefined' && !documentId.includes('undefined') && /^[a-z0-9]+$/i.test(documentId) && documentId.length >= 20 && documentId.length <= 30;
                    // Extract the original database document ID from metadata if available
                    const originalDocumentId = metadata.documentId || docData.metadata && docData.metadata.documentId || item.metadata?.documentId;
                    const hasValidOriginalId = originalDocumentId && typeof originalDocumentId === 'string' && /^[a-z0-9]+$/i.test(originalDocumentId) && originalDocumentId.length >= 20 && originalDocumentId.length <= 30;
                    // Try to get the database document ID by looking up the Colivara ID in our map
                    let finalDocumentId = hasValidOriginalId ? originalDocumentId : undefined;
                    if (!finalDocumentId && isValidDocumentId && colivaraToDbMap.has(documentId)) {
                        finalDocumentId = colivaraToDbMap.get(documentId);
                    }
                    // Use the final document ID (database ID) for the URL, fallback to Colivara ID if not found
                    const previewDocumentId = finalDocumentId || (isValidDocumentId ? documentId : undefined);
                    return {
                        documentId: isValidDocumentId ? documentId : "",
                        originalDocumentId: finalDocumentId,
                        title: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$document$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cleanDocumentTitle"])(metadata.originalName || metadata.title || docData.document_name || docData.title && (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$document$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cleanDocumentTitle"])(docData.title) || item.title && (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$document$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cleanDocumentTitle"])(item.title) || "Untitled"),
                        content: txt || "Visual content only",
                        // UI Snippet: Show what we actually found
                        snippet: txt ? txt.substring(0, 150) + "..." : "Visual Document (Table/Chart/Scan)",
                        score: score,
                        pageNumbers: [],
                        document: {},
                        screenshots: rawImage ? [
                            rawImage
                        ] : [],
                        mimeType: detectedMimeType,
                        extractedText: txt,
                        // Include document URL for redirect functionality - use the database document ID if available
                        documentUrl: finalDocumentId ? `/repository/preview/${finalDocumentId}` : undefined
                    };
                });
                // 2. DEDUPLICATE (Kill the Zombies)
                const uniqueMap = new Map();
                const cleanResults = [];
                for (const doc of rawMapped){
                    // Use documentId or Title as unique key to prevent duplicates
                    const key = doc.documentId || doc.title;
                    if (!uniqueMap.has(key)) {
                        uniqueMap.set(key, true);
                        cleanResults.push(doc);
                    }
                }
                // For comprehensive queries (like "what trainings/seminars did..."), use more results
                const isComprehensiveQuery = query.toLowerCase().includes('list') || query.toLowerCase().includes('all') || query.toLowerCase().includes('every') || query.toLowerCase().includes('faculty') || query.toLowerCase().includes('training') || query.toLowerCase().includes('seminar') || query.toLowerCase().includes('attended') || query.toLowerCase().includes('presentation') || query.toLowerCase().includes('research') || query.toLowerCase().includes('what') && query.toLowerCase().includes('training') || query.toLowerCase().includes('what') && query.toLowerCase().includes('seminar') || query.toLowerCase().includes('which') && query.toLowerCase().includes('training') || query.toLowerCase().includes('which') && query.toLowerCase().includes('seminar');
                searchResults = isComprehensiveQuery ? cleanResults.slice(0, 6) : cleanResults.slice(0, 1); // Use more results for comprehensive queries
                // Update the response results to include the visual content for caching
                // This ensures that when the response is cached, it includes the visual content needed for multimodal processing
                if (cleanResults.length > 0) {
                    // Map the cleanResults (with visual content) to the searchResults
                    searchResults = isComprehensiveQuery ? cleanResults.slice(0, 6) : cleanResults.slice(0, 1);
                }
            } catch (colivaraError) {
                console.error('Colivara search failed, falling back to traditional search:', colivaraError);
                // Fall back to traditional search if Colivara fails
                searchType = 'traditional';
                // Use traditional search
                const traditionalResults = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$enhanced$2d$document$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].searchDocuments(query, normalizedUnitId, normalizedCategory, undefined, userId, page, limit);
                // Format traditional results to match expected response structure
                // Map traditional results to the same format as Colivara results using SuperMapper
                const formattedResults = traditionalResults.documents.map((doc)=>({
                        documentId: doc.id,
                        title: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$document$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cleanDocumentTitle"])(doc.title || doc.fileName || 'Untitled Document'),
                        content: doc.description || '',
                        score: 0.5,
                        pageNumbers: [],
                        documentSection: 'description',
                        confidenceScore: 0.5,
                        snippet: doc.description ? doc.description.substring(0, 200) + '...' : 'No preview available',
                        document: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$super$2d$mapper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].createStandardDocument(doc) // Process through SuperMapper
                    }));
                // Group and deduplicate results to avoid showing the same document multiple times
                const groupedResults = groupResults(formattedResults);
                searchResults = groupedResults;
            }
        } else {
            // Use traditional search
            searchType = 'traditional';
            const traditionalResults = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$enhanced$2d$document$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].searchDocuments(query, normalizedUnitId, normalizedCategory, undefined, userId, page, limit);
            // Format traditional results to match expected response structure
            // Map traditional results to the same format as Colivara results using SuperMapper
            const formattedResults = traditionalResults.documents.map((doc)=>({
                    documentId: doc.id,
                    title: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$document$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cleanDocumentTitle"])(doc.title || doc.fileName || 'Untitled Document'),
                    content: doc.description || '',
                    score: 0.5,
                    pageNumbers: [],
                    documentSection: 'description',
                    confidenceScore: 0.5,
                    snippet: doc.description ? doc.description.substring(0, 200) + '...' : 'No preview available',
                    document: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$super$2d$mapper$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].createStandardDocument(doc) // Process through SuperMapper
                }));
            // Group and deduplicate results to avoid showing the same document multiple times
            const groupedResults = groupResults(formattedResults);
            searchResults = groupedResults;
        }
        // If generateResponse is true, use Qwen to generate a response based on the search results
        let generatedResponse = null;
        let sources = [];
        let relevantDocumentUrl = null;
        if (generateResponse && searchResults && searchResults.length > 0) {
            try {
                // For queries asking for comprehensive lists (like faculty and their trainings), use more results
                const isComprehensiveQuery = query.toLowerCase().includes('list') || query.toLowerCase().includes('all') || query.toLowerCase().includes('every') || query.toLowerCase().includes('faculty') || query.toLowerCase().includes('training') || query.toLowerCase().includes('seminar') || query.toLowerCase().includes('attended') || query.toLowerCase().includes('presentation') || query.toLowerCase().includes('research') || query.toLowerCase().includes('what') && query.toLowerCase().includes('training') || query.toLowerCase().includes('what') && query.toLowerCase().includes('seminar') || query.toLowerCase().includes('which') && query.toLowerCase().includes('training') || query.toLowerCase().includes('which') && query.toLowerCase().includes('seminar');
                const resultsForGeneration = isComprehensiveQuery ? searchResults.slice(0, Math.min(6, searchResults.length)) : searchResults.slice(0, 1); // Use only top result for specific queries
                // Use generateInsights to get both the response and the sources used
                const qwenService = new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$qwen$2d$generation$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"]({
                    model: process.env.QWEN_MODEL || 'qwen/qwen-2.5-vl-72b-instruct'
                });
                const qwenResult = await qwenService.generateInsights(query, resultsForGeneration, userId);
                generatedResponse = qwenResult.summary;
                // Include all relevant sources for comprehensive queries, otherwise just the top one
                // Clean the title in the source and ensure we have the database document ID
                const cleanedSources = qwenResult.sources && qwenResult.sources.length > 0 ? qwenResult.sources.map((source)=>{
                    // Try to get the database document ID from the resultsForGeneration
                    const originalResult = resultsForGeneration.find((result)=>result.documentId === source.documentId || result.originalDocumentId === source.documentId);
                    // Use the database document ID if available, otherwise fallback to the source.documentId
                    const databaseDocumentId = originalResult?.originalDocumentId || source.documentId;
                    return {
                        ...source,
                        title: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$document$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cleanDocumentTitle"])(source.title),
                        documentId: databaseDocumentId // Use the database document ID for clicking
                    };
                }) : [];
                sources = cleanedSources;
                // Include the document URL for the relevant document in the response
                if (searchResults.length > 0 && sources.length > 0) {
                    // Find the document that corresponds to the source and add its URL
                    const relevantDoc = searchResults.find((doc)=>doc.documentId === sources[0].documentId);
                    if (relevantDoc && relevantDoc.documentUrl) {
                        relevantDocumentUrl = relevantDoc.documentUrl;
                    } else {
                        // Fallback: try to find document by originalDocumentId if documentId doesn't match
                        const relevantDocFallback = searchResults.find((doc)=>doc.originalDocumentId === sources[0].documentId);
                        if (relevantDocFallback && relevantDocFallback.documentUrl) {
                            relevantDocumentUrl = relevantDocFallback.documentUrl;
                        }
                    }
                }
            } catch (generationError) {
                console.error('Qwen generation failed:', generationError);
                // Don't fail the entire request if generation fails, just return search results
                generatedResponse = null;
            }
        }
        // Return search results with optional generated response
        let responseResults = searchResults;
        // If generateResponse is true, limit results to the most relevant document
        if (generateResponse && searchResults && searchResults.length > 0) {
            // Use only the top result for display when generating AI response
            responseResults = searchResults.slice(0, 1);
        }
        const response = {
            results: responseResults,
            total: responseResults.length,
            page,
            limit,
            totalPages: Math.ceil(searchResults.length / limit),
            query,
            processingTime,
            searchType
        };
        // Include generated response and sources if available
        if (generatedResponse) {
            response.generatedResponse = generatedResponse;
            response.generationType = generationType;
            response.sources = sources;
            // Include the document URL for the relevant document in the response
            if (relevantDocumentUrl) {
                response.relevantDocumentUrl = relevantDocumentUrl;
            }
        }
        // Store results in cache before returning
        // Before caching, ensure the response results include visual content if it exists
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$search$2d$cache$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["searchCacheService"].setCachedResult(query, response, normalizedUnitId, normalizedCategory, normalizedFilters);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(response);
    } catch (error) {
        console.error('Error in search API:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error during search'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__6ede3dc9._.js.map