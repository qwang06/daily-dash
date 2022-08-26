<template>
	<v-card loading="isLoading" max-width="600">
		<v-toolbar color="primary" dark>
			<v-card-title>RSS Feed</v-card-title>
			<v-spacer />
			<v-btn @click="updateUserPrefs">Save</v-btn>
			<v-btn @click="deleteUserPref">Delete</v-btn>
			<v-btn
				icon
				@click="showOptions = !showOptions"
			>
				<v-icon>{{ showOptions ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
			</v-btn>
		</v-toolbar>
		<v-card-text v-if="items.length">
			<v-row>
				<v-card elevation="0">
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
					<a target="_blank" :href="item.link">
						<v-list-item-content>
							<v-list-item-title v-html="item.title"></v-list-item-title>
							<v-list-item-subtitle v-html="item.content"></v-list-item-subtitle>
						</v-list-item-content>
					</a>
				</v-list-item>
			</v-list>
			<v-card-actions>
				<v-btn text @click="showFeeds(-3)">Show less...</v-btn>
				<v-spacer />
				<v-btn text @click="showFeeds(3)">Show more...</v-btn>
			</v-card-actions>
		</v-card-text>
	</v-card>
</template>

<script>
import apiService from '@/utils/apiService';
export default {
	name: 'RssFeed',
	props: {
		url: String
	},
	data() {
		return {
			isLoading: false,
			showOptions: true,
			numOfFeeds: 0,
			rssFeedURL: this.url,
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
					rssFeedURL: this.rssFeedURL
				}
			}
			this.isLoading = true;
			apiService.call(options, (err, response) => {
				this.isLoading = false;
				if (err) return this.$store.dispatch('app/applyErrorState', err);
				this.showOptions = false;
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
		},
		updateUserPrefs() {
			const userPrefs = this.$store.state?.app?.userPrefs || {};
			const rssFeed = {
				url: this.rssFeedURL
			};

			if (!userPrefs.rssFeeds) {
				userPrefs.rssFeeds = [rssFeed];
			} else {
				userPrefs.rssFeeds.push(rssFeed);
			}

			this.isLoading = true;
			this.$store.dispatch('app/updateUserPrefs', {
				userPrefs: userPrefs,
				callback: (err, response) => {
					this.isLoading = false;
				}
			});
		},
		deleteUserPref() {
			const userPrefs = this.$store.state?.app?.userPrefs || {};
			const rssFeeds = userPrefs?.rssFeeds || [];
			const index = rssFeeds.findIndex(rssFeed => rssFeed.url === this.rssFeedURL);
			rssFeeds.splice(index, 1);
			this.isLoading = true;
			this.$store.dispatch('app/updateUserPrefs', {
				userPrefs: userPrefs,
				callback: (err, response) => {
					this.isLoading = false;
				}
			});
		}
	}
}
</script>
<style scoped>
a {
	text-decoration: none;
}
</style>