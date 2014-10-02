'use strict';

/* Controllers */

var seoControllers = angular.module('seoControllers', []);

seoControllers.controller('SitesCtrl', ['$scope', 'Site',
    function ($scope, Site) {

        $scope.formData = {};
        $scope.sites = Site.query();
        $scope.error = {msg: ""};


        // when submitting the add site, send the text to the node API
        $scope.createSite = function () {
            new Site();
            $scope.sites = Site.query();
        };

        $scope.click = function (site) {
            var url = 'files/' + site.path;
            console.log(url);
            $window.open(url);
        }

    }]);


