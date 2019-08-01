const Venue = require('../models/venue.model');


exports.list = function (req, res) {
    Venue.getAll(req.query,function (result, err) {
        res.status(200).json(result);
    });
};

exports.listCategories = function(req, res) {
    Venue.getAllCategories(req.get("X-Authorization"),function (result, err) {
        res.status(200).json(result);
    });
};

exports.create = function(req, res) {


    let venue_data = {
        "venueName": req.body.venueName,
        "categoryId": req.body.categoryId,
        "city": req.body.city,
        "shortDescription": req.body.shortDescription,
        "longDescription": req.body.longDescription,
        "address": req.body.address,
        "latitude": req.body.latitude,
        "longitude": req.body.longitude,
        "token": req.get("X-Authorization")
    };

    if (venue_data.token == 0 || venue_data.token == undefined){

        res.statusMessage = 'Unauthorized';
        res.status(401)
            .send();
    } else {

        let values = [venue_data.venueName, venue_data.categoryId, venue_data.city, venue_data.shortDescription, venue_data.longDescription,
            venue_data.address, venue_data.latitude, venue_data.longitude, venue_data.token];

        Venue.insert(values, function(insert_id, result, err){

            if (result === 400) {
                res.statusMessage = 'Bad Request';
                res.status(400)
                    .send();

            } else if (result === 401) {
                res.statusMessage = 'Unauthorized';
                res.status(401)
                    .send();

            } else if (result === 201){
                let data = {
                    "venueId":0
                };

                data.venueId = insert_id;
                res.status(201)
                    .json(data)
            }
        });
    }
};

exports.update = function (req, res) {


    let venue_data = {

        "venueName": req.body.venueName,
        "categoryId": req.body.categoryId,
        "city": req.body.city,
        "shortDescription": req.body.shortDescription,
        "longDescription": req.body.longDescription,
        "address": req.body.address,
        "latitude": req.body.latitude,
        "longitude": req.body.longitude,
        "userId":   req.params.id,
        "token": req.get("X-Authorization")
    };

    if (venue_data.token == 0 || venue_data.token === undefined || venue_data.token === null){
        res.statusMessage = 'Unauthorized';
        res.status(401)
            .send();
    } else if(venue_data.venueName === undefined && venue_data.categoryId === undefined && venue_data.city === undefined &&
        venue_data.shortDescription === undefined && venue_data.longDescription === undefined &&
        venue_data.address === undefined && venue_data.latitude === undefined && venue_data.longitude === undefined) {

        res.statusMessage = 'Bad Request';
        res.status(400)
            .send();
    } else {

        let values = [venue_data.venueName, venue_data.categoryId, venue_data.city, venue_data.shortDescription,
            venue_data.longDescription, venue_data.address, venue_data.latitude, venue_data.longitude, venue_data.userId, venue_data.token];

        Venue.alter(values, function (result, err) {

            if (result === 200) {
                res.statusMessage = 'OK';
                res.status(200)
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




exports.read = function (req, res) {

    let venue_data = {
        "venue_id": req.params.id,
        "token": req.get("X-Authorization")
    };

    let values = [venue_data.venue_id, venue_data.token];


    Venue.getOne(values, function (displayData, result, err) {


        if (result === 404){
            res.statusMessage = 'Not Found';
            res.status(404)
                .send();

        } else {
            res.status(200).json(displayData);
        }
    });


};
