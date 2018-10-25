angular.module("demotplModule", ["ngSanitize", "ngTable", "ui.bootstrap.tpls", "ui.select"])
.controller("demotplCtrl", ["$scope", "$rootScope", "$uibModal", function($scope, $rootScope, $uibModal){
	var self = $scope;
	self.selectList = [
		{namea:"单选1"},
		{name:"单选2"},
		{name:"单选3"}
	]

	self.operate = function (type){
		switch (type){
			case 'create':
				var $modalInstance = $uibModal.open({
				animation: self.animationsEnabled,
				backdrop:'static',
				templateUrl: 'createDemo.html',
				scope:$scope
			});
			break;
		}
	}

}]);