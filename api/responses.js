// DESCRIPTION:    Virtual services REST & SOAP
// MAINTAINER:     Didier Kimès <didier.kimes@gmail.com>

'use strict'

var debug = require('debug')('imock:server:api:services')
var express = require('express')
var redis = require('redis')
var util = require('../util')
var router = express.Router()

// Create response
router.post('/', function (req, res, next) {
    var data = req.body
    var campaign = req.baseUrl.match(/\/api\/response\/(.*)/)[1]

    // {path} must be not empty
    if (data.path != null && data.path != undefined) {
        // Create response object and store to redis database
        createResponse(req, campaign, data, function (reply) {
            return next(util.getMessage(reply.status, reply.message))
        })

    } else {
        return next(util.getMessage(500, 'Empty response name'))
    }
})

// Modify response
router.put('/', function (req, res, next) {
    var data = req.body
    var campaign = req.baseUrl.match(/\/api\/response\/(.*)/)[1]

    // {path} must be not empty
    if (data.path != null && data.path != undefined) {
        // Modify service object
        modifyResponse(req, campaign, data, function (reply) {
            return next(util.getMessage(reply.status, reply.message))
        })

    } else {
        return next(util.getMessage(500, 'Empty service name'))
    }
})

// Delete response
router.delete('/', function (req, res, next) {
    var client = req.app.locals.redis

    var data = req.body
    var campaign = req.baseUrl.match(/\/api\/response\/(.*)/)[1]
    var attributs = []

    // path of response
    var hash = '/' + campaign + data.path

    // Find response
    client.hgetall(hash, function (err, currentResponse) {
        if (err) {
            return next(util.getMessage(500, 'Internal Server Error'))
        }
        if (currentResponse == null || currentResponse == undefined) {
            return next(util.getMessage(404, 'Response not found'))
        }

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
                    return next(util.getMessage(500, 'Internal Server Error'))
                } else {
                    return next(util.getMessage(200, 'Response deleted'))
                }
            })

    })
})

// Display response informations or list of responses 
router.get('/', function (req, res, next) {
    var locals = res.locals
    var client = req.app.locals.redis

    var campaign = req.baseUrl.match(/\/api\/responses?\/(.*)/)[1]
    var path = JSON.parse(req.query.path).path

    // List of response or response informations
    if (req.query.search != null && req.query.search != undefined) {
        // Return response content
        var search = req.query.search
        var hash = '/' + campaign + path + '/' + search

        // Find response
        client.hgetall(hash, function (err, currentResponse) {
            if (currentResponse != null && currentResponse != undefined) {
                locals.status = 200
                locals.payload = JSON.stringify(currentResponse)
                return next()
            } else {
                return next(util.getMessage(404, 'Response not found'))
            }
        })

    } else {
        // Sort in ascending order
        client.sort('/api/responses/' + campaign + path, 'ALPHA', function (err, list) {
            if (err) {
                return next(util.getMessage(500, 'Internal Server Error'))
            } else {
                if (list.length > 0) {
                    locals.status = 200
                    locals.payload = JSON.stringify(list)
                    return next()
                } else {
                    return next(util.getMessage(404, 'List not found'))
                }
            }
        })
    }
})

/**
 * 
 * Persist response and relations
 * 
 * @param {object} req
 * @param {string} campaign
 * @param {object} data
 * @param {function} callback
 */
function createResponse(req, campaign, data, done) {
    var client = req.app.locals.redis

    // Create response object and store to redis database
    var response = {
        campaign: (campaign != null && campaign != undefined) ? campaign : 'default',
        path: (data.path != null && data.path != undefined) ? data.path : '/INBound/OUTBound/default/0',
        response: (data.response != null && data.response != undefined) ? data.response : '{"code":"ECHEC","message":"No response found"}',
    }

    var hash = '/' + response.campaign + response.path

    client.hgetall(hash, function (err, currentResponse) {
        if (err) {
            done({
                status: 500,
                message: 'Internal Server Error'
            })

        } else if (currentResponse != null && currentResponse != undefined) {
            done({
                status: 500,
                message: 'Response already exist'
            })

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
                        done({
                            status: 500,
                            message: 'Internal Server Error'
                        })
                    } else {
                        done({
                            status: 201,
                            message: 'Response create'
                        })
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
function modifyResponse(req, campaign, data, done) {
    var client = req.app.locals.redis

    var attributs = []
    var hash = '/' + campaign + data.path

    // Find response
    client.hgetall(hash, function (err, currentResponse) {
        if (err) {
            done({
                status: 500,
                message: 'Internal Server Error'
            })

        } else if (currentResponse == null || currentResponse == undefined) {
            done({
                status: 404,
                message: 'Response not found'
            })

        } else {
            // Add attributs to Array from redis object, use for delete hash
            for (var attr in currentResponse) {
                attributs.push(attr)
            }

            var response = {
                campaign: campaign,
                path: data.path,
                response: (data.response != null && data.response != undefined) ? data.response : currentResponse.response,
            }

            // Modify responses and relations
            client.multi()
                // Persist response object in redis database
                .hmset(hash, response)
                .exec(function (err, replies) {
                    if (err) {
                        done({
                            status: 500,
                            message: 'Internal Server Error'
                        })
                    } else {
                        done({
                            status: 200,
                            message: 'Response update'
                        })
                    }
                })
        }
    })
}

module.exports = router