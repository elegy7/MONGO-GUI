import Controller from '../interfaces/contoller'
import * as express from 'express'
import * as Docker from 'dockerode'
import * as fs from 'fs'
import { Router } from 'express'
import { MongoClient, Admin } from 'mongodb'
import { exec } from 'child_process'

export default class IndexContoller implements Controller {
    public router: Router = express.Router()
    public path: string = '/'

    constructor() {
        this.initializeRouter()
    }

    private initializeRouter() {
        this.router.post('/connect', async (req: any, res: express.Response) => {
            const { address, port, uname, password, database, authEnable } = req.body.data
            const connectUrl = authEnable
                ? `mongodb://${uname}:${password}@${address}:${port}/${database}`
                : `mongodb://${address}:${port}/${database}`
            const client = await MongoClient.connect(connectUrl)
            if (!client) return
            req.session.connectUrl = connectUrl
            console.log('client', await client.db(database).databaseName)
            const admin = client.db(database).admin()
            const databases = await admin.listDatabases()
            // databases.databases = databases.databases.length ? databases.databases : [database]
            client.close()
            res.send({ ...databases })
        })

        this.router.post('/import', async (req: any, res: express.Response) => {
            const connectUrl = req.session.connectUrl
            const dockerShell = `docker exec -it mongo-server mongorestore --uri=${connectUrl} dump`
            exec(dockerShell, (err, result) => {
                console.log(err, result)
            })
            /* const mongoServer = docker.getContainer('mongo-server')
            console.log('mongoServer', mongoServer) */
            res.send({ code: 'ok' })
        })
    }
}
