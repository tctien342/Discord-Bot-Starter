import { name, about, version, dependencies } from '../../package.json';
import { Response, NextFunction, Request } from 'express';

let express = require('express');
let router = express.Router();

/* GET home page. */
router.get('/', function(req: Request, res: Response, next: NextFunction) {
  res.render('index', {
    title: 'Express Server',
    version: version,
    name: name,
    about: about,
    expressVersion: dependencies.express,
    pugVersion: dependencies['cookie-parser'],
  });
});

export default router;
