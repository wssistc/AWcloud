import "./scalpolicySrv";
var scalpolicyModule = angular.module("scalpolicyModule", ["ngTable", "ngAnimate", "ui.bootstrap", "ui.select", "ngMessages","policySrv"]);
scalpolicyModule.controller("scalpolicyCtrl", function($scope, $rootScope, NgTableParams, alertSrv, $location, $uibModal, checkedSrv, $translate,GLOBAL_CONFIG,policySrv) {
    var self = $scope;
    self.canDelete=false;
    function successFunc(data) {
        self.tabledata = data;
        data.map(function(item){
            item.searchTerm = item.name+item.step +item.type + item.maxSize + item.minSize;
        });
        self.tableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: data });
        self.applyGlobalSearch = function() {
            var term = self.globalSearchTerm;
            self.tableParams.filter({searchTerm:term});
        };
        var tableId = "id";
        checkedSrv.checkDo(self, data, tableId);
        self.$watch(function() {
            return self.checkedItems;
        }, function(values) {
            if(values.length>0){
                self.canDelete = true;
            }else{
                self.canDelete=false;
            }
        });
    }
    function getPolicy() {
        policySrv.getPolicy().then(function(result){
            if(result&&result.data){
                successFunc(result.data);
            }
            result?self.loadData = true:"";
        })
    }
    getPolicy();
    self.createPolicy=function(){
        $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "newPolicy.html",
            controller: "newPolicyCtrl",
            resolve: {
                getPolicy: function() {
                    return getPolicy;
                }
            }
        });
    };
    self.deletePolicy = function(checkedItems) {
        var content = {
            target: "delPolicy",
            msg: "<span>" +  $translate.instant("aws.scalePolicy.tipMsg.delScalePolicy") + "</span>",
            data: checkedItems
        };
        self.$emit("delete", content);
    };
    self.$on("delPolicy", function(e,data) {
        //获取删除的卷id数组
        var policy_ids=[];
        _.forEach(data,function(item){
            policy_ids.push(item.id);
        });
        var delParams = {
            ids: policy_ids
        };
        policySrv.delPolicy(delParams).then(function(){
            getPolicy();
        });
    });
});
scalpolicyModule.controller("newPolicyCtrl",function($scope, $rootScope,$uibModalInstance,getPolicy,policySrv,$translate){
    var self=$scope;
    self.submitted = false;
    self.interacted = function(field) {
        return self.submitted || field.$dirty;
    };
 
    self.checkInterval = function(v){
        var reg =new RegExp("^[1-9][0-9]*$");
        if(reg.test(v)&&Number(v)<=4294967296){
            self.patternInter = false;
        }else{
            self.patternInter = true;
        }
    }

    self.postData={};
    self.postData.name="";
    self.postData.step="";
    self.postData.type="";
    self.postData.minSize="";
    self.postData.maxSize="";
    self.postData.periods="";
    //扩展规则的类型
    self.typeList=[
        {value:"HORIZONTAL_ONLY",name:$translate.instant("aws.scalePolicy.ui.HORIZONTAL_ONLY")},

    ];
    self.type=self.typeList[0];
    self.postData.type=self.type.value;
    self.createPolicy=function(){
        if (self.policyForm.$valid&&!self.patternInter) {
            self.postData.step=Number(self.postData.step);
            self.postData.minSize=Number(self.postData.minSize);
            self.postData.maxSize=Number(self.postData.maxSize);
	    self.postData.periods==Number(self.postData.periods);
            policySrv.createPolicy(self.postData).then(function(result){
                getPolicy();
            })
            $uibModalInstance.close();
        }else{
            self.submitted = true;
        }
    }
})

