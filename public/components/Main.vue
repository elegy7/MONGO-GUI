<template>
    <div class="main-warp">
        <div class="line-box">
            <div v-for="(item, index) in dbs" :key="index">
                <span class="badge badge-light db-box">{{item.name}}</span>
                <div class="btn btn-sm btn-primary" @click="handleExport(item)">Export</div>
                <div class="btn btn-sm btn-primary" @click="handleImport(item)">Import</div>
            </div>
        </div>

        <div class="form-group mt20">
            <button class="btn btn-outline-danger" @click="disconnect">Disconnect</button>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import axios from 'axios'
export default {
    data() {
        return {}
    },
    computed: {
        ...mapGetters(['dbs'])
    },
    methods: {
        disconnect() {
            this.$store.dispatch('setConnectInfo', null)
            this.$store.dispatch('setDbs', [])
        },
        handleImport(item) {
            axios.post(this.$root.BASEURL + '/import')
        },
        handleExport(item) {}
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
}
</style>
