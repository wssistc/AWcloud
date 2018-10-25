batchRegisterCtrl.$inject=["$scope", "$rootScope", "$translate","$uibModalInstance","physicalConductorSrv","editData","alertSrv","$timeout","$http"];
export function batchRegisterCtrl($scope, $rootScope, $translate,$uibModalInstance,physicalConductorSrv,editData,alertSrv,$timeout,$http){
    var self=$scope;
    var resource_url = window.GLOBALCONFIG.APIHOST.RESOURCE
    //导入license
    self.fileCheck=false;
    self.selected_file="";
    self.checkResult=[];
    self.showResultWrap = true; 
    self.canClick = true;
    self.canLeadResult = true;  
    self.fileNameChanged=function(){
        self.checkResult=[];
        self.fileCheck=false;
        self.selected_file = document.getElementById("upload").value;
        var dom = document.getElementById("upload");
        var file = dom.files[0];
        let fileSize = 0;
        var fileType ="";
        file ? fileSize = file.size:self.selected_file=""; 
        file ? fileType=file.name.substr(-4,4):fileType=".xlsl";
        if(fileType==".xlsl"&&fileSize<1048576){
            self.fileCheck=false;
        }else{
            self.fileCheck=true;
            self.canClick=false;
        }
        self.$apply();
　　}
    self.isCheckDoIt=false
    self.doIt = function(filed){
        self.canClick = true;
        self.fileError = false;
        self.checkResult = []
        if(self.fileCheck){
            self.isCheckDoIt=true;
            var scope = self;
            var form = document.forms.namedItem("registerForm");
            var oData = new FormData(form);
            var oReq = new XMLHttpRequest();
            var importsuccess=$translate.instant("aws.license.importFileSuccess");
            var importerror=$translate.instant("aws.license.importFileError");
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
                    }else{
                        alertSrv.set("",importerror , "error",5000);
                    }
                }
            }
            if(editData=="limitPvm"){
                let enterpriseUid=localStorage.getItem("enterpriseUid")
                oReq.open("POST", resource_url+"/v1/ipmi/" + enterpriseUid + "/node/batch", true);
            }else if(editData=="unlimitPvm"){
                oReq.open("POST", resource_url+"/v1/ironic/node/batch", true);
            }
            let auth_token = localStorage.$AUTH_TOKEN;
            oReq.setRequestHeader("X-Auth-Token",auth_token); 
            oReq.send(oData);
            oReq.onreadystatechange =function(){
                if(oReq.readyState==4){
                    if(oReq.status==200){
                        self.waiting=false
                        self.canClick = false;
                        self.canLeadResult = false;
                        if(oReq.response&&JSON.parse(oReq.response).data&&JSON.parse(oReq.response).data.data){
                            $rootScope.$broadcast("refresh");
                            self.checkResult=JSON.parse(oReq.response).data.data
                        }else{
                            self.fileError=true
                        }
                    }
                }
            }
        }else{
            self.fileError=true
        }
    }
    self.waiting=false
    self.$watch(function(){
        return self.checkResult
    },function(value){
        if(value.length){
            self.waiting=false
        }
    },true)
    self.showResult=function(){
        if(self.fileCheck){
            self.leading=false
            if(self.isCheckDoIt){
                self.canDoIt=false
                if(self.checkResult.length){
                    self.showResultWrap=false
                }else{
                    self.showResultWrap=true
                    self.waiting=true
                }
            }else{
                self.canDoIt=true
            }
        }else{
            self.leading=true
        }
    }
    self.hideWrap=function(){
        self.showResultWrap=true
    }
    self.noResultExport=false

    self.exportResult=function(){
        if(self.checkResult.length){
            self.noResultExport=false
            $http({
                method: "POST",
                url: resource_url+'/v1/ironic/node/export/url',
                data:self.checkResult
            }).then(function(res) {
                if (res&&res.data) {
                    var link = document.createElement('a');
                    link.setAttribute('href', res.data);
                    var event = document.createEvent('MouseEvents');
                    event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
                    link.dispatchEvent(event);
                }
            })
        }else{
            self.noResultExport=true
        }
    }
    self.download=function(){
        let urlType=""
        if(editData=="limitPvm"){ 
            urlType="js/pvm/template/ipmiTemplate.xlsx"
        }else{
            urlType="js/pvm/template/ironicTemplate.xlsx"
        }
        window.location=urlType;                                                           
    }
}
