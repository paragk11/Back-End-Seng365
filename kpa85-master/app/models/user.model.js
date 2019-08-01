const db = require('../../config/db');
const fs = require('fs');
const path = require('path');

const appDir = path.dirname(require.main.filename);

const bcrypt = require('bcrypt');


function changePasswordToHash(password){
    let hashed = bcrypt.hashSync(password, 10);
    return hashed;
}


exports.getOne = function(givenValues, done){

    let values = givenValues;

    let enteredToken = values[1];
    let enteredId = values[0];
    let actualToken = undefined;

    let user_data = {};



    if (enteredToken == undefined) {
        db.getPool().query('SELECT username, given_name, family_name FROM User WHERE user_id = ?',
            enteredId, function(err, rows){
            if (err) return done(404);

            if (rows.length == 0){
                done(rows, 404);
            } else {
                user_data = {
                    "username": rows[0].username,
                    "givenName": rows[0].given_name,
                    "familyName": rows[0].family_name
                };

                done(user_data, 200);
            }
        });

    } else {

        db.getPool().query('SELECT auth_token FROM User WHERE user_id = ?', enteredId, function (err, rows) {
            if (err) return done(404);
                if (rows.length == 0) {
                    db.getPool().query('SELECT username, given_name, family_name FROM User WHERE user_id = ?',
                        enteredId, function(err, rows){
                            if (err) return done(404);

                            if (rows.length == 0){
                                done(rows, 404);
                            } else {
                                user_data = {
                                    "username": rows[0].username,
                                    "givenName": rows[0].given_name,
                                    "familyName": rows[0].family_name
                                };

                                return done(user_data, 200);
                            }
                        });
                } else {

                    actualToken = rows[0].auth_token;


                    if (actualToken !== enteredToken) {
                        db.getPool().query('SELECT username, given_name, family_name FROM User WHERE user_id = ?',
                            enteredId, function (err, rows) {
                                if (err) return done(404);

                                if (rows.length == 0) {
                                    done(rows, 404);
                                } else {
                                    user_data = {
                                        "username": rows[0].username,
                                        "givenName": rows[0].given_name,
                                        "familyName": rows[0].family_name
                                    };

                                    done(user_data, 200);
                                }
                            });

                    } else {
                        db.getPool().query('SELECT username, email, given_name, family_name FROM User WHERE user_id = ?',
                            enteredId, function (err, rows) {
                                if (err) return done(404);
                                if (rows.length == 0) {
                                    done(rows, 404);
                                } else {
                                    user_data = {
                                        "username": rows[0].username,
                                        "email": rows[0].email,
                                        "givenName": rows[0].given_name,
                                        "familyName": rows[0].family_name
                                    };

                                    done(user_data, 201);
                                }
                            });
                    }
                }
        });
    }
};



exports.insert = function (valuesGiven, done) {

    let hashedPassword = changePasswordToHash(valuesGiven[4]);
    let values = valuesGiven.slice(0,4);
    values.push(hashedPassword);

    db.getPool().query('INSERT INTO User ' +
        '(username, email, given_name, family_name , password) ' + //change password to hashed
        'VALUES (?, ?, ?, ?, ?)',
        values, function (err, result) {
        if (err) return done(result, err);
        done(result);
    });
};


