<template>
    <div class="login-warp" v-show="!connectStat">
        <div class="form-warp">
            <h1>MongoDB</h1>
            <p>Just for export and import</p>
            <div class="form-group">
                <label>Address</label>
                <input
                    class="form-control"
                    type="text"
                    name="address"
                    v-model="info.address"
                    v-validate="'required'"
                    autocomplete="off"
                >
            </div>
            <div class="form-group">
                <label>Port</label>
                <input
                    class="form-control"
                    type="text"
                    name="port"
                    v-model="info.port"
                    v-validate="'required'"
                    autocomplete="off"
                >
            </div>
            <div class="form-group">
                <div
                    :class="['custom-control custom-switch', {'checked': info.authEnable}]"
                    @click="toogleCheck"
                >
                    <input
                        :class="['custom-control-input']"
                        type="checkbox"
                        v-model="info.authEnable"
                    >
                    <label class="custom-control-label" for="customSwitch1">Perform Authentication</label>
                </div>
            </div>
            <div v-if="info.authEnable">
                <div class="form-group">
                    <label>Database</label>
                    <input
                        class="form-control"
                        type="text"
                        name="database"
                        v-model="info.database"
                        v-validate="'required'"
                        autocomplete="off"
                    >
                </div>
                <div class="form-group">
                    <label>Username</label>
                    <input
                        class="form-control"
                        type="text"
                        name="uname"
                        v-model="info.uname"
                        v-validate="'required'"
                        autocomplete="off"
                    >
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input
                        class="form-control"
                        type="password"
                        name="password"
                        v-model="info.password"
                        v-validate="'required'"
                        autocomplete="off"
                    >
                </div>
            </div>
            <div class="error-box">
                <p v-for="item in errors.items" :key="item.id">
                    <span>{{item.msg}}</span>
                </p>
            </div>
            <div class="form-group fr">
                <button class="btn btn-outline-success" @click="connect(info)">Connect</button>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios'
import { mapGetters } from 'vuex'
export default {
    data() {
        return {
            info: {
                address: 'localhost',
                port: '27017',
                authEnable: !!sessionStorage.getItem('authEnable'),
                database: 'ishow',
                uname: 'elegy7',
                password: '123465',
                containerName: 'mongo-server'
            }
        }
    },
    computed: {
        ...mapGetters(['connectInfo', 'connectStat'])
    },
    methods: {
        async connect(data) {
            await this.$validator.validateAll()
            if (this.errors.items.length) return
            const result = await axios.post(this.$root.BASEURL + '/connect', {
                data
            })
            if (!result.data.ok) {
                this.$toasted.error(result.data.message)
                this.$store.dispatch('setConnectInfo', null)
                return
            }
            this.$store.dispatch('setDbs', result.data.databases)
            this.$store.dispatch('setConnectInfo', this.info)
        },
        toogleCheck() {
            this.info.authEnable = !this.info.authEnable
            sessionStorage.setItem(
                'authEnable',
                this.info.authEnable ? 'enable' : ''
            )
        }
    },
    created() {
        if (this.connectStat) {
            this.connect(this.connectInfo)
        }
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
}
</style>
