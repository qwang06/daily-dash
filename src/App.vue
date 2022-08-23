<template>
	<v-app>
		<v-app-bar
			app
			color="primary"
			dark
		>
			<div class="d-flex align-center">
				<v-img
					alt="Daily Dash Logo"
					class="shrink mr-2"
					contain
					:src="require('./assets/logo.svg')"
					transition="scale-transition"
					width="40"
				/>

				<h2>Daily Dash</h2>
				<v-btn color="primary" @click="logout">Log Out</v-btn>
			</div>
		</v-app-bar>

		<v-main>
			<router-view/>
		</v-main>
	</v-app>
</template>

<script>
import router from '@/router';
export default {
	name: 'App',
	data: () => ({
	}),
	methods: {
		logout() {
			this.$store.dispatch('auth/userLogout', {
				callback: (err, response) => {
					if (err) {
						console.log('Failed to logout', err);
					} else {
						window.location.href = '/login';
					}
				}
			});
		}
	}
};
</script>
