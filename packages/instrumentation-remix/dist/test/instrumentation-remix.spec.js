"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const React = __importStar(require("react"));
const expect_1 = __importDefault(require("expect"));
const src_1 = require("../src");
const semantic_conventions_1 = require("@opentelemetry/semantic-conventions");
const opentelemetry_instrumentation_testing_utils_1 = require("opentelemetry-instrumentation-testing-utils");
const semver = __importStar(require("semver"));
const instrumentationConfig = {
    actionFormDataAttributes: {
        _action: "actionType",
        foo: false,
        num: true,
    },
    legacyErrorAttributes: false,
};
const instrumentation = new src_1.RemixInstrumentation(instrumentationConfig);
const node_1 = require("@remix-run/node");
const remixServerRuntime = __importStar(require("@remix-run/server-runtime"));
const api_1 = require("@opentelemetry/api");
const remixServerRuntimePackage = require("@remix-run/server-runtime/package.json");
/** REMIX SERVER BUILD */
const routes = {
    "routes/parent": {
        id: "routes/parent",
        path: "/parent",
        module: {
            loader: () => "LOADER",
            action: () => "ACTION",
            default: () => React.createElement("div", {}, "routes/parent"),
        },
    },
    "routes/parent/child/$id": {
        id: "routes/parent/child/$id",
        parentId: "routes/parent",
        path: "/parent/child/:id",
        module: {
            loader: () => "LOADER",
            action: () => "ACTION",
            default: () => React.createElement("div", {}, "routes/parent/child/$id"),
        },
    },
    "routes/throws-error": {
        id: "routes/throws-error",
        path: "/throws-error",
        module: {
            loader: async () => {
                throw new Error("oh no loader");
            },
            action: async () => {
                throw new Error("oh no action");
            },
            default: undefined,
        },
    },
    "routes/has-no-loader-or-action": {
        id: "routes/has-no-loader-or-action",
        path: "/has-no-loader-or-action",
        module: {
            default: () => React.createElement("div", {}, "routes/has-no-loader-or-action"),
        },
    },
    // Implicitly used to handle 404s
    root: {
        id: "root",
        module: {
            default: () => React.createElement("div", {}, "root"),
        },
    },
};
const entryModule = {
    default: (request, responseStatusCode, responseHeaders, context) => {
        if (new URL(request.url).search.includes("throwEntryModuleError")) {
            throw new Error("oh no entry module");
        }
        return new Response(undefined, { status: responseStatusCode, headers: responseHeaders });
    },
};
let build = {
    routes,
    assets: {
        routes,
    },
    entry: {
        module: entryModule,
    },
    future: {},
};
/**
 * The `remixServerRuntime.createRequestHandler` function definition can change across versions. This
 * function will provide the proper signature based on version to creat the request handler.
 *
 * This versions used here should mirror the versions defined in `.tav.yml`.
 */
