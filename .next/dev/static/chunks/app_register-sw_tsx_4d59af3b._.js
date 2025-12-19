(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/register-sw.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RegisterServiceWorker",
    ()=>RegisterServiceWorker
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
function RegisterServiceWorker() {
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RegisterServiceWorker.useEffect": ()=>{
            if ("serviceWorker" in navigator) {
                navigator.serviceWorker.register("/sw.js").then({
                    "RegisterServiceWorker.useEffect": (registration)=>{
                        console.log("[v0] Service Worker registered:", registration);
                    }
                }["RegisterServiceWorker.useEffect"]).catch({
                    "RegisterServiceWorker.useEffect": (error)=>{
                        console.log("[v0] Service Worker registration failed:", error);
                    }
                }["RegisterServiceWorker.useEffect"]);
            }
        }
    }["RegisterServiceWorker.useEffect"], []);
    return null;
}
_s(RegisterServiceWorker, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = RegisterServiceWorker;
var _c;
__turbopack_context__.k.register(_c, "RegisterServiceWorker");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_register-sw_tsx_4d59af3b._.js.map