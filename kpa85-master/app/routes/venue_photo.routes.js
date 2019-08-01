const venue_photos = require('../controllers/venue_photo.controller');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({storage: storage});


module.exports = function (app) {

    app.route('/api/v1/venues/:id/photos')
        .post(upload.single('photo'), venue_photos.create);

    app.route('/api/v1/venues/:id/photos/:photoFilename')
        .get(venue_photos.read);
};