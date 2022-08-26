<template>
	<div>
		<dashboard-component-toolbar
			title="Interval Timer"
			:config="config"
		>
			<template #options="{ data }">
				<v-row>
					<v-col>
						<v-text-field
							v-model="data.numberOfRounds"
							label="Number of"
							suffix="rounds"
							type="number"
						></v-text-field>
					</v-col>
					<v-col>
						<v-text-field
							v-model="data.restTime"
							label="Rest Time"
							suffix="seconds"
							type="number"
						></v-text-field>
					</v-col>
					<v-col>
						<v-text-field
							v-model="data.workTime"
							label="Work Time"
							suffix="seconds"
							type="number"
						></v-text-field>
					</v-col>
				</v-row>
			</template>
		</dashboard-component-toolbar>
		<v-card-text>
			<v-row class="pt-5 timer-text accent--text">
				<v-col>
					Round {{round}}
					<span class="px-5">{{currentPeriod}}</span>
				</v-col>
			</v-row>
			<v-row class="timer-text">
				<v-col align="center">
					{{time}}
				</v-col>
			</v-row>
		</v-card-text>
		<v-card-actions class="d-flex justify-center">
			<v-btn @click="startTimer">Start</v-btn>
			<v-btn @click="pauseTimer">Pause</v-btn>
			<v-btn @click="resetTimer">Reset Time</v-btn>
			<v-btn @click="resetRound">Reset Round</v-btn>
		</v-card-actions>
	</div>
</template>

<script>
import DashboardComponentToolbar from './DashboardComponentToolbar';
export default {
	name: 'IntervalTimer',
	props: {
		config: Object
	},
	components: {
		DashboardComponentToolbar
	},
	created() {
		this.countdownSound = new Audio(require('../assets/simple-countdown.wav'));
		this.restSound = new Audio(require('../assets/achievement-bell.wav'));
		this.workSound = new Audio(require('../assets/success.wav'));
		this.countdownSound.volume = 0.3;
		this.restSound.volume = 0.3;
		this.workSound.volume = 0.3;

		if (this.config.numberOfRounds == undefined) this.config.numberOfRounds = 10;
		if (this.config.restTime == undefined) this.config.restTime = 20;
		if (this.config.workTime == undefined) this.config.workTime = 40;
	},
	data: () => ({
		time: '00:00:00.000',
		timeStart: null,
		timeStop: null,
		timerInterval: null,
		roundStartingInterval: null,
		countdownSound: null,
		restSound: null,
		workSound: null,
		isRunning: false,
		isLoading: false,
		stoppedDuration: 0,
		round: 1,
		countdownTimer: 3,
		currentPeriod: 'Work',
		selectedInterval: '',
		presetIntervals: ['9Round', 'EMOM', 'TABATA']
	}),
	methods: {
		startTimer() {
			if (this.isRunning) return;
			if (this.timeStop) {
				this.stoppedDuration += (new Date() - this.timeStop);
			}
			if (this.countdownTimer) {
				this.countdownSound.play();
				this.currentPeriod = 'starting in ' + this.countdownTimer;
				this.roundStartingInterval = setInterval(this.startCountdown.bind(this), 1000);
			} else {
				if (!this.timeStart) {
					this.resetTimer();
					this.timeStart = new Date();
				}
				this.timerInterval = setInterval(this.clockRunning.bind(this), 10);
				this.isRunning = true;
			}
		},
		pauseTimer() {
			clearInterval(this.timerInterval);
			this.timeStop = new Date();
			this.isRunning = false;
		},
		resetTimer() {
			clearInterval(this.timerInterval);
			this.stoppedDuration = 0;
			this.timeStart = null;
			this.timeStop = null;
			this.time = '00:00:00.000';
			this.isRunning = false;
		},
		resetRound() {
			this.resetTimer();
			this.round = 1;
			this.countdownTimer = 3;
		},
		clockRunning() {
			const currentTime = new Date();
			const timeElapsedMs = currentTime - this.timeStart - this.stoppedDuration;
			const timeElapsed = new Date(timeElapsedMs);
			const hour = String(timeElapsed.getUTCHours()).padStart(2, '0');
			const min = String(timeElapsed.getUTCMinutes()).padStart(2, '0');
			const sec = String(timeElapsed.getUTCSeconds()).padStart(2, '0');
			const ms = String(timeElapsed.getUTCMilliseconds()).padStart(3, '0');

			if (this.restTime && this.currentPeriod === 'Work' && timeElapsedMs > this.workTime*1000) {
				this.currentPeriod = 'Rest';
				this.restSound.play();
				this.resetTimer();
				this.startTimer();
			} else if (this.workTime && this.currentPeriod === 'Rest' && timeElapsedMs > this.restTime*1000) {
				this.currentPeriod = 'Work';
				this.workSound.play();
				this.round++;
				this.resetTimer();
				this.startTimer();
			}

			if (this.round > this.numberOfRounds) {
				this.currentPeriod = 'Done';
				return this.resetRound();
			}

			this.time = `${hour}:${min}:${sec}.${ms}`;
		},
		startCountdown() {
			this.currentPeriod = 'starting in ' + --this.countdownTimer;
			if (this.countdownTimer === 0) {
				clearInterval(this.roundStartingInterval);
				this.timeStart = new Date();
				this.timerInterval = setInterval(this.clockRunning.bind(this), 10);
				this.isRunning = true;
				this.currentPeriod = 'Work';
			}
		},
		setPresetInterval(preset) {
			console.log('preset', preset);
			if (preset === 'TABATA') {
				this.config.numberOfRounds = 8;
				this.config.workTime = 20;
				this.config.restTime = 10;
			} else if (preset === 'EMOM') {
				this.config.numberOfRounds = 10;
				this.config.workTime = 60;
				this.config.restTime = 0;
			} else if (preset === '9Round') {
				this.config.numberOfRounds = 9;
				this.config.workTime = 180;
				this.config.restTime = 30;
			}
		}
	}
}
</script>
<style scoped>
.timer-text {
	font-size: 3rem;
}
</style>