angular
.module('worldofcrew-admin')
.controller("homeController", function($scope, $state, discountService, userService, $modal, $mdDialog, uiGmapGoogleMapApi, $rootScope, $firebaseArray, adminService, SweetAlert) {

    if ($state.current.name === 'home') {
        $rootScope.title = 'Home';

        discountService.getPins().then(function(response) {
            $scope.discounts = response.data;
        });

        userService.getUsersCount().then(function(response) {
            $scope.usersCount = response.data.amount;
            $scope.stat = response.data.stat
        });

        var refReports = firebase.database().ref('/reports');
        $scope.reportedDiscounts = $firebaseArray(refReports);

        var refAirlines = firebase.database().ref('/airlines');
        $scope.airlines = $firebaseArray(refAirlines);

        userService.getUsers().then(function(response) {
            $scope.fbUsers = response.data;
        });

        var refEmailUsers = firebase.database().ref('/user_details');
        $scope.emailUsers = $firebaseArray(refEmailUsers);

        userService.totalAndroidDownloads().then(function(response) {
            $scope.totalAndroidDownloads = response.data.total;
        });

    } else if ($state.current.name === 'tools') {

        $rootScope.title = 'Tools';

        function getToolsBaby() {
            adminService.getTools().then(function(response) {
                $scope.tools = response.data;
                $scope.gridOptions.data = $scope.tools;
            });
        }
        getToolsBaby();

        $scope.gridOptions = {
            enableFiltering: true,
            paginationPageSizes: [10, 50, 100],
            paginationPageSize: 50,
            enableGridMenu: true,
            exporterMenuPdf: false,
            exporterCsvFilename: 'tools.csv',
            onRegisterApi: function(gridApi){
                $scope.gridApi = gridApi;
            }
        };

        $scope.gridOptions.columnDefs = [
            { field: 'toolName', displayName: 'Tool Name' },
            { field: 'purpose', displayName: 'Purpose' },
            { field: 'additionalComments', displayName: 'Additional Comments' },
            { field: 'updated', displayName: 'Updated' },
            { name: 'Operations', cellTemplate: '<div><a href="#!/tool/edit/{{row.entity._id}}">Edit</a> | <a ng-click="grid.appScope.toolDelete(row.entity, row.entity)" style="cursor:pointer;">Delete</a></div>', width: 100 }
        ];

        $scope.toolDelete = function(tool) {
            var confirm = $mdDialog.confirm()
                .title('Would you like to delete the tool?')
                .content('add a proper message here, you can ask Aaron!')
                .ariaLabel('Delete User')
                .ok('Delete')
                .cancel('Cancel')
                .targetEvent(tool);

            $mdDialog.show(confirm).then(function() {
                // add the delete
                adminService.deleteTool(tool._id).then(function(response) {
                    if (response.status === 200) {
                        getToolsBaby();
                    } else {
                        console.log('Server Error', response.status);
                    }
                });
            }, function() {
                // do nothing
                console.log('Delete canceled');
            });
        };

    } else if ($state.current.name === 'tool/add') {

        $rootScope.title = 'Tool Add';

        $scope.doc = {};

        $scope.save = function() {
            adminService.insertTool($scope.doc).then(function(response) {
                SweetAlert.success('Saved', {title: 'Good!'});
            });
        }

    } else if ($state.current.name === 'tool/edit') {

        $rootScope.title = 'Tool Edit';

        adminService.getTool($state.params.id).then(function(response) {
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
