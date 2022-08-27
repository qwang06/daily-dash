import apiService from '@/utils/apiService';
import store from '@/store';
const state = {
	loaded: false,
	user: {},
	isAuthenticated: false,
	isGoogleAuthenticated: false
};

const getters = {
	isLoaded: () => {
		return state.loaded;
	},
	isAuthenticated: () => {
		return state.isAuthenticated;
	},
	isGoogleAuthenticated: () => {
		return state.isGoogleAuthenticated;
	},
	currentUser: (state) => {
		return state.user;
	}
};

const actions = {
	setLoaded({ commit }) {
		commit('setStateLoaded');
	},
	setIsGoogleAuthenticated({ commit }, isGoogleAuthenticated) {
		console.log('isGoogleAuthenticated', isGoogleAuthenticated);
		commit('setIsGoogleAuthenticated', isGoogleAuthenticated);
	},
	userRegister({ commit }, { email, password, callback }) {
		apiService.call({
			method: 'POST',
			url: '/register',
			data: {
				email: email,
				password: password
			}
		}, (err, response) => {
			if (response?.data?.success) {
				commit('setUser', { email: response.data.email });
				commit('setIsAuthenticated', true);
				return callback(null, response);
			} else {
				return callback(err || new Error('Registration failed.'));
			}
		});
	},
	userLogin({ commit }, { email, password, callback }) {
		apiService.call({
			method: 'POST',
			url: '/login',
			data: {
				email: email,
				password: password
			}
		}, (err, response) => {
			if (response?.data?.success) {
				store.dispatch('app/applyUserPrefs', response.data.user.userPrefs);
				commit('setUser', response.data.user);
				commit('setIsAuthenticated', true);
				return callback(null, response);
			} else {
				return callback(err || new Error('Login failed.'));
			}
		});
	},
	userLogout({ commit }, { callback }) {
		apiService.call({
			method: 'POST',
			url: '/logout'
		}, (err, response) => {
			if (err) return callback(err);

			commit('setUser', {});
			commit('setIsAuthenticated', false);
			return callback(null, response);
		});
	},
	userLoad({ commit }, { email, password, callback }) {
		apiService.call({
			method: 'GET',
			url: '/auth'
		}, (err, response) => {
			if (response?.data?.success) {
				store.dispatch('app/applyUserPrefs', response.data.user.userPrefs);
				commit('setUser', response.data.user);
				commit('setIsAuthenticated', true);
				console.log('response.data.user.userPrefs.googleCode', response.data.user.userPrefs.googleCode);
				commit('setIsGoogleAuthenticated', !!response.data.user.userPrefs.googleCode);
				return callback();
			} else {
				return callback(err || new Error('Unable to authenticate user.'));
			}
		});
	}
}

const mutations = {
	setStateLoaded() {
		state.loaded = true;
	},
	setUser(state, data) {
		state.user = data;
	},
	setIsAuthenticated(state, data) {
		state.isAuthenticated = data;
	},
	setIsGoogleAuthenticated(state, data) {
		state.isGoogleAuthenticated = data;
	}
}

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
};