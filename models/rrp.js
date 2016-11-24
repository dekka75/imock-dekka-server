// DESCRIPTION:    Virtual services REST & SOAP
// MAINTAINER:     Didier Kimès <didier.kimes@gmail.com>

var debug = require('debug')('imock:server:models:rrp')
var util = require('../models/util')

/**
 * 
 * Request response pairs details
 * 
 * @param {object} req
 * @param {string} campaign + path + idrrp
 * @param {function} callback
 */
module.exports.detail = function (req, campaign, done) {
    var client = req.app.locals.redis

    var path = JSON.parse(req.query.path).path
    var hash = '/' + campaign + path

    // Find request response pairs
    client.hgetall(hash, function (err, currentRrp) {
        if (err) {
            done(util.getMessage(500, 'Internal Server Error'), null)

        } else if (currentRrp != null && currentRrp != undefined) {
            // Return service content
            done(null, util.getMessage(200, JSON.stringify(currentRrp)))

        } else {
            done(util.getMessage(404, 'Service not found'), null)

        }
    })
}

/**
 * 
 * List of response pairs details
 * 
 * @param {object} req
 * @param {string} group
 * @param {function} callback
 */
module.exports.list = function (req, group, done) {
    var client = req.app.locals.redis

    // Get all response pairs details for all group or a group
    this.detailList(req, group, function (err, list) {
        if (err) {
            done(util.getMessage(500, 'Internal Server Error'), null)

        } else if (list.length > 0) {
            // Return services list
            done(null, util.getMessage(200, JSON.stringify(list)))

        } else {
            done(util.getMessage(404, 'Empty list'), null)

        }
    })
}

/**
 * 
 * Return all request response pairs for a group
 * 
 * @param {object} req
 * @param {string} group
 * @param {function} callback
 */
module.exports.detailList = function (req, group, done) {
    var client = req.app.locals.redis

    var rrpList = []

    client.sort('/api/groups', 'ALPHA', function (err, groups) {
        if (err || groups.length == 0) {
            done(err, rrpList)

        } else {
            // Groups list
            groups.forEach(function (reply, i) {
                client.sort('/api/campaigns/' + reply, 'ALPHA', function (err, campaigns) {
                    if (err || campaigns.length == 0) {
                        done(err, rrpList)

                    } else {
                        // Campaign list for a groups
                        campaigns.forEach(function (reply, j) {
                            client.sort('/api/services/' + reply, 'ALPHA', function (err, services) {
                                if (err || services.length == 0) {
                                    done(util.getMessage(500, 'Internal Server Error'), rrpList)

                                } else {
                                    // Services list for a campaign
                                    services.forEach(function (reply, k) {
                                        client.sort('/api/rrp' + reply, 'ALPHA', function (err, rrp) {
                                            if (err) {
                                                done(util.getMessage(500, 'Internal Server Error'), rrpList)

                                            } else if (rrp.length == 0) {
                                                if (i == (groups.length - 1) && j == (campaigns.length - 1) && k == (services.length - 1)) {
                                                    done(null, rrpList)

                                                }
                                            } else {
                                                // Request response pairs for a service
                                                rrp.forEach(function (reply, l) {

                                                    // Get Request response pairs details
                                                    client.hgetall(reply, function (err, cuurentRrp) {
                                                        if (err) {
                                                            done(util.getMessage(500, 'Internal Server Error'), rrpList)

                                                        } else if (cuurentRrp == null || cuurentRrp == undefined) {
                                                            done(util.getMessage(404, 'Request response pairs not found'))

                                                        } else {
                                                            if (group == 'all' || group == cuurentRrp.group) {
                                                                rrpList.push(cuurentRrp)
                                                            }
                                                            if (i == (groups.length - 1) && j == (campaigns.length - 1) && k == (services.length - 1) && l == (rrp.length - 1)) {
                                                                done(null, rrpList)

                                                            }
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
            })
        }
    })
}