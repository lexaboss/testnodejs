'use strict';

module.exports = (req, res, next) => {
    if (req.session.auth_token) {
        next();
    } else {
       res.status(403);
    }
};