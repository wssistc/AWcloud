import "./quotasSrv";

var quotaModule = angular.module("quotaModule", ["ngTable", "ngAnimate", "ui.bootstrap", "ui.select", "quotaSrv"]);


quotaModule.controller("quotaCtrl", function($scope,$filter,$rootScope, NgTableParams, $location, $translate, $uibModal, quotaSrv) {

    var filter=$filter;
    var self = $scope;
    self.quota = {
        "domain_quota": $translate.instant("aws.depart.quota"),
        "project_quota": $translate.instant("aws.project.quota")
    };
    self.typeData = [{ type: "domain_quota", name: self.quota.domain_quota }, { type: "project_quota", name: self.quota.project_quota }];
    function getquota(typequota,typelimit){
        quotaSrv.getQuotasList(typequota).then(function(result) {
                if (result && result.data) {
                    _.forEach(result.data, function(item) {
                        if(item.name=="ram"){
                           item.hardLimit=parseInt((item.hardLimit)/1024);
                        }
                        item.isError = false;
                        item.errorMessage = "";
                    });
                    if(!$rootScope.L3){
                        result.data = result.data.filter(item=>{
                            return item.name!='floatingip' && item.name != "router";
                        })
                    }
                    self.quotas = result.data;
                }
            });
        quotaSrv.getQuotasList(typelimit).then(function(result) {
            if (result && result.data) {
                _.forEach(result.data, function(item) {
                    if(item.name=="ram"){
                       item.hardLimit=parseInt((item.hardLimit)/1024);
                    }
                    item.isError = false;
                    item.errorMessage = "";
                });
                self.Limitquota = result.data;
            }
        });
    }
    function initQuota(type) {
        if(type=="domain_quota"){
            getquota('domain_quota','project_quota')
        }else if(type=="project_quota"){
            getquota('project_quota','domain_quota')
        }
        self.cantConfirm = false;
        self.isCantEdit = false;
    }
    self.isDisabled = function(quota) {
        if (quota == "cores" || quota == "floatingip" || quota == "ram" || quota == "snapshots" || quota == "instances" || quota == "volumes" || quota == "snapshots" || quota =="phy_instances") {
            return true;
        } else {
            return false;
        }
    };
    initQuota("domain_quota");
    self.changeType = function(type) {
        initQuota(type);
    };

    /*self.submitted = false;
    self.interacted = function(field) {
    	return self.submitted || field.$dirty;
    };*/
    self.isErrorFunc = function(obj,type) {
        var reg = new RegExp("^([0-9]+)$");
        if (obj.hardLimit) {
            if (!reg.test(obj.hardLimit)) {
                obj.isError = true;
                obj.errorMessage = $translate.instant("aws.errors.integer");
            } else {
                if(type=='domain_quota'){
                    var limitVal=self.Limitquota.filter(item=>{
                        return item.name==obj.name
                    })
                    if(obj.hardLimit*1<limitVal[0].hardLimit*1){
                        obj.isError = true;
                        obj.errorMessage = $translate.instant("aws.errors.quota_domain");
                    }else if(obj.hardLimit.length>6){
                        obj.isError = true;
                        obj.errorMessage = $translate.instant("aws.errors.quota_domain2");
                    }else{
                        obj.isError = false;
                        obj.errorMessage = "";
                    }
                }else if(type=='project_quota'){
                    var limitVal=self.Limitquota.filter(item=>{
                        return item.name==obj.name
                    })
                    if(obj.hardLimit*1>limitVal[0].hardLimit*1){
                        obj.isError = true;
                        obj.errorMessage = $translate.instant("aws.errors.quota_project");
                    }else{
                        obj.isError = false;
                        obj.errorMessage = "";
                    }
                }
                
            }
        } else {
            obj.isError = true;
            obj.errorMessage = $translate.instant("aws.errors.required");
        }

        for (var j = 0; j < self.quotas.length; j++) {
            if (self.quotas[j].isError) {
                self.cantConfirm = true;
                break;
            }
            self.cantConfirm = false;
        }
    };
    self.treeOptions = {
        dragStop: function(e) {
            for (var i = 0; i < e.dest.nodesScope.$modelValue.length; i++) {
                e.dest.nodesScope.$modelValue[i].order = i + 1;
            }
        }
    };

    self.confirmQuota = function(type) {
        self.isCantEdit = true;
        self.quotas.forEach((x)=>{
            if(x.name=="ram"){
                x.hardLimit=(x.hardLimit)*1024;
            }
        })
        quotaSrv.updataQuota(self.quotas).then(function() {
            initQuota(type);
            self.isCantEdit = false;
        });
    };
    self.cancel = function(type) {
        initQuota(type);
    };
});
