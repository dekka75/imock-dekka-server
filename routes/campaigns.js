// DESCRIPTION:    Virtual services REST & SOAP
// MAINTAINER:     Didier Kimès <didier.kimes@gmail.com>

'use strict'

var debug = require('debug')('imock:server:routes:campaign')
var express = require('express')
var groups = require('../models/campaigns')
var util = require('../models/util')
var router = express.Router()

// List of campaigns
router.get('/', function (req, res, next) {
    var locals = res.locals

    var campaign = req.baseUrl.match(/\/api\/campaigns\/(.*)/)[1]

    // Get list of groups
    groups.list(req, campaign, function (reply) {
        if (reply.status == 200) {
            locals.status = 200
            locals.payload = reply.message
            next()
        } else {
            return next(reply)
        }
    })
})

module.exports = router