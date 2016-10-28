// DESCRIPTION:    Virtual services REST & SOAP
// MAINTAINER:     Didier Kimès <didier.kimes@gmail.com>

'use strict'

const EXPIRE = 1 * 60 * 1000 // 1 minute
const CLEAN = 'clean'
const PURGE = 'purge'
const IMPORT = 'import'

var debug = require('debug')('imock:server:api:tools')
var trace = require('util')
var express = require('express')
var redis = require('redis')
var util = require('../util')
var router = express.Router()

// Modify service
router.post('/', function (req, res, next) {
    var client = req.app.locals.redis
    var rrpList = []
    var attributs = []
    var hashResponse = ''
    var rrpPath = ''
    var action = ''

    action = req.baseUrl.match(/\/api\/tools\/(.*)/)[1]

    if (action == CLEAN) {
        // Delete all keys
        client.flushdb(function (err, succeeded) {
            util.sendBody(req, res, 200, 'SUCCESS', 'Action execute')
        });

    } else if (action == PURGE) {
        // Retrieve request response pair
        requestResponsePairList(req, 'all', 'all', 'all', function (rrp) {
            rrp.forEach(function (reply, i) {
                client.hgetall(reply, function (err, currentRrp) {
                    if (currentRrp != null && currentRrp != undefined) {
                        var start = new Date().setTime(currentRrp.start)
                        var now = new Date().getTime()

                        // Delete request response pairs expire
                        if (now > start + EXPIRE) {
                            hashResponse = '/' + currentRrp.campaign + currentRrp.path
                            rrpPath = hashResponse.match(/\/([A-Z-a-z-0-9-_]{3,}\/[A-Z-a-z-0-9-_]{3,}\/[A-Z-a-z-0-9-_]{3,}\/[A-Z-a-z-0-9-_]{3,})\/.*/)[1]

                            // Add attributs to Array
                            var attributs = []
                            for (var s in currentRrp) {
                                attributs.push(s)
                            }

                            // Delete request response pair hash and relations
                            client.multi()
                                // Delete hash
                                .hdel(hashResponse, attributs)
                                // Delete relations
                                .srem('/api/rrp/' + rrpPath, hashResponse)
                                .exec(function (err, replies) {})
                        }
                    }
                    if (i == (rrp.length - 1)) {
                        util.sendBody(req, res, 200, 'SUCCESS', 'Action execute')
                    }
                })
            })
        })

    } else if (ation == IMPORT) {

        // Import datanase sets
        util.sendBody(req, res, 200, 'SUCCESS', 'Action execute')

    } else {
        // No command found
        util.sendBody(req, res, 500, 'ECHEC', 'Action not found')
    }

})

/**
 * 
 * Return all request response pair
 * 
 */
function requestResponsePairList(req, group, campaign, path, done) {
    var client = req.app.locals.redis

    var rrpList = []

    // Retrieve all request reponse pairs
    client.sort('/api/groups', 'ALPHA', function (err, groups) {
        if (!err && groups.length > 0) {
            groups.forEach(function (reply, i) {
                client.sort('/api/campaigns/' + reply, 'ALPHA', function (err, campaigns) {
                    if (!err && campaigns.length > 0) {
                        campaigns.forEach(function (reply, j) {
                            client.sort('/api/services/' + reply, 'ALPHA', function (err, services) {
                                if (!err && services.length > 0) {
                                    services.forEach(function (reply, k) {
                                        client.sort('/api/rrp' + reply, 'ALPHA', function (err, rrp) {
                                            if (!err && rrp.length > 0) {
                                                rrp.forEach(function (reply, l) {
                                                    rrpList.push(reply)
                                                    if (i == (groups.length - 1) && j == (campaigns.length - 1) && k == (services.length - 1) && l == (rrp.length - 1)) {
                                                        done(rrpList)
                                                    }
                                                })
                                            } else {
                                                done([])
                                            }
                                        })
                                    })
                                } else {
                                    done([])
                                }
                            })
                        })
                    } else {
                        done([])
                    }
                })
            })
        } else {
            done([])
        }
    })
}

module.exports = router