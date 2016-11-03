// DESCRIPTION:    Virtual services REST & SOAP
// MAINTAINER:     Didier Kimès <didier.kimes@gmail.com>

'use strict'

var debug = require('debug')('imock:server:routes:responses')
var express = require('express')
var responses = require('../models/responses')
var util = require('../models/util')
var router = express.Router()

// Create response
router.post('/', function (req, res, next) {
    var data = req.body
    var campaign = req.baseUrl.match(/\/api\/response\/(.*)/)[1]

    // {path} must be not empty
    if (data.path != null && data.path != undefined) {
        // Create response object and store to redis database
        responses.create(req, campaign, data, function (reply) {
            return next(reply)
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
        responses.modify(req, campaign, data, function (reply) {
            return next(reply)
        })

    } else {
        return next(util.getMessage(500, 'Empty service name'))
    }
})

// Delete response
router.delete('/', function (req, res, next) {
    var data = req.body
    var campaign = req.baseUrl.match(/\/api\/response\/(.*)/)[1]

    // {path} must be not empty
    if (data.path != null && data.path != undefined) {
        // Delete service and responses
        responses.delete(req, campaign, data, function (reply) {
            return next(reply)
        })

    } else {
        return next(util.getMessage(500, 'Empty service name'))
    }
})

// Display response details or list of responses 
router.get('/', function (req, res, next) {
    var locals = res.locals
    var campaign = req.baseUrl.match(/\/api\/responses?\/(.*)/)[1]

    // Response details or list of response
    if (req.query.search != null && req.query.search != undefined) {
        // Get detail response
        responses.detail(req, campaign, function (reply) {
            if (reply.status == 200) {
                locals.status = 200
                locals.payload = reply.message
                next()
            } else {
                return next(reply)
            }
        })

    } else {
        // Get list of response
        responses.list(req, campaign, function (reply) {
            if (reply.status == 200) {
                locals.status = 200
                locals.payload = reply.message
                next()
            } else {
                return next(reply)
            }
        })
    }
})

module.exports = router