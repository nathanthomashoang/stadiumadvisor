const { stadiumSchema, reviewSchema } = require('./joiSchemas');
const ExpressError = require('./utils/ExpressError')
const Stadium = require('./models/stadium');
const Review = require('./models/review');

// stadium - VALIDATIONS middleware
module.exports.validateStadium = (req, res, next) => {
    const { error } = stadiumSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// review - VALIDATIONS middleware
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// stadium - LOCATION validation middleware
module.exports.validateLocation = async(req, res, next) => {
    const { location } = req.body.stadium;
    const geoData = await geocoder.forwardGeocode({
        query: location,
        countries: ['us'],
        limit: 1
    }).send()
    if (!geoData.body.features[0]) {
        req.flash('error', 'Location not found - please enter a valid location');
        return res.redirect(req.originalUrl);
    }
    req.session.newLocation = geoData.body.features[0];
    next();
}

// isLoggedIn - Logged in middleware

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in');
        return res.redirect('/login');
    }
    next();
}

// Authorization middleware - Stadium
module.exports.isOwner = async(req, res, next) => {
    const { id } = req.params;
    // find stadium
    const stadium = await Stadium.findById(id);
    if (!stadium.owner.equals(req.user._id)){
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/stadia/${id}`);
    }
    next();
}

// Authorization middleware - review
module.exports.isReviewOwner = async(req, res, next) => {
    const { id, reviewId } = req.params;
    // find stadium
    const review = await Review.findById(reviewId);
    if (!review.owner.equals(req.user._id)){
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/stadia/${id}`);
    }
    next();
}

// Has written review middleware

module.exports.hasWrittenReview = async(req, res, next) => {
    const { id } = req.params;
    const stadium = await Stadium.findById(id).populate('reviews');
    if(stadium.reviews.some((reviewArray) => {
        return reviewArray.owner.equals(req.user._id) })) {
            req.flash('error', 'Review not published: You have already written a review for this stadium')
            return res.redirect(`/stadia/${id}`);
        }
    next();
}

// Max images per stadium middleware

module.exports.hasMaxImages = async(req, res, next) => {
    const maxImages = 5;
    const { id } = req.params;
    const stadium = await Stadium.findById(id);
    if (stadium.images.length >= maxImages){
        req.flash('error', 'You can only have 5 images per venue, please remove image(s) and try again')
        return res.redirect(`/stadia/${id}/edit`)
    }
    next();
}