var module = angular.module("detailsrv", []);

module.controller("detailCtrl", function($scope, $routeParams) {
    $scope.$watch(function() {
        return $routeParams.id;
    }, function(value) {
        value ? $scope.animation = "animateIn" : $scope.animation = "animateOut";
        if(value && $routeParams.type){
            $scope.$emit("get"+$routeParams.type+"Detail", value);
        }else if (value) {
            $scope.$emit("getDetail", value);
        }
    });
});

module.directive("pane", function() {
    return {
        require: "?ngModel",
        restrict: "E",
        transclude: true,
        scope: {
            animation: "=",
            detailData: "="

        },
        template: "<div class= 'animateContent {{animation}} '>" +
            "<div class='detailInner'>" +
            "<ng-transclude></ng-transclude>" +
            "</div>" +
            "</div>"/*,
        link: function(scope, element, attrs) {
            console.log(scope.test)

        }*/
    };
});
