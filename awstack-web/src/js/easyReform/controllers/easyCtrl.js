easyCtrl.$inject=["$scope", "$rootScope", "$translate","$uibModal","$location"];
export function easyCtrl($scope, $rootScope, $translate,$uibModal,$location){
    var self = $scope;
    self.easyNetwork= function(){
        var scope = self.$new();
        $uibModal.open({
            animation: true,
			templateUrl: "js/easyReform/tmpl/network.html",
            controller: "easyNetworkCtrl",
            scope:scope,
            resolve:{
                type:function(){
                    return true
                }
            }
        });
    };
    self.easyUser = function(){
        $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "js/easyReform/tmpl/usermodal.html",
            controller: "easyUserCtrl",
            scope:self,
            resolve:{
                type:function(){
                    return true
                }
            }
        });
    }
    self.easyDepartment = function(){
        $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "js/easyReform/tmpl/department.html",
            controller: "easyDepartmentCtrl",
            scope: self,
            resolve:{
                type:function(){
                    return true
                }
            }
        });
    }
    self.easyProject = function(){
        $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "js/easyReform/tmpl/project.html",
            controller: "easyProjectCtrl",
            scope: self,
            resolve:{
                type:function(){
                    return true
                }
            }
        });
    }

    self.firstEasyNetwork= function(){
        if($rootScope.isfirstLogin){
            return;
        }
        $rootScope.isfirstLogin = true;
        $uibModal.open({
            animation: $scope.animationsEnabled,
            controller: "easyNetworkCtrl",
			templateUrl: "js/easyReform/tmpl/firstNetwork.html",
            resolve:{
                type:function(){
                    return false
                }
            }
        });
    }
    self.easyFlavor = function(getInsFlavors){
        $uibModal.open({
            animation: $scope.animationsEnabled,
            controller: "easyFlavorCtrl",
			templateUrl: "js/easyReform/tmpl/flavor.html",
            resolve:{
                getInsFlavors:function(){
                    return getInsFlavors
                }
            }
        });
    }
    self.easySecurityGroup = function(secScope){
        $uibModal.open({
            animation: $scope.animationsEnabled,
            controller: "easySecurityGroupCtrl",
			templateUrl: "js/easyReform/tmpl/securityGroup.html",
            resolve:{
                self:function(){
                    return secScope
                }
            }
        });
    }
    if($location.path() == "/first"){
        self.firstEasyNetwork()
    }
    self.$on('department-refresh',function(e,data){
        self.$broadcast('department-renew',data)
    });
    self.$on('project-refresh',function(e,value){
        self.$broadcast('project-renew',value)
    });
    self.$on('remember-domain',function(e,value){
        self.rememberDomain = value;
    });
}