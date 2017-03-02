angular
    .module('worldofcrew-admin')
    .service('discountService', ['$http', '$q', '$log', 'apiValue', function($http, $q, $log, apiValue) {
        var urlBase = apiValue + '/api/v1/pins';
        var categoriesUrl = apiValue + '/api/v1/categories'
        return {
            getPins: function() {
                return $http.get(urlBase);
            },
            getPin: function(id) {
                return $http.get(urlBase + '/' + id);
            },

            insertPin: function(pin) {
                var d = new Date(pin.expires);
                var fd = new FormData();
                _.forEach(pin, function(data, key) {
                    console.log(key + ':' + data);
                    fd.append(key, data);
                    console.dir('form with file:::', fd);
                });
                return $http.post(urlBase, fd, {
                    transformRequest: angular.identity,
                    headers: {
                        'Content-Type': undefined
                    }
                });
            },
            proceedThisFuckingDataFromFirebase: function(x) {
                return $http.post(apiValue + '/api/v1/proceed', x);
            },
            updatePin: function(id, pin) {
                var fd = new FormData();
                _.forEach(pin, function(data, key) {
                    console.log(key + ':' + data);
                    fd.append(key, data);
                    console.dir('form with file:::', fd);
                });
                return $http.put(urlBase + '/' + id, fd, {
                    transformRequest: angular.identity,
                    headers: {
                        'Content-Type': undefined
                    }
                });
            },

            deletePin: function(id) {
                return $http.delete(urlBase + '/' + id);
            },
            getCategories: function() {
                return $http.get(categoriesUrl);
            }
        };
    }]);
