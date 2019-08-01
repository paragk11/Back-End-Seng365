const users = require('../controllers/user.controller');


module.exports = function (app) {
    app.route(app.rootUrl + '/users')
        .post(users.create);

    app.route('/api/v1/users/:id')
        .get(users.read) //need auth **
        .patch(users.update); //need auth **


    app.route('/api/v1/users/login')
        .post(users.login);


    app.route('/api/v1/users/logout')
        .post(users.logout); //need auth**

    app.route('/api/v1/users/:id/photo')
        .put(users.putPhoto)
        .get(users.getPhoto)
        .delete(users.deletePhoto);


};