// DESCRIPTION:    Virtual services REST & SOAP
// MAINTAINER:     Didier Kimès <didier.kimes@gmail.com>

'use strict'

var trace = require('util')
var debug = require('debug')('imock:server:api:services')
var express = require('express')
var redis = require('redis')
var util = require('../util')
var router = express.Router()

// Create service
router.post('/', function (req, res, next) {
    var client = req.app.locals.redis

    // TODO: Catch evaluation of regular expresion
    var data = req.body
    var campaign = req.baseUrl.match(/\/api\/response\/(.*)/)[1]

    // {name} must be not empty
    if (data.path != null && data.path !== undefined) {
        // Create service object and store to redis database
        var service = {
            campaign: (campaign != null && campaign !== undefined) ? campaign : 'default',
            path: (data.path != null && data.path !== undefined) ? data.path : '/INBound/OUTBound/default/0',
            response: (data.response != null && data.response !== undefined) ? data.response : '{"code":"ECHEC","message":"No response found"}',
        }

        var hash = '/' + service.campaign + service.path

        client.hgetall(hash, function (err, currentService) {
            if (currentService == null || currentService == undefined) {
                // Retrieve path of service
                var path = service.path.match(/(\/[A-Z-a-z-0-9-_]{3,}\/[A-Z-a-z-0-9-_]{3,}\/[A-Z-a-z-0-9-_]{3,})\/.*/)[1]

                client.multi()
                    // Perist service object in redis database
                    .hmset(hash, service)
                    // Perist relations
                    .sadd('/api/responses/' + service.campaign + path, hash)
                    .exec(function (err, replies) {
                        if (err) {
                            util.sendBody(req, res, 500, 'ECHEC', 'Error system')
                        } else {
                            util.sendBody(req, res, 201, 'SUCCESS', 'Service create')
                        }
                    })

            } else {
                util.sendBody(req, res, 500, 'ECHEC', 'Service already exist')
            }
        })

    } else {
        util.sendBody(req, res, 500, 'ECHEC', 'Empty service name')
    }
})

// Modify service
router.put('/', function (req, res, next) {
    var client = req.app.locals.redis

    var data = req.body
    var campaign = req.baseUrl.match(/\/api\/response\/(.*)/)[1]
    var hash = '/' + campaign + data.path
    var attributs = []
    var service = {}

    // Find service to construct attributs Array
    client.hgetall(hash, function (err, currentService) {
        if (currentService != null && currentService != undefined) {
            var currentGroup = currentService.group

            // Add attributs to Array from redis object, use for delete hash
            for (var attr in currentService) {
                attributs.push(attr)
            }

            // hash service object
            service = {
                campaign: campaign,
                path: data.path,
                response: (data.response != null && data.response !== undefined) ? data.response : currentService.response,
            }

            // hash service and relations
            client.multi()
                // Perist service object in redis database
                .hmset(hash, service)
                .exec(function (err, replies) {
                    if (err) {
                        util.sendBody(req, res, 500, 'ECHEC', 'Error system')
                    } else {
                        util.sendBody(req, res, 200, 'SUCCESS', 'Service update')
                    }
                })

        } else {
            util.sendBody(req, res, 500, 'ECHEC', 'Service not found')
        }
    })
})

// Delete service
router.delete('/', function (req, res, next) {
    var client = req.app.locals.redis

    var data = req.body
    var campaign = req.baseUrl.match(/\/api\/response\/(.*)/)[1]
    var hash = '/' + campaign + data.path
    var attributs = []

    // Find service to construct attributs Array
    client.hgetall(hash, function (err, currentService) {
        if (currentService != null && currentService != undefined) {
            // Add attributs to Array
            for (var s in currentService) {
                attributs.push(s)
            }

            // Retrieve path of service
            var path = currentService.path.match(/(\/[A-Z-a-z-0-9-_]{3,}\/[A-Z-a-z-0-9-_]{3,}\/[A-Z-a-z-0-9-_]{3,})\/.*/)[1]

            // Delete service hash and relations
            client.multi()
                // Delete hash
                .hdel(hash, attributs)
                // Delete relations
                .srem('/api/response/' + campaign + path, hash)
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

// Display list of services or service informations
router.get('/', function (req, res, next) {
    var client = req.app.locals.redis

    var campaign = req.baseUrl.match(/\/api\/responses?\/(.*)/)[1]
    var path = JSON.parse(req.query.path).path

    // List of services or service informations
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

        // Find service
        client.hgetall(hash, function (err, currentService) {
            if (currentService != null && currentService != undefined) {
                util.sendBody(req, res, 200, JSON.stringify(currentService))
            } else {
                util.sendBody(req, res, 404, 'ECHEC', 'Response not found')
            }
        })
    }
})

module.exports = router