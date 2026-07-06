const crypto = require("crypto");

const STORE_KEY = "__FCA_CTE_SHADOW_ENVIRONMENT__";

const CTE_STUDENT_ROLES = new Set([
	"student",
	"cte-student",
	"cte_student",
	"cte student",
	"minor",
	"minor-student",
	"learner-minor",
	"cte-learner",
]);

const LIVE_API_BLOCKLIST = Object.freeze([
	"auricrux-central",
	"stripe",
	"email-service-provider",
	"sms-provider",
	"marketing-automation",
	"payment-gateway",
	"live-production-database",
]);

const PII_KEY_PATTERN = /email|phone|name|contact|address|street|city|state|zip|dob|birth|ssn|password|token|cookie|secret|authorization/i;
const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE_PATTERN = /(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}/g;
const SSN_PATTERN = /\b\d{3}-\d{2}-\d{4}\b/g;

const corsHeaders = {
	"Content-Type": "application/json",
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type, Accept, Authorization, x-fca-route, x-fca-customer-id, x-fca-tenant-id, x-fca-user-id, x-fca-user-role, x-fca-shadow-mode, x-fca-minor-privacy-mode, x-fca-auricrux-mode, x-fca-continuous-auth, x-fca-auth-issued-at, x-fca-access-token-expires-at, x-fca-source-environment, x-fca-target-environment, x-fca-auth-provider, x-fca-service-auth, x-fca-agent, x-fca-service-account, x-fca-service-role, x-fca-service-scope, x-fca-auricrux-prompt, x-fca-auricrux-context, x-fca-auricrux-action",
};

function getHeader(req, name) {
	const headers = req?.headers || {};
	if (typeof headers.get === "function") return headers.get(name) || headers.get(name.toLowerCase()) || "";
	return headers[name] || headers[name.toLowerCase()] || "";
}

function normalizeRole(role = "") {
	return String(role || "").trim().toLowerCase().replace(/_/g, "-");
}

function isCteStudentRole(role = "") {
	const normalized = normalizeRole(role);
	return CTE_STUDENT_ROLES.has(normalized) || (normalized.includes("cte") && normalized.includes("student"));
}

function isCteShadowRequest(req) {
	const shadowMode = String(getHeader(req, "x-fca-shadow-mode") || "").toLowerCase();
	const minorMode = String(getHeader(req, "x-fca-minor-privacy-mode") || "").toLowerCase();
	const role = getHeader(req, "x-fca-user-role") || req?.body?.role || req?.query?.role || "";
	return shadowMode === "cte-sandbox" || minorMode === "true" || isCteStudentRole(role);
}

function hashStable(value = "") {
	return crypto.createHash("sha256").update(String(value || "cte-shadow-anonymous")).digest("hex").slice(0, 16);
}

function redactString(value = "") {
	return String(value)
		.replace(EMAIL_PATTERN, "[redacted-minor-email]")
		.replace(PHONE_PATTERN, "[redacted-minor-phone]")
		.replace(SSN_PATTERN, "[redacted-minor-ssn]");
}

function sanitizeForMinorTelemetry(value, key = "") {
	if (value === null || value === undefined) return value;
	if (PII_KEY_PATTERN.test(String(key || ""))) return "[redacted-minor-pii]";
	if (typeof value === "string") return redactString(value);
	if (typeof value === "number" || typeof value === "boolean") return value;
	if (Array.isArray(value)) return value.map((item) => sanitizeForMinorTelemetry(item));
	if (typeof value === "object") {
		return Object.fromEntries(
			Object.entries(value).map(([childKey, childValue]) => [childKey, sanitizeForMinorTelemetry(childValue, childKey)]),
		);
	}
	return "[redacted-minor-pii]";
}

function shadowStore() {
	if (!globalThis[STORE_KEY]) {
		globalThis[STORE_KEY] = {
			reads: [],
			writes: [],
			auricrux: [],
			payments: [],
		};
	}
	return globalThis[STORE_KEY];
}

function resolveShadowContext(req, resourcePath = "/") {
	const role = getHeader(req, "x-fca-user-role") || req?.body?.role || "CTE_Student";
	const route = getHeader(req, "x-fca-route") || req?.body?.sourceRoute || req?.body?.route || "/portal/platform";
	const tenantSeed = getHeader(req, "x-fca-tenant-id") || getHeader(req, "x-fca-customer-id") || "cte-shadow-tenant";
	const userSeed = getHeader(req, "x-fca-user-id") || "cte-shadow-student";
	return {
		active: true,
		mode: "cte-shadow-sandbox",
		role: normalizeRole(role) || "cte-student",
		route,
		resourcePath,
		databaseTarget: "cte-shadow-staging",
		productionDatabaseBypassed: true,
		liveApisBypassed: true,
		minorPrivacyMode: true,
		piiCollectionBlocked: true,
		tenantAlias: `cte-shadow-${hashStable(tenantSeed)}`,
		studentAlias: `student-${hashStable(userSeed)}`,
	};
}

function nowIso() {
	return new Date().toISOString();
}

