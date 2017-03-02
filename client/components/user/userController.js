angular
    .module('worldofcrew-admin')
    .controller("userController", function($scope, userService, $mdDialog, $rootScope, $state, adminService) {

        if ($state.current.url === '/users') {

            $rootScope.title = 'Users';

            $scope.gridOptions = {
                enableFiltering: true,
                paginationPageSizes: [5, 10, 50, 100],
                paginationPageSize: 50,
                enableGridMenu: true,
                exporterMenuPdf: false,
                exporterCsvFilename: 'discounts.csv',
                importerDataAddCallback: function (grid, newObjects) {
                    $scope.gridOptions.data = $scope.gridOptions.data.concat(newObjects);
                },
                onRegisterApi: function(gridApi){
                    $scope.gridApi = gridApi;
                }
            };

            $scope.gridOptions.columnDefs = [
                { name: 'Status', cellTemplate: '<div><span ng-if="row.entity.disabled" style="color: red;">Disabled</span><span ng-if="!row.entity.disabled" style="color: green;">Active</span></div>' },
                { field: 'firstName', displayName: 'First Name' },
                { field: 'lastName', displayName: 'Last Name' },
                { field: 'email', displayName: 'Email' },
                { field: 'lastLogin', displayName: 'Last Login' },
                { name: 'Operations', cellTemplate: '<div><a href="#!/user/edit/{{row.entity._id}}" style="cursor:pointer">Edit</a> | <a ng-click="grid.appScope.deleteUser(row.entity)" style="cursor:pointer">Delete</a></div>', width: 100 }
            ];

            function getUsersBaby() {
                userService.getUsers().then(function(response) {
                    $scope.users = response.data;
                    $scope.gridOptions.data = $scope.users;
                });
            }
            getUsersBaby();

            // @TODO:
            // test the delete functionality
            // if posible write a service for confirmation dialog.
            $scope.deleteUser = function(user) {
                var confirm = $mdDialog.confirm()
                    .title('Would you like to delete the user?')
                    .content('add a proper message here, you can ask Aaron!')
                    .ariaLabel('Delete User')
                    .ok('Delete')
                    .cancel('Cancel')
                    .targetEvent(user);

                $mdDialog.show(confirm).then(function() {
                    // add the delete
                    userService.deleteUser(user._id).then(function(response) {
                        if (response.status === 200) {
                            getUsersBaby();
                        } else {
                            console.log('Server Error', response.status);
                        }
                    });
                }, function() {
                    // do nothing
                    console.log('Delete canceled');
                });
            };

        } else if ($state.current.url === '/user/edit/:id') {

            $rootScope.title = 'User edit';

            userService.getUser($state.params.id).then(function(response) {
                $scope.doc = response.data;

                var birthday = new Date($scope.doc.birthday);
                var today = new Date();
                var age = ((today - birthday) / (31557600000));
                var age = Math.floor( age );
                $scope.age = age;

            });

            $scope.save = function() {
                userService.updateUser($scope.doc, $scope.doc).then(function(response) {
                    // $state.reload();
                });
            }

        }


        /**
            Admin
        **/
        // Admins List
        if ($state.current.name === 'admins') {

            $rootScope.title = 'Admins';

            function getAdminsBaby() {
                adminService.getUsers().then(function(response) {
                    $scope.admins = response.data;
                    $scope.gridOptions.data = $scope.admins;
                });
            }
            getAdminsBaby();

            $scope.gridOptions = {
                enableFiltering: true,
                paginationPageSizes: [10, 50, 100],
                paginationPageSize: 50,
                enableGridMenu: true,
                exporterMenuPdf: false,
                exporterCsvFilename: 'admins.csv',
                onRegisterApi: function(gridApi){
                    $scope.gridApi = gridApi;
                }
            };

            $scope.gridOptions.columnDefs = [
                { field: 'email', displayName: 'Email' },
                { name: 'Operations', cellTemplate: '<div><a href="#!/admin/edit/{{row.entity._id}}">Edit</a> | <a ng-click="grid.appScope.adminDelete(row.entity, row.entity)" style="cursor:pointer;">Delete</a></div>', width: 100 }
            ];

            $scope.adminDelete = function(admin) {
                var confirm = $mdDialog.confirm()
                    .title('Would you like to delete the admin?')
                    .content('add a proper message here, you can ask Aaron!')
                    .ariaLabel('Delete User')
                    .ok('Delete')
                    .cancel('Cancel')
                    .targetEvent(admin);

                $mdDialog.show(confirm).then(function() {
                    // add the delete
                    adminService.deleteUser(admin._id).then(function(response) {
                        if (response.status === 200) {
                            getAdminsBaby();
                        } else {
                            console.log('Server Error', response.status);
                        }
                    });
                }, function() {
                    // do nothing
                    console.log('Delete canceled');
                });
            };

        } else if ($state.current.name === 'admin/add') {

            $rootScope.title = 'Admin Add';

            $scope.doc = {
                user: {
                    email: '',
                    password: ''
                }
            };

            $scope.save = function() {
                adminService.insertUser($scope.doc).then(function(response) {
                    console.log(response);
                });
            }

        } else if ($state.current.name === 'admin/edit') {

            $rootScope.title = 'Admin Edit';

            adminService.getUser($state.params.id).then(function(response) {
                $scope.doc = response.data;
            });

            $scope.save = function() {
                $scope.doc.updated = new Date();
                adminService.updateTool($scope.doc._id, $scope.doc).then(function(response) {
                    if (response.status !== 200) {
                        alert('Error');
                    }
                });
            }

        }

    });
