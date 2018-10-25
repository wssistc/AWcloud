tipCtrl.$inject=["$scope", "$rootScope","$translate","$uibModal","$uibModalInstance","EEService","new_obj","get_cluster_list"];
export function tipCtrl($scope, $rootScope,$translate,$uibModal,$uibModalInstance,EEService,new_obj,get_cluster_list){
    
    var self=$scope;
   function doNothingFunc(){
        //创建弹性伸缩完成新建配置与配置列表页面新建配置共用一个controller。后者需要刷新列表的函数。
    }
    //创建弹性伸缩配置
    self.creteEEConfig = function() {
        $uibModalInstance.close();
        $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "js/cvm/elasticExtension/tmpl/eecreateCon.html",
            controller: "eeCreateConCtrl",
            resolve: {
                 detail_obj:function(){
                     return new_obj
                 },
                 get_config:function(){
                     return get_cluster_list
                 },
                 deefaultInuse:function(){
                     return true
                 }
             }
        });
    };

}