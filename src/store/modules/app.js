const state = {
	loaded: false,
	errorState: false,
	errorMessage: '',
}

const getters = {
	isLoaded: () => {
		return state.loaded;
	}
};

const actions = {
	setLoaded({ commit }) {
		commit('setStateLoaded');
	},
	applyErrorState({ commit }, errorState) {
		commit('setErrorState', errorState);
	}
}

const mutations = {
	setStateLoaded() {
		state.loaded = true;
	},
	setErrorState(state, payload) {
		state.errorState = !!payload.errorState;
		state.errorMessage = payload.errorMessage || 'General Error';
	}
}

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
};