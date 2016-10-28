// DESCRIPTION:    Virtual services REST & SOAP
// MAINTAINER:     Didier Kimès <didier.kimes@gmail.com>

var trace = require('util')
var chaiHttp = require("chai-http")
var chai = require("chai")
chai.use(chaiHttp)
var should = chai.should()

// iMock server
var server = 'http://192.168.56.102:8080'

// System under test
var app = require('../app')

describe(
	"Virtual services SOAP and Rest",
	function () {
		var response

		// REST method get id=1
		describe(
			"20 - Call Rest service by GET method id=1",
			function () {
				var request = '/mock/INBound/OUTBound/REST_GET?id=1'
				before(function (done) {
					chai.request(server).get(request).set('content-type', 'application/json; charset=UTF-8')
						.end(function (err, res) {
							response = res
							done()
						})
				})
				it('json response valid', function () {
					response.should.be.ok
					response.should.have.status(200)
					response.should.be.json
					response.body.should.have.property('id')
					response.body.id.should.equal(1)
				})
			})

		// REST method get id=2
		describe(
			"21 - Call Rest service by GET method id=2",
			function () {
				var request = '/mock/INBound/OUTBound/REST_GET?id=2'
				before(function (done) {
					chai.request(server).get(request).set('content-type', 'application/json; charset=UTF-8')
						.end(function (err, res) {
							response = res
							done()
						})
				})
				it('json response valid', function () {
					response.should.be.ok
					response.should.have.status(200)
					response.should.be.json
					response.body.should.have.property('id')
					response.body.id.should.equal(2)
				})
			})

		// REST method post id=3
		describe(
			"22 - Call Rest service by POST method id=3",
			function () {
				var url = '/mock/INBound/OUTBound/REST_POST'
				var body = '{"credential":{"id":3}}'
				before(function (done) {
					chai.request(server).post(url).set('content-type', 'application/json; charset=UTF-8').send(
						body).end(function (err, res) {
						response = res
						done()
					})
				})
				it('json response valid', function () {
					response.should.be.ok
					response.should.have.status(200)
					response.should.be.json
					response.body.should.have.property('id')
					response.body.id.should.equal(3)
				})
			})

		// REST method post id=4
		describe(
			"23 - Call Rest service by POST method id=4",
			function () {
				var url = '/mock/INBound/OUTBound/REST_POST'
				var body = '{"credential":{"id":4}}'
				before(function (done) {
					chai.request(server).post(url).set('content-type', 'application/json; charset=UTF-8').send(
						body).end(function (err, res) {
						response = res
						done()
					})
				})
				it('json response valid', function () {
					response.should.be.ok
					response.should.have.status(200)
					response.should.be.json
					response.body.should.have.property('id')
					response.body.id.should.equal(4)
				})
			})

		// SOAP id=5
		describe(
			"24 - Call SOAP service id=5",
			function () {
				var url = '/mock/INBound/OUTBound/SOAP'
				var body = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v2="http://www.orange.com/rbq/g3/soap/v2"><soapenv:Header/><soapenv:Body><v2:SOAP><credential><id>5</id></credential></v2:SOAP></soapenv:Body></soapenv:Envelope>'
				before(function (done) {
					chai.request(server).post(url).set('content-type', 'text/xml; charset=UTF-8').send(body)
						.end(function (err, res) {
							response = res
							done()
						})
				})
				it('xml response valid', function () {
					response.should.be.ok
					response.should.have.status(200)
					response.should.be.xml
					response.text.should.match(/<id>5<\/id>/)
				})
			})

		// SOAP id=6
		describe(
			"25 - Call SOAP service id=6",
			function () {
				var url = '/mock/INBound/OUTBound/SOAP'
				var body = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v2="http://www.orange.com/rbq/g3/soap/v2"><soapenv:Header/><soapenv:Body><v2:SOAP><credential><id>6</id></credential></v2:SOAP></soapenv:Body></soapenv:Envelope>'
				before(function (done) {
					chai.request(server).post(url).set('content-type', 'text/xml; charset=UTF-8').send(body)
						.end(function (err, res) {
							response = res
							done()
						})
				})
				it('xml response valid', function () {
					response.should.be.ok
					response.should.have.status(200)
					response.should.be.xml
					response.text.should.match(/<id>6<\/id>/)
				})
			})

		// 404
		describe(
			"26 - Route does not exist",
			function () {
				var request = '/mock/404'
				before(function (done) {
					chai.request(server).get(request).end(function (err, res) {
						response = res
						done()
					})
				})
				it('404 Not found', function () {
					response.should.be.ok
					response.should.have.status(404)
				})
			})

		// 500 - Service does not exist
		describe(
			"27 - Service does not exist",
			function () {
				var request = '/mock/INBound/OUTBound/noservice'
				before(function (done) {
					chai.request(server).get(request).set('content-type', 'application/json; charset=UTF-8').end(
						function (err, res) {
							response = res
							done()
						})
				})
				it('500 Not found', function () {
					response.should.be.ok
					response.should.have.status(500)
					response.text.should.match(/ERROR/)
				})
			})

		// 500 - Response does not exist
		describe(
			"28 - Response does not exist",
			function () {
				var request = '/mock/INBound/OUTBound/GET_REST?id=999'
				before(function (done) {
					chai.request(server).get(request).set('content-type', 'application/json; charset=UTF-8')
						.end(function (err, res) {
							response = res
							done()
						})
				})
				it('500 Not found', function () {
					response.should.be.ok
					response.should.have.status(500)
					response.text.should.match(/ERROR/)
				})
			})
	})