function createRequestHandlerForPackageVersion(version) {
    if (semver.satisfies(version, "1.1.0 - 1.3.2")) {
        // Version <=1.3.2 uses a configuration object
        return remixServerRuntime.createRequestHandler(build, {});
    }
    else if (semver.satisfies(version, ">=1.3.3")) {
        // Version >=1.3.3 uses a "mode" param of type "production" | "deployment" | "test"
        return remixServerRuntime.createRequestHandler(build, "test");
    }
    else {
        throw new Error("Unsupported @remix-run/server-runtime version");
    }
}
// Expects no error to appear as span attributes.
const expectNoAttributeError = (span) => {
    (0, expect_1.default)(span.attributes["error"]).toBeUndefined();
    (0, expect_1.default)(span.attributes[semantic_conventions_1.SemanticAttributes.EXCEPTION_MESSAGE]).toBeUndefined();
    (0, expect_1.default)(span.attributes[semantic_conventions_1.SemanticAttributes.EXCEPTION_STACKTRACE]).toBeUndefined();
};
// Expects no error to appear as a span exception event.
const expectNoEventError = (span) => {
    (0, expect_1.default)(span.status.code).not.toBe(api_1.SpanStatusCode.ERROR);
    (0, expect_1.default)(span.events.length).toBe(0);
};
// Expects no error to appear, either as span attributes or as a span exception event.
const expectNoError = (span) => {
    expectNoAttributeError(span);
    expectNoEventError(span);
};
// Expects an error to appear, both as span attributes and as a span exception event.
const expectError = (span, message) => {
    expectEventError(span, message);
    expectAttributeError(span, message);
};
// Expects an error to appear as span attributes.
const expectAttributeError = (span, message) => {
    (0, expect_1.default)(span.attributes["error"]).toBe(true);
    (0, expect_1.default)(span.attributes[semantic_conventions_1.SemanticAttributes.EXCEPTION_MESSAGE]).toBe(message);
    (0, expect_1.default)(span.attributes[semantic_conventions_1.SemanticAttributes.EXCEPTION_STACKTRACE]).toBeDefined();
};
// Expects an error to appear as a span exception event.
const expectEventError = (span, message) => {
    (0, expect_1.default)(span.status.code).toBe(api_1.SpanStatusCode.ERROR);
    (0, expect_1.default)(span.events.length).toBe(1);
    (0, expect_1.default)(span.events[0].attributes[semantic_conventions_1.SemanticAttributes.EXCEPTION_MESSAGE]).toBe(message);
    (0, expect_1.default)(span.events[0].attributes[semantic_conventions_1.SemanticAttributes.EXCEPTION_STACKTRACE]).toBeDefined();
};
const expectLoaderSpan = (span, route, params = {}) => {
    (0, expect_1.default)(span.name).toBe(`LOADER ${route}`);
    (0, expect_1.default)(span.attributes["match.route.id"]).toBe(route);
    Object.entries(params).forEach(([key, value]) => {
        (0, expect_1.default)(span.attributes[`match.params.${key}`]).toBe(value);
    });
};
const expectActionSpan = (span, route, formData = {}) => {
    (0, expect_1.default)(span.name).toBe(`ACTION ${route}`);
    (0, expect_1.default)(span.attributes["match.route.id"]).toBe(route);
    Object.entries(span.attributes)
        .filter(([key]) => key.startsWith("formData."))
        .forEach(([key, value]) => {
        (0, expect_1.default)(formData[key.replace("formData.", "")]).toBe(value);
    });
    Object.entries(formData).forEach(([key, value]) => {
        (0, expect_1.default)(span.attributes[`formData.${key}`]).toBe(value);
    });
};
const expectRequestHandlerSpan = (span, { path, id }) => {
    (0, expect_1.default)(span.name).toBe(`remix.request ${path}`);
    (0, expect_1.default)(span.attributes[semantic_conventions_1.SemanticAttributes.HTTP_ROUTE]).toBe(path);
    (0, expect_1.default)(span.attributes["match.route.id"]).toBe(id);
};
const expectRequestHandlerMatchNotFoundSpan = (span) => {
    (0, expect_1.default)(span.name).toBe("remix.request");
    (0, expect_1.default)(span.attributes[semantic_conventions_1.SemanticAttributes.HTTP_ROUTE]).toBeUndefined();
    (0, expect_1.default)(span.attributes["match.route.id"]).toBeUndefined();
};
const expectParentSpan = (parent, child) => {
    (0, expect_1.default)(parent.spanContext().traceId).toBe(child.spanContext().traceId);
    (0, expect_1.default)(parent.spanContext().spanId).toBe(child.parentSpanId);
};
const expectResponseAttributes = (span, { status }) => {
    (0, expect_1.default)(span.attributes[semantic_conventions_1.SemanticAttributes.HTTP_STATUS_CODE]).toBe(status);
};
const expectNoResponseAttributes = (span) => {
    (0, expect_1.default)(span.attributes[semantic_conventions_1.SemanticAttributes.HTTP_STATUS_CODE]).toBeUndefined();
};
const expectRequestAttributes = (span, { method, url }) => {
    (0, expect_1.default)(span.attributes[semantic_conventions_1.SemanticAttributes.HTTP_METHOD]).toBe(method);
    (0, expect_1.default)(span.attributes[semantic_conventions_1.SemanticAttributes.HTTP_URL]).toBe(url);
};
const loaderRevalidation = (attributes) => {
    if (semver.satisfies(remixServerRuntimePackage.version, "<1.8.2")) {
        return attributes;
    }
    // Remix v1.8.2+ uses @remix-run/router v1.0.5, which uses a `GET` for loader revalidation instead of `POST`.
    // See: https://github.com/remix-run/react-router/blob/main/packages/router/CHANGELOG.md#105
    return Object.assign(Object.assign({}, attributes), { method: "GET" });
};
/** TESTS */
describe("instrumentation-remix", () => {
    let requestHandler;
    let consoleErrorImpl;
    before(() => {
        (0, node_1.installGlobals)();
        instrumentation.enable();
        requestHandler = createRequestHandlerForPackageVersion(remixServerRuntimePackage.version);
        consoleErrorImpl = console.error;
        console.error = () => { };
    });
    after(() => {
        instrumentation.disable();
        console.error = consoleErrorImpl;
    });
    describe("requestHandler", () => {
        it("has a route match when there is no loader or action", async () => {
            const request = new Request("http://localhost/has-no-loader-or-action", { method: "GET" });
            await requestHandler(request, {});
            const spans = (0, opentelemetry_instrumentation_testing_utils_1.getTestSpans)();
            (0, expect_1.default)(spans.length).toBe(1);
            const [requestHandlerSpan] = spans;
            const expectedRequestAttributes = {
                method: "GET",
                url: "http://localhost/has-no-loader-or-action",
            };
            // Request handler span
            expectRequestHandlerSpan(requestHandlerSpan, {
                path: "/has-no-loader-or-action",
                id: "routes/has-no-loader-or-action",
            });
            expectRequestAttributes(requestHandlerSpan, expectedRequestAttributes);
            expectResponseAttributes(requestHandlerSpan, { status: 200 });
            expectNoError(requestHandlerSpan);
        });
        it("does not have a route match when there is no route", async () => {
            const request = new Request("http://localhost/does-not-exist", { method: "GET" });
            await requestHandler(request, {});
            const spans = (0, opentelemetry_instrumentation_testing_utils_1.getTestSpans)();
            (0, expect_1.default)(spans.length).toBe(1);
            const [requestHandlerSpan] = spans;
            const expectedRequestAttributes = {
                method: "GET",
                url: "http://localhost/does-not-exist",
            };
            // Request handler span
            expectRequestHandlerMatchNotFoundSpan(requestHandlerSpan);
            expectRequestAttributes(requestHandlerSpan, expectedRequestAttributes);
            expectResponseAttributes(requestHandlerSpan, { status: 404 });
            expectNoError(requestHandlerSpan);
        });
        it("handles thrown error from entry module", async () => {
            const request = new Request("http://localhost/parent?throwEntryModuleError", { method: "GET" });
            await requestHandler(request, {});
            const spans = (0, opentelemetry_instrumentation_testing_utils_1.getTestSpans)();
            (0, expect_1.default)(spans.length).toBe(2);
            const [loaderSpan, requestHandlerSpan] = spans;
            expectParentSpan(requestHandlerSpan, loaderSpan);
            const expectedRequestAttributes = {
                method: "GET",
                url: "http://localhost/parent?throwEntryModuleError",
            };
            // Loader span
            expectLoaderSpan(loaderSpan, "routes/parent");
            expectRequestAttributes(loaderSpan, expectedRequestAttributes);
            expectResponseAttributes(loaderSpan, { status: 200 });
            expectNoError(loaderSpan);
            // Request handler span
            expectRequestHandlerSpan(requestHandlerSpan, {
                path: "/parent",
                id: "routes/parent",
            });
            expectRequestAttributes(requestHandlerSpan, expectedRequestAttributes);
            expectResponseAttributes(requestHandlerSpan, { status: 500 });
            expectNoError(requestHandlerSpan);
        });
    });
    describe("loaders", () => {
        it("handles basic loader", async () => {
            const request = new Request("http://localhost/parent", { method: "GET" });
            await requestHandler(request, {});
            const spans = (0, opentelemetry_instrumentation_testing_utils_1.getTestSpans)();
            (0, expect_1.default)(spans.length).toBe(2);
            const [loaderSpan, requestHandlerSpan] = spans;
            expectParentSpan(requestHandlerSpan, loaderSpan);
            const expectedRequestAttributes = {
                method: "GET",
                url: "http://localhost/parent",
            };
            // Loader span
            expectLoaderSpan(loaderSpan, "routes/parent");
            expectRequestAttributes(loaderSpan, expectedRequestAttributes);
            expectResponseAttributes(loaderSpan, { status: 200 });
            expectNoError(loaderSpan);
            // Request handler span
            expectRequestHandlerSpan(requestHandlerSpan, {
                path: "/parent",
                id: "routes/parent",
            });
            expectRequestAttributes(requestHandlerSpan, expectedRequestAttributes);
            expectResponseAttributes(requestHandlerSpan, { status: 200 });
            expectNoError(requestHandlerSpan);
        });
        it("handles parent-child loaders", async () => {
            const request = new Request("http://localhost/parent/child/123", { method: "GET" });
            await requestHandler(request, {});
            const spans = (0, opentelemetry_instrumentation_testing_utils_1.getTestSpans)();
            (0, expect_1.default)(spans.length).toBe(3);
            const [parentLoaderSpan, childLoaderSpan, requestHandlerSpan] = spans;
            expectParentSpan(requestHandlerSpan, parentLoaderSpan);
            expectParentSpan(requestHandlerSpan, childLoaderSpan);
            const expectedRequestAttributes = {
                method: "GET",
                url: "http://localhost/parent/child/123",
            };
            // Parent span
            expectLoaderSpan(parentLoaderSpan, "routes/parent", { id: "123" });
            expectRequestAttributes(parentLoaderSpan, expectedRequestAttributes);
            expectResponseAttributes(parentLoaderSpan, { status: 200 });
            expectNoError(parentLoaderSpan);
            // Child span
            expectLoaderSpan(childLoaderSpan, "routes/parent/child/$id", { id: "123" });
            expectRequestAttributes(childLoaderSpan, expectedRequestAttributes);
            expectResponseAttributes(childLoaderSpan, { status: 200 });
            expectNoError(childLoaderSpan);
            // Request handler span
            expectRequestHandlerSpan(requestHandlerSpan, {
                path: "/parent/child/:id",
                id: "routes/parent/child/$id",
            });
            expectRequestAttributes(requestHandlerSpan, expectedRequestAttributes);
            expectResponseAttributes(requestHandlerSpan, { status: 200 });
            expectNoError(requestHandlerSpan);
        });
        it("handles a thrown error from loader", async () => {
            const request = new Request("http://localhost/throws-error", { method: "GET" });
            await requestHandler(request, {});
            const spans = (0, opentelemetry_instrumentation_testing_utils_1.getTestSpans)();
            (0, expect_1.default)(spans.length).toBe(2);
            const [loaderSpan, requestHandlerSpan] = spans;
            expectParentSpan(requestHandlerSpan, loaderSpan);
            const expectedRequestAttributes = {
                method: "GET",
                url: "http://localhost/throws-error",
            };
            // Loader span
            expectLoaderSpan(loaderSpan, "routes/throws-error");
            expectRequestAttributes(loaderSpan, expectedRequestAttributes);
            expectNoResponseAttributes(loaderSpan);
            expectEventError(loaderSpan, "oh no loader");
            expectNoAttributeError(loaderSpan);
            // Request handler span
            expectRequestHandlerSpan(requestHandlerSpan, {
                path: "/throws-error",
                id: "routes/throws-error",
            });
            expectRequestAttributes(requestHandlerSpan, expectedRequestAttributes);
            expectResponseAttributes(requestHandlerSpan, { status: 500 });
            expectNoError(requestHandlerSpan);
        });
        describe("with legacyErrorAttributes", () => {
            before(() => {
                instrumentation.setConfig(Object.assign(Object.assign({}, instrumentationConfig), { legacyErrorAttributes: true }));
            });
            after(() => {
                instrumentation.setConfig(instrumentationConfig);
            });
            it("handles a thrown error from loader", async () => {
                const request = new Request("http://localhost/throws-error", { method: "GET" });
                await requestHandler(request, {});
                const spans = (0, opentelemetry_instrumentation_testing_utils_1.getTestSpans)();
                (0, expect_1.default)(spans.length).toBe(2);
                const [loaderSpan, requestHandlerSpan] = spans;
                expectParentSpan(requestHandlerSpan, loaderSpan);
                const expectedRequestAttributes = {
                    method: "GET",
                    url: "http://localhost/throws-error",
                };
                // Loader span
                expectLoaderSpan(loaderSpan, "routes/throws-error");
                expectRequestAttributes(loaderSpan, expectedRequestAttributes);
                expectNoResponseAttributes(loaderSpan);
                expectError(loaderSpan, "oh no loader");
                // Request handler span
                expectRequestHandlerSpan(requestHandlerSpan, {
                    path: "/throws-error",
                    id: "routes/throws-error",
                });
                expectRequestAttributes(requestHandlerSpan, expectedRequestAttributes);
                expectResponseAttributes(requestHandlerSpan, { status: 500 });
                expectNoError(requestHandlerSpan);
            });
        });
    });
    describe("actions", () => {
        it("handles basic action", async () => {
            const request = new Request("http://localhost/parent", { method: "POST" });
            await requestHandler(request, {});
            const spans = (0, opentelemetry_instrumentation_testing_utils_1.getTestSpans)();
            (0, expect_1.default)(spans.length).toBe(3);
            const [actionSpan, loaderSpan, requestHandlerSpan] = spans;
            expectParentSpan(requestHandlerSpan, loaderSpan);
            expectParentSpan(requestHandlerSpan, actionSpan);
            const expectedRequestAttributes = {
                method: "POST",
                url: "http://localhost/parent",
            };
            // Action span
            expectActionSpan(actionSpan, "routes/parent");
            expectRequestAttributes(actionSpan, expectedRequestAttributes);
            expectResponseAttributes(actionSpan, { status: 200 });
            expectNoError(actionSpan);
            // Loader span
            expectLoaderSpan(loaderSpan, "routes/parent");
            expectRequestAttributes(loaderSpan, loaderRevalidation(expectedRequestAttributes));
            expectResponseAttributes(loaderSpan, { status: 200 });
            expectNoError(loaderSpan);
            // Request handler span
            expectRequestHandlerSpan(requestHandlerSpan, {
                path: "/parent",
                id: "routes/parent",
            });
            expectRequestAttributes(requestHandlerSpan, expectedRequestAttributes);
            expectResponseAttributes(requestHandlerSpan, { status: 200 });
            expectNoError(requestHandlerSpan);
        });
        it("extracts action formData fields from form data", async () => {
            const body = new FormData();
            body.append("_action", "myAction");
            body.append("foo", "bar");
            body.append("num", "123");
            body.append("password", "test123");
            const request = new Request("http://localhost/parent", {
                method: "POST",
                body,
            });
            await requestHandler(request, {});
            const spans = (0, opentelemetry_instrumentation_testing_utils_1.getTestSpans)();
            (0, expect_1.default)(spans.length).toBe(3);
            const [actionSpan, loaderSpan, requestHandlerSpan] = spans;
            expectParentSpan(requestHandlerSpan, loaderSpan);
            expectParentSpan(requestHandlerSpan, actionSpan);
            const expectedRequestAttributes = {
                method: "POST",
                url: "http://localhost/parent",
            };
            // Action span
            expectActionSpan(actionSpan, "routes/parent", {
                actionType: "myAction",
                foo: undefined,
                num: "123",
            });
            expectRequestAttributes(actionSpan, expectedRequestAttributes);
            expectResponseAttributes(actionSpan, { status: 200 });
            expectNoError(actionSpan);
            // Loader span
            expectLoaderSpan(loaderSpan, "routes/parent");
            expectRequestAttributes(loaderSpan, loaderRevalidation(expectedRequestAttributes));
            expectResponseAttributes(loaderSpan, { status: 200 });
            expectNoError(loaderSpan);
            // Request handler span
            expectRequestHandlerSpan(requestHandlerSpan, {
                path: "/parent",
                id: "routes/parent",
            });
            expectRequestAttributes(requestHandlerSpan, expectedRequestAttributes);
            expectResponseAttributes(requestHandlerSpan, { status: 200 });
            expectNoError(requestHandlerSpan);
        });
        it("handles a thrown error from action", async () => {
            const request = new Request("http://localhost/throws-error", { method: "POST" });
            await requestHandler(request, {});
            const spans = (0, opentelemetry_instrumentation_testing_utils_1.getTestSpans)();
            (0, expect_1.default)(spans.length).toBe(2);
            const [actionSpan, requestHandlerSpan] = spans;
            expectParentSpan(requestHandlerSpan, actionSpan);
            const expectedRequestAttributes = {
                method: "POST",
                url: "http://localhost/throws-error",
            };
            // Action span
            expectActionSpan(actionSpan, "routes/throws-error");
            expectRequestAttributes(actionSpan, expectedRequestAttributes);
            expectNoResponseAttributes(actionSpan);
            expectEventError(actionSpan, "oh no action");
            expectNoAttributeError(actionSpan);
            // Request handler span
            expectRequestHandlerSpan(requestHandlerSpan, {
                path: "/throws-error",
                id: "routes/throws-error",
            });
            expectRequestAttributes(requestHandlerSpan, expectedRequestAttributes);
            expectResponseAttributes(requestHandlerSpan, { status: 500 });
            expectNoError(requestHandlerSpan);
        });
        describe("with legacyErrorAttributes", () => {
            before(() => {
                instrumentation.setConfig(Object.assign(Object.assign({}, instrumentationConfig), { legacyErrorAttributes: true }));
            });
            after(() => {
                instrumentation.setConfig(instrumentationConfig);
            });
            it("handles a thrown error from action", async () => {
                const request = new Request("http://localhost/throws-error", { method: "POST" });
                await requestHandler(request, {});
                const spans = (0, opentelemetry_instrumentation_testing_utils_1.getTestSpans)();
                (0, expect_1.default)(spans.length).toBe(2);
                const [actionSpan, requestHandlerSpan] = spans;
                expectParentSpan(requestHandlerSpan, actionSpan);
                const expectedRequestAttributes = {
                    method: "POST",
                    url: "http://localhost/throws-error",
                };
                // Action span
                expectActionSpan(actionSpan, "routes/throws-error");
                expectRequestAttributes(actionSpan, expectedRequestAttributes);
                expectNoResponseAttributes(actionSpan);
                expectError(actionSpan, "oh no action");
                // Request handler span
                expectRequestHandlerSpan(requestHandlerSpan, {
                    path: "/throws-error",
                    id: "routes/throws-error",
                });
                expectRequestAttributes(requestHandlerSpan, expectedRequestAttributes);
                expectResponseAttributes(requestHandlerSpan, { status: 500 });
                expectNoError(requestHandlerSpan);
            });
        });
    });
});
//# sourceMappingURL=instrumentation-remix.spec.js.map