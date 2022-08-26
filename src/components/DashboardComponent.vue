<template>
	<vue-resizable
		width="auto"
		:active="['r', 'l']"
		:disableAttributes="['t', 'l', 'h']"
	>
		<v-card>
			<interval-timer v-if="config?.type === 'Interval Timer'" :config="config" />
		</v-card>
	</vue-resizable>
</template>
<script>
import IntervalTimer from '@/components/IntervalTimer';
import VueResizable from 'vue-resizable'; 
	
export default {
	name: 'DashboardComponent',
	props: {
		config: Object
	},
	components: {
		IntervalTimer,
		VueResizable
	},
	data() {
		return {

		}
	},
	methods: {
	}
}
</script>