<template>
    <div class="main-warp">
        <div class="line-box">
            <div :key="index"
                 v-for="(item, index) in dbs">
                <span class="badge badge-light db-box">{{item.name}}</span>
                <div class="btn btn-sm btn-primary btn-100">
                    <span>Import</span>
                    <div class="file-input-warp">
                        <input @change="handleRestore"
                               type="file"
                               name="file"
                               class="file-input"
                               ref="fileinput"
                               webkitdirectory
                               directory>
                    </div>
                </div>
                <div @click="handleExport(item)"
                     class="btn btn-sm btn-primary"
                     v-if="item.sizeOnDisk > 0">
                    <span>Export</span>
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
import { BASEURL } from '../javascripts/utils/consts.js'
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
            await axios.post(BASEURL + '/disConnect')
            this.$store.dispatch('setDbs', [])
        },
        async handleRestore(item) {
            const result = await axios.post(BASEURL + '/restore', {
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
