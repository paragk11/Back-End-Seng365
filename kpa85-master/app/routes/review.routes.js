const reviews = require('../controllers/review.controller');


module.exports = function (app) {
    app.route(app.rootUrl + '/venues/:id/reviews')
        .get(reviews.read)
        .post(reviews.create);



}