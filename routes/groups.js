// DESCRIPTION:    Virtual services REST & SOAP
// MAINTAINER:     Didier Kimès <didier.kimes@gmail.com>

'use strict'

var debug = require('debug')('imock:server:routes:groups')
var express = require('express')
var groups = require('../models/groups')
var util = require('../models/util')
var router = express.Router()

// List of groups
router.get('/', function (req, res, next) {
    var locals = res.locals

    // Get list of groups
    groups.list(req, function (reply) {
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