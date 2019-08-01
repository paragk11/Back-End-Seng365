const db = require('../../config/db');
const fs = require('fs');
const path = require('path');
const appDir = path.dirname(require.main.filename);


exports.post = function (valuesGiven, done) {

    let venue_id = valuesGiven[0];
    let description = valuesGiven[1];
    let makePrimary = valuesGiven[2];
    let content_type = valuesGiven[3];
    let photoBuffer = valuesGiven[4];
    let enteredToken = valuesGiven[5];

    let user_id = undefined;

    db.getPool().query("SELECT user_id FROM User WHERE auth_token = ? ", enteredToken, function (err, result) {
        if (err) done(400);

        if (result === undefined || result.length === 0) {
            done (401)
        } else {
            user_id = result[0].user_id;

            db.getPool().query("SELECT admin_id FROM Venue WHERE venue_id = ? ", venue_id, function (err1, result1) {
                if (err1) done(404);

                if (result1 === undefined || result1.length === 0) {
                    done(404);

                } else if (user_id !== result1[0].admin_id) {
                    done(403);

                } else {

                    db.getPool().query("SELECT photo_filename FROM VenuePhoto WHERE venue_id = ? and is_primary = true", venue_id, function (err, result) {
                        if (err) done(400);

                        if (result === undefined || result.length === 0 || result[0].photo_filename === null) {
                            makePrimary = true;

                            let storageName = './storage/pho/' + "venue_" + venue_id.toString() + "_" + Date.now().toString() + "." + content_type;
                            fs.writeFile(storageName, photoBuffer, function (err) {
                                if (err) done(404);
                                db.getPool().query('INSERT INTO VenuePhoto (venue_id, photo_filename, photo_description, is_primary) ' +
                                    'VALUES (?, ?, ?, ?)', [venue_id, storageName, description, makePrimary], function (err, result) {
                                    if (err) done(404);
                                    done(201);
                                });
                            });


                        } else {
                            if (makePrimary === "true") {

                                db.getPool().query("UPDATE VenuePhoto SET is_primary = 0 WHERE venue_id = ? and is_primary = true", venue_id, function (err, result) {
                                    if (err) done(400);

                                    let storageName = './storage/pho/' + "venue_" + venue_id.toString() + "_" + Date.now().toString() + "." + content_type;
                                    fs.writeFile(storageName, photoBuffer, function (err) {
                                        if (err) throw done(404);
                                        db.getPool().query('INSERT INTO VenuePhoto (venue_id, photo_filename, photo_description, is_primary) ' +
                                            'VALUES (?, ?, ?, ?)', [venue_id, storageName, description, 1], function (err1, result1) {
                                            if (err) done(404);
                                            done(201);
                                        });
                                    });
                                });


                            } else {
                                let storageName = './storage/pho/' + "venue_" + venue_id.toString() + "_" + Date.now().toString() + "." + content_type;
                                fs.writeFile(storageName, photoBuffer, function (err) {
                                    if (err) throw done(404);
                                    db.getPool().query('INSERT INTO VenuePhoto (venue_id, photo_filename, photo_description, is_primary) ' +
                                        'VALUES (?, ?, ?, ?)', [venue_id, storageName, description, makePrimary], function (err, result) {
                                        if (err) done(404);
                                        done(201);
                                    });
                                });
                            }
                        }
                    });
                }
            });

        }


    });
};



exports.readOne = function (valuesGiven, done) {

    let venue_id = valuesGiven[0];
    let token = valuesGiven[1];
    let photo_name = './storage/pho/' + valuesGiven[2];

    db.getPool().query('SELECT photo_filename FROM VenuePhoto WHERE photo_filename = ?', photo_name, function(err, result) {
        if (err) return done(result, 404);

        if (result.length === 0 || result[0].photo_filename === null) {

            done(result, 404);

        } else {
            db.getPool().query('SELECT venue_id FROM Venue WHERE venue_id = ?', venue_id, function(err1, result1) {
                if (err) return done(result1, 404);

                if (result1.length === 0 || result1[0].venue_id === null) {
                    done(result1, 404);

                } else {
                    let URI = result[0].photo_filename;
                    let photo = (appDir + URI).replace(".", "");
                    done(photo, 200);

                }
            });
        }
    });
};

