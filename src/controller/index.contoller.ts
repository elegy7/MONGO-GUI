import Controller from '../interfaces/contoller'
import * as express from 'express'
import * as Docker from 'dockerode'
import { promise as execShPromise } from 'exec-sh'
import { Router } from 'express'
import { MongoClient, Admin } from 'mongodb'
export default class IndexContoller implements Controller {
    public router: Router = express.Router()
    public path: string = '/'

    constructor() {
        this.initializeRouter()
    }

    private initializeRouter() {
        // 检查登录状态
        this.router.post('/getDbs', async (req: any, res: express.Response) => {
            const { databases } = req.session
            if (!databases) {
                res.json({ code: 'session timeout' })
                return
            }
            res.json({ code: 'ok', databases })
        })
        // 断开连接
        this.router.post('/disConnect', async (req: any, res: express.Response) => {
            req.session.destroy()
            res.json({ code: 'ok' })
        })

        // 连接数据库
        this.router.post('/connect', async (req: any, res: express.Response) => {
            const {
                address,
                port,
                uname,
                password,
                database,
                authEnable,
                dockerEnable
            } = req.body.data
            const connectUrl = authEnable
                ? `mongodb://${uname}:${password}@${address}:${port}/${database}`
                : `mongodb://${address}:${port}/${database}`
            const client: MongoClient = await MongoClient.connect(connectUrl)
            if (!client) return
            const admin: Admin = client.db(database).admin()
            const databases = await admin.listDatabases()
            // 查询用户要连接的库是否存在
            const result = databases.databases.find(item => item.name === database)
            // 如果没有当前要连接的库, 则临时添加一个
            if (!result) databases.databases.push({ name: database, sizeOnDisk: 0, empty: true })
            // 过滤掉系统库
            databases.databases = databases.databases.filter(
                item => ['admin', 'local', 'config'].indexOf(item.name) === -1
            )
            client.close()
            if (!databases.databases.length) {
                res.send({ status: 'err', message: 'default databases are not support' })
                return
            }
            // 将必要的信息存储到session
            req.session.connectUrl = connectUrl
            req.session.database = database
            req.session.dockerEnable = dockerEnable
            req.session.databases = databases.databases
            req.session.save()
            res.send({ code: 'ok', databases: databases.databases })
        })
        // restore数据库
        this.router.post('/restore', async (req: any, res: express.Response) => {
            const { connectUrl, dockerEnable, database } = req.session
            const { dirpath } = req.body.data
            req.body.data = req.body.data || {}
            if (!connectUrl) {
                res.json({ code: 'session timeout' })
                return
            }
            // 使用了docker的情况
            if (dockerEnable) {
                const { mongoServerName } = req.body.data
                const docker = new Docker()
                const containers = await docker.listContainers()
                const dockerMongo = containers
                    .filter(containerInfo => {
                        return containerInfo.Image === 'mongo'
                    })
                    .map(containerInfo => {
                        return {
                            id: containerInfo.Id,
                            names: containerInfo.Names.map(item => item.replace(/\//g, ''))
                        }
                    })
                // 如果找到了复数个mongo的容器, 则返回让用户选择, 否则直接进行导出
                if (dockerMongo.length > 1 && !mongoServerName) {
                    res.json(dockerMongo)
                } else {
                    const dockerId = mongoServerName || dockerMongo[0].id
                    // 删除临时dump目录
                    await execShPromise(`docker exec ${dockerId} rm -rf dump`)
                    // 将目标目录复制至docker容器中的临时dump目录
                    await execShPromise(`docker cp ${dirpath} ${dockerId}:dump`)
                    // 执行docker容器的restore操作
                    await execShPromise(
                        `docker exec ${dockerId} mongorestore --uri=${connectUrl} -d ${database} dump`
                    )
                }
                return
            }
            res.json({ code: 'ok', msg: '导入成功' })
        })
    }
}
