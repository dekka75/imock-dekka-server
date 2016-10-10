// DESCRIPTION:    Virtual services REST & SOAP
// MAINTAINER:     Didier Kimès <didier.kimes@gmail.com>

var trace = require('util')
var debug = require('debug')('imock:server:router')
var express = require('express')
var redis = require('redis')
var request = require("request")
var randexp = require('randexp')
var util = require('../util')

var router = express.Router()
var beginAt

// All Method (POST, GET, PUT, DEL, ...)
router.all('/', function (req, res, next) {
    // Begin at
    beginAt = new Date().getTime()
    // Redis
    var client = req.app.locals.redis
    // Search service informations
    client.hgetall(req.baseUrl, function (err, service) {
        if (service != null && service !== undefined) {
            var real = parseInt(service.real, 10)
            if (real === 1) {
                // Real services
                var uri = service.producers + req.originalUrl.match(/\/[A-Z-a-z-0-9]{3,}(\/.*)/)[1] // Without Version
                var headers = req.headers
                // Basic Authentification
                if (service.auth != null && service.auth !== undefined && req.get('Authorization') === undefined) {
                    var auth = "Basic " + new Buffer(service.auth).toString("base64")
                    headers["Authorization"] = auth
                }
                // Call options
                var options = {
                    uri: uri,
                    method: req.method,
                    headers: headers,
                    timeout: 180000, // 3 * 60 * 1000
                    followRedirect: true
                }
                // JSON or XML
                if (req.method == 'POST') {
                    if (/application\/json/.test(req.get('content-type'))) {
                        options['body'] = JSON.stringify(req.body)
                    } else {
                        options['body'] = req.rawBody
                    }
                }
                // Call Service Real
                request(options, function (err, response, body) {
                    if (err) {
                        sendBody('real', req, res, service, '{"code": "ERROR","description": "Connection error"}', 'No response from producers')
                    } else {
                        var headers = response.headers
                        delete headers['Content-Length']
                        delete headers['transfer-encoding']
                        res.set(headers)
                        res.status(response.statusCode)
                        sendBody('real', req, res, service, body)
                    }
                })

            } else {
                // Mock service
                var hash = service.name
                var min = parseInt(service.min, 10)
                var max = parseInt(service.max, 10)
                var tdr

                // Hash for find response
                for (var key in service) {
                    if (key.indexOf('key') != -1) {
                        hash += getKeyValue(req, service[key])
                    }
                }
                if (service.name === hash) {
                    // Return default response
                    bs = service.body
                    tdr = Math.floor(parseInt(min) + (Math.random() * (max - min)))
                    sleep(tdr, bs, function (body) {
                        sendBody('mock', req, res, service, body)
                    })
                } else {
                    // Search response
                    client.hgetall(hash, function (err, response) {
                        if (response != null && response !== undefined) {
                            br = response.body
                            tdr = Math.floor(parseInt(min) + (Math.random() * (max - min)))
                            sleep(tdr, br, function (body) {
                                sendBody('mock', req, res, service, body)
                            })
                        } else {
                            sendBody('mock', req, res, service, '{"code": "ERROR","description": "Not response found"}', 'Not response found: ' + hash)
                        }
                    })
                }
            }
        } else {
            sendBody('mock', req, res, service, '{"code": "ERROR","description": "Not service found"}', 'Not service found: ' + req.baseUrl)
        }
    })
})

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
            if (val) {
                if (val === val.toString() && val.indexOf(":") != -1) {
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

function sleep(tdr, body, done) {
    // Render response
    var render = body
    var re = /<!([^!>]+)!>/g // <!regex!>
    var coolstring
    while ((coolstring = re.exec(body)) !== null) {
        render = render.replace(/<!([^!>]+)!>/, new randexp(coolstring[1]).gen())
    }
    while (new Date().getTime() < beginAt + tdr) {
        // Nothing todo
    }
    done(render)
}

function sendBody(mode, req, res, service, body, mess) {
    if (mode === 'mock') {
        // TODO: Don't take content-type from request 
        if (/application\/json/.test(req.get('content-type'))) {
            res.set('Content-Type', 'application/json; charset=UTF-8')
        } else {
            res.set('Content-Type', 'text/xml; charset=UTF-8')
        }
        res.set('X-Powered-By', 'Intelligent Mock <!/^.*$/!>')
        res.set('Cache-Control', 'public, max-age=0')
        if (mess != null && mess !== undefined) {
            res.status(500)
        } else {
            res.status(200)
        }
    } else if (mode === 'real' && mess != null && mess !== undefined) {
        res.set('Content-Type', 'application/json; charset=UTF-8')
    }
    // Send response
    res.send(body)
    if (mess != null) {
        debug(mess)
    }
    // Redis
    var client = req.app.locals.redis
    // Bunyan
    var traffic = req.app.locals.traffic

    // Get request response pair
    var rrp = getRequestResponsePair(mode, beginAt, req, res, service, body)

    // Save request response pair
    client.hmset(rrp.name, rrp)

    // Log request response pair
    traffic.info(rrp, 'traffic')
}

function getRequestResponsePair(mode, beginAt, req, res, service, resBody) {
    var endAt = new Date().getTime()
    var duration = endAt - beginAt
    var env = req.baseUrl.match(/\/([A-Z-a-z-0-9]{3,})\/.*/)[1]
    var url = req.baseUrl.match(/\/[A-Z-a-z-0-9]{3,}(\/.*)/)[1]
    var uid = 'rrp-' + Math.floor(Math.random() * 10) + parseInt(beginAt).toString(36).toUpperCase()
    var name = '/' + env + '/NoServiceFound/' + uid
    var consumers = req.get('host').match('/^https?:/\/\/') ? req.get('host') : 'http://' + req.get('host')
    var producers = ''
    var reqBody = ''
    if (service != null && service !== undefined) {
        name = service.name + '/' + uid
        if (service.producers != null && service.producers !== undefined) {
            producers = service.producers
        }
    }
    if (JSON.stringify(req.body) !== '{}') {
        if (/application\/json/.test(req.get('content-type'))) {
            reqBody = JSON.stringify(req.body)
        } else {
            reqBody = req.rawBody
        }
    }
    // Response - request pair
    var rrp = {
        name: name,
        env: env,
        start: beginAt.toString(),
        stop: endAt.toString(),
        mode: mode,
        consumers: consumers,
        producers: producers,
        method: req.method,
        status: res.statusCode,
        url: url,
        query: req.url,
        reqHeaders: JSON.stringify(req.headers),
        reqContentType: req.get('Content-Type'),
        reqLength: reqBody.length,
        reqBody: reqBody,
        resHeaders: JSON.stringify(res._headers),
        resContentType: res.get('Content-Type'),
        resLength: resBody.length,
        resBody: resBody,
        duration: duration
    }
    return rrp
}

module.exports = router