import "./paasSrv";
import "../cloud/cloudSrv"

var cloudModule = angular.module("paasModule", ["ngTable", "ngAnimate", "ui.bootstrap", "ui.select","paasSrv"]);
cloudModule.controller("paasCtrl", function($scope, $rootScope, NgTableParams, $location, $uibModal, paasSrv,cloudSrv) {
    let self = $scope;
    self.paas={
        TDSQL : {
            paramValue:{},
            canEdit:false
        },
        CTSDB : {
            paramValue:{},
            canEdit:false
        },
        TSF : {
            paramValue:{},
            canEdit:false
        },
        CloudMirror : {
            paramValue:{},
            canEdit:false
        },
        Tbase : {
            paramValue:{},
            canEdit:false
        },
        WeavingCloud : {
            paramValue:{},
            canEdit:false
        },
        TBDS : {
            paramValue:{},
            canEdit:false
        },
        CMQ : {
            paramValue:{},
            canEdit:false
        },
        APIGateway : {
            paramValue:{},
            canEdit:false
        },
        BlueWhale : {
            paramValue:{},
            canEdit:false
        },
        PsionicCloud : {
            paramValue:{},
            canEdit:false
        },
    };
    self.paasServiceTypes = [
        {name:"TDSQL",paramName:"TDSQL"},
        {name:"CTSDB",paramName:"CTSDB"},
        {name:"TSF",paramName:"TSF"},
        {name:"云镜",paramName:"CloudMirror"},
        {name:"Tbase",paramName:"Tbase"},
        {name:"织云",paramName:"WeavingCloud"},
        {name:"TBDS",paramName:"TBDS"},
        {name:"CMQ",paramName:"CMQ"},
        {name:"API网关",paramName:"APIGateway"},
        {name:"蓝鲸",paramName:"BlueWhale"},
        {name:"灵雀云",paramName:"PsionicCloud"}
    ];
    self.paas.selectedPassService = self.paasServiceTypes[0].paramName;

    function init(){ 
        paasSrv.getDictDataByEidAndDid().then(function(result){
            if(result && result.data){
                _.forEach(self.paasServiceTypes,function(paas){
                    _.forEach(result.data,function(item){
                        if(paas.paramName == item.paramName){
                            self.paas[paas.paramName].paramId = item.paramId;
                            self.paas[paas.paramName].paramName = item.paramName;
                            self.paas[paas.paramName].path = item.path;
                            self.paas[paas.paramName].enterpriseUid = item.enterpriseUid;
                            self.paas[paas.paramName].parentId = item.parentId;
                            self.paas[paas.paramName].paramValue = JSON.parse(item.paramValue)[0];
                            self.paas[paas.paramName].canEdit = true;
                        }
                    });
                });
            }   
        })
    }
    init();

    self.changePaasService = function(){
        self.paasForm.$setPristine();
        self.paasForm.$setUntouched(); 
        self.submitInValid = false;
    }
  
    
    self.confirmPaas = function(form){
        self.submitInValid = false;
        if(!form.$valid){
            self.submitInValid = true;
            return;
        }
        if(self.paas[self.paas.selectedPassService].canEdit){
            //update
            let option={
                "paramId":self.paas[self.paas.selectedPassService].paramId,
                "enterpriseUid":self.paas[self.paas.selectedPassService].enterpriseUid,
                "regionUid":angular.fromJson(localStorage.$LOGINDATA).regionUid,
                "paramValue":JSON.stringify([self.paas[self.paas.selectedPassService].paramValue]),
                "paramName":self.paas[self.paas.selectedPassService].paramName,
                "parentId":JSON.stringify(self.paas[self.paas.selectedPassService].parentId),
                "path":self.paas[self.paas.selectedPassService].path
            };
            cloudSrv.updateCloud(option).then(function(){
                init()
            })
        }else{
            //new
            var paramValue = [{
                service:self.paas.selectedPassService,
                url:self.paas[self.paas.selectedPassService].paramValue.url,
                username:self.paas[self.paas.selectedPassService].paramValue.username,
                password:self.paas[self.paas.selectedPassService].paramValue.password,
                Active:self.paas[self.paas.selectedPassService].paramValue.active
            }]
            var post = {
                "enterpriseUid":localStorage.enterpriseUid,
                "paramValue":angular.toJson(paramValue),
                "paramDesc":self.paas.selectedPassService,
                "regionUid":localStorage.regionUid,
                "regionKey":localStorage.regionKey,
                "parentId":937,
                "paramLevel":2
            }
            cloudSrv.addPublicCloud(self.paas.selectedPassService,post).then(function(){
                init()
            })

        }
        
        
        
    }

    self.resetPaas = function(){
        init();
    }
    

});
