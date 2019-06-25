import * as express from 'express'
import * as path from 'path'
import * as logger from 'morgan'
import * as favicon from 'express-favicon'
import * as session from 'express-session'
import * as SessionFileStore from 'session-file-store'
import 'express-async-errors'
import errorMiddleware from './middleware/error.middleware'
import IndexContoller from './controller/index.contoller'
import UsersContoller from './controller/users.contoller'

export class App {
    public app = express()
    // 将各个模块路由注入express-router
    public injectContollers(contollers) {
        for (const contoller of contollers) {
            const { router, path } = contoller
            this.app.use(path, router)
        }
    }

    public listen() {
        this.app.use(logger('dev'))
        this.app.use(express.json())
        this.app.use(
            session({
                secret: 'meiyoumima',
                cookie: {
                    maxAge: 24 * 60 * 60 * 1000
                },
                store: new (SessionFileStore(session))()
            })
        )
        this.app.use(express.urlencoded({ extended: false }))
        this.app.use(express.static(path.join(__dirname, '../public/dist')))
        this.app.use(favicon(path.resolve(__dirname, '../public/images/mongo.png')))
        this.injectContollers([new IndexContoller()])
        this.injectContollers([new UsersContoller()])
        this.app.use(errorMiddleware)

        this.app.listen(3000, () => {
            console.log('Success!! Server running at http://localhost:3000')
        })
    }
}
