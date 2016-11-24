// DESCRIPTION:    Virtual services REST & SOAP
// MAINTAINER:     Didier Kimès <didier.kimes@gmail.com>

var trace = require('util')
var chaiHttp = require("chai-http")
var chai = require("chai")
chai.use(chaiHttp)
var should = chai.should()

// System under test
var util = require('../models/util')

describe("Virtual services other", function () {
	// Get Objet data
	describe("40 - Objet introspection", function () {
		var obj = {
			'soap-env:envelope': {
				'$': {
					'xmlns:SOAP-ENV': 'http://schemas.xmlsoap.org/soap/envelope/',
					'xmlns:ns1': 'http://www.dekka.com/Interfaces/ManageService/v1'
				},
				'soap-env:body': {
					'ns1:getinfo': {
						'ns1:id': '1140301142528135',
						'ns1:msisdn': '0612345678'
					}
				}
			}
		}
		it('object data valid', function () {
			var response = util.getItemValue(obj, 'msisdn')
			response.should.match(/0612345678/)
		})
	})
})