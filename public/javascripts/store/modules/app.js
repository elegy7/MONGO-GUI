import axios from 'axios'
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
                const result = await axios.post('/getDbs')
                console.log('result', result)
                if (result.data.code !== 'ok') {
                    commit('SET_DBS', [])
                } else {
                    commit('SET_DBS', result.data.databases)
                }
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
