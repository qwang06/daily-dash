import apiService from '@/utils/apiService';

const state = {
	loaded: false,
	errorState: false,
	errorMessage: '',
	successState: false,
	successMessage: '',
	userPrefs: {}
}

const getters = {
	isLoaded: () => {
		return state.loaded;
	},
	userPrefs: () => {
		return state.userPrefs;
	}
};

const actions = {
	setLoaded({ commit }) {
		commit('setStateLoaded');
	},
	clearErrorState({ commit }) {
		commit('clearErrorState');
	},
	applyErrorState({ commit }, errorState) {
		commit('setErrorState', errorState);
	},
	clearSuccessState({ commit }) {
		commit('clearSuccessState');
	},
	applySuccessState({ commit }, successState) {
		commit('setSuccessState', successState);
	},
	applyUserPrefs({ commit }, userPrefs) {
		commit('setUserPrefs', userPrefs);
	},
	updateUserPrefs({ commit }, { userPrefs, callback }) {
		apiService.call({
			method: 'PUT',
			url: '/userPrefs',
			data: userPrefs || state.userPrefs
		}, (err, response) => {
			if (response?.data?.success) {
				commit('setUserPrefs', userPrefs || state.userPrefs);
				return callback(null, response);
			} else {
				commit('setErrorState', err || new Error('Failed to get user preferences.'));
				return callback(err, response);
			}
		});
	}
}

const mutations = {
	setStateLoaded() {
		state.loaded = true;
	},
	setUserPrefs(state, payload) {
		state.userPrefs = payload;
	},
	clearErrorState() {
		state.errorState = false;
		state.errorMessage = '';
	},
	setErrorState(state, payload) {
		state.errorState = true;
		state.errorMessage = payload || 'General Error';
	},
	clearSuccessState() {
		state.successState = false;
		state.successMessage = '';
	},
	setSuccessState(state, payload) {
		console.log('successState', payload);
		state.successState = true;
		state.successMessage = payload || 'Success';
	}
}

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
};