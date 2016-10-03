// NODEJS-VERSION: v0.10.42
// DESCRIPTION:    Services virtuels SOAP & Rest
// MAINTAINER:     Didier Kimès <didier.kimes@orange.com>

var trace = require('util')
var redis = require('redis')

module.exports.getKeyValue = function (req, key) {
	// TODO : check key or replace eval by req.body[property]
	if (key != null && key != undefined) {
		try {
			var val
			if (req.method == 'POST') {
				if (/application\/json;/.test(req.get('content-type'))) {
					val = eval('req.body.' + key)
				} else {
					val = getItemValue(req.body, key)
				}
			} else {
				val = eval('req.query.' + key)
			}
			if (val) {
				if (val.indexOf(":") != -1) {
					var kv = val.split(":")
					val = kv[1]
				}
				return '/' + val
			}
		} catch (e) {
			// Nothing todo
		}
	}
	return ''
}

module.exports.getItemValue = function (o, k) {
	// TODO : break when find true
	var s = ''
	for (var a in o) {
		if (typeof o[a] == 'object') {
			s = this.getItemValue(o[a], k)
		} else {
			if (a.indexOf(k) != -1) {
				s = o[a]
			}
		}
	}
	return s
}

module.exports.getRequestResponsePair = function (mode, beginAt, req, res, service, resBody) {
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
		if (/application\/json;/.test(req.get('content-type'))) {
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
