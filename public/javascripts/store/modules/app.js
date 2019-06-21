const app = {
    state: {
        dbs: [],
        connectStat: !!sessionStorage.getItem('connectInfo'),
        connectInfo: JSON.parse(sessionStorage.getItem('connectInfo'))
    },
    mutations: {
        SET_DBS: (state, paylaod) => {
            state.dbs = paylaod
        },
        SET_CONNECTSTAT: (state, paylaod) => {
            state.connectStat = paylaod
        },
        SET_CONNECTINFO: (state, paylaod) => {
            state.connectStat = paylaod
            if (paylaod) {
                sessionStorage.setItem('connectInfo', JSON.stringify(paylaod))
            } else {
                sessionStorage.removeItem('connectInfo')
            }
        }
    },
    actions: {
        setDbs({ commit }, data) {
            commit('SET_DBS', data)
        },
        setConnectInfo({ commit }, data) {
            commit('SET_CONNECTINFO', data)
            commit('SET_CONNECTSTAT', data ? 'connected' : '')
        }
    }
}

export default app
