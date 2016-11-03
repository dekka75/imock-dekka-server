// DESCRIPTION:    Virtual services REST & SOAP
// MAINTAINER:     Didier Kimès <didier.kimes@gmail.com>

var debug = require('debug')('imock:server:models:groups')
var util = require('../models/util')

/**
 * 
 * List of groups
 * 
 * @param {object} req
 * @param {function} callback
 */
module.exports.list = function (req, done) {
    var client = req.app.locals.redis

    var hash = '/api/groups'

    // Sort in ascending order
    client.sort(hash, 'ALPHA', function (err, list) {
        if (err) {
            done(util.getMessage(500, 'Internal Server Error'))

        } else if (list.length > 0) {
            // Return groups list
            done(util.getMessage(200, JSON.stringify(list)))

        } else {
            done(util.getMessage(404, 'Empty list'))

        }
    })
}