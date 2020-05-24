import { Response, NextFunction, Request } from 'express';
import './services';
let express = require('express');
let router = express.Router();
/* GET home page. */
router.get('/', function (req: Request, res: Response, next: NextFunction) {
    res.send('Minimal module...');
});

export default router;
