angular.module('worldofcrew-admin', [
        // External modules
        'ngMaterial',
        'angularMoment',
        'picardy.fontawesome',
        'ui.router',
        'ngLodash',
        'btford.socket-io',
        'uiGmapgoogle-maps',
        'ngAnimate',
        'ui.bootstrap',
        'angularUtils.directives.dirPagination',
        'firebase',
        'ui.grid',
        'ui.grid.moveColumns',
        'ui.grid.pagination',
        'ui.grid.exporter',
        'ui.grid.importer',
        'ui.grid.resizeColumns',
        'ng-sweet-alert'
    ])
    .config(function(uiGmapGoogleMapApiProvider, $stateProvider, $urlRouterProvider) {
        uiGmapGoogleMapApiProvider.configure({
           key: 'AIzaSyC0pOdRUVFdpn06ynVPyMngPOJ5_e8R9O0',
            v: '3.20',
            libraries: 'places'
        });
        $urlRouterProvider.otherwise("/login");
        $stateProvider
            .state('login', {
                url: "/login",
                templateUrl: "components/login/login.html",
                controller: "loginController"
            })
            .state('discounts', {
                url: "/discounts",
                templateUrl: "components/discounts/discounts.html",
                controller: "discountController"
            })
            .state('discount/edit', {
                url: "/discount/edit/:id",
                templateUrl: "components/discounts/edit.html",
                controller: "discountController"
            })
            .state('discount/add', {
                url: "/discount/add",
                templateUrl: "components/discounts/add.html",
                controller: "discountController"
            })
            .state('discount/reports', {
                url: "/discount/reports",
                templateUrl: "components/discounts/reports.html",
                controller: "discountController"
            })
            .state('airlines', {
                url: "/airlines",
                templateUrl: "components/airlines/list.html",
                controller: "airlinesController"
            })
            .state('airline/add', {
                url: "/airline/add",
                templateUrl: "components/airlines/add.html",
                controller: "airlinesController"
            })
            .state('airline/edit', {
                url: "/airline/edit/:id",
                templateUrl: "components/airlines/edit.html",
                controller: "airlinesController"
            })
            .state('airline/reports', {
                url: "/airline/reports",
                templateUrl: "components/airlines/reports.html",
                controller: "airlinesController"
            })
            .state('users', {
                url: "/users",
                templateUrl: "components/user/users.html",
                controller: "userController"
            })
            .state('user/edit', {
                url: "/user/edit/:id",
                templateUrl: "components/user/edit.html",
                controller: "userController"
            })
            .state('home', {
                url: "/home",
                templateUrl: "components/home/home.html",
                controller: "homeController"
            })
            .state('tools', {
                url: "/tools",
                templateUrl: "components/tools/list.html",
                controller: "homeController"
            })
            .state('tool/add', {
                url: "/tool/add",
                templateUrl: "components/tools/add.html",
                controller: "homeController"
            })
            .state('tool/edit', {
                url: "/tool/edit/:id",
                templateUrl: "components/tools/edit.html",
                controller: "homeController"
            })
            .state('admins', {
                url: "/admins",
                templateUrl: "components/user/admins.html",
                controller: "userController"
            })
            .state('admin/add', {
                url: "/admin/add",
                templateUrl: "components/user/adminAdd.html",
                controller: "userController"
            })
            .state('admin/edit', {
                url: "/admin/edit/:id",
                templateUrl: "components/user/adminEdit.html",
                controller: "userController"
            });

    })
    .run(function(Log, adminService, $rootScope, $state) {
        var email = localStorage.getItem("email"),
            token = localStorage.getItem("token");
        if (email && token) {
            adminService.token({
                "email": email,
                "token": token
            }).then(function(response) {
                if (response && response !== "") {
                    Log.user = response;
                    $rootScope.loggedIn = true;
                } else {
                    Log.user = "";
                    $state.go("login");
                }
            }, function(err) {
                Log.user = "";
                $state.go("login");
            });
        } else {
            Log.user = "";
            $state.go("login");
        }
        $rootScope.$on("$stateChangeStart", function(e, next, current) {
            if (Log.user !== "" && next.templateUrl === "components/login/login.html") {
                $state.go("home");
                e.preventDefault();
            } else if (Log.user === "" && next.templateUrl !== "components/login/login.html") {
                $state.go("login");
                e.preventDefault();
            }
        });
    })
    // .value('apiValue', 'http://localhost:4142')
    .value('apiValue', 'http://35.162.76.203:4142')
    //socket controller later
    .controller('SocketController', function($scope, socket) {
        $scope.messages = [];
        socket.on('message', function(data) {
            console.log(data);
            $scope.messages.push(data);
        });
        socket.on('NewUser', function(data) {
            console.log('User:', data);
        });
        socket.on('NewPin', function(data) {
            console.log('Pin:', data);
        });
        socket.on('NewCategory', function(data) {
            console.log('Category:', data);
        });
    })
    .controller('toolbarCtrl', function($scope, Log, $rootScope, adminService) {
        $scope.logout = function() {
            $rootScope.loggedIn = false;
            Log.logOut();
        };

        $scope.doc = {
            email: Log.user,
            name: null
        };

        $scope.save = function() {
            adminService.updateAdmin({
                "email": Log.user
            }, {
                "email": $scope.doc.email,
                "name": $scope.doc.name
            }).then(function(response) {
                console.log(response);
            }, function(err) {
                console.log(err);
            });
        }

    })
    .service('Log', function($location) {
        return {
            user: null,
            logOut: function() {
                this.user = "";
                localStorage.clear();
                // $rootScope.toolbar = false;
            }
        };
    })
    .factory('socket', function(socketFactory) {
        return socketFactory();
    });
