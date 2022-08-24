const axios = require('axios');
const baseURL = 'http://localhost:3691/'; // TODO: update for prod

exports.call = (options, done) => {
	axios.request({
		baseURL,
		...options,
		withCredentials: true
	}).then(response => {
		return done(null, response);
	}).catch(done);
}