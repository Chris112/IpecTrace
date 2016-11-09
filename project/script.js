// script.js
// 26/10/16

    // create the module and name it ipectrace
    // also include ngRoute for all our routing needs
	//var ipectrace = angular.module('ipectrace', ['ngRoute']);//, ['ngMaterial']);
    var ipectrace = angular.module('ipectrace', ['ngRoute', 'ngMaterial']);//, ['ngMaterial']);

    // configure our routes
    ipectrace.config(function($routeProvider) {
		$routeProvider

            // route for the home page
            .when('/', {
                templateUrl : 'pages/home.html',
                controller  : 'mainController'
            })

            // route for the about page
            .when('/PhotoSearch', {
                templateUrl : 'pages/PhotoSearch.html',
                controller  : 'photoController'
            })

            // route for the contact page
            .when('/TrackConsignment', {
                templateUrl : 'pages/TrackConsignment.html',
                controller  : 'trackConController'
            });
    });

    // create the controller and inject Angular's $scope
    ipectrace.controller('mainController', function($scope) {
        // create a message to display in our view
        $scope.message = 'Injected text';
    });

    ipectrace.controller('photoController', function($scope) {
        $scope.message = '';
    });

    ipectrace.controller('trackConController', function($scope) {
        $scope.message = '';
    });