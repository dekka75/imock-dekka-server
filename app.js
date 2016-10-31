// DESCRIPTION:    Virtual services REST & SOAP
// MAINTAINER:     Didier Kimès <didier.kimes@gmail.com>
// TO_RUN:         /home/nodejs/nodejs DEBUG=mock:* npm start
// TO_DEBUG:       console.log(trace.inspect(response, {depth: 1, showHidden: false}))

var debug = require('debug')('imock:server:app')
var express = require('express')
var redis = require('redis')
var bunyan = require('bunyan')
var compression = require('compression')
var bodyParser = require('body-parser')
var xmlParser = require('express-xml-bodyparser')

// Must be initialized in production - export NODE_ENV="production"
debug('process.env.NODE_ENV: ' + process.env.NODE_ENV)

var app = express()
var groups = require('./api/groups')
var campaigns = require('./api/campaigns')
var services = require('./api/services')
var responses = require('./api/responses')
var tools = require('./api/tools')
var routes = require('./routes/imock')

// Redis access
app.locals.redis = redis.createClient('6379', 'redis')
app.locals.redis.on("error", function (err) {
    debug(err)
})

// Logger asynchrone - request response pair
app.locals.traffic = bunyan.createLogger({
    name: 'traffic',
    streams: [{
        level: 'info',
        type: 'rotating-file',
        path: './logs/imock-traffic.log',
        period: '1h',
        count: 5
    }]
})

// Disable header
app.disable('x-powered-by')
app.disable('etag')

app.use(compression())
app.use(bodyParser.json())
app.use(xmlParser({
    trim: false,
    explicitArray: false
}))

// api
app.use(/\/api\/groups/, groups)
app.use(/\/api\/campaigns\/.*/, campaigns)
app.use(/\/api\/services?\/.*/, services)
app.use(/\/api\/responses?\/.*/, responses)
app.use(/\/api\/tools\/.*/, tools)

// Campaign - InBound - OutBound - Service
app.use(/\/[A-Z-a-z-0-9-_]{3,}\/[A-Z-a-z-0-9-_]{3,}\/[A-Z-a-z-0-9-_]{3,}\/.*/, routes)

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
    var payload = res.locals.payload
    if (payload != null && payload != undefined) {
        var err = new Error()
        next(err)
    } else {
        var err = new Error('Not Found')
        err.status = 404
        next(err)
    }
})

// Error handlers

// Development error handler - will print stacktrace
app.use(function (err, req, res, next) {
    var status = res.locals.status || err.status || 500
    var contentType = res.locals.contentType
    var payload = res.locals.payload
    var code = (status >= 200 && status <= 226) ? 'SUCCESS' : 'ECHEC'
    var message = app.get('env') == 'production' ? 'Internal Server Error' : code == "SUCCESS" ? err.message : err.stack.split("\n")

    // TODO: Don't leave Allow-Origin in production ?
    res.set('Access-Control-Allow-Origin', '*')
    res.set('X-Powered-By', 'Intelligent Mock <!/^.*$/!>')
    res.set('Content-Type', (contentType != null && contentType != undefined) ? contentType : 'application/json; charset=UTF-8')
    res.set('Cache-Control', 'public, max-age=0')
    res.status(status)
    if (payload != null && payload != undefined) {
        res.send(payload)
    } else {
        res.send({
            code: code,
            status: status,
            message: message
        })
    }
    if (app.get('env') != 'production') {
        debug(err)
    }
})

module.exports = app