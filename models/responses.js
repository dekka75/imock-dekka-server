// DESCRIPTION:    Virtual services REST & SOAP
// MAINTAINER:     Didier Kimès <didier.kimes@gmail.com>

var debug = require('debug')('imock:server:models:responses')
var util = require('../models/util')

/**
 * 
 * Persist response and relations
 * 
 * @param {object} req
 * @param {string} campaign
 * @param {object} data
 * @param {function} callback
 */
module.exports.create = function (req, campaign, data, done) {
    var client = req.app.locals.redis

    // Create response object and store to redis database
    var response = {
        campaign: (campaign != null && campaign != undefined) ? campaign : 'default',
        group: (data.group != null && data.group != undefined) ? data.group : 'default',
        path: (data.path != null && data.path != undefined) ? data.path : '/INBound/OUTBound/default/0',
        response: (data.response != null && data.response != undefined) ? data.response : '{"code":"ECHEC","message":"No response found"}',
    }

    var hash = '/' + response.campaign + response.path

    client.hgetall(hash, function (err, currentResponse) {
        if (err) {
            done(util.getMessage(500, 'Internal Server Error'))

        } else if (currentResponse != null && currentResponse != undefined) {
            done(util.getMessage(500, 'Response already exist'))

        } else {
            // Retrieve path of service
            var path = response.path.match(/(\/[A-Z-a-z-0-9-_]{3,}\/[A-Z-a-z-0-9-_]{3,}\/[A-Z-a-z-0-9-_]{3,})\/.*/)[1]

            client.multi()
                // Persist response object in redis database
                .hmset(hash, response)
                // Persist relations
                .sadd('/api/responses/' + response.campaign + path, hash)
                .exec(function (err, replies) {
                    if (err) {
                        done(util.getMessage(500, 'Internal Server Error'))

                    } else {
                        done(util.getMessage(201, 'Response create'))
                    }
                })
        }
    })
}

/**
 * 
 * Modify response and relations
 * 
 * @param {object} req
 * @param {string} campaign
 * @param {object} data
 * @param {function} callback
 */
module.exports.modify = function (req, campaign, data, done) {
    var client = req.app.locals.redis

    var attributs = []
    var hash = '/' + campaign + data.path

    // Find response
    client.hgetall(hash, function (err, currentResponse) {
        if (err) {
            done(util.getMessage(500, 'Internal Server Error'))

        } else if (currentResponse == null || currentResponse == undefined) {
            done(util.getMessage(404, 'Response not found'))

        } else {
            // Add attributs to Array from redis object, use for delete hash
            for (var attr in currentResponse) {
                attributs.push(attr)
            }

            var response = {
                campaign: campaign,
                group: data.group,
                path: data.path,
                response: (data.response != null && data.response != undefined) ? data.response : currentResponse.response,
            }

            // Modify responses and relations
            client.multi()
                // Persist response object in redis database
                .hmset(hash, response)
                .exec(function (err, replies) {
                    if (err) {
                        done(util.getMessage(500, 'Internal Server Error'))

                    } else {
                        done(util.getMessage(200, 'Response update'))

                    }
                })
        }
    })
}

/**
 * 
 * Delete response and relations
 * 
 * @param {object} req
 * @param {string} campaign
 * @param {object} data
 * @param {function} callback
 */
module.exports.delete = function (req, campaign, data, done) {
    var client = req.app.locals.redis

    var data = req.body
    var campaign = req.baseUrl.match(/\/api\/response\/(.*)/)[1]
    var attributs = []

    // path of response
    var hash = '/' + campaign + data.path

    // Find response
    client.hgetall(hash, function (err, currentResponse) {
        if (err) {
            done(util.getMessage(500, 'Internal Server Error'))

        } else if (currentResponse == null || currentResponse == undefined) {
            done(util.getMessage(404, 'Response not found'))

        } else {
            // Retrieve path of service
            var path = currentResponse.path.match(/(\/[A-Z-a-z-0-9-_]{3,}\/[A-Z-a-z-0-9-_]{3,}\/[A-Z-a-z-0-9-_]{3,})\/.*/)[1]

            // Add attributs name to Array
            for (var s in currentResponse) {
                attributs.push(s)
            }

            // Delete response and relations
            client.multi()
                // Delete hash
                .hdel(hash, attributs)
                // Delete relations
                .srem('/api/responses/' + campaign + path, hash)
                .exec(function (err, replies) {
                    if (err) {
                        done(util.getMessage(500, 'Internal Server Error'))
                    } else {
                        done(util.getMessage(200, 'Response deleted'))

                    }
                })
        }
    })
}

/**
 * 
 * Response details
 * 
 * @param {object} req
 * @param {string} campaign
 * @param {function} callback
 */
module.exports.detail = function (req, campaign, done) {
    var client = req.app.locals.redis

    var path = JSON.parse(req.query.path).path
    var search = req.query.search
    var hash = '/' + campaign + path + '/' + search

    // Find response
    client.hgetall(hash, function (err, currentResponse) {
        if (err) {
            done(util.getMessage(500, 'Internal Server Error'))

        } else if (currentResponse != null && currentResponse != undefined) {
            // Return response content
            done(util.getMessage(200, JSON.stringify(currentResponse)))

        } else {
            done(util.getMessage(404, 'Response not found'))
        }
    })
}

/**
 * 
 * List of response
 * 
 * @param {object} req
 * @param {string} campaign
 * @param {function} callback
 */
module.exports.list = function (req, campaign, done) {
    var client = req.app.locals.redis

    var path = JSON.parse(req.query.path).path
    var hash = '/api/responses/' + campaign + path

    // Sort in ascending order
    client.sort(hash, 'ALPHA', function (err, list) {
        if (err) {
            done(util.getMessage(500, 'Internal Server Error'))

        } else if (list.length > 0) {
            // Return response list
            done(util.getMessage(200, JSON.stringify(list)))

        } else {
            done(util.getMessage(404, 'Empty list'))

        }
    })
}