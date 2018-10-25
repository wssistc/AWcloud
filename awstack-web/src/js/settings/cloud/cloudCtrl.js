import "./cloudSrv";

var cloudModule = angular.module("cloudModule", ["ngTable", "ngAnimate", "ui.bootstrap", "ui.select", "cloudSrv"]);
cloudModule.controller("cloudCtrl", function($scope, $rootScope, NgTableParams, $location, $uibModal, cloudSrv,$route,$timeout) {
    var self = $scope;
    self.selectedCloud = {
        selected:""
    };
    self.isHaddle = false;
    function init(){ 
        //1、依赖配置文件做下来列表,
        //2、获取当前企业下的配置文件 跟 配置文件的比对，算出当前企业的配置信息
        //3、没有新增，有的修改

        self.publicSettings = angular.copy(window.PUBLICCLOUD);
        self.isCantEdit = false;
        cloudSrv.getDictDataByEidAndDid().then(function(result){
            if(result && result.data){
                _.forEach(self.publicSettings,function(cloud){
                    _.forEach(result.data,function(item){
                        if(cloud.paramName == item.paramName){
                            cloud.paramId = item.paramId;
                            cloud.path = item.path;
                            cloud.enterpriseUid = item.enterpriseUid;
                            cloud.parentId = item.parentId;
                            cloud.paramValue = JSON.parse(item.paramValue);
                            cloud.status = "UPDATE";
                        }
                    });
                });
            }            
        }).then(function(){ //初始化修改表单内容
            self.changCloud(self.publicSettings[0]);
        }); 
    }

    function updateEnterpriseSupportPublicClouds(){
        let supportOtherClouds = "";
        _.forEach(self.publicSettings,function(cloud){
            /*if(cloud.paramValue && cloud.paramValue.Active){
                supportOtherClouds += cloud.paramName+",";
            }*/
            if(cloud.paramValue && cloud.paramValue.length>0){
                for(let i=0;i<cloud.paramValue.length;i++){
                    if(cloud.paramValue[i].Active){
                        supportOtherClouds += cloud.paramName+",";
                        break;
                    }
                }
            }
        });
        let options = {
            "supportOtherClouds":supportOtherClouds
        };
        cloudSrv.updateEnterpriseSupportPublicClouds(options).then(function(){
        });        
    };

    function updateLocalStorage(flag,key){
        if (flag) {
            if (localStorage.supportOtherClouds.indexOf(key)==-1) {
                localStorage.supportOtherClouds = localStorage.supportOtherClouds+key+",";
            }
        }else{
            if (localStorage.supportOtherClouds.indexOf(key)!=-1) {
                localStorage.supportOtherClouds = localStorage.supportOtherClouds.replace(key+",","");
            }
        }
    };
    self.changCloud = function(selectedCloud){
        if(selectedCloud.paramName=="QCLOUD_API_KEY"){
            self.cantALIKey=false;
            self.cantALIID=false;
            self.cantVUrl=false;
            self.cantVName=false;
            self.cantVPw=false;
            if(selectedCloud.paramValue[0].SecretId==""){
                self.cantQId=true;
            }else{
                self.cantQId=false;
            }
            if(selectedCloud.paramValue[0].SecretKey==""){
                self.cantQKey=true;
            }else{
                self.cantQKey=false;
            }
        }else if(selectedCloud.paramName=="VMWARE_API_KEY"){
            selectedCloud.paramValue.forEach(function(item,i){
                item.radio = i;
            })
            self.cantALIKey=false;
            self.cantALIID=false;
            self.cantQId=false;
            self.cantQKey=false;
            if(selectedCloud.paramValue[0].vCenterUrl==""){
                self.cantVUrl=true;
            }else{
                self.cantVUrl=false;
            }
            if(selectedCloud.paramValue[0].vCenterName==""){
                self.cantVName=true;
            }else{
                self.cantVName=false;
            }
            if(selectedCloud.paramValue[0].vCenterPassword==""){
                self.cantVPw=true;
            }else{
                self.cantVPw=false;
            }
        }else if((selectedCloud.paramName=="ALIYUN_API_KEY")||(selectedCloud.paramName=="AWS_API_KEY")){
            self.cantQId=false;
            self.cantQKey=false;
            self.cantVUrl=false;
            self.cantVName=false;
            self.cantVPw=false;
            if(selectedCloud.paramValue.AccessKeyID==""){
                self.cantALIID=true;
            }else{
                self.cantALIID=false;
            }
            if(selectedCloud.paramValue.AccessKeySecret==""){
                self.cantALIKey=true;
            }else{
                self.cantALIKey=false;
            }
        }
        
        self.isCantEdit=false;
        self.selectedCloud = selectedCloud;
        if(self.selectedCloud.paramValue.sslThumbprint){
            delete self.selectedCloud.paramValue.sslThumbprint;
        }
        self.selectedCloudCon = self.selectedCloud.paramValue;
        self.addVm = function(){
            var vmItem ={"vCenterName":"","vCenterUrl":"","vCenterUserName":"","vCenterPassword":"","vmConsoleUrl":"https","Active":false,"sslThumbprint":""}
            self.selectedCloudCon.push(vmItem)
            self.selectedCloudCon.forEach(function(item,i){
                item.radio = i;
            })
        }
        self.shutVm = function(i){
            self.selectedCloudCon.splice(i, 1)
            /*self.selectedCloudCon.forEach(function(item,i){
                item.radio = i;
            })*/
        }
    };

    self.isActive=function(k,v){
        if(k=="SecretId"){
            if(v==""){
                self.selectedCloudCon.Active=false;
                self.cantQId=true;
            }else{
                self.cantQId=false;
            }
        }else if(k=="SecretKey"){
            if(v==""){
                self.selectedCloudCon.Active=false;
                self.cantQKey=true;
            }else{
                self.cantQKey=false;
            }
        }else if(k=="AccessKeySecret"){
            if(v==""){
                self.selectedCloudCon.Active=false;
                self.cantALIKey=true;
            }else{
                self.cantALIKey=false;
            }
        }else if(k=="AccessKeyID"){
            if(v==""){
                self.selectedCloudCon.Active=false;
                self.cantALIID=true;
            }else{
                self.cantALIID=false;
            }
        }else if(k=="vCenterUrl"){
            if(v==""){
                self.selectedCloudCon.Active=false;
                self.cantVUrl=true;
            }else{
                self.cantVUrl=false;
            }
        }else if(k=="vCenterName"){
            if(v==""){
                self.selectedCloudCon.Active=false;
                self.cantVName=true;
            }else{
                self.cantVName=false;
            }
        }else if(k=="vCenterPassword"){
            if(v==""){
                self.selectedCloudCon.Active=false;
                self.cantVPw=true;
            }else{
                self.cantVPw=false;
            }
        }
    };
    self.submitValid = false;
    self.checkVmName = true;
    self.updateCloud=function(m){
        self.submitValid = false;
        if (m.$valid) {
            self.validVCenterUrl = {};
            self.isHaddle = true;
            //console.log(self.selectedCloud)
            self.isCantEdit=true;
            if (self.selectedCloud.status == "ADD") {
                let clourname = self.selectedCloud.paramName;
                let data = {
                    "enterpriseUid":localStorage.enterpriseUid,
                    "paramValue":JSON.stringify(self.selectedCloud.paramValue),
                    "paramDesc":self.selectedCloud.paramDesc,
                    "regionUid":angular.fromJson(localStorage.$LOGINDATA).regionUid,
                    "regionKey":localStorage.regionKey,
                    "parentId":3,
                    "paramLevel":2
                };
                if(self.selectedCloud.paramName=="VMWARE_API_KEY"){
                    let selectedCloud = angular.copy(self.selectedCloud);
                    self.checkVmName = true;
                    var arr = selectedCloud.paramValue;
                    for(var i=0;i<arr.length-1;i++){
                        if(self.checkVmName){
                            for(var j=i+1;j<arr.length;j++){  
                                if(arr[i].vCenterName!=arr[j].vCenterName){
                                    var temp=arr[i];  
                                    arr[i]=arr[j];  
                                    arr[j]=temp;  
                                }else{
                                    self.checkVmName = false;
                                    break;
                                }
                            }
                        }
                    }
                    if(self.checkVmName){
                        var vmDis = false;
                        for(var i=0;i<arr.length;i++){
                            if(arr[i].Active==true){
                                vmDis = true;
                                break;
                            }
                        }
                        let vdata = {
                            "enterpriseUid":localStorage.enterpriseUid,
                            "paramValue":JSON.stringify(selectedCloud.paramValue),
                            "paramDesc":selectedCloud.paramDesc,
                            "regionUid":angular.fromJson(localStorage.$LOGINDATA).regionUid,
                            "regionKey":localStorage.regionKey,
                            "parentId":3,
                            "paramLevel":2
                        };
                        //updateCloud(selectedCloud);
                        cloudSrv.addPublicCloud(clourname,vdata).then(function(){
                            //init();
                            self.isHaddle = false;
                            self.isCantEdit = false;
                            updateEnterpriseSupportPublicClouds();
                            updateLocalStorage(vmDis,self.selectedCloud.paramName);
                            $route.reload();
                        }).finally(function(){
                            self.isHaddle = false;
                            $rootScope.vmwareLoadding=false;
                        });
                        localStorage.vmware_flag=1; 
                    }else{
                        self.isHaddle = false;
                    } 

                }else{
                    cloudSrv.addPublicCloud(clourname,data).then(function(){
                        //init();
                        self.isHaddle = false;
                        self.isCantEdit = false;
                        updateEnterpriseSupportPublicClouds();
                        updateLocalStorage(self.selectedCloud.paramValue[0].Active,self.selectedCloud.paramName);
                        $route.reload();
                    }).finally(function(){
                        self.isHaddle = false;
                    });  
                }

            }else{ //update
                function updateCloud(selectedCloud){
                    self.isHaddle = true;
                    let option={
                        "paramId":selectedCloud.paramId,
                        "enterpriseUid":selectedCloud.enterpriseUid,
                        "regionUid":angular.fromJson(localStorage.$LOGINDATA).regionUid,
                        "paramValue":JSON.stringify(selectedCloud.paramValue),
                        "paramName":selectedCloud.paramName,
                        "parentId":JSON.stringify(selectedCloud.parentId),
                        "path":selectedCloud.path
                    };
                    cloudSrv.updateCloud(option).then(function(){
                        //init();
                        self.isCantEdit = false;
                        updateEnterpriseSupportPublicClouds();
                        if(selectedCloud.paramName=='QCLOUD_API_KEY'){
                            updateLocalStorage(selectedCloud.paramValue[0].Active,selectedCloud.paramName);
                        }
                        if(selectedCloud.paramName=='VMWARE_API_KEY'){
                            var vmDis = false;
                            for(var i=0;i<arr.length;i++){
                                if(arr[i].Active==true){
                                    vmDis = true;
                                    break;
                                }
                            }
                            updateLocalStorage(vmDis,selectedCloud.paramName);
                            localStorage.vmware_flag=1;
                        }

                    }).finally(function(){
                        self.isHaddle = false;
                    });
                }
                if(self.selectedCloud.paramName=="VMWARE_API_KEY"){
                    // $rootScope.vmwareLoadding=true;
                    var selectedCloud = angular.copy(self.selectedCloud);
                    self.checkVmName = true;
                    var arr = selectedCloud.paramValue;
                    for(var i=0;i<arr.length-1;i++){
                        if(self.checkVmName){
                            for(var j=i+1;j<arr.length;j++){  
                                if(arr[i].vCenterName!=arr[j].vCenterName){
                                    var temp=arr[i];  
                                    arr[i]=arr[j];  
                                    arr[j]=temp;  
                                }else{
                                    self.checkVmName = false;
                                    break;
                                }
                            }
                        } 
                    }
                    if(self.checkVmName){
                        updateCloud(selectedCloud);
                    }else{
                        self.isHaddle = false;
                    }
                }else{
                    updateCloud(self.selectedCloud);
                }
            } 
        }else{
            self.submitValid = true;
        }       
    };

    self.cancel=function(){
        self.validVCenterUrl = {};
        if(self.selectedCloud.paramName=="QCLOUD_API_KEY"&&self.selectedCloud.status=="ADD"){
            self.selectedCloudCon.SecretId="";
            self.selectedCloudCon.SecretKey="";
            self.selectedCloudCon.Active=false;
        }else if(self.selectedCloud.paramName=="VMWARE_API_KEY"&&self.selectedCloud.status=="ADD"){
            self.selectedCloudCon.vCenterUrl="";
            self.selectedCloudCon.vCenterName="";
            self.selectedCloudCon.vCenterPassword="";
            self.selectedCloudCon.Active=false;
        }else if((self.selectedCloud.paramName=="ALIYUN_API_KEY"||self.selectedCloud.paramName=="AWS_API_KEY")&&self.selectedCloud.status=="ADD"){
            self.selectedCloudCon.AccessKeySecret="";
            self.selectedCloudCon.AccessKeyID="";
            self.selectedCloudCon.Active=false;
        }else if(self.selectedCloud.status=="UPDATE"){
            cloudSrv.getDictDataByEidAndDid().then(function(result){
                if(result&&result.data){
                    _.forEach(result.data,function(item){
                        if(item.paramName==self.selectedCloud.paramName){
                            self.selectedCloud.id = item.paramId;
                            self.selectedCloud.enterpriseUid = item.enterpriseUid;
                            self.selectedCloud.dictValue = item.parentId;
                            self.selectedCloud.paramValue = JSON.parse(item.paramValue);
                            self.selectedCloud.status = "UPDATE";
                        }
                    })
                    self.changCloud(self.selectedCloud);
                }
            })
        }
        
    };

    self.validVCenterUrl = {};
    self.checkVCenterUrlValid = function(vmCloudCon, index) {
        let params = {
            vCenterUrl: vmCloudCon.vCenterUrl,
            username: vmCloudCon.vCenterUserName,
            password: vmCloudCon.vCenterPassword,
            vmConsoleUrl: vmCloudCon.vmConsoleUrl,
            vCenterName:vmCloudCon.vCenterName,
            enterpriseUid:localStorage.enterpriseUid
        };
        cloudSrv.getSSLThumbprint(params).then(function(res) {
            if (res && res.status == 0) {
                self.validVCenterUrl["valid_" + index] = "success";
            } else {
                self.validVCenterUrl["valid_" + index] = "fail";
            }
        });
    };
    init();
});
