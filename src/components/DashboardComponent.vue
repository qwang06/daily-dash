<template>
	<vue-resizable
		class="mb-3"
		width="auto"
		:active="['r', 'l']"
		:disableAttributes="['t', 'l', 'h']"
	>
		<v-card>
			<component :is="config.type" :config="config"></component>
		</v-card>
	</vue-resizable>
</template>
<script>
import IntervalTimer from '@/components/IntervalTimer';
import RssFeed from '@/components/RssFeed';
import Notepad from '@/components/Notepad';
import DaysCounter from '@/components/DaysCounter';
import VueResizable from 'vue-resizable'; 
	
export default {
	name: 'DashboardComponent',
	props: {
		config: Object
	},
	components: {
		IntervalTimer,
		RssFeed,
		Notepad,
		DaysCounter,
		VueResizable
	}
}
</script>