import "./qosSrv";

var qosModule = angular.module("qosModule", ["ngTable","ngAnimate","ui.bootstrap", "qosSrvModule","ngMessages"]);

qosModule.controller("qosCtrl", function($scope,$rootScope, NgTableParams,qosSrv,checkedSrv,$uibModal,$translate,GLOBAL_CONFIG,$routeParams) {
    var self = $scope;

    function initQosPolicyTable(){
        qosSrv.getQosPolicyList().then(function(res){
            if(res && res.data){
                self.qosPolicyTable = new NgTableParams(
                    {count: GLOBAL_CONFIG.PAGESIZE  }, 
                    {counts: [], dataset: res.data }
                );
                checkedSrv.checkDo(self, "", "id","qosPolicyTable");
            }
        })
    };
    initQosPolicyTable();

    self.refreshQosPolicy = function(){
        initQosPolicyTable();
    };

    self.qosPolicy = function(type,editData){
        var scope = self.$new();
        var qosPolicyModal = $uibModal.open({
            animation:$scope.animationsEnabled,
            templateUrl:"qosPolicyModal.html",
            scope:scope
        });
        scope.submitted = false;
        scope.interacted = function(field) {
            return scope.submitted || field.$dirty;
        };
        scope.qosPolicyForm = {
            "name":"",
            "shared":false,
            "description":""
        };
        switch(type){
            case "new":
                scope.qosPolicyModal_title = "新建带宽策略";
                break;
            case "edit":
                scope.qosPolicyModal_title = "修改带宽策略";
                scope.qosPolicyForm = editData;
                break;
        };
        scope.qosPolicyConfirm = function(formField){
            if(formField.$valid){
                if(type == "new"){
                    qosSrv.cerateQosPolicy(scope.qosPolicyForm).then(function(){
                        initQosPolicyTable();
                    });
                }else{
                    let params = scope.qosPolicyForm;
                    params.policyId = editData.id;
                    qosSrv.editQosPolicy(params).then(function(){
                        initQosPolicyTable();
                    })
                }
                qosPolicyModal.close();
            }else{
                scope.submitted = true;
            }
        };
    };

    self.deleteQosPolicy = function(checkedItems){
        var content = {
            target: "deleteQosPolicy",
            msg: "<span>确定删除所选带宽策略？</span>",
            data:checkedItems
        };
        self.$emit("delete", content);
    };
    self.$on("deleteQosPolicy", function(e,checkedItems) {
        var del_obj_ids=[];
        _.each(checkedItems,function(item){
            del_obj_ids.push(item.id);
        })
        qosSrv.deleteQosPolicy({
            "id":del_obj_ids
        }).then(function(res){
            initQosPolicyTable();
        });
    });

    $scope.$watch(function () {
        return $routeParams.id;
    }, function (value) {
        $scope.animation = value ? "animateIn" : "animateOut";
        if (value) {
            $scope.$broadcast("qosDetail", value);
        }
    });

    
})
.controller("qosDetailCtrl",["$scope","$rootScope", "NgTableParams","qosSrv","checkedSrv","$uibModal","$translate","GLOBAL_CONFIG",
function($scope,$rootScope, NgTableParams,qosSrv,checkedSrv,$uibModal,$translate,GLOBAL_CONFIG){
    var self = $scope;
    var initQosPolicyRulesTable = function(id){
        qosSrv.getQosPolicyRules(id).then(function(res){
            if(res && res.data){
                self.qosPolicyRulesTable = new NgTableParams(
                    {count: GLOBAL_CONFIG.PAGESIZE  }, 
                    {counts: [], dataset: res.data }
                );
                checkedSrv.checkDo(self, "", "id","qosPolicyRulesTable");
            }
        })
    };

    self.$on("qosDetail", function(event, id) {
        initQosPolicyRulesTable(id);

        self.refreshQosPolicyRule = function(){
            initQosPolicyRulesTable(id);
        };

        self.qosPolicyRule = function(type,editData){
            var scope = self.$new();
            var qosPolicyRuleModal = $uibModal.open({
                animation:$scope.animationsEnabled,
                templateUrl:"qosPolicyRuleModal.html",
                scope:scope
            });
            scope.submitted = false;
            scope.interacted = function(field) {
                return scope.submitted || field.$dirty;
            };
            scope.qosPolicyRuleForm = {
                "max_kbps":"",
                "max_burst_kbps":""
            };
            switch(type){
                case "new":
                    scope.qosPolicyRuleModal_title = "新建带宽策略规则";
                    break;
                case "edit":
                    scope.qosPolicyRuleModal_title = "修改带宽策略规则";
                    scope.qosPolicyRuleForm = editData;
                    break;
            };

            scope.qosPolicyRuleConfirm = function(formField){
                if(formField.$valid){
                    if(type == "new"){
                        qosSrv.newQosPolicyRules({
                            "policyId":id,
                            "data":scope.qosPolicyRuleForm
                        }).then(function(){
                            initQosPolicyRulesTable(id);
                        });
                    }else{
                        qosSrv.editQosPolicyRules({
                            "policyId":id,
                            "data":{
                                "max_kbps":scope.qosPolicyRuleForm.max_kbps,
                                "max_burst_kbps":scope.qosPolicyRuleForm.max_burst_kbps,
                                "ruleId":editData.id
                            }
                        }).then(function(){
                            initQosPolicyRulesTable(id);
                        })
                    }
                    qosPolicyRuleModal.close();
                }else{
                    scope.submitted = true;
                }
            };
        };

        self.deleteQosPolicyRule = function(checkedItems){
            var content = {
                target: "deleteQosPolicyRule",
                msg: "<span>确定删除所选带宽策略规则吗？</span>",
                data:checkedItems
            };
            self.$emit("delete", content);
        };
        self.$on("deleteQosPolicyRule", function(e,checkedItems) {
            var del_obj_ids=[];
            _.each(checkedItems,function(item){
                del_obj_ids.push(item.id);
            })
            qosSrv.delQosPolicyRules({
                "id":del_obj_ids
            }).then(function(res){
                initQosPolicyRulesTable();
            });
        });
    });
}])
