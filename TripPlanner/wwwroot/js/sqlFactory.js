(function () {
    'use strict';

    angular
        .module('app')
        .factory('sqlFactory', sqlFactory);

    sqlFactory.$inject = ['$http'];

    function sqlFactory($http) {

        var tripKey;
        var stopKey;
        var tempId;

        alasql("CREATE localStorage DATABASE IF NOT EXISTS db");
        alasql("ATTACH localStorage DATABASE db");
        alasql("USE db");
        
        alasql("CREATE TABLE IF NOT EXISTS trips (id INT PRIMARY KEY, name VARCHAR(50), tripDate DATE)");
        alasql("CREATE TABLE IF NOT EXISTS stops (id INT PRIMARY KEY, name VARCHAR(50), latitude DOUBLE, longitude DOUBLE, stopDate DATE, tripNum INT)");
        alasql("CREATE TABLE IF NOT EXISTS appkey (tripKey INT, stopKey INT)");

        //alasql("TRUNCATE TABLE appkey");
        //alasql("TRUNCATE TABLE trips");
        //alasql("TRUNCATE TABLE stops");

        var count = alasql("SELECT tripKey, stopKey FROM appkey");
        if (!count || count.length === 0) {
            alasql("INSERT INTO appkey (tripKey, stopKey) VALUES (?, ?)", [parseInt("1"), parseInt("1")]);
        }

        var service = {
            addTrip: addTrip,
            deleteTrip: deleteTrip,
            getTrip: getTrip,
            getAllTrips: getAllTrips,

            addStop: addStop,
            deleteStop: deleteStop,
            getStop: getStop,
            getAllStops: getAllStops,

            transferId: transferId
        };

        return service;

        function addTrip(name, tripDate) {
            alasql("INSERT INTO trips (id, name, tripDate) VALUES (?, ?, ?)", [parseInt(tripKey), String(name), Date(tripDate)]);
            var result = { id: tripKey, name: name, startDate: tripDate };
            tripKey += 1;
            alasql("UPDATE appkey SET tripKey =?", [tripKey]);
            return result;
        }

        function deleteTrip(id) {
            alasql("DELETE FROM trips WHERE id=?", [parseInt(id)]);
            alasql("DELETE FROM stops WHERE tripNum=?", [parseInt(id)]);
            var count = alasql("SELECT id FROM trips");
            if (!count || count.length === 0) {
                alasql("UPDATE appkey SET tripKey=?", [parseInt("1")]);
                tripKey = 1;
            }
        }

        function getTrip(id) {
            var result = alasql("SELECT id, name, tripDate FROM trips WHERE id=?", [parseInt(id)]);
            return result;
        }

        function getAllTrips() {
            var result = alasql("SELECT id, name, tripDate FROM trips");
            if (result.length === 0) {
                alasql("UPDATE appkey SET tripKey=?", [parseInt("1")]);
                tripKey = 1;
            } else {
                var tempKey = alasql("SELECT tripKey from appkey");
                tripKey = tempKey[0].tripKey;
            }
            return result;
        }

        function addStop(name, latitude, longitude, stopDate, tripNum) {
            alasql("INSERT INTO stops (id, name, latitude, longitude, stopDate, tripNum) VALUES (?, ?, ?, ?, ?, ?)", [parseInt(stopKey), String(name), latitude, longitude, stopDate, parseInt(tripNum)]);
            var result = { id: stopKey, name: name, latitude: latitude, longitude: longitude, stopDate: stopDate, tripNum: tripNum };
            stopKey += 1;
            alasql("UPDATE appkey SET stopKey =?", [stopKey]);
            return result;
        }

        function deleteStop(id) {
            alasql("DELETE FROM stops WHERE id=?", [parseInt(id)]);
            var count = alasql("SELECT id FROM stops");
            if (!count || count.length === 0) {
                alasql("UPDATE appkey SET stopKey=?", [parseInt("1")]);
                stopKey = 1;
            }
        }

        function getStop(id) {
            var result = alasql("SELECT id, name, latitude, longitude, stopDate, tripNum FROM stops WHERE Id=?", [praseInt(id)]);
            return result;
        }

        function getAllStops(tripNum) {
            var result = alasql("SELECT id, name, latitude, longitude, stopDate, tripNum FROM stops WHERE tripNum=?", [tripNum]);
            if (result.length === 0) {
                alasql("UPDATE appkey SET stopKey=?", [parseInt("1")]);
                stopKey = 1;
            } else {
                var tempKey = alasql("SELECT stopKey from appkey");
                stopKey = tempKey[0].stopKey;
            }
            return result;
        }

        function transferId(id) {
            tempId = id;
        }

    }
})();