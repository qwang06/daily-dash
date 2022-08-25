const db = require('../../db');
const series = require('to-series');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

// Super simple user creation and authentication. It just takes email and password.
class User {
	constructor(data) {
		this.id = data.id || '';
		this.email = data.email || '';
		this.password = data.password || '';
		this.userPrefs = data.userPrefs || {};
	}

	create(done) {
		const error = this.validateCredentials();
		if (error) return done(new Error(error));

		let hashedPassword = '';

		series()
			.first(cb => {
				this.hashPassword((err, hash) => {
					if (err) return cb(err);
					hashedPassword = hash;
					return cb();
				});
			})
			.next(cb => {
				db.exec('userCreate', [this.email, hashedPassword], (err, results) => {
					if (err) return cb(err);
					// If there was no error and no account was added, then it already exists
					if (results.rowCount === 0) return cb(new Error('Account already exists.'));
					this.id = results.rows[0].id;
					return cb();
				});
			})
			.next(cb => {
				db.exec('userPrefsCreate', [this.id, this.userPrefs], (err, results) => {
					if (err) return cb(err);
					return cb();
				});
			})
			.end(done);
	}

	find(done) {
		db.exec('userGet', [this.email], (err, results) => {
			if (err) return done(err);
			if (results.rowCount === 0) return done(new Error('Account does not exist with that email.'));
			this.userPrefs = results.rows[0].prefs || {};
			this.id = results.rows[0].id;
			return done(null, results.rows[0]);
		});
	}

	authenticate(done) {
		const error = this.validateCredentials();
		if (error) return done(new Error(error));

		this.find((err, user) => {
			if (err) return done(err);
			bcrypt.compare(this.password, user.password, (err, results) => {
				if (err) return done(err);
				if (!results) return done(new Error('Incorrect password.'));
				delete this.password;
				return done(null, this);
			});
		})
	}

	validateCredentials() {
		if (!this.email) return 'Email is required';
		if (!this.password) return 'Password is required';
		if (!/.+@.+/.test(this.email)) return 'Invalid email address.';
		if (this.password.length < 6) return 'Password must be greater than 6 characters.';
		return '';
	}

	hashPassword(done) {
		bcrypt.hash(this.password, SALT_ROUNDS, function(err, hash) {
			if (err) return done(err);
			return done(null, hash);
		});
	}

	updateUserPrefs(userPrefs, done) {
		this.userPrefs = userPrefs;
		db.exec('userPrefsUpdate', [this.id, this.userPrefs], (err, results) => {
			if (err) {
				console.log('err', err);
				return done(err);
			}
			return done();
		});
	}
}

module.exports = User;