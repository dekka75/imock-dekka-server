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
    "Real services SOAP and Rest",
    function () {
        var response

        // REST method get id=1
        describe(
            "31 - Call Rest service by GET method id=1",
            function () {
                var request = '/real/INBound/OUTBound/REST_GET?id=1'
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

        // REST method post id=3
        describe(
            "32 - Call Rest service by POST method id=3",
            function () {
                var url = '/real/INBound/OUTBound/REST_POST'
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

        // SOAP id=5
        describe(
            "33 - Call SOAP service id=5",
            function () {
                var url = '/real/INBound/OUTBound/SOAP'
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
    })