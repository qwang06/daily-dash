import Vue from 'vue'
import Vuex from 'vuex'

import app from './modules/app';
import auth from './modules/auth';

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
	},
	getters: {
	},
	mutations: {
	},
	actions: {
	},
	modules: {
		app,
		auth
	}
})
