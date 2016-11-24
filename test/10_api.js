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
            "10.a - Delete response",
            function () {
                var url = '/api/response/mock'
                var body = {
                    "path": "/INBound/OUTBound/REST_GET/1"
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
            "10.b - Purge old request response pairs",
            function () {
                var url = '/api/tools/purge'
                before(function (done) {
                    chai.request(server).post(url).set('content-type', 'application/json; charset=UTF-8').send().end(function (err, res) {
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
            "10.c - Delete vitual service REST_GET",
            function () {
                var url = '/api/service/mock'
                var body = {
                    "path": "/INBound/OUTBound/REST_GET"
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
            "10.d - Delete vitual service REST_POST",
            function () {
                var url = '/api/service/mock'
                var body = {
                    "path": "/INBound/OUTBound/REST_POST"
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
            "10.e - Delete vitual service SOAP",
            function () {
                var url = '/api/service/mock'
                var body = {
                    "path": "/INBound/OUTBound/SOAP"
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
            "10.f - Delete real service REST_GET",
            function () {
                var url = '/api/service/real'
                var body = {
                    "path": "/INBound/OUTBound/REST_GET"
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
            "10.g - Delete real service REST_POST",
            function () {
                var url = '/api/service/real'
                var body = {
                    "path": "/INBound/OUTBound/REST_POST"
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
            "10.h - Delete real service SOAP",
            function () {
                var url = '/api/service/real'
                var body = {
                    "path": "/INBound/OUTBound/SOAP"
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
            "10.i - Clean ALL",
            function () {
                var url = '/api/tools/clean'
                before(function (done) {
                    chai.request(server).post(url).set('content-type', 'application/json; charset=UTF-8').send().end(function (err, res) {
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

        // Create virtual services
        describe(
            "11.a - Create vitual service REST_GET",
            function () {
                var url = '/api/service/mock'
                var body = {
                    "path": "/INBound/OUTBound/REST_GET",
                    "designation": "imock unit tests",
                    "group": "imock",
                    "attribut": "id",
                    "contentType": "application/json; charset=UTF-8",
                    "status": 200,
                    "response": '{"id":0,"first_name":"foo","last_name":"bar","Label":""}',
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

        describe(
            "11.b - Create vitual service REST_POST",
            function () {
                var url = '/api/service/mock'
                var body = {
                    "path": "/INBound/OUTBound/REST_POST",
                    "designation": "imock unit tests",
                    "group": "imock",
                    "attribut": "credential.id",
                    "contentType": "application/json; charset=UTF-8",
                    "status": 200,
                    "response": '{"id":0,"first_name":"foo","last_name":"bar","Label":""}',
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

        describe(
            "11.c - Create vitual service SOAP",
            function () {
                var url = '/api/service/mock'
                var body = {
                    "path": "/INBound/OUTBound/SOAP",
                    "designation": "imock unit tests",
                    "group": "imock",
                    "attribut": "id",
                    "contentType": "text/xml; charset=UTF-8",
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

        describe(
            "11.d - Create real service for REST_GET",
            function () {
                var url = '/api/service/real'
                var body = {
                    "path": "/INBound/OUTBound/REST_GET",
                    "designation": "imock unit tests",
                    "group": "imock",
                    "real": 1,
                    "producer": "http://192.168.56.102:8080/mock"
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

        describe(
            "11.e - Create real service for REST_POST",
            function () {
                var url = '/api/service/real'
                var body = {
                    "path": "/INBound/OUTBound/REST_POST",
                    "designation": "imock unit tests",
                    "group": "imock",
                    "real": 1,
                    "producer": "http://192.168.56.102:8080/mock"
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

        describe(
            "11.f - Create real service for SOAP",
            function () {
                var url = '/api/service/real'
                var body = {
                    "path": "/INBound/OUTBound/SOAP",
                    "designation": "imock unit tests",
                    "group": "imock",
                    "real": 1,
                    "producer": "http://192.168.56.102:8080/mock"
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

        // Create responses for a virtual service
        describe(
            "12.a - Create a response for a vitual service REST_GET id=1",
            function () {
                var url = '/api/response/mock'
                var body = {
                    "path": "/INBound/OUTBound/REST_GET/1",
                    "response": '{"id":1,"first_name":"Isaac","last_name":"Asimov","Label":"HAL-<!\\d{9}!>"}',
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

        describe(
            "12.b - Create a response for a vitual service REST_GET id=2",
            function () {
                var url = '/api/response/mock'
                var body = {
                    "path": "/INBound/OUTBound/REST_GET/2",
                    "response": '{"id":2,"first_name":"Ray","last_name":"Bradbury","Label":"HAL-<!\\d{9}!>"}',
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

        describe(
            "13.a - Create a response for a vitual service REST_POST id=3",
            function () {
                var url = '/api/response/mock'
                var body = {
                    "path": "/INBound/OUTBound/REST_POST/3",
                    "response": '{"id":3,"first_name":"Jules","last_name":"Verne","Label":"HAL-<!\\d{9}!>"}',
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

        describe(
            "13.b - Create a response for a vitual service REST_POST id=4",
            function () {
                var url = '/api/response/mock'
                var body = {
                    "path": "/INBound/OUTBound/REST_POST/4",
                    "response": '{"id":4,"first_name":"George","last_name":"Orwell","Label":"HAL-<!\\d{9}!>"}',
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

        describe(
            "14.a - Create a response for a vitual service SOAP id=5",
            function () {
                var url = '/api/response/mock'
                var body = {
                    "path": "/INBound/OUTBound/SOAP/5",
                    "response": '<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns1="http://www.orange.com/rbq/g3/soap/v2"><SOAP-ENV:Header></SOAP-ENV:Header><SOAP-ENV:Body><ns1:SOAP><data><id>5</id><first_name>Orson</first_name><last_name>Scott Card</last_name><Label>HAL-<!\\d{9}!></Label></data></ns1:SOAP></SOAP-ENV:Body></SOAP-ENV:Envelope>',
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

        describe(
            "14.b - Create a response for a vitual service SOAP id=6",
            function () {
                var url = '/api/response/mock'
                var body = {
                    "path": "/INBound/OUTBound/SOAP/6",
                    "response": '<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns1="http://www.orange.com/rbq/g3/soap/v2"><SOAP-ENV:Header></SOAP-ENV:Header><SOAP-ENV:Body><ns1:SOAP><data><id>6</id><first_name>Robert</first_name><last_name>Silverberg</last_name><Label>HAL-<!\\d{9}!></Label></data></ns1:SOAP></SOAP-ENV:Body></SOAP-ENV:Envelope>',
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
            "15 - Vitual service REST_POST already exist",
            function () {
                var url = '/api/service/mock'
                var body = {
                    "path": "/INBound/OUTBound/REST_POST"
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
            "16 - Modify vitual service REST_POST",
            function () {
                var url = '/api/service/mock'
                var body = {
                    "path": "/INBound/OUTBound/REST_POST",
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

        // List of groups
        describe(
            "17.a - List of groups",
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
                    response.body[0].should.equal('imock')
                })
            })

        // List of campaigns for a group
        describe(
            "17.b - List of campaigns for a group",
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
                    response.body[0].should.equal('mock')
                })
            })

        // List of services
        describe(
            "17.c - List of services",
            function () {
                var request = '/api/services/imock'
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
                    response.body[0].should.have.property('path')
                    response.body[0].path.should.equal('/INBound/OUTBound/REST_GET')
                })
            })

        // List of responses for a service
        describe(
            "17.d - List of responses for a service",
            function () {
                var request = '/api/responses/mock?path={"path":"/INBound/OUTBound/SOAP"}'
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
                    response.body[0].should.equal('/mock/INBound/OUTBound/SOAP/5')
                })
            })

        // Services details
        describe(
            "18.a - Service details",
            function () {
                var request = '/api/service/mock?path={"path":"/INBound/OUTBound/REST_POST"}'
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
                    response.body.should.have.property('path')
                    response.body.path.should.equal('/INBound/OUTBound/REST_POST')
                })
            })

        // Response details
        describe(
            "18.b - Response details",
            function () {
                var request = '/api/response/mock?path={"path":"/INBound/OUTBound/SOAP"}&search=6'
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
                    response.body.should.have.property('path')
                    response.body.path.should.equal('/INBound/OUTBound/SOAP/6')
                })
            })


        // Import datasets
        describe(
            "19.a - Clean ALL",
            function () {
                var url = '/api/tools/clean'
                before(function (done) {
                    chai.request(server).post(url).set('content-type', 'application/json; charset=UTF-8').send().end(function (err, res) {
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

        describe(
            "19.b - Import datasets",
            function () {
                var url = '/api/tools/import?filter={"data":"^\\\\d\\\\d_.*\.(yaml)$"}'
                before(function (done) {
                    chai.request(server).post(url).set('content-type', 'application/json; charset=UTF-8').send().end(function (err, res) {
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

    })