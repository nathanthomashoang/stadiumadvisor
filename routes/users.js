const express = require('express');
const router = express.Router();
const passport = require('passport')
// controller
const users = require('../controllers/users')
// catchAsync
const catchAsync = require('../utils/catchAsync');

// Create route
    // render
router.get('/register', users.renderRegistrationForm);
    // create user
router.post('/register', catchAsync(users.createUser));

// Login route
    // render
router.get('/login', users.renderLoginPage);
    // login
router.post('/login',passport.authenticate('local', { failureFlash: 'Invalid username or password.', failureRedirect: '/login' }), users.loginUser);

// logout route

router.get('/logout', users.logoutUser);


module.exports = router;