// DESCRIPTION:    Virtual services REST & SOAP
// MAINTAINER:     Didier Kimès <didier.kimes@gmail.com>

'use strict'

const MOCK = 0
const REAL = 1

var debug = require('debug')('imock:server:routes:imock')
var express = require('express')
var request = require("request")
var randexp = require('randexp')
var util = require('../models/util')

var router = express.Router()
var beginAt

// All Methods (POST, GET, PUT, DELETE, ...)
router.all('/', function (req, res, next) {
    // Begin at
    beginAt = new Date().getTime()

    // Redis
    var client = req.app.locals.redis

    // Search service details
    client.hgetall(req.baseUrl, function (err, service) {
        if (service != null && service != undefined) {
            var mode = parseInt(service.real, 10)
            if (mode == REAL) {
                // Real services
                var uri = service.producer + req.originalUrl.match(/\/[A-Z-a-z-0-9]{3,}(\/.*)/)[1] // Without Version
                var headers = req.headers

                // Basic Authentification
                if (service.auth != null && service.auth != undefined && req.get('Authorization') == undefined) {
                    var auth = "Basic " + new Buffer(service.auth).toString("base64")
                    headers["Authorization"] = auth
                }
                // Call options
                var options = {
                    uri: uri,
                    method: req.method,
                    headers: headers,
                    timeout: 180000, // Time out : 3 * 60 * 1000
                    followRedirect: true
                }

                // Convert to json or xml
                if (req.method == 'POST') {
                    if (/application\/json/.test(req.get('content-type'))) {
                        options['body'] = JSON.stringify(req.body)
                    } else {
                        options['body'] = req.rawBody
                    }
                }
                // Call real service
                request(options, function (err, response, body) {
                    if (err) {
                        sendBody(client, mode, req, res, null, '{"code": "ERROR","description": "Connection error"}', 'No response from producer')
                    } else {
                        var headers = response.headers
                        delete headers['Content-Length']
                        delete headers['transfer-encoding']
                        res.set(headers)
                        res.status(response.statusCode)
                        sendBody(client, mode, req, res, service, body)
                    }
                })

            } else {
                // Mock service
                var hash = '/' + service.campaign + service.path
                var min = parseInt(service.min, 10)
                var max = parseInt(service.max, 10)
                    // Calculate response time
                var tdr = Math.floor(parseInt(min) + (Math.random() * (max - min)))

                // Hash to find response
                for (var key in service) {
                    if (key.indexOf('attribut') != -1) {
                        hash += getKeyValue(req, service[key])
                    }
                }
                // No response, return default
                if (hash == '/' + service.campaign + service.path) {
                    // Return default response
                    sleep(tdr, service.response, function (body) {
                        sendBody(client, mode, req, res, service, body)
                    })
                } else {
                    // Search response
                    client.hgetall(hash, function (err, response) {
                        if (response != null && response != undefined) {
                            sleep(tdr, response.response, function (body) {
                                sendBody(client, mode, req, res, response, body)
                            })
                        } else {
                            sendBody(client, mode, req, res, null, '{"code": "ERROR","description": "Response not found"}', 'Response not found: ' + hash)
                        }
                    })
                }
            }

        } else {
            sendBody(client, MOCK, req, res, null, '{"code": "ERROR","description": "Service not found"}', 'Service not found: ' + req.baseUrl)
        }
    })
})

/**
 * 
 * Retrieve value of attribut in request 
 * 
 * @param {Object} req
 * @param {string} key
 * @returns {string}
 */
function getKeyValue(req, key) {
    // TODO: check key or replace eval by req.body[property]
    if (key != null && key != undefined) {
        try {
            var val
            if (req.method == 'POST') {
                if (/application\/json/.test(req.get('content-type'))) {
                    val = eval('req.body.' + key)
                } else {
                    val = util.getItemValue(req.body, key)
                }
            } else {
                val = eval('req.query.' + key)
            }
            if (val != null && val != undefined) {
                // Convert to string
                val += ''
                if (val == val.toString() && val.indexOf(":") != -1) {
                    var kv = val.split(":")
                    val = kv[1]
                }
                return '/' + val
            }
        } catch (e) {
            throw e
        }
    }
    return ''
}

/**
 * 
 * Renderer body and simulate response of service
 * 
 * @param {number} tdr
 * @param {string} body
 * @param {function} done
 */
function sleep(tdr, body, done) {
    // Render response
    var render = body
    var re = /<!([^!>]+)!>/g // <!regex!>
    var coolstring
    while ((coolstring = re.exec(body)) != null) {
        render = render.replace(/<!([^!>]+)!>/, new randexp(coolstring[1]).gen())
    }
    while (new Date().getTime() < beginAt + tdr) {
        // Simulate response of service
    }
    done(render)
}

