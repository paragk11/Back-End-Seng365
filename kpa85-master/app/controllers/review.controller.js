const Review = require('../models/review.model');

exports.read = function (req, res) {

    let review_data = {
      "reviewId": req.params.id,
      "token": req.get("X-Authorization")
    };

    let values = [review_data.reviewId, review_data.token];

    Review.getOne(values, function (displayData, result, err) {


        if (result === 404){
            res.statusMessage = 'Not Found';
            res.status(404)
                .send();

        } else {
            res.status(200).json(displayData);
        }
    });
};


exports.create = function(req, res) {

    let review_data = {
        "reviewBody": req.body.reviewBody,
        "starRating": req.body.starRating,
        "costRating": req.body.costRating,
        "reviewId": req.params.id,
        "token": req.get("X-Authorization")
    };

    if (review_data.token == 0 || review_data.token == undefined) {
        res.statusMessage = 'Unauthorized';
        res.status(401)
            .send();

    }  else {
        let values = [review_data.reviewBody, review_data.starRating, review_data.costRating, review_data.reviewId, review_data.token];
        Review.insert(values, function (displayData, result, err) {

            if (result === 400) {
                res.statusMessage = 'Bad Request';
                res.status(400)
                    .send();

            } else if (result === 401) {
                res.statusMessage = 'Forbidden';
                res.status(401)
                    .send();
            } else if (result === 403){
                res.statusMessage = 'Unauthorized';
                res.status(403)
                    .send();

            } else if (result === 404) {
                res.statusMessage = 'Not Found';
                res.status(404)
                    .send();
            }
            else if (result === 201){
                res.statusMessage = 'Created';
                res.status(201).send();
            }
        });
    }
};
