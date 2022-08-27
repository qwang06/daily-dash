<template>
	<div>
		<dashboard-component-toolbar :config="config">
		</dashboard-component-toolbar>
		<v-card-text>
			<v-row>
				<v-col>
					<v-textarea @input="setNotes" :value="notes" label="Notepad" placeholder="Start typing here..."></v-textarea>
				</v-col>
			</v-row>
		</v-card-text>
	</div>
</template>

<script>
import DashboardComponentToolbar from './DashboardComponentToolbar';
export default {
	name: 'Notepad',
	props: {
		config: Object
	},
	components: {
		DashboardComponentToolbar
	},
	data() {
		return {
			notes: this.config.notes || ''
		}
	},
	methods: {
		setNotes(value) {
			this.config.notes = value;
		}
	}
}
</script>