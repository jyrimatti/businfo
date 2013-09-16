var sirihelper = function(xml, logger, options) {
    var version = '1.3';

    var defaultOptions = {
        application_id: undefined,
        url: undefined,
        username: undefined,
        password: undefined,
        previewInterval: 'PT120M00S',
        ajaxTimeoutMs: 7500
    };
    for (var p in options)
        if (options.hasOwnProperty(p))
            defaultOptions[p] = options[p];

    var basicQuery = function(requests) {
        var ret = {
            Siri: {
                _attributes: {
                    xmlns:                'http://www.siri.org.uk/siri',
                    'xmlns:xsi':          'http://www.w3.org/2001/XMLSchema-instance',
                    version:              version,
                    'xsi:schemaLocation': 'http://www.kizoom.com/standards/siri/schema/' + version + '/siri.xsd'
                },
                ServiceRequest: {
                    RequestTimestamp: new Date().toISOString(),
                    RequestorRef: defaultOptions.application_id
                }
            }
        };
        if (!(requests instanceof Array))
            requests = [requests];
        requests.forEach(function(req) {
            for (var p in req)
                if (req.hasOwnProperty(p))
                    ret.Siri.ServiceRequest[p] = req[p];
        });
        return ret;
    };

    return {
        ALL_VEHICLES: function() {
            return {
                VehicleMonitoringRequest: {
                    _attributes: {
                        version: version
                    },
                    RequestTimestamp: new Date().toISOString(),
                    VehicleMonitoringRef: 'VEHICLES_ALL'
                }
            };
        },

        ALL_MESSAGES: function() {
            return {
                GeneralMessageRequest: {
                    _attributes: {
                        version: version
                    },
                    RequestTimestamp: new Date().toISOString(),
                    InfoChannelRef: ['errors', 'warnings', 'messages']
                }
            };
        },

        STOP: function(stopCode) {
            return {
                StopMonitoringRequest: {
                    _attributes: {
                        version: version
                    },
                    RequestTimestamp: new Date().toISOString(),
                    PreviewInterval: defaultOptions.previewInterval,
                    MonitoringRef: stopCode
                }
            };
        },

        duration2millis: function(duration) {
            var re = /P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:([0-9.]+)S)?/;
            var m = duration.match(re);
            var millis = 0;
            if (m[1]) millis += parseInt(m[1],10)*30*24*60*60*1000;
            if (m[2]) millis += parseInt(m[2],10)*24*60*60*1000;
            if (m[3]) millis += parseInt(m[3],10)*60*60*1000;
            if (m[4]) millis += parseInt(m[4],10)*60*1000;
            if (m[5]) millis += parseInt(m[5],10)*1000;
            return millis;
        },

        get: function(requests, onSuccess) {
            logger.log('Querying URL: ' + defaultOptions.url);
            $.ajax({
                url: defaultOptions.url,
                type: 'POST',
                dataType: 'xml',
                contentType: 'application/xml;charset=UTF-8',
                timeout: defaultOptions.ajaxTimeoutMs,
                success: function(d) {
                    logger.log('Received Siri XML: ' + d);
                    onSuccess(xml.toObject(d));
                },
                username: defaultOptions.username,
                password: defaultOptions.password,
                data: xml.toXML(basicQuery(requests))
            });
        }
    };
};