const db = require('../../config/db');

exports.getAll = function (rows, done) {
    db.getPool().query('SELECT venue_id AS venueId, venue_name AS venueName, category_id AS categoryId, ' +
        'city, short_description AS shortDescription, latitude, longitude FROM Venue', function (err, rows) {
        if (err) return done(err);

        return done(rows);

    });
};

exports.getAllCategories = function(rows, done) {
    db.getPool().query('SELECT category_id AS categoryId, category_name AS categoryName, category_description AS categoryDescription FROM VenueCategory', function (err, rows) {
        if (err) return done(err);
        return done(rows);

    });
};



exports.insert = function(valuesGiven, done){

    let values = valuesGiven;
    let enteredToken = valuesGiven[8];
    values.pop();

    let insertVenueName = valuesGiven[0];
    let insertCategoryId = valuesGiven[1];
    let insertCity = valuesGiven[2];
    let insertShortDescription = valuesGiven[3];
    let insertLongDescription = valuesGiven[4];
    let insertAddress = valuesGiven[5];
    let insertLatitude = valuesGiven[6];
    let insertLongitude = valuesGiven[7];

    let selectId = undefined;

    db.getPool().query('SELECT user_id, auth_token FROM User WHERE auth_token = ?', enteredToken, function (err, result) {
        if (err) return done(401);

        if (result.length == 0){
            done(result, 401);

        } else {
            selectId = result[0].user_id;
            values[8] = selectId;

            let todayDate = new Date().toISOString().slice(0,10); // might need to change timezone
            values[9] = todayDate;


            if(insertCity === undefined || insertLatitude > 90.0 || insertLongitude < -180.0) {
                return done(result, 400);
            }

            db.getPool().query('SELECT category_id FROM VenueCategory WHERE category_id = ?', insertCategoryId, function (err, result) {
                if (err) return done(400);

                if (result.length === 0) {
                    done(result, 400);

                } else {
                    db.getPool().query('INSERT INTO Venue ' +
                        '(venue_name, category_id, city, short_description, long_description, address, latitude, longitude, admin_id, date_added) ' +
                        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', values, function (err, result) {
                        if (err) return done(400);

                        let insert_id = result['insertId'];

                        done(insert_id, 201);

                    });
                }
            });
        }
    });
};

exports.alter = function(valuesGiven, done){


    let alterVenueName = valuesGiven[0];
    let alterCategoryId = valuesGiven[1];
    let alterCity = valuesGiven[2];
    let alterShortDescription = valuesGiven[3];
    let alterLongDescription = valuesGiven[4];
    let alterAddress = valuesGiven[5];
    let alterLatitude = valuesGiven[6];
    let alterLongitude = valuesGiven[7];

    let enteredId = valuesGiven[8];
    let enteredToken = valuesGiven[9];

    let actualToken = undefined;


    db.getPool().query('SELECT auth_token FROM User WHERE user_id = ?', enteredId, function (err, result) {
        if (err) return done(401);

        if (result.length === 0) {
            done(result, 404);

        } else {

            actualToken = result[0].auth_token;
            if (actualToken !== enteredToken) {
                db.getPool().query('SELECT user_id FROM User WHERE auth_token = ?', enteredToken, function (err1, result1) {
                    if (err1) return done(400);

                    if (result1.length === 0) {
                        done(401);
                    } else {
                        done(403);
                    }
                });

            } else {
                db.getPool().query('SELECT admin_id, venue_name FROM Venue WHERE admin_id = ?', enteredId, function (err, result) {
                    if (err) return done(401);

                    if (result[0].length === 0) {
                        done(403);

                    } else {
                        let alterQueue = [];
                        let alterQuery = 'UPDATE Venue SET';
                        if (alterVenueName != undefined) {
                            alterQuery = alterQuery + ' venue_name = ?,';
                            alterQueue.push(alterVenueName);
                        }
                        if (alterCategoryId != undefined) {
                            alterQuery = alterQuery + ' category_id = ?,';
                            alterQueue.push(alterCategoryId);
                        }
                        if (alterCity != undefined) {
                            alterQuery = alterQuery + ' city = ?,';
                            alterQueue.push(alterCity);
                        }
                        if (alterShortDescription != undefined) {
                            alterQuery = alterQuery + ' short_description = ?,';
                            alterQueue.push(alterShortDescription);
                        }

                        if (alterLongDescription != undefined) {
                            alterQuery = alterQuery + ' long_description = ?,';
                            alterQueue.push(alterLongDescription);
                        }
                        if (alterAddress != undefined) {
                            alterQuery = alterQuery + ' address = ?,';
                            alterQueue.push(alterAddress);
                        }

                        if (alterLatitude != undefined) {
                            alterQuery = alterQuery + ' latitude = ?,';
                            alterQueue.push(alterLatitude);
                        }

                        if (alterLongitude != undefined) {
                            alterQuery = alterQuery + ' longitude = ?,';
                            alterQueue.push(alterLongitude);
                        }

                        alterQuery = alterQuery.substring(0, (alterQuery.length - 1));
                        alterQuery = alterQuery + ' WHERE admin_id = ? AND venue_name = ?';
                        alterQueue.push(enteredId);
                        alterQueue.push(result[0].venue_name);

                        db.getPool().query(alterQuery, alterQueue, function (err, result) {
                            if (err) return done(400);
                            if (result['changedRows'] === 0) {
                                done(400);
                            } else {
                                done(200);
                            }
                        });
                    }
                });
            }
        }
    });
};


