// DESCRIPTION:    Virtual services REST & SOAP
// MAINTAINER:     Didier Kimès <didier.kimes@gmail.com>

'use strict'

const VERSION = '0.0.1'

var debug = require('debug')('imock:server:routes:tools')
var express = require('express')
var util = require('../models/util')
var tools = require('../models/tools')
var router = express.Router()
var action = ''

router.get('/', function (req, res, next) {
    action = req.baseUrl.match(/\/api\/tools\/(.*)/)[1]

    if (action == 'version') {
        return next(util.getMessage(200, 'Version: ' + VERSION))
    }
})

router.post('/', function (req, res, next) {
    action = req.baseUrl.match(/\/api\/tools\/(.*)/)[1]

    if (action == 'clean') {
        // Delete all keys
        tools.clean(req, function (reply) {
            return next(reply)
        })

    } else if (action == 'purge') {
        // Delete old request response pairs
        tools.purge(req, function (reply) {
            return next(reply)
        })

    } else if (action == 'import') {
        // Import datasets (require filter path)
        tools.import(req, function (reply) {
            return next(reply)
        })

    } else {
        // No command found
        return next(util.getMessage(404, 'Command not found'))
    }

})

module.exports = router