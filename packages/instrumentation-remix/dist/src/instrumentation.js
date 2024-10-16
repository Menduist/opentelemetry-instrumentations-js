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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemixInstrumentation = void 0;
const api_1 = __importStar(require("@opentelemetry/api"));
const instrumentation_1 = require("@opentelemetry/instrumentation");
const semantic_conventions_1 = require("@opentelemetry/semantic-conventions");
const core_1 = require("@opentelemetry/core");
const version_1 = require("./version");
const RemixSemanticAttributes = {
    MATCH_PARAMS: "match.params",
    MATCH_ROUTE_ID: "match.route.id",
};
const DEFAULT_CONFIG = {
    actionFormDataAttributes: {
        _action: "actionType",
    },
    legacyErrorAttributes: false,
};
class RemixInstrumentation extends instrumentation_1.InstrumentationBase {
    constructor(config = {}) {
        super("RemixInstrumentation", version_1.VERSION, Object.assign({}, DEFAULT_CONFIG, config));
    }
    getConfig() {
        return this._config;
    }
    setConfig(config = {}) {
        this._config = Object.assign({}, DEFAULT_CONFIG, config);
    }
    init() {
        const remixRunServerRuntimeRouteMatchingFile = new instrumentation_1.InstrumentationNodeModuleFile("@remix-run/server-runtime/dist/routeMatching.js", ["1.6.2 - 2.x"], (moduleExports) => {
            // createRequestHandler
            if ((0, instrumentation_1.isWrapped)(moduleExports["matchServerRoutes"])) {
                this._unwrap(moduleExports, "matchServerRoutes");
            }
            this._wrap(moduleExports, "matchServerRoutes", this._patchMatchServerRoutes());
            return moduleExports;
        }, (moduleExports) => {
            this._unwrap(moduleExports, "matchServerRoutes");
        });
        /*
         * Before Remix v1.6.2 we needed to wrap `@remix-run/server-runtime/routeMatching` module import instead of
         * `@remix-run/server-runtime/dist/routeMatching` module import. The wrapping logic is all the same though.
         */
        const remixRunServerRuntimeRouteMatchingPre_1_6_2_File = new instrumentation_1.InstrumentationNodeModuleFile("@remix-run/server-runtime/routeMatching.js", ["1.0 - 1.6.1"], (moduleExports) => {
            // matchServerRoutes
            if ((0, instrumentation_1.isWrapped)(moduleExports["matchServerRoutes"])) {
                this._unwrap(moduleExports, "matchServerRoutes");
            }
            this._wrap(moduleExports, "matchServerRoutes", this._patchMatchServerRoutes());
            return moduleExports;
        }, (moduleExports) => {
            this._unwrap(moduleExports, "matchServerRoutes");
        });
        /*
         * Before Remix v1.6.2 we needed to wrap `@remix-run/server-runtime/data` module import instead of
         * `@remix-run/server-runtime/dist/data` module import. The wrapping logic is all the same though.
         */
        const remixRunServerRuntimeDataPre_1_6_2_File = new instrumentation_1.InstrumentationNodeModuleFile("@remix-run/server-runtime/data.js", ["1.0 - 1.6.1"], (moduleExports) => {
            // callRouteLoader
            if ((0, instrumentation_1.isWrapped)(moduleExports["callRouteLoader"])) {
                // @ts-ignore
                this._unwrap(moduleExports, "callRouteLoader");
            }
            // @ts-ignore
            this._wrap(moduleExports, "callRouteLoader", this._patchCallRouteLoaderPre_1_7_2());
            // callRouteAction
            if ((0, instrumentation_1.isWrapped)(moduleExports["callRouteAction"])) {
                // @ts-ignore
                this._unwrap(moduleExports, "callRouteAction");
            }
            // @ts-ignore
            this._wrap(moduleExports, "callRouteAction", this._patchCallRouteActionPre_1_7_2());
            return moduleExports;
        }, (moduleExports) => {
            // @ts-ignore
            this._unwrap(moduleExports, "callRouteLoader");
            // @ts-ignore
            this._unwrap(moduleExports, "callRouteAction");
        });
        /**
         * Before Remix 1.7.3 we received the full `Match` object for each path in the route chain,
         * afterwards we only receive the `routeId` and associated `params`.
         */
        const remixRunServerRuntimeDataPre_1_7_2_File = new instrumentation_1.InstrumentationNodeModuleFile("@remix-run/server-runtime/dist/data.js", ["1.6.2 - 1.7.2"], (moduleExports) => {
            // callRouteLoader
            if ((0, instrumentation_1.isWrapped)(moduleExports["callRouteLoader"])) {
                // @ts-ignore
                this._unwrap(moduleExports, "callRouteLoader");
            }
            // @ts-ignore
            this._wrap(moduleExports, "callRouteLoader", this._patchCallRouteLoaderPre_1_7_2());
            // callRouteAction
            if ((0, instrumentation_1.isWrapped)(moduleExports["callRouteAction"])) {
                // @ts-ignore
                this._unwrap(moduleExports, "callRouteAction");
            }
            // @ts-ignore
            this._wrap(moduleExports, "callRouteAction", this._patchCallRouteActionPre_1_7_2());
            return moduleExports;
        }, (moduleExports) => {
            // @ts-ignore
            this._unwrap(moduleExports, "callRouteLoader");
            // @ts-ignore
            this._unwrap(moduleExports, "callRouteAction");
        });
        const remixRunServerRuntimeDataPre_1_7_6_And_Post_2_9_File = new instrumentation_1.InstrumentationNodeModuleFile("@remix-run/server-runtime/dist/data.js", ["1.7.3 - 1.7.6", "2.9.0 - 2.x"], (moduleExports) => {
            // callRouteLoader
            if ((0, instrumentation_1.isWrapped)(moduleExports["callRouteLoader"])) {
                // @ts-ignore
                this._unwrap(moduleExports, "callRouteLoader");
            }
            // @ts-ignore
            this._wrap(moduleExports, "callRouteLoader", this._patchCallRouteLoader());
            // callRouteAction
            if ((0, instrumentation_1.isWrapped)(moduleExports["callRouteAction"])) {
                // @ts-ignore
                this._unwrap(moduleExports, "callRouteAction");
            }
            // @ts-ignore
            this._wrap(moduleExports, "callRouteAction", this._patchCallRouteAction());
            return moduleExports;
        }, (moduleExports) => {
            // @ts-ignore
            this._unwrap(moduleExports, "callRouteLoader");
            // @ts-ignore
            this._unwrap(moduleExports, "callRouteAction");
        });
        /*
         * In Remix 1.8.0, the callXXLoader functions were renamed to callXXLoaderRR. They were renamed back in 2.9.0.
         */
        const remixRunServerRuntimeDataBetween_1_8_And_2_8_File = new instrumentation_1.InstrumentationNodeModuleFile("@remix-run/server-runtime/dist/data.js", ["1.8.0 - 2.8.x"], (moduleExports) => {
            // callRouteLoader
            if ((0, instrumentation_1.isWrapped)(moduleExports["callRouteLoaderRR"])) {
                // @ts-ignore
                this._unwrap(moduleExports, "callRouteLoaderRR");
            }
            // @ts-ignore
            this._wrap(moduleExports, "callRouteLoaderRR", this._patchCallRouteLoader());
            // callRouteAction
            if ((0, instrumentation_1.isWrapped)(moduleExports["callRouteActionRR"])) {
                // @ts-ignore
                this._unwrap(moduleExports, "callRouteActionRR");
            }
            // @ts-ignore
            this._wrap(moduleExports, "callRouteActionRR", this._patchCallRouteAction());
            return moduleExports;
        }, (moduleExports) => {
            // @ts-ignore
            this._unwrap(moduleExports, "callRouteLoaderRR");
            // @ts-ignore
            this._unwrap(moduleExports, "callRouteActionRR");
        });
        const remixRunServerRuntimeModule = new instrumentation_1.InstrumentationNodeModuleDefinition("@remix-run/server-runtime", [">=1.*"], (moduleExports) => {
            // createRequestHandler
            if ((0, instrumentation_1.isWrapped)(moduleExports["createRequestHandler"])) {
                this._unwrap(moduleExports, "createRequestHandler");
            }
            this._wrap(moduleExports, "createRequestHandler", this._patchCreateRequestHandler());
            return moduleExports;
        }, (moduleExports) => {
            this._unwrap(moduleExports, "createRequestHandler");
        }, [
            remixRunServerRuntimeRouteMatchingFile,
            remixRunServerRuntimeRouteMatchingPre_1_6_2_File,
            remixRunServerRuntimeDataPre_1_6_2_File,
            remixRunServerRuntimeDataPre_1_7_2_File,
            remixRunServerRuntimeDataPre_1_7_6_And_Post_2_9_File,
            remixRunServerRuntimeDataBetween_1_8_And_2_8_File,
        ]);
        return remixRunServerRuntimeModule;
    }
    _patchMatchServerRoutes() {
        const plugin = this;
        return function matchServerRoutes(original) {
            return function patchMatchServerRoutes() {
                var _a;
                const result = original.apply(this, arguments);
                const span = api_1.default.trace.getSpan(api_1.default.context.active());
                const route = (_a = (result || []).slice(-1)[0]) === null || _a === void 0 ? void 0 : _a.route;
                const routePath = route === null || route === void 0 ? void 0 : route.path;
                if (span && routePath) {
                    span.setAttribute(semantic_conventions_1.SemanticAttributes.HTTP_ROUTE, routePath);
                    span.updateName(`remix.request ${routePath}`);
                }
                const routeId = route === null || route === void 0 ? void 0 : route.id;
                if (span && routeId) {
                    span.setAttribute(RemixSemanticAttributes.MATCH_ROUTE_ID, routeId);
                }
                const rpcMetadata = (0, core_1.getRPCMetadata)(api_1.default.context.active());
                if ((rpcMetadata === null || rpcMetadata === void 0 ? void 0 : rpcMetadata.type) === core_1.RPCType.HTTP) {
                    rpcMetadata.route = routeId;
                }
                return result;
            };
        };
    }
    _patchCreateRequestHandler() {
        const plugin = this;
        return function createRequestHandler(original) {
            return function patchCreateRequestHandler() {
                const originalRequestHandler = original.apply(this, arguments);
                return (request, loadContext) => {
                    const span = plugin.tracer.startSpan(`remix.request`, {
                        attributes: { [semantic_conventions_1.SemanticAttributes.CODE_FUNCTION]: "requestHandler" },
                    }, api_1.default.context.active());
                    addRequestAttributesToSpan(span, request);
                    const originalResponsePromise = api_1.default.context.with(api_1.default.trace.setSpan(api_1.default.context.active(), span), () => originalRequestHandler(request, loadContext));
                    return originalResponsePromise
                        .then((response) => {
                        addResponseAttributesToSpan(span, response);
                        return response;
                    })
                        .catch((error) => {
                        plugin.addErrorToSpan(span, error);
                        throw error;
                    })
                        .finally(() => {
                        span.end();
                    });
                };
            };
        };
    }
    // @ts-ignore
    _patchCallRouteLoader() {
        const plugin = this;
        return function callRouteLoader(original) {
            return function patchCallRouteLoader() {
                const [params] = arguments;
                const span = plugin.tracer.startSpan(`LOADER ${params.routeId}`, { attributes: { [semantic_conventions_1.SemanticAttributes.CODE_FUNCTION]: "loader" } }, api_1.default.context.active());
                addRequestAttributesToSpan(span, params.request);
                addMatchAttributesToSpan(span, { routeId: params.routeId, params: params.params });
                return api_1.default.context.with(api_1.default.trace.setSpan(api_1.default.context.active(), span), () => {
                    const originalResponsePromise = original.apply(this, arguments);
                    return originalResponsePromise
                        .then((response) => {
                        addResponseAttributesToSpan(span, response);
                        return response;
                    })
                        .catch((error) => {
                        plugin.addErrorToSpan(span, error);
                        throw error;
                    })
                        .finally(() => {
                        span.end();
                    });
                });
            };
        };
    }
    // @ts-ignore
    _patchCallRouteLoaderPre_1_7_2() {
        const plugin = this;
        return function callRouteLoader(original) {
            return function patchCallRouteLoader() {
                // Cast as `any` to avoid typescript errors since this is patching an older version
                const [params] = arguments;
                const span = plugin.tracer.startSpan(`LOADER ${params.match.route.id}`, { attributes: { [semantic_conventions_1.SemanticAttributes.CODE_FUNCTION]: "loader" } }, api_1.default.context.active());
                addRequestAttributesToSpan(span, params.request);
                addMatchAttributesToSpan(span, { routeId: params.match.route.id, params: params.match.params });
                return api_1.default.context.with(api_1.default.trace.setSpan(api_1.default.context.active(), span), () => {
                    const originalResponsePromise = original.apply(this, arguments);
                    return originalResponsePromise
                        .then((response) => {
                        addResponseAttributesToSpan(span, response);
                        return response;
                    })
                        .catch((error) => {
                        plugin.addErrorToSpan(span, error);
                        throw error;
                    })
                        .finally(() => {
                        span.end();
                    });
                });
            };
        };
    }
    // @ts-ignore
    _patchCallRouteAction() {
        const plugin = this;
        return function callRouteAction(original) {
            return async function patchCallRouteAction() {
                const [params] = arguments;
                const clonedRequest = params.request.clone();
                const span = plugin.tracer.startSpan(`ACTION ${params.routeId}`, { attributes: { [semantic_conventions_1.SemanticAttributes.CODE_FUNCTION]: "action" } }, api_1.default.context.active());
                addRequestAttributesToSpan(span, clonedRequest);
                addMatchAttributesToSpan(span, { routeId: params.routeId, params: params.params });
                return api_1.default.context.with(api_1.default.trace.setSpan(api_1.default.context.active(), span), async () => {
                    const originalResponsePromise = original.apply(this, arguments);
                    return originalResponsePromise
                        .then(async (response) => {
                        addResponseAttributesToSpan(span, response);
                        try {
                            const formData = await clonedRequest.formData();
                            const { actionFormDataAttributes: actionFormAttributes } = plugin.getConfig();
                            formData.forEach((value, key) => {
                                if (actionFormAttributes[key] && actionFormAttributes[key] !== false) {
                                    const keyName = actionFormAttributes[key] === true ? key : actionFormAttributes[key];
                                    span.setAttribute(`formData.${keyName}`, value.toString());
                                }
                            });
                        }
                        catch (_a) {
                            // Silently continue on any error. Typically happens because the action body cannot be processed
                            // into FormData, in which case we should just continue.
                        }
                        return response;
                    })
                        .catch(async (error) => {
                        plugin.addErrorToSpan(span, error);
                        throw error;
                    })
                        .finally(() => {
                        span.end();
                    });
                });
            };
        };
    }
    // @ts-ignore
    _patchCallRouteActionPre_1_7_2() {
        const plugin = this;
        return function callRouteAction(original) {
            return async function patchCallRouteAction() {
                // Cast as `any` to avoid typescript errors since this is patching an older version
                const [params] = arguments;
                const clonedRequest = params.request.clone();
                const span = plugin.tracer.startSpan(`ACTION ${params.match.route.id}`, { attributes: { [semantic_conventions_1.SemanticAttributes.CODE_FUNCTION]: "action" } }, api_1.default.context.active());
                addRequestAttributesToSpan(span, clonedRequest);
                addMatchAttributesToSpan(span, { routeId: params.match.route.id, params: params.match.params });
                return api_1.default.context.with(api_1.default.trace.setSpan(api_1.default.context.active(), span), async () => {
                    const originalResponsePromise = original.apply(this, arguments);
                    return originalResponsePromise
                        .then(async (response) => {
                        addResponseAttributesToSpan(span, response);
                        try {
                            const formData = await clonedRequest.formData();
                            const { actionFormDataAttributes: actionFormAttributes } = plugin.getConfig();
                            formData.forEach((value, key) => {
                                if (actionFormAttributes[key] && actionFormAttributes[key] !== false) {
                                    const keyName = actionFormAttributes[key] === true ? key : actionFormAttributes[key];
                                    span.setAttribute(`formData.${keyName}`, value.toString());
                                }
                            });
                        }
                        catch (_a) {
                            // Silently continue on any error. Typically happens because the action body cannot be processed
                            // into FormData, in which case we should just continue.
                        }
                        return response;
                    })
                        .catch(async (error) => {
                        plugin.addErrorToSpan(span, error);
                        throw error;
                    })
                        .finally(() => {
                        span.end();
                    });
                });
            };
        };
    }
    addErrorToSpan(span, error) {
        addErrorEventToSpan(span, error);
        if (this.getConfig().legacyErrorAttributes || false) {
            addErrorAttributesToSpan(span, error);
        }
    }
}
exports.RemixInstrumentation = RemixInstrumentation;
const addRequestAttributesToSpan = (span, request) => {
    span.setAttributes({
        [semantic_conventions_1.SemanticAttributes.HTTP_METHOD]: request.method,
        [semantic_conventions_1.SemanticAttributes.HTTP_URL]: request.url,
    });
};
const addMatchAttributesToSpan = (span, match) => {
    span.setAttributes({
        [RemixSemanticAttributes.MATCH_ROUTE_ID]: match.routeId,
    });
    Object.keys(match.params).forEach((paramName) => {
        span.setAttribute(`${RemixSemanticAttributes.MATCH_PARAMS}.${paramName}`, match.params[paramName] || "(undefined)");
    });
};
const addResponseAttributesToSpan = (span, response) => {
    if (response) {
        span.setAttributes({
            [semantic_conventions_1.SemanticAttributes.HTTP_STATUS_CODE]: response.status,
        });
    }
};
const addErrorEventToSpan = (span, error) => {
    span.recordException(error);
    span.setStatus({ code: api_1.SpanStatusCode.ERROR, message: error.message });
};
const addErrorAttributesToSpan = (span, error) => {
    span.setAttribute("error", true);
    if (error.message) {
        span.setAttribute(semantic_conventions_1.SemanticAttributes.EXCEPTION_MESSAGE, error.message);
    }
    if (error.stack) {
        span.setAttribute(semantic_conventions_1.SemanticAttributes.EXCEPTION_STACKTRACE, error.stack);
    }
};
//# sourceMappingURL=instrumentation.js.map