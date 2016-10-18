// DESCRIPTION:    Virtual services REST & SOAP
// MAINTAINER:     Didier Kimès <didier.kimes@gmail.com>

var trace = require('util')
var debug = require('debug')('imock:server:api:datasets')
var express = require('express')
var redis = require('redis')
var router = express.Router()

// Mehod GET
router.get('/', function (req, res, next) {
    var client = req.app.locals.redis

    // iMock datasets for unit tests

    // MOCK - GET REST
    var _service = {
        name: '/mock/INBound/OUTBound/REST_GET',
        designation: 'imock unit tests',
        env: 'imock',
        // TODO: change multi key by multi value in one key
        attribut_1: 'id',
        //      attribut_2: 'valeur',
        body: '{"data":{"id":0,"first_name":"foo","last_name":"bar","Label":""}}',
        real: 0,
        producers: '',
        min: 100,
        max: 200
    }
    client.hmset(_service.name, _service)
    var _response = {
        name: '/mock/INBound/OUTBound/REST_GET/1',
        body: '{"data":{"id":1,"first_name":"Philip","last_name":"K. Dick","Label":"HAL-<!\\d{9}!>"}}'
    }
    client.hmset(_response.name, _response)
    _response = {
        name: '/mock/INBound/OUTBound/REST_GET/2',
        body: '{"data":{"id":2,"first_name":"Ray","last_name":"Bradbury","Label":"HAL-<!\\d{9}!>"}}'
    }
    client.hmset(_response.name, _response)

    // MOCK - POST REST
    _service = {
        name: '/mock/INBound/OUTBound/REST_POST',
        designation: 'imock unit tests',
        env: 'imock',
        attribut_1: 'credentials.id',
        body: '{"data":{"id":0,"first_name":"foo","last_name":"bar","Label":""}}',
        real: 0,
        producers: '',
        min: 100,
        max: 200
    }
    client.hmset(_service.name, _service)
    _response = {
        name: '/mock/INBound/OUTBound/REST_POST/3',
        body: '{"data":{"id":3,"first_name":"Isaac","last_name":"Asimov","Label":"HAL-<!\\d{9}!>"}}'
    }
    client.hmset(_response.name, _response)
    _response = {
        name: '/mock/INBound/OUTBound/REST_POST/4',
        body: '{"data":{"id":4,"first_name":"George","last_name":"Orwell","Label":"HAL-<!\\d{9}!>"}}'
    }
    client.hmset(_response.name, _response)

    // MOCK - SOAP
    _service = {
        name: '/mock/INBound/OUTBound/SOAP',
        designation: 'imock unit tests',
        env: 'imock',
        attribut_1: 'id',
        body: '<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns1="http://www.orange.com/rbq/g3/soap/v2"><SOAP-ENV:Header></SOAP-ENV:Header><SOAP-ENV:Body><ns1:SOAP><data><id>0</id><first_name>bar</first_name><last_name>foo</last_name><Label></Label></data></ns1:SOAP></SOAP-ENV:Body></SOAP-ENV:Envelope>',
        real: 0,
        producers: '',
        min: 100,
        max: 200
    }
    client.hmset(_service.name, _service)
    _response = {
        name: '/mock/INBound/OUTBound/SOAP/5',
        body: '<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns1="http://www.orange.com/rbq/g3/soap/v2"><SOAP-ENV:Header></SOAP-ENV:Header><SOAP-ENV:Body><ns1:SOAP><data><id>5</id><first_name>Orson</first_name><last_name>Scott Card</last_name><Label>HAL-<!\\d{9}!></Label></data></ns1:SOAP></SOAP-ENV:Body></SOAP-ENV:Envelope>'
    }
    client.hmset(_response.name, _response)
    _response = {
        name: '/mock/INBound/OUTBound/SOAP/6',
        body: '<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns1="http://www.orange.com/rbq/g3/soap/v2"><SOAP-ENV:Header></SOAP-ENV:Header><SOAP-ENV:Body><ns1:SOAP><data><id>6</id><first_name>Robert</first_name><last_name>Silverberg</last_name><Label>HAL-<!\\d{9}!></Label></data></ns1:SOAP></SOAP-ENV:Body></SOAP-ENV:Envelope>'
    }
    client.hmset(_response.name, _response)

    // REAL - GET REST
    var _service = {
        name: '/real/INBound/OUTBound/REST_GET',
        designation: 'imock unit tests',
        env: 'imock',
        real: 1,
        producers: 'http://192.168.56.102:8080/mock'
    }
    client.hmset(_service.name, _service)

    _service = {
        name: '/real/INBound/OUTBound/REST_POST',
        designation: 'imock unit tests',
        env: 'imock',
        real: 1,
        producers: 'http://192.168.56.102:8080/mock'
    }
    client.hmset(_service.name, _service)

    _service = {
        name: '/real/INBound/OUTBound/SOAP',
        designation: 'imock unit tests',
        env: 'imock',
        real: 1,
        producers: 'http://192.168.56.102:8080/mock'
    }
    client.hmset(_service.name, _service)

    // End of init
    res.status(200)
    res.render('index', {
        title: 'Intelligent Mock <!/^.*$/!>',
        message: 'data sets initialized...'
    })
})

module.exports = router