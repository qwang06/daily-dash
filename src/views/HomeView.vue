<template>
	<div></div>
</template>

<script>
import axios from 'axios';
const baseURL = 'http://localhost:3691/'; // TODO: update for prod
export default {
	name: 'Home',
	components: {
	},
	created() {
		axios.request({
			baseURL,
			method: 'get',
			url: '/',
			withCredentials: true
		}).then(response => {
			console.log('response', response);
		}).catch(err => {
			console.log('err', err);
		});
	}
}
</script>
