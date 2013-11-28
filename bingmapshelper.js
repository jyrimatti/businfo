var bingmapshelper = function(canvasElement, options) {
    var defaultOptions = {
        map: {
            credentials: undefined,
            mapTypeId: Microsoft.Maps.MapTypeId.road,
            zoom: 16
        },
        marker: {
            width: 34,
            height: 34
        },
        polyline: {
            strokeColor: new Microsoft.Maps.Color(191,209,255,0)
        }
    };

    for (var p1 in options)
        if (options.hasOwnProperty(p1))
            for (var pp1 in options[p1])
                if (options[p1].hasOwnProperty(pp1))
                    defaultOptions[p1][pp1] = options[p1][pp1];



    var mapOpts = {};
    for (var p2 in defaultOptions.map)
        if (defaultOptions.map.hasOwnProperty(p2))
            mapOpts[p2] = defaultOptions.map[p2];
    var map = new Microsoft.Maps.Map(canvasElement, mapOpts);

    var toLatLng = function(coords) {
        return new Microsoft.Maps.Location(coords.latitude || coords.Latitude, coords.longitude || coords.Longitude);
    };

    var fromLatLng = function(latlng) {
        return { latitude: latlng.latitude, longitude: latlng.longitude };
    };

    var ret = {
        on: function(event, object, f) {
            Microsoft.Maps.Events.addHandler(object === ret ? map : object, event, f);
        },

        events: {
            map: {
                DRAG_START: 'viewchangestart',
                ZOOM_CHANGED: 'viewchangeend',
                BOUNDS_CHANGED: 'viewchangeend'
            },
            marker: {
                CLICK: 'click'
            },
            search: {
                CHANGED: 'keyup',
                SELECTED: 'places_changed'
            }
        },

        remove: function(_) {map.entities.remove(_);},

        animate: function(_) {},

        stopAnimation: function(_) {},

        center: function() {
            return fromLatLng(map.getCenter());
        },

        centerTo: function(coordinates) {
            var options = map.getOptions();
            options.center = toLatLng(coordinates);
            map.setView(options);
        },

        zoom: function() {
            return map.getZoom();
        },

        zoomTo: function(zoomLevel) {
            var options = map.getOptions();
            options.zoom = zoomLevel;
            map.setView(options);
        },

        bounds: function() {
            var b = map.getBounds();
            return [{latitude: b.getSouth(), longitude: b.getWest()}, {latitude: b.getNorth(), longitude: b.getEast()}];
        },

        newMarker: function(title, coordinates, options) {
            var opts = {};
            for (var p1 in defaultOptions.marker)
                if (defaultOptions.marker.hasOwnProperty(p1))
                    opts[p1] = defaultOptions.marker[p1];
            for (var p2 in options)
                if (options.hasOwnProperty(p2))
                    opts[p2] = options[p2];
            var ret = new Microsoft.Maps.Pushpin(toLatLng(coordinates), opts);
            map.entities.push(ret);
            return ret;
        },

        newPolyline: function(coordinates, options) {
            var opts = {};
            for (var p1 in defaultOptions.polyline)
                if (defaultOptions.polyline.hasOwnProperty(p1))
                    opts[p1] = defaultOptions.polyline[p1];
            for (var p2 in options)
                if (options.hasOwnProperty(p2))
                    opts[p2] = options[p2];
            var ret = new Microsoft.Maps.Polyline(coordinates.map(toLatLng), opts);
            map.entities.push(ret);
            return ret;
        },

        position: function(marker) {
            return fromLatLng(marker.getLocation());
        },

        moveMarker: function(marker, coordinates) {
            marker.setLocation(toLatLng(coordinates));
        }
    };
    return ret;
};