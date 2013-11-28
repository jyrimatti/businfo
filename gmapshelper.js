var gmapshelper = function(canvasElement, searchInput, options) {
    var defaultOptions = {
        map: {
            zoom: 16,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            animation: google.maps.Animation.BOUNCE
        },
        marker: {
            animation: google.maps.Animation.DROP,
            icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        },
        polyline: {
            strokeColor: '#D1FF00',
            strokeOpacity: 0.75,
            strokeWeight: 2
        },
        search: {
            position: google.maps.ControlPosition.BOTTOM_LEFT
        }
    };

    for (var p1 in options)
        if (options.hasOwnProperty(p1))
            for (var pp1 in options[p1])
                if (options[p1].hasOwnProperty(pp1))
                    defaultOptions[p1][pp1] = options[p1][pp1];

    google.maps.visualRefresh = true;

    var mapOpts = {};
    for (var p2 in defaultOptions.map)
        if (defaultOptions.map.hasOwnProperty(p2))
            mapOpts[p2] = defaultOptions.map[p2];
    var map = new google.maps.Map(canvasElement, mapOpts);

    // search box
    map.controls[defaultOptions.search.position].push(searchInput);
    var searchBox = new google.maps.places.SearchBox(searchInput);
    google.maps.event.addListener(searchBox, 'places_changed', function() {
        var bounds = new google.maps.LatLngBounds();
        searchBox.getPlaces().forEach(function(_) {
            bounds.extend(_.geometry.location);

            new google.maps.Marker({
                map: map,
                icon: ret.icons.RED_DOT,
                title: _.name,
                position: _.geometry.location
            });
        });
        map.fitBounds(bounds);
    });
    google.maps.event.addListener(map, 'bounds_changed', function() {
        if (searchInput.hasAttribute('autofocus'))
            searchInput.focus();
        searchBox.setBounds(map.getBounds());
    });

    var toLatLng = function(coords) {
        return new google.maps.LatLng(coords.latitude || coords.Latitude, coords.longitude || coords.Longitude);
    };

    var fromLatLng = function(latlng) {
        return { latitude: latlng.lat(), longitude: latlng.lng() };
    };

    var ret = {
        icons: {
            RED_DOT: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
            BLUE_DOT: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            GREEN_DOT: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
        },

        events: {
            map: {
                DRAG_START: 'dragstart',
                ZOOM_CHANGED: 'zoom_changed',
                BOUNDS_CHANGED: 'dragend'
            },
            marker: {
                CLICK: 'click'
            },
            search: {
                CHANGED: 'keyup',
                SELECTED: 'places_changed'
            }
        },

        on: function(event, object, f) {
            if (event == ret.events.search.CHANGED) {
                searchInput.addEventListener(event, f);
            } else if (event == ret.events.search.SELECTED) {
                google.maps.event.addListener(searchBox, event, f);
            } else {
                google.maps.event.addListener(object === ret ? map : object, event, f);
            }
        },

        searchString: function() {
            return searchInput.value;
        },

        remove: function(_) {_.setMap(null);},

        animate: function(_) {_.setAnimation(defaultOptions.map.animation);},

        stopAnimation: function(_) {_.setAnimation(null);},

        center: function() {
            return fromLatLng(map.getCenter());
        },

        centerTo: function(coordinates) {
            map.panTo(toLatLng(coordinates));
        },

        zoom: function() {
            return map.getZoom();
        },

        zoomTo: function(zoomLevel) {
            map.setZoom(zoomLevel);
        },

        bounds: function() {
            var b = map.getBounds();
            return !b ? b : [fromLatLng(b.getSouthWest()), fromLatLng(b.getNorthEast())];
        },

        newMarker: function(title, coordinates, options) {
            var opts = {
                title: title,
                map: map,
                position: toLatLng(coordinates)
            };
            for (var p1 in defaultOptions.marker)
                if (defaultOptions.marker.hasOwnProperty(p1))
                    opts[p1] = defaultOptions.marker[p1];
            for (var p2 in options)
                if (options.hasOwnProperty(p2))
                    opts[p2] = options[p2];
            return new google.maps.Marker(opts);
        },

        newPolyline: function(coordinates, options) {
            var opts = {
                path: coordinates.map(toLatLng),
                map: map
            };
            for (var p1 in defaultOptions.polyline)
                if (defaultOptions.polyline.hasOwnProperty(p1))
                    opts[p1] = defaultOptions.polyline[p1];
            for (var p2 in options)
                if (options.hasOwnProperty(p2))
                    opts[p2] = options[p2];
            return new google.maps.Polyline(opts);
        },

        position: function(marker) {
            return fromLatLng(marker.getPosition());
        },

        moveMarker: function(marker, coordinates) {
            marker.setPosition(toLatLng(coordinates));
        }
    };
    return ret;
};