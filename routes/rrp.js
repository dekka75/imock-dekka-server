// DESCRIPTION:    Virtual services REST & SOAP
// MAINTAINER:     Didier Kimès <didier.kimes@gmail.com>

'use strict'

var debug = require('debug')('imock:server:routes:rrp')
var express = require('express')
var services = require('../models/rrp')
var util = require('../models/util')
var router = express.Router()

// Return request response pairs details 
router.get('/', function (req, res, next) {
    var locals = res.locals
    var filter = req.baseUrl.match(/\/api\/rrps?\/(.*)/)[1] // (.*) => group or campaign

    if (req.query.path != null && req.query.path != undefined) {
        // One request response pair details
        rrp.detail(req, filter, function (err, reply) {
            if (reply.status == 200) {
                locals.status = 200
                locals.payload = reply.message
                next()
            } else {
                return next(reply)
            }
        })

    } else {
        // All request response pairs details for all group or a group
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