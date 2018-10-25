import "./paramTmplSrv";

var paramTmplModule = angular.module("paramTmplModule", ["ngAnimate","ngSanitize","ui.bootstrap","ngTable", "ui.select","ngFileSaver","paramTmplSrvModule"]);

paramTmplModule.controller("paramTmplCtrl", ["$scope","$rootScope","$location", "$uibModal","$translate","$routeParams","NgTableParams","paramTmplSrv","FileSaver", "Blob","RegionID",
function($scope,$rootScope,$location, $uibModal,$translate,$routeParams,NgTableParams,paramTmplSrv,FileSaver,Blob,RegionID) {
    var self = $scope;
    self.existedNamesList = [];
    self.regions = {
        options:paramTmplSrv.regionOptions
    };
    self.queryLimit = {
        regionId:RegionID.Region()
    };

    function initParamTmplTable(){
        var tableData = [];
        self.globalSearchTerm = "";
        paramTmplSrv.queryParamTmplList({
            "params":{
                "Region":self.queryLimit.regionId
            }
        }).then(function(res){
            if(res && res.data){
                tableData = res.data;
                res.data.forEach(item => {
                    self.existedNamesList.push(item.name)
                });
                self.paramTmplTable = new NgTableParams(
                { count: 10 }, 
                { counts: [], dataset: tableData });
            }
        })
    }
    initParamTmplTable();

    self.changeRegion = function(regionId){
        self.queryLimit.regionId = regionId;
        sessionStorage.setItem("RegionSession",regionId);
        initParamTmplTable();
    };

    self.refreshParamTmplList = function(){
        initParamTmplTable();
    };

    self.applyGlobalSearch = function() {
        var term = self.globalSearchTerm;
        self.paramTmplTable.filter({ $: term });
    };

    self.createParamTmplModal = function(){
        var scope = self.$new();
        var createParamTmplModal = $uibModal.open({
            animation:$scope.animationsEnabled,
            templateUrl:"createParamTmplModal.html",
            scope:scope
        });
        scope.submitted = false;
        scope.interacted = function(field) {
            return scope.submitted || field.$dirty;
        };
        scope.dbVersionOptions = [5.6,5.5,5.1];
        scope.paramTmplForm = {
            "name":"",
            "desc":"",
            "engineVersion":scope.dbVersionOptions[0]
        };
        scope.createParamTmplComfirm = function(formField){
            if(formField.$valid){
                var params = {
                    "params":scope.paramTmplForm
                };
                params.params.Region = self.queryLimit.regionId
                paramTmplSrv.createParamTmpl(params).then(function(res){
                    initParamTmplTable();
                    createParamTmplModal.close();
                });
            }else{
                scope.submitted = true;
            }
        };
    };

    function formateParamDetailList(){
        self.paramTmplDetailItem.paramList.map(item => {
            item.need_reboot = item.need_reboot == 0? "否":"是";
            if(item.min == item.max == 0){
                item.rangeValue = "[" + item.min +"-"+item.max+"]";
                item.isRange = true;
            }else{
                item.rangeValue = "["+item.enum_value.join(' | ')+"]";
                item.isEnum = true;
            }
            item.curValue = item.cur_value;
            item.showEdit = false;
            return item;
        });
    }

    function initParamDetailData(templateId){
        paramTmplSrv.queryParamTmplDetail({
            "params":{
                "Region":self.queryLimit.regionId,
                "templateId":templateId
            }
        }).then(function(res){
            if(res && res.data){
                self.paramTmplDetailItem = res.data;
                self.originParamList = angular.copy(res.data.paramList);
                formateParamDetailList();
            }
        });
    }

    self.$watch(function () {
        return $routeParams.templateId;
    }, function (templateId) {
        self.animation = templateId ? "animateIn" : "animateOut";
        if (templateId) {
            initParamDetailData(templateId);
        }
    });

    self.cancelEdit = function(){
        self.paramTmplDetailItem.paramList = angular.copy(self.originParamList);
        formateParamDetailList();
    };

    self.submitted = false;
    self.interacted = function(field) {
        if(field){
            return self.submitted || field.$dirty;
        }
    };

    self.editParamsConfirm = function(type,formField,editData,index){
        if(formField.$valid){
            var params = {
                "Region":self.queryLimit.regionId,
                "templateId":self.paramTmplDetailItem.templateId,
            };
            if(type == "all"){
                for(var i = 0; i < self.paramTmplDetailItem.paramList.length; i++){
                    if(self.paramTmplDetailItem.paramList[i].cur_value != self.originParamList[i].cur_value){
                        params['paramList.' + i +'.name'] = self.paramTmplDetailItem.paramList[i].name;
                        params['paramList.' + i +'.value'] = self.paramTmplDetailItem.paramList[i].cur_value;
                    }
                }
                paramTmplSrv.modifyParamTmpl({
                    "params":params
                }).then(function(res){
                    if(res && res.code == 0){
                        initParamDetailData(self.paramTmplDetailItem.templateId);
                        self.cfmEdit = false;
                    }
                });
            }else if(type == "one"){
                params["paramList.0.name"] = editData.name;
                params["paramList.0.value"] = editData.cur_value;
                paramTmplSrv.modifyParamTmpl({
                    "params":params
                }).then(function(res){
                    if(res && res.code == 0){
                        self.paramTmplDetailItem.paramList[index].showEdit = false;
                        self.paramTmplDetailItem.paramList[index].cur_value = self.paramTmplDetailItem.paramList[index].curValue = editData.cur_value;
                    }
                });
            }

        }else{
            self.submitted = true;
            self.cfmEdit = true;
        }
    };

    self.deleteParamTmpl = function(deleteData){
        var content = {
            target: "deleteParamTmpl",
            msg: "<span>确定删除参数模板" + deleteData.name + "？</span>",
            data:deleteData
        };
        self.$emit("delete", content);
    };

    self.$on("deleteParamTmpl",function(e,deleteData){
        paramTmplSrv.deleteParamTmpl({
            "params":{
                "Region":self.queryLimit.regionId,
                "templateId":deleteData.templateId
            }
        }).then(function(res){
            if(res && res.code == 0){
                initParamTmplTable();
            }
        })
    });

    self.exportParams = function(paramTmpl){
        paramTmplSrv.queryParamTmplDetail({
            "params":{
                "Region":self.queryLimit.regionId,
                "templateId":paramTmpl.templateId
            }
        }).then(function(res){
            if(res && res.data){
                var exportData = [];
                res.data.paramList.forEach(item => {
                    exportData.push(item.name+"="+item.cur_value);
                });
                var pemData = new Blob(
                    [exportData.join("\n")],
                    { type: "application/x-pem-file"}
                );
                FileSaver.saveAs(pemData, paramTmpl.name + ".cnf");
            }
        });
    };

    self.saveAsTmpl = function(item){
        var scope = self.$new();
        var saveAsTmplModal = $uibModal.open({
            animation:$scope.animationsEnabled,
            templateUrl:"saveAsTmplModal.html",
            scope:scope
        });
        scope.submitted = false;
        scope.interacted = function(field) {
            return scope.submitted || field.$dirty;
        };
        scope.saveAsTmplComfirm = function(formField,formData){
            if(formField.$valid){
                paramTmplSrv.createParamTmpl({
                    "params":{
                        "Region":self.queryLimit.regionId,
                        "name":formData.name,
                        "desc":formData.desc,
                        "templateId":item.templateId
                    }
                }).then(function(res){
                    if(res && res.code == 0){
                        saveAsTmplModal.close();
                        initParamTmplTable();
                    }
                });
            }else{
                scope.submitted = true;
            }
        };
    };

}])