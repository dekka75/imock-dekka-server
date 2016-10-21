// DESCRIPTION:    Virtual services REST & SOAP
// MAINTAINER:     Didier Kimès <didier.kimes@gmail.com>

'use strict'

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
    "API iMock",
    function () {
        var response

        // Clean previous datatests
        describe(
            "10 - Delete vitual service REST_POST",
            function () {
                var url = '/api/services/mock'
                var body = {
                    "name": "/INBound/OUTBound/REST_POST",
                    "group": "imock",
                }
                before(function (done) {
                    chai.request(server).delete(url).set('content-type', 'application/json; charset=UTF-8').send(
                        body).end(function (err, res) {
                        response = res
                        done()
                    })
                })
                it('json response valid', function () {
                    response.should.be.ok
                    response.should.be.json
                    response.body.should.have.property('code')
                    response.body.code.should.match(/[SUCCESS|ECHEC]/)
                })
            })

        describe(
            "11 - Delete vitual service REST_GET",
            function () {
                var url = '/api/services/mock'
                var body = {
                    "name": "/INBound/OUTBound/REST_GET",
                    "group": "imock",
                }
                before(function (done) {
                    chai.request(server).delete(url).set('content-type', 'application/json; charset=UTF-8').send(
                        body).end(function (err, res) {
                        response = res
                        done()
                    })
                })
                it('json response valid', function () {
                    response.should.be.ok
                    response.should.be.json
                    response.body.should.have.property('code')
                    response.body.code.should.match(/[SUCCESS|ECHEC]/)
                })
            })

        describe(
            "12 - Delete vitual service SOAP",
            function () {
                var url = '/api/services/mock'
                var body = {
                    "name": "/INBound/OUTBound/SOAP",
                    "group": "imock",
                }
                before(function (done) {
                    chai.request(server).delete(url).set('content-type', 'application/json; charset=UTF-8').send(
                        body).end(function (err, res) {
                        response = res
                        done()
                    })
                })
                it('json response valid', function () {
                    response.should.be.ok
                    response.should.be.json
                    response.body.should.have.property('code')
                    response.body.code.should.match(/[SUCCESS|ECHEC]/)
                })
            })

        // Create virtual service REST_POST
        describe(
            "13 - Create vitual service REST_POST",
            function () {
                var url = '/api/services/mock'
                var body = {
                    "name": "/INBound/OUTBound/REST_POST",
                    "group": "imock",
                    "campaign": "mock",
                    "designation": "imock unit tests",
                    "attribut": "id",
                    "contentType": "application/json; charset=UTF-8",
                    "status": 200,
                    "response": "{\"data\":{\"id\":0,\"first_name\":\"foo\",\"last_name\":\"bar\",\"Label\":\"\"}}",
                    "real": 0,
                    "producer": "nodefined",
                    "min": 100,
                    "max": 200
                }
                before(function (done) {
                    chai.request(server).post(url).set('content-type', 'application/json; charset=UTF-8').send(
                        body).end(function (err, res) {
                        response = res
                        done()
                    })
                })
                it('json response valid', function () {
                    response.should.be.ok
                    response.should.have.status(201)
                    response.should.be.json
                    response.body.should.have.property('code')
                    response.body.code.should.equal('SUCCESS')
                })
            })

        // Virtual service already exist
        describe(
            "14 - Vitual service REST_POST already exist",
            function () {
                var url = '/api/services/mock'
                var body = {
                    "name": "/INBound/OUTBound/REST_POST",
                    "group": "imock",
                    "campaign": "mock",
                    "designation": "imock unit tests",
                    "attribut": "id",
                    "contentType": "application/json; charset=UTF-8",
                    "status": 200,
                    "response": "{\"data\":{\"id\":0,\"first_name\":\"foo\",\"last_name\":\"bar\",\"Label\":\"\"}}",
                    "real": 0,
                    "producer": "nodefined",
                    "min": 100,
                    "max": 200
                }
                before(function (done) {
                    chai.request(server).post(url).set('content-type', 'application/json; charset=UTF-8').send(
                        body).end(function (err, res) {
                        response = res
                        done()
                    })
                })
                it('json response valid', function () {
                    response.should.be.ok
                    response.should.have.status(500)
                    response.should.be.json
                    response.body.should.have.property('code')
                    response.body.code.should.equal('ECHEC')
                })
            })

        // Modify virtual service
        describe(
            "15 - Modify vitual service REST_POST",
            function () {
                var url = '/api/services/mock'
                var body = {
                    "name": "/INBound/OUTBound/REST_POST",
                    "group": "imock",
                    "min": 250,
                    "max": 350
                }
                before(function (done) {
                    chai.request(server).put(url).set('content-type', 'application/json; charset=UTF-8').send(
                        body).end(function (err, res) {
                        response = res
                        done()
                    })
                })
                it('json response valid', function () {
                    response.should.be.ok
                    response.should.have.status(200)
                    response.should.be.json
                    response.body.should.have.property('code')
                    response.body.code.should.equal('SUCCESS')
                })
            })

        // Create virtual service REST_GET
        describe(
            "16 - Create vitual service REST_GET",
            function () {
                var url = '/api/services/mock'
                var body = {
                    "name": "/INBound/OUTBound/REST_GET",
                    "designation": "imock unit tests",
                    "group": "imock",
                    "attribut": "id",
                    "contentType": "application/json; charset=UTF-8",
                    "status": 200,
                    "response": "{\"data\":{\"id\":0,\"first_name\":\"foo\",\"last_name\":\"bar\",\"Label\":\"\"}}",
                    "real": 0,
                    "producer": "nodefined",
                    "min": 100,
                    "max": 200
                }
                before(function (done) {
                    chai.request(server).post(url).set('content-type', 'application/json; charset=UTF-8').send(
                        body).end(function (err, res) {
                        response = res
                        done()
                    })
                })
                it('json response valid', function () {
                    response.should.be.ok
                    response.should.have.status(201)
                    response.should.be.json
                    response.body.should.have.property('code')
                    response.body.code.should.equal('SUCCESS')
                })
            })

        // Create virtual service SOAP
        describe(
            "17 - Create vitual service SOAP",
            function () {
                var url = '/api/services/mock'
                var body = {
                    "name": "/INBound/OUTBound/SOAP",
                    "designation": "imock unit tests",
                    "group": "imock",
                    "attribut": "id",
                    "contentType": "application/json; charset=UTF-8",
                    "status": 200,
                    "response": '<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns1="http://www.orange.com/rbq/g3/soap/v2"><SOAP-ENV:Header></SOAP-ENV:Header><SOAP-ENV:Body><ns1:SOAP><data><id>0</id><first_name>bar</first_name><last_name>foo</last_name><Label></Label></data></ns1:SOAP></SOAP-ENV:Body></SOAP-ENV:Envelope>',
                    "real": 0,
                    "producer": "nodefined",
                    "min": 100,
                    "max": 200
                }
                before(function (done) {
                    chai.request(server).post(url).set('content-type', 'application/json; charset=UTF-8').send(
                        body).end(function (err, res) {
                        response = res
                        done()
                    })
                })
                it('json response valid', function () {
                    response.should.be.ok
                    response.should.have.status(201)
                    response.should.be.json
                    response.body.should.have.property('code')
                    response.body.code.should.equal('SUCCESS')
                })
            })

        // List of groups
        describe(
            "18 - List of groups",
            function () {
                var request = '/api/groups'
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
                })
            })

        // List of campaigns
        describe(
            "19 - List of campaigns",
            function () {
                var request = '/api/campaigns/imock'
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
                })
            })

        // List of services
        describe(
            "20 - List of services",
            function () {
                var request = '/api/campaigns/imock '
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
                })
            })
    })