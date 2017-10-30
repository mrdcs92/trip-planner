// stopsController.js

(function () {

    "use strict";

    angular.module("app")
        .controller("stopsController", ["$routeParams", "$q", "sqlFactory", stopsController]);

    //stopsController.$inject = ["sqlFactory"];

    function stopsController($routeParams, $q, sqlFactory) {

        var vm = this;
        vm.tripName = $routeParams.tripName;
        vm.tripNum = $routeParams.tripId;
        vm.selectedTrip = {};
        vm.newStop = {};
        vm.stops = [];
        vm.errorMessage = "";
        vm.isBusy = true;

        vm.getTrip = function () {
            var trip = sqlFactory.getTrip(parseInt(vm.tripNum));
            vm.selectedTrip = { id: trip[0].id, name: trip[0].name, tripDate: new Date(trip[0].tripDate) };
        };

        vm.addStop = function () {
            console.log(vm.newStop);
            vm.isBusy = true;
            vm.errorMessage = "";
            var result;
            try {
                vm.getCoords(vm.newStop.name, function (result) {
                    if (result === "error") {
                        $q.all(vm.falseFunction())
                            .then(function (result) {
                                vm.isBusy = false;
                                vm.errorMessage = "Error finding entered location.";
                            }, function (err) {
                                vm.isBusy = false;
                                vm.errorMessage = "Error finding entered location.";
                            });
                    }
                    else {
                        $q.all(sqlFactory.addStop(vm.newStop.name, result.lat, result.lng, vm.newStop.stopDate, vm.tripNum))
                            .then(function (stop) {
                                vm.stops.push({
                                    id: parseInt(stop.id),
                                    name: String(stop.name),
                                    latitude: stop.latitude,
                                    longitude: stop.longitude,
                                    stopDate: vm.newStop.stopDate,
                                    tripNum: parseInt(stop.tripNum)
                                });
                                _showMap(vm.stops);
                                vm.isBusy = false;
                            }, function (err) {
                                vm.isBusy = false;
                                vm.errorMessage("Error saving entered location: " + err);
                            });
                    }
                });
            }
            catch (err) {
                vm.isBusy = false;
                vm.errorMessage = "Error saving stop: " + err;
            }
            //vm.newStop = {};
        };

        vm.getCoords = function (name, callback) {
            var location = name;
            var result = "";
            location = location.replace(" ", "+");
            var url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + location + "&key=AIzaSyDLPES6mshC7iFjB_i4oZBphQ3lNf6g0pw";

            $.getJSON(url)
                .done(function (data) {
                    if (data.status === "OK") {
                        result = {
                            lat: data.results[0].geometry.location.lat,
                            lng: data.results[0].geometry.location.lng
                        };
                        callback(result);
                    }
                    else {
                        result = "error";
                        callback(result);
                    }
                })
                .fail(function (err) {
                    result = "error finding location: " + err;
                });
        };

        vm.falseFunction = function () {
            return "Error finding location.";
        };

        vm.getAllStops = function () {
            vm.isBusy = true;
            try {
                var stops = sqlFactory.getAllStops(parseInt(vm.tripNum));
                if (stops.length > 0) {
                    angular.copy(stops, vm.stops);
                    _showMap(vm.stops);
                }
                vm.isBusy = false;
            }
            catch (err) {
                vm.isBusy = false;
                vm.errorMessage = "Failed to load stops: " + err;
            }
        };

        vm.deleteStop = function (id) {
            try {
                sqlFactory.deleteStop(id);
                vm.stops = vm.stops.filter(function (stop) {
                    return stop.id !== id;
                });
                _showMap(vm.stops);
            }
            catch (err) {
                vm.errorMessage = "Failed to delete stop: " + err;
            }
        }

        function _showMap(stops) {
            if (stops && stops.length > 0) {
                var mapStops = _.map(stops, function (item) {
                    return {
                        lat: item.latitude,
                        long: item.longitude,
                        info: item.name
                    };
                });

                // Show Map
                travelMap.createMap({
                    stops: mapStops,
                    selector: "#map",
                    currentStop: 0,
                    initialZoom: 3
                });
            }
        }

        vm.getTrip();
        vm.getAllStops();

    }

})();