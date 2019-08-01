const Venue_photo = require('../models/venue_photo.model');




exports.create = function(req, res) {


    if ((req.file !== undefined && req.body.description === undefined) ||
        (req.file !== undefined && (req.body.makePrimary !== "true" && req.body.makePrimary !== "false"))) {
        res.statusMessage = 'Bad Request';
        res.status(400)
            .send();
    } else if (req.get("X-Authorization") === null || req.get("X-Authorization") == 0 || req.get("X-Authorization") === undefined ){
        res.statusMessage = 'Unauthorized';
        res.status(401)
            .send();

    } else {

        let venue_id = req.params.id;
        let description = req.body.description;
        let makePrimary = req.body.makePrimary;
        let photoBuffer = req.file.buffer;
        let token = req.get("X-Authorization");

        let content_type = req.file.mimetype.split('/').pop();

        if (content_type === "jpg") {
            content_type = "jpeg";
        }

        let values = [venue_id, description, makePrimary, content_type, photoBuffer, token];

        Venue_photo.post( values,function (result, err) {

            if (result === 201) {
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


exports.read = function(req, res) {


    let venue_id = req.params.id;
    let token = req.get("X-Authorization");
    let photo_name = req.params.photoFilename;

    let values = [venue_id, token, photo_name];


    Venue_photo.readOne( values,function (picture, result, err) {
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



