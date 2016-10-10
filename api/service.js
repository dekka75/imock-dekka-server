// DESCRIPTION:    Virtual services REST & SOAP
// MAINTAINER:     Didier Kimès <didier.kimes@gmail.com>

var trace = require('util')
var debug = require('debug')('imock:server:api')
var express = require('express')
var redis = require('redis')
var router = express.Router()

// GET
router.get('/', function (req, res, next) {
})

module.exports = router