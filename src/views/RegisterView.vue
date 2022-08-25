<template>
	<v-container fill-height>
		<v-layout justify-center>
			<v-flex xs12 sm8 md4>
				<v-card class="elevation-12">
					<v-toolbar dark color="primary">
						<v-toolbar-title>Register</v-toolbar-title>
					</v-toolbar>
					<v-card-text>
						<v-alert v-if="errorState" :value="true" color="error" icon="mdi-alert-circle">
							{{errorMessage}}
						</v-alert>
						<v-form ref="form" v-model="valid" lazy-validation>
							<v-text-field prepend-icon="mdi-at" name="email" label="Email" type="email" v-model="email" :rules="emailRules" required ref="email">
							</v-text-field>
							<v-text-field prepend-icon="mdi-lock" name="password" label="Password" id="password" type="password" required v-model="password" :rules="passwordRules">
							</v-text-field>
							<v-card-actions>
								<router-link to="/login">Log in</router-link>
								<v-spacer></v-spacer>
								<v-btn color="primary" :disabled="!valid" @click="submit">Register</v-btn>
							</v-card-actions>
						</v-form>
					</v-card-text>
				</v-card>
			</v-flex>
		</v-layout>
	</v-container>
</template>

<script>
import router from '@/router';
export default {
	name: 'RegisterView',
	created() {
		this.$nextTick(() => this.$refs['email'].focus())
	},
	data() {
		return {
			errorState: false,
			errorMessage: '',
			valid: false,
			email: '',
			username: '',
			name: '',
			password: '',
			emailRules: [
				v => !!v || 'E-mail is required',
				v => /.+@.+/.test(v) || 'E-mail must be valid'
			],
			passwordRules: [
				v => !!v || 'Password is required',
				v => {
					return v.length < 6 ? 'Password must be greater than 6 characters' : true
				}
			]
		};
	},
	methods: {
		submit() {
			if (this.$refs.form.validate()) {
				this.$store.dispatch('auth/userRegister', {
					email: this.email,
					password: this.password,
					callback: (err, response) => {
						if (err) {
							this.errorState = true;
							this.errorMessage = err.response.data.message;
						} else {
							window.location.href = '/login';
						}
					}
				});
			}
		}
	}
};
</script>