exports.alter = function(alterValues, done){

    let alterUsername = alterValues[0];
    let alterEmail = alterValues[1];
    let alterGivenName = alterValues[2];
    let alterFamilyName = alterValues[3];
    let alterPassword = alterValues[4];

    let enteredId = alterValues[5];
    let enteredToken = alterValues[6];
    let acutalToken = undefined;
    let user_data = {};


    if (enteredToken.length === 0) {
        done(401);
    } else {

        db.getPool().query('SELECT auth_token FROM User WHERE user_id = ?', enteredId, function(err, result) {
            if (err) return done(400);

            if (result.length === 0) {
                done(result, 404);

            } else {
                acutalToken = result[0].auth_token;
                if (acutalToken !== enteredToken) {
                    db.getPool().query('SELECT user_id FROM User WHERE auth_token = ?', enteredToken, function (err1, result1) {
                        if (err1) return done(400);

                        if(result1.length === 0) {
                            done(result1, 401);
                        } else {
                            done(result1, 403);
                        }
                    });

                } else if (isNaN(alterPassword) === false){
                    done(result, 400);

                } else {

                    db.getPool().query('SELECT given_name, family_name, password FROM User WHERE auth_token = ?', enteredToken, function (err1, result1) {
                        if (err1) return done(400);

                        if(result1[0].given_name === alterGivenName && result1[0].family_name === alterFamilyName) {

                            bcrypt.compare(alterPassword, result1[0].password, function (err, correct) {
                                if (correct) {
                                    done(result1, 400);

                                } else {
                                    let alterQueue = [];
                                    let alterQuery = 'UPDATE User SET';
                                    if (alterUsername != undefined) {
                                        alterQuery = alterQuery + ' username = ?,';
                                        alterQueue.push(alterUsername);
                                        user_data["username"] = alterUsername;
                                    }

                                    if (alterEmail != undefined) {
                                        alterQuery = alterQuery + ' email = ?,';
                                        alterQueue.push(alterEmail);
                                        user_data["email"] = alterEmail;
                                    }

                                    if (alterGivenName != undefined) {
                                        alterQuery = alterQuery + ' given_name = ?,';
                                        alterQueue.push(alterGivenName);
                                        user_data["givenName"] = alterGivenName;
                                    }

                                    if (alterFamilyName != undefined) {
                                        alterQuery = alterQuery + ' family_name = ?,';
                                        alterQueue.push(alterFamilyName);
                                        user_data["familyName"] = alterFamilyName;
                                    }

                                    if (alterPassword != undefined) {
                                        let hashedPassword = changePasswordToHash(alterPassword);
                                        alterQuery = alterQuery + ' password = ?,';
                                        alterQueue.push(hashedPassword);
                                        user_data["password"] = alterPassword;
                                    }

                                    alterQuery = alterQuery.substring(0, (alterQuery.length - 1));
                                    alterQuery = alterQuery + ' WHERE user_id = ?';
                                    alterQueue.push(enteredId);

                                    if(alterFamilyName.length === 0){
                                        return done(result1, 400);
                                    }

                                    db.getPool().query(alterQuery, alterQueue, function (err2, result2) {
                                        if (err2) return done(400);
                                        done(user_data, 200);
                                    });
                                }
                            });

                        } else {
                            let alterQueue = [];
                            let alterQuery = 'UPDATE User SET';
                            if (alterUsername != undefined) {
                                alterQuery = alterQuery + ' username = ?,';
                                alterQueue.push(alterUsername);
                                user_data["username"] = alterUsername;
                            }

                            if (alterEmail != undefined){
                                alterQuery = alterQuery + ' email = ?,';
                                alterQueue.push(alterEmail);
                                user_data["email"] = alterEmail;
                            }

                            if (alterGivenName != undefined){
                                alterQuery = alterQuery + ' given_name = ?,';
                                alterQueue.push(alterGivenName);
                                user_data["givenName"] = alterGivenName;
                            }

                            if (alterFamilyName != undefined){
                                alterQuery = alterQuery + ' family_name = ?,';
                                alterQueue.push(alterFamilyName);
                                user_data["familyName"] = alterFamilyName;
                            }

                            if (alterPassword != undefined) {
                                let hashedPassword = changePasswordToHash(alterPassword);
                                alterQuery = alterQuery + ' password = ?,';
                                alterQueue.push(hashedPassword);
                                user_data["password"] = alterPassword;
                            }

                            alterQuery = alterQuery.substring(0, (alterQuery.length - 1));
                            alterQuery = alterQuery + ' WHERE user_id = ?';
                            alterQueue.push(enteredId);

                            if(alterFamilyName.length === 0){
                                return done(result1, 400);
                            }

                            db.getPool().query(alterQuery, alterQueue, function(err2, result2) {
                                if (err2) return done(400);
                                done(user_data, 200);
                            });
                        }
                    });
                }
            }
        });
    }
};


exports.perform_login = function (usernameEmailDetails, done) {

    let values = usernameEmailDetails;

    let enteredUsername = values[0];
    let enteredEmail = values[1];
    let enteredPassword = values[2];

    let loginPassword = undefined;
    let loginUsername = undefined;

    let user_data = {};

    db.getPool().query('SELECT * FROM User WHERE username = ? or email = ? ',
        [enteredUsername, enteredEmail], function(err, rows){
        if (err) return done(err, rows);
        if (rows.length === 0){
            return done(user_data);
        } else {
            loginPassword = rows[0].password;
            loginUsername = rows[0].username;


            bcrypt.compare(enteredPassword, loginPassword, function (err, correct) {
                if(correct){

                    let token = Math.random().toString(36).substr(2) +
                        Math.random().toString(36).substr(2);

                    user_data = {
                        "userId": rows[0].user_id,
                        "token": token
                    };
                    db.getPool().query('UPDATE User SET auth_token = ? WHERE username = ?',
                        [token, loginUsername], function (err1, rows1) {
                            if (err) return done(rows1, err1);
                            return done(user_data, 200);
                    });
                } else {
                    return done(rows, err);
                }
            });
        }
    })
};

