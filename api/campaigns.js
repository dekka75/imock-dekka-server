// DESCRIPTION:    Virtual services REST & SOAP
// MAINTAINER:     Didier Kimès <didier.kimes@gmail.com>

'use strict'

var debug = require('debug')('imock:server:api:list')
var express = require('express')
var redis = require('redis')
var util = require('../util')
var router = express.Router()

// List of campaigns
router.get('/', function (req, res, next) {
    var locals = res.locals
    var client = req.app.locals.redis

    var campaign = req.baseUrl.match(/\/api\/campaigns\/(.*)/)[1]

    // Sort in ascending order
    client.sort('/api/campaigns/' + campaign, 'ALPHA', function (err, list) {
        if (err) {
            return next(util.getMessage(500, 'List not found'))
        } else {
            if (list.length > 0) {
                locals.status = 200
                locals.payload = JSON.stringify(list)
                return next()
            } else {
                return next(util.getMessage(404, 'Empty list'))
            }
        }
    })
})

module.exports = router