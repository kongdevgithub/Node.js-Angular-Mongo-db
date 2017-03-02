angular
    .module('worldofcrew-admin')
    .service('userService', ['$http', '$q', '$log', 'apiValue', function($http, $q, $log, apiValue) {
        var urlBase = apiValue + '/api/v1/users';
        return {
            getUsersCount: function() {
                return $http.get('/api/v1/userCount');
            },
            getUsers: function() {
                return $http.get(urlBase);
            },
            getUser: function(id) {
                return $http.get(urlBase + '/' + id);
            },

            insertUser: function(user) {
                return $http.post(urlBase, user);
            },

            updateUser: function(user, userUpdate) {
                return $http.put(urlBase + '/' + user._id, userUpdate);
            },
            deleteUser: function(id) {
                return $http.delete(urlBase + '/' + id);
            },
            totalAndroidDownloads: function() {
                return $http.get('/api/v1/totalDownloads/android');
            },
        };
    }]);
