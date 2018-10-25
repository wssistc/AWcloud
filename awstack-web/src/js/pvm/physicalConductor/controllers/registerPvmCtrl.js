registerPvmCtrl.$inject=["$scope", "$rootScope", "$translate","$uibModalInstance","physicalConductorSrv","editData"];
export function registerPvmCtrl($scope, $rootScope, $translate,$uibModalInstance,physicalConductorSrv,editData){
    var self=$scope;
    self.submitValid = false;
    self.IPMIsubmitValid = false;
    self.limitPvm = "limitPvm";
    self.hasVerify = false;
    self.checkIPMIPass = false;
    self.caninitProvision = false;
    self.initProvision = false;
    self.canInput = false;    
    self.properties = {};
    self.driverInfo = {}
    console.log(editData)
    if(editData&&editData.name){ 
        if(editData.init == "已完成"){
            self.canInput = true;
            self.driverInfo.ipmi_password = "Abcde124!";        
        }else{
            self.canInput = false;
        }
        self.showInit = false;
        self.nodeName = editData.name;
        self.driverInfo.ipmi_username = editData.driverInfo.ipmi_username;  
        var ipmi_address = editData.driverInfo.ipmi_address.split(".");
        self.ip_0 = ipmi_address[0];
        self.ip_1 = ipmi_address[1];
        self.ip_2 = ipmi_address[2];
        self.ip_3 = ipmi_address[3];
        self.pvmTitle = $translate.instant("aws.pvm.edit");        
        editData.limitAttribute?self.limitPvm = "limitPvm":self.limitPvm = "unlimitPvm" ;
    }else{
        self.showInit = true;
        self.pvmTitle = $translate.instant("aws.pvm.register");
        self.limitPvm =  editData ;
    }
    function IPMI_address(){
        return self.ip_0 + "." + self.ip_1 + "." + self.ip_2 + "." + self.ip_3;
    } 
    // self.$watch(function(){
    //     return IPMI_address() +  self.driverInfo.ipmi_username + self.driverInfo.ipmi_password;
    // },function(value){
    //     if(value && value != self.copyVerifyIPMI){
    //         self.hasVerify = false;
    //         self.checkIPMIPass = false;
    //         self.initProvision = false;
    //     }
    // })
    // 校验ipmi
    self.verifyIPMI = function(IPMIfiled){
        if(!self.canInput){
            if(IPMIfiled.$valid){
                //self.hasVerify = true;
                self.checkIPMIPass = false;
                self.caninitProvision = false;
                self.copyVerifyIPMI = IPMI_address() +  self.driverInfo.ipmi_username + self.driverInfo.ipmi_password;
                self.copyIPMI_address = IPMI_address();
                self.copyipmi_username = self.driverInfo.ipmi_username;
                self.copyipmi_password = self.driverInfo.ipmi_password;
                let postVerify = {
                    nodes:[
                        {	
                            "ipmi_auth_info":{
                                "ipmi_address":IPMI_address(),
                                "ipmi_username":self.driverInfo.ipmi_username, 
                                "ipmi_password": self.driverInfo.ipmi_password
                            }
                        }
                    ]
                }
                physicalConductorSrv.checkIPMI(postVerify).then(function(res){
                    if(res && res.data){
                        var check = angular.fromJson(res.data);
                        if(check.nodes[0].check){
                            self.caninitProvision = true;
                            self.checkIPMIPass = true;
                            $rootScope.$broadcast("alert-success", "010")
                        }else{
                            (editData&&editData.name) ? "" : self.checkIPMIPass = true;
                            $rootScope.$broadcast("alert-error", "011");
                        }
                    }
                    
                })
            }else{
                self.IPMIsubmitValid = true;
            }
        }
    }

    // function getIronicImages(){
    //     physicalConductorSrv.IronicGetImages().then(function(res){
    //         if(res && res.data && angular.isArray(res.data)){
    //             res.data.map(item =>{
    //                 item.name == "centos7-deploy-kernel"?self.deployKernel = item.imageUid:'';
    //                 item.name == "centos7-deploy-initrd"?self.deployRamdisk = item.imageUid:'';
    //             })

    //         }
    //     })
    // }
    // getIronicImages()  //获取ironic镜像

    function postDataFuc(){
        if(self.canInput){
            return {	
                "nodeName": self.nodeName
            }
        }else{
            return {	
                "ipmiAddress": self.copyIPMI_address,
                "ipmiPassword": self.copyipmi_password,
                "ipmiUsername": self.copyipmi_username,
                "nodeName": self.nodeName
            }
        } 
    }

    self.confirm = function(registerForm,settingForm){
        if(registerForm.$valid){
            if(editData&&editData.name){ //编辑
                if(self.limitPvm == "limitPvm"){ //受限
                    var postData = postDataFuc()
                    physicalConductorSrv.editPvmFromlimit(editData.uuid,postData).then(function(){
                        $rootScope.$broadcast("refresh");
                    })
                }else{//非受限
                    var postData = postDataFuc()
                    physicalConductorSrv.editFromUnlimit(editData.uuid,postData).then(function(){
                        $rootScope.$broadcast("refresh");
                    })
                }
            }else{ //注册
                if(self.limitPvm == "limitPvm"){ //注册受限物理机
                    let regPostData =[{
                         "nodeName":self.nodeName,
                         "ipmiAddress":IPMI_address(),
                         "ipmiUsername":self.driverInfo.ipmi_username, 
                         "ipmiPassword": self.driverInfo.ipmi_password
                       }
                       
                    ]
                   
                    physicalConductorSrv.registerPvm(regPostData).then(function(){
                        $rootScope.$broadcast("refresh");
                    })
                }else if(self.limitPvm == "unlimitPvm"){ //注册非受限物理机
                    let regUnPostData = {
                        "ipmiAddress": IPMI_address(),
                        "ipmiPassword": self.driverInfo.ipmi_password,
                        "ipmiUsername": self.driverInfo.ipmi_username,
                        "name": self.nodeName,
                        "initialize":self.initProvision
                    }
                    physicalConductorSrv.IronicRegisterPvm(regUnPostData).then(function(){
                        $rootScope.$broadcast("refresh");
                    })
                }
                
            }
            $uibModalInstance.close()
            
        }else{
            self.submitValid = true;
        }

    }

}