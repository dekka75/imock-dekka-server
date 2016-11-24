// DESCRIPTION:    Virtual services REST & SOAP
// MAINTAINER:     Didier Kimès <didier.kimes@gmail.com>

var debug = require('debug')('imock:server:models:services')
var util = require('../models/util')

/**
 * 
 * Persist service and relations
 * 
 * @param {object} req
 * @param {string} campaign
 * @param {object} data
 * @param {function} callback
 */
module.exports.create = function (req, campaign, data, done) {
    var client = req.app.locals.redis

    // Create service object and store to redis database
    var service = {
        campaign: (campaign != null && campaign != undefined) ? campaign : 'default',
        path: (data.path != null && data.path != undefined) ? data.path : '/INBound/OUTBound/default',
        name: (data.name != null && data.name != undefined) ? data.name : 'unknow',
        designation: (data.designation != null && data.designation != undefined) ? data.designation : 'foo',
        group: (data.group != null && data.group != undefined) ? data.group : 'others',
        attribut: (data.attribut != null && data.attribut != undefined) ? data.attribut : 'no',
        contentType: (data.contentType != null && data.contentType != undefined) ? data.contentType : 'application/json; charset=UTF-8',
        status: (data.status != null && data.status != undefined) ? data.status : 200,
        response: (data.response != null && data.response != undefined) ? data.response : '{"foo":"bar"}',
        real: (data.real != null && data.real != undefined) ? data.real : 0,
        producer: (data.producer != null && data.producer != undefined) ? data.producer : 'no',
        min: (data.min != null && data.min != undefined) ? data.min : 100,
        max: (data.max != null && data.max != undefined) ? data.max : 200
    }

    // Service name
    var hash = '/' + service.campaign + service.path

    client.hgetall(hash, function (err, currentService) {
        if (err) {
            done(util.getMessage(500, 'Internal Server Error'))

        } else if (currentService != null && currentService != undefined) {
            done(util.getMessage(500, 'Service already exist'))

        } else {
            // Create service & relations
            client.multi()
                // Persist service object in redis database
                .hmset(hash, service)
                // Persist relations
                .sadd('/api/groups', service.group)
                .sadd('/api/campaigns/' + service.group, campaign)
                .sadd('/api/services/' + campaign, hash)
                .exec(function (err, replies) {
                    if (err) {
                        done(util.getMessage(500, 'Internal Server Error'))
                    } else {
                        done(util.getMessage(201, 'Service create'))
                    }
                })
        }
    })
}

/**
 * 
 * Modify service and relations
 * 
 * @param {object} req
 * @param {string} campaign
 * @param {object} data
 * @param {function} callback
 */
module.exports.modify = function (req, campaign, data, done) {
    var client = req.app.locals.redis

    var attributs = []
    var service = {}

    var hash = '/' + campaign + data.path

    // Find service to construct attributs Array
    client.hgetall(hash, function (err, currentService) {
        if (err) {
            done(util.getMessage(500, 'Internal Server Error'))

        } else if (currentService == null || currentService == undefined) {
            done(util.getMessage(404, 'Service not found'))

        } else {
            // Add attributs to Array from redis object, use for delete hash
            for (var attr in currentService) {
                attributs.push(attr)
            }

            // Service object
            service = {
                campaign: campaign,
                path: data.path,
                name: (data.name != null && data.name != undefined) ? data.name : currentService.name,
                designation: (data.designation != null && data.designation != undefined) ? data.designation : currentService.designation,
                group: (data.group != null && data.group != undefined) ? data.group : currentService.group,
                attribut: (data.attribut != null && data.attribut != undefined) ? data.attribut : currentService.attribut,
                contentType: (data.contentType != null && data.contentType != undefined) ? data.contentType : currentService.contentType,
                status: (data.status != null && data.status != undefined) ? data.status : currentService.status,
                response: (data.response != null && data.response != undefined) ? data.response : currentService.response,
                real: (data.real != null && data.real != undefined) ? data.real : currentService.real,
                producer: (data.producer != null && data.producer != undefined) ? data.producer : currentService.producer,
                min: (data.min != null && data.min != undefined) ? data.min : currentService.min,
                max: (data.max != null && data.max != undefined) ? data.max : currentService.max
            }

            // Save service and relations
            client.multi()
                // Persist service object in redis database
                .hmset(hash, service)
                // Delete current relations
                .srem('/api/groups', currentService.group)
                .srem('/api/campaigns/' + currentService.group, campaign)
                // Persist relations
                .sadd('/api/groups', service.group)
                .sadd('/api/campaigns/' + service.group, campaign)
                .exec(function (err, replies) {
                    if (err) {
                        done(util.getMessage(500, 'Internal Server Error'))

                    } else {
                        done(util.getMessage(200, 'Service update'))
                    }
                })
        }
    })
}

/**
 * 
 * Delete service and relations
 * 
 * @param {object} req
 * @param {string} campaign
 * @param {object} data
 * @param {function} callback
 */
