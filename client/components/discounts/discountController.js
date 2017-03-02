angular
.module('worldofcrew-admin')
.controller("discountController", function($scope, $location, discountService, $modal, $mdDialog, uiGmapGoogleMapApi, $rootScope, $state, fileReader, $http, $firebaseArray, airlineService, uiGridConstants, SweetAlert) {

    // List page
    if ($state.current.name === 'discounts') {
        $rootScope.title = 'Discounts';
        $scope.airlinesFilter = [];

        airlineService.getAirlines().then(function(response) {
            response.data.map(function(obj) {
                $scope.airlinesFilter.push({value: obj.airline, label: obj.airline});
            });
        });


        $scope.gridOptions = {
            enableFiltering: true,
            paginationPageSizes: [10, 50, 100],
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
            { field: 'country', displayName: 'Country' },
            { field: 'city', displayName: 'City' },
            { field: 'title', displayName: 'Name' },
            { field: 'discount', displayName: 'Discount' },
            { field: 'category', displayName: 'Categories' },
            { field: 'airline', displayName: 'Airlines', filter: { type: uiGridConstants.filter.SELECT, selectOptions: $scope.airlinesFilter } },
            { field: 'updated', displayName: 'Last updated' },
            { field: 'updatedBy', displayName: 'Updated by' },
            { name: 'Operations', cellTemplate: '<div><a href="#!/discount/edit/{{row.entity._id}}">Edit</a> | <a ng-click="grid.appScope.pinDelete(row.entity, row.entity)" style="cursor:pointer;">Delete</a></div>', width: 100 }
        ];

        $scope.pinDelete = function(user) {
            var confirm = $mdDialog.confirm()
                .title('Would you like to delete the discount?')
                .content('add a proper message here, you can ask Aaron!')
                .ariaLabel('Delete User')
                .ok('Delete')
                .cancel('Cancel')
                .targetEvent(user);

            $mdDialog.show(confirm).then(function() {
                // add the delete
                discountService.deletePin(user._id).then(function(response) {
                    if (response.status === 200) {
                         // $scope.gridOptions.data.splice(user._id, 1);
                        $scope.getData();
                        $scope.gridApi.core.refresh();
                    } else {
                        console.log('Server Error', response.status);
                    }
                });
            }, function() {
                // do nothing
                console.log('Delete canceled');
            });
        };

        $scope.getData = function() {
            discountService.getCategories().then(function(response) {
                if (response.status === 200) {
                    $scope.categories = response.data;
                }
            });

            discountService.getPins().then(function(response) {
                $scope.discounts = response.data;
                $scope.b = $scope.discounts.length;
                $scope.gridOptions.data = $scope.discounts;
            });
        }
        $scope.getData();

    // Edit page
    } else if ($state.current.name === 'discount/edit') {
        $rootScope.title = 'Discount Edit';

        function getParameterByName(name) {
            url = window.location.href;
            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        }

        $scope.reported = {
            address: getParameterByName('address') || false,
            discount: getParameterByName('discount') || false,
            email: getParameterByName('email') || false,
            location: getParameterByName('location') || false,
            phone: getParameterByName('phone') || false,
            placeName: getParameterByName('placeName') || false
        }

        discountService.getPin($state.params.id).then(function(response) {
            if (response.status === 200) {
                $scope.doc = response.data;

                if ($scope.doc.disabled == 'true') {
                    $scope.doc.disabled = true;
                } else {
                    $scope.doc.disabled = false;
                }

                $('#us3').locationpicker({
                    location: {
                        latitude: $scope.doc.latitude,
                        longitude: $scope.doc.longitude
                    },
                    radius: 0,
                    inputBinding: {
                        latitudeInput: $('#us3-lat'),
                        longitudeInput: $('#us3-lon'),
                        locationNameInput: $('#us3-address')
                    },
                    enableAutocomplete: true,
                    onchanged: function (currentLocation, radius, isMarkerDropped) {
                        $scope.latitude = currentLocation.latitude;
                        $scope.longitude = currentLocation.longitude;
                        $http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + $scope.latitude + ',' + $scope.longitude +'&key=AIzaSyCJD0xotwvjHL-eJjGNpEaT5iNTS3rS7GQ').then(function(response) {
                            $scope.doc.address = response.data.results[0].formatted_address;
                            response.data.results.map(function(item) {
                                if (item.types && item.types[0] === 'country' || item.types[0] === 'locality') {
                                    $scope.doc.country = item.formatted_address;
                                }

                                item.types.map(function(itemType, itemIndex) {
                                    if (itemType === 'locality' || itemType === 'administrative_area_level_1' || itemType === 'administrative_area_level_2') {
                                        item.address_components.map(function(address, addressIndex) {
                                            address.types.map(function(city) {
                                                if (city === 'administrative_area_level_1' || city === 'locality' || city === 'administrative_area_level_2') {
                                                    $scope.doc.city = address.long_name;
                                                }
                                            });
                                        });
                                    }
                                });

                            });
                        });
                    }
                });
            }
        });

        // getting categories from the server, need to pass them to the modals
        discountService.getCategories().then(function(response) {
            if (response.status === 200) {
                $scope.categories = response.data;
            }
        });

        airlineService.getAirlines().then(function(response) {
            if (response.status === 200) {
                $scope.airlines = response.data;
            }
        });

        // for adding the image thumbnail
        $scope.getFile = function() {
            fileReader.readAsDataUrl($scope.file, $scope)
            .then(function(result) {
                $scope.imageSrc = result;
            });
        };

        $scope.$on("fileProgress", function(e, progress) {
            $scope.progress = progress.loaded / progress.total;
        });

        // Save
        $scope.save = function() {
            $scope.doc.updated = new Date();
            discountService.updatePin($scope.doc._id, $scope.doc).then(function(response) {
                if (response.status !== 200) {
                    SweetAlert.alert("");
                }
                else {
                    SweetAlert.success("You have successfully inserted !!!", { title: "Good!"}).then(function() {
                        $state.go('discounts');
                    })
                }
            });
        }

    // Add page
    } else if ($state.current.name === 'discount/add') {
        $rootScope.title = 'Discount Add';

        $scope.doc = {};

        discountService.getCategories().then(function(response) {
            if (response.status === 200) {
                $scope.categories = response.data;
            }
        });

        airlineService.getAirlines().then(function(response) {
            if (response.status === 200) {
                $scope.airlines = response.data;
            }
        });

        $('#us3').locationpicker({
            radius: 0,
            inputBinding: {
                latitudeInput: $('#us3-lat'),
                longitudeInput: $('#us3-lon'),
                locationNameInput: $('#us3-address')
            },
            enableAutocomplete: true,
            onchanged: function (currentLocation, radius, isMarkerDropped) {
                $scope.latitude = currentLocation.latitude;
                $scope.longitude = currentLocation.longitude;
                $http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + $scope.latitude + ',' + $scope.longitude +'&key=AIzaSyCJD0xotwvjHL-eJjGNpEaT5iNTS3rS7GQ').then(function(response) {
                    $scope.doc.address = response.data.results[0].formatted_address;
                    response.data.results.map(function(item) {
                        if (item.types && item.types[0] === 'country') {
                            $scope.doc.country = item.formatted_address;
                        }

                        item.types.map(function(itemType) {
                            if (itemType === 'administrative_area_level_1') {
                                item.address_components.map(function(address) {
                                    address.types.map(function(city) {
                                        if (city === 'administrative_area_level_1') {
                                            $scope.doc.city = address.long_name;
                                        }
                                    });
                                });
                            }
                        });

                    });
                });
            }
        });

        $scope.save = function() {
            discountService.insertPin($scope.doc).then(function(response) {
                console.log(response);
                if (response.status == 200) {
                    // SweetAlert.swal({ 
                    //     text: "You have successfully completed our poll!", 
                    //     title: "Added!",
                    //     type: 'success'
                    // }, function() {
                    //     console.log("Added");
                    // });

                    SweetAlert.success("You have successfully inserted !!!", { title: "Good!"}).then(function() {
                        $state.go('discounts');
                    })

                }
            });
        }

    // Reports
    } else if ($state.current.name === 'discount/reports') {

        $rootScope.title = 'Reported Discounts';

        $scope.gridOptions = {
            enableFiltering: true,
            paginationPageSizes: [10, 50, 100],
            paginationPageSize: 50,
            enableGridMenu: true,
            exporterMenuPdf: false,
            exporterCsvFilename: 'reports.csv',
            minRowsToShow: 50,
            importerDataAddCallback: function (grid, newObjects) {
                // $scope.gridOptions.data = $scope.gridOptions.data.concat(newObjects);
            },
            onRegisterApi: function(gridApi){
                $scope.gridApi = gridApi;
            }
        };

        $scope.gridOptions.columnDefs = [
            { field: 'discount.companyName', displayName: 'Name' },
            { field: 'report.details', displayName: 'Comment' },
            { name: 'Operations', cellTemplate: '<div><a ng-click="grid.appScope.edit(row.entity.report, row.entity.discount)" style="cursor:pointer;">Edit</a> | <a ng-click="grid.appScope.delete(row.entity.report)" style="cursor:pointer;">Delete</a></div>', width: 100 }
        ];


        var ref = firebase.database().ref('reports');
        var list = $firebaseArray(ref);

        $scope.delete = function(item) {
            list.map(function(x, i) {
                if (x.$id === item.$id) {
                    list.$remove(list[i]).then(function(ref) {
                        ref.key() === item.$id; // true
                    });
                }
            });
        }

        $scope.edit = function(report, discount) {
            $location.path('discount/edit/' + discount._id + '?reports=true&address=' + report.isAddress + '&discount=' + report.isDiscount + '&email=' + report.isEmail + '&location=' + report.isLocation + '&phone=' + report.isPhone + '&placeName=' + report.isPlaceName);
        }

        list.$loaded()
          .then(function(x) {
              // Call to api and send data to proceed
              discountService.proceedThisFuckingDataFromFirebase(x).then(function(response) {
                  $scope.gridOptions.data = response.data;
              });
          })
          .catch(function(err) {
              console.log(err);
              alert('Firebase error!');
          });


    }
});
