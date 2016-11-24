// DESCRIPTION:    Virtual services REST & SOAP
// MAINTAINER:     Didier Kimès <didier.kimes@gmail.com>

'use strict'

var debug = require('debug')('imock:server:routes:services')
var express = require('express')
var services = require('../models/services')
var util = require('../models/util')
var router = express.Router()

// Create service
router.post('/', function (req, res, next) {
    var data = req.body
    var campaign = req.baseUrl.match(/\/api\/service\/(.*)/)[1]

    // {path} must be not empty
    if (data.path != null && data.path != undefined) {
        // Create service object and store to redis database
        services.create(req, campaign, data, function (reply) {
            return next(reply)
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
        // Modify service object and store to redis database
        services.modify(req, campaign, data, function (reply) {
            return next(reply)
        })

    } else {
        return next(util.getMessage(500, 'Empty service name'))
    }
})

// Delete service and responses but not response resquest pairs
router.delete('/', function (req, res, next) {
    var data = req.body
    var campaign = req.baseUrl.match(/\/api\/service\/(.*)/)[1]

    // {path} must be not empty
    if (data.path != null && data.path != undefined) {
        // Delete service and responses
        services.modify(req, campaign, data, function (reply) {
            return next(reply)
        })

    } else {
        return next(util.getMessage(500, 'Empty service name'))
    }
})

// Return services details
router.get('/', function (req, res, next) {
    var locals = res.locals
    var filter = req.baseUrl.match(/\/api\/services?\/(.*)/)[1] // (.*) => group or campaign

    if (req.query.path != null && req.query.path != undefined) {
        // One service
        services.detail(req, filter, function (err, reply) {
            if (reply.status == 200) {
                locals.status = 200
                locals.payload = reply.message
                next()
            } else {
                return next(reply)
            }
        })

    } else {
        // All services details for all group or a group
        services.list(req, filter, function (err, reply) {
            if (err) {
                return next(err)
            } else {
                locals.status = 200
                locals.payload = reply.message
                next()
            }
        })
    }
})

module.exports = router