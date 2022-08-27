<template>
	<div>
		<dashboard-component-toolbar :config="config">
			<template #options="{ data }">
				<v-date-picker v-model="date" @change="setDate"></v-date-picker>
			</template>
		</dashboard-component-toolbar>
		<v-card-text>
			<h1>{{config.name}} {{daysCounter}}</h1>
		</v-card-text>
		<v-card-actions>
			<v-btn v-if="!isGoogleAuthenticated" color="info" @click="googleAuth">Authenticate with Google</v-btn>
			<v-btn color="info" @click="getGoogleCalendarList" :disabled="!!config.calendarId">
				{{config.calendarId ? 'Already on Google Calendar' : 'Add to Google Calendar'}}
			</v-btn>
		</v-card-actions>
		<v-dialog v-model="showCalenderList" width="300" max-width="600">
			<v-list>
				<v-list-item-group v-model="calendarSelectedIndex" @change="selectCalendar">
					<v-list-item v-for="item in calendarList">
						<v-list-item-content>
							<v-list-item-title>{{item.summary}}</v-list-item-title>
							<v-list-item-subtitle>{{item.description}}</v-list-item-subtitle>
						</v-list-item-content>
					</v-list-item>
				</v-list-item-group>
			</v-list>
		</v-dialog>
	</div>
</template>

<script>
import apiService from '@/utils/apiService';
import series from 'to-series';
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
			date: this.config.date || '',
			isLoadingCalendarList: false,
			showCalenderList: false,
			calendarList: [],
			calendarSelectedIndex: null
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
		getGoogleCalendarList() {
			const options = {
				url: '/google/calendar/list'
			}
			this.isLoadingCalendarList = true;
			apiService.call(options, (err, response) => {
				this.isLoadingCalendarList = false;
				if (err) {
					this.$store.dispatch('app/applyErrorState', err.response?.data?.message || err);
				} else {
					this.showCalenderList = true;
					this.calendarList = response.data.calendarList;
				}
			});
		},
		selectCalendar(value) {
			const calendarSelected = this.calendarList[value];
			const options = {
				method: 'POST',
				url: '/google/calendar/add',
				data: {
					calendarId: calendarSelected.id,
					summary: this.config.name,
					date: new Date(this.date + ' 00:00:00')
				}
			}
			this.showCalenderList = false;
			this.config.calendarId = calendarSelected.id;
			series()
				.first(cb => {
					apiService.call(options, (err, response) => {
						if (err) {
							this.$store.dispatch('app/applyErrorState', err.response?.data?.message || err);
						} else {
							this.$store.dispatch('app/applySuccessState', 'Added to calendar');
						}
						return cb();
					});
				})
				.next(callback => {
					this.$store.dispatch('app/updateUserPrefs', { callback });
				})
				.end(err => {
					if (err) {
						console.log(err);
					}
				})
		}
	}
}
</script>