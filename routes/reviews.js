const express = require('express');
const router = express.Router({ mergeParams: true });
// requiring catchAsync
const catchAsync = require('../utils/catchAsync');
// controller
const reviews = require('../controllers/reviews');

// require JoiSchema validations
const { validateReview, isLoggedIn, isOwner, isReviewOwner, hasWrittenReview} = require('../middleware');

// CREATE route
router.post('/', isLoggedIn, hasWrittenReview, validateReview, catchAsync(reviews.createReview));

// DELETE route
router.delete('/:reviewId', isLoggedIn, isReviewOwner, catchAsync(reviews.deleteReview));

module.exports = router;