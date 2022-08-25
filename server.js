const app = require('express')();
const axios = require('axios');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const connectStore = require('connect-pg-simple');
const RssParser = require('rss-parser');
const db = require('./db');
const config = require('./config');
const User = require('./src/models/User');

const PORT = 3691;
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
			if (err) return res.status(400).json({ success: false, message: err.toString() });
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
				return res.status(400).json({ success: false, message: err.toString() });
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
		rssParser.parseURL(req.query.rssFeedURL)
			.then(response => {
				return res.json(response);
			})
			.catch(err => {
				return res.status(400).json({ success: false, message: err.toString() });
			});
	});

	app.put('/userPrefs', (req, res) => {
		const user = new User(req.session.user);
		user.updateUserPrefs(req.body, (err, results) => {
			if (err) {
				return res.status(400).json({ success: false, message: err.toString() });
			} else {
				req.session.user = user;
				return res.json({ success: true, user });
			}
		});
	});

	app.listen(PORT);
	console.log(`Daily Dash started on http://localhost:${PORT}`);
})