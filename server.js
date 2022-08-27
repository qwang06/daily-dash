const app = require('express')();
const axios = require('axios');
const series = require('to-series');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const connectStore = require('connect-pg-simple');
const RssParser = require('rss-parser');
const google = require('@googleapis/calendar');
const db = require('./db');
const config = require('./config');
const User = require('./src/models/User');

const port = config.port || 3691;
const env = process.env.NODE_ENV || 'development';
const uiBase = 'http://localhost:8080/';
const rssParser = new RssParser();

const authenticateUser = (req, res, next) => {
	if (req.session.user) return next();
	res.status(401);
	return next(new Error('Unable to authenticate user.'));
};

const corsWhitelist = (origin, cb) => {
	if (!origin) return cb(null, true);
	const devHosts = ['localhost:8080'];

	let originHost;

	if (origin.startsWith('http://')) {
		originHost = origin.split('http://')[1];
	} else if (origin.startsWith('https://')) {
		originHost = origin.split('https://')[1];
	} else {
		originHost = origin;
	}

	if (devHosts.includes(originHost)) {
		return cb(null, true);
	} else {
		return cb(new Error('Not allowed.'));
	}
};

const errorResponse = (errMsg, res, statusCode=400) => {
	return res.status(statusCode).json({ success: false, message: errMsg });
}

const createGoogleOAuthClient = () => {
	const redirectURL = `http://${config.host}:${port}/google/calendar/redirect`;
	const oauth2Client = new google.auth.OAuth2(config.google.clientID, config.google.clientSecret, redirectURL);
	return oauth2Client;
}

const createGoogleAuthURL = () => {
	const client = createGoogleOAuthClient();
	const url = client.generateAuthUrl({
		access_type: 'offline',
		scope: 'https://www.googleapis.com/auth/calendar'
	});
	return url;
};

const createGoogleRefreshToken = (code, done) => {
	const client = createGoogleOAuthClient();
	client.getToken(code)
		.then(response => {
			return done(null, response);
		})
		.catch(done)
}

const refreshGoogleAccessToken = (client, done) => {
	client.refreshAccessToken()
		.then(response => {
			return done(null, response);
		})
		.catch(done);
}

const initGoogleCalendar = (req, done) => {
	const userPrefs = req.session?.user?.userPrefs || {};
	if (!userPrefs.googleTokens?.refresh_token) return done('Please authenticate with Google first.');
	const googleOAuthClient = createGoogleOAuthClient();
	const user = new User(req.session.user);
	let tokenRefreshed = false,
		calendar;
	googleOAuthClient.setCredentials(userPrefs.googleTokens);
	series()
		.first(cb => {
			if (new Date() > new Date(userPrefs.googleTokens.expiry_date)) {
				console.log('refreshing token');
				refreshGoogleAccessToken(googleOAuthClient, (err, response) => {
					if (err) return cb(err);
					userPrefs.googleTokens = response.credentials;
					req.session.user.userPrefs = userPrefs;
					tokenRefreshed = true;
					return cb();
				});
			} else {
				return cb();
			}
		})
		.next(cb => {
			if (tokenRefreshed) {
				user.updateUserPrefs(userPrefs, cb);
			} else {
				return cb();
			}
		})
		.next(cb => {
			try {
				calendar = google.calendar({
					version: 'v3',
					auth: googleOAuthClient
				});
				return cb();
			} catch (err) {
				return cb(err);
			}
		})
		.end(err => {
			if (err) {
				return done(err);
			}
			return done(null, calendar)
		})
}

db.init(err => {
	if (err) {
		console.error('DB init error', err);
		return process.exit(-1);
	}

	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());
	app.use(session({
		name: config.session.name,
		secret: config.session.secret,
		saveUninitialized: false,
		resave: false,
		store: new (connectStore(session))({
			pool: db.pool
		}),
		cookie: {
			maxAge: config.session.lifetime,
			secure: config.env === 'development' ? false : true
		}
	}));

	if (env === 'development') {
		app.use(cors({
			origin: corsWhitelist,
			credentials: true
		}));
	}

	app.post('/register', (req, res) => {
		const newUser = new User({
			email: req.body.email,
			password: req.body.password
		});
		newUser.create(err => {
			if (err) return errorResponse(err.toString(), res);
			req.session.user = newUser;
			return res.json({ success: true });
		});
	});

	app.post('/login', (req, res) => {
		const loginUser = new User({
			email: req.body.email,
			password: req.body.password
		});
		loginUser.authenticate((err, user) => {
			if (err) {
				console.error('User login error', err);
				return errorResponse(err.toString(), res);
			}
			req.session.user = user;
			console.log('user', user);
			return res.json({ success: true, user });
		});
	});

	app.post('/logout', (req, res) => {
		req.session.destroy();
		return res.json({ success: true });
	});

	// All routes after this will require authentication
	app.use(authenticateUser);

	app.get('/auth', (req, res) => {
		return res.json({ success: true, user: req.session.user });
	});

	app.get('/rss', (req, res) => {
		if (!req.query?.rssFeedURL) return res.status(400).json({ success: false, message: 'No RSS Feed URL found.' });
		rssParser.parseURL(req.query.rssFeedURL)
			.then(response => {
				return res.json(response);
			})
			.catch(err => {
				return errorResponse(err.toString(), res);
			});
	});

	app.put('/userPrefs', (req, res) => {
		const user = new User(req.session.user);
		user.updateUserPrefs(req.body, (err, results) => {
			if (err) {
				return errorResponse(err.toString(), res);
			} else {
				req.session.user = user;
				return res.json({ success: true, user });
			}
		});
	});

	app.get('/google/calendar/auth', (req, res) => {
		try {
			const url = createGoogleAuthURL();
			return res.json({ success: true, url });
		} catch (err) {
			return errorResponse(err.toString(), res);
		}
	});

	app.get('/google/calendar/redirect', (req, res) => {
		if (!req?.query?.code) {
			return errorResponse('Failed to get Google Authentication.', res);
		}
		const user = new User(req.session.user);
		const userPrefs = req.session?.user?.userPrefs || {};
		createGoogleRefreshToken(req?.query?.code, (err, response) => {
			userPrefs.googleTokens = response.tokens;
			user.updateUserPrefs(userPrefs, (err, results) => {
				if (err) {
					return errorResponse(err.toString(), res);
				} else {
					return res.send('<script>window.close();</script >');
				}
			});
		});
	});

	app.get('/google/calendar/list', (req, res) => {
		initGoogleCalendar(req, (err, calendar) => {
			if (err) {
				return errorResponse(err.toString(), res);
			}
			calendar.calendarList.list((err, response) => {
				if (err) {
					return errorResponse(err.toString(), res);
				}
				return res.json({ success: true, calendarList: response.data.items });
			});
		});
	});

	app.post('/google/calendar/add', (req, res) => {
		console.log('req.body', req.body);
		const options = {
			calendarId: req.body.calendarId,
			resource: {
				summary: req.body.summary,
				start: { dateTime: new Date(req.body.date) },
				end: { dateTime: new Date(req.body.date) }
			}
		}
		initGoogleCalendar(req, (err, calendar) => {
			if (err) {
				return errorResponse(err.toString(), res);
			}
			calendar.events.insert(options, (err, response) => {
				if (err) {
					return errorResponse(err.toString(), res);
				}
				console.log('response', response);
				return res.json({ success: true});
			});
		});
	});

	app.listen(port);
	console.log(`Daily Dash started on http://localhost:${port}`);
})