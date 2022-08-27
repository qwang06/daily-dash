<template>
	<div>
		<v-toolbar class="drag-cursor" color="primary" dark>
			<v-card-title>{{config.title}} - {{config.name}}</v-card-title>
			<v-spacer />
			<v-btn text color="success" @click="updateDashboardComponents">Save</v-btn>
			<v-btn text color="error" @click="deleteDashboardComponent">Delete</v-btn>
			<v-btn
				icon
				@click="showOptions = !showOptions"
			>
				<v-icon>{{ showOptions ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
			</v-btn>
		</v-toolbar>
		<v-expand-transition>
			<div class="px-4 pt-4" v-show="showOptions">
				<v-row>
					<v-col>
						<v-text-field v-model="dashboardName" label="Dashboard Name" clearable></v-text-field>
						<slot name="options" :data="optionsData" />
					</v-col>
				</v-row>
			</div>
		</v-expand-transition>
	</div>
</template>
<script>
	
export default {
	name: 'DashboardComponentToolbar',
	props: {
		config: Object
	},
	data() {
		return {
			showOptions: this.config?.showOptions == undefined ? true : this.config.showOptions,
			dashboardName: this.config?.name || '',
			optionsData: { ...this.config }
		}
	},
	watch: {
		optionsData: {
			handler(newValue) {
				Object.assign(this.config, newValue);
			},
			deep: true
		}
	},
	methods: {
		updateDashboardComponents() {
			this.config.name = this.dashboardName;
			this.config.showOptions = this.showOptions;
			this.$store.dispatch('app/updateUserPrefs', {
				callback: (err, response) => {
					if (!err) {
						this.$store.dispatch('app/applySuccessState', 'Dashboards saved');
					}
				}
			});
		},
		deleteDashboardComponent() {
			const dashboardComponents = this.$store.state?.app?.userPrefs?.dashboardComponents || [];
			const index = dashboardComponents.findIndex(component => component.name === this.config.name);
			dashboardComponents.splice(index, 1);
			this.$store.dispatch('app/updateUserPrefs', {
				callback: (err, response) => {
					if (!err) {
						this.$store.dispatch('app/applySuccessState', 'Dashboard deleted');
					}
				}
			});
		}
	}
}
</script>
<style scoped>
.drag-cursor {
	cursor: grab;
}
</style>