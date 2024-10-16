import { InstrumentationBase, InstrumentationConfig, InstrumentationNodeModuleDefinition } from "@opentelemetry/instrumentation";
export interface RemixInstrumentationConfig extends InstrumentationConfig {
    /**
     * Mapping of FormData field to span attribute names. Appends attribute as `formData.${name}`.
     *
     * Provide `true` value to use the FormData field name as the attribute name, or provide
     * a `string` value to map the field name to a custom attribute name.
     *
     * @default { _action: "actionType" }
     */
    actionFormDataAttributes?: Record<string, boolean | string>;
    /**
     * Whether to emit errors in the form of span attributes, as well as in span exception events.
     * Defaults to `false`, meaning that only span exception events are emitted.
     */
    legacyErrorAttributes?: boolean;
}
export declare class RemixInstrumentation extends InstrumentationBase {
    constructor(config?: RemixInstrumentationConfig);
    getConfig(): RemixInstrumentationConfig;
    setConfig(config?: RemixInstrumentationConfig): void;
    protected init(): InstrumentationNodeModuleDefinition;
    private _patchMatchServerRoutes;
    private _patchCreateRequestHandler;
    private _patchCallRouteLoader;
    private _patchCallRouteLoaderPre_1_7_2;
    private _patchCallRouteAction;
    private _patchCallRouteActionPre_1_7_2;
    private addErrorToSpan;
}
//# sourceMappingURL=instrumentation.d.ts.map