<template>
    <div>
        <Main v-if="dbs.length"></Main>
        <Login v-else></Login>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Login from './Login'
import Main from './Main'

export default {
    components: {
        Login,
        Main
    },
    computed: {
        ...mapGetters(['dbs'])
    }
}
</script>

