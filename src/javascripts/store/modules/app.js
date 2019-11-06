import IndexService from '../../../service/index.service'

const indexService = new IndexService()
const app = {
    state: {
        dbs: [],
        connectStat: false,
        connectInfo: JSON.parse(localStorage.getItem('connectInfo') || '[]')
    },
    mutations: {
        SET_DBS: (state, paylaod) => {
            state.dbs = paylaod
        },
        SET_CONNECTSTAT: (state, paylaod) => {
            state.connectStat = paylaod
        },
        SET_CONNECTINFO: (state, paylaod) => {
            if (paylaod) {
                state.connectInfo.push(paylaod)
                localStorage.setItem('connectInfo', JSON.stringify(state.connectInfo))
            }
        },
        REMOVE_CONNECTINFO: (state, paylaod) => {
            state.connectInfo.splice(paylaod, 1)
            localStorage.setItem('connectInfo', JSON.stringify(state.connectInfo))
        }
    },
    actions: {
        getDbs({ commit }) {
            return new Promise(async resolve => {
                const result = indexService.getDbs()
                commit('SET_DBS', result)
                resolve()
            })
        },
        setDbs({ commit }, data) {
            commit('SET_DBS', data)
        },
        setConnectInfo({ commit }, data) {
            commit('SET_CONNECTINFO', data)
        },
        removeConnectInfo({ commit }, data) {
            commit('REMOVE_CONNECTINFO', data)
        }
    }
}

export default app
