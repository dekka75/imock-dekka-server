// DESCRIPTION:    Virtual services REST & SOAP
// MAINTAINER:     Didier Kimès <didier.kimes@gmail.com>

var debug = require('debug')('imock:server:models:groups')
var util = require('../models/util')

/**
 * 
 * List of groups
 * 
 * @param {object} req
 * @param {string} campaign
 * @param {function} callback
 */
module.exports.list = function (req, campaign, done) {
    var client = req.app.locals.redis

    var hash = '/api/campaigns/' + campaign

    // Sort in ascending order
    client.sort(hash, 'ALPHA', function (err, list) {
        if (err) {
            done(util.getMessage(500, 'Internal Server Error'))

        } else if (list.length > 0) {
            // Return campaigns list
            done(util.getMessage(200, JSON.stringify(list)))

        } else {
            done(util.getMessage(404, 'Empty list'))
        }
    })
}