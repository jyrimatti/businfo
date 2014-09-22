var util = function(tampereCoordinates, helsinkiCoordinates) {
    return {
        icons: {
            number: function(num) {
                return 'icons/number_' + num + '.png';
            },
            stop: 'icons/busstop.png'
        },

        nearerToTampere: function(loc, tampereCoordinates, helsinkiCoordinates) {
            var distanceBetween = function(coord1, coord2) {
                return Math.sqrt(Math.pow(coord1.latitude - coord2.latitude, 2) + Math.pow(coord1.longitude - coord2.longitude, 2));
            };
            var dTampere = distanceBetween(loc, tampereCoordinates);
            var dHelsinki = distanceBetween(loc, helsinkiCoordinates);
            return dTampere < dHelsinki;
        },

        within: function(coords, bounds) {
            var sw = bounds[0];
            var ne = bounds[1];
            return coords.latitude >= sw.latitude && coords.latitude <= ne.latitude &&
                   coords.longitude >= sw.longitude && coords.longitude <= ne.longitude;
        },

        shouldFetchStops: function(mapBounds, c1, c2) {
            var width = mapBounds[1].longitude - mapBounds[0].longitude;
            var height = mapBounds[1].latitude - mapBounds[0].latitude;
            var dx = Math.abs(c1.longitude - c2.longitude);
            var dy = Math.abs(c1.latitude - c2.latitude);
            return c1.longitude == c2.longitude && c1.latitude == c2.latitude || dx > width/10.0 || dy > height / 10.0;
        },

        distanceKm: function(point1, point2) {
            var deg2rad = function(deg) {
                return deg * (Math.PI/180);
            };

            var dLat = deg2rad(point2.latitude-point1.latitude);
            var dLon = deg2rad(point2.longitude-point1.longitude);
            var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(point1.latitude)) * Math.cos(deg2rad(point2.latitude)) * Math.sin(dLon/2) * Math.sin(dLon/2);
            return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        },

        distance: function(a,b) {
            return Math.sqrt(Math.pow(b.latitude - a.latitude, 2) + Math.pow(b.longitude - a.longitude, 2));
        }
    };
};