module.exports.delete = function (req, campaign, data, done) {
    var client = req.app.locals.redis

    // path du service
    var path = data.path
    var hashService = '/' + campaign + path
    var hashResponse = ''
    var attributs = []

    // Delete service
    client.hgetall(hashService, function (err, currentService) {
        if (err) {
            done(util.getMessage(500, 'Internal Server Error'))

        } else if (currentService == null || currentService == undefined) {
            done(util.getMessage(404, 'Service not found'))

        } else {
            // Add attributs to Array
            for (var s in currentService) {
                attributs.push(s)
            }

            // Delete service and relations
            client.multi()
                .hdel(hashService, attributs)
                // Delete relations
                .srem('/api/groups', currentService.group)
                .srem('/api/campaigns/' + currentService.group, campaign)
                .srem('/api/services/' + campaign, hashService)
                .exec(function (err, replies) {
                    if (err) {
                        done(util.getMessage(500, 'Internal Server Error'))

                    } else {
                        // Retrieve all reponses to delete
                        client.sort('/api/responses/' + campaign + path, 'ALPHA', function (err, responses) {
                            if (err) {
                                done(util.getMessage(500, 'Internal Server Error'))

                            } else if (responses.length == 0) {
                                done(util.getMessage(404, 'Response not found'))

                            } else {
                                // Delete all responses
                                responses.forEach(function (reply, i) {
                                    client.hgetall(reply, function (err, currentResponse) {
                                        if (err) {
                                            done(util.getMessage(500, 'Internal Server Error'))

                                        } else if (currentResponse == null || currentResponse == undefined) {
                                            done(util.getMessage(404, 'Response not found'))

                                        } else {
                                            hashResponse = '/' + currentResponse.campaign + currentResponse.path

                                            // Add attributs to Array
                                            for (var s in currentResponse) {
                                                attributs.push(s)
                                            }

                                            // Delete responses and relations
                                            client.multi()
                                                .hdel(hashResponse, attributs)
                                                // Delete relations
                                                .srem('/api/responses/' + campaign + path, hashResponse)
                                                .exec(function (err, replies) {
                                                    if (err) {
                                                        done(util.getMessage(500, 'Internal Server Error'))

                                                    } else if (i == (responses.length - 1)) {
                                                        done(util.getMessage(200, 'Response deleted'))
                                                    }
                                                })
                                        }
                                    })
                                })
                            }
                        })
                    }
                })
        }
    })
}

/**
 * 
 * Service details
 * 
 * @param {object} req
 * @param {string} campaign
 * @param {function} callback
 */
module.exports.detail = function (req, campaign, done) {
    var client = req.app.locals.redis

    var path = JSON.parse(req.query.path).path
    var hash = '/' + campaign + path

    // Find service
    client.hgetall(hash, function (err, currentService) {
        if (err) {
            done(util.getMessage(500, 'Internal Server Error'), null)

        } else if (currentService != null && currentService != undefined) {
            // Return service content
            done(null, util.getMessage(200, JSON.stringify(currentService)))

        } else {
            done(util.getMessage(404, 'Service not found'), null)

        }
    })
}

/**
 * 
 * List of service
 * 
 * @param {object} req
 * @param {string} group
 * @param {function} callback
 */
module.exports.list = function (req, group, done) {
    var client = req.app.locals.redis

    // Get all services for a group
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
 * Return all services for a group
 * 
 * @param {object} req
 * @param {string} group
 * @param {function} callback
 */
module.exports.detailList = function (req, group, done) {
    var client = req.app.locals.redis

    var servicesList = []

    client.sort('/api/groups', 'ALPHA', function (err, groups) {
        if (err || groups.length == 0) {
            done(err, servicesList)

        } else {
            // Groups list
            groups.forEach(function (reply, i) {
                client.sort('/api/campaigns/' + reply, 'ALPHA', function (err, campaigns) {
                    if (err || campaigns.length == 0) {
                        done(err, servicesList)

                    } else {
                        // Campaign list for a groups
                        campaigns.forEach(function (reply, j) {
                            client.sort('/api/services/' + reply, 'ALPHA', function (err, services) {
                                if (err || services.length == 0) {
                                    done(util.getMessage(500, 'Internal Server Error'), servicesList)

                                } else {
                                    // Services list for a campaign
                                    services.forEach(function (reply, k) {
                                        // Get service details
                                        client.hgetall(reply, function (err, currentService) {
                                            if (err) {
                                                done(util.getMessage(500, 'Internal Server Error'), servicesList)

                                            } else if (currentService == null || currentService == undefined) {
                                                done(util.getMessage(404, 'Service not found'))

                                            } else {
                                                if (group == 'all' || group == currentService.group) {
                                                    servicesList.push(currentService)
                                                }
                                                if (i == (groups.length - 1) && j == (campaigns.length - 1) && k == (services.length - 1)) {
                                                    done(null, servicesList)

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
}