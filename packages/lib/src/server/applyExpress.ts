import express from 'express';
import type { Express, Request, Response } from 'express';
import { apply } from '.';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
const FileStreamRotator = require('file-stream-rotator')
import { check, validationResult } from 'express-validator';



/**
 * @example
 * {
 *   method: 'post', // app.post
 *   route: '/users', // http://localhost:3000/users
 *   controller: UserController, // import UserController from './UserController'
 *   action: 'register' // UserController.register
 *   validators: [
 *      check('email').isEmail(), 
 *      check('username').custom(value => {
 *          return User.find({username:value}).then(user => {
 *             if (user) {
 *                return Promise.reject('Username already in use');
 *             }    
 *          })
 *      })
 *  ] // express-validator
 */
type ExpressRoute = {
    method: 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head' | 'trace' | 'connect',
    route: string,
    controller: any,
    action: string,
    validators?: any[]
}

class ExpressAppWrapper {
    app: express.Express;
    port: number;
    constructor(routes: ExpressRoute[], port: number, log_path = 'log', useLog = false) {
        this.port = port;
        this.app = express();
        this.configureMiddleware(log_path, useLog);
        this.app.set('trust proxy', 1);
        this.configureRoutes(routes);
    }

    private configureMiddleware(log_path = 'log', useLog = false) {
        // body-parser
        this.app.use(express.json());
        // cors
        this.app.use((_, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
            res.header('Access-Control-Allow-Methods', '*');
            next();
        });
        // static
        this.app.use(express.static('public'));
        // morgan
        if (useLog) {
            const logDirectory = path.join(log_path);
            fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
            const accessLogStream = FileStreamRotator.getStream({
                date_format: 'YYYYMMDD',
                filename: path.join(logDirectory, 'access-%DATE%.log'),
                frequency: 'daily',
                verbose: false
            });
            this.app.use(morgan('combined', { stream: accessLogStream }));
        }
        // error handler
        this.app.use((err: any, req: Request, res: Response, next: Function) => {
            console.error(err.stack);
            res.status(500).send('Something broke!');
        });
    }
    // cache controller instance
    private controllerInstances: Map<any, any> = new Map();
    // configure routes
    private configureRoutes(routes: ExpressRoute[]) {
        routes.forEach(route => {
            this.app[route.method](route.route, route.validators || [], (req: Request, res: Response, next: Function) => {
                console.log(req.body)
                // express-validator
                const errors = validationResult(req);
                console.log(errors)
                if (!errors.isEmpty()) {
                    return res.status(422).json({ errors: errors.array() });
                }
                // cache controller instance
                let controllerInstance = this.controllerInstances.get(route.controller);
                if (!controllerInstance) {
                    // new controller instance
                    controllerInstance = new route.controller();
                    this.controllerInstances.set(route.controller, controllerInstance);
                }
                // call controller action
                if (typeof controllerInstance[route.action] === 'function') {
                    controllerInstance[route.action](req, res, next);
                } else {
                    res.status(404).send('Action not found');
                }
            });
        });
    }
    // apply express server using cluster
    apply() {
        apply(() => {
            this.app.listen(this.port, () => {
                console.log(`Server is running at http://localhost:${this.port}`);
            });
        });
    }
    // delegate express methods
    use(...args: Parameters<Express['use']>) {
        this.app.use(...args);
    }
    // delegate express methods
    set(...args: Parameters<Express['set']>) {
        this.app.set(...args);
    }
    // return express instance
    getApp() {
        return this.app;
    }
}

type opts = {
    port: number,
    routes: ExpressRoute[],
    useLog?: boolean,
    log_path?: string
}

/**
 * @description apply express server with cluster, body-parser, cors, static, routes, error handler, validator
 * @param port port
 * @param routes config routes
 * @returns ExpressAppWrapper instance
 */
export const expressApply = (opts: opts): ExpressAppWrapper => {
    const { port, routes, useLog, log_path } = opts
    return new ExpressAppWrapper(routes, port, log_path, useLog);
};
