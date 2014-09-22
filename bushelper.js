var bushelper = function(logger, ui, util, messaging, busAPI /*fn*/, siriAPI, siriRTAPI, config, body /*fn*/, templates) {
    var ret = {
        updateLineRoute: function(code, maps, mapState) {
            mapState.lineShapes.forEach(maps.remove);
            busAPI().get(busAPI().LINES, {p: '10000001', query: code}, function(json) {
                json = json === '' ? [] : json;
                mapState.lineShapes = json.filter(function(_) {return _.code == code;}).map(function(_) {
                    var coords = busAPI().parseLineShape(_.line_shape);
                    logger.log('Drawing polyline of length: ' + coords.length);
                    return maps.newPolyline(coords);
                });
            });
            return false;
        },

        updateStopBuses: function(code) {
            var updateStopDepartures = function() {
                body().stop.departures().innerHTML = templates.spinner({});
                busAPI().get(busAPI().STOP, {p: '00000000001', code: code}, function(json) {
                    json = json instanceof Array ? json[0] : json;

                    if (!json.departures || json.departures.length === 0) {
                        body().stop.departures().innerHTML = templates.noDepartureData({});
                    } else {
                        var rows = json.departures.map(function (_) {
                            var stamp = busAPI().parseDate(_.date);
                            var time = busAPI().parseTime(_.time);
                            stamp.setHours(time.hours);
                            stamp.setMinutes(time.minutes);
                            var now = new Date();
                            var etd = Math.floor((stamp - now)/1000/60 + time.days*24*60);
                            etd = etd < 0 ? 0 : etd;
                            return templates.etd({
                                code: _.code,
                                time: time.toString(),
                                estimate: {
                                    em: {
                                        span: etd
                                    }
                                }
                            });
                        });
                        body().stop.departures().innerHTML = rows.join('');
                    }
                });
            };

            var updateStopGPS = function() {
                body().stop.gps().innerHTML = templates.spinner({});
                siriAPI.get(siriAPI.STOP(code), function(_) {
                    var visits = _.Siri.ServiceDelivery.StopMonitoringDelivery.MonitoredStopVisit;
                    if (!visits) {
                        body().stop.gps().innerHTML = templates.noDepartureData({});
                    } else {
                        visits = visits instanceof Array ? visits : [visits];
                        var rows = visits.map(function(_) {
                            var lineRef = _.MonitoredVehicleJourney.LineRef;
                            var origin = _.MonitoredVehicleJourney.OriginName;
                            var destination = _.MonitoredVehicleJourney.DestinationName;
                            var vehicleRef = _.MonitoredVehicleJourney.VehicleRef;

                            var stamp = new Date(_.MonitoredVehicleJourney.MonitoredCall.ExpectedDepartureTime);
                            var now = new Date();
                            var etd = Math.floor((stamp.getTime() - now.getTime())/1000/60);

                            return templates.etd({
                                code: lineRef,
                                time: stamp.getHours() + ':' + stamp.getMinutes(),
                                estimate: {
                                    em: {
                                        span: etd
                                    }
                                }
                            });
                        });
                        body().stop.gps().innerHTML = rows.join('');
                    }
                });
            };

            var updateStopLines = function() {
                body().stop.lines().innerHTML = templates.spinner({});
                busAPI().get(busAPI().STOP, {p: '0000001', code: code}, function(json) {
                    json = json instanceof Array ? json[0] : json;

                    if (!json.lines || json.lines.length === 0) {
                        body().stop.lines().innerHTML = templates.noLineData({});
                    } else {
                        var rows = json.lines.map(function(_) {
                            var lineCode = _.substr(0, _.indexOf(':'));
                            var route = _.substr(_.indexOf(':')+1);
                            return templates.showLine({
                                code: {
                                    a: lineCode
                                },
                                text: route
                            });
                        });
                        body().stop.lines().innerHTML = rows.join('');
                    }
                });
            };

            if (ui.visible(body().stop.departures())) {
                updateStopDepartures();
            }
            if (ui.visible(body().stop.gps())) {
                updateStopGPS();
            }
            if (ui.visible(body().stop.lines())) {
                updateStopLines();
            }
        },

        updateNearByBusStops: function(maps, mapState, lastFetchedLocation) {
            var bounds = maps.bounds();
            if (!bounds)
                return lastFetchedLocation;
            var bbox = [bounds[0].longitude, bounds[0].latitude, bounds[1].longitude, bounds[1].latitude].join(',');
            var center = maps.center();
            if (lastFetchedLocation === null || mapState.stopsFetchedFor.indexOf(bbox) == -1 && util.shouldFetchStops(bounds, lastFetchedLocation, center)) {
                mapState.stopsFetchedFor.push(bbox);
                busAPI().get(busAPI().STOPS_AREA, {limit: 500, center_coordinate: center.longitude + ',' + center.latitude, diameter: 2000}, function(json) {
                    json = json === '' ? [] : json;
                    var opts = {icon: util.icons.stop};
                    if (json.length > 10)
                        opts.animation = null; // iOS7 crashes with many simultaneous GMaps animations...
                    json.forEach(function(stop) {
                        if (!mapState.stopMarkers[stop.code]) {
                            var coords = busAPI().parseCoordinates(stop.coords);
                            var stopMarker = maps.newMarker(stop.code + ' ' + stop.name, coords, opts);

                            var stopClicked = function(e) {
                                if (e.stop) e.stop();
                                if (mapState.selectedStop) {
                                    maps.stopAnimation(mapState.stopMarkers[mapState.selectedStop]);
                                    if (mapState.selectedStop == stop.code) {
                                        mapState.selectedStop = undefined;
                                        ui.hideAnimated(body().stop());
                                        return;
                                    }
                                }
                                mapState.selectedStop = stop.code;
                                maps.animate(stopMarker);
                                body().stop.H3().innerHTML = stop.code + ' ' + stop.name;
                                ui.show(body().stop());
                                messaging.addInfoOnce('Swipe right to hide stop info.');
                                ret.updateStopBuses(stop.code);
                            };

                            stopMarker.code = stop.code;
                            mapState.stopMarkers[stop.code] = stopMarker;
                            maps.on(maps.events.marker.CLICK, stopMarker, stopClicked);
                        }
                    });
                });
            }
            return center;
        },

        updateBuses: function(maps, mapState) {
            /* don't bother trying in other cities... */
            if (util.nearerToTampere(maps.center(), config.tampereCoordinates, config.helsinkiCoordinates)) {
                siriRTAPI.get(function(_) {
                    var delivery = _.Siri.ServiceDelivery.VehicleMonitoringDelivery;
                    if (!(delivery instanceof Array))
                        delivery = [delivery];
                    delivery.forEach(function(_) {
                        var activity = _.VehicleActivity;
                        if (!(activity instanceof Array))
                            activity = [activity];
                        activity.forEach(function(_) {
                            var vehicle = _.MonitoredVehicleJourney.VehicleRef.value;
                            var line = _.MonitoredVehicleJourney.LineRef.value;
                            var coords = _.MonitoredVehicleJourney.VehicleLocation;
                            var busMarker = mapState.busMarkers[vehicle];

                            if (!busMarker) {
                                var direction = _.MonitoredVehicleJourney.DirectionRef.value;
                                var origin = _.MonitoredVehicleJourney.OriginName.value;
                                var destination = _.MonitoredVehicleJourney.DestinationName.value;

                                var busClicked = function() {
                                    if (mapState.selectedBus) {
                                        maps.stopAnimation(mapState.busMarkers[mapState.selectedBus]);
                                        if (mapState.selectedBus == vehicle) {
                                            mapState.selectedBus = undefined;
                                            return;
                                        }
                                    }
                                    state.followMe = false;
                                    maps.animate(busMarker);
                                    mapState.selectedBus = vehicle;
                                    messaging.addInfo('Line ' + line + ': ' + origin + ' -> ' + destination);
                                    ret.updateLineRoute(line + ' ' + direction, maps, mapState);
                                };

                                logger.log('Adding bus ' + vehicle + ' to: ' + coords);
                                busMarker = maps.newMarker(origin + ' -> ' + destination, coords, {icon: util.icons.number(line.replace(/[^0-9]/g, '')), zIndex: 500});
                                busMarker.line = line;
                                mapState.busMarkers[vehicle] = busMarker;
                                maps.on(maps.events.marker.CLICK, busMarker, busClicked);
                            } else {
                                var bounds = maps.bounds();
                                if (bounds && util.within(coords, bounds) || util.within(maps.position(busMarker), bounds)) {
                                    logger.log('Moving bus ' + line);
                                    maps.moveMarker(busMarker, coords);
                                    if (!state.followMe && vehicle == mapState.selectedBus)
                                        maps.centerTo(coords);
                                }
                            }
                        });
                    });
                });
            }
        }
    };
    return ret;
};