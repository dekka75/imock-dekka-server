// DESCRIPTION:    Virtual services REST & SOAP
// MAINTAINER:     Didier Kimès <didier.kimes@gmail.com>

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

/**
 * 
 * Persist service and relations
 * 
 * @param {object} req
 * @param {string} campaign
 * @param {object} data
 * @param {function} callback
 */
module.exports.createService = function (req, campaign, data, done) {
    var client = req.app.locals.redis

    // Create service object and store to redis database
    var service = {
        campaign: (campaign != null && campaign != undefined) ? campaign : 'default',
        path: (data.path != null && data.path != undefined) ? data.path : '/INBound/OUTBound/default',
        designation: (data.designation != null && data.designation != undefined) ? data.designation : 'foo',
        group: (data.group != null && data.group != undefined) ? data.group : 'others',
        attribut: (data.attribut != null && data.attribut != undefined) ? data.attribut : 'no',
        contentType: (data.contentType != null && data.contentType != undefined) ? data.contentType : 'application/json; charset=UTF-8',
        status: (data.status != null && data.status != undefined) ? data.status : 200,
        response: (data.response != null && data.response != undefined) ? data.response : '{"foo":"bar"}',
        real: (data.real != null && data.real != undefined) ? data.real : 0,
        producer: (data.producer != null && data.producer != undefined) ? data.producer : 'no',
        min: (data.min != null && data.min != undefined) ? data.min : 100,
        max: (data.max != null && data.max != undefined) ? data.max : 200
    }

    // Service name
    var hash = '/' + service.campaign + service.path

    client.hgetall(hash, function (err, currentService) {
        if (err) {
            done({
                status: 500,
                message: 'Internal Server Error'
            })

        } else if (currentService != null && currentService != undefined) {
            done({
                status: 500,
                message: 'Service already exist'
            })

        } else {
            // Create service & relations
            client.multi()
                // Persist service object in redis database
                .hmset(hash, service)
                // Persist relations
                .sadd('/api/groups', service.group)
                .sadd('/api/campaigns/' + service.group, campaign)
                .sadd('/api/services/' + campaign, hash)
                .exec(function (err, replies) {
                    if (err) {
                        done({
                            status: 500,
                            message: 'Internal Server Error'
                        })
                    } else {
                        done({
                            status: 201,
                            message: 'Service create'
                        })
                    }
                })
        }
    })
}