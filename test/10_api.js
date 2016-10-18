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

        // Create virtual service
        describe(
            "10 - Create vitual service REST_POST",
            function () {
                var url = '/api/services/mock'
                var body = {
                    "name": "/INBound/OUTBound/REST_POST",
                    "designation": "imock unit tests",
                    "group": "imock",
                    "attribut": "id",
                    "contentType": "application/json; charset=UTF-8",
                    "status": 200,
                    "response": "{\"data\":{\"id\":0,\"first_name\":\"foo\",\"last_name\":\"bar\",\"Label\":\"\"}}",
                    "real": 0,
                    "producer": "undefined",
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
            "11 - Vitual service REST_POST already exist",
            function () {
                var url = '/api/services/mock'
                var body = {
                    "name": "/INBound/OUTBound/REST_POST",
                    "designation": "imock unit tests",
                    "group": "imock",
                    "attribut": "id",
                    "contentType": "application/json; charset=UTF-8",
                    "status": 200,
                    "response": "{\"data\":{\"id\":0,\"first_name\":\"foo\",\"last_name\":\"bar\",\"Label\":\"\"}}",
                    "real": 0,
                    "producer": "undefined",
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

        // List of groups
        describe(
            "12 - List of groups",
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
            "13 - List of campaign",
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

    })