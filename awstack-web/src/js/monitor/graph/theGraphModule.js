angular.module("theGraphModule", [])
.controller("theGraphCtrl", ["$scope", "$rootScope","$sce",function ($scope, $rootScope,$sce) {
    var self = $scope; 
    var graphUrl = "/thegraph/the-graph-editor";
    self.graphUrl = $sce.trustAsResourceUrl(graphUrl);
}]);
