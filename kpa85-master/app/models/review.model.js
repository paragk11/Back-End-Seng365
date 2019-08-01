const db = require('../../config/db');

// ORDER BY time_posted DESC

exports.getOne = function (valuesGiven, done) {

    let list = [];

    let review_id = valuesGiven[0];

    db.getPool().query('SELECT ' +
        '(SELECT user_id FROM User WHERE User.user_id = Review.review_author_id) AS userId, ' +
        '(SELECT username FROM User WHERE User.user_id = Review.review_author_id) AS username, ' +
        'review_body AS reviewBody, star_rating AS starRating, cost_rating AS costRating, ' +
        'time_posted AS timePosted FROM Review WHERE reviewed_venue_id = ? ORDER BY time_posted DESC', review_id , function(err, result){
        if (err) return done(result, 404);

        if(result.length === 0){
            done(result, 404);

        } else{
            for (let i = 0; i < result.length; i++) {
                list.push({
                    "reviewAuthor": {
                        "userId": result[i].userId,
                        "username": result[i].username
                    },
                    "reviewBody": result[i].reviewBody,
                    "starRating": result[i].starRating,
                    "costRating": result[i].costRating,
                    "timePosted": result[i].timePosted
                });
            }
            done(list, 200);
        }
    });
};


exports.insert = function (valuesGiven, done) {

    let insertReviewBody = valuesGiven[0];
    let insertStarRating = valuesGiven[1];
    let insertCostRating = valuesGiven[2];

    let venueId = valuesGiven[3];
    let enteredToken = valuesGiven[4];

    let admin_id = undefined;

    db.getPool().query('SELECT user_id FROM User WHERE auth_token = ?', enteredToken , function(err, result){
        if (err) return done(result, 400);

        if (result.length === 0) {
            done(result, 401);

        } else if (insertStarRating === 0 || insertStarRating > 5 || insertCostRating < 0 ||
                !Number.isInteger(insertStarRating) || !Number.isInteger(insertCostRating)) {
            done(result, 400)

        } else  {
            admin_id = result[0].user_id;

            db.getPool().query('SELECT admin_id FROM Venue WHERE venue_id = ?',venueId , function(err, result) {
                if (err) return done(result, 400);

                if (result[0].admin_id === admin_id) {
                    done(result, 403);

                } else {
                    db.getPool().query('SELECT review_id FROM Review ' +
                        'WHERE reviewed_venue_id = ? AND review_author_id = ?' , [venueId, admin_id], function(err, result) {
                        if (err) return done(result, 400);

                        if (result.length !== 0) {
                            done(result, 403);
                        } else {

                            let todayDate = new Date().toISOString().slice(0,19);

                            let values = [];
                            values.push(venueId, admin_id, insertReviewBody, insertStarRating, insertCostRating, todayDate);

                            db.getPool().query('INSERT INTO Review ' +
                                '(reviewed_venue_id, review_author_id, review_body, star_rating, cost_rating, time_posted) ' + //change password to hashed
                                'VALUES (?, ?, ?, ?, ?, ?)',
                                values, function (err, result) {
                                    if (err) return done(result, 400);
                                    done(result, 201);
                                });
                        }
                    });
                }
            });
        }
    });
};
