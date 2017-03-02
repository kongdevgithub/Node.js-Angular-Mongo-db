angular
    .module('worldofcrew-admin')
    .service('airlineService', ['$http', '$q', '$log', 'apiValue', function($http, $q, $log, apiValue) {
        var urlBase = apiValue + '/api/v1/airlines';
        return {
            getAirlines: function() {
                return $http.get(urlBase);
            },
            getAirline: function(id) {
                return $http.get(urlBase + '/' + id);
            },
            insertAirline: function(airline) {
                return $http.post(urlBase, airline);
            },
            updateAirline: function(id, airline) {
                return $http.put(urlBase + '/' + id, airline);
            },
            deleteAirline: function(id) {
                return $http.delete(urlBase + '/' + id);
            }
        };
    }]);
