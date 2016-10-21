// DESCRIPTION:    Virtual services REST & SOAP
// MAINTAINER:     Didier Kimès <didier.kimes@gmail.com>

'use strict'

var trace = require('util')
var debug = require('debug')('imock:server:api:services')
var express = require('express')
var redis = require('redis')
var router = express.Router()

// Create service
router.post('/', function (req, res, next) {
    var client = req.app.locals.redis

    // Campaign name
    var campaign = req.originalUrl.match(/\/api\/services\/(.*)/)[1]

    // {name} must be not empty
    if (req.body.name != null && req.body.name !== undefined) {
        // Create service object and store to redis database
        var service = {
            name: req.body.name,
            group: (req.body.group != null && req.body.group !== undefined) ? req.body.group : 'others',
            campaign: campaign,
            designation: (req.body.designation != null && req.body.designation !== undefined) ? req.body.designation : 'foo',
            attribut: (req.body.attribut != null && req.body.attribut !== undefined) ? req.body.attribut : 'no',
            contentType: (req.body.contentType != null && req.body.contentType !== undefined) ? req.body.contentType : 'application/json; charset=UTF-8',
            status: (req.body.status != null && req.body.status !== undefined) ? req.body.status : 200,
            response: (req.body.response != null && req.body.response !== undefined) ? req.body.response : '{"foo":"bar"}',
            real: (req.body.real != null && req.body.real !== undefined) ? req.body.real : 0,
            producer: (req.body.producer != null && req.body.producer !== undefined) ? req.body.producer : 'no',
            min: (req.body.min != null && req.body.min !== undefined) ? req.body.min : 100,
            max: (req.body.max != null && req.body.max !== undefined) ? req.body.max : 200
        }
        var hash = '/' + service.group + '/' + service.campaign + service.name
        client.hgetall(hash, function (err, currentService) {
            if (currentService == null || currentService == undefined) {
                client.multi()
                    // Perist service object in redis database
                    .hmset(hash, service)
                    // Perist relations
                    .sadd('/api/groups', service.group)
                    .sadd('/api/groups/' + service.group, campaign)
                    .sadd('/api/groups/' + service.group + '/' + campaign, hash)
                    .exec(function (err, replies) {
                        if (err) {
                            sendBody(req, res, 500, '{"code": "ECHEC", "message": "Error system"}')
                        } else {
                            sendBody(req, res, 201, '{"code": "SUCCESS", "message": "Service create"}')
                        }
                    })

            } else {
                sendBody(req, res, 500, '{"code": "ECHEC", "message": "Service already exist"}')
            }
        })

    } else {
        sendBody(req, res, 500, '{"code": "ECHEC", "message": "Empty service name"}')
    }
})

