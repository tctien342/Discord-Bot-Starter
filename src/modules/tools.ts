import { NextFunction, Response, Request } from 'express';
import fs, { writeFileSync } from 'fs';
import request from 'request';

export const ERR_TYPE = {
    SUCCESS: 'Success',
    AUTH: 'Authorization failed',
    DB_ERR: 'Database failed',
    PERM_ERR: 'Permission not accepted',
    INPUT: 'Input value not accepted',
};

export function responseBuilder(data: object, errType: string, errMess: string): string {
    return JSON.stringify({ data: data, err_type: errType, mess: errMess });
}

/**
 * Set content type by default
 * @param {express.Request} req request from client
 * @param {express.Response} res response from server
 * @param {express.NextFunction} next next function will be progress
 */
export function setResponseJSON(req: Request, res: Response, next: NextFunction) {
    res.set('Content-Type', 'application/json');
    next();
}

/**
 * Checking if request contain request key
 * @param {express.Request} req request from client
 * @param {express.Response} res response from server
 * @param {express.NextFunction} next next function will be progress
 */
export function checkRequestToken(req: Request, res: Response, next: NextFunction, token: string) {
    if (!req.headers.hasOwnProperty(process.env.HEADER_TOKEN_PREFIX) && !req.query.hasOwnProperty('token')) {
        res.send(responseBuilder({}, ERR_TYPE.INPUT, 'Missing services token'));
    } else {
        if (req.headers[process.env.HEADER_TOKEN_PREFIX] === token || req.query.token === token) {
            next();
        } else {
            res.send(responseBuilder({}, ERR_TYPE.INPUT, 'Token not accepted'));
        }
    }
}

export async function downloadFile(url: string, path: string) {
    return await fetch(url)
        .then((x) => x.arrayBuffer())
        .then((x) => writeFileSync(path, Buffer.from(x)));
}

export function callAPI(url: string, method: 'POST' | 'GET', headers: any, data: any) {
    return new Promise((rs, rj) => {
        if (method === 'GET') {
            let arrayData = [];
            for (let key of Object.keys(data)) {
                arrayData.push(`${key}=${data[key]}`);
            }
            if (arrayData.length > 0) {
                url += `?${arrayData.join('&')}`;
            }
        }
        request(
            url,
            {
                method: method,
                headers: { ...headers, Accept: 'application/json' },
                json: true,
                body: data,
            },
            function (error: any, response: any, body: any) {
                if (error) {
                    return rj(error);
                } else {
                    return rs(body);
                }
            },
        );
    });
}
