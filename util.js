// DESCRIPTION:    Virtual services REST & SOAP
// MAINTAINER:     Didier Kimès <didier.kimes@gmail.com>

var trace = require('util')

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
 * Return response to consumers
 * 
 * @param {object} req
 * @param {object} res
 * @param {string} status
 * @param {string} body
 */
module.exports.sendBody = function (req, res, status, code, message) {
    // Headers
    if (req.app.get('env') != 'production') {
        res.set('Access-Control-Allow-Origin', '*')
    }
    res.set('X-Powered-By', 'Intelligent Mock <!/^.*$/!>')
    res.set('Content-Type', 'application/json; charset=UTF-8')
    res.set('Cache-Control', 'public, max-age=0')

    res.status(status)

    if (message != null && message != undefined) {
        res.send('{"code": "' + code + '", "message": "' + message + '"}')
    } else {
        res.send(code)
    }
}