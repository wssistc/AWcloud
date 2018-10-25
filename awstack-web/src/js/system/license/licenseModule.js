
import "./licenseSrv";

var licenseModule = angular.module("licenseModule",[ "ngAnimate", "ui.bootstrap","ngMessages","licenseSrvModule"]);

licenseModule.controller("licenseCtrl",["$scope","$timeout","NgTableParams","GLOBAL_CONFIG","$translate","licenseSrv", "$uibModal","$filter","alertSrv",
    function($scope,$timeout,NgTableParams,GLOBAL_CONFIG,$translate,licenseSrv,$uibModal,$filter,alertSrv){
        var self = $scope;
        //获取license列表
        localStorage.permission == "enterprise"?self.versionType = $translate.instant("aws.license.versionEnterprise"):self.versionType = $translate.instant("aws.license.versionStand")
        
        self.getlicense = function(){
            licenseSrv.getLicense().then(function(result){
                if(result && result.data){
                    self.licenseItem = result.data;
                    self.licenseItem.end_time=self.licenseItem.end_time*1000-(new Date().getTimezoneOffset()*60*1000);
                    self.licenseItem.end_service_time_copy=self.licenseItem.end_service_time*1000-(new Date().getTimezoneOffset()*60*1000);
                    self.licenseItem.available_node == 0 ? self.licenseItem.available_node  = "N/A":"";
                    self.licenseItem.time = new Date(self.licenseItem.end_time).getFullYear() >= 2100 ? $translate.instant("aws.license.perpetual") : $filter("date")(self.licenseItem.end_time, "yyyy-MM-dd");
                    self.licenseItem.end_service_time=='0' ? self.licenseItem.servicetime ="N/A":self.licenseItem.servicetime =  $filter("date")(self.licenseItem.end_service_time_copy, "yyyy-MM-dd");
                    self.nodePer = {total:result.data.available_node,used:result.data.current_node};
                    self.tabledata=[];
                    self.tabledata.push(self.licenseItem);
                    self.tableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: self.tabledata });
                }
            });
        };
        self.getlicense();
        //申请license
        self.applylicense = function(){
            $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: "apply-license.html",
                scope: self
            });
        };
        //导入license
        self.importlicense = function(){
            self.submitInValid = false;
            self.fileCheck=false;
            var modal_import_license = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: "import-license.html",
                scope: self
            });
            self.mylicense = {};
            self.selected_file="";
            self.fileNameChanged=function(){
                self.fileCheck=false;
                self.selected_file = document.getElementById("upload").value;
                var dom = document.getElementById("upload");
                var file = dom.files[0];
                let fileSize = 0;
                 var fileType ="";
                file ? fileSize = file.size:self.selected_file=""; 
                file ? fileType=file.name.substr(-4,4):fileType=".pem";
                if(fileType==".pem"&&fileSize<1048576){
                    self.fileCheck=false;
                }else{
                    self.fileCheck=true; 
                }
                self.$apply();
    　　　　}
            self.confirm = function(filed){
                if(filed.$valid&&!self.fileCheck){
                    var scope = self;
                    var form = document.forms.namedItem("ilForm");
                    var oData = new FormData(form);
                    var oReq = new XMLHttpRequest();
                    var importsuccess=$translate.instant("aws.license.importsuccess");
                    var importerror=$translate.instant("aws.license.importerror");
                    oReq.onerror = function(e) { 
                        if(e.type=="error"){
                            alertSrv.set("",importerror , "error",5000);        
                        }
                    };
                    oReq.onload = function(){
                       var responseObj=JSON.parse(oReq.responseText);
                       if(responseObj){
                            if( responseObj.code==0){
                                alertSrv.set("",importsuccess , "success",5000);
                                $timeout(function() {
                                    self.getlicense()
                                },1000);
                                
                            }else{
                                alertSrv.set("",$translate.instant("aws.statusCode."+responseObj.code) , "error",5000);
                            }
                       }
                    }
                    oReq.open("POST", window.GLOBALCONFIG.APIHOST.BASE+"/v1/upload/license", true);
                    //导入license激活文件
                    sessionStorage.setItem("license", "license");
                    let auth_token = localStorage.$AUTH_TOKEN;
                    oReq.setRequestHeader("X-Auth-Token",auth_token); 
                    oReq.send(oData);

                    modal_import_license.close();
                }else{
                    self.submitInValid = true;
                }
            };
        };

        $scope.$on("getDetail", function(event, value) {
            licenseSrv.getLicense().then(function(result){
                if(result && result.data){
                    self.snItem = result.data.snArray;
                }
            });
        });

        self.$on("licenseSocket", function(e, data) {
        });
    }
]);