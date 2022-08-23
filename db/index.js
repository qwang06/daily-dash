const pg = require('pg');
const fs = require('fs');
const series = require('to-series');
const config = require('../config');

const registeredFiles = {};

let pool;

const createTables = (client, done) => {
	const tablesDir = __dirname + '/tables';
	let tables;

	series()
		.first(cb => {
			fs.readdir(tablesDir, (err, files) => {
				if (err) return cb(err);
				tables = files;
				return cb();
			});
		})
		.next(cb => {
			series()
				.each(tables, (table, cbe) => {
					const sql = fs.readFileSync(tablesDir + '/' + table, 'utf8');
					client.query(sql, [], (err, results) => {
						if (err) return cbe(err);
						console.log('Creating table', table);
						return cbe();
					});
				})
				.end(cb);
		})
		.end(done)
}

exports.init = (done) => {
	const dbConfig = {
		...config.db,
		max: 20,
		idleTimeoutMillis: 30000,
		connectionTimeoutMillis: 30000,
		// log: (info) => { console.log(info) }
	}
	pool = new pg.Pool(dbConfig);
	pool.on('error', (err, pgClient) => {
		console.error('PG error', err);
	});
	pool.connect((err, pgClient, releaseCb) => {
		if (err) return done(err);
		createTables(pgClient, (err) => {
			if (err) return done(err);
			try {
				releaseCb();
			} catch (e) {
				return done(err);
			}
			return done(null, pgClient);
		});
	});

	exports.pool = pool;
}

// For SQL queries
exports.query = (sql, params, done) => {
	pool.connect((err, pgClient, releaseCb) => {
		if (err) return done(err);
		pgClient.query(sql, params, (err, results) => {
			try {
				releaseCb();
			} catch (e) {
				console.error('Release error', e);
			}
			return done(err, results);
		});
	});
}

// For executing a SQL file
exports.exec = (name, params, done) => {
	const sqlDir = __dirname + '/sql/';
	let fileName = name;
	if (!fileName.endsWith('.sql')) fileName += '.sql';
	fs.readFile(sqlDir + fileName, 'utf8', (err, sql) => {
		pool.connect((err, pgClient, releaseCb) => {
			if (err) return done(err);
			pgClient.query(sql, params, (err, results) => {
				try {
					releaseCb();
				} catch (e) {
					console.error('Release error', e);
				}
				return done(err, results);
			});
		});
	});
}

exports.end = () => {
	return pool.end();
}