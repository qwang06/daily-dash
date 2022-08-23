const app = require('express')();
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const connectStore = require('connect-pg-simple');
const db = require('./db');
const config = require('./config');
const User = require('./src/models/User');
const env = process.env.NODE_ENV || 'development';
const uiBase = 'http://localhost:8080/';
const PORT = 3691;

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
	// app.use(basicAuth);

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
			req.session.user = { email: req.body.email };
			return res.json({ success: true });
		});
	});

	app.post('/login', (req, res) => {
		const loginUser = new User({
			email: req.body.email,
			password: req.body.password
		});
		loginUser.authenticate(err => {
			if (err) {
				console.error('User login error', err);
				return res.status(400).json({ success: false, message: err.toString() });
			}
			req.session.user = { email: req.body.email };
			return res.json({ success: true, email: req.body.email });
		});
	});

	app.post('/logout', (req, res) => {
		req.session.destroy();
		return res.json({ success: true });
	});

	app.use(authenticateUser);

	app.get('/auth', (req, res) => {
		return res.json({ success: true, email: req.session.user.email });
	});

	app.get('/', (req, res) => {
		db.query('SELECT $1 AS testCol, NOW()', ['test'], (err, results) => {
			if (err) {
				console.error('exec error', err);
			}

			return res.send('Hello World!');
		});
	});

	app.listen(PORT);
	console.log(`Daily Dash started on http://localhost:${PORT}`);
})