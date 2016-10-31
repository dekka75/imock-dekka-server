// DESCRIPTION:    Virtual services REST & SOAP
// MAINTAINER:     Didier Kimès <didier.kimes@gmail.com>

'use strict'

var debug = require('debug')('imock:server:api:services')
var express = require('express')
var redis = require('redis')
var util = require('../util')
var router = express.Router()

// Create service
router.post('/', function (req, res, next) {
    var data = req.body
    var campaign = req.baseUrl.match(/\/api\/service\/(.*)/)[1]

    // {path} must be not empty
    if (data.path != null && data.path != undefined) {
        // Create service object and store to redis database
        util.createService(req, campaign, data, function (reply) {
            return next(util.getMessage(reply.status, reply.message))
        })

    } else {
        return next(util.getMessage(500, 'Empty service name'))
    }
})

// Modify service
router.put('/', function (req, res, next) {
    var data = req.body
    var campaign = req.baseUrl.match(/\/api\/service\/(.*)/)[1]

    // {path} must be not empty
    if (data.path != null && data.path != undefined) {
        // Modify service object
        modifyService(req, campaign, data, function (reply) {
            return next(util.getMessage(reply.status, reply.message))
        })

    } else {
        return next(util.getMessage(500, 'Empty service name'))
    }
})

// Delete service and responses but not response resquest pairs
router.delete('/', function (req, res, next) {
    var client = req.app.locals.redis

    var data = req.body
    var campaign = req.baseUrl.match(/\/api\/service\/(.*)/)[1]
    var attributs = []

    // path du service
    var path = data.path
    var hashService = '/' + campaign + path
    var hashResponse = ''

    // Delete service
    client.hgetall(hashService, function (err, currentService) {
        if (err) {
            return next(util.getMessage(500, 'Internal Server Error'))
        }
        if (currentService == null || currentService == undefined) {
            return next(util.getMessage(404, 'Service not found'))
        }

        // Add attributs to Array
        for (var s in currentService) {
            attributs.push(s)
        }

        // Delete service and relations
        client.multi()
            .hdel(hashService, attributs)
            // Delete relations
            .srem('/api/groups', currentService.group)
            .srem('/api/campaigns/' + currentService.group, campaign)
            .srem('/api/services/' + campaign, hashService)
            .exec(function (err, replies) {
                if (err) {
                    return next(util.getMessage(500, 'Internal Server Error'))
                }

                // Retrieve all reponses to delete
                client.sort('/api/responses/' + campaign + path, 'ALPHA', function (err, responses) {
                    if (err) {
                        return next(util.getMessage(500, 'Internal Server Error'))
                    }
                    if (responses.length == 0) {
                        return next(util.getMessage(404, 'Response not found'))
                    }

                    // Delete all responses
                    responses.forEach(function (reply, i) {
                        client.hgetall(reply, function (err, currentResponse) {
                            if (err) {
                                return next(util.getMessage(500, 'Internal Server Error'))
                            }
                            if (currentResponse == null || currentResponse == undefined) {
                                return next(util.getMessage(404, 'Response not found'))
                            }

                            hashResponse = '/' + currentResponse.campaign + currentResponse.path

                            // Add attributs to Array
                            for (var s in currentResponse) {
                                attributs.push(s)
                            }

                            // Delete responses and relations
                            client.multi()
                                .hdel(hashResponse, attributs)
                                // Delete relations
                                .srem('/api/responses/' + campaign + path, hashResponse)
                                .exec(function (err, replies) {
                                    if (err) {
                                        return next(util.getMessage(500, 'Internal Server Error'))
                                    }
                                    if (i == (responses.length - 1)) {
                                        return next(util.getMessage(200, 'Response deleted'))
                                    }
                                })
                        })
                    })
                })
            })
    })

})

// Display list of services or service informations
router.get('/', function (req, res, next) {
    var locals = res.locals
    var client = req.app.locals.redis
    var campaign = req.baseUrl.match(/\/api\/services?\/(.*)/)[1]

    // Service informations or list of services
    if (req.query.path != null && req.query.path != undefined) {
        // Return service content
        var path = JSON.parse(req.query.path).path
        var hash = '/' + campaign + path

        // Find service
        client.hgetall(hash, function (err, currentService) {
            if (currentService != null && currentService != undefined) {
                locals.status = 200
                locals.payload = JSON.stringify(currentService)
                return next()
            } else {
                return next(util.getMessage(404, 'Service not found'))
            }
        })

    } else {
        // Sort in ascending order
        client.sort('/api/services/' + campaign, 'ALPHA', function (err, list) {
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
 * Modify service and relations
 * 
 * @param {object} req
 * @param {string} campaign
 * @param {object} data
 * @param {function} callback
 */
function modifyService(req, campaign, data, done) {
    var client = req.app.locals.redis

    var attributs = []
    var service = {}

    var hash = '/' + campaign + data.path

    // Find service to construct attributs Array
    client.hgetall(hash, function (err, currentService) {
        if (err) {
            done({
                status: 500,
                message: 'Internal Server Error'
            })

        } else if (currentService == null || currentService == undefined) {
            done({
                status: 404,
                message: 'Service not found'
            })

        } else {
            // Add attributs to Array from redis object, use for delete hash
            for (var attr in currentService) {
                attributs.push(attr)
            }

            // Service object
            service = {
                campaign: campaign,
                path: data.path,
                designation: (data.designation != null && data.designation != undefined) ? data.designation : currentService.designation,
                group: (data.group != null && data.group != undefined) ? data.group : currentService.group,
                attribut: (data.attribut != null && data.attribut != undefined) ? data.attribut : currentService.attribut,
                contentType: (data.contentType != null && data.contentType != undefined) ? data.contentType : currentService.contentType,
                status: (data.status != null && data.status != undefined) ? data.status : currentService.status,
                response: (data.response != null && data.response != undefined) ? data.response : currentService.response,
                real: (data.real != null && data.real != undefined) ? data.real : currentService.real,
                producer: (data.producer != null && data.producer != undefined) ? data.producer : currentService.producer,
                min: (data.min != null && data.min != undefined) ? data.min : currentService.min,
                max: (data.max != null && data.max != undefined) ? data.max : currentService.max
            }

            // Save service and relations
            client.multi()
                // Persist service object in redis database
                .hmset(hash, service)
                // Delete current relations
                .srem('/api/groups', currentService.group)
                .srem('/api/campaigns/' + currentService.group, campaign)
                // Persist relations
                .sadd('/api/groups', service.group)
                .sadd('/api/campaigns/' + service.group, campaign)
                .exec(function (err, replies) {
                    if (err) {
                        done({
                            status: 500,
                            message: 'Internal Server Error'
                        })
                    } else {
                        done({
                            status: 200,
                            message: 'Service update'
                        })
                    }
                })
        }
    })
}

module.exports = router