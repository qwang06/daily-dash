import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store';

Vue.use(VueRouter)

const guard = (to, from, next) => {
	if (!store.state.auth.isAuthenticated) {
		store.dispatch('auth/userLoad', {
			callback: (err) => {
				if (err) {
					return next('/login');
				} else {
					return next();
				}
			}
		});
	}
}

const routes = [
	{
		path: '/',
		name: 'home',
		beforeEnter: guard,
		component: () => import('../views/HomeView.vue')
	},
	{
		path: '/about',
		name: 'about',
		// route level code-splitting
		// this generates a separate chunk (about.[hash].js) for this route
		// which is lazy-loaded when the route is visited.
		component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
	},
	{
		path: '/login',
		name: 'login',
		component: () => import('../views/LoginView.vue')
	},
	{
		path: '/register',
		name: 'register',
		component: () => import('../views/RegisterView.vue')
	}
]

const router = new VueRouter({
	mode: 'history',
	base: process.env.BASE_URL,
	routes
});

export default router