exports.perform_logout = function (token, done) {

    let enteredToken = token;
    let actualToken = undefined;

    if (enteredToken == undefined) {
        done(401);

    } else {
        db.getPool().query('SELECT auth_token FROM User WHERE auth_token = ?', token, function (err, result) {
            if (err) return done(401);

            if (result.length == 0){
                done(401);

            } else {
                actualToken = result[0].auth_token;

                if (actualToken !== enteredToken) {
                    done(401);

                } else {
                    db.getPool().query('UPDATE User SET auth_token = NULL WHERE auth_token = ?', token, function (err, result) {
                        if (err) return done(401);
                        done(200);
                    });
                }
            }
        });
    }
};


exports.insertPhoto = function (valuesGiven, req,  done) {

    let insertUserId = valuesGiven[0];
    let enteredToken = valuesGiven[1];
    let content_type = valuesGiven[2];

    let actualToken = undefined;

    let createdYet;

    db.getPool().query('SELECT auth_token FROM User WHERE user_id = ?', insertUserId, function(err, result) {
        if (err) return done(400);

        if (result.length === 0) {
            done(result, 404);

        } else {

            actualToken = result[0].auth_token;
            if (actualToken !== enteredToken) {
                db.getPool().query('SELECT user_id FROM User WHERE auth_token = ?', enteredToken, function (err1, result1) {
                    if (err1) return done(400);

                    if (result1.length === 0) {
                        done(result1, 401);
                    } else {
                        done(result1, 403);
                    }
                });

            } else {

                db.getPool().query("SELECT profile_photo_filename FROM User WHERE user_id = ? ", insertUserId, function (err1, result1) {
                    if (err1) done(result1, 400);

                    if (result1[0].profile_photo_filename === null) {
                        createdYet = 201;
                    } else {
                        createdYet = 200;
                    }

                    let storageName = './storage/photos/' + "user_" + insertUserId.toString() + "." + content_type;

                    req.pipe(fs.createWriteStream(storageName));
                    db.getPool().query("UPDATE User SET profile_photo_filename = ? WHERE user_id = ? ", [storageName, insertUserId], function (err2, result2) {
                        if (err2) done(result2, 400);
                        done(result2, createdYet);
                    });
                });
            }
        }
    });
};


exports.readPhoto = function (valuesGiven, done) {

    let id = valuesGiven;

    db.getPool().query('SELECT profile_photo_filename FROM User WHERE user_id = ?', id, function(err, result) {
        if (err) return done(result, 404);

        if (result.length === 0 || result[0].profile_photo_filename === null) {
            done(result, 404);

        } else {
            let URI = result[0].profile_photo_filename;
            let photo = (appDir + URI).replace(".","");
            done(photo, 200);

        }
    });

};



exports.deleteUserPhoto = function (valuesGiven, done) {

    let id = valuesGiven[0];
    let enteredToken = valuesGiven[1];
    let actualToken = undefined;

    db.getPool().query('SELECT auth_token FROM User WHERE user_id = ?', id, function(err, result) {
        if (err) return done(400);

        if (result.length === 0) {
            done(404);

        } else {

            actualToken = result[0].auth_token;
            if (actualToken !== enteredToken) {

                db.getPool().query('SELECT user_id FROM User WHERE auth_token = ?', enteredToken, function (err1, result1) {
                    if (err1) return done(400);

                    if (result1.length === 0) {
                        done(404);
                    } else {
                        done(403);
                    }
                });

            } else {

                db.getPool().query('SELECT profile_photo_filename FROM User WHERE user_id = ?', id, function (err, result) {
                    if (err) done(404);

                    if (result.length === 0 || result[0].profile_photo_filename === null) {
                        done(404);

                    } else {
                        let URI = result[0].profile_photo_filename;
                        fs.unlink(URI, function (err, result) {
                            if (err) {
                                done(err)
                            } else {
                                db.getPool().query('UPDATE User SET profile_photo_filename = NULL', function (err, result) {
                                    if (err) done(404);

                                    done(200);
                                });
                            }
                        })
                    }
                });
            }
        }
    });
};