// Modify service
router.put('/', function (req, res, next) {
    var client = req.app.locals.redis

    var group = req.body.group
    var campaign = req.originalUrl.match(/\/api\/services\/(.*)/)[1]
    var hash = '/' + group + '/' + campaign + req.body.name
    var currentGroup = ''
    var attributs = []
    var service = {}

    // Find service to construct attributs Array
    client.hgetall(hash, function (err, currentService) {
        if (currentService != null && currentService != undefined) {
            currentGroup = currentService.group

            // Add attributs to Array from redis object, use for delete hash
            for (var attr in currentService) {
                attributs.push(attr)
            }

            // hash service object
            service = {
                name: hash,
                designation: (req.body.designation != null && req.body.designation !== undefined) ? req.body.designation : currentService.designation,
                group: (req.body.group != null && req.body.group !== undefined) ? req.body.group : currentService.group,
                attribut: (req.body.attribut != null && req.body.attribut !== undefined) ? req.body.attribut : currentService.attribut,
                contentType: (req.body.contentType != null && req.body.contentType !== undefined) ? req.body.contentType : currentService.contentType,
                status: (req.body.status != null && req.body.status !== undefined) ? req.body.status : currentService.status,
                response: (req.body.response != null && req.body.response !== undefined) ? req.body.response : currentService.response,
                real: (req.body.real != null && req.body.real !== undefined) ? req.body.real : currentService.real,
                producer: (req.body.producer != null && req.body.producer !== undefined) ? req.body.producer : currentService.producer,
                min: (req.body.min != null && req.body.min !== undefined) ? req.body.min : currentService.min,
                max: (req.body.max != null && req.body.max !== undefined) ? req.body.max : currentService.max
            }

            // hash service and relations
            client.multi()
                // Perist service object in redis database
                .hmset(hash, service)
                // Delete current relations
                .srem('/api/groups', currentGroup)
                .srem('/api/groups/' + currentGroup, campaign)
                .srem('/api/groups/' + currentGroup + '/' + campaign, hash)
                // Perist relations
                .sadd('/api/groups', group)
                .sadd('/api/groups/' + group, campaign)
                .sadd('/api/groups/' + group + '/' + campaign, hash)
                .exec(function (err, replies) {
                    if (err) {
                        sendBody(req, res, 500, '{"code": "ECHEC", "message": "Error system"}')
                    } else {
                        sendBody(req, res, 200, '{"code": "SUCCESS", "message": "Service update"}')
                    }
                })

        } else {
            sendBody(req, res, 500, '{"code": "ECHEC", "message": "Service not found"}')
        }
    })
})

// Delete service
router.delete('/', function (req, res, next) {
    var client = req.app.locals.redis

    var campaign = req.originalUrl.match(/\/api\/services\/(.*)/)[1]
    var group = req.body.group
    var hash = '/' + group + '/' + campaign + req.body.name
    var attributs = []

    // Find service to construct attributs Array
    client.hgetall(hash, function (err, currentService) {
        if (currentService != null && currentService != undefined) {
            // Add attributs to Array
            for (var s in currentService) {
                attributs.push(s)
            }
            // Delete service hash and relations
            client.multi()
                // Delete hash
                .hdel(hash, attributs)
                // Delete relations
                .srem('/api/groups', group)
                .srem('/api/groups/' + group, campaign)
                .srem('/api/groups/' + group + '/' + campaign, hash)
                .exec(function (err, replies) {
                    if (err) {
                        sendBody(req, res, 500, '{"code": "ECHEC", "message": "Error system"}')
                    } else {
                        sendBody(req, res, 200, '{"code": "SUCCESS", "message": "Service deleted"}')
                    }
                })

        } else {
            sendBody(req, res, 500, '{"code": "ECHEC", "message": "Service not found"}')
        }
    })
})

// List of services
router.get('/', function (req, res, next) {
    var client = req.app.locals.redis

    var group = req.originalUrl.match(/\/api\/services\/(.*)\/.*/)[1]

    var campaign = req.originalUrl.match(/\/api\/services\/.*\/(.*)/)[1]

    // Sort in ascending order
    client.sort('/api/groups/' + group + '/' + campaign, 'ALPHA', function (err, list) {
        if (err) {
            sendBody(req, res, 500, '{"code": "ECHEC", "message": "List not found"}')
        } else {
            if (list.length > 0) {
                sendBody(req, res, 200, JSON.stringify(list))
            } else {
                sendBody(req, res, 404, '{"code": "ECHEC", "message": "Empty list"}')
            }
        }
    })
})

/**
 * 
 * Return response to consumers
 * 
 * @param {object} req
 * @param {object} res
 * @param {string} status
 * @param {string} body
 */
function sendBody(req, res, status, body) {
    // Headers
    if (req.app.get('env') != 'production') {
        res.set('Access-Control-Allow-Origin', '*')
    }
    res.set('X-Powered-By', 'Intelligent Mock <!/^.*$/!>')
    res.set('Content-Type', 'application/json; charset=UTF-8')
    res.set('Cache-Control', 'public, max-age=0')

    res.status(status)

    res.send(body)
}

module.exports = router