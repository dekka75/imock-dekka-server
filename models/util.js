// DESCRIPTION:    Virtual services REST & SOAP
// MAINTAINER:     Didier Kimès <didier.kimes@gmail.com>

var debug = require('debug')('imock:server:models:util')

/**
 * 
 * Return attribut value
 * 
 * @param {object} o
 * @param {string} k
 */
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

/**
 * 
 * Return object Error
 * 
 * @param {int} status
 * @param {string} message
 */
module.exports.getMessage = function (status, message) {
    var err = new Error(message)
    err.status = status
    return err
}