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

    var data = req.body
    var campaign = req.baseUrl.match(/\/api\/service\/(.*)/)[1]

    // {path} must be not empty
    if (data.path != null && data.path !== undefined) {
        // Create service object and store to redis database
        var service = {
            campaign: (campaign != null && campaign !== undefined) ? campaign : 'default',
            path: (data.path != null && data.path !== undefined) ? data.path : '/default',
            designation: (data.designation != null && data.designation !== undefined) ? data.designation : 'foo',
            group: (data.group != null && data.group !== undefined) ? data.group : 'others',
            attribut: (data.attribut != null && data.attribut !== undefined) ? data.attribut : 'no',
            contentType: (data.contentType != null && data.contentType !== undefined) ? data.contentType : 'application/json; charset=UTF-8',
            status: (data.status != null && data.status !== undefined) ? data.status : 200,
            response: (data.response != null && data.response !== undefined) ? data.response : '{"foo":"bar"}',
            real: (data.real != null && data.real !== undefined) ? data.real : 0,
            producer: (data.producer != null && data.producer !== undefined) ? data.producer : 'no',
            min: (data.min != null && data.min !== undefined) ? data.min : 100,
            max: (data.max != null && data.max !== undefined) ? data.max : 200
        }

        var hash = '/' + service.campaign + service.path

        client.hgetall(hash, function (err, currentService) {
            if (currentService == null || currentService == undefined) {
                client.multi()
                    // Perist service object in redis database
                    .hmset(hash, service)
                    // Perist relations
                    .sadd('/api/groups', service.group)
                    .sadd('/api/campaigns/' + service.group, campaign)
                    .sadd('/api/services/' + campaign, hash)
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
    var campaign = req.baseUrl.match(/\/api\/service\/(.*)/)[1]
    var hash = '/' + campaign + data.path
    var attributs = []
    var service = {}

    // Find service to construct attributs Array
    client.hgetall(hash, function (err, currentService) {
        if (currentService != null && currentService != undefined) {
            // Add attributs to Array from redis object, use for delete hash
            for (var attr in currentService) {
                attributs.push(attr)
            }

            // Service object
            service = {
                campaign: campaign,
                path: data.path,
                designation: (data.designation != null && data.designation !== undefined) ? data.designation : currentService.designation,
                group: (data.group != null && data.group !== undefined) ? data.group : currentService.group,
                attribut: (data.attribut != null && data.attribut !== undefined) ? data.attribut : currentService.attribut,
                contentType: (data.contentType != null && data.contentType !== undefined) ? data.contentType : currentService.contentType,
                status: (data.status != null && data.status !== undefined) ? data.status : currentService.status,
                response: (data.response != null && data.response !== undefined) ? data.response : currentService.response,
                real: (data.real != null && data.real !== undefined) ? data.real : currentService.real,
                producer: (data.producer != null && data.producer !== undefined) ? data.producer : currentService.producer,
                min: (data.min != null && data.min !== undefined) ? data.min : currentService.min,
                max: (data.max != null && data.max !== undefined) ? data.max : currentService.max
            }

            // Save service and relations
            client.multi()
                // Perist service object in redis database
                .hmset(hash, service)
                // Delete current relations
                .srem('/api/groups', currentService.group)
                .srem('/api/campaigns/' + currentService.group, campaign)
                // Perist relations
                .sadd('/api/groups', service.group)
                .sadd('/api/campaigns/' + service.group, campaign)
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

// Delete service and responses
router.delete('/', function (req, res, next) {
    var client = req.app.locals.redis

    var data = req.body
    var campaign = req.baseUrl.match(/\/api\/service\/(.*)/)[1]
    var path = data.path
    var hashService = ''
    var hashResponse = ''

    // Retrieve all reponses to delete
    client.sort('/api/responses/' + campaign + path, 'ALPHA', function (err, list) {
        if (!err && list.length > 0) {
            // Delete responses
            for (var i = 0; i < list.length; i++) {
                // Find response
                client.hgetall(list[i], function (err, currentResponse) {
                    if (currentResponse != null && currentResponse != undefined) {
                        hashResponse = '/' + currentResponse.campaign + currentResponse.path

                        // Add attributs to Array
                        var attributs = []
                        for (var s in currentResponse) {
                            attributs.push(s)
                        }
                        // Delete service hash and relations
                        client.multi()
                            // Delete hash
                            .hdel(hashResponse, attributs)
                            // Delete relations
                            .srem('/api/responses/' + campaign + path, hashResponse)
                            .exec(function (err, replies) {
                                console.log(hashResponse)
                            })
                    }
                })
            }
        }
    })

    // Delete service
    hashService = '/' + campaign + path
    client.hgetall(hashService, function (err, currentService) {
        if (currentService != null && currentService != undefined) {

            // Add attributs to Array
            var attributs = []
            for (var s in currentService) {
                attributs.push(s)
            }
            // Delete service hash and relations
            client.multi()
                // Delete hash
                .hdel(hashService, attributs)
                // Delete relations
                .srem('/api/groups', currentService.group)
                .srem('/api/campaigns/' + currentService.group, campaign)
                .srem('/api/services/' + campaign, hashService)
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

    var campaign = req.baseUrl.match(/\/api\/services?\/(.*)/)[1]

    // List of services or service informations
    if (req.query.path == null || req.query.path == undefined) {

        // Sort in ascending order
        client.sort('/api/services/' + campaign, 'ALPHA', function (err, list) {
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
        // Return service content
        var path = JSON.parse(req.query.path).path
        var hash = '/' + campaign + path

        // Find service
        client.hgetall(hash, function (err, currentService) {
            if (currentService != null && currentService != undefined) {
                util.sendBody(req, res, 200, JSON.stringify(currentService))
            } else {
                util.sendBody(req, res, 404, 'ECHEC', 'Service not found')
            }
        })
    }
})

module.exports = router