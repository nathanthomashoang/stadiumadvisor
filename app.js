// dotenv
if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

// express
const express = require('express');
const app = express()
// mongoose
const mongoose = require('mongoose');
const path = require('path');
// method override
const methodOverride = require('method-override');
// ExpressError custom module
const ExpressError = require('./utils/ExpressError');
// Cookie-parser
const cookieParser = require('cookie-parser');
// passport
const passport = require('passport');
LocalStrategy = require('passport-local').Strategy;
// user model
const User = require('./models/user');
// Express session
const session = require('express-session');
// helmet
const helmet = require("helmet");
// mongo sanitize
const mongoSanitize = require('express-mongo-sanitize');
// AtlasDB
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/stadiumadvisor';

// connect-mongo
const MongoStore = require('connect-mongo');

// connect-flash
const flash = require('connect-flash');

// secret
const secret = process.env.SECRET || 'tempsecret';

// connect-mongo store variable
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});

store.on('error', function(e) {
    console.log('Session Store Error', e)
})

// session configs
const sessConfig = {
    store,
    secret,
    name: 'session',
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    },
    saveUninitialized: true,
    resave: false,
  }

if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    sessConfig.cookie.secure = true // serve secure cookies
}

// ejs-mate
engine = require('ejs-mate');


app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// cookie-parser
app.use(cookieParser(secret))
// express-session with our configs
app.use(session(sessConfig));
// parse req.body
app.use(express.urlencoded({extended: true}));
// method-override
app.use(methodOverride('_method'));
// serve static assets
app.use(express.static(path.join(__dirname, 'public')));
// passport
app.use(passport.initialize());
app.use(passport.session());
// Use connect-flash
app.use(flash());

// mongo-sanitize
app.use(mongoSanitize());

// helmet contentpolicyurls
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit-free.fontawesome.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [
    "https://fonts.googleapis.com",
    "https://fonts.gstatic.com"
];

app.use(helmet());

// helmet configurations
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/deogbhozj/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


// flash/passport middleware
app.use((req, res, next) => {
    // currentUser passport middleware
    res.locals.currentUser = req.user;
    // below is the flash portion of middleware
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


// Connect to MongoDB w/ basic error handler
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
})
.then(() => {
    console.log('MongoDB Connected!')
})
.catch(err => {
    console.log('MONGO connection error!')
    console.log(err)
})

// passport configuration
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// requiring router for stadia routes
const stadiaRoutes = require('./routes/stadia');

// requiring router for review routes
const reviewRoutes = require('./routes/reviews');

// requiring router for user routes
const userRoutes = require('./routes/users');

// HOME route
app.get('/', (req, res) => {
    res.render('home')
})

// use stadia routes
app.use('/stadia', stadiaRoutes);

// use review routes
app.use('/stadia/:id/reviews', reviewRoutes);

// use user routes
app.use('/', userRoutes);

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found - Error 404', 404));
})

// basic error handler & status codes catching errors to make sure our server doesn't crash (includes default values)
app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something went wrong' } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err });
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Connected to Server - Serving on port: ${port}`);
})