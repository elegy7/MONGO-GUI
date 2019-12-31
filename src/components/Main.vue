<template>
    <div class="main-warp">
        <div class="line-box">
            <div :key="index"
                 v-for="(item, index) in dbs">
                <span class="badge badge-light db-box">{{item.name}}</span>
                <div class="btn btn-sm btn-primary btn-100"
                     @click="showFileDialog">
                    <span>Restore</span>
                    <!-- <div class="file-input-warp">
                        <input @change="handleRestore"
                               type="file"
                               name="file"
                               class="file-input"
                               ref="fileinput"
                               webkitdirectory
                               directory>
                    </div> -->
                </div>
                <div @click="showDumpDialog(item)"
                     class="btn btn-sm btn-success"
                     v-if="item.sizeOnDisk > 0">
                    <span>Dump</span>
                </div>
                <div @click="handleDrop(item)"
                     class="btn btn-sm btn-danger"
                     v-if="item.sizeOnDisk > 0">
                    <span>Drop</span>
                </div>
            </div>
        </div>

        <div class="form-group mt20">
            <button @click="disconnect"
                    class="btn btn-outline-danger">Disconnect</button>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { remote, ipcRenderer as ipc } from 'electron'
import IndexService from '../service/index.service'

const indexService = new IndexService()

export default {
    data() {
        return {}
    },
    computed: {
        ...mapGetters(['dbs'])
    },
    methods: {
        // 断开数据库链接
        async disconnect() {
            indexService.disConnect()
            this.$store.dispatch('setDbs', [])
            this.$store.dispatch('setConnectStat', null)
        },
        // 打开备份数据库窗口
        showDumpDialog(db) {
            const dialog = remote.dialog
            dialog.showSaveDialog(
                {
                    title: '数据备份',
                    buttonLabel: '保存',
                    defaultPath: `${db.name}`
                },
                filepath => {
                    if (filepath) {
                        this.handleDump(filepath)
                    }
                }
            )
        },
        // 打开恢复数据库窗口
        showFileDialog() {
            const dialog = remote.dialog
            dialog.showOpenDialog(
                { properties: ['openDirectory'] },
                filename => {
                    if (filename && filename.length === 1) {
                        this.dictorySelected = filename[0]
                        this.handleRestore(this.dictorySelected)
                    }
                }
            )
        },
        // 备份数据库
        async handleDump(filepath) {
            const result = await indexService.dumpInDocker(filepath)
            if (result && result.ok) {
                this.$toasted.show('保存成功')
            } else {
                this.$toasted.error('备份时出现异常')
                this.disconnect()
            }
        },
        // 恢复数据库
        async handleRestore(dirpath) {
            const result = await indexService.restoreInDocker(dirpath)
            if (result && result.ok) {
                this.$toasted.show('恢复成功')
            } else {
                this.$toasted.error('恢复时出现异常')
                this.disconnect()
            }
            this.$store.dispatch('refreshDb')
        },
        // 删除数据库
        async handleDrop(db) {
            const result = await indexService.dropDb(db.name)
            if (result && result.ok) {
                this.$toasted.show('删除成功')
            } else {
                this.$toasted.error('删除时出现异常')
                this.disconnect()
            }
            this.$store.dispatch('refreshDb')
        }
    }
}
</script>

<style lang="less">
@green: #02b875;
.main-warp {
    width: 640px;
    margin: 0 auto;
    text-align: center;
    .line-box > div {
        margin: 10px;
    }
    .db-box {
        border-radius: 3px;
        width: 150px;
        margin-right: 50px;
        display: inline-block;
        border: 1px solid #8e8c84;
        font-size: 16px;
        color: #444;
        vertical-align: -2px;
        user-select: none;
        cursor: pointer;
    }
    .mt20 {
        margin-top: 100px;
    }
    .btn-100 {
        max-width: 100px;
        max-height: 32px;
        position: relative;
    }
}
.file-input-warp {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    overflow: hidden;
    .file-input {
        opacity: 0;
        cursor: pointer;
        width: 200px;
        height: 64px;
        margin-left: -100px;
        margin-top: -32px;
    }
}
</style>
