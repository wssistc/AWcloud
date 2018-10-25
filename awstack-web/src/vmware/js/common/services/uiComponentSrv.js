
var uiComponentModule = angular.module("uiComponentModule",[]);

uiComponentModule.service("uiComponentSrv",["$uibModal","NgTableParams",function($uibModal,NgTableParams){
	
	this.modalInstance = function(params){
		var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: params.templateUrl,
            windowClass: params.windowClass || "",
            scope:params.scope
        });

		return modalInstance;
	};

	this.table = function(params){
		var table = new NgTableParams(
			{count:5},
			{counts:[],dataset:params.data}
		);
		return table;
	};

}]);

export default uiComponentModule.name;

