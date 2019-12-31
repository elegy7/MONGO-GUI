import { exec } from 'child_process'
import { MongoClient } from 'mongodb'
import { remote } from 'electron'
import logger from '../log/logger.js'
const isDev = require('electron-is-dev')
if (isDev) {
    console.log('Running in development')
} else {
    console.log('Running in production')
}
export default class IndexService {
    private connectConfig: any

    getDbs(): Array<any> {
        return this.connectConfig ? this.connectConfig.databases : []
    }
    async disConnect(config): Promise<any> {
        remote.getGlobal('connectInfo').connectUrl = ''
        remote.getGlobal('connectInfo').dockerId = ''
        remote.getGlobal('connectInfo').databases = []
    }
    async connect(config): Promise<any> {
        const { authEnable, uname, password, address, port, database, dockerId } = config
        const connectUrl = authEnable
            ? `mongodb://${uname}:${password}@${address}:${port}/${database}`
            : `mongodb://${address}:${port}/${database}`
        const client = await MongoClient.connect(connectUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: false
        }).catch(err => logger(err))
        if (!client) return { err: '数据库连接失败' }
        const admin = client.db(database).admin()
        const databases = await admin.listDatabases().catch(err => logger(err))
        if (!databases) return { err: '数据库连接失败' }
        // 查询用户要连接的库是否存在
        const result = databases.databases.find(item => item.name === database)

        remote.getGlobal('connectInfo').connectUrl = connectUrl
        remote.getGlobal('connectInfo').database = database
        remote.getGlobal('connectInfo').dockerId = dockerId
        // 如果没有当前要连接的库, 则临时添加一个
        if (!result) databases.databases.push({ name: database, sizeOnDisk: 0, empty: true })
        // 过滤掉系统库
        databases.databases = databases.databases.filter(
            item => ['admin', 'local', 'config'].indexOf(item.name) === -1
        )
        client.close()
        return databases
    }
    async dumpInDocker(filepath: string): Promise<any> {
        const { connectUrl, database, dockerId } = remote.getGlobal('connectInfo')
        return new Promise((resolve, reject) => {
            console.log('dockerId', dockerId)
            if (!dockerId) reject(new Error('logout'))
            // 删除临时dump目录
            exec(`docker exec ${dockerId} rm -rf dump`, (err, stdout) => {
                if (err) reject(err)
                // 执行docker容器的dump操作
                exec(
                    `docker exec ${dockerId} mongodump --uri=${connectUrl} -o /dump`,
                    (err, stdout) => {
                        if (err) reject(err)
                        // 将docker容器中的临时dump目录复制至目标目录
                        exec(
                            `docker cp ${dockerId}:dump/${database} ${filepath}`,
                            (err, result) => {
                                if (err) reject(err)
                                resolve({ ok: true, result: result })
                            }
                        )
                    }
                )
            })
        }).catch(err => logger(err))
    }
    async restoreInDocker(dirpath: string): Promise<any> {
        const { connectUrl, database, dockerId } = remote.getGlobal('connectInfo')
        return new Promise((resolve, reject) => {
            console.log('dockerId', dockerId)
            if (!dockerId) reject(new Error('logout'))
            // 删除临时dump目录
            exec(`docker exec ${dockerId} rm -rf dump`, (err, stdout) => {
                if (err) reject(err)
                // 将目标目录复制至docker容器中的临时dump目录
                exec(`docker cp ${dirpath} ${dockerId}:dump`, (err, stdout) => {
                    if (err) reject(err)
                    // 执行docker容器的restore操作
                    exec(
                        `docker exec ${dockerId} mongorestore --uri=${connectUrl} -d ${database} /dump`,
                        (err, stdout) => {
                            if (err) reject(err)
                            resolve({ ok: true })
                        }
                    )
                })
            })
        }).catch(err => logger(err))
    }

    async dropDb(dbname): Promise<any> {
        const { dockerId, connectUrl } = remote.getGlobal('connectInfo')
        return new Promise((resolve, reject) => {
            console.log('dockerId', dockerId)
            if (!dockerId) reject(new Error('logout'))
            let shell
            if (connectUrl.indexOf('@') > -1) {
                const args = connectUrl.split('@')
                const argsBefore = args[0].replace('mongodb://', '').split(':')
                const argsAfter = args[1].split('/')[0].split(':')
                const uname = argsBefore[0]
                const pwd = argsBefore[1]
                const host = argsAfter[0]
                const port = argsAfter[1]
                shell = `docker exec ${dockerId} mongo --host ${host}:${port} -u ${uname} -p ${pwd} ${dbname} --eval "printjson(db.dropDatabase())"`
            } else {
                const args = connectUrl
                    .replace('mongodb://', '')
                    .split('/')[0]
                    .split(':')
                const host = args[0]
                const port = args[1]
                shell = `docker exec ${dockerId} mongo --host ${host}:${port} ${dbname} --eval "printjson(db.dropDatabase())"`
            }
            exec(shell, err => {
                if (err) reject(err)
                resolve({ ok: true })
            })
        }).catch(err => logger(err))
    }
}