exports.getOne = function (valuesGiven, done) {


    let venue_id = valuesGiven[0];
    let token = valuesGiven[1];


    db.getPool().query('SELECT * FROM Venue WHERE venue_id = ?', venue_id , function(err, result){
        if (err) return done(result, 404);
        if(result.length === 0){
            done(result, 404);

        } else {
            db.getPool().query('SELECT username FROM User WHERE user_id = ?', result[0].admin_id , function(err1, result1) {
                if (err) return done(result1, 404);

                if (result1.length === 0) {
                    done(result1, 404);


                } else {
                    db.getPool().query('SELECT * FROM VenueCategory WHERE category_id = ?', result[0].category_id , function(err2, result2) {
                        if (err2) return done(result2, 404);

                        if (result2.length === 0) {
                            done(result2, 404);

                        } else {

                            db.getPool().query('SELECT * FROM VenuePhoto WHERE venue_id = ?', venue_id , function(err3, result3) {
                                if (err3) return done(result3, 404);

                                let photos = [];

                                for (let i = 0; i < result3.length; i++) {
                                    if (result3[i].is_primary === 0) {
                                        photos.push({
                                            "photoFilename": result3[i].photo_filename,
                                            "photoDescription": result3[i].photo_description,
                                            "isPrimary": false
                                        })
                                    } else {
                                        photos.push({
                                            "photoFilename": result3[i].photo_filename,
                                            "photoDescription": result3[i].photo_description,
                                            "isPrimary": true
                                        })
                                    }
                                }

                                let push =
                                    {
                                        "venueName": result[0].venue_name,
                                        "admin": {
                                            "userId": result[0].admin_id,
                                            "username": result1[0].username
                                        },
                                        "category": {
                                            "categoryId": result[0].category_id,
                                            "categoryName": result2[0].category_name,
                                            "categoryDescription": result2[0].category_description
                                        },
                                        "city": result[0].city,
                                        "shortDescription": result[0].short_description,
                                        "longDescription": result[0].long_description,
                                        "dateAdded": result[0].date_added,
                                        "address": result[0].address,
                                        "latitude": result[0].latitude,
                                        "longitude": result[0].longitude,
                                        photos
                                    };
                                done(push, 200);

                            });
                        }
                    });
                }
            });
        }
    });
};

//
// for (let i = 0; i < result.length; i++) {
//     list.push(
//
//             "photos": [
//                 {
//                     "photoFilename": "dA3s41Ob.png",
//                     "photoDescription": "The view from the presidential suite on the top floor.",
//                     "isPrimary": false
//                 }
//             ]
//         });
// }


//      {
//     "reviewAuthor": {
//               "userId": result[i].userId,
//              "username": result[i].username
//      },
//     "reviewBody": result[i].reviewBody,
//     "starRating": result[i].starRating,
//     "costRating": result[i].costRating,
//     "timePosted": result[i].timePosted
//      }