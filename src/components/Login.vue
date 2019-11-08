<template>
    <div class="login-warp"
         v-show="!connectStat">
        <div class="form-warp">
            <h1>MongoDB</h1>
            <p>Just for backup and restore</p>
            <div v-if="!connectList.length || isCreating">
                <div class="form-group">
                    <label>Address</label>
                    <input autocomplete="off"
                           class="form-control"
                           name="address"
                           type="text"
                           v-model="info.address"
                           v-validate="'required'">
                </div>
                <div class="form-group">
                    <label>Port</label>
                    <input autocomplete="off"
                           class="form-control"
                           name="port"
                           type="text"
                           v-model="info.port"
                           v-validate="'required'">
                </div>
                <div class="form-group">
                    <label>Database</label>
                    <input autocomplete="off"
                           class="form-control"
                           name="database"
                           type="text"
                           v-model="info.database"
                           v-validate="'required'">
                </div>
                <div class="form-group">
                    <div :class="['custom-control custom-switch', {'checked': info.dockerEnable}]"
                         @click="toogleCheck('dockerEnable')">
                        <input :class="['custom-control-input']"
                               type="checkbox"
                               v-model="info.dockerEnable">
                        <label class="custom-control-label"
                               for="customSwitch1">Mongo In Docker?</label>
                    </div>
                </div>
                <div class="form-group">
                    <select class="form-control"
                            v-model="info.dockerId"
                            v-validate="'required'"
                            name="docker">
                        <option v-for="(dockerMongo, index) in dockerMongoList"
                                :key="index"
                                :value="dockerMongo.id">
                            {{dockerMongo.names[0] + ' - ' + dockerMongo.id}}
                        </option>
                    </select>
                </div>
                <div class="form-group">
                    <div :class="['custom-control custom-switch', {'checked': info.authEnable}]"
                         @click="toogleCheck('authEnable')">
                        <input :class="['custom-control-input']"
                               type="checkbox"
                               v-model="info.authEnable">
                        <label class="custom-control-label"
                               for="customSwitch1">Perform Authentication</label>
                    </div>
                </div>
                <div v-if="info.authEnable">
                    <div class="form-group">
                        <label>Username</label>
                        <input autocomplete="off"
                               class="form-control"
                               name="uname"
                               type="text"
                               v-model="info.uname"
                               v-validate="'required'">
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input autocomplete="off"
                               class="form-control"
                               name="password"
                               type="password"
                               v-model="info.password"
                               v-validate="'required'">
                    </div>
                </div>
                <div class="error-box">
                    <p :key="item.id"
                       v-for="item in errors.items">
                        <span>{{item.msg}}</span>
                    </p>
                </div>
                <div class="form-group"
                     style="width: 100%;">
                    <a @click="isCreating = false"
                       class="btn fl"
                       href="javascript:;">Back</a>
                    <button @click="connect(info)"
                            class="btn btn-outline-success fr">Connect</button>
                </div>
            </div>
            <div v-else>
                <div :key="index"
                     v-for="(info, index) in connectList">
                    <div class="el-row">
                        <div class="el-col">{{info.address}}</div>
                        <div class="el-col">{{info.database}} / {{info.uname}}</div>
                        <div class="el-col">
                            <button @click="connect(info, true)"
                                    class="btn btn-sm btn-outline-info">ReConnect</button>
                            <button @click="remove(index)"
                                    class="btn btn-sm btn-outline-danger"
                                    style="margin-left: 20px;">Remove</button>
                        </div>
                    </div>
                </div>
                <div class="form-group create-warp">
                    <button @click="isCreating = true"
                            class="btn btn-success">Create New</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import IndexService from '../../src/service/index.service.ts'
import { BASEURL } from '../javascripts/utils/consts.js'
import { mapGetters } from 'vuex'
import Docker from 'dockerode'

const indexService = new IndexService()
export default {
    data() {
        return {
            isCreating: false,
            info: {
                address: 'localhost',
                port: '27017',
                dockerEnable: !!sessionStorage.getItem('dockerEnable') || true,
                authEnable: !!sessionStorage.getItem('authEnable'),
                database: '',
                uname: '',
                password: '',
                dockerId: ''
            },
            // mongodb docker容器列表
            dockerMongoList: []
        }
    },
    computed: {
        ...mapGetters(['connectList', 'connectStat'])
    },
    methods: {
        async connect(data, isReConnect) {
            await this.$validator.validateAll()
            if (this.errors.items.length) return
            if (!data.dockerId) {
                this.$toasted.error('未指定Docker容器')
                return
            }
            const result = await indexService.connect(data)
            if (!result.ok) {
                this.$toasted.error(result.err)
                return
            }
            this.info.connected = true
            this.$store.dispatch('setDbs', result.databases)
            this.$store.dispatch('setConnectStat', data)
            if (isReConnect) return
            this.$store.dispatch('setConnectList', this.info)
        },
        toogleCheck(field) {
            if (field === 'dockerEnable') return
            this.info[field] = !this.info[field]
            sessionStorage.setItem(
                'authEnable',
                this.info.authEnable ? 'enable' : ''
            )
            sessionStorage.setItem(
                'dockerEnable',
                this.info.dockerEnable ? 'enable' : ''
            )
        },
        // 删除一条连接信息
        remove(index) {
            this.$store.dispatch('removeFromConnectList', index)
        }
    },
    async mounted() {
        const docker = new Docker()
        const containers = await docker.listContainers()
        this.dockerMongoList = containers
            .filter(containerInfo => {
                return containerInfo.Image === 'mongo'
            })
            .map(containerInfo => {
                return {
                    id: containerInfo.Id,
                    names: containerInfo.Names.map(item =>
                        item.replace(/\//g, '')
                    )
                }
            })
        this.info.dockerId = this.dockerMongoList[0].id
    }
}
</script>

<style lang="less">
@green: #02b875;
.login-warp {
    .form-warp {
        width: 600px;
        margin: 0 auto;
    }
    .custom-switch {
        cursor: pointer;
        * {
            cursor: pointer;
        }
        &.checked {
            .custom-control-label::after {
                background-color: @green;
                border-color: @green;
            }
        }
        .custom-control-label::after {
            background-color: white;
            border: 1px solid #999;
            transition-duration: 0.5s;
        }
        user-select: none;
        &:hover {
            .custom-control-label::after {
                border-color: tint(@green, 50%);
                background-color: tint(@green, 50%);
            }
        }
    }
    .error-box {
        color: lighten(rgb(220, 35, 35), 15%);
        p {
            border: 1px solid lighten(rgb(220, 35, 35), 15%);
            border-radius: 3px;
            padding: 5px 15px;
        }
    }
    .el-row {
        display: flex;
        border: 0px solid #d9d9d9;
        padding: 10px;
        border-radius: 5px;
        padding-left: 0;
        .el-col {
            display: inline-flex;
            width: 33%;
            // padding-left: 30px;
            &:last-child {
                justify-content: flex-end;
            }
        }
        .btn-sm {
            padding: 0px 10px;
        }
    }
    .create-warp {
        padding-top: 50px;
        text-align: center;
        .btn {
            width: 200px;
        }
    }
}
</style>
