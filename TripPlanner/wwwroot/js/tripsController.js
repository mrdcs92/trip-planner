// tripsController.js

(function () {

    "use strict";

    angular.module("app")
        .controller("tripsController", tripsController);

    tripsController.$inject = ["sqlFactory"];

    function tripsController(sqlFactory) {

        var vm = this;
        var tempId;

        vm.isBusy = true;
        vm.errorMessage = "";

        vm.trips = [];
        vm.newTrip = {};

        vm.addTrip = function () {
            vm.isBusy = true;
            try {
                var result = sqlFactory.addTrip(vm.newTrip.name, new Date());
                vm.trips.push({ id: result.id, name: vm.newTrip.name, tripDate: new Date() });
            }
            catch (err) {
                vm.errorMessage = "Failed to add trip: " + err;
                console.log(err);
            }
            vm.isBusy = false;
            vm.newTrip = {};
        };

        vm.deleteTrip = function () {
            var id = tempId;
            try {
                sqlFactory.deleteTrip(id);
                vm.trips = vm.trips.filter(function (trip) {
                    return trip.id !== id;
                });
            }
            catch (err) {
                vm.errorMessage = "Failed to delete trip: " + err;
                console.log(err);
            }
        };

        vm.getAllTrips = function () {
            try {
                var trips = sqlFactory.getAllTrips();
                if (trips.length > 0) {
                    for (var i = 0; i < trips.length; i++) {
                        vm.trips.push({
                            id: parseInt(trips[i].id),
                            name: String(trips[i].name),
                            tripDate: new Date(trips[i].tripDate)
                        });
                    }
                }
                vm.isBusy = false;
            }
            catch (err) {
                vm.isBusy = false;
                vm.errorMessage = "Failed to load trips: " + err;
                console.log(err);
            }
        };

        vm.setId = function (id) {
            tempId = id;
        };

        vm.transferId = function (id) {
            sqlFactory.transferId(id);
        };

        vm.getAllTrips();
        

    }

})();