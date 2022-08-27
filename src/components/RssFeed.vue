<template>
	<div>
		<dashboard-component-toolbar :config="config">
			<template #options="{ data }">
				<div class="d-flex align-center">
					<v-text-field
						v-model="data.rssFeedURL"
						clearable
						label="RSS Feed URL"
					></v-text-field>
					<v-btn :loading="isLoading" class="ml-5" color="success" @click="getRssFeed">Go</v-btn>
				</div>
			</template>
		</dashboard-component-toolbar>
		<v-card-text v-if="items.length">
			<v-row>
				<v-card elevation="0" class="mt-3">
					<v-card-title>
						<v-img
							:src="imageURL"
							max-height="150"
							max-width="150"
							class="mr-10"
						></v-img>
						<div>{{title}}</div>
					</v-card-title>
					<v-card-subtitle class="mt-5">Published: {{pubDate}}</v-card-subtitle>
				</v-card>
			</v-row>
			<v-list>
				<v-list-item v-for="item in items">
					<a target="_blank" :href="item.link" :title="item.content">
						<v-list-item-content>
							<v-list-item-title v-html="item.title"></v-list-item-title>
							<v-list-item-subtitle v-html="item.content"></v-list-item-subtitle>
						</v-list-item-content>
					</a>
				</v-list-item>
			</v-list>
			<v-card-actions>
				<v-spacer />
				<v-btn text @click="showFeeds(3)">Show more</v-btn>
				<v-btn text @click="showFeeds(-3)">Show less</v-btn>
			</v-card-actions>
		</v-card-text>
	</div>
</template>

<script>
import apiService from '@/utils/apiService';
import DashboardComponentToolbar from './DashboardComponentToolbar';
export default {
	name: 'RssFeed',
	props: {
		config: Object
	},
	components: {
		DashboardComponentToolbar
	},
	created() {
		if (this.config.rssFeedURL) {
			this.getRssFeed();
		}
	},
	data() {
		return {
			isLoading: false,
			numOfFeeds: 0,
			totalItems: [],
			items: [],
			title: '',
			imageURL: '',
			pubDate: ''
		}
	},
	methods: {
		getRssFeed() {
			const options = {
				url: '/rss',
				params: {
					rssFeedURL: this.config.rssFeedURL
				}
			}
			this.isLoading = true;
			apiService.call(options, (err, response) => {
				this.isLoading = false;
				if (err) return this.$store.dispatch('app/applyErrorState', err.response?.data?.message || err);
				this.totalItems = response.data.items;
				this.title = response.data.title;
				this.imageURL = response.data.image.url;
				this.pubDate = new Date(response.data.pubDate).toLocaleString();
				this.showFeeds(3);
			});
		},
		showFeeds(feeds) {
			if (this.numOfFeeds + feeds < 1) return; // Don't let it go to 0
			this.numOfFeeds += feeds;
			this.items = this.totalItems.slice(0, this.numOfFeeds);
		}
	}
}
</script>
<style scoped>
a {
	text-decoration: none;
	overflow: auto;
}
</style>