/**
 * 
 * Return response to consumers
 * 
 * @param {string} mode
 * @param {Object} req
 * @param {Object} res
 * @param {Object} service
 * @param {string} body
 * @param {string} mess
 */
function sendBody(client, mode, req, res, service, body, mess) {
    if (mode == MOCK) {
        // TODO: Don't take content-type from request 
        if (/application\/json/.test(req.get('content-type'))) {
            res.set('Content-Type', 'application/json; charset=UTF-8')
        } else {
            res.set('Content-Type', 'text/xml; charset=UTF-8')
        }
        res.set('X-Powered-By', 'Intelligent Mock <!/^.*$/!>')
        res.set('Cache-Control', 'public, max-age=0')

        // TODO: Don't take status from request 
        if (mess != null && mess != undefined) {
            res.status(500)
        } else {
            res.status(200)
        }

    } else if (mode == REAL && mess != null && mess != undefined) {
        res.set('Content-Type', 'application/json; charset=UTF-8')
    }

    // Send response
    res.send(body)
    if (mess != null) {
        debug(mess)
    }

    if (service != null && service != undefined) {
        // Get request response pair
        var rrp = getRequestResponsePair(mode, beginAt, req, res, service, body)

        // Save request response pair objet and relations
        client.multi()
            // Persist request response pair object in redis database
            .hmset('/' + rrp.campaign + rrp.path, rrp)
            // Persist relations
            .sadd('/api/rrp/' + rrp.campaign + rrp.url, '/' + rrp.campaign + rrp.path)
            .exec(function (err, replies) {})

        // Bunyan (for asynchrone log)
        var traffic = req.app.locals.traffic

        // Log request response pair
        traffic.info(rrp, 'traffic')
    }
}

/**
 * 
 * Generate json object request response pair
 * 
 * 1) Use for view rest and soap exchange
 * 2) Use for log rest and soap exchange
 * 
 * @param {string} mode
 * @param {Date} beginAt
 * @param {Object} req
 * @param {Object} res
 * @param {Object} service
 * @param {Object} resBody
 * @returns {Object}
 */
function getRequestResponsePair(mode, beginAt, req, res, service, resBody) {
    var group = ''
    var campaign = ''
    var path = ''
    var url = ''
    var query = ''
    var endAt = new Date().getTime()
    var duration = endAt - beginAt
    var uid = 'rrp-' + Math.floor(Math.random() * 10) + parseInt(beginAt).toString(36).toUpperCase()
    var consumers = req.get('host').match('/^https?:\/\//') ? req.get('host') : 'http://' + req.get('host')
    var producer = ''
    var reqBody = ''

    var rrp = {}
    try {
        campaign = req.baseUrl.match(/\/([A-Z-a-z-0-9-_]{3,})\/.*/)[1]
        url = req.baseUrl.match(/\/[A-Z-a-z-0-9-_]{3,}(\/.*)/)[1]
        query = req.originalUrl.match(/\/[A-Z-a-z-0-9-_]{3,}\/[A-Z-a-z-0-9-_]{3,}\/[A-Z-a-z-0-9-_]{3,}\/.*\?(.*)/)[1]

    } catch (e) {
        // TODO: Manage error
    }

    if (service != null && service != undefined) {
        group = service.group
        path = url + '/' + uid
        if (service.producer != null && service.producer != undefined) {
            producer = service.producer
        }
    } else {
        path = '/NoServiceFound/' + uid
    }

    if (JSON.stringify(req.body) != '{}') {
        // TODO: dont take content-type from request
        if (/application\/json/.test(req.get('content-type'))) {
            reqBody = JSON.stringify(req.body)
        } else {
            reqBody = req.rawBody
        }
    }

    // Response - request pair
    var rrp = {
        group: group,
        campaign: campaign,
        path: path,
        mode: mode,
        consumers: consumers,
        producer: producer,
        method: req.method,
        status: res.statusCode,
        url: url,
        query: query,
        reqHeaders: JSON.stringify(req.headers),
        reqContentType: req.get('Content-Type'),
        reqLength: reqBody.length,
        reqBody: reqBody,
        resHeaders: JSON.stringify(res._headers),
        resContentType: res.get('Content-Type'),
        resLength: resBody.length,
        resBody: resBody,
        start: beginAt.toString(),
        stop: endAt.toString(),
        duration: duration
    }

    return rrp
}

module.exports = router