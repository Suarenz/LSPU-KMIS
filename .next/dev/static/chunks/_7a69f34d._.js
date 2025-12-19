(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/badge.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Badge",
    ()=>Badge,
    "badgeVariants",
    ()=>badgeVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-slot/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
;
;
;
const badgeVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])('inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden', {
    variants: {
        variant: {
            default: 'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
            secondary: 'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
            destructive: 'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
            outline: 'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground'
        }
    },
    defaultVariants: {
        variant: 'default'
    }
});
function Badge({ className, variant, asChild = false, ...props }) {
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Slot"] : 'span';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        "data-slot": "badge",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(badgeVariants({
            variant
        }), className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/badge.tsx",
        lineNumber: 38,
        columnNumber: 5
    }, this);
}
_c = Badge;
;
var _c;
__turbopack_context__.k.register(_c, "Badge");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/button.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button,
    "buttonVariants",
    ()=>buttonVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-slot/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
;
;
;
const buttonVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive", {
    variants: {
        variant: {
            default: 'bg-primary text-primary-foreground hover:bg-primary/90',
            destructive: 'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
            outline: 'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
            secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
            link: 'text-primary underline-offset-4 hover:underline'
        },
        size: {
            default: 'h-9 px-4 py-2 has-[>svg]:px-3',
            sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
            lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
            icon: 'size-9',
            'icon-sm': 'size-8',
            'icon-lg': 'size-10'
        }
    },
    defaultVariants: {
        variant: 'default',
        size: 'default'
    }
});
function Button({ className, variant, size, asChild = false, ...props }) {
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Slot"] : 'button';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        "data-slot": "button",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(buttonVariants({
            variant,
            size,
            className
        })),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/button.tsx",
        lineNumber: 52,
        columnNumber: 5
    }, this);
}
_c = Button;
;
var _c;
__turbopack_context__.k.register(_c, "Button");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/card.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Card",
    ()=>Card,
    "CardAction",
    ()=>CardAction,
    "CardContent",
    ()=>CardContent,
    "CardDescription",
    ()=>CardDescription,
    "CardFooter",
    ()=>CardFooter,
    "CardHeader",
    ()=>CardHeader,
    "CardTitle",
    ()=>CardTitle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
