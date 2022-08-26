<template>
	<v-container>
		<v-row>
			<draggable tag="div" class="col" v-model="dashboardComponents">
				<transition-group>
					<dashboard-component v-for="config in dashboardComponents" :key="config.name" :config="config" />
				</transition-group>
			</draggable>
		</v-row>
		<v-dialog v-model="addComponentDialog" width="500" persistent>
			<template v-slot:activator="{ on, attrs }">
				<v-btn
					elevation="2"
					class="add-dashboard-component-btn"
					color="accent"
					v-bind="attrs"
					v-on="on"
					small
					absolute
					fab
				>
					<v-icon>mdi-plus</v-icon>
				</v-btn>
			</template>
			<v-card elevation="0">
				<v-card-title>
					Add Dashboard Component
				</v-card-title>
				<v-card-text>
					<v-list>
					    <v-list-item-group
							v-model="dashboardComponentTypesSelected"
							multiple
							active-class=""
						>
							<v-list-item v-for="item in dashboardComponentTypes">
								<template v-slot:default="{ active }">
									<v-list-item-action>
										<v-checkbox :input-value="active"></v-checkbox>
									</v-list-item-action>
									<v-list-item-content>
										<v-list-item-title>{{item.type}}</v-list-item-title>
										<v-list-item-subtitle>{{item.description}}</v-list-item-subtitle>
									</v-list-item-content>
								</template>
							</v-list-item>
						</v-list-item-group>
					</v-list>
				</v-card-text>
				<v-card-actions>
					<v-spacer />
					<v-btn color="success" @click="addDashboardComponents">Add</v-btn>
					<v-btn color="error" @click="addComponentDialog=false">Close</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</v-container>
</template>

<script>
import DashboardComponent from '@/components/DashboardComponent';
import RssFeed from '@/components/RssFeed';
import draggable from 'vuedraggable';
export default {
	name: 'Home',
	components: {
		DashboardComponent,
		RssFeed,
		draggable
	},
	data() {
		return {
			addComponentDialog: false,
			dashboardComponentTypes: [{
				type: 'Interval Timer',
				description: 'Timer with customizable rounds, rest time, and work time.'
			}, {
				type: 'RSS Feed',
				description: 'Fetch RSS Feed from given URL.'
			}],
			dashboardComponentTypesSelected: []
		}
	},
	computed: {
		dashboardComponents: {
			get() {
				return this.$store.state.app?.userPrefs?.dashboardComponents || [];
			},
			set(newValue) {
				const userPrefs = this.$store.state.app?.userPrefs || {};
				userPrefs.dashboardComponents = newValue;
				this.$store.dispatch('app/applyUserPrefs', userPrefs);
			}
		},
		rssFeeds() {
			return this.$store.state.app?.userPrefs?.rssFeeds || [];
		}
	},
	methods: {
		addDashboardComponents() {
			if (!this.dashboardComponentTypesSelected.length) return;
			const selectedComponentTypes = this.dashboardComponentTypesSelected.map(index => this.dashboardComponentTypes[index]);
			const userPrefs = this.$store.state.app?.userPrefs || {};
			selectedComponentTypes.forEach(componentType => {
				this.dashboardComponents.push({
					type: componentType.type,
					name: componentType.type + ' ' + (this.dashboardComponents.length+1)
				});
			});
			this.addComponentDialog = false;
		}
	},
	mounted() {
	}
}
</script>
<style scoped>
.add-dashboard-component-btn {
	left: 20px;
	top: 20px;
}
</style>