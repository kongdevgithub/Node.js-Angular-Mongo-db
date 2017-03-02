angular
    .module('worldofcrew-admin')
    .service('adminService', ['$http', '$q', '$log', 'apiValue', function($http, $q, $log, apiValue) {
        var urlBase = apiValue + '/api/admin/users';
        var urlBaseTools = apiValue + '/api/v1/tools';

        return {
            getUsers: function() {
                return $http.get(urlBase);
            },
            getUser: function(id) {
                return $http.get(urlBase + '/' + id);
            },

            insertUser: function(user) {
                return $http.post(urlBase, user);
            },

            updateUser: function(user) {
                return $http.put(urlBase + '/' + user._id, user);
            },

            updateAdmin: function(a, b) {
                return $http.put(urlBase + '/', b);
            },

            deleteUser: function(id) {
                return $http.delete(urlBase + '/' + id);
            },
            login: function (user) {
                var defer = $q.defer();
                $http.post(urlBase, {"login":user}).then(function(response) {
                    if (response.status === 200) {
                        localStorage.setItem("email", response.data.email);
                        localStorage.setItem("token", response.data.token);
                        defer.resolve(response.data);
                    }
                    else {
                        defer.reject("Login Failed");
                    }
                }, function(err) {
                    defer.reject(err.data);
                });
                return defer.promise;
            },
            token: function (user) {
                var defer = $q.defer();
                $http.post(urlBase, {"login":user}).then(function(response) {
                    if (response.status === 200) {
                        defer.resolve(response.data.email);
                    }
                    else {
                        defer.reject(response.data);
                    }
                }, function(err) {
                    defer.reject(err.data);
                });
                return defer.promise;
            },
            getTools: function() {
                return $http.get(urlBaseTools);
            },
            getTool: function(id) {
                return $http.get(urlBaseTools + '/' + id);
            },
            insertTool: function(tool) {
                return $http.post(urlBaseTools, tool);
            },
            updateTool: function(id, tool) {
                return $http.put(urlBaseTools + '/' + id, tool);
            },
            deleteTool: function(id) {
                return $http.delete(urlBaseTools + '/' + id);
            }
        };
    }]);
