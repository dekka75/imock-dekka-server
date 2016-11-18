// DESCRIPTION:    Virtual services REST & SOAP
// MAINTAINER:     Didier Kimès <didier.kimes@gmail.com>

var fs = require('fs');
var yaml = require('js-yaml')

const EXPIRE = 2 * 60 * 1000 // 2 minutes

var debug = require('debug')('imock:server:models:tools')
var services = require('../models/services')
var responses = require('../models/responses')
var util = require('../models/util')

/**
 * 
 * Clean : delete all keys
 * 
 * @param {object} req
 * @param {function} callback
 */
module.exports.clean = function (req, done) {
    var client = req.app.locals.redis

    // Delete all keys
    client.flushdb(function (err, succeeded) {
        if (err) {
            done(util.getMessage(500, 'Internal Server Error'))

        } else {
            done(util.getMessage(200, 'Clean execute'))

        }
    })
}

/**
 * 
 * Purge : delete old request response pairs
 * 
 * @param {object} req
 * @param {function} callback
 */
module.exports.purge = function (req, done) {
    // Retrieve request response pair
    requestResponsePairList(req, 'all', 'all', 'all', function (rrps) {
        if (rrps.length == 0) {
            done(util.getMessage(404, 'Request response pair not found'))

        } else {
            rrps.forEach(function (rrp, i) {
                requestResponsePairDelete(req, rrp, function (reply) {
                    if (i == (rrps.length - 1)) {
                        done(util.getMessage(200, 'Purge execute'))

                    }
                })
            })
        }
    })
}

/**
 * 
 * Import : Initialize datasets
 * 
 * @param {object} req
 * @param {function} callback
 */
module.exports.import = function (req, done) {
    var filter = JSON.parse(req.query.filter).data

    fs.readdir("./datasets", function (err, files) {
        if (err) {
            done(util.getMessage(404, 'File(s) not found'))

        } else {
            // .yaml filter
            files = files
                .filter(function (file) {
                    if (file.match(filter)) {
                        return true
                    } else {
                        return false
                    }
                })
                .sort()

            // Import datasets
            files.forEach(function (file, i) {
                try {
                    // Get datasets, or throw exception on error
                    var datasets = yaml.safeLoad(fs.readFileSync("./datasets/" + file, 'utf8'))
                    var campaign = datasets.infos.campaign

                    // Loop services
                    datasets.services.forEach(function (service, j) {
                        // Ignore header infos
                        service.designation = (service.designation != null && service.designation != undefined) ? service.designation : datasets.infos.designation
                        service.group = (service.group != null && service.group != undefined) ? service.group : datasets.infos.group

                        // Create service object and store to redis database
                        services.create(req, campaign, service, function (reply) {
                            if (service.responses == null && service.responses == undefined) {
                                service.responses = []
                            }

                            // Loop responses
                            service.responses.forEach(function (response, k) {
                                response.group = service.group

                                // Create response object and store to redis database
                                responses.create(req, campaign, response, function (reply) {})
                            })

                            if (i == (files.length - 1) && j == (datasets.services.length - 1)) {
                                done(util.getMessage(200, 'Import execute'))
                            }
                        })
                    })

                } catch (e) {
                    done(util.getMessage(500, file + '\n ' + e.message))

                }
            })
        }
    })
}

/**
 * 
 * requestResponsePairDelete : delete old request response pairs
 * 
 * @param {object} req
 * @param {function} callback
 */
requestResponsePairDelete = function (req, rrp, done) {
    var client = req.app.locals.redis

    // Retrieve request response pair
    client.hgetall(rrp, function (err, currentRrp) {
        if (err) {
            done(util.getMessage(500, 'Internal Server Error'))

        } else if (currentRrp == null || currentRrp == undefined) {
            done(util.getMessage(404, 'Request response pair no found'))

        } else {
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
                    .exec(function (err, replies) {
                        if (err) {
                            done(util.getMessage(500, 'Internal Server Error'))

                        } else {
                            done(util.getMessage(200, 'Delete response request pair'))

                        }
                    })
            }
        }
    })
}

/**
 * 
 * Return all request response pair
 * 
 */
requestResponsePairList = function (req, group, campaign, path, done) {
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