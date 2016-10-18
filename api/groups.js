// DESCRIPTION:    Virtual services REST & SOAP
// MAINTAINER:     Didier Kimès <didier.kimes@gmail.com>

'use strict'

var trace = require('util')
var debug = require('debug')('imock:server:api:list')
var express = require('express')
var redis = require('redis')
var router = express.Router()

// List of groups
router.get('/', function (req, res, next) {
    var client = req.app.locals.redis

    // Sort in ascending order
    client.sort('/api/groups', 'ALPHA', function (err, list) {
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