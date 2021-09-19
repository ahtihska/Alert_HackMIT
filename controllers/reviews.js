const Incident = require('../models/incident');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const incident = await Incident.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    incident.reviews.push(review);
    await review.save();
    await incident.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/incidents/${incident._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Incident.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/incidents/${id}`);
}