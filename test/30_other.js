// DESCRIPTION:    Virtual services REST & SOAP
// MAINTAINER:     Didier Kimès <didier.kimes@gmail.com>

var trace = require('util')
var chaiHttp = require("chai-http")
var chai = require("chai")
chai.use(chaiHttp)
var should = chai.should()

// System under test
var util = require('../util')

describe("Virtual services other", function() {
	// Get Objet data
	describe("30 - Objet introspection", function() {
		var obj = {
			'soap-env:envelope' : {
				'$' : {
					'xmlns:SOAP-ENV' : 'http://schemas.xmlsoap.org/soap/envelope/',
					'xmlns:ns1' : 'http://www.orange.com/Interfaces/ManagePcmService/v1'
				},
				'soap-env:body' : {
					'ns1:getlineinfo' : {
						'ns1:idsiu' : '1140301142528135',
						'ns1:msisdn' : '0638507077'
					}
				}
			}
		}
		it('object data valid', function() {
			var response = util.getItemValue(obj, 'msisdn')
			response.should.match(/0638507077/)
		})
	})
})