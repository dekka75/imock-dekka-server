// DESCRIPTION:    Services virtuels SOAP & Rest
// MAINTAINER:     Didier Kimès <didier.kimes@gmail.com>
// TO_RUN:         /home/nodejs/nodejs DEBUG=mock:* npm start
// TO_DEBUG:       console.log(trace.inspect(response, {depth: 1, showHidden: false}))

var debug = require('debug')('imock:app')
var express = require('express')
var redis = require('redis')
var bunyan = require('bunyan')
var path = require('path')
var compression = require('compression')
var bodyParser = require('body-parser')
var xmlParser = require('express-xml-bodyparser')

// Must be initialized in production - export NODE_ENV="production"
debug('process.env.NODE_ENV: ' + process.env.NODE_ENV)

var app = express()
var datasets = require('./datasets/init')
var routes = require('./routes/imock')

// Redis access
app.locals.redis = redis.createClient('6379', 'redis')

// Logger request response pair
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

// View engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(compression())
app.use(bodyParser.json())
app.use(xmlParser({
	trim: false,
	explicitArray: false
}))
app.use(express.static(path.join(__dirname, 'public')))

// Init data sets
app.use('/datasets/init', datasets)
// No service found
app.use('/imock/TST/TST/noservice', routes)
// ENV - IN - OUT - Service
app.use(/\/[A-Z-a-z-0-9]{3,}\/[A-Z-0-9]{3,4}\/[A-Z-a-z-0-9]{3,}\/.*/, routes)

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
	var err = new Error('Not Found')
	err.status = 404
	next(err)
})

// Error handlers

// Development error handler - will print stacktrace
if (app.get('env') === 'development') {
	app.use(function (err, req, res, next) {
		debug('404 Not found...')
		res.status(err.status || 500)
		res.render('error', {
			message: err.message,
			error: err
		})
	})
}

// Production error handler - no stacktraces leaked to user
app.use(function (err, req, res, next) {
	res.status(err.status || 500)
	res.render('error', {
		message: err.message,
		error: {}
	})
})

module.exports = app