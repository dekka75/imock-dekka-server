// DESCRIPTION:    Virtual services REST & SOAP
// MAINTAINER:     Didier Kimès <didier.kimes@gmail.com>

'use strict'

var debug = require('debug')('imock:server:api:list')
var trace = require('util')
var express = require('express')
var redis = require('redis')
var util = require('../util')
var router = express.Router()

// List of groups
router.get('/', function (req, res, next) {
    var client = req.app.locals.redis

    // Sort in ascending order
    client.sort('/api/groups', 'ALPHA', function (err, list) {
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
})

module.exports = router