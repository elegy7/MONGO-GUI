<template>
    <div class="main-warp">
        <div class="line-box">
            <div v-for="(item, index) in dbs" :key="index">
                <span class="badge badge-light db-box">{{item.name}}</span>
                <div class="btn btn-sm btn-primary" @click="handleImport(item)">Import</div>
                <div
                    class="btn btn-sm btn-primary"
                    @click="handleExport(item)"
                    v-if="item.sizeOnDisk > 0"
                >Export</div>
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
        async disconnect() {
            await axios.post(this.$root.BASEURL + '/disConnect')
            this.$store.dispatch('setDbs', [])
        },
        async handleImport(item) {
            const result = await axios.post(this.$root.BASEURL + '/import', {
                data: {
                    dirpath: 'd:/dump/ishow'
                }
            })
            if (result.data.code === 'session timeout') {
                this.$store.dispatch('setDbs', [])
                return
            }
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
