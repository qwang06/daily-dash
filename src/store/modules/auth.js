import axios from 'axios';

const baseURL = 'http://localhost:3691/'; // TODO: update for prod
const state = {
	loaded: false,
	user: {},
	isAuthenticated: false
};

const getters = {
	isLoaded: () => {
		return state.loaded;
	},
	isAuthenticated: () => {
		return state.isAuthenticated;
	},
	currentUser: (state) => {
		return state.user;
	}
};

const actions = {
	setLoaded({ commit }) {
		commit('setStateLoaded');
	},
	userRegister({ commit }, { email, password, callback }) {
		axios.request({
			baseURL,
			method: 'POST',
			url: '/register',
			data: {
				email: email,
				password: password
			},
			withCredentials: true
		}).then(response => {
			if (response.data.success) {
				commit('setUser', { email: response.data.email });
				commit('setIsAuthenticated', true);
			}
			return callback(null, response);
		}).catch(err => {
			return callback(err);
		});
	},
	userLogin({ commit }, { email, password, callback }) {
		axios.request({
			baseURL,
			method: 'POST',
			url: '/login',
			data: {
				email: email,
				password: password
			},
			withCredentials: true
		}).then(response => {
			if (response.data.success) {
				commit('setUser', { email: response.data.email });
				commit('setIsAuthenticated', true);
			}
			return callback(null, response);
		}).catch(err => {
			return callback(err);
		});
	},
	userLogout({ commit }, { callback }) {
		axios.request({
			baseURL,
			method: 'POST',
			url: '/logout',
			withCredentials: true
		}).then(response => {
			commit('setUser', {});
			commit('setIsAuthenticated', false);
			return callback(null, response);
		}).catch(err => {
			return callback(err);
		});
	},
	userLoad({ commit }, { email, password, callback }) {
		axios.request({
			baseURL,
			method: 'GET',
			url: '/auth',
			withCredentials: true
		}).then(response => {
			if (response.data.success) {
				commit('setUser', { email: response.data.email });
				commit('setIsAuthenticated', true);
				return callback();
			} else {
				return callback(new Error('Unable to authenticate user.'));
			}
		}).catch(err => {
			return callback(err);
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
	}
}

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
};