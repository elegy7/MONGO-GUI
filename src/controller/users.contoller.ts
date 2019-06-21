import Controller from '../interfaces/contoller'
import * as express from 'express'
import { Router } from 'express'

export default class UsersContoller implements Controller {
    public router: Router = express.Router()
    public path: string = '/users'

    constructor() {
        this.initializeRouter()
    }

    private initializeRouter() {
        this.router.get('/', async (req: express.Request, res: express.Response) => {
            res.send('invoke users')
        })
    }
}
