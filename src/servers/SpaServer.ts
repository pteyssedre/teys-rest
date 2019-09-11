import {LogOptions} from "lazy-format-logger";
import {ServerOptions} from "restify";
import {Injector} from "teys-injector";
import {RestController} from "../lib/base";
import {ApiServer} from "./api-server";
import {StaticFileController} from "./controllers/static-file-controller";

export interface SpaServerOptions extends ServerOptions {
    filePath: string;
    defaultFile?: string;
    domain?: string;
    version?: string;
    authTime?: string;
}

export class SpaServer extends ApiServer {

    private readonly props: SpaServerOptions;

    constructor(props: SpaServerOptions, logs?: LogOptions) {
        if (!props.filePath) {
            throw new Error("must provide filePath for SPA server");
        }
        props.domain = props.domain ? props.domain : "localhost";
        props.version = props.version ? props.version : "v1";
        props.authTime = props.authTime ? props.authTime : "1h";
        super(props.domain, props.version, props.authTime, props, logs);
        this.props = props;
    }

    async beforeStart(): Promise<void> {
        await super.beforeStart();
        Injector.Register("api-route", "api");
    }

    async startWithControllers<T extends RestController>(...controllers: Array<new(server: any) => T>):
        Promise<void> {
        await super.start();
        super.registerControllers(...controllers);
        const fileController = new StaticFileController(this.restify, this.props);
    }

    stop() {
        super.stop();
    }
}
