const venues = require('../controllers/venue.controller');


module.exports = function (app) {
    app.route(app.rootUrl + '/venues')
        .get(venues.list)
        .post(venues.create);

    app.route('/api/v1/venues/:id')
        .get(venues.read)
        .patch(venues.update);


    app.route('/api/v1/categories')
        .get(venues.listCategories);


};