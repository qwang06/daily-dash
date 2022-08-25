<template>
	<v-app>
		<v-app-bar app color="primary">
			<div class="d-flex align-center">
				<v-img
					alt="Daily Dash Logo"
					class="shrink mr-2"
					contain
					:src="require('./assets/logo.svg')"
					transition="scale-transition"
					width="40"
				/>
				<h2 class="secondary--text">DD</h2>
			</div>
			<v-spacer />
			<div class="d-flex">
				<v-btn color="secondary" text @click="logout">Log Out</v-btn>
			</div>
		</v-app-bar>

		<v-main>
			<router-view/>
		</v-main>
		<v-snackbar
			v-model="errorState"
			:top="true"
			color="error"
		>
			{{ errorMessage }}
			<v-btn
				text
				@click="$store.dispatch('app/clearErrorState')"
			>
				Close
			</v-btn>
		</v-snackbar>
		<v-snackbar
			v-model="successState"
			:top="true"
			color="success"
		>
			{{ successMessage }}
			<v-btn
				text
				@click="$store.dispatch('app/clearSuccessState')"
			>
				Close
			</v-btn>
		</v-snackbar>
	</v-app>
</template>

<script>
import router from '@/router';
export default {
	name: 'App',
	created() {
		document.title = 'Daily Dash';
	},
	computed: {
		errorState: {
			get() {
				return this.$store.state.app.errorState;
			},
			set() {
				return this.$store.dispatch('app/clearErrorState');
			}
		},
		errorMessage() {
			return this.$store.state.app.errorMessage;
		},
		successState: {
			get() {
				return this.$store.state.app.successState;
			},
			set() {
				return this.$store.dispatch('app/clearSuccessState');
			}
		},
		successMessage() {
			return this.$store.state.app.successMessage;
		}
	},
	methods: {
		logout() {
			this.$store.dispatch('auth/userLogout', {
				callback: (err, response) => {
					if (err) {
						this.$store.dispatch('app/applyErrorState', err);
					} else {
						window.location.href = '/login';
					}
				}
			});
		}
	}
};
</script>
