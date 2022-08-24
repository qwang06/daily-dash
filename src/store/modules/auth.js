import apiService from '@/utils/apiService';
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
		apiService.call({
			method: 'POST',
			url: '/register',
			data: {
				email: email,
				password: password
			}
		}, (err, response) => {
			if (response.data.success) {
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
			if (response.data.success) {
				commit('setUser', { email: response.data.email });
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
			if (response.data.success) {
				commit('setUser', { email: response.data.email });
				commit('setIsAuthenticated', true);
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
	}
}

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
};