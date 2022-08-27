<template>
	<div>
		<dashboard-component-toolbar :config="config">
			<template #options="{ data }">
				<v-date-picker v-model="date" @change="setDate"></v-date-picker>
			</template>
		</dashboard-component-toolbar>
		<v-card-text>
			<h1>{{config.name}} {{daysCounter}}</h1>
			<v-card-actions>
				<v-btn v-if="!isGoogleAuthenticated" color="info" @click="googleAuth">Authenticate with Google</v-btn>
				<v-btn color="info" @click="addToGoogleCalendar">Add to Google Calendar</v-btn>
			</v-card-actions>
		</v-card-text>
	</div>
</template>

<script>
import apiService from '@/utils/apiService';
import DashboardComponentToolbar from './DashboardComponentToolbar';
const DAY_SECONDS = 86400;
export default {
	name: 'DaysCounter',
	props: {
		config: Object
	},
	components: {
		DashboardComponentToolbar
	},
	data() {
		return {
			date: this.config.date || ''
		}
	},
	computed: {
		daysCounter() {
			const today = new Date();
			const selectedDay = new Date(`${this.date} 00:00`);
			const difference = Math.floor(Math.floor((selectedDay - today) / 1000) / DAY_SECONDS);
			if (difference > 0) {
				return `in ${difference} days`;
			} else if (difference < 0) {
				return `${Math.abs(difference)} days ago`;
			} else {
				return `Today's the day!`;
			}
		},
		isGoogleAuthenticated() {
			return this.$store.state?.auth?.isGoogleAuthenticated || false;
		}
	},
	methods: {
		setDate() {
			this.config.date = this.date;
		},
		googleAuth() {
			const options = {
				url: '/google/calendar/auth'
			}
			apiService.call(options, (err, response) => {
				if (err) {
					this.$store.dispatch('app/applyErrorState', err.response?.data?.message || err);
				} else {
					this.$store.dispatch('auth/setIsGoogleAuthenticated', true);
					window.open(response?.data?.url, '_blank', 'location=yes,height=570,width=520,scrollbars=yes,status=yes');
				}
			});
		},
		addToGoogleCalendar() {
			const options = {
				method: 'POST',
				url: '/google/calendar/add'
			}
			apiService.call(options, (err, response) => {
				if (err) {
					this.$store.dispatch('app/applyErrorState', err.response?.data?.message || err);
				} else {
					console.log('response', response.data);
				}
			});
		}
	}
}
</script>