const User = require('../models/user.model');


exports.read = function(req, res) {
    let id = req.params.id;
    let token = req.get("X-Authorization");

    let values = [id, token];

    User.getOne(values, function (user_data, rows, err) {

        if (rows === 404) {
            res.statusMessage = 'Not Found';
            res.status(404)
                .send();

        } else if (rows === 201){


            let data = {
                "username": 0,
                "email": 0,
                "givenName": 0,
                "familyName": 0,
            };

            data.username = user_data.username;
            data.email = user_data.email;
            data.givenName = user_data.givenName;
            data.familyName = user_data.familyName;

            res.statusMessage = 'OK';
            res.status(200)
                .json(data);

        } else {
            let data = {
                "username": 0,
                "givenName": 0,
                "familyName": 0,
            };

            data.username = user_data.username;
            data.givenName = user_data.givenName;
            data.familyName = user_data.familyName;

            res.statusMessage = 'OK';
            res.status(200)
                .json(data);
        }
    });
};

exports.create = function(req, res){
    let user_data = {
        "username": req.body.username,
        "email": req.body.email,
        "givenName": req.body.givenName,
        "familyName": req.body.familyName,
        "password": req.body.password
    };

    let values = [user_data.username, user_data.email, user_data.givenName, user_data.familyName, user_data.password];

    if(user_data['email'].toString().includes('@') === false) {
        res.statusMessage = 'Bad Request';
        res.status(400)
            .send();
    } else if (user_data['password'].toString().length === 0 ) {
        res.statusMessage = 'Bad Request';
        res.status(400)
            .send();
    } else {
        User.insert(values, function (result, err) {

            if (err) {
                res.statusMessage = 'Bad Request';
                res.status(400)
                    .send();

            } else {
                let data = {
                    "userId":0
                };

                data.userId = result['insertId'];
                res.statusMessage = 'Created';
                res.status(201)
                    .json(data);

            }
        });
    }
};

exports.update = function(req, res) {

    let update_data = {

        "username": req.body.username,
        "email": req.body.email,
        "givenName": req.body.givenName,
        "familyName": req.body.familyName,
        "password": req.body.password,
        "userId":req.params.id,
        "token": req.get("X-Authorization")
    };


    if (update_data.token == null){
        res.statusMessage = 'Unauthorized';
        res.status(401)
            .send();
    }

    if(update_data.username === undefined && update_data.email === undefined && update_data.givenName === undefined &&
        update_data.familyName === undefined && update_data.password === undefined) {
        res.statusMessage = 'Bad Request';
        res.status(400)
            .send();
    } else {
        let values = [update_data.username, update_data.email, update_data.givenName, update_data.familyName,
            update_data.password, update_data.userId, update_data.token];


        User.alter(values, function (user_data, result, err){

            if (result === 200) {
                res.statusMessage = 'OK';
                res.status(200)
                    .json(user_data);

            } else if (result === 400) {
                res.statusMessage = 'Bad Request';
                res.status(400)
                    .send();

            } else if (result === 401) {
                res.statusMessage = 'Unauthorized';
                res.status(401)
                    .send();

            } else if (result === 403) {
                res.statusMessage = 'Forbidden';
                res.status(403)
                    .send();

            } else if (result === 404) {
                res.statusMessage = 'Not Found';
                res.status(404)
                    .send();
            } else if (401) {
                res.statusMessage = 'Unauthorized';
                res.status(401)
                    .send();
            }
        });
    }


};


exports.login = function (req, res) {

    let login_data = {
        "username": req.body.username,
        "email": req.body.email,
        "password": req.body.password
    };
    let usernameEmailDetails = [login_data.username, login_data.email, login_data.password];

    User.perform_login(usernameEmailDetails, function (user_data, rows, err){

        if (user_data.userId === undefined){
            res.statusMessage = 'Bad Request';
            res.status(400)
                .send();

        } else if (err) {
            res.statusMessage = 'Bad Request';
            res.status(400)
                .send();


        } else {
            res.statusMessage = 'OK';
            res.status(200)
                .json(user_data);
        }
    });
};


exports.logout = function(req, res) {

    let token = req.get("X-Authorization");

    User.perform_logout(token, function (result){


        if (result === 401) {
            res.statusMessage = 'Unauthorized';
            res.status(401)
                .send();

        } else {

            res.statusMessage = 'OK';
            res.status(200)
                .send();

        }
    });
};


exports.putPhoto = function(req, res) {
    let id = req.params.id;
    let token = req.get("X-Authorization");

    let content_type = req.get('Content-Type').split('/').pop();

    if (content_type === "jpg") {
        content_type = "jpeg";
    }


    if (token === null || token == 0 || token === undefined) {
        res.statusMessage = 'Unauthorized';
        res.status(401)
            .send();

    }  else {

        let values = [id, token, content_type];



        User.insertPhoto(values, req, function (user_data, result, err) {   //////might need to get rid of user data here

            if (result === 200) {
                res.statusMessage = 'OK';
                res.status(200)
                    .send();

            } else if (result === 201) {
                res.statusMessage = 'Created';
                res.status(201)
                    .send();

            } else if (result === 400) {
                res.statusMessage = 'Bad Request';
                res.status(400)
                    .send();

            } else if (result === 401) {
                res.statusMessage = 'Unauthorized';
                res.status(401)
                    .send();

            } else if (result === 403) {
                res.statusMessage = 'Forbidden';
                res.status(403)
                    .send();

            } else if (result === 404) {
                res.statusMessage = 'Not Found';
                res.status(404)
                    .send();

            }

        });
    }
};

exports.getPhoto = function(req, res) {
    let id = req.params.id;

    User.readPhoto(id, function (picture, result, err) {

        if (result === 200) {
            res.statusMessage = 'OK';
            res.status(200)
                .sendFile(picture);

        } else if (result === 404) {
            res.statusMessage = 'Not Found';
            res.status(404)
                .send();

        }
    });
};


exports.deletePhoto = function(req, res) {
    let id = req.params.id;
    let token = req.get("X-Authorization");


    if (token === null || token == 0 || token === undefined) {
        res.statusMessage = 'Unauthorized';
        res.status(401)
            .send();

    }  else {

        let values = [id, token];

        User.deleteUserPhoto(values, function (result, err) {

            if (result === 200) {
                res.statusMessage = 'OK';
                res.status(200)
                    .send();

            } else if (result === 401) {
                res.statusMessage = 'Unauthorized';
                res.status(401)
                    .send();

            } else if (result === 403) {
                res.statusMessage = 'Forbidden';
                res.status(403)
                    .send();
            } else if (result === 404) {
                res.statusMessage = 'Not Found';
                res.status(404)
                    .send();
            }
        });
    }
};