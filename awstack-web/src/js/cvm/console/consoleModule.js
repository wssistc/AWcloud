   
angular.module("consoleModule", [])
.controller("consoleCtrl", function($rootScope,$scope, $sce) {
    // console.log($rootScope)
    var self=$scope
    
    self.consoleUrl = $sce.trustAsResourceUrl(localStorage.getItem("consoleUrl"))
    console.log(self.consoleUrl)
})





