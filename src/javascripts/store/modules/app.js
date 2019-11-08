import IndexService from '../../../service/index.service'
import logger from '../../../log/logger'

const indexService = new IndexService()
const app = {
    state: {
        dbs: [],
        connectStat: false,
        connectList: JSON.parse(localStorage.getItem('connectList') || '[]')
    },
    mutations: {
        SET_DBS: (state, data) => {
            state.dbs = data
        },
        SET_CONNECTSTAT: (state, data) => {
            state.connectStat = data
        },
        SET_CONNECTLIST: (state, data) => {
            if (data) {
                state.connectList.push(data)
                localStorage.setItem('connectList', JSON.stringify(state.connectList))
            }
        },
        REMOVE_FROM_CONNECTLIST: (state, data) => {
            state.connectList.splice(data, 1)
            localStorage.setItem('connectList', JSON.stringify(state.connectList))
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
        setDbs({ commit }, paylaod) {
            commit('SET_DBS', paylaod)
        },
        setConnectList({ commit }, paylaod) {
            commit('SET_CONNECTLIST', paylaod)
        },
        removeFromConnectList({ commit }, paylaod) {
            commit('REMOVE_FROM_CONNECTLIST', paylaod)
        },
        setConnectStat({ commit }, paylaod) {
            commit('SET_CONNECTSTAT', paylaod)
        },
        async refreshDb({ commit, state }, paylaod) {
            // commit('REFRESH_DB', paylaod)
            const result = await indexService.connect(state.connectStat).catch(err => {
                logger(err)
            })
            commit('SET_DBS', result.databases)
        }
    }
}

export default app
