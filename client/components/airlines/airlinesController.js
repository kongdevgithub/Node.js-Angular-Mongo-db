angular
.module('worldofcrew-admin')
.controller("airlinesController", function($scope, airlineService, $modal, $mdDialog, uiGmapGoogleMapApi, $rootScope, $state, fileReader, $firebaseArray, SweetAlert) {

    // Reported Airlines
    if ($state.current.name === 'airline/reports') {

        $rootScope.title = 'Reported Airlines';

        $scope.gridOptions = {
            enableFiltering: true,
            paginationPageSizes: [10, 50, 100],
            paginationPageSize: 50,
            enableGridMenu: true,
            exporterMenuPdf: false,
            exporterCsvFilename: 'reports.csv',
            importerDataAddCallback: function (grid, newObjects) {
                // $scope.gridOptions.data = $scope.gridOptions.data.concat(newObjects);
            },
            onRegisterApi: function(gridApi){
                $scope.gridApi = gridApi;
            }
        };

        $scope.gridOptions.columnDefs = [
            { field: 'airline', displayName: 'Airline' },
        ];

        var ref = firebase.database().ref('airlines');
        var list = $firebaseArray(ref);

        $scope.gridOptions.data = list;

    // Airlines List
    } else if ($state.current.name === 'airlines') {

        $rootScope.title = 'Airlines';

        $scope.gridOptions = {
            enableFiltering: true,
            paginationPageSizes: [10, 50, 100],
            paginationPageSize: 50,
            enableGridMenu: true,
            exporterMenuPdf: false,
            exporterCsvFilename: 'airlines.csv',
            onRegisterApi: function(gridApi){
                $scope.gridApi = gridApi;
            }
        };

        $scope.gridOptions.columnDefs = [
            { field: 'airline', displayName: 'Airline' },
            { field: 'created', displayName: 'Created' },
            { field: 'updated', displayName: 'Updated' },
            { name: 'Operations', cellTemplate: '<div><a href="#!/airline/edit/{{row.entity._id}}">Edit</a> | <a ng-click="grid.appScope.airlineDelete(row.entity, row.entity)" style="cursor:pointer;">Delete</a></div>', width: 100 }
        ];

        // Get
        function getData() {
            airlineService.getAirlines().then(function(response) {
                $scope.gridOptions.data = response.data;
            });
        }
        getData();

        $scope.airlineDelete = function(airline) {
            var confirm = $mdDialog.confirm()
                .title('Would you like to delete the airline?')
                .content('add a proper message here, you can ask Aaron!')
                .ariaLabel('Delete User')
                .ok('Delete')
                .cancel('Cancel')
                .targetEvent(airline);

            $mdDialog.show(confirm).then(function() {
                // add the delete
                airlineService.deleteAirline(airline._id).then(function(response) {
                    if (response.status === 200) {
                        getData();
                    } else {
                        console.log('Server Error', response.status);
                    }
                });
            }, function() {
                // do nothing
                console.log('Delete canceled');
            });
        };

    // Airline Add
    } else if ($state.current.name === 'airline/add') {

        $rootScope.title = 'Airline Add';

        $scope.doc = {};

        $scope.save = function() {
            airlineService.insertAirline($scope.doc).then(function(response) {
                SweetAlert.success("Added", {title:'Good!'}).then(function() {    
                    $state.go('airlines')
                });
            });
        }

    // Airline Edit
    } else if ($state.current.name === 'airline/edit') {

        $rootScope.title = 'Airline Edit';

        airlineService.getAirline($state.params.id).then(function(response) {
            $scope.doc = response.data;
        });

        $scope.save = function() {
            $scope.doc.updated = new Date();
            airlineService.updateAirline($scope.doc._id, $scope.doc).then(function(response) {
                if (response.status !== 200) {
                    alert('Error');
                }
            });
        }

    }
});