function shadowEvent(req, resourcePath, body = {}) {
	return {
		id: `SHADOW-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
		createdAt: nowIso(),
		method: req?.method || "GET",
		resourcePath,
		context: resolveShadowContext(req, resourcePath),
		payload: sanitizeForMinorTelemetry(body),
	};
}

function buildSimulatedLogs(actionLabel, context) {
	return [
		`CTE shadow mode active for ${context.route}.`,
		"Live production database read/write bypassed; cte-shadow-staging selected.",
		"External API calls blocked: email, marketing, payment, and live Auricrux execution.",
		`${actionLabel} completed as a simulated training event with minor-safe telemetry only.`,
	];
}

function buildCteShadowProxyPayload(req, resourcePath, body = {}) {
	const store = shadowStore();
	const context = resolveShadowContext(req, resourcePath);
	const event = shadowEvent(req, resourcePath, body);
	const method = String(req?.method || "GET").toUpperCase();
	const isRead = method === "GET" || method === "HEAD";

	if (isRead) store.reads.unshift(event);
	else store.writes.unshift(event);
	store.reads = store.reads.slice(0, 500);
	store.writes = store.writes.slice(0, 500);

	return {
		ok: true,
		shadowEnvironment: true,
		mode: context.mode,
		resourcePath,
		method,
		backingSource: "cte-shadow-staging",
		databaseTarget: context.databaseTarget,
		productionDatabaseBypassed: true,
		noLiveApis: true,
		minorPrivacy: {
			coppaFerpaAligned: true,
			piiCollectionBlocked: true,
			telemetryPolicy: "redact-real-world-student-pii-before-storage",
		},
		context,
		items: isRead ? [] : undefined,
		data: isRead ? { simulated: true, items: [] } : { simulated: true, eventId: event.id, accepted: true },
		simulatedLogs: buildSimulatedLogs(isRead ? "Read" : "Write", context),
	};
}

function buildCteMockAuricruxPayload(req, body = {}, resourcePath = "/auricrux") {
	const store = shadowStore();
	const context = resolveShadowContext(req, resourcePath);
	const sanitized = sanitizeForMinorTelemetry(body);
	const actionLabel = sanitized?.capabilityId || sanitized?.action || sanitized?.mode || "Auricrux command";
	const method = String(req?.method || "GET").toUpperCase();
	const event = {
		...shadowEvent(req, resourcePath, sanitized),
		auricruxMode: "mock-execution",
		actionLabel,
	};
	store.auricrux.unshift(event);
	store.auricrux = store.auricrux.slice(0, 500);
	const item = {
		id: event.id,
		mode: sanitized.mode || (method === "GET" ? "review" : "mock"),
		targetObjectType: sanitized.targetObjectType || "ShadowOperation",
		targetObjectId: sanitized.targetObjectId || "cte-shadow-operation",
		rationale: sanitized.rationale || sanitized.message || "CTE shadow operation",
		sourceRoute: sanitized.sourceRoute || sanitized.route || context.route,
		createdAt: event.createdAt,
	};

	return {
		ok: true,
		shadowEnvironment: true,
		deterministic: true,
		poweredByLlm: false,
		operational: false,
		executed: false,
		mockExecution: true,
		mode: "auricrux-mock-execution",
		noLiveApis: true,
		blockedExternalApis: LIVE_API_BLOCKLIST,
		backingSource: "cte-shadow-staging",
		context,
		reply: `Mock Auricrux execution complete: ${actionLabel}. No email, payment, marketing, production database, or live outreach API was contacted. Simulated evidence has been queued for instructor review.`,
		guidance: {
			reply: "This is a simulated CTE training result. Review the generated log, explain the trade/compliance reasoning, and submit it for instructor sign-off.",
			contextKey: "Cte_Shadow_Mock_Execution",
		},
		item,
		items: method === "GET" ? [item] : undefined,
		pendingReview: true,
		reviewItem: {
			id: `review-${event.id}`,
			status: "Pending Instructor Review",
			createdAt: event.createdAt,
			summary: "CTE shadow action completed in mock mode and requires instructor review.",
		},
		simulatedLogs: buildSimulatedLogs("Auricrux mock execution", context),
		minorPrivacy: {
			coppaFerpaAligned: true,
			piiCollectionBlocked: true,
			telemetryPolicy: "mock-execution-log-redacted-before-storage",
		},
	};
}

function buildCteMockPaymentPayload(req, body = {}) {
	const store = shadowStore();
	const context = resolveShadowContext(req, "/stripe-checkout");
	const event = shadowEvent(req, "/stripe-checkout", body);
	store.payments.unshift(event);
	store.payments = store.payments.slice(0, 500);

	return {
		ok: true,
		shadowEnvironment: true,
		mockCheckout: true,
		mode: "cte-shadow-payment-simulation",
		noLiveApis: true,
		blockedExternalApis: LIVE_API_BLOCKLIST,
		backingSource: "cte-shadow-staging",
		context,
		checkoutUrl: `/academy/mock-checkout?event=${encodeURIComponent(event.id)}`,
		clientSecret: `cte_shadow_${event.id.toLowerCase()}`,
		sessionId: event.id,
		publishableKey: "pk_cte_shadow_simulated",
		simulatedLogs: buildSimulatedLogs("Payment checkout", context),
		minorPrivacy: {
			coppaFerpaAligned: true,
			piiCollectionBlocked: true,
			telemetryPolicy: "payment-simulation-pii-redacted",
		},
	};
}

function buildCteShadowResponse(req, resourcePath, body = {}) {
	if (String(resourcePath || "").startsWith("/auricrux") || String(resourcePath || "") === "/bid-doteach-workflow") {
		return {
			status: 200,
			headers: corsHeaders,
			body: buildCteMockAuricruxPayload(req, body, resourcePath),
		};
	}

	return {
		status: 200,
		headers: corsHeaders,
		body: buildCteShadowProxyPayload(req, resourcePath, body),
	};
}

module.exports = {
	corsHeaders,
	isCteStudentRole,
	isCteShadowRequest,
	resolveShadowContext,
	sanitizeForMinorTelemetry,
	buildCteShadowProxyPayload,
	buildCteShadowResponse,
	buildCteMockAuricruxPayload,
	buildCteMockPaymentPayload,
};