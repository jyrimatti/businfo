var cgihelper = function(logger, options) {
    var defaultOptions = {
        url: undefined,
        username: undefined,
        password: undefined,
        ajaxTimeoutMs: 7500,
        epsg_in: 'wgs84',
        epsg_out: 'wgs84'
    };
    for (var p in options)
        if (options.hasOwnProperty(p))
            defaultOptions[p] = options[p];

    var basicQuery = {
        user: defaultOptions.username,
        pass: defaultOptions.password,
        epsg_in: defaultOptions.epsg_in,
        epsg_out: defaultOptions.epsg_out,
        format: 'json'
    };

    var getJSON = function(url, onSuccess) {
        logger.log("Querying URL: " + url);
        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'json',
            timeout: defaultOptions.ajaxTimeoutMs,
            success: onSuccess
        });
    };

    var padWithZero = function(number) {
        return (number < 10 ? '0' : '') + number;
    };

    var ownPropertyNames = function(obj) {
        var ret = [];
        for (var p in obj)
            if (obj.hasOwnProperty(p))
                ret.push(p);
        return ret;
    };

    var object2keyValuePairs = function(obj) {
        return ownPropertyNames(obj).map(function(_) {
            return _ + '=' + obj[_];
        });
    };

    var ret = {
        STOP: 'stop',
        LINES: 'lines',
        STOPS_AREA: 'stops_area',

        get: function(request, query, onSuccess) {
            var params = ['request=' + request].concat(object2keyValuePairs(basicQuery))
                                               .concat(object2keyValuePairs(query));
            getJSON(defaultOptions.url + '?' + params.join('&'), onSuccess);
        },

        parseCoordinates: function(coordinates) {
            var lonlat = coordinates.split(',');
            return {latitude: parseFloat(lonlat[1]), longitude: parseFloat(lonlat[0])};
        },

        parseLineShape: function(line_shape) {
            return line_shape.split('|').map(ret.parseCoordinates);
        },

        parseDate: function(date) {
            var dateStr = date.toString();
            return new Date(parseInt(dateStr.slice(0,4), 10),
                            parseInt(dateStr.slice(4,6), 10)-1,
                            parseInt(dateStr.slice(6,8), 10));
        },

        parseTime: function(time) {
            var timeStr = time.toString();
            var minutes = parseInt(timeStr.slice(2), 10);
            var hours = parseInt(timeStr.slice(0,2), 10) + Math.floor(minutes / 60);
            var ret = {
                minutes: minutes % 60,
                hours: hours % 24,
                days: Math.floor(hours / 24),
                toString: function() {
                    return padWithZero(ret.hours) + ':' + padWithZero(ret.minutes);
                }
            };
            return ret;
        }
    };
    return ret;
};