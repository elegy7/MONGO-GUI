import Vue from 'vue'
import Entry from '../components/Entry.vue'
import VeeValidate from 'vee-validate'
import vueToasted from 'vue-toasted'
import '../stylesheets/bootswatch.css'
import 'babel-polyfill'
import store from './store'

Vue.use(VeeValidate)
Vue.use(vueToasted, {
    position: 'top-center',
    duration: 2000,
    keepOnHover: true
})

new Vue({
    el: '#app',
    data() {
        return {
            BASEURL: 'http://localhost:3000'
        }
    },
    store,
    render: h => h(Entry),
    mounted() {}
})