;
function Card({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
_c = Card;
function CardHeader({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-header",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 20,
        columnNumber: 5
    }, this);
}
_c1 = CardHeader;
function CardTitle({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-title",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('leading-none font-semibold', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 33,
        columnNumber: 5
    }, this);
}
_c2 = CardTitle;
function CardDescription({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-description",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('text-muted-foreground text-sm', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 43,
        columnNumber: 5
    }, this);
}
_c3 = CardDescription;
function CardAction({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-action",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 53,
        columnNumber: 5
    }, this);
}
_c4 = CardAction;
function CardContent({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-content",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('px-6', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 66,
        columnNumber: 5
    }, this);
}
_c5 = CardContent;
function CardFooter({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-footer",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex items-center px-6 [.border-t]:pt-6', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/card.tsx",
        lineNumber: 76,
        columnNumber: 5
    }, this);
}
_c6 = CardFooter;
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6;
__turbopack_context__.k.register(_c, "Card");
__turbopack_context__.k.register(_c1, "CardHeader");
__turbopack_context__.k.register(_c2, "CardTitle");
__turbopack_context__.k.register(_c3, "CardDescription");
__turbopack_context__.k.register(_c4, "CardAction");
__turbopack_context__.k.register(_c5, "CardContent");
__turbopack_context__.k.register(_c6, "CardFooter");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/data/strategic_plan.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v(JSON.parse("{\"strategic_plan_meta\":{\"university\":\"Laguna State Polytechnic University\",\"period\":\"2025-2029\",\"vision\":\"A transformative university for the sustainable development of Laguna, CALABARZON, and ASEAN Region\",\"total_kras\":22},\"kras\":[{\"kra_id\":\"KRA 1\",\"kra_title\":\"Development of New Curricula Incorporating Emerging Technologies\",\"guiding_principle\":\"Excellence and Relevance in Education\",\"initiatives\":[{\"id\":\"KRA1-KPI1\",\"key_performance_indicator\":{\"outputs\":\"enhanced curricula integrated with emerging technologies (e.g., AI, IoT, drone technology, and biotechnology) into the agriculture, fisheries, forestry, engineering, medicine, law, arts, IT and education program)\",\"outcomes\":\"students equipped with cutting-edge skills and knowledge, increasing their employability and ability to contribute to modern agricultural and fisheries practices\"},\"strategies\":[\"conduct a needs assessment to identify gaps in the current curricula and opportunities for incorporating emerging technologies\",\"collaborate with industry experts, tech companies, and research institutions to design relevant course content\",\"pilot new courses and gather feedback from students and faculty to refine content and delivery methods\"],\"programs_activities\":[\"organize workshops with faculty members to assess the current curriculum\",\"initiate partnerships with relevant tech companies and research institutions to identify trends in emerging technologies\",\"form content development teams comprising faculty and industry partners to create course materials integrating emerging technologies\"],\"responsible_offices\":[\"Office of the Vice President for Academic Affairs\",\"Curriculum and Instruction Development Unit\",\"Deans\"],\"targets\":{\"type\":\"milestone\",\"timeline_data\":[{\"year\":2025,\"target_value\":\"Curriculum Updated\"},{\"year\":2026,\"target_value\":\"Curriculum Updated\"},{\"year\":2027,\"target_value\":\"Curriculum Updated\"},{\"year\":2028,\"target_value\":\"Curriculum Updated\"},{\"year\":2029,\"target_value\":\"Curriculum Updated\"}]}},{\"id\":\"KRA1-KPI2\",\"key_performance_indicator\":{\"outputs\":\"training sessions for faculty on the latest technological advancements and their applications in these fields\",\"outcomes\":\"enhanced faculty expertise in emerging technologies, leading to improved teaching quality and program relevance\"},\"strategies\":[\"collaborate with industry experts, tech companies and research institutions to design relevant course content\",\"pilot new courses and gather feedback from students and faculty to refine content and delivery methods\"],\"programs_activities\":[\"organize specialized training workshops on emerging technologies relevant to your curricula.\"],\"responsible_offices\":[\"Office of the Vice President for Academic Affairs\",\"HRMO\",\"Deans\",\"Faculty\",\"Curriculum and Instruction Development Unit\"],\"targets\":{\"type\":\"count\",\"unit_basis\":\"per program/college\",\"timeline_data\":[{\"year\":2025,\"target_value\":1},{\"year\":2026,\"target_value\":1},{\"year\":2027,\"target_value\":1},{\"year\":2028,\"target_value\":1},{\"year\":2029,\"target_value\":1}]}}]},{\"kra_id\":\"KRA 2\",\"kra_title\":\"Market-Driven Program Design and Implementation\",\"guiding_principle\":\"Excellence and Relevance in Education\",\"initiatives\":[{\"id\":\"KRA2-KPI1\",\"key_performance_indicator\":{\"outputs\":\"establishment of advisory boards comprising industry leaders and alumni, and community stakeholders to provide insights and feedback on program development\",\"outcomes\":\"programs that align closely with market demands, ensuring graduates possess the skills and knowledge required by employers\"},\"strategies\":[\"form advisory boards for agriculture, fisheries, and technology programs to facilitate ongoing dialogue with industry stakeholders\"],\"programs_activities\":[\"establish formal partnerships with industry leaders for internship placements\"],\"responsible_offices\":[\"Office of the Vice President for Academic Affairs\",\"Deans\",\"Alumni Affairs and Placement Services, Curriculum and Instruction Development Unit\"],\"targets\":{\"type\":\"milestone\",\"timeline_data\":[{\"year\":2025,\"target_value\":\"Advisory Board Established\"},{\"year\":2026,\"target_value\":\"Advisory Board Established\"},{\"year\":2027,\"target_value\":\"Advisory Board Established\"},{\"year\":2028,\"target_value\":\"Advisory Board Established\"},{\"year\":2029,\"target_value\":\"Advisory Board Established\"}]}},{\"id\":\"KRA2-KPI2\",\"key_performance_indicator\":{\"outputs\":\"regular updates to curricula based on market trends and industry needs assessments\",\"outcomes\":\"increased enrollment and retention rates as programs gain a reputation for relevance and quality\"},\"strategies\":[\"integrate experiential learning opportunities, such as internships and cooperative education, to provide students with real-world experience\",\"regularly review and update program curricula  based on feedback from advisory boards and market research findings\"],\"programs_activities\":[\"establish a framework to regularly assess program outcomes, student employment rates, and industry satisfaction\",\"create a feedback system involving students, alumni, and industry stakeholders\"],\"responsible_offices\":[\"Office of the Vice President for Academic Affairs\",\"Deans\",\"Alumni Affairs and Placement Services, Curriculum and Instruction Development Unit\"],\"targets\":{\"type\":\"milestone\",\"timeline_data\":[{\"year\":2025,\"target_value\":\"Curriculum Review Completed\"},{\"year\":2026,\"target_value\":\"Curriculum Review Completed\"},{\"year\":2027,\"target_value\":\"Curriculum Review Completed\"},{\"year\":2028,\"target_value\":\"Curriculum Review Completed\"},{\"year\":2029,\"target_value\":\"Curriculum Review Completed\"}]}}]},{\"kra_id\":\"KRA 3\",\"kra_title\":\"Quality and Relevance of Instruction\",\"guiding_principle\":\"Excellence and Relevance in Education\",\"initiatives\":[{\"id\":\"KRA3-KPI1\",\"key_performance_indicator\":{\"outputs\":\"above national passing rate for all board programs\",\"outcomes\":\"improved average percentage of passers in the licensure examination above the national passing percentage\"},\"strategies\":[\"establish an institutional in-house review center\",\"strict implementation of admission and retention policies\",\"awarding of incentives and recognition to top successful examinees\"],\"programs_activities\":[\"in-house review programs\",\"incentive grant program\"],\"responsible_offices\":[\"Office of the Vice President for Academic Affairs\",\"Deans\",\"Quality Assurance Unit\"],\"targets\":{\"type\":\"text_condition\",\"timeline_data\":[{\"year\":2025,\"target_value\":\"Above National Passing Rate\"},{\"year\":2026,\"target_value\":\"Above National Passing Rate\"},{\"year\":2027,\"target_value\":\"Above National Passing Rate\"},{\"year\":2028,\"target_value\":\"Above National Passing Rate\"},{\"year\":2029,\"target_value\":\"Above National Passing Rate\"}]}},{\"id\":\"KRA3-KPI2\",\"key_performance_indicator\":{\"outputs\":\"percentage of OJT students in related industries/institutions\",\"outcomes\":\"enhanced practical learning of students\"},\"strategies\":[\"promote student welfare through relevant programs and support services\"],\"programs_activities\":[\"host events such as career fairs, industry panels, or networking sessions\",\"regularly assess the effectiveness of OJT programs through feedback from students, industry partners, and academic staff\",\"offer incentives or recognition for industry partners who provide OJT opportunities\"],\"responsible_offices\":[\"Office of the Vice President for Academic Affairs\",\"Deans\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2025,\"target_value\":80},{\"year\":2026,\"target_value\":83},{\"year\":2027,\"target_value\":85},{\"year\":2028,\"target_value\":88},{\"year\":2029,\"target_value\":90}]}},{\"id\":\"KRA3-KPI3\",\"key_performance_indicator\":{\"outputs\":\"100% compliance of Center of Flexible Learning\",\"outcomes\":\"resilience\"},\"strategies\":[\"provide market-driven programs through responsive, relevant, and comprehensive curricula\"],\"programs_activities\":[\"monitoring of the preparation and submission of SLMs\"],\"responsible_offices\":[\"Office of the Vice Presidents\",\"Information Communication and Technology Services\",\"Curriculum Instruction Development\",\"Office of the Campus Directors\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2029,\"target_value\":100}]}},{\"id\":\"KRA3-KPI4\",\"key_performance_indicator\":{\"outputs\":\"number of courses integrated with extension learning technologies\",\"outcomes\":\"extended reach to provide quality service\"},\"strategies\":[\"build partnerships with local organizations, government agencies, and other stakeholders to enhance program reach and impact\",\"leverage the institution’s expertise and resources to design and implement programs that address community needs\"],\"programs_activities\":[\"form MOU/MOA with community groups\",\"use faculty and staff expertise in relevant fields to create programs that capitalize on the institution’s strengths\"],\"responsible_offices\":[\"Office of the Vice President for Academic Affairs\",\"Research, Extension and Innovation\",\"Deans\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":70},{\"year\":2026,\"target_value\":75},{\"year\":2027,\"target_value\":80},{\"year\":2028,\"target_value\":85},{\"year\":2029,\"target_value\":90}]}},{\"id\":\"KRA3-KPI5\",\"key_performance_indicator\":{\"outputs\":\"achieve 75% employment or entrepreneurial engagement rate among graduates 2 years after graduation, including those who start their own business or create employment opportunities (employment, entrepreneurial ventures)\",\"outcomes\":\"develop LSPU graduates who demonstrate high employability rate and are in demand across various sectors, while also functioning as key contributors to societal and economic development\"},\"strategies\":[\"enhance curriculum and program relevance\",\"strengthen career services and job\",\"alumni and employer feedback loop\"],\"programs_activities\":[\"annual graduate employability survey\",\"job fair and career expo\",\"alumni career support network\"],\"responsible_offices\":[\"Office of the Vice President for Academic Affairs\",\"Alumni Affairs and Placement Services\",\"Deans\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2025,\"target_value\":73},{\"year\":2026,\"target_value\":73},{\"year\":2027,\"target_value\":74},{\"year\":2028,\"target_value\":74},{\"year\":2029,\"target_value\":75}]}},{\"id\":\"KRA3-KPI6\",\"key_performance_indicator\":{\"outputs\":\"continuous tracer studies that assess graduates' employability, mobility, entrepreneurial activities and international career opportunities\",\"outcomes\":[\" increased understanding of graduate employability and career trajectories leading to data-driven program improvements\",\"alumni engagement strengthened\"]},\"strategies\":[\"regularly conduct of tracer study, with integration of mobility and international opportunities\",\"graduate engagement and follow-up\"],\"programs_activities\":[\"graduate support career services development\",\"development of Alumni Management System\",\"tracer studies and graduate career mobility tracking\"],\"responsible_offices\":[\"Office of the Vice President for Academic Affairs\",\"Alumni Affairs and Placement Services\",\"Research and Development Services\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":1},{\"year\":2026,\"target_value\":1},{\"year\":2027,\"target_value\":1},{\"year\":2028,\"target_value\":1},{\"year\":2029,\"target_value\":1}]}},{\"id\":\"KRA3-KPI7\",\"key_performance_indicator\":{\"outputs\":\"percentage of compliance with IA-based instrument for other campuses\",\"outcomes\":[\"increased compliance rates\",\"standardized processes\"]},\"strategies\":[\"training and awareness\",\"standardization\",\"monitoring and reporting\",\"feedback and improvement\"],\"programs_activities\":[\"compliance workshops\",\"audit simulations\",\"compliance audits\",\"feedback sessions\"],\"responsible_offices\":[\"Office of the Vice Presidents\",\"Quality Assurance Unit\",\"Office of the Campus Directors\"],\"targets\":{\"type\":\"milestone\",\"timeline_data\":[{\"year\":2028,\"target_value\":\"100% compliance Institutional Accreditation all campus\"}]}},{\"id\":\"KRA3-KPI8\",\"key_performance_indicator\":{\"outputs\":\"percentage of compliance with SUC Level IV based on SUC Levelling  Instrument\",\"outcomes\":[\"increased compliance rates\",\"standardized processes\"]},\"strategies\":[\"training and awareness\",\"standardization\",\"monitoring and reporting\",\"feedback and improvement\"],\"programs_activities\":[\"compliance workshops\",\"audit simulations\",\"compliance audits\",\"feedback sessions\"],\"responsible_offices\":[\"Office of the Vice Presidents\",\"Quality Assurance Unit\",\"Office of the Campus Directors\"],\"targets\":{\"type\":\"milestone\",\"timeline_data\":[{\"year\":2029,\"target_value\":\"SUC Level IV Compliance\"}]}},{\"id\":\"KRA3-KPI9\",\"key_performance_indicator\":{\"outputs\":\"programs accredited/candidate (Level 1 - 4)\",\"outcomes\":\"enhanced quality of education  and graduates’ competence\"},\"strategies\":[\"regularly review and update curricula to align with industry standards and technological advancements\",\"implement robust internal and external quality assurance mechanisms\",\"foster a culture of continuous improvement among faculty and staff\"],\"programs_activities\":[\"curriculum enhancement workshops\",\"faculty training and development programs\",\"research and innovation initiatives\",\"industry partnerships and internships\",\"student development programs\",\"community engagement and extension services\"],\"responsible_offices\":[\"Office of the Vice President for Academic Affairs\",\"Quality Assurance Unit\",\"Deans\",\"Curriculum and Instruction Development Unit\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2029,\"target_value\":100,\"note\":\"accredited programs\"}]}},{\"id\":\"KRA3-KPI10\",\"key_performance_indicator\":{\"outputs\":\"COD/COE program\",\"outcomes\":[\"compliance rates\",\"standardized processes\"]},\"strategies\":[\"training and awareness\",\"standardization\",\"monitoring and reporting\",\"feedback and improvement\",\"benchmark on top universities\"],\"programs_activities\":[\"assess the current state of the program and perform a gap analysis to identify areas that need improvement\",\"revise the curriculum, course content, and program structure\",\"ensure that faculty members meet the required qualifications\"],\"responsible_offices\":[\"Office of the Vice President for Academic Affairs\",\"Deans\",\"Quality Assurance Unit\",\"Curriculum and Instruction Development Unit\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2029,\"target_value\":1,\"note\":\"1 new COD/COE\"}]}},{\"id\":\"KRA3-KPI11\",\"key_performance_indicator\":{\"outputs\":\"percentage of developed instructional material (IM) per program\",\"outcomes\":\"increased quantity and quality of IM\"},\"strategies\":[\"professional development: provide ongoing training for teachers on creating high-quality instructional materials\",\"feedback mechanisms: Implement systems for regular feedback on instructional materials from both teachers and students.\"],\"programs_activities\":[\"workshops and training sessions: regular workshops focused on instructional design, use of digital tools, and curriculum alignment\",\"peer review sessions: Scheduled sessions where teachers can review and provide feedback on each other’s materials.\"],\"responsible_offices\":[\"Office of the Vice President for Academic Affairs\",\"Deans\",\"Quality Assurance Unit\",\"Curriculum and Instruction Development Unit\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2025,\"target_value\":30},{\"year\":2026,\"target_value\":33},{\"year\":2027,\"target_value\":35},{\"year\":2028,\"target_value\":38},{\"year\":2029,\"target_value\":40}]}},{\"id\":\"KRA3-KPI12\",\"key_performance_indicator\":{\"outputs\":\"ISO certification for Management Systems for Educational Organizations (ISO 21001:2018) and Quality Management System (ISO 9001:2015))\",\"outcomes\":[\"increased compliance rates\",\"standardized processes\"]},\"strategies\":[\"training and awareness\",\"standardization\",\"monitoring and reporting\",\"feedback and improvement\"],\"programs_activities\":[\"compliance workshops\",\"audit simulations\",\"compliance audits\",\"feedback sessions\"],\"responsible_offices\":[\"Office of the Vice Presidents\",\"Quality Assurance Unit\",\"Office of the Campus Directors\"],\"targets\":{\"type\":\"milestone\",\"timeline_data\":[{\"year\":2025,\"target_value\":\"Recertification\"},{\"year\":2026,\"target_value\":\"Recertification\"},{\"year\":2027,\"target_value\":\"Recertification\"},{\"year\":2028,\"target_value\":\"Recertification\"},{\"year\":2029,\"target_value\":\"Recertification\"}]}},{\"id\":\"KRA3-KPI13\",\"key_performance_indicator\":{\"outputs\":\"number of completed GAD-initiated programs every year\",\"outcomes\":\"4 activities/year\"},\"strategies\":[\"conduct trainings, seminars, fora, focus group discussions\"],\"programs_activities\":[\"trainings\",\"seminars\",\"fora\",\"focus group discussions\"],\"responsible_offices\":[\"Offices of the Vice President\",\"Gender and Development\"],\"targets\":{\"type\":\"count\",\"unit_basis\":\"per year\",\"timeline_data\":[{\"year\":2025,\"target_value\":4},{\"year\":2026,\"target_value\":4},{\"year\":2027,\"target_value\":4},{\"year\":2028,\"target_value\":4},{\"year\":2029,\"target_value\":4}]}},{\"id\":\"KRA3-KPI14\",\"key_performance_indicator\":{\"outputs\":\"percentage of faculty and staff who attended GAD mainstreaming and issue\",\"outcomes\":\"95% faculty and staff attended the GAD mainstreaming and issue\"},\"strategies\":[\"conduct of training/seminar on GAD mainstreaming\"],\"programs_activities\":[\"trainings\",\"seminars\",\"fora\",\"focus group discussions\"],\"responsible_offices\":[\"HRMO\",\"Gender and Development\",\"Offices of the Vice President\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2025,\"target_value\":95},{\"year\":2026,\"target_value\":95},{\"year\":2027,\"target_value\":95},{\"year\":2028,\"target_value\":95},{\"year\":2029,\"target_value\":95}]}},{\"id\":\"KRA3-KPI15\",\"key_performance_indicator\":{\"outputs\":\"number of enrolled foreign students\",\"outcomes\":[\"increased number of foreign students graduates across curriculum and employment after a year or two of graduation\",\"students’ very satisfactory evaluation\"]},\"strategies\":[\"offering English as a Foreign Language (EFL) as a coursework to foreign students who come for cultural immersion and summer camps, and freshmen who will enroll in any curricular program\",\"offering lower tuition and other related fees\",\"offering or assisting students in finding scholarships\",\"offering ODL\"],\"programs_activities\":[\"enrolment of students\",\"orientation for foreign students\",\"application or renewal of visa and other Bureau of Immigration & DFA documents\",\"development of Instructional materials\",\"educational tours\",\"close monitoring of students’ performance\"],\"responsible_offices\":[\"Office of the Vice President for Academic Affairs\",\"International/Local Affairs\",\"Deans\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":5,\"note\":\"new students per year\"},{\"year\":2026,\"target_value\":5,\"note\":\"new students per year\"}]}},{\"id\":\"KRA3-KPI16\",\"key_performance_indicator\":{\"outputs\":\"number of Student enrolled in CHED/RDC Priority programs\",\"outcomes\":\"increased the number of student enrolled in CHED/RDC priority programs\"},\"strategies\":[\"enhanced outreach and awareness campaigns\",\"program enhancement and innovation\",\"enhancing student support services\"],\"programs_activities\":[\"conduct of outreach and awareness campaign\",\"regularly update and enhance the curriculum of priority programs\",\"provide strong academic advising services, mentoring, monitoring and counseling\"],\"responsible_offices\":[\"Office of the Vice President for Academic Affairs\",\"International/Local Affairs\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2025,\"target_value\":55},{\"year\":2026,\"target_value\":57},{\"year\":2027,\"target_value\":58},{\"year\":2028,\"target_value\":60},{\"year\":2029,\"target_value\":62}]}}]},{\"kra_id\":\"KRA 4\",\"kra_title\":\"College and Office International Activities and Projects\",\"guiding_principle\":\"Excellence and Relevance in Education\",\"initiatives\":[{\"id\":\"KRA4-KPI1\",\"key_performance_indicator\":{\"outputs\":\"number of MOUs/MOAs per year with top 1000 World Universities\",\"outcomes\":\"increased number of international partners including one (1 per year) polytechnic university in the ASEAN region and/or international university among the top 1000 universities in the world\"},\"strategies\":[\"invite prospective international university\",\"renew old partnerships with performing universities\",\"promote LSPU through social media\",\"international conferences attendees ROI\"],\"programs_activities\":[\"benchmarking\",\"employees’ participation in international conferences\",\"constant and continued communications with the prospective partner\",\"endorsement to internal and external Offices & BOR\",\"signing\"],\"responsible_offices\":[\"Office of the Vice President for Academic Affairs\",\"International/Local Affairs\",\"Deans/Colleges\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":2},{\"year\":2026,\"target_value\":2},{\"year\":2027,\"target_value\":2},{\"year\":2028,\"target_value\":2},{\"year\":2029,\"target_value\":2}]}},{\"id\":\"KRA4-KPI2\",\"key_performance_indicator\":{\"outputs\":\"internationalization accomplishments (per college/office)\",\"outcomes\":[\"recognition from national and international award-giving organizations\",\"impact on the community\",\"secured position in World University Ranking\"]},\"strategies\":[\"coordinate university-wide international initiatives to ensure integration and coordination across the University’s international partnerships, collaborations, programs, and services\"],\"programs_activities\":[\"monitoring of international activities project\",\"regular meetings with deans & directors\",\"public promotions of internationalization accomplishments\"],\"responsible_offices\":[\"Office of the Vice President for Academic Affairs\",\"International Local/Affairs\",\"Information Office\",\"Deans\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":1},{\"year\":2026,\"target_value\":2},{\"year\":2027,\"target_value\":3},{\"year\":2028,\"target_value\":4},{\"year\":2029,\"target_value\":5}]}}]},{\"kra_id\":\"KRA 5\",\"kra_title\":\"Research, Extension, and Innovation Productivity\",\"guiding_principle\":\"Advancing Research Excellence and Community Engagement\",\"initiatives\":[{\"id\":\"KRA5-KPI1\",\"key_performance_indicator\":{\"outputs\":\"number of IP (patent, UM, copyrights, etc.) generated\",\"outcomes\":\"IP Protections and IP registrations of the university researches\"},\"strategies\":[\"assessment of researches for IP registration for potential commercialization\"],\"programs_activities\":[\"conduct of IP foundation courses, patent search trainings and patent draft training\"],\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"SAO Finance\",\"Budget and Finance\",\"Center of Innovation and Emerging Technologies\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":47},{\"year\":2026,\"target_value\":50},{\"year\":2027,\"target_value\":53},{\"year\":2028,\"target_value\":56},{\"year\":2029,\"target_value\":59}]}},{\"id\":\"KRA5-KPI2\",\"key_performance_indicator\":{\"outputs\":\"number of income-generating research-based products/outputs\",\"outcomes\":\"establish more innovative research (faculty and students) for income generation of the university, continuity of technology commercialization\"},\"strategies\":[\"secure income generating projects to strengthen industry-academic partnerships through collaboration\",\"focus on market-relevant research to identify gaps, trends, and opportunities to addressed through research-based products\",\"enhance technology transfer offices to support researchers in the commercialization process, including patenting, licensing, and marketing\"],\"programs_activities\":[\"technology transfer programs that focused on transferring research innovations, including support for patenting, licensing, and partnership development\",\"incubation and acceleration programs awareness campaign\"],\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"SAO Finance\",\"Budget and Finance\",\"Center of Innovation and Emerging Technologies\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":6},{\"year\":2026,\"target_value\":8},{\"year\":2027,\"target_value\":10},{\"year\":2028,\"target_value\":12},{\"year\":2029,\"target_value\":14}]}},{\"id\":\"KRA5-KPI3\",\"key_performance_indicator\":{\"outputs\":\"number of spinoff/start-up companies established for faculty and students\",\"outcomes\":[\"commercialization journey will encourage faculty researchers to enroll in the incubation process\",\"spin-off companies will help the community develop entrepreneurs to improved their livelihood and to improve economic status\"]},\"strategies\":[\"promote a culture of innovation – foster a culture that encourages innovation and risktaking by celebrating successful start-ups and promoting entrepreneurial success stories\",\"craft policy advocacy that supports start-ups and spin-offs, such as tax incentives, research funding, and supportive regulatory frameworks\",\"enhance IP policy manual on incentives/benefits for technology developers/creators\"],\"programs_activities\":[\"value formation through training and development for sustainability of entrepreneurial mindset\",\"offer entrepreneurship courses through seminars and workshop, business development, and commercialization for faculty and students\",\"Commercialization Assistance: Provide resources and support for turning research findings into commercial products\"],\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"SAO Finance\",\"Budget Office\",\"Center of Innovation and Emerging Technologies\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":2},{\"year\":2026,\"target_value\":3},{\"year\":2027,\"target_value\":4},{\"year\":2028,\"target_value\":5},{\"year\":2029,\"target_value\":6}]}},{\"id\":\"KRA5-KPI4\",\"key_performance_indicator\":{\"outputs\":\"number of research-based programs/projects delivered for extension to the community\",\"outcomes\":\"enhanced local knowledge and 3-5 year sustainable solutions addressing community needs\"},\"strategies\":[\"conduct in-house review of PPAs\",\"enhance REI funding and support\"],\"programs_activities\":[\"annual REI proposal writeshop\",\"monitoring of on-going PPAs\"],\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"Extension and Training Services\",\"Research and Development Services\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":3},{\"year\":2026,\"target_value\":4},{\"year\":2027,\"target_value\":5},{\"year\":2028,\"target_value\":6},{\"year\":2029,\"target_value\":7}]}},{\"id\":\"KRA5-KPI5\",\"key_performance_indicator\":{\"outputs\":\"number of faculty members with national/international awards and recognition\",\"outcomes\":\"personal and institutional prestige gained and will establish the credibility that are acknowledged by the community\"},\"strategies\":\"support for REI professional development and strengthen collaboration and partnerships with international and national organizations\",\"programs_activities\":\"nominations to REI-related award recognitions\",\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"SAO Finance\",\"Budget Office\",\"Research, Extension and Innovation Unit\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":1},{\"year\":2026,\"target_value\":1},{\"year\":2027,\"target_value\":2},{\"year\":2028,\"target_value\":2},{\"year\":2029,\"target_value\":2}]}},{\"id\":\"KRA5-KPI6\",\"key_performance_indicator\":{\"outputs\":\"number of institutional awards and recognition\",\"outcomes\":\"institutional prestige gained and will help leverage to get more funds through the trust of the funding agencies\"},\"strategies\":\"partnerships with international and national institution and organizations\",\"programs_activities\":[\"continuous effort with IP filling and registration\",\"excellent service of REI unit\"],\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"Research, Extension and Innovation Unit\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":1},{\"year\":2026,\"target_value\":1},{\"year\":2027,\"target_value\":2},{\"year\":2028,\"target_value\":2},{\"year\":2029,\"target_value\":2}]}},{\"id\":\"KRA5-KPI7\",\"key_performance_indicator\":{\"outputs\":\"number of research based policy recommendations on Fisheries, Agriculture, Academic, Gender & Development, and other emerging disciplines\",\"outcomes\":\"data-driven decisions and policies\"},\"strategies\":\"collaboration with government and industry stakeholders\",\"programs_activities\":\"conduct of trainings for policy making and establishment of a compendium for policy briefs\",\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"Research and Development Services\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":2},{\"year\":2026,\"target_value\":2},{\"year\":2027,\"target_value\":2},{\"year\":2028,\"target_value\":3},{\"year\":2029,\"target_value\":3}]}},{\"id\":\"KRA5-KPI8\",\"key_performance_indicator\":{\"outputs\":\"number of university refereed research journals\",\"outcomes\":\"enhancing the institution's academic reputation and contributing to global knowledge dissemination\"},\"strategies\":[\"promotion of the journal to attract highquality submissions\",\"given incentives to faculty researchers who published, and incentives to faculty serving as evaluators\"],\"programs_activities\":\"establish a peer-review system and support for a dedicated editorial board and review panel\",\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"Research and Development Services\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":1},{\"year\":2026,\"target_value\":1},{\"year\":2027,\"target_value\":1},{\"year\":2028,\"target_value\":1},{\"year\":2029,\"target_value\":1}]}},{\"id\":\"KRA5-KPI9\",\"key_performance_indicator\":{\"outputs\":\"number of faculty research outputs\",\"outcomes\":\"greater contribution to academic advancements and practical solutions for societal challenges\"},\"strategies\":\"deliver quality programs, projects and activities that will lead to extension, commercialization, and policy recommendations\",\"programs_activities\":\"monitoring of internally and externally funded research\",\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"SAO Finance\",\"Budget Office\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":150},{\"year\":2026,\"target_value\":152},{\"year\":2027,\"target_value\":155},{\"year\":2028,\"target_value\":157},{\"year\":2029,\"target_value\":160}]}},{\"id\":\"KRA5-KPI10\",\"key_performance_indicator\":{\"outputs\":\"number of research findings presented in reputable conferences\",\"outcomes\":\"increased visibility and recognition of research, fostering collaborations and advancing knowledge through presentations at reputable conferences\"},\"strategies\":\"provide research presentation grants and target networking opportunities\",\"programs_activities\":[\"endorse faculty researchers to international and national conferences\",\"conduct institutional REI conferences\"],\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"Research and Development Services\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":15},{\"year\":2026,\"target_value\":16},{\"year\":2027,\"target_value\":20},{\"year\":2028,\"target_value\":20},{\"year\":2029,\"target_value\":24}]}}]},{\"kra_id\":\"KRA 6\",\"kra_title\":\"Research, Extension, and Innovation Linkages\",\"guiding_principle\":\"Advancing Research Excellence and Community Engagement\",\"initiatives\":[{\"id\":\"KRA6-KPI1\",\"key_performance_indicator\":{\"outputs\":\"number of active partnerships with LGUs, industries, NGOs, NGAs, SMEs and other stakeholders\",\"outcomes\":[\"strong linkages with partner agencies\",\"enhance existing relations with community and partner agencies, locally and internationally\"]},\"strategies\":[\"increase and intensify linkages with partner institutions, community stakeholders and industries, local and international, for REI PPAs\"],\"programs_activities\":[\"conduct of needs assessments with potential partner agencies\",\"conduct of PPAs requested by partner agencies\"],\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"Research, Extension and Innovation Unit\"],\"targets\":{\"type\":\"count\",\"unit_basis\":\"total active\",\"timeline_data\":[{\"year\":2025,\"target_value\":120,\"note\":\"10 existing + 20 new\"},{\"year\":2026,\"target_value\":160},{\"year\":2027,\"target_value\":220},{\"year\":2028,\"target_value\":300},{\"year\":2029,\"target_value\":400}]}},{\"id\":\"KRA6-KPI2\",\"key_performance_indicator\":{\"outputs\":\"number of MOA/MOU with established or organized associations\",\"outcomes\":\"shared resources\"},\"strategies\":[\"forge MOA/MOU with all the partner agencies\"],\"programs_activities\":[\"conduct of REI PPAs with partner agencies\"],\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"Research, Extension and Innovation Unit\"],\"targets\":{\"type\":\"count\",\"unit_basis\":\"total active\",\"timeline_data\":[{\"year\":2025,\"target_value\":100,\"note\":\"80 existing + 20 new\"},{\"year\":2026,\"target_value\":130},{\"year\":2027,\"target_value\":170},{\"year\":2028,\"target_value\":220},{\"year\":2029,\"target_value\":280}]}}]},{\"kra_id\":\"KRA 7\",\"kra_title\":\"Research, Extension, and Innovation Resources\",\"guiding_principle\":\"Advancing Research Excellence and Community Engagement\",\"initiatives\":[{\"id\":\"KRA7-KPI1\",\"key_performance_indicator\":{\"outputs\":\"technologies/innovations adopted by the intended stakeholders. The adoption by which people become users of a technology or product, that is usable and useful and enable them to become long-term business goals\",\"outcomes\":\"increased number of technology/innovation on adopters\"},\"strategies\":[\"ensure the adoption of the technologies/innovations by the intended stakeholders\"],\"programs_activities\":[\"conduct PPAs that are needed and are beneficial to the targeted stakeholders\"],\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"Center of Innovation and Emerging Technologies\",\"Extension and Training Services\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":6},{\"year\":2026,\"target_value\":8},{\"year\":2027,\"target_value\":10},{\"year\":2028,\"target_value\":12},{\"year\":2029,\"target_value\":14}]}},{\"id\":\"KRA7-KPI2\",\"key_performance_indicator\":{\"outputs\":\"number of generated partnerships from externally-funded research\",\"outcomes\":\"sustainable projects and improved REI facilities\"},\"strategies\":[\"establish partnership with industry players, policy, and innovation centers\"],\"programs_activities\":[\"research grants and projects\"],\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"Research, Extension and Innovation Unit\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":5},{\"year\":2026,\"target_value\":7},{\"year\":2027,\"target_value\":9},{\"year\":2028,\"target_value\":11},{\"year\":2029,\"target_value\":13}]}},{\"id\":\"KRA7-KPI3\",\"key_performance_indicator\":{\"outputs\":\"established 5 state-of-the-art laboratories on fisheries, agriculture, and otheremerging disciplines\",\"outcomes\":\"more technology innovations\"},\"strategies\":[\"establish partnership with industry players, policy, and innovation center\"],\"programs_activities\":[\"submission of proposal to funding agencies\",\"establishment of REI Centers\"],\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"Project Management Office\",\"Extension and Innovation Unit\",\"Planning Office\",\"Budget and Finance Unit\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":1},{\"year\":2026,\"target_value\":1},{\"year\":2027,\"target_value\":1},{\"year\":2028,\"target_value\":1},{\"year\":2029,\"target_value\":1}]}},{\"id\":\"KRA7-KPI4\",\"key_performance_indicator\":{\"outputs\":\"number of operational/institutionalized research and development centers\",\"outcomes\":\"more technology innovations\"},\"strategies\":\"established partnership with industry players\",\"programs_activities\":[\"submission of proposal to funding agencies\",\"establishment of REI Centers\"],\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"Research and Development Services\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":0},{\"year\":2026,\"target_value\":1},{\"year\":2027,\"target_value\":1},{\"year\":2028,\"target_value\":1},{\"year\":2029,\"target_value\":1}]}},{\"id\":\"KRA7-KPI5\",\"key_performance_indicator\":{\"outputs\":\"total income from commercialized technologies (pesos)\",\"outcomes\":[\"subsidized services of the University\",\"encourage faculty researchers to enroll in the incubation process\"]},\"strategies\":[\"market expansion thru segment your market that tailor to technology that meet the specific needs of different market segments\",\"innovations - continually improved researches\"],\"programs_activities\":[\"innovation and commercialization programs thru commercialization grants\",\"technology transfer programs\",\"entrepreneurship workshops\",\"incubation and acceleration programs\",\"entrepreneurship workshops and seminars: conduct training sessions on entrepreneurship, business development, and commercialization strategies tailored for researchers and innovators\"],\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"Research, Extension and Innovation Unit\"],\"targets\":{\"type\":\"financial\",\"currency\":\"PHP\",\"timeline_data\":[{\"year\":2025,\"target_value\":375000},{\"year\":2026,\"target_value\":425000},{\"year\":2027,\"target_value\":475000},{\"year\":2028,\"target_value\":525000},{\"year\":2029,\"target_value\":550000}]}}]},{\"kra_id\":\"KRA 8\",\"kra_title\":\"Service to the Community\",\"guiding_principle\":\"Advancing Research Excellence and Community Engagement\",\"initiatives\":[{\"id\":\"KRA8-KPI1\",\"key_performance_indicator\":{\"outputs\":\"extension programs organized and supported, consistent with mandated and priority programs\",\"outcomes\":\"improved quality of life of the target beneficiaries\"},\"strategies\":\"ensure that extension programs/projects to be conducted are in line with the expertise of the faculty, and at the same time supports the mandated and priority programs offered by the University\",\"programs_activities\":[\"conduct of needs assessment among target beneficiaries\",\"conduct of in-house review for proposals\"],\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"Extension and Training Services\",\"Budget and Finance Unit\",\"SAO Finance\"],\"targets\":{\"type\":\"count\",\"note\":\"new programs\",\"timeline_data\":[{\"year\":2025,\"target_value\":40},{\"year\":2026,\"target_value\":50},{\"year\":2027,\"target_value\":60},{\"year\":2028,\"target_value\":70},{\"year\":2029,\"target_value\":80}]}},{\"id\":\"KRA8-KPI2\",\"key_performance_indicator\":{\"outputs\":\"number of GAD-related research and extension PPAs\",\"outcomes\":\"improved quality of life of beneficiaries increase in the number of GADrelated research and extension PPAs\"},\"strategies\":\"conduct gender research and extension workshops/write shops\",\"programs_activities\":\"implementation of GAD-related REI programs, projects, and activities\",\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"Gender and Development Office\",\"SAO Finance\",\"Budget and Finance\",\"Research and Development Services\",\"Extension and Training Services\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":17},{\"year\":2026,\"target_value\":19},{\"year\":2027,\"target_value\":20},{\"year\":2028,\"target_value\":23},{\"year\":2029,\"target_value\":25}]}},{\"id\":\"KRA8-KPI3\",\"key_performance_indicator\":{\"outputs\":\"number of trainees weighted by the length of training\",\"outcomes\":[\"application of skills learned for employment or livelihood\",\"employment or entrepreneurial activities that resulted from training\"]},\"strategies\":\"ensure conduct of PPAs that are beneficial to community\",\"programs_activities\":[\"conduct PPAs that are requested by the partners agencies\",\"conduct of BOR-approved extension programs/projects\"],\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"SAO Finance\",\"Budget and Finance Unit\",\"Extension and Training Services\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":17630},{\"year\":2026,\"target_value\":18030},{\"year\":2027,\"target_value\":18230},{\"year\":2028,\"target_value\":18430},{\"year\":2029,\"target_value\":18630}]}},{\"id\":\"KRA8-KPI4\",\"key_performance_indicator\":{\"outputs\":\"number of extension information materials (IEC/ICT) produced, disseminated, and utilized\",\"outcomes\":\"increase in the number of extension information materials (IEC/ICT) produced, disseminated, and utilized\"},\"strategies\":\"ensure the production, dissemination, and utilization of IEC/ICT materials\",\"programs_activities\":[\"prepare IEC/ICT materials for each and every PPA\",\"provide IEC/ICT materials on the PPAs conducted\"],\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"Extension and Training Services\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":30},{\"year\":2026,\"target_value\":35},{\"year\":2027,\"target_value\":40},{\"year\":2028,\"target_value\":45},{\"year\":2029,\"target_value\":50}]}},{\"id\":\"KRA8-KPI5\",\"key_performance_indicator\":{\"outputs\":\"100% of beneficiaries rate the training course/s and advisory services as satisfactory or higher in terms of quality and relevance\",\"outcomes\":\"quality and relevant extension PPAs\"},\"strategies\":\"boost the implementation of PPAs and ensure that such PPAs are of high quality and are relevant to the target beneficiaries\",\"programs_activities\":\"conduct of extension PPAs\",\"responsible_offices\":[\"Vice President for Research Development and Extension\",\"Extension and Training Services\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2029,\"target_value\":100}]}}]},{\"kra_id\":\"KRA 9\",\"kra_title\":\"Implementation of Sustainable Governance\",\"guiding_principle\":\"Shaping a Sustainable Future\",\"initiatives\":[{\"id\":\"KRA9-KPI1\",\"key_performance_indicator\":{\"outputs\":\"approved harmonized manuals of operations by 2029\",\"outcomes\":[\"efficient transactions, services, and operations\",\"standard procedure\"]},\"strategies\":[\"monitoring\",\"consultation\",\"crafting/revision of university policies, standards, and guidelines\"],\"programs_activities\":[\"enhance and extended technology infrastructure towards a wireless paperless and efficient computer network\",\"build capacity of staff on operations\"],\"responsible_offices\":[\"Vice President for Administration\",\"Office of the Campus Directors\",\"All offices/units\"],\"targets\":{\"type\":\"milestone\",\"timeline_data\":[{\"year\":2029,\"target_value\":\"Approved Harmonized Manual\"}]}}]},{\"kra_id\":\"KRA 10\",\"kra_title\":\"Transforming into Green University\",\"guiding_principle\":\"Shaping a Sustainable Future\",\"initiatives\":[{\"id\":\"KRA10-KPI1\",\"key_performance_indicator\":{\"outputs\":\"100% facilities compliant with green building code by 2029\",\"outcomes\":\"climate-change conscious environment\"},\"strategies\":[\"assessment and rehabilitation of facilities\",\"adaptation of renewable energy like solar enery (solar panels)\",\"establishment of sustainable waste management system\",\"construction of MRF\"],\"programs_activities\":[\"implementation of LUDIP\",\"implementation of waste management system\"],\"responsible_offices\":[\"Office of the University President\",\"Office of the Vice Presidents\",\"Office of the Campus Director\",\"Project Management Unit\",\"Planning Office\",\"General Services Unit\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2029,\"target_value\":100}]}}]},{\"kra_id\":\"KRA 11\",\"kra_title\":\"Judicious Management of Human Resources\",\"guiding_principle\":\"Shaping a Sustainable Future\",\"initiatives\":[{\"id\":\"KRA11-KPI1\",\"key_performance_indicator\":{\"outputs\":\"aligned and specialized doctorate graduates for faculty and master's degree for non-teaching personnel by 2029\",\"outcomes\":[\"faculty and non-teaching personnel are proficient in their subject and work areas\",\"doctorate/master degree holders/unit-earners\"]},\"strategies\":[\"strengthen intellectual capital\",\"strengthen professional development program\"],\"programs_activities\":[\"scholarship program, both internal and external\"],\"responsible_offices\":[\"Vice President for Administration\",\"HRMO\",\"Office of the Campus Directors\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2025,\"target_value\":5},{\"year\":2026,\"target_value\":10},{\"year\":2027,\"target_value\":15},{\"year\":2028,\"target_value\":20},{\"year\":2029,\"target_value\":30}]}}]},{\"kra_id\":\"KRA 12\",\"kra_title\":\"Internationalized/Global University Stakeholders\",\"guiding_principle\":\"Shaping a Sustainable Future\",\"initiatives\":[{\"id\":\"KRA12-KPI1\",\"key_performance_indicator\":{\"outputs\":\"10% students, 15% faculty, 5% staff are involved in intercountry mobility across the curriculum\",\"outcomes\":\"increase number of students, staff and faculty involved in intercountry mobility across the curriculum\"},\"strategies\":[\"facilitate the early endorsement of employees’ travels\",\"offer incentives/recognition to faculty and staff who participate in international programs\",\"scout and identify international conferences held in the Philippines\"],\"programs_activities\":[\"attendance/Participation in international training programs, conferences or symposia\",\"co-organizing local and international training/seminar workshops and conferences.\"],\"responsible_offices\":[\"Office of the Vice Presidents\",\"International Local/Affairs\",\"All colleges and Offices\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2029,\"target_value\":10,\"note\":\"students\"},{\"year\":2029,\"target_value\":15,\"note\":\"faculty\"},{\"year\":2029,\"target_value\":5,\"note\":\"staff\"}]}}]},{\"kra_id\":\"KRA 13\",\"kra_title\":\"Competitive Global Human Resources\",\"guiding_principle\":\"Shaping a Sustainable Future\",\"initiatives\":[{\"id\":\"KRA13-KPI1\",\"key_performance_indicator\":{\"outputs\":\"increase in the percentage of certified faculty, personnel, and trainers (local and international certifications)\",\"outcomes\":\"graduates/professionals aligned or sustainable to the needs of the industry\"},\"strategies\":[\"offer local and international scholarships\",\"faculty and staff development plan\"],\"programs_activities\":[\"submission of application and screening\",\"partnership scholarship with external funding agencies\"],\"responsible_offices\":[\"Vice President for Administration\",\"HRMO\",\"Office of the Campus Directors\",\"International/Local Affairs\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2025,\"target_value\":5},{\"year\":2026,\"target_value\":10},{\"year\":2027,\"target_value\":15},{\"year\":2028,\"target_value\":20},{\"year\":2029,\"target_value\":25}]}},{\"id\":\"KRA13-KPI2\",\"key_performance_indicator\":{\"outputs\":\"95% of positions filled by 2029\",\"outcomes\":\"university is operating at maximum capacity a.) for personnel - efficiency of transactions b.) for faculties - proportion of student to faculty members\"},\"strategies\":[\"revisit compensation packages based on existing laws in industry\"],\"programs_activities\":[\"competency-based recruitment\",\"job satisfaction\"],\"responsible_offices\":[\"Vice President for Administration\",\"HRMO\",\"Office of the Campus Directors\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2025,\"target_value\":80},{\"year\":2026,\"target_value\":82},{\"year\":2027,\"target_value\":85},{\"year\":2028,\"target_value\":90},{\"year\":2029,\"target_value\":95}]}},{\"id\":\"KRA13-KPI3\",\"key_performance_indicator\":{\"outputs\":\"100% faculty and staff attended health and wellness program twice a week during school days\",\"outcomes\":\"improvements in fitness levels, weight management, disease prevention, and overall vitality\"},\"strategies\":[\"conduct health and wellness program twice a week\",\"survey on the wellness program to be focus on\"],\"programs_activities\":[\"health and wellness program for faculty and staff\"],\"responsible_offices\":[\"Vice President for Administration\",\"HRMO\",\"Office of the Campus Directors\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2029,\"target_value\":100}]}}]},{\"kra_id\":\"KRA 14\",\"kra_title\":\"Improved Satisfaction Rating of the Students, Faculty, and Personnel\",\"guiding_principle\":\"Shaping a Sustainable Future\",\"initiatives\":[{\"id\":\"KRA14-KPI1\",\"key_performance_indicator\":{\"outputs\":\"95% satisfaction rating on all services\",\"outcomes\":\"sustain very satisfactory or higher rating on all services annually\"},\"strategies\":[\"regular monitoring and ensuring that the client completes the CCSS survey form\",\"addressing the negative feedback from the client regarding the service of a unit\"],\"programs_activities\":[\"client satisfaction\"],\"responsible_offices\":[\"Vice President for Administration\",\"Office of the Campus Directors\",\"Management Information System\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2025,\"target_value\":95},{\"year\":2026,\"target_value\":95},{\"year\":2027,\"target_value\":95},{\"year\":2028,\"target_value\":95},{\"year\":2029,\"target_value\":95}]}}]},{\"kra_id\":\"KRA 15\",\"kra_title\":\"Certification and Compliance to Regulatory Requirements\",\"guiding_principle\":\"Shaping a Sustainable Future\",\"initiatives\":[{\"id\":\"KRA15-KPI1\",\"key_performance_indicator\":{\"outputs\":\"100% of security personnel responsible for security equipment obtained the required licenses and certifications, demonstrating full compliance with regulatory requirements\",\"outcomes\":\"highly professional security personnel maintaining peace and order in all campuses\"},\"strategies\":[\"license of security personnel-in-charge to security equipment\"],\"programs_activities\":[\"ensure proper and legal use of security equipment\"],\"responsible_offices\":[\"Vice President for Administration\",\"Office of the Campus Directors\",\"Security Management and Services\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2029,\"target_value\":100}]}}]},{\"kra_id\":\"KRA 16\",\"kra_title\":\"Updating of Learning Materials and Facilities\",\"guiding_principle\":\"Shaping a Sustainable Future\",\"initiatives\":[{\"id\":\"KRA16-KPI1\",\"key_performance_indicator\":{\"outputs\":\"increase in the percentage of subjects have at least 5 updated references, including books, journals, and electronic books available\",\"outcomes\":[\"higher user satisfaction\",\"electronic document downloads frequency\"]},\"strategies\":[\"revisit the Collection Development Plan and revise it for 2025-2029\",\"ensure that the fiduciary library funds only be used for the acquisition of Library Reference Material. Monitor and report\",\"prioritize the subscription to electronic databases with comprehensive subjects relevant to LSPU curricula\"],\"programs_activities\":[\"collection development program\",\"acquisition and linkages\"],\"responsible_offices\":[\"Vice President for Administration\",\"Library\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2025,\"target_value\":70},{\"year\":2026,\"target_value\":75},{\"year\":2027,\"target_value\":80},{\"year\":2028,\"target_value\":85},{\"year\":2029,\"target_value\":90}]}},{\"id\":\"KRA16-KPI2\",\"key_performance_indicator\":{\"outputs\":\"new building for academic space for students\",\"outcomes\":\"go beyond the minimum standard of providing enough reading space to 10% of the student population\"},\"strategies\":[\"coordinate closely with design planning to ensure planned study spaces are up to standards set by AACCUP and CHED\",\"take feedback from students and library users\",\"create welldocumented project proposals with forecasts on student population\",\"begin planning the library system towards establishing various college or separate libraries.\"],\"programs_activities\":[\"library development plan\"],\"responsible_offices\":[\"Office of the University President\",\"Library\",\"Project Management Office\",\"Planning Office\",\"Vice President for Administration\"],\"targets\":{\"type\":\"milestone\",\"timeline_data\":[{\"year\":2025,\"target_value\":\"renovate the library to accommodate 250 students\"},{\"year\":2026,\"target_value\":\"planning and benchmarking for library building standards and organization of college libraries\"},{\"year\":2027,\"target_value\":\"long term planning and design of a system of libraries and academic spaces\"},{\"year\":2028,\"target_value\":\"Phase 1 of implementing immediate plans to increase library space\"},{\"year\":2029,\"target_value\":\"New buildings to accommodate at least 1,200 students\"}]}}]},{\"kra_id\":\"KRA 17\",\"kra_title\":\"Digital Transformation and Smart Campus Enablement\",\"guiding_principle\":\"Shaping a Sustainable Future\",\"initiatives\":[{\"id\":\"KRA17-KPI1\",\"key_performance_indicator\":{\"outputs\":\"100% of offices included in the coverage area of internet\",\"outcomes\":\"improved network speed and reliability\"},\"strategies\":[\"network infrastructure improvement/maintenance\"],\"programs_activities\":[\"connection of offices to the University’s fiber backbone\",\"investment in high-quality networking devices that can retain the bandwidth and throughput of a gigabit network.\"],\"responsible_offices\":[\"Vice President for Administration\",\"Office of the CampusDirectors\",\"Information Communication and Technology Services\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2029,\"target_value\":100}]}},{\"id\":\"KRA17-KPI2\",\"key_performance_indicator\":{\"outputs\":\"100% of ICT-related projects/requests are procured/implemented\",\"outcomes\":\"enhanced performance and capacity of technology\"},\"strategies\":[\"futures planning\",\"procurement of ICT-related equipment\"],\"programs_activities\":[\"upgrade/maintenance of ICT equipment\"],\"responsible_offices\":[\"Vice President for Administration\",\"Office of the Campus Directors\",\"Information Communication and Technology Services\",\"Procurement Bids and Awards\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2025,\"target_value\":80},{\"year\":2026,\"target_value\":88},{\"year\":2027,\"target_value\":90},{\"year\":2028,\"target_value\":93},{\"year\":2029,\"target_value\":95}]}},{\"id\":\"KRA17-KPI3\",\"key_performance_indicator\":{\"outputs\":\"digitalized processes and systems in operation\",\"outcomes\":\"improved operational efficiency, with a measurable reduction in manual processes\"},\"strategies\":\"digitalization of manual workflows\",\"programs_activities\":[\"development, procurement and/or subscription of Information System modules to help in transformation of the manual processes which also aligns to the university’s ISSP\"],\"responsible_offices\":[\"Vice President for Administration\",\"Office of the Campus Directors\",\"Information Communication and Technology Services\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":6},{\"year\":2026,\"target_value\":6},{\"year\":2027,\"target_value\":6},{\"year\":2028,\"target_value\":6},{\"year\":2029,\"target_value\":6}]}},{\"id\":\"KRA17-KPI4\",\"key_performance_indicator\":{\"outputs\":\"Conduct of orientations/workshops/training sessions for the end-users of digitalized process\",\"outcomes\":\"increased staff competency in using new technologies\"},\"strategies\":[\"develop comprehensive training programs to upskill staff and faculty\"],\"programs_activities\":[\"organize ICT-related workshops and training sessions for staff and faculty\"],\"responsible_offices\":[\"Vice President for Administration\",\"Office of the Campus Directors\",\"HRMO\",\"Information Communication and Technology\"],\"targets\":{\"type\":\"count\",\"timeline_data\":[{\"year\":2025,\"target_value\":2},{\"year\":2026,\"target_value\":2},{\"year\":2027,\"target_value\":2},{\"year\":2028,\"target_value\":2},{\"year\":2029,\"target_value\":2}]}}]},{\"kra_id\":\"KRA 18\",\"kra_title\":\"Risk Management and Compliance\",\"guiding_principle\":\"Resource Optimization and Management\",\"initiatives\":[{\"id\":\"KRA18-KPI1\",\"key_performance_indicator\":{\"outputs\":\"conducted risk assessments with zero incidence of non-compliance on financial issues\",\"outcomes\":\"smooth flow of operations and processes (full compliance)\"},\"strategies\":[\"ensure 0% incidence of non-compliance\",\"conduct regular risk assessments, internal audits, and third-party reviews\",\"Implement automated monitoring tools\",\"Provide ongoing compliance training and clear reporting channels\"],\"programs_activities\":[\"observe the protocol concerning spending and financial reporting\",\"comply with the required documentation, etc. regarding financial matters\"],\"responsible_offices\":[\"Vice President for Administration\",\"Budget Office\",\"SAO Finance\"],\"targets\":{\"type\":\"text_condition\",\"timeline_data\":[{\"year\":2029,\"target_value\":\"Zero incidence of non-compliance\"}]}}]},{\"kra_id\":\"KRA 19\",\"kra_title\":\"Revenue Growth and Operational Efficiency\",\"guiding_principle\":\"Resource Optimization and Management\",\"initiatives\":[{\"id\":\"KRA19-KPI1\",\"key_performance_indicator\":{\"outputs\":\"increase in income generated from approved IGPs\",\"outcomes\":\"increased internal funding for special funds\"},\"strategies\":[\"identify and evaluate new IGP opportunities\",\"formulation of IGP manual and financial management framework\",\"regular monitoring,evaluation and audit\"],\"programs_activities\":[\"procurement planning; implementation\",\"monitoring of planned procurement activities\",\"evaluation\",\"policy and program making for IGP *proposal making/planning for new IGPs\"],\"responsible_offices\":[\"Vice President for Administration\",\"Budget Office\",\"SAO Finance\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2025,\"target_value\":5},{\"year\":2026,\"target_value\":5},{\"year\":2027,\"target_value\":7},{\"year\":2028,\"target_value\":9},{\"year\":2029,\"target_value\":11}]}},{\"id\":\"KRA19-KPI2\",\"key_performance_indicator\":{\"outputs\":\"reduction in operational costs\",\"outcomes\":\"funds can be allocated for other important projects\"},\"strategies\":[\"develop resource utilization plans\",\"regular inventory and preventive maintenance\"],\"programs_activities\":[\"procurement planning; implementation\",\"monitoring of planned procurement activities\",\"evaluation\"],\"responsible_offices\":[\"Vice President for Administration\",\"Budget Office\",\"SAO Finance\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2025,\"target_value\":2},{\"year\":2026,\"target_value\":4},{\"year\":2027,\"target_value\":6},{\"year\":2028,\"target_value\":8},{\"year\":2029,\"target_value\":10}]}}]},{\"kra_id\":\"KRA 20\",\"kra_title\":\"Related IGP Industry Engagement\",\"guiding_principle\":\"Resource Optimization and Management\",\"initiatives\":[{\"id\":\"KRA20-KPI1\",\"key_performance_indicator\":{\"outputs\":\"total revenue generated from partnerships and collaborations\",\"outcomes\":[\"acquired expertise and investments\",\"quality of partnership agreements\",\"increased in total revenue generated from strategic partnerships and collaborations\"]},\"strategies\":[\"resource and expertise sharing\",\"joint revenue-generating initiatives\",\"strengthen human resources, organizational, and financial capital of the university\",\"strengthen intellectual capital from capital royalties from developed technologies\"],\"programs_activities\":[\"consultancy and training\",\"joint ventures using developed technologies\"],\"responsible_offices\":[\"Vice President for Administration\",\"Budget Office\",\"SAO Finance\",\"Extension and Training Services\"],\"targets\":{\"type\":\"financial\",\"currency\":\"PHP\",\"timeline_data\":[{\"year\":2025,\"target_value\":0},{\"year\":2026,\"target_value\":0},{\"year\":2027,\"target_value\":300000},{\"year\":2028,\"target_value\":330000},{\"year\":2029,\"target_value\":363000}]}},{\"id\":\"KRA20-KPI2\",\"key_performance_indicator\":{\"outputs\":\"increase in net income from non-traditional sources\",\"outcomes\":\"generate additional income from non-traditional sources\"},\"strategies\":[\"create entrepreneurial ventures\",\"strengthen the existing income-generating projects\"],\"programs_activities\":[\"events place\",\"coffee shops\",\"rental spaces\",\"commercialization of research products and services\",\"printing and binding\",\"gasoline station\",\"clothing shop\",\"grocery-style store\"],\"responsible_offices\":[\"Vice President for Administration\",\"Business Affairs Office\",\"SAO Finance\",\"Budget Office\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2025,\"target_value\":5},{\"year\":2026,\"target_value\":8},{\"year\":2027,\"target_value\":12},{\"year\":2028,\"target_value\":20},{\"year\":2029,\"target_value\":30}]}}]},{\"kra_id\":\"KRA 21\",\"kra_title\":\"Responsive Management of Resources\",\"guiding_principle\":\"Resource Optimization and Management\",\"initiatives\":[{\"id\":\"KRA21-KPI1\",\"key_performance_indicator\":{\"outputs\":\"100% budget utilization rate (disbursement)\",\"outcomes\":\"established functional and operational system for resource generation and management of resources\"},\"strategies\":[\"ensure prudent use of resources\",\"improve spending efficiency, absorptive capacity\"],\"programs_activities\":\"monitoring of the planned procurement activities\",\"responsible_offices\":[\"Vice President for Administration\",\"Budget Office\",\"SAO Finance\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2029,\"target_value\":100}]}},{\"id\":\"KRA21-KPI2\",\"key_performance_indicator\":{\"outputs\":\"100% budget utilization rate (obligation)\",\"outcomes\":\"established functional and operational system for resource generation and management of resources\"},\"strategies\":[\"ensure prudent use of resources\",\"Improve the spending efficiency; absorptive capacity\"],\"programs_activities\":[\"implementation of the planned programs, projects, and activities (PPAs)\",\"monitoring of planned procurement activities\",\"Conduct a workshop for all the offices involved\"],\"responsible_offices\":[\"Vice President for Administration\",\"Budget Office\",\"SAO Finance\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2029,\"target_value\":100}]}}]},{\"kra_id\":\"KRA 22\",\"kra_title\":\"Management of Financial Resources\",\"guiding_principle\":\"Resource Optimization and Management\",\"initiatives\":[{\"id\":\"KRA22-KPI1\",\"key_performance_indicator\":{\"outputs\":\"internally generated income\",\"outcomes\":\"established functional and operational system for resource generation and management of resources\"},\"strategies\":[\"availability of a systematic plan of action to justify every budget proposal\",\"continual improvement process\"],\"programs_activities\":[\"submit justifications to the Department of Budget and Management for the release of the actual billing\",\"training and seminars for the human resources\"],\"responsible_offices\":[\"Vice President for Administration\",\"Budget Office\",\"SAO Finance\"],\"targets\":{\"type\":\"financial\",\"currency\":\"PHP\",\"timeline_data\":[{\"year\":2025,\"target_value\":263426000},{\"year\":2026,\"target_value\":277000000},{\"year\":2027,\"target_value\":291000000},{\"year\":2028,\"target_value\":320000000},{\"year\":2029,\"target_value\":336000000}]}},{\"id\":\"KRA22-KPI2\",\"key_performance_indicator\":{\"outputs\":\"100% fund utilization on infrastructure projects\",\"outcomes\":[\"improved productivity of the human resources\",\"developed facilities, services, and systems\"]},\"strategies\":\"strengthen construction or manufacture capital\",\"programs_activities\":[\"monitoring of the planned programs\",\"conduct of Early Procurement Activities (EPA)\",\"approval of PPMP/APP\",\"BOR approval\"],\"responsible_offices\":[\"Vice President for Administration\",\"Project Management Unit\",\"Planning Unit\",\"SAO Finance\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2029,\"target_value\":100}]}},{\"id\":\"KRA22-KPI3\",\"key_performance_indicator\":{\"outputs\":\"100% fund utilization on repairs/rehabilitation of buildings, vehicles, drainage and roads, land, material recovery facilities and electrical facilities\",\"outcomes\":[\"less funds for repair and rehabilitation\",\"less disruption to operation\"]},\"strategies\":[\"strengthen construction or manufacture capital\",\"implement regular preventive maintenance\"],\"programs_activities\":[\"conduct of Early Procurement Activities (EPA)\",\"approval of the Head of Agency\",\"approval of PPMP/APP\",\"bidding\",\"contracting by Administration\"],\"responsible_offices\":[\"Vice President for Administration\",\"General Services Office\",\"SAO Finance\",\"Budget Office\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2029,\"target_value\":100}]}},{\"id\":\"KRA22-KPI4\",\"key_performance_indicator\":{\"outputs\":\"100% fund utilization in the acquisition of new equipment\",\"outcomes\":[\"responsive to the needs of the end-users\",\"efficiency in the procurement of equipment needed\"]},\"strategies\":[\"assessment of the needs of the end-users\",\"consider the budget and maintenance cost\"],\"programs_activities\":[\"conduct of Early Procurement Activities (EPA)\",\"approval of the Head of Agency\",\"approval of PPMP/APP\",\"bidding\"],\"responsible_offices\":[\"Vice President for Administration\",\"Budget Office\",\"SAO Finance\"],\"targets\":{\"type\":\"percentage\",\"timeline_data\":[{\"year\":2029,\"target_value\":100}]}}]}]}"));}),
"[project]/components/ui/progress.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Progress",
    ()=>Progress
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$progress$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-progress/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
'use client';
;
;
;
function Progress({ className, value, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$progress$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        "data-slot": "progress",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('bg-primary/20 relative h-2 w-full overflow-hidden rounded-full', className),
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$progress$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Indicator"], {
            "data-slot": "progress-indicator",
            className: "bg-primary h-full w-full flex-1 transition-all",
            style: {
                transform: `translateX(-${100 - (value || 0)}%)`
            }
        }, void 0, false, {
            fileName: "[project]/components/ui/progress.tsx",
            lineNumber: 22,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/ui/progress.tsx",
        lineNumber: 14,
        columnNumber: 5
    }, this);
}
_c = Progress;
;
var _c;
__turbopack_context__.k.register(_c, "Progress");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/target-displays.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CurrencyProgress",
    ()=>CurrencyProgress,
    "CurrentValueInput",
    ()=>CurrentValueInput,
    "FractionalDisplay",
    ()=>FractionalDisplay,
    "HighVolumeProgress",
    ()=>HighVolumeProgress,
    "PercentageProgress",
    ()=>PercentageProgress,
    "StatusBadge",
    ()=>StatusBadge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$progress$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/progress.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check.js [app-client] (ecmascript) <export default as CheckCircle2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.js [app-client] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.js [app-client] (ecmascript) <export default as AlertCircle>");
