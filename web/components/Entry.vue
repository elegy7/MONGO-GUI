<template>
    <div v-show="loaded">
        <Main v-if="dbs.length"></Main>
        <Login v-else></Login>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Login from './Login'
import Main from './Main'

export default {
    data() {
        return {
            loaded: false
        }
    },
    components: {
        Login,
        Main
    },
    computed: {
        ...mapGetters(['dbs'])
    },
    async created() {
        await this.$store.dispatch('getDbs')
        this.loaded = true
    }
}
</script>

