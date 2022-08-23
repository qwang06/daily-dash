const db = require('../../db');
const series = require('to-series');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

// Super simple user creation and authentication. It just takes email and password.
class User {
	constructor(data) {
		this.email = data.email || '';
		this.password = data.password || '';
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
					return cb();
				});
			})
			.end(done);
	}

	find(done) {
		const sql = `
			SELECT
				id,
				"createdAt",
				"updatedAt",
				"email",
				"password"
			FROM
				users
			WHERE
				"email" = $1
			;
		`;
		db.query(sql, [this.email], (err, results) => {
			if (err) return done(err);
			if (results.rowCount === 0) return done(new Error('Account does not exist with that email.'))
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
				return done(null, { isAuthenticated: true });
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
}

module.exports = User;