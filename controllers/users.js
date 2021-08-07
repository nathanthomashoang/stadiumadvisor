// Models
const User = require('../models/user');
// Passport
const passport = require('passport');

// CREATE route
    // render
module.exports.renderRegistrationForm = (req, res) => {
    res.render('./users/register')
}
    // create user
module.exports.createUser = async (req, res) => {
    try{
        const { username, email, password } = req.body;
        const user = new User({ username, email })
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) {
                return next(err);
            } else{
                req.flash('success', 'Thank you for registering. Welcome to StadiumAdvisor!');
                res.redirect('/stadia');
            }
        })   
    } catch(e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}


// Login route
    // render
module.exports.renderLoginPage = (req, res) => {
    res.render('./users/login');
}
    // login
module.exports.loginUser = (req, res) => {
    req.flash('success', 'Welcome back!');
    const returnUrl = req.session.returnTo || '/stadia';
    delete req.session.returnTo;
    res.redirect(returnUrl);
}
    

// logout route
module.exports.logoutUser = (req, res) => {
    req.logout();
    req.flash('success', 'Successfully logged out');
    res.redirect('/stadia');
}