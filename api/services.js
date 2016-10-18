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
            name: '/' + campaign + req.body.name,
            designation: (req.body.designation != null && req.body.designation !== undefined) ? req.body.designation : 'foo',
            group: (req.body.group != null && req.body.group !== undefined) ? req.body.group : 'others',
            atrribut: (req.body.atrribut != null && req.body.atrribut !== undefined) ? req.body.atrribut : 'nokey',
            contentType: (req.body.contentType != null && req.body.contentType !== undefined) ? req.body.contentType : 'application/json; charset=UTF-8',
            status: (req.body.status != null && req.body.status !== undefined) ? req.body.status : 200,
            response: (req.body.response != null && req.body.response !== undefined) ? req.body.response : '{}',
            real: (req.body.real != null && req.body.real !== undefined) ? req.body.real : 0,
            producers: (req.body.producers != null && req.body.producers !== undefined) ? req.body.producers : 'noproducer',
            min: (req.body.min != null && req.body.min !== undefined) ? req.body.min : 100,
            max: (req.body.max != null && req.body.max !== undefined) ? req.body.max : 200,
        }

        // Service already exist ?
        client.hgetall(service.name, function (err, name) {
            if (name != null && name !== undefined) {
                sendBody(req, res, 500, '{"code": "ECHEC", "message": "Service already exist"}')
            } else {
                // Periste service object in redis database
                client.hmset(service.name, service)

                // Periste relations
                client.sadd('/api/groups', service.group);
                client.sadd('/api/groups/' + service.group, campaign);
                client.sadd('/api/groups/' + service.group + '/' + campaign, service.name);

                sendBody(req, res, 201, '{"code": "SUCCESS", "message": "Service create"}')
            }
        })
    } else {
        sendBody(req, res, 500, '{"code": "ECHEC", "message": "List not found"}')
    }
})

// List of services
router.get('/', function (req, res, next) {
    var client = req.app.locals.redis

    var group = req.originalUrl.match(/\/api\/services\/(.*)\/.*/)[1]

    var campaign = req.originalUrl.match(/\/api\/services\/.*\/(.*)/)[1]

    // Sort in ascending order
    client.sort('/api/groups/' + group + '/' + campaign, 'ALPHA', function (err, list) {
        if (err) {
            debug(err)
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
    if (req.app.get('env') !== 'production') {
        res.set('Access-Control-Allow-Origin', '*')
    }
    res.set('X-Powered-By', 'Intelligent Mock <!/^.*$/!>')
    res.set('Content-Type', 'application/json; charset=UTF-8')
    res.set('Cache-Control', 'public, max-age=0')

    res.status(status)

    res.send(body)
}

module.exports = router