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
            .when('/about', {
                templateUrl : 'pages/about.html',
                controller  : 'aboutController'
            })

            // route for the contact page
            .when('/contact', {
                templateUrl : 'pages/contact.html',
                controller  : 'contactController'
            });
    });

    // create the controller and inject Angular's $scope
    ipectrace.controller('mainController', function($scope) {
        // create a message to display in our view
        $scope.message = 'Everyone come and see how good I look!';
    });

    ipectrace.controller('aboutController', function($scope) {
        $scope.message = 'injected text here';
    });

    ipectrace.controller('contactController', function($scope) {
        $scope.message = 'Contact us! JK. This is just a demo.';
    });