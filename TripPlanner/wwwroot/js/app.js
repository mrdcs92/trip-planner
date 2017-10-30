// app.js

(function () {

    "use strict";

    angular.module("app", ["simpleControls", "ngRoute"])
        .config(function ($routeProvider) {

            $routeProvider.when("/", {
                controller: "tripsController",
                controllerAs: "vm",
                templateUrl: "/views/tripsView.html"
            });

            $routeProvider.when("/editor/:tripName/:tripId", {
                controller: "stopsController",
                controllerAs: "vm",
                templateUrl: "/views/stopsView.html"
            });

            $routeProvider.otherwise({ redirectTo: "/" });

        });

})();