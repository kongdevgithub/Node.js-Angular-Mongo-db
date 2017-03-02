angular
    .module('worldofcrew-admin')
    .service('categoryService', ['$http', '$q', '$log', 'apiValue', function($http, $q, $log, apiValue) {
        var urlBase = apiValue + '/api/v1/categories';
        return {
            getCategories: function() {
                return $http.get(urlBase);
            },
            getCategory: function(id) {
                return $http.get(urlBase + '/' + id);
            },

            insertCategory: function(category) {
                return $http.post(urlBase, category);
            },

            updateCategory: function(category) {
                return $http.put(urlBase + '/' + category._id, category);
            },

            deleteCategory: function(id) {
                return $http.delete(urlBase + '/' + id);
            }
        };
    }]);
