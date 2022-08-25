const axios = require('axios');
const baseURL = 'http://localhost:3691/'; // TODO: update for prod

exports.call = (options, done) => {
	const axiosOptions = {...options};
	if (!axiosOptions.method) axiosOptions.method = 'GET';
	axios.request({
		baseURL,
		...axiosOptions,
		withCredentials: true
	}).then(response => {
		return done(null, response);
	}).catch(done);
}