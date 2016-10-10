// DESCRIPTION:    Virtual services REST & SOAP
// MAINTAINER:     Didier Kimès <didier.kimes@gmail.com>

var trace = require('util')

module.exports.getItemValue = function (o, k) {
	// TODO: break when find true
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

