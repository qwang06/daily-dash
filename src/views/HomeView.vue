<template>
	<v-container>
		<v-row>
			<v-col>
				<interval-timer />
			</v-col>
			<v-col>
				<interval-timer />
			</v-col>
		</v-row>
	</v-container>
</template>

<script>
import IntervalTimer from '@/components/IntervalTimer';
export default {
	name: 'Home',
	components: {
		IntervalTimer
	}
}
</script>
