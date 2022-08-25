<template>
	<v-container>
		<v-row>
			<v-col>
				<interval-timer />
			</v-col>
			<v-col>
				<div v-for="feed in rssFeeds">
					<rss-feed :url="feed.url" />
				</div>
			</v-col>
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
							v-model="dashboardComponentsSelected"
							multiple
							active-class=""
						>
							<v-list-item v-for="item in dashboardComponents">
								<template v-slot:default="{ active }">
									<v-list-item-action>
										<v-checkbox :input-value="active"></v-checkbox>
									</v-list-item-action>
									<v-list-item-content>
										<v-list-item-title>{{item.title}}</v-list-item-title>
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
import IntervalTimer from '@/components/IntervalTimer';
import RssFeed from '@/components/RssFeed';
export default {
	name: 'Home',
	components: {
		IntervalTimer,
		RssFeed
	},
	data() {
		return {
			addComponentDialog: false,
			dashboardComponents: [{
				title: 'Interval Timer',
				description: 'Timer with customizable rounds, rest time, and work time.'
			}, {
				title: 'RSS Feed',
				description: 'Fetch RSS Feed from given URL.'
			}],
			dashboardComponentsSelected: []
		}
	},
	computed: {
		rssFeeds() {
			return this.$store.state.app?.userPrefs?.rssFeeds || [];
		}
	},
	methods: {
		addDashboardComponents() {
			const selectedComponents = this.dashboardComponentsSelected.map(index => this.dashboardComponents[index]);
			console.log('selectedComponents', selectedComponents);
		}
	}
}
</script>
<style scoped>
.add-dashboard-component-btn {
	left: 20px;
	top: 20px;
}	
</style>