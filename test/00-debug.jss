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
            })
    })