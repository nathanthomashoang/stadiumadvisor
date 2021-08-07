// Models
const Review = require('../models/review');
const Stadium = require('../models/stadium')

// average reviews
const calcAvg = function(arr) {
    const roundAccurately = (number, decimalPlaces) => Number(Math.round(number + "e" + decimalPlaces) + "e-" + decimalPlaces)
    let total = 0;
    for (num of arr) {
        total += num
    }
    const average = total/arr.length;
    return roundAccurately(average,1);
}

module.exports.createReview = async (req, res) => {
    // Find stadium
    const { id } = req.params;
    const stadium = await Stadium.findById(id).populate('reviews');
    // Create review
    const review = new Review(req.body.review)
    // Add review to stadium
    stadium.reviews.push(review);
    review.owner = req.user;
    review.username = req.user.username;
    review.date = new Date().toString().slice(4,15);
    stadium.reviewCount = stadium.reviews.length;
    const ratingArray = stadium.reviews.map(x => x.rating);
    stadium.avgRating = calcAvg(ratingArray);
    await stadium.save();
    await review.save();
    res.redirect(`/stadia/${id}`)
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params
    // remove review from reviews array in stadium model
    await Stadium.findByIdAndUpdate(id, { $pull: { reviews: reviewId }})
    // find review and delete
    await Review.findByIdAndDelete(reviewId);
    const stadium = await Stadium.findById(id).populate('reviews');
    stadium.reviewCount = stadium.reviews.length;
    if (stadium.reviews.length > 1) {
        const ratingArray = stadium.reviews.map(x => x.rating);
        stadium.avgRating = calcAvg(ratingArray);
    }else {
        stadium.avgRating = 0;
    }
    await stadium.save();
    res.redirect(`/stadia/${id}`);
}