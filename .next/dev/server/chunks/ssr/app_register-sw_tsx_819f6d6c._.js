module.exports = [
"[project]/app/register-sw.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RegisterServiceWorker",
    ()=>RegisterServiceWorker
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
function RegisterServiceWorker() {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/sw.js").then((registration)=>{
                console.log("[v0] Service Worker registered:", registration);
            }).catch((error)=>{
                console.log("[v0] Service Worker registration failed:", error);
            });
        }
    }, []);
    return null;
}
}),
];

//# sourceMappingURL=app_register-sw_tsx_819f6d6c._.js.map