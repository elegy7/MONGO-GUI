import Docker from 'dockerode'
import { exec } from 'child_process'
import { MongoClient } from 'mongodb'
import { remote } from 'electron'

export default class IndexService {
    private connectConfig: any

    getDbs(): Array<any> {
        return this.connectConfig ? this.connectConfig.databases : []
    }
    async disConnect(config): Promise<any> {
        remote.getGlobal('connectInfo').databases = []
    }
    async connect(config): Promise<any> {
        const { authEnable, uname, password, address, port, database } = config
        const connectUrl = authEnable
            ? `mongodb://${uname}:${password}@${address}:${port}/${database}`
            : `mongodb://${address}:${port}/${database}`
        const client = await MongoClient.connect(connectUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        if (!client) return
        const admin = client.db(database).admin()
        const databases = await admin.listDatabases()
        // 查询用户要连接的库是否存在
        const result = databases.databases.find(item => item.name === database)

        remote.getGlobal('connectInfo').connectUrl = connectUrl
        remote.getGlobal('connectInfo').database = database
        // 如果没有当前要连接的库, 则临时添加一个
        if (!result) databases.databases.push({ name: database, sizeOnDisk: 0, empty: true })
        // 过滤掉系统库
        databases.databases = databases.databases.filter(
            item => ['admin', 'local', 'config'].indexOf(item.name) === -1
        )
        client.close()
        return databases
    }

    async restoreInDocker(dirpath: string, mongoServerName: string): Promise<any> {
        const { connectUrl, database } = remote.getGlobal('connectInfo')
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
            return dockerMongo
        } else {
            const dockerId = mongoServerName || dockerMongo[0].id
            // 删除临时dump目录
            exec(`docker exec ${dockerId} rm -rf dump`, (err, stdout) => {
                console.log('err', err, 'stdout', stdout)
                // 将目标目录复制至docker容器中的临时dump目录
                exec(`docker cp ${dirpath} ${dockerId}:dump`, (err, stdout) => {
                    console.log('err2', err, 'stdout', stdout)
                    // 执行docker容器的restore操作
                    exec(
                        `docker exec ${dockerId} mongorestore --uri=${connectUrl} -d ${database} dump`,
                        (err, stdout) => {
                            console.log('err3', err, 'stdout', stdout)
                        }
                    )
                })
            })
        }
    }
}
