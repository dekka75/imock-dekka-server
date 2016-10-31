// DESCRIPTION:    Virtual services REST & SOAP
// MAINTAINER:     Didier Kimès <didier.kimes@gmail.com>

'use strict'

const VERSION = '0.0.1'
const EXPIRE = 2 * 60 * 1000 // 2 minutes

var debug = require('debug')('imock:server:api:tools')
var express = require('express')
var fs = require('fs');
var redis = require('redis')
var yaml = require('js-yaml')
var util = require('../util')
var router = express.Router()
var action = ''

router.get('/', function (req, res, next) {
    action = req.baseUrl.match(/\/api\/tools\/(.*)/)[1]

    if (action == 'version') {
        return next(util.getMessage(200, 'Version: ' + VERSION))
    }
})

router.post('/', function (req, res, next) {
    var client = req.app.locals.redis

    action = req.baseUrl.match(/\/api\/tools\/(.*)/)[1]

    if (action == 'clean') {
        // Delete all keys
        client.flushdb(function (err, succeeded) {
            return next(util.getMessage(200, 'Clean execute'))
        })

    } else if (action == 'purge') {
        // Retrieve request response pair
        requestResponsePairList(req, 'all', 'all', 'all', function (rrp) {
            if (rrp.length == 0) {
                return next(util.getMessage(404, 'List not found'))
            }
            rrp.forEach(function (reply, i) {
                client.hgetall(reply, function (err, currentRrp) {
                    if (err) {
                        return next(util.getMessage(500, 'Internal Server Error'))
                    }
                    if (currentRrp == null || currentRrp == undefined) {
                        var start = new Date().setTime(currentRrp.start)
                        var now = new Date().getTime()

                        // Delete request response pairs expire
                        if (now > start + EXPIRE) {
                            var hashResponse = '/' + currentRrp.campaign + currentRrp.path
                            var rrpPath = hashResponse.match(/\/([A-Z-a-z-0-9-_]{3,}\/[A-Z-a-z-0-9-_]{3,}\/[A-Z-a-z-0-9-_]{3,}\/[A-Z-a-z-0-9-_]{3,})\/.*/)[1]

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
                        return next(util.getMessage(200, 'Purge execute'))
                    }
                })
            })
        })

    } else if (action == 'import') {
        fs.readdir("./datasets", function (err, files) {
            if (err) {
                return next(util.getMessage(404, 'File(s) not found'))
            }
            files.forEach(function (file) {
                // Get datasets, or throw exception on error
                try {
                    var datasets = yaml.safeLoad(fs.readFileSync("./datasets/" + file, 'utf8'))
                    var campaign = datasets.info.campaign
                    var designation = datasets.designation
                    var group = datasets.info.group

                    datasets.services.forEach(function (service, i) {
                        // Create service
                        service.responses.forEach(function (response, i) {
                            // Create response
                            console.log(response)
                        })
                    })

                } catch (e) {
                    return next(util.getMessage(404, 'Files not found'))
                }
            }, '*.yaml')
        })

    } else {
        // No command found
        return next(util.getMessage(404, 'Command not found'))
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
        if (err || groups.length == 0) {
            done(rrpList)
        } else {
            groups.forEach(function (reply, i) {
                client.sort('/api/campaigns/' + reply, 'ALPHA', function (err, campaigns) {
                    if (err || campaigns.length == 0) {
                        done(rrpList)
                    } else {
                        campaigns.forEach(function (reply, j) {
                            client.sort('/api/services/' + reply, 'ALPHA', function (err, services) {
                                if (err || services.length == 0) {
                                    done(rrpList)
                                } else {
                                    services.forEach(function (reply, k) {
                                        client.sort('/api/rrp' + reply, 'ALPHA', function (err, rrp) {
                                            if (err || rrp.length == 0) {
                                                done(rrpList)
                                            } else {
                                                rrp.forEach(function (reply, l) {
                                                    rrpList.push(reply)
                                                    if (i == (groups.length - 1) && j == (campaigns.length - 1) && k == (services.length - 1) && l == (rrp.length - 1)) {
                                                        done(rrpList)
                                                    }
                                                })
                                            }
                                        })
                                    })
                                }
                            })
                        })
                    }
                })
            })
        }
    })
}

module.exports = router