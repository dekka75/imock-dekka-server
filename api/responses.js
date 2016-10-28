// DESCRIPTION:    Virtual services REST & SOAP
// MAINTAINER:     Didier Kimès <didier.kimes@gmail.com>

'use strict'

var debug = require('debug')('imock:server:api:services')
var trace = require('util')
var express = require('express')
var redis = require('redis')
var util = require('../util')
var router = express.Router()

// Create response
router.post('/', function (req, res, next) {
    var client = req.app.locals.redis

    // TODO: Catch evaluation of regular expresion
    var data = req.body
    var campaign = req.baseUrl.match(/\/api\/response\/(.*)/)[1]

    // {path} must be not empty
    if (data.path != null && data.path !== undefined) {
        // Create response object and store to redis database
        var response = {
            campaign: (campaign != null && campaign !== undefined) ? campaign : 'default',
            path: (data.path != null && data.path !== undefined) ? data.path : '/INBound/OUTBound/default/0',
            response: (data.response != null && data.response !== undefined) ? data.response : '{"code":"ECHEC","message":"No response found"}',
        }

        var hash = '/' + response.campaign + response.path

        client.hgetall(hash, function (err, currentResponse) {
            if (currentResponse == null || currentResponse == undefined) {
                // Retrieve path of service
                var path = response.path.match(/(\/[A-Z-a-z-0-9-_]{3,}\/[A-Z-a-z-0-9-_]{3,}\/[A-Z-a-z-0-9-_]{3,})\/.*/)[1]

                client.multi()
                    // Perist response object in redis database
                    .hmset(hash, response)
                    // Perist relations
                    .sadd('/api/responses/' + response.campaign + path, hash)
                    .exec(function (err, replies) {
                        if (err) {
                            util.sendBody(req, res, 500, 'ECHEC', 'Error system')
                        } else {
                            util.sendBody(req, res, 201, 'SUCCESS', 'Service create')
                        }
                    })

            } else {
                util.sendBody(req, res, 500, 'ECHEC', 'Response already exist')
            }
        })

    } else {
        util.sendBody(req, res, 500, 'ECHEC', 'Empty response path')
    }
})

// Modify response
router.put('/', function (req, res, next) {
    var client = req.app.locals.redis

    var data = req.body
    var campaign = req.baseUrl.match(/\/api\/response\/(.*)/)[1]
    var hash = '/' + campaign + data.path
    var attributs = []

    // Find response
    client.hgetall(hash, function (err, currentResponse) {
        if (currentResponse != null && currentResponse != undefined) {
            // Add attributs to Array from redis object, use for delete hash
            for (var attr in currentResponse) {
                attributs.push(attr)
            }

            var response = {
                campaign: campaign,
                path: data.path,
                response: (data.response != null && data.response !== undefined) ? data.response : currentResponse.response,
            }

            // Modify responses and relations
            client.multi()
                // Perist response object in redis database
                .hmset(hash, response)
                .exec(function (err, replies) {
                    if (err) {
                        util.sendBody(req, res, 500, 'ECHEC', 'Error system')
                    } else {
                        util.sendBody(req, res, 200, 'SUCCESS', 'Service update')
                    }
                })

        } else {
            util.sendBody(req, res, 500, 'ECHEC', 'Response not found')
        }
    })
})

// Delete response
router.delete('/', function (req, res, next) {
    var client = req.app.locals.redis

    var data = req.body
    var campaign = req.baseUrl.match(/\/api\/response\/(.*)/)[1]
    var hash = '/' + campaign + data.path
    var attributs = []

    // Find response
    client.hgetall(hash, function (err, currentResponse) {
        if (currentResponse != null && currentResponse != undefined) {
            // Add attributs to Array
            for (var s in currentResponse) {
                attributs.push(s)
            }

            // Retrieve path of service
            var path = currentResponse.path.match(/(\/[A-Z-a-z-0-9-_]{3,}\/[A-Z-a-z-0-9-_]{3,}\/[A-Z-a-z-0-9-_]{3,})\/.*/)[1]

            // Delete response and relations
            client.multi()
                // Delete hash
                .hdel(hash, attributs)
                // Delete relations
                .srem('/api/responses/' + campaign + path, hash)
                .exec(function (err, replies) {
                    if (err) {
                        util.sendBody(req, res, 500, 'ECHEC', 'Error system')
                    } else {
                        util.sendBody(req, res, 200, 'SUCCESS', 'Service deleted')
                    }
                })

        } else {
            util.sendBody(req, res, 500, 'ECHEC', 'Service not found')
        }
    })
})

// Display list of responses or response informations
router.get('/', function (req, res, next) {
    var client = req.app.locals.redis

    var campaign = req.baseUrl.match(/\/api\/responses?\/(.*)/)[1]
    var path = JSON.parse(req.query.path).path

    // List of response or response informations
    if (req.query.search == null || req.query.search == undefined) {

        // Sort in ascending order
        client.sort('/api/responses/' + campaign + path, 'ALPHA', function (err, list) {
            if (err) {
                util.sendBody(req, res, 500, 'ECHEC', 'List not found')
            } else {
                if (list.length > 0) {
                    util.sendBody(req, res, 200, JSON.stringify(list))
                } else {
                    util.sendBody(req, res, 404, 'ECHEC', 'Empty list')
                }
            }
        })

    } else {
        // Return response content
        var search = req.query.search
        var hash = '/' + campaign + path + '/' + search

        // Find response
        client.hgetall(hash, function (err, currentResponse) {
            if (currentResponse != null && currentResponse != undefined) {
                util.sendBody(req, res, 200, JSON.stringify(currentResponse))
            } else {
                util.sendBody(req, res, 404, 'ECHEC', 'Response not found')
            }
        })
    }
})

module.exports = router