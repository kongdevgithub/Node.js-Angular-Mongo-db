'use strict';

angular
    .module('worldofcrew-admin')
    .controller("loginController", function($scope, $location, adminService, Log, $rootScope) {
        $scope.user = {};
        $rootScope.title = 'Login';

        $scope.login = function () {
            if ($scope.user.email && $scope.user.password) {
                adminService.login($scope.user).then(function(admin) {
                    Log.user = admin.email;
                    $rootScope.loggedIn = true;
                    $location.path("home");
                }, function(err) {
                    $scope.error = err;
                });
            }
        };
    });