'use client';
;
;
;
;
;
function PercentageProgress({ currentValue, targetValue, showLabel = true, className }) {
    // For percentage, current IS the progress (not current/target ratio)
    const progress = Math.min(100, Math.max(0, currentValue));
    const isComplete = currentValue >= targetValue;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex items-center gap-3', className),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 relative",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$progress$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Progress"], {
                        value: progress,
                        className: "h-4 bg-gray-200 *:data-[slot=progress-indicator]:bg-blue-500"
                    }, void 0, false, {
                        fileName: "[project]/components/ui/target-displays.tsx",
                        lineNumber: 35,
                        columnNumber: 9
                    }, this),
                    showLabel && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700",
                        children: [
                            currentValue,
                            "% / ",
                            targetValue,
                            "%"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ui/target-displays.tsx",
                        lineNumber: 40,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ui/target-displays.tsx",
                lineNumber: 34,
                columnNumber: 7
            }, this),
            isComplete && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
                className: "h-4 w-4 text-green-500 shrink-0"
            }, void 0, false, {
                fileName: "[project]/components/ui/target-displays.tsx",
                lineNumber: 46,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ui/target-displays.tsx",
        lineNumber: 33,
        columnNumber: 5
    }, this);
}
_c = PercentageProgress;
function CurrencyProgress({ currentValue, targetValue, formattedCurrent, formattedTarget, className }) {
    const progress = targetValue > 0 ? Math.min(100, currentValue / targetValue * 100) : 0;
    const isComplete = currentValue >= targetValue;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex items-center gap-3', className),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 relative",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$progress$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Progress"], {
                        value: progress,
                        className: "h-5 bg-gray-200 *:data-[slot=progress-indicator]:bg-blue-500"
                    }, void 0, false, {
                        fileName: "[project]/components/ui/target-displays.tsx",
                        lineNumber: 78,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-800",
                        children: [
                            formattedCurrent,
                            " / ",
                            formattedTarget
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/ui/target-displays.tsx",
                        lineNumber: 82,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ui/target-displays.tsx",
                lineNumber: 77,
                columnNumber: 7
            }, this),
            isComplete && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
                className: "h-4 w-4 text-green-500 shrink-0"
            }, void 0, false, {
                fileName: "[project]/components/ui/target-displays.tsx",
                lineNumber: 87,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ui/target-displays.tsx",
        lineNumber: 76,
        columnNumber: 5
    }, this);
}
_c1 = CurrencyProgress;
function HighVolumeProgress({ currentValue, targetValue, formattedCurrent, formattedTarget, unit = '', className }) {
    const progress = targetValue > 0 ? Math.min(100, currentValue / targetValue * 100) : 0;
    const isComplete = currentValue >= targetValue;
    const label = unit ? `${formattedCurrent} / ${formattedTarget} ${unit}` : `${formattedCurrent} / ${formattedTarget}`;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex items-center gap-3', className),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 relative",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$progress$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Progress"], {
                        value: progress,
                        className: "h-5 bg-gray-200 *:data-[slot=progress-indicator]:bg-blue-500"
                    }, void 0, false, {
                        fileName: "[project]/components/ui/target-displays.tsx",
                        lineNumber: 125,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-800",
                        children: label
                    }, void 0, false, {
                        fileName: "[project]/components/ui/target-displays.tsx",
                        lineNumber: 129,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ui/target-displays.tsx",
                lineNumber: 124,
                columnNumber: 7
            }, this),
            isComplete && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
                className: "h-4 w-4 text-green-500 shrink-0"
            }, void 0, false, {
                fileName: "[project]/components/ui/target-displays.tsx",
                lineNumber: 134,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ui/target-displays.tsx",
        lineNumber: 123,
        columnNumber: 5
    }, this);
}
_c2 = HighVolumeProgress;
function FractionalDisplay({ currentValue, targetValue, unit = '', className }) {
    const isComplete = currentValue >= targetValue;
    const ratio = targetValue > 0 ? currentValue / targetValue : 0;
    // Color based on completion ratio
    let textColor = 'text-gray-600';
    if (isComplete) {
        textColor = 'text-green-600';
    } else if (ratio >= 0.5) {
        textColor = 'text-blue-600';
    } else if (ratio > 0) {
        textColor = 'text-yellow-600';
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex items-center gap-2', className),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('text-lg font-bold', textColor),
                children: [
                    currentValue,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-gray-400 mx-1",
                        children: "/"
                    }, void 0, false, {
                        fileName: "[project]/components/ui/target-displays.tsx",
                        lineNumber: 176,
                        columnNumber: 9
                    }, this),
                    targetValue
                ]
            }, void 0, true, {
                fileName: "[project]/components/ui/target-displays.tsx",
                lineNumber: 174,
                columnNumber: 7
            }, this),
            unit && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-sm text-gray-500",
                children: unit
            }, void 0, false, {
                fileName: "[project]/components/ui/target-displays.tsx",
                lineNumber: 179,
                columnNumber: 16
            }, this),
            isComplete && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
                className: "h-4 w-4 text-green-500 shrink-0"
            }, void 0, false, {
                fileName: "[project]/components/ui/target-displays.tsx",
                lineNumber: 181,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ui/target-displays.tsx",
        lineNumber: 173,
        columnNumber: 5
    }, this);
}
_c3 = FractionalDisplay;
function StatusBadge({ status, currentValue, targetValue, className }) {
    const config = {
        completed: {
            variant: 'default',
            className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"],
            label: currentValue || targetValue
        },
        in_progress: {
            variant: 'default',
            className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"],
            label: currentValue || 'In Progress'
        },
        pending: {
            variant: 'outline',
            className: 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100',
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"],
            label: 'Pending'
        }
    };
    const { variant, className: badgeClassName, icon: Icon, label } = config[status];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex flex-col gap-1', className),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                variant: variant,
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex items-center gap-1', badgeClassName),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                        className: "h-3 w-3"
                    }, void 0, false, {
                        fileName: "[project]/components/ui/target-displays.tsx",
                        lineNumber: 233,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "truncate max-w-[200px]",
                        children: label
                    }, void 0, false, {
                        fileName: "[project]/components/ui/target-displays.tsx",
                        lineNumber: 234,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/ui/target-displays.tsx",
                lineNumber: 232,
                columnNumber: 7
            }, this),
            status !== 'completed' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-xs text-gray-500 truncate max-w-[200px]",
                children: [
                    "Target: ",
                    targetValue
                ]
            }, void 0, true, {
                fileName: "[project]/components/ui/target-displays.tsx",
                lineNumber: 237,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ui/target-displays.tsx",
        lineNumber: 231,
        columnNumber: 5
    }, this);
}
_c4 = StatusBadge;
function CurrentValueInput({ value, onChange, type, placeholder = 'Enter current value', className }) {
    const inputType = type === 'text' ? 'text' : 'number';
    const prefix = type === 'currency' ? '₱' : type === 'percentage' ? '' : '';
    const suffix = type === 'percentage' ? '%' : '';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex items-center gap-1', className),
        children: [
            prefix && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-gray-500 text-sm",
                children: prefix
            }, void 0, false, {
                fileName: "[project]/components/ui/target-displays.tsx",
                lineNumber: 269,
                columnNumber: 18
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                type: inputType,
                value: value,
                onChange: (e)=>onChange(e.target.value),
                placeholder: placeholder,
                className: "w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            }, void 0, false, {
                fileName: "[project]/components/ui/target-displays.tsx",
                lineNumber: 270,
                columnNumber: 7
            }, this),
            suffix && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-gray-500 text-sm",
                children: suffix
            }, void 0, false, {
                fileName: "[project]/components/ui/target-displays.tsx",
                lineNumber: 277,
                columnNumber: 18
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ui/target-displays.tsx",
        lineNumber: 268,
        columnNumber: 5
    }, this);
}
_c5 = CurrentValueInput;
var _c, _c1, _c2, _c3, _c4, _c5;
__turbopack_context__.k.register(_c, "PercentageProgress");
__turbopack_context__.k.register(_c1, "CurrencyProgress");
__turbopack_context__.k.register(_c2, "HighVolumeProgress");
__turbopack_context__.k.register(_c3, "FractionalDisplay");
__turbopack_context__.k.register(_c4, "StatusBadge");
__turbopack_context__.k.register(_c5, "CurrentValueInput");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/utils/target-type-detector.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Target Type Detection and Formatting Utilities
 * 
 * Detects the display type for Strategic Plan targets based on:
 * - Explicit type field from strategic_plan.json
 * - Value format analysis (percentage, currency, count)
 * - Configurable thresholds for low_count vs high_volume
 */ __turbopack_context__.s([
    "calculateProgress",
    ()=>calculateProgress,
    "detectTargetType",
    ()=>detectTargetType,
    "formatCompactNumber",
    ()=>formatCompactNumber,
    "formatCurrency",
    ()=>formatCurrency,
    "getMilestoneStatus",
    ()=>getMilestoneStatus,
    "getTargetDisplayInfo",
    ()=>getTargetDisplayInfo,
    "normalizeCurrency",
    ()=>normalizeCurrency,
    "parseNumericValue",
    ()=>parseNumericValue
]);
// Default threshold for distinguishing low_count from high_volume
const DEFAULT_LOW_COUNT_THRESHOLD = 10;
function detectTargetType(targetValue, currentValue, config = {}) {
    const { type, currency, low_count_threshold = DEFAULT_LOW_COUNT_THRESHOLD } = config;
    // 1. Explicit percentage type
    if (type === 'percentage') {
        return 'percentage';
    }
    // 2. Financial/currency type
    if (type === 'financial' || currency) {
        return 'currency';
    }
    // 3. Milestone/qualitative type (text-based targets)
    if (type === 'milestone' || type === 'text_condition') {
        return 'milestone';
    }
    // 4. String values that aren't explicitly typed → milestone
    if (typeof targetValue === 'string') {
        // Check if it contains percentage symbol
        if (targetValue.includes('%')) {
            return 'percentage';
        }
        // Check for currency indicators
        if (targetValue.includes('₱') || targetValue.toLowerCase().includes('php')) {
            return 'currency';
        }
        // Check if it's a parseable number
        const parsed = parseFloat(targetValue.replace(/,/g, ''));
        if (isNaN(parsed)) {
            return 'milestone';
        }
        // Use parsed number for threshold check
        return parsed <= low_count_threshold ? 'low_count' : 'high_volume';
    }
    // 5. Numeric values - check threshold
    if (typeof targetValue === 'number') {
        return targetValue <= low_count_threshold ? 'low_count' : 'high_volume';
    }
    // Default fallback
    return 'milestone';
}
function normalizeCurrency(value) {
    return value.replace(/PHP\s*/gi, '₱').replace(/Php\s*/gi, '₱').replace(/php\s*/gi, '₱');
}
function formatCurrency(value) {
    if (value >= 1_000_000) {
        return `₱${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    }
    if (value >= 1_000) {
        return `₱${(value / 1_000).toFixed(0)}k`;
    }
    return `₱${value.toLocaleString()}`;
}
function formatCompactNumber(value) {
    if (value >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    }
    if (value >= 10_000) {
        return `${(value / 1_000).toFixed(0)}k`;
    }
    return value.toLocaleString();
}
function parseNumericValue(value) {
    if (typeof value === 'number') {
        return value;
    }
    // Remove currency symbols, commas, and whitespace
    const cleaned = value.replace(/[₱$,\s]/g, '').replace(/PHP/gi, '').trim();
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
}
function calculateProgress(currentValue, targetValue, displayType) {
    // Milestones use exact match logic
    if (displayType === 'milestone') {
        if (!currentValue) return 0;
        return String(currentValue).toLowerCase() === String(targetValue).toLowerCase() ? 100 : 50;
    }
    const current = parseNumericValue(currentValue ?? 0);
    const target = parseNumericValue(targetValue);
    if (target === 0) return 0;
    // For percentage type, current value IS the percentage
    if (displayType === 'percentage') {
        return Math.min(100, Math.max(0, current));
    }
    // For other numeric types, calculate ratio
    const ratio = current / target * 100;
    return Math.min(100, Math.max(0, ratio));
}
function getMilestoneStatus(currentValue, targetValue) {
    if (!currentValue || currentValue === '') {
        return 'pending';
    }
    const currentStr = String(currentValue).toLowerCase().trim();
    const targetStr = String(targetValue).toLowerCase().trim();
    if (currentStr === targetStr) {
        return 'completed';
    }
    return 'in_progress';
}
function getTargetDisplayInfo(targetValue, currentValue, config = {}) {
    const displayType = detectTargetType(targetValue, currentValue, config);
    const isCurrency = displayType === 'currency';
    const currencySymbol = isCurrency ? '₱' : '';
    let formattedTarget;
    let formattedCurrent;
    switch(displayType){
        case 'percentage':
            formattedTarget = `${parseNumericValue(targetValue)}%`;
            formattedCurrent = currentValue !== undefined ? `${parseNumericValue(currentValue)}%` : '0%';
            break;
        case 'currency':
            formattedTarget = formatCurrency(parseNumericValue(targetValue));
            formattedCurrent = currentValue !== undefined ? formatCurrency(parseNumericValue(currentValue)) : '₱0';
            break;
        case 'high_volume':
            formattedTarget = formatCompactNumber(parseNumericValue(targetValue));
            formattedCurrent = currentValue !== undefined ? formatCompactNumber(parseNumericValue(currentValue)) : '0';
            break;
        case 'low_count':
            formattedTarget = String(parseNumericValue(targetValue));
            formattedCurrent = currentValue !== undefined ? String(parseNumericValue(currentValue)) : '0';
            break;
        case 'milestone':
        default:
            formattedTarget = String(targetValue);
            formattedCurrent = currentValue !== undefined ? String(currentValue) : '';
            break;
    }
    const progressPercent = calculateProgress(currentValue, targetValue, displayType);
    return {
        displayType,
        formattedTarget,
        formattedCurrent,
        progressPercent,
        isCurrency,
        currencySymbol
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/checkbox.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Checkbox",
    ()=>Checkbox
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$checkbox$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-checkbox/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as CheckIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
'use client';
;
;
;
;
function Checkbox({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$checkbox$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        "data-slot": "checkbox",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50', className),
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$checkbox$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Indicator"], {
            "data-slot": "checkbox-indicator",
            className: "flex items-center justify-center text-current transition-none",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckIcon$3e$__["CheckIcon"], {
                className: "size-3.5"
            }, void 0, false, {
                fileName: "[project]/components/ui/checkbox.tsx",
                lineNumber: 26,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/ui/checkbox.tsx",
            lineNumber: 22,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/ui/checkbox.tsx",
        lineNumber: 14,
        columnNumber: 5
    }, this);
}
_c = Checkbox;
;
var _c;
__turbopack_context__.k.register(_c, "Checkbox");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/select.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Select",
    ()=>Select,
    "SelectContent",
    ()=>SelectContent,
    "SelectGroup",
    ()=>SelectGroup,
    "SelectItem",
    ()=>SelectItem,
    "SelectLabel",
    ()=>SelectLabel,
    "SelectScrollDownButton",
    ()=>SelectScrollDownButton,
    "SelectScrollUpButton",
    ()=>SelectScrollUpButton,
    "SelectSeparator",
    ()=>SelectSeparator,
    "SelectTrigger",
    ()=>SelectTrigger,
    "SelectValue",
    ()=>SelectValue
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-select/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as CheckIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDownIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDownIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUpIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-up.js [app-client] (ecmascript) <export default as ChevronUpIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
'use client';
;
;
;
;
function Select({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        "data-slot": "select",
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/select.tsx",
        lineNumber: 12,
        columnNumber: 10
    }, this);
}
_c = Select;
function SelectGroup({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Group"], {
        "data-slot": "select-group",
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/select.tsx",
        lineNumber: 18,
        columnNumber: 10
    }, this);
}
_c1 = SelectGroup;
function SelectValue({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Value"], {
        "data-slot": "select-value",
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/select.tsx",
        lineNumber: 24,
        columnNumber: 10
    }, this);
}
_c2 = SelectValue;
function SelectTrigger({ className, size = 'default', children, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Trigger"], {
        "data-slot": "select-trigger",
        "data-size": size,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("border-input data-placeholder:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className),
        ...props,
        children: [
            children,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                asChild: true,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDownIcon$3e$__["ChevronDownIcon"], {
                    className: "size-4 opacity-50"
                }, void 0, false, {
                    fileName: "[project]/components/ui/select.tsx",
                    lineNumber: 47,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/ui/select.tsx",
                lineNumber: 46,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ui/select.tsx",
        lineNumber: 36,
        columnNumber: 5
    }, this);
}
_c3 = SelectTrigger;
function SelectContent({ className, children, position = 'popper', ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Portal"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"], {
            "data-slot": "select-content",
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-[--radix-select-content-available-height] min-w-32 origin-[--radix-select-content-transform-origin] overflow-x-hidden overflow-y-auto rounded-md border shadow-md', position === 'popper' && 'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1', className),
            position: position,
            ...props,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SelectScrollUpButton, {}, void 0, false, {
                    fileName: "[project]/components/ui/select.tsx",
                    lineNumber: 72,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Viewport"], {
                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('p-1', position === 'popper' && 'h-[--radix-select-trigger-height] w-full min-w-[--radix-select-trigger-width] scroll-my-1'),
                    children: children
                }, void 0, false, {
                    fileName: "[project]/components/ui/select.tsx",
                    lineNumber: 73,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SelectScrollDownButton, {}, void 0, false, {
                    fileName: "[project]/components/ui/select.tsx",
                    lineNumber: 82,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/ui/select.tsx",
            lineNumber: 61,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/ui/select.tsx",
        lineNumber: 60,
        columnNumber: 5
    }, this);
}
_c4 = SelectContent;
function SelectLabel({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
        "data-slot": "select-label",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('text-muted-foreground px-2 py-1.5 text-xs', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/select.tsx",
        lineNumber: 93,
        columnNumber: 5
    }, this);
}
_c5 = SelectLabel;
function SelectItem({ className, children, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Item"], {
        "data-slot": "select-item",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:last:[span]:flex *:last:[span]:items-center *:last:[span]:gap-2", className),
        ...props,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "absolute right-2 flex size-3.5 items-center justify-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ItemIndicator"], {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckIcon$3e$__["CheckIcon"], {
                        className: "size-4"
                    }, void 0, false, {
                        fileName: "[project]/components/ui/select.tsx",
                        lineNumber: 117,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/ui/select.tsx",
                    lineNumber: 116,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/ui/select.tsx",
                lineNumber: 115,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ItemText"], {
                children: children
            }, void 0, false, {
                fileName: "[project]/components/ui/select.tsx",
                lineNumber: 120,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ui/select.tsx",
        lineNumber: 107,
        columnNumber: 5
    }, this);
}
_c6 = SelectItem;
function SelectSeparator({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Separator"], {
        "data-slot": "select-separator",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('bg-border pointer-events-none -mx-1 my-1 h-px', className),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/select.tsx",
        lineNumber: 130,
        columnNumber: 5
    }, this);
}
_c7 = SelectSeparator;
function SelectScrollUpButton({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollUpButton"], {
        "data-slot": "select-scroll-up-button",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex cursor-default items-center justify-center py-1', className),
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUpIcon$3e$__["ChevronUpIcon"], {
            className: "size-4"
        }, void 0, false, {
            fileName: "[project]/components/ui/select.tsx",
            lineNumber: 151,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/ui/select.tsx",
        lineNumber: 143,
        columnNumber: 5
    }, this);
}
_c8 = SelectScrollUpButton;
function SelectScrollDownButton({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollDownButton"], {
        "data-slot": "select-scroll-down-button",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex cursor-default items-center justify-center py-1', className),
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDownIcon$3e$__["ChevronDownIcon"], {
            className: "size-4"
        }, void 0, false, {
            fileName: "[project]/components/ui/select.tsx",
            lineNumber: 169,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/ui/select.tsx",
        lineNumber: 161,
        columnNumber: 5
    }, this);
}
_c9 = SelectScrollDownButton;
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8, _c9;
__turbopack_context__.k.register(_c, "Select");
__turbopack_context__.k.register(_c1, "SelectGroup");
__turbopack_context__.k.register(_c2, "SelectValue");
__turbopack_context__.k.register(_c3, "SelectTrigger");
__turbopack_context__.k.register(_c4, "SelectContent");
__turbopack_context__.k.register(_c5, "SelectLabel");
__turbopack_context__.k.register(_c6, "SelectItem");
__turbopack_context__.k.register(_c7, "SelectSeparator");
__turbopack_context__.k.register(_c8, "SelectScrollUpButton");
__turbopack_context__.k.register(_c9, "SelectScrollDownButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/dynamic-input.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DynamicInput",
    ()=>DynamicInput,
    "formatDisplayValue",
    ()=>formatDisplayValue,
    "validateDynamicInput",
    ()=>validateDynamicInput
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$checkbox$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/checkbox.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/select.tsx [app-client] (ecmascript)");
'use client';
;
;
;
;
function DynamicInput({ targetType, value, onChange, placeholder = '', className, disabled = false }) {
    switch(targetType){
        case 'MILESTONE':
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MilestoneInput, {
                value: value,
                onChange: onChange,
                className: className,
                disabled: disabled
            }, void 0, false, {
                fileName: "[project]/components/ui/dynamic-input.tsx",
                lineNumber: 46,
                columnNumber: 9
            }, this);
        case 'COUNT':
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CountInput, {
                value: value,
                onChange: onChange,
                placeholder: placeholder,
                className: className,
                disabled: disabled
            }, void 0, false, {
                fileName: "[project]/components/ui/dynamic-input.tsx",
                lineNumber: 56,
                columnNumber: 9
            }, this);
        case 'PERCENTAGE':
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PercentageInput, {
                value: value,
                onChange: onChange,
                placeholder: placeholder,
                className: className,
                disabled: disabled
            }, void 0, false, {
                fileName: "[project]/components/ui/dynamic-input.tsx",
                lineNumber: 67,
                columnNumber: 9
            }, this);
        case 'FINANCIAL':
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(FinancialInput, {
                value: value,
                onChange: onChange,
                placeholder: placeholder,
                className: className,
                disabled: disabled
            }, void 0, false, {
                fileName: "[project]/components/ui/dynamic-input.tsx",
                lineNumber: 78,
                columnNumber: 9
            }, this);
        case 'TEXT_CONDITION':
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TextConditionInput, {
                value: value,
                onChange: onChange,
                className: className,
                disabled: disabled
            }, void 0, false, {
                fileName: "[project]/components/ui/dynamic-input.tsx",
                lineNumber: 89,
                columnNumber: 9
            }, this);
        default:
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                type: "text",
                value: value,
                onChange: (e)=>onChange(e.target.value),
                placeholder: placeholder,
                disabled: disabled,
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('w-full px-3 py-2 text-sm border border-gray-300 rounded-md', 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent', disabled && 'bg-gray-100 cursor-not-allowed', className)
            }, void 0, false, {
                fileName: "[project]/components/ui/dynamic-input.tsx",
                lineNumber: 99,
                columnNumber: 9
            }, this);
    }
}
_c = DynamicInput;
/**
 * Milestone Input - Checkbox for binary completion (0/1)
 */ function MilestoneInput({ value, onChange, className, disabled }) {
    const isChecked = value === 1 || value === '1';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex items-center gap-2', className),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$checkbox$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Checkbox"], {
                checked: isChecked,
                onCheckedChange: (checked)=>onChange(checked ? 1 : 0),
                disabled: disabled,
                className: "h-5 w-5"
            }, void 0, false, {
                fileName: "[project]/components/ui/dynamic-input.tsx",
                lineNumber: 129,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-sm text-gray-600",
                children: isChecked ? 'Achieved' : 'Pending'
            }, void 0, false, {
                fileName: "[project]/components/ui/dynamic-input.tsx",
                lineNumber: 135,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ui/dynamic-input.tsx",
        lineNumber: 128,
        columnNumber: 5
    }, this);
}
_c1 = MilestoneInput;
/**
 * Count Input - Integer numbers only
 */ function CountInput({ value, onChange, placeholder, className, disabled }) {
    const handleChange = (e)=>{
        const inputValue = e.target.value;
        // Allow empty string or integers only
        if (inputValue === '' || /^\d+$/.test(inputValue)) {
            onChange(inputValue === '' ? '' : parseInt(inputValue, 10));
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
        type: "text",
        inputMode: "numeric",
        value: value,
        onChange: handleChange,
        placeholder: placeholder || '0',
        disabled: disabled,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('w-32 px-3 py-2 text-sm text-right border border-gray-300 rounded-md', 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent', disabled && 'bg-gray-100 cursor-not-allowed', className)
    }, void 0, false, {
        fileName: "[project]/components/ui/dynamic-input.tsx",
        lineNumber: 161,
        columnNumber: 5
    }, this);
}
_c2 = CountInput;
/**
 * Percentage Input - Decimals allowed, 0-100 range with % suffix
 */ function PercentageInput({ value, onChange, placeholder, className, disabled }) {
    const handleChange = (e)=>{
        const inputValue = e.target.value;
        // Allow empty string, numbers with optional decimal point
        if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
            const numValue = parseFloat(inputValue);
            // Validate range 0-100
            if (inputValue === '' || numValue >= 0 && numValue <= 100) {
                onChange(inputValue);
            }
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex items-center gap-1', className),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                type: "text",
                inputMode: "decimal",
                value: value,
                onChange: handleChange,
                placeholder: placeholder || '0',
                disabled: disabled,
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('w-24 px-3 py-2 text-sm text-right border border-gray-300 rounded-md', 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent', disabled && 'bg-gray-100 cursor-not-allowed')
            }, void 0, false, {
                fileName: "[project]/components/ui/dynamic-input.tsx",
                lineNumber: 202,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-sm text-gray-500 font-medium",
                children: "%"
            }, void 0, false, {
                fileName: "[project]/components/ui/dynamic-input.tsx",
                lineNumber: 215,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ui/dynamic-input.tsx",
        lineNumber: 201,
        columnNumber: 5
    }, this);
}
_c3 = PercentageInput;
/**
 * Financial Input - Currency with ₱ prefix and thousand separators
 */ function FinancialInput({ value, onChange, placeholder, className, disabled }) {
    // Format number with thousand separators
    const formatCurrency = (num)=>{
        if (!num && num !== 0) return '';
        const numStr = num.toString().replace(/,/g, '');
        const [intPart, decimalPart] = numStr.split('.');
        const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return decimalPart !== undefined ? `${formattedInt}.${decimalPart}` : formattedInt;
    };
    const handleChange = (e)=>{
        const inputValue = e.target.value.replace(/,/g, ''); // Remove existing commas
        // Allow empty string, numbers with optional decimal point (max 2 decimal places)
        if (inputValue === '' || /^\d*\.?\d{0,2}$/.test(inputValue)) {
            onChange(inputValue);
        }
    };
    const displayValue = formatCurrency(value);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex items-center gap-1', className),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-sm text-gray-500 font-medium",
                children: "₱"
            }, void 0, false, {
                fileName: "[project]/components/ui/dynamic-input.tsx",
                lineNumber: 251,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                type: "text",
                inputMode: "decimal",
                value: displayValue,
                onChange: handleChange,
                placeholder: placeholder || '0.00',
                disabled: disabled,
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('w-36 px-3 py-2 text-sm text-right border border-gray-300 rounded-md', 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent', disabled && 'bg-gray-100 cursor-not-allowed')
            }, void 0, false, {
                fileName: "[project]/components/ui/dynamic-input.tsx",
                lineNumber: 252,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ui/dynamic-input.tsx",
        lineNumber: 250,
        columnNumber: 5
    }, this);
}
_c4 = FinancialInput;
/**
 * Text Condition Input - Dropdown for qualitative status
 */ function TextConditionInput({ value, onChange, className, disabled }) {
    const options = [
        {
            value: 'Met',
            label: 'Met'
        },
        {
            value: 'Not Met',
            label: 'Not Met'
        },
        {
            value: 'In Progress',
            label: 'In Progress'
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Select"], {
        value: value.toString(),
        onValueChange: onChange,
        disabled: disabled,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectTrigger"], {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('w-40', className),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectValue"], {
                    placeholder: "Select status..."
                }, void 0, false, {
                    fileName: "[project]/components/ui/dynamic-input.tsx",
                    lineNumber: 291,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/ui/dynamic-input.tsx",
                lineNumber: 290,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectContent"], {
                children: options.map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                        value: option.value,
                        children: option.label
                    }, option.value, false, {
                        fileName: "[project]/components/ui/dynamic-input.tsx",
                        lineNumber: 295,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/ui/dynamic-input.tsx",
                lineNumber: 293,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/ui/dynamic-input.tsx",
        lineNumber: 285,
        columnNumber: 5
    }, this);
}
_c5 = TextConditionInput;
function validateDynamicInput(targetType, value) {
    if (!value && value !== 0) {
        return {
            isValid: false,
            error: 'Value is required'
        };
    }
    switch(targetType){
        case 'MILESTONE':
            if (value !== 0 && value !== 1 && value !== '0' && value !== '1') {
                return {
                    isValid: false,
                    error: 'Milestone must be 0 or 1'
                };
            }
            return {
                isValid: true
            };
        case 'COUNT':
            if (!/^\d+$/.test(value.toString())) {
                return {
                    isValid: false,
                    error: 'Count must be a whole number'
                };
            }
            return {
                isValid: true
            };
        case 'PERCENTAGE':
            const percentValue = parseFloat(value.toString());
            if (isNaN(percentValue) || percentValue < 0 || percentValue > 100) {
                return {
                    isValid: false,
                    error: 'Percentage must be between 0 and 100'
                };
            }
            return {
                isValid: true
            };
        case 'FINANCIAL':
            const financialValue = parseFloat(value.toString().replace(/,/g, ''));
            if (isNaN(financialValue) || financialValue < 0) {
                return {
                    isValid: false,
                    error: 'Amount must be a positive number'
                };
            }
            // Check max 2 decimal places
            if (!/^\d+(\.\d{0,2})?$/.test(value.toString().replace(/,/g, ''))) {
                return {
                    isValid: false,
                    error: 'Amount must have at most 2 decimal places'
                };
            }
            return {
                isValid: true
            };
        case 'TEXT_CONDITION':
            const validStatuses = [
                'Met',
                'Not Met',
                'In Progress'
            ];
            if (!validStatuses.includes(value.toString())) {
                return {
                    isValid: false,
                    error: 'Invalid status'
                };
            }
            return {
                isValid: true
            };
        default:
            return {
                isValid: true
            };
    }
}
function formatDisplayValue(targetType, value) {
    if (!value && value !== 0) return '-';
    switch(targetType){
        case 'MILESTONE':
            return value === 1 || value === '1' ? 'Achieved' : 'Pending';
        case 'COUNT':
            return value.toString();
        case 'PERCENTAGE':
            return `${value}%`;
        case 'FINANCIAL':
            const numValue = parseFloat(value.toString().replace(/,/g, ''));
            return `₱${numValue.toLocaleString('en-PH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;
        case 'TEXT_CONDITION':
            return value.toString();
        default:
            return value.toString();
    }
}
var _c, _c1, _c2, _c3, _c4, _c5;
__turbopack_context__.k.register(_c, "DynamicInput");
__turbopack_context__.k.register(_c1, "MilestoneInput");
__turbopack_context__.k.register(_c2, "CountInput");
__turbopack_context__.k.register(_c3, "PercentageInput");
__turbopack_context__.k.register(_c4, "FinancialInput");
__turbopack_context__.k.register(_c5, "TextConditionInput");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/utils/target-type-utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/qpro/kra/[kraId]/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>KRADetailPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-client] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.js [app-client] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$save$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Save$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/save.js [app-client] (ecmascript) <export default as Save>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [app-client] (ecmascript) <export default as RefreshCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2f$strategic_plan$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/lib/data/strategic_plan.json (json)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth-context.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$auth$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/services/auth-service.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$target$2d$displays$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/target-displays.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$target$2d$type$2d$detector$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils/target-type-detector.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dynamic$2d$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/dynamic-input.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$target$2d$type$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils/target-type-utils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
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
;
;
;
const kraColors = [
    'bg-red-100 text-red-800',
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-yellow-100 text-yellow-800',
    'bg-purple-100 text-purple-800',
    'bg-pink-100 text-pink-800',
    'bg-indigo-100 text-indigo-800',
    'bg-cyan-100 text-cyan-800',
    'bg-orange-100 text-orange-800',
    'bg-teal-100 text-teal-800',
    'bg-lime-100 text-lime-800',
    'bg-rose-100 text-rose-800',
    'bg-sky-100 text-sky-800',
    'bg-violet-100 text-violet-800',
    'bg-amber-100 text-amber-800',
    'bg-emerald-100 text-emerald-800',
    'bg-fuchsia-100 text-fuchsia-800',
    'bg-cyan-100 text-cyan-800',
    'bg-red-200 text-red-900',
    'bg-blue-200 text-blue-900',
    'bg-green-200 text-green-900',
    'bg-purple-200 text-purple-900'
];
// Helper function to normalize data - convert strings to arrays if needed
const normalizeToArray = (value)=>{
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return [
        value
    ];
    return [];
};
function KRADetailPage() {
    _s();
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const { isAuthenticated, isLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const kraIdRaw = params.kraId;
    // Decode the URL parameter - useParams returns encoded values
    const kraId = decodeURIComponent(kraIdRaw);
    const [analysisData, setAnalysisData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loadingAnalysis, setLoadingAnalysis] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // KPI Progress state (from QPRO uploaded documents)
    const [kpiProgress, setKpiProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loadingProgress, setLoadingProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedProgressYear, setSelectedProgressYear] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Date().getFullYear());
    const [selectedProgressQuarter, setSelectedProgressQuarter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    // QPRO-derived current values for the Targets-by-Year table
    const [qproDerivedValues, setQproDerivedValues] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    // Pending edits that haven't been saved to DB yet (keyed by "{initiativeId}-{year}-{quarter}")
    const [pendingEdits, setPendingEdits] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [savingOverride, setSavingOverride] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null); // Track which item is being saved
    // NOTE: We no longer use localStorage for persistence - all saves go to database
    // The old localStorage-based currentValues state is replaced by database-backed values
    // Get the effective current value for a specific initiative-year-quarter from API data
    const getCurrentValueFromProgress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "KRADetailPage.useCallback[getCurrentValueFromProgress]": (initiativeId, year, quarter)=>{
            if (!kpiProgress) return 0;
            const initiative = kpiProgress.initiatives?.find({
                "KRADetailPage.useCallback[getCurrentValueFromProgress]": (i)=>i.id === initiativeId
            }["KRADetailPage.useCallback[getCurrentValueFromProgress]"]);
            if (!initiative) return 0;
            if (quarter) {
                // Get specific quarter value
                const progressItem = initiative.progress?.find({
                    "KRADetailPage.useCallback[getCurrentValueFromProgress]": (p)=>p.year === year && p.quarter === quarter
                }["KRADetailPage.useCallback[getCurrentValueFromProgress]"]);
                return progressItem?.currentValue ?? 0;
            } else {
                // Sum all quarters for the year (only for numeric types)
                const yearItems = initiative.progress?.filter({
                    "KRADetailPage.useCallback[getCurrentValueFromProgress]": (p)=>p.year === year
                }["KRADetailPage.useCallback[getCurrentValueFromProgress]"]) || [];
                return yearItems.reduce({
                    "KRADetailPage.useCallback[getCurrentValueFromProgress]": (sum, item)=>{
                        const val = typeof item.currentValue === 'number' ? item.currentValue : parseFloat(String(item.currentValue)) || 0;
                        return sum + val;
                    }
                }["KRADetailPage.useCallback[getCurrentValueFromProgress]"], 0);
            }
        }
    }["KRADetailPage.useCallback[getCurrentValueFromProgress]"], [
        kpiProgress
    ]);
    // Get the value source for a specific initiative-year-quarter from API data
    const getValueSourceFromProgress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "KRADetailPage.useCallback[getValueSourceFromProgress]": (initiativeId, year, quarter)=>{
            if (!kpiProgress) return 'none';
            const initiative = kpiProgress.initiatives?.find({
                "KRADetailPage.useCallback[getValueSourceFromProgress]": (i)=>i.id === initiativeId
            }["KRADetailPage.useCallback[getValueSourceFromProgress]"]);
            if (!initiative) return 'none';
            if (quarter) {
                const progressItem = initiative.progress?.find({
                    "KRADetailPage.useCallback[getValueSourceFromProgress]": (p)=>p.year === year && p.quarter === quarter
                }["KRADetailPage.useCallback[getValueSourceFromProgress]"]);
                return progressItem?.valueSource || 'none';
            } else {
                // If any quarter has a value, return the highest priority source
                const yearItems = initiative.progress?.filter({
                    "KRADetailPage.useCallback[getValueSourceFromProgress]": (p)=>p.year === year
                }["KRADetailPage.useCallback[getValueSourceFromProgress]"]) || [];
                if (yearItems.some({
                    "KRADetailPage.useCallback[getValueSourceFromProgress]": (item)=>item.valueSource === 'manual'
                }["KRADetailPage.useCallback[getValueSourceFromProgress]"])) return 'manual';
                if (yearItems.some({
                    "KRADetailPage.useCallback[getValueSourceFromProgress]": (item)=>item.valueSource === 'qpro'
                }["KRADetailPage.useCallback[getValueSourceFromProgress]"])) return 'qpro';
                return 'none';
            }
        }
    }["KRADetailPage.useCallback[getValueSourceFromProgress]"], [
        kpiProgress
    ]);
    // Save a manual override value to the database
    const saveManualOverride = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "KRADetailPage.useCallback[saveManualOverride]": async (initiativeId, year, quarter, value, reason, targetType)=>{
            const key = `${initiativeId}-${year}-${quarter}`;
            setSavingOverride(key);
            try {
                const token = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$auth$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getAccessToken();
                const response = await fetch('/api/kpi-progress', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        kraId: kraId,
                        initiativeId,
                        year,
                        quarter,
                        value,
                        reason,
                        targetType
                    })
                });
                if (!response.ok) {
                    let error = {};
                    try {
                        error = await response.json();
                    } catch  {
                        // If response body is not JSON, try to get text
                        error = {
                            message: `HTTP ${response.status}`
                        };
                    }
                    console.error('Failed to save override:', error, 'Status:', response.status);
                    return false;
                }
                // Remove from pending edits on success
                setPendingEdits({
                    "KRADetailPage.useCallback[saveManualOverride]": (prev)=>{
                        const next = {
                            ...prev
                        };
                        delete next[key];
                        return next;
                    }
                }["KRADetailPage.useCallback[saveManualOverride]"]);
                // Always refresh KPI progress for the whole year (all quarters)
                const params = new URLSearchParams({
                    kraId: kraId,
                    year: selectedProgressYear.toString(),
                    _t: Date.now().toString()
                });
                const refreshResponse = await fetch(`/api/kpi-progress?${params}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (refreshResponse.ok) {
                    const api = await refreshResponse.json();
                    setKpiProgress(api.data);
                }
                return true;
            } catch (error) {
                console.error('Error saving manual override:', error);
                return false;
            } finally{
                setSavingOverride(null);
            }
        }
    }["KRADetailPage.useCallback[saveManualOverride]"], [
        kraId,
        selectedProgressYear,
        selectedProgressQuarter
    ]);
    // Update a pending edit (before saving to DB)
    const updatePendingEdit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "KRADetailPage.useCallback[updatePendingEdit]": (initiativeId, year, quarter, value)=>{
            const key = `${initiativeId}-${year}-${quarter}`;
            // Keep as-is (string or number) based on input type
            const finalValue = value === '' ? 0 : value;
            setPendingEdits({
                "KRADetailPage.useCallback[updatePendingEdit]": (prev)=>({
                        ...prev,
                        [key]: {
                            value: finalValue
                        }
                    })
            }["KRADetailPage.useCallback[updatePendingEdit]"]);
        }
    }["KRADetailPage.useCallback[updatePendingEdit]"], []);
    // Get current value for display (pending edit → API value → 0)
    const getDisplayValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "KRADetailPage.useCallback[getDisplayValue]": (initiativeId, year, quarter)=>{
            const key = `${initiativeId}-${year}-${quarter}`;
            if (pendingEdits[key] !== undefined) {
                return pendingEdits[key].value;
            }
            return getCurrentValueFromProgress(initiativeId, year, quarter);
        }
    }["KRADetailPage.useCallback[getDisplayValue]"], [
        pendingEdits,
        getCurrentValueFromProgress
    ]);
    // Check if there's a pending edit for this item
    const hasPendingEdit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "KRADetailPage.useCallback[hasPendingEdit]": (initiativeId, year, quarter)=>{
            const key = `${initiativeId}-${year}-${quarter}`;
            return pendingEdits[key] !== undefined;
        }
    }["KRADetailPage.useCallback[hasPendingEdit]"], [
        pendingEdits
    ]);
    // Clear all pending edits and reset to API values
    const clearPendingEdits = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "KRADetailPage.useCallback[clearPendingEdits]": ()=>{
            setPendingEdits({});
        }
    }["KRADetailPage.useCallback[clearPendingEdits]"], []);
    // Direct access to KRA
    const allKras = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2f$strategic_plan$2e$json__$28$json$29$__["default"].kras || [];
    const kra = allKras.find((k)=>k.kra_id === kraId) || null;
    const kraColorClass = kra ? kraColors[(parseInt(kra.kra_id.split(' ')[1]) - 1) % kraColors.length] : kraColors[0];
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "KRADetailPage.useEffect": ()=>{
            if (!isAuthenticated || isLoading) return;
            const fetchAnalysisData = {
                "KRADetailPage.useEffect.fetchAnalysisData": async ()=>{
                    try {
                        setLoadingAnalysis(true);
                        const token = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$auth$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getAccessToken();
                        const response = await fetch(`/api/qpro-analyses?kraId=${kraId}`, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        });
                        if (response.ok) {
                            const data = await response.json();
                            setAnalysisData(data);
                        }
                    } catch (error) {
                        console.error('Error fetching analysis data:', error);
                    } finally{
                        setLoadingAnalysis(false);
                    }
                }
            }["KRADetailPage.useEffect.fetchAnalysisData"];
            fetchAnalysisData();
        }
    }["KRADetailPage.useEffect"], [
        kraId,
        isAuthenticated,
        isLoading
    ]);
    // Fetch KPI progress from QPRO documents - fetches all quarters for the year
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "KRADetailPage.useEffect": ()=>{
            if (!isAuthenticated || isLoading || !kraId) return;
            const fetchKPIProgress = {
                "KRADetailPage.useEffect.fetchKPIProgress": async ()=>{
                    try {
                        setLoadingProgress(true);
                        const token = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$services$2f$auth$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].getAccessToken();
                        // Fetch without quarter param to get all quarters for the year
                        // Add cache-busting param to ensure fresh data
                        const params = new URLSearchParams({
                            kraId: kraId,
                            year: selectedProgressYear.toString(),
                            _t: Date.now().toString()
                        });
                        const response = await fetch(`/api/kpi-progress?${params}`, {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Cache-Control': 'no-cache'
                            }
                        });
                        if (response.ok) {
                            const api = await response.json();
                            setKpiProgress(api.data);
                            // Build QPRO-derived values map for the per-quarter table
                            const derived = {};
                            for (const initiative of api.data.initiatives || []){
                                const progressItems = (initiative.progress || []).filter({
                                    "KRADetailPage.useEffect.fetchKPIProgress.progressItems": (p)=>p.year === selectedProgressYear
                                }["KRADetailPage.useEffect.fetchKPIProgress.progressItems"]);
                                for (const pItem of progressItems){
                                    const key = `${initiative.id}-${pItem.year}-${pItem.quarter}`;
                                    derived[key] = pItem.currentValue || 0;
                                }
                            }
                            setQproDerivedValues(derived);
                        }
                    } catch (error) {
                        console.error('Error fetching KPI progress:', error);
                    } finally{
                        setLoadingProgress(false);
                    }
                }
            }["KRADetailPage.useEffect.fetchKPIProgress"];
            fetchKPIProgress();
        }
    }["KRADetailPage.useEffect"], [
        kraId,
        isAuthenticated,
        isLoading,
        selectedProgressYear
    ]);
    if (isLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center min-h-screen",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-lg text-gray-600",
                children: "Loading..."
            }, void 0, false, {
                fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                lineNumber: 397,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
            lineNumber: 396,
            columnNumber: 7
        }, this);
    }
    if (!isAuthenticated) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center min-h-screen",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-lg text-gray-600",
                children: "Please log in to view this page."
            }, void 0, false, {
                fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                lineNumber: 405,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
            lineNumber: 404,
            columnNumber: 7
        }, this);
    }
    if (!kra) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-gray-50 p-8",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                    variant: "outline",
                    onClick: ()=>router.back(),
                    className: "mb-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                            className: "w-4 h-4 mr-2"
                        }, void 0, false, {
                            fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                            lineNumber: 418,
                            columnNumber: 11
                        }, this),
                        "Back to Strategic Commitments"
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                    lineNumber: 413,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white rounded-lg border border-gray-300 p-8",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                                className: "w-6 h-6 text-red-500"
                            }, void 0, false, {
                                fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                lineNumber: 423,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-xl font-semibold text-gray-900",
                                        children: "KRA Not Found"
                                    }, void 0, false, {
                                        fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                        lineNumber: 425,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-gray-600 mt-1",
                                        children: "The requested KRA could not be found."
                                    }, void 0, false, {
                                        fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                        lineNumber: 426,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                lineNumber: 424,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                        lineNumber: 422,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                    lineNumber: 421,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
            lineNumber: 412,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-gray-50 p-4 sm:p-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                variant: "outline",
                onClick: ()=>router.back(),
                className: "mb-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                        className: "w-4 h-4 mr-2"
                    }, void 0, false, {
                        fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                        lineNumber: 441,
                        columnNumber: 9
                    }, this),
                    "Back to Strategic Commitments"
                ]
            }, void 0, true, {
                fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                lineNumber: 436,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white rounded-lg border border-gray-200 p-6 sm:p-8 mb-8",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col sm:flex-row sm:items-start gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                            className: `${kraColorClass} text-lg font-bold w-fit`,
                            children: kra.kra_id
                        }, void 0, false, {
                            fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                            lineNumber: 448,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "text-2xl sm:text-3xl font-bold text-gray-900 mb-3",
                                    children: kra.kra_title
                                }, void 0, false, {
                                    fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                    lineNumber: 452,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-gray-100 rounded p-4",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-gray-700 text-sm sm:text-base",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-semibold",
                                                children: "Guiding Principle: "
                                            }, void 0, false, {
                                                fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                lineNumber: 457,
                                                columnNumber: 17
                                            }, this),
                                            kra.guiding_principle
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                        lineNumber: 456,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                    lineNumber: 455,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                            lineNumber: 451,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                    lineNumber: 447,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                lineNumber: 446,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-2xl font-bold text-gray-900",
                        children: "Key Performance Indicators (KPIs)"
                    }, void 0, false, {
                        fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                        lineNumber: 468,
                        columnNumber: 9
                    }, this),
                    kra.initiatives && kra.initiatives.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid gap-6",
                        children: kra.initiatives.map((initiative, index)=>{
                            const initiativeProgress = kpiProgress?.initiatives?.find((i)=>i.id === initiative.id);
                            const quarterProgressItem = initiativeProgress?.progress?.find((p)=>p.year === selectedProgressYear && p.quarter === selectedProgressQuarter);
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                className: "overflow-hidden",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                                        className: "bg-gray-50 border-b",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-start justify-between gap-4",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                                                        className: "text-lg",
                                                        children: initiative.id || `KPI ${index + 1}`
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                        lineNumber: 483,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "mt-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-sm text-gray-600",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "font-semibold",
                                                                        children: "Outputs: "
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                                        lineNumber: 488,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    initiative.key_performance_indicator?.outputs
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                                lineNumber: 487,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-sm text-gray-600 mt-1",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "font-semibold",
                                                                        children: "Outcomes: "
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                                        lineNumber: 492,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    initiative.key_performance_indicator?.outcomes
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                                lineNumber: 491,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                        lineNumber: 486,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                lineNumber: 482,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                            lineNumber: 481,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                        lineNumber: 480,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                                        className: "p-6 space-y-6",
                                        children: [
                                            (()=>{
                                                const strategies = normalizeToArray(initiative.strategies);
                                                return strategies.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                            className: "font-semibold text-gray-900 mb-2",
                                                            children: "Strategies"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                            lineNumber: 507,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                                            className: "list-disc list-inside space-y-1 text-gray-700 text-sm",
                                                            children: strategies.map((strategy, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                                    children: strategy
                                                                }, i, false, {
                                                                    fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                                    lineNumber: 510,
                                                                    columnNumber: 29
                                                                }, this))
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                            lineNumber: 508,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                    lineNumber: 506,
                                                    columnNumber: 23
                                                }, this) : null;
                                            })(),
                                            (()=>{
                                                const activities = normalizeToArray(initiative.programs_activities);
                                                return activities.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                            className: "font-semibold text-gray-900 mb-2",
                                                            children: "Programs/Activities"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                            lineNumber: 522,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                                            className: "list-disc list-inside space-y-1 text-gray-700 text-sm",
                                                            children: activities.map((activity, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                                    children: activity
                                                                }, i, false, {
                                                                    fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                                    lineNumber: 525,
                                                                    columnNumber: 29
                                                                }, this))
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                            lineNumber: 523,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                    lineNumber: 521,
                                                    columnNumber: 23
                                                }, this) : null;
                                            })(),
                                            (()=>{
                                                const offices = normalizeToArray(initiative.responsible_offices);
                                                return offices.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                            className: "font-semibold text-gray-900 mb-2",
                                                            children: "Responsible Offices"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                            lineNumber: 537,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                                            className: "list-disc list-inside space-y-1 text-gray-700 text-sm",
                                                            children: offices.map((office, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                                    children: office
                                                                }, i, false, {
                                                                    fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                                    lineNumber: 540,
                                                                    columnNumber: 29
                                                                }, this))
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                            lineNumber: 538,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                    lineNumber: 536,
                                                    columnNumber: 23
                                                }, this) : null;
                                            })(),
                                            initiative.targets && initiative.targets.timeline_data && initiative.targets.timeline_data.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center justify-between mb-3",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                className: "font-semibold text-gray-900",
                                                                children: "Targets by Year"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                                lineNumber: 551,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center gap-2",
                                                                children: Object.keys(pendingEdits).length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                                    size: "sm",
                                                                    variant: "outline",
                                                                    onClick: clearPendingEdits,
                                                                    className: "flex items-center gap-1 text-gray-600 border-gray-300 hover:bg-gray-50",
                                                                    title: "Discard unsaved changes",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                                                            className: "h-3 w-3"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                                            lineNumber: 561,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        "Discard Changes"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                                    lineNumber: 554,
                                                                    columnNumber: 29
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                                lineNumber: 552,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                        lineNumber: 550,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "overflow-x-auto",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                                            className: "w-full text-sm border-collapse",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                                        className: "bg-gray-100 border-b",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                                className: "px-3 py-2 text-left font-semibold text-gray-900 w-20",
                                                                                children: "Year"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                                                lineNumber: 571,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                                className: "px-3 py-2 text-left font-semibold text-gray-900 w-20",
                                                                                children: "Quarter"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                                                lineNumber: 572,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                                className: "px-3 py-2 text-left font-semibold text-gray-900 w-32",
                                                                                children: "Annual Target"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                                                lineNumber: 573,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                                className: "px-3 py-2 text-left font-semibold text-gray-900 w-48",
                                                                                children: "Current Value"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                                                lineNumber: 574,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                                                className: "px-3 py-2 text-left font-semibold text-gray-900",
                                                                                children: "Progress"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                                                lineNumber: 575,
                                                                                columnNumber: 31
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                                        lineNumber: 570,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                                    lineNumber: 569,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                                                    children: initiative.targets.timeline_data.map((timelineItem, i)=>{
                                                                        const targetConfig = {
                                                                            type: initiative.targets.type,
                                                                            currency: initiative.targets.currency,
                                                                            low_count_threshold: initiative.targets.low_count_threshold
                                                                        };
                                                                        // Always show Q1-Q4 for every year present in timeline_data
                                                                        const quarters = [
                                                                            1,
                                                                            2,
                                                                            3,
                                                                            4
                                                                        ];
                                                                        // Get quarterly data from kpiProgress
                                                                        const initiativeProgress = kpiProgress?.initiatives?.find((ip)=>ip.id === initiative.id);
                                                                        const quarterlyItems = initiativeProgress?.progress?.filter((p)=>p.year === timelineItem.year) || [];
                                                                        return quarters.map((quarter, qIdx)=>{
                                                                            // If there is a quarterly item for this quarter, use its value, else use the annual target value
                                                                            const quarterItem = quarterlyItems.find((q)=>q.quarter === quarter);
                                                                            // If no quarterly data, use the annual target value for all quarters
                                                                            const displayValue = getDisplayValue(initiative.id, timelineItem.year, quarter);
                                                                            const valueSource = quarterItem?.valueSource || getValueSourceFromProgress(initiative.id, timelineItem.year, quarter);
                                                                            const isPending = hasPendingEdit(initiative.id, timelineItem.year, quarter);
                                                                            const cellKey = `${initiative.id}-${timelineItem.year}-${quarter}`;
                                                                            const isSaving = savingOverride === cellKey;
                                                                            const displayType = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$target$2d$type$2d$detector$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["detectTargetType"])(timelineItem.target_value, displayValue, targetConfig);
                                                                            const displayInfo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$target$2d$type$2d$detector$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getTargetDisplayInfo"])(timelineItem.target_value, displayValue, targetConfig);
                                                                            // Map target type from strategic plan to TargetType enum
                                                                            const planTargetType = initiative.targets?.type || 'count';
                                                                            const dynamicTargetType = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$target$2d$type$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mapTargetType"])(planTargetType);
                                                                            const inputType = displayType === 'milestone' ? 'text' : displayType === 'percentage' ? 'percentage' : displayType === 'currency' ? 'currency' : 'number';
                                                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                                                className: `border-b hover:bg-gray-50 ${qIdx === 0 ? 'border-t-2 border-t-gray-200' : ''}`,
                                                                                children: [
                                                                                    qIdx === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                        className: "px-3 py-2 text-gray-900 font-medium",
                                                                                        rowSpan: quarters.length,
                                                                                        children: timelineItem.year
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                                                        lineNumber: 629,
                                                                                        columnNumber: 39
                                                                                    }, this) : null,
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                        className: "px-3 py-2 text-gray-600",
                                                                                        children: [
                                                                                            "Q",
                                                                                            quarter
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                                                        lineNumber: 635,
                                                                                        columnNumber: 37
                                                                                    }, this),
                                                                                    qIdx === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                        className: "px-3 py-2 text-gray-700",
                                                                                        rowSpan: quarters.length,
                                                                                        children: [
                                                                                            displayInfo.formattedTarget,
                                                                                            initiative.targets.unit_basis && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                className: "text-xs text-gray-500 block",
                                                                                                children: initiative.targets.unit_basis
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                                                                lineNumber: 644,
                                                                                                columnNumber: 43
                                                                                            }, this)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                                                        lineNumber: 641,
                                                                                        columnNumber: 39
                                                                                    }, this) : null,
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                        className: "px-3 py-2",
                                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                            className: "flex items-center gap-2",
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$dynamic$2d$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DynamicInput"], {
                                                                                                    targetType: dynamicTargetType,
                                                                                                    value: displayValue ?? '',
                                                                                                    onChange: (val)=>updatePendingEdit(initiative.id, timelineItem.year, quarter, val),
                                                                                                    placeholder: dynamicTargetType === 'TEXT_CONDITION' ? 'Select status...' : '0'
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                                                                    lineNumber: 654,
                                                                                                    columnNumber: 41
                                                                                                }, this),
                                                                                                isPending && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                                                                    size: "sm",
                                                                                                    variant: "default",
                                                                                                    onClick: ()=>{
                                                                                                        const editValue = pendingEdits[`${initiative.id}-${timelineItem.year}-${quarter}`]?.value;
                                                                                                        // Handle different target types
                                                                                                        let valueToSave = null;
                                                                                                        if (dynamicTargetType === 'MILESTONE') {
                                                                                                            // Milestone: boolean 0/1
                                                                                                            valueToSave = editValue === 1 || editValue === '1' ? 1 : 0;
                                                                                                        } else if (dynamicTargetType === 'TEXT_CONDITION') {
                                                                                                            // Text condition: string value
                                                                                                            valueToSave = editValue ? String(editValue) : null;
                                                                                                        } else {
                                                                                                            // Numeric types: COUNT, PERCENTAGE, FINANCIAL
                                                                                                            const numValue = typeof editValue === 'string' ? parseFloat(editValue.replace(/,/g, '')) : editValue;
                                                                                                            // Handle NaN case - treat as clearing the override
                                                                                                            valueToSave = typeof numValue === 'number' && !Number.isNaN(numValue) ? numValue : null;
                                                                                                        }
                                                                                                        // Get QPRO value for this cell
                                                                                                        const qproVal = getCurrentValueFromProgress(initiative.id, timelineItem.year, quarter);
                                                                                                        // If user entered 0 and QPRO value is also 0, treat as clear override
                                                                                                        if (typeof valueToSave === 'number' && valueToSave === 0 && qproVal === 0) {
                                                                                                            valueToSave = null;
                                                                                                        }
                                                                                                        saveManualOverride(initiative.id, timelineItem.year, quarter, valueToSave, undefined, dynamicTargetType);
                                                                                                    },
                                                                                                    disabled: isSaving,
                                                                                                    className: "h-7 px-2 text-xs",
                                                                                                    children: isSaving ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                        className: "animate-spin",
                                                                                                        children: "⟳"
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                                                                        lineNumber: 698,
                                                                                                        columnNumber: 47
                                                                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                                                                        children: [
                                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$save$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Save$3e$__["Save"], {
                                                                                                                className: "h-3 w-3 mr-1"
                                                                                                            }, void 0, false, {
                                                                                                                fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                                                                                lineNumber: 701,
                                                                                                                columnNumber: 49
                                                                                                            }, this),
                                                                                                            "Save"
                                                                                                        ]
                                                                                                    }, void 0, true)
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                                                                    lineNumber: 663,
                                                                                                    columnNumber: 43
                                                                                                }, this),
                                                                                                !isPending && valueSource === 'qpro' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                    className: "text-xs text-green-600 whitespace-nowrap",
                                                                                                    title: "Value from approved QPRO analysis",
                                                                                                    children: "✓ QPRO"
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                                                                    lineNumber: 710,
                                                                                                    columnNumber: 43
                                                                                                }, this)
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                                                            lineNumber: 653,
                                                                                            columnNumber: 39
                                                                                        }, this)
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                                                        lineNumber: 652,
                                                                                        columnNumber: 37
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                                                        className: "px-3 py-3 min-w-[200px]",
                                                                                        children: [
                                                                                            displayType === 'percentage' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$target$2d$displays$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PercentageProgress"], {
                                                                                                currentValue: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$target$2d$type$2d$detector$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseNumericValue"])(displayValue ?? 0),
                                                                                                targetValue: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$target$2d$type$2d$detector$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseNumericValue"])(timelineItem.target_value)
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                                                                lineNumber: 720,
                                                                                                columnNumber: 41
                                                                                            }, this),
                                                                                            displayType === 'currency' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$target$2d$displays$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CurrencyProgress"], {
                                                                                                currentValue: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$target$2d$type$2d$detector$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseNumericValue"])(displayValue ?? 0),
                                                                                                targetValue: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$target$2d$type$2d$detector$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseNumericValue"])(timelineItem.target_value),
                                                                                                formattedCurrent: displayInfo.formattedCurrent,
                                                                                                formattedTarget: displayInfo.formattedTarget
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                                                                lineNumber: 726,
                                                                                                columnNumber: 41
                                                                                            }, this),
                                                                                            displayType === 'high_volume' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$target$2d$displays$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HighVolumeProgress"], {
                                                                                                currentValue: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$target$2d$type$2d$detector$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseNumericValue"])(displayValue ?? 0),
                                                                                                targetValue: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$target$2d$type$2d$detector$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseNumericValue"])(timelineItem.target_value),
                                                                                                formattedCurrent: displayInfo.formattedCurrent,
                                                                                                formattedTarget: displayInfo.formattedTarget,
                                                                                                unit: initiative.targets.unit_basis
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                                                                lineNumber: 734,
                                                                                                columnNumber: 41
                                                                                            }, this),
                                                                                            displayType === 'low_count' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$target$2d$displays$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FractionalDisplay"], {
                                                                                                currentValue: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$target$2d$type$2d$detector$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseNumericValue"])(displayValue ?? 0),
                                                                                                targetValue: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$target$2d$type$2d$detector$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseNumericValue"])(timelineItem.target_value),
                                                                                                unit: initiative.targets.unit_basis
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                                                                lineNumber: 743,
                                                                                                columnNumber: 41
                                                                                            }, this),
                                                                                            displayType === 'milestone' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$target$2d$displays$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["StatusBadge"], {
                                                                                                status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$target$2d$type$2d$detector$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMilestoneStatus"])(displayValue, timelineItem.target_value),
                                                                                                currentValue: displayValue?.toString(),
                                                                                                targetValue: timelineItem.target_value.toString()
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                                                                lineNumber: 750,
                                                                                                columnNumber: 41
                                                                                            }, this)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                                                        lineNumber: 718,
                                                                                        columnNumber: 37
                                                                                    }, this)
                                                                                ]
                                                                            }, `${i}-${quarter}`, true, {
                                                                                fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                                                lineNumber: 623,
                                                                                columnNumber: 35
                                                                            }, this);
                                                                        });
                                                                    })
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                                    lineNumber: 578,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                            lineNumber: 568,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                        lineNumber: 567,
                                                        columnNumber: 23
                                                    }, this),
                                                    initiative.targets.timeline_data.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "mt-4 p-3 bg-blue-50 rounded-lg",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h5", {
                                                                className: "font-medium text-blue-900 text-sm mb-2",
                                                                children: "Year Totals"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                                lineNumber: 768,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex flex-wrap gap-4",
                                                                children: initiative.targets.timeline_data.map((timelineItem, i)=>{
                                                                    const initiativeProgress = kpiProgress?.initiatives?.find((ip)=>ip.id === initiative.id);
                                                                    const yearItems = initiativeProgress?.progress?.filter((p)=>p.year === timelineItem.year) || [];
                                                                    const yearTotal = yearItems.reduce((sum, item)=>{
                                                                        const val = typeof item.currentValue === 'number' ? item.currentValue : parseFloat(String(item.currentValue)) || 0;
                                                                        return sum + val;
                                                                    }, 0);
                                                                    const targetNum = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2f$target$2d$type$2d$detector$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseNumericValue"])(timelineItem.target_value);
                                                                    const yearPct = targetNum > 0 ? Math.min(100, Math.round(yearTotal / targetNum * 100)) : 0;
                                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "text-sm",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "font-medium text-blue-800",
                                                                                children: [
                                                                                    timelineItem.year,
                                                                                    ":"
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                                                lineNumber: 782,
                                                                                columnNumber: 35
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "ml-2 text-blue-700",
                                                                                children: [
                                                                                    yearTotal,
                                                                                    " / ",
                                                                                    timelineItem.target_value
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                                                lineNumber: 783,
                                                                                columnNumber: 35
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: `ml-2 font-medium ${yearPct >= 100 ? 'text-green-700' : yearPct >= 80 ? 'text-blue-700' : 'text-amber-700'}`,
                                                                                children: [
                                                                                    "(",
                                                                                    yearPct,
                                                                                    "%)"
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                                                lineNumber: 784,
                                                                                columnNumber: 35
                                                                            }, this)
                                                                        ]
                                                                    }, i, true, {
                                                                        fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                                        lineNumber: 781,
                                                                        columnNumber: 33
                                                                    }, this);
                                                                })
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                                lineNumber: 769,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                        lineNumber: 767,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                                lineNumber: 549,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                        lineNumber: 501,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, index, true, {
                                fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                                lineNumber: 479,
                                columnNumber: 15
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                        lineNumber: 471,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-white rounded-lg border border-gray-300 p-8 text-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-gray-600",
                            children: "No KPIs found for this KRA."
                        }, void 0, false, {
                            fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                            lineNumber: 802,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                        lineNumber: 801,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
                lineNumber: 467,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/qpro/kra/[kraId]/page.tsx",
        lineNumber: 435,
        columnNumber: 5
    }, this);
}
_s(KRADetailPage, "DfieOwzgjT2VuOuQ30CTc1DDMaM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2d$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = KRADetailPage;
var _c;
__turbopack_context__.k.register(_c, "KRADetailPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_7a69f34d._.js.map