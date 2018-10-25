import "./generalSrv";

var generalModule = angular.module("generalModule", ["generalSrv"]);
generalModule.controller("generalCtrl", ["$scope", "generalSrv", "$timeout", "alertSrv", "$translate", function($scope, generalSrv, $timeout,
    alertSrv, $translate) {
    var self = $scope;
    self.general = {
        curTable:"saas"
    };
    self.generalConf = {};
    self.generalConf_origin = {};
    self.canModifyConfSet_0 = true;
    self.canModifyConfSet_1 = true;
    self.canModifyConfSet_2 = true;
    self.canModifyConfSet_3 = true;
    self.showModifyConfSet_0 = false;
    self.showModifyConfSet_1 = false;
    self.showModifyConfSet_2 = false;
    self.showModifyConfSet_3 = false;
    self.submitInValid = false;
    self.submitInValid1 = false;
    self.submitInValid2 = false;
    self.novaRetry = false;
    self.cinderRetry = false;
    self.upsRetry = false;
    self.platformRetry = false;
    self.currentNodeCount = 0;
    self.reclaim_instance_interval_range = {
        min:1,
        max:30
    };
    self.nova_reserved_memory_size_range = {
        min:8,
        max:32
    };
    self.cpu_allocation_ratio_range = {
        min:1,
        max:16
    };
    self.block_device_allocate_retries_range = {
        min:30,
        max:360
    };
    self.block_device_allocate_retries_interval_range = {
        min:1,
        max:10
    };
    self.scheduler_max_attempts_range = {
        min:1,
        max:10
    };
    self.action_retries_range = {
        min:1,
        max:10
    };
    self.check_interval_range  = {
        min:1,
        max:10
    }
    self.timeList = [
        { 
            id: "300",
            name: $translate.instant("aws.general.time.5min")
        }, { 
            id: "600",
            name: $translate.instant("aws.general.time.10min")
        }, {
            id: "900",
            name: $translate.instant("aws.general.time.15min")
        }, {
            id: "1800",
            name: $translate.instant("aws.general.time.30min")
        }, {
            id: "3600",
            name: $translate.instant("aws.general.time.1hour")
        }, {
            id: "7200",
            name: $translate.instant("aws.general.time.2hour")
        }, {
            id: "10800",
            name: $translate.instant("aws.general.time.3hour")
        }, {
            id: "21600",
            name: $translate.instant("aws.general.time.6hour")
        }];
    self.upsTypeList = [
        { 
            id: "APC",
            name: $translate.instant("aws.general.ups.apc")
        }, { 
            id: "GCCALLIANCE",
            name: $translate.instant("aws.general.ups.gcc")
        }
    ];
    self.nodeCountList = [
        { 
            id: "1",
            name: "3-8"
        }, { 
            id: "2",
            name: "9-12"
        },{ 
            id: "3",
            name: "13-24"
        },{ 
            id: "4",
            name: "25-48"
        },{ 
            id: "5",
            name: "49-60"
        }
    ];

    self.$on("clustereError",function(e,data){
        alertSrv.set("", $translate.instant("aws.statusCode."+data), "error", 5000);
    })


    self.$on("saasServiceSuccess", function(e, data) {
        getRegionConfigs();
        getConfStatus();
    });

    self.$on("novaServiceFail", function(e, data) {
        getConfStatus();
    });

    self.$on("cinderServiceFail", function(e, data) {
        getConfStatus();
    });

    self.$on("computehaServiceFail", function(e, data) {
        getConfStatus();
    });

    self.$on("upsServiceFail", function(e, data) {
        getConfStatus();
    });

    self.$on("platformServiceFail", function(e, data) {
        getConfStatus();
    });

    self.toSaas  = function(){
        self.general.curTable = "saas";
        saasConfInfo('777'); //初始化云管超时时间
        saasConfInfo('724'); //初始化配额
        saasConfInfo('923'); //初始化密码
    }

    self.toSaasSevice  = function(){
        self.general.curTable = "saasSevice";
        getRegionConfigs();
        getConfStatus();
    }

    self.chkNodeCountScale =function(id){
        self.showScaleTip = false;
        if(self.generalConf_origin.platform_scale < id){
            self.showScaleTip = true;
        }
    }

    self.confSet = function(type){
        var region = localStorage.regionUid;
        var postData = {
            "confKey": "region",
            "regionKey": localStorage.regionKey,
            "setType": type, // nova相关参数配置修改
        };
        switch(type){
            case "0":
                if(!self.novaConfForm1.$valid || !self.novaConfForm2.$valid  
                    || !self.novaConfForm3.$valid || !self.novaConfForm4.$valid || !self.novaConfForm5.$valid){
                        self.submitInValid = true;
                        return;
                }
                postData.keyValuePairs = {
                    "reclaim_instance_interval": self.generalConf.reclaim_instance_interval*86400,
                    "nova_reserved_memory_size": self.generalConf.nova_reserved_memory_size*1024,
                    "cpu_allocation_ratio": self.generalConf.cpu_allocation_ratio,
                    "ram_allocation_ratio": self.generalConf.ram_allocation_ratio,
                    "block_device_allocate_retries_interval": self.generalConf.block_device_allocate_retries_interval,
                    "block_device_allocate_retries": self.generalConf.block_device_allocate_retries
                };
                break;
            case "1":
                if(!self.cinderConfForm1.$valid){
                    self.submitInValid1 = true;
                        return;
                }
                postData.keyValuePairs = {
                    "scheduler_max_attempts": self.generalConf.scheduler_max_attempts 
                };
                break;
            case "2":
                if(!self.confSetForm1.$valid || !self.confSetForm2.$valid || !self.confSetForm3.$valid){
                    self.submitInValid2 = true;
                    return;
                }
                postData.keyValuePairs = {
                    "action_retries": self.generalConf.action_retries,
                    "check_interval": self.generalConf.check_interval,
                    "ups_type": self.generalConf.ups_type
                };
                break;
            case "3":
                postData.keyValuePairs = {
                    "platform_scale": self.generalConf.platform_scale
                };
                break;

        }
        //任意一个模块在更新配置中时，其他模块也不能操作
        
        generalSrv.confVersion(postData,region).then(function(res){
            if(res && res.status == "0"){
                self["showModifyConfSet_"+type]=true;
                self["canModifyConfSet_0"]=false;
                self["canModifyConfSet_1"]=false;
                self["canModifyConfSet_2"]=false;
                self["canModifyConfSet_3"]=false;
                getRegionConfigs();
            }
        })
    };

    self.saasCofSet = function(type){
        var option = {
            enterpriseUid: localStorage.enterpriseUid,
            regionUid: "0",
            paramId:self[type].paramId,
            paramName:type,
            paramValue:self[type].paramValue,
        }
        switch(type){
            case "ENT_EXPIRE_TOKEN":
                option.parentId = "777";
                break;
            case "ENT_QUOTA_CEHCK_CONFIG":
                option.parentId = "724";
                option.paramValue = Number(self[type].paramValue);
                break;
            case "ENT_PWD_EXPIRED_DAYS":
                option.parentId = "923";
                option.paramValue = Number(self[type].paramValue)?"60":"-1";
                break;
            case "ENT_PWD_FORCE_MODIFY":
                option.parentId = "923";
                option.paramValue = Number(self[type].paramValue);
                break;
        }
        generalSrv.saasCofSet(option).then(function(res) {
            if(res && res.status == "0") {
                switch(type){
                    case "ENT_EXPIRE_TOKEN":
                        self.conf_token_change = false;
                        saasConfInfo('777');
                        break;
                    case "ENT_QUOTA_CEHCK_CONFIG":
                        saasConfInfo('724');
                        self.conf_quota_change = false;
                        break;
                    case "ENT_PWD_FORCE_MODIFY":
                        self.conf_pwdModify_change= false
                        saasConfInfo('923');
                        break;
                    case "ENT_PWD_EXPIRED_DAYS":
                        self.conf_pwdExpired_change  = false
                        saasConfInfo('923');
                        break;
                }
               
                
            }
        })

    };

    function getConfStatus(){
        self.canModifyConfSet_0 = true;  //当有其他模块更新时不让操作
        self.canModifyConfSet_1 = true;
        self.canModifyConfSet_2 = true;
        self.canModifyConfSet_3 = true;
        self.novaRetry = false;   //按钮是否重试
        self.cinderRetry = false;
        self.upsRetry = false;
        self.platformRetry = false;
        self.showModifyConfSet_0 = false;  //隐藏更新配置按钮
        self.showModifyConfSet_1 = false;
        self.showModifyConfSet_2 = false;
        self.showModifyConfSet_3 = false;
        self.conf_nova_change = false;     //页面是否更改
        self.conf_cinder_change = false; 
        self.conf_ups_change = false;
        self.conf_platform_change = false;
        generalSrv.getConfStatus().then(function(res){
            if(res && res.data && angular.isArray(res.data)){
                res.data.map(item => {     
                    if(item && item.indexOf("config.Update.nova.fail")>-1){
                        self.novaRetry = true;         //如果有失败的，要求重试；
                        self.conf_nova_change = true;  //重试的时候不进行是否更改的校验
                        self.canModifyConfSet_1 = false;
                        self.canModifyConfSet_2 = false;
                        self.canModifyConfSet_3 = false;
                    }else if(item && item.indexOf("config.Update.cinder.fail")>-1){
                        self.cinderRetry = true;
                        self.conf_cinder_change = true;
                        self.canModifyConfSet_0 = false;
                        self.canModifyConfSet_2 = false;
                        self.canModifyConfSet_3 = false;
                    }else if(item && item.indexOf("config.Update.computeha.fail")>-1){
                        self.upsRetry = true;
                        self.conf_ups_change = true;
                        self.canModifyConfSet_0 = false;
                        self.canModifyConfSet_1 = false;
                        self.canModifyConfSet_3 = false;
                    }else if(item && item.indexOf("config.Update.ups.fail")>-1){
                        self.upsRetry = true;
                        self.conf_ups_change = true;
                        self.canModifyConfSet_0 = false;
                        self.canModifyConfSet_1 = false;
                        self.canModifyConfSet_3 = false;
                    }
                    else if(item && item.indexOf("config.Update.platform.fail")>-1){
                        self.platformRetry = true;
                        self.conf_platform_change = true;
                        self.canModifyConfSet_0 = false;
                        self.canModifyConfSet_1 = false;
                        self.canModifyConfSet_2 = false;
                    }
                    if(item && item == "config.Update.nova.ing" ){
                        self.showModifyConfSet_0 = true;
                    }else if(item && item == "config.Update.cinder.ing" ){
                        self.showModifyConfSet_1 = true;
                    }else if(item && item == "config.Update.computeha.ing"){
                        self.showModifyConfSet_2 = true;
                    }else if(item && item == "config.Update.ups.ing" ){
                        self.showModifyConfSet_2 = true;
                    }else if(item && item == "config.Update.platform.ing" ){
                        self.showModifyConfSet_3 = true;
                    }
                    if(item && item.indexOf('ing')>-1){     //如果有更新配置，页面不让操作
                        self.canModifyConfSet_0 = false;
                        self.canModifyConfSet_1 = false;
                        self.canModifyConfSet_2 = false;
                        self.canModifyConfSet_3 = false;
    
                    }
                })
            }
        })
    }

    function getRegionConfigs() {
        generalSrv.getRegionConfigs().then(function(res) {
            if(res && res.data && angular.isArray(res.data)) {
                self.regionList = res.data;
                self.regionList.forEach(function(item, index) {
                    if(item.regionKey == localStorage.regionKey) {
                        self.generalConf = item.regionConfigScriptMap;
                        self.generalConf.nova_reserved_memory_size = self.generalConf.nova_reserved_memory_size/1024;
                        self.generalConf.reclaim_instance_interval = self.generalConf.reclaim_instance_interval/86400;
                        self.generalConf_origin = angular.copy(self.generalConf);
                        if(item.regionConfigScriptMap && item.regionConfigScriptMap.registered_hosts){
                            self.currentNodeCount = item.regionConfigScriptMap.registered_hosts.length;
                        }
                    }
                });
            }
        });
    };

    function generalConf_nova(type){
        return [self[type].reclaim_instance_interval,
            self[type].nova_reserved_memory_size,
            self[type].cpu_allocation_ratio,
            self[type].ram_allocation_ratio,
            self[type].block_device_allocate_retries_interval,
            self[type].block_device_allocate_retries].join("&");
    }
    function generalConf_cinder(type){
        return self[type].scheduler_max_attempts;
    }
    function generalConf_ups(type){
        return [self[type].action_retries,
            self[type].check_interval,
            self[type].ups_type].join("&");
    }
    function generalConf_platform(type){
        return self[type].platform_scale ;
    }
    
    function saasConfInfo(parentId) {
        generalSrv.saasConfInfo(parentId).then(function(res) {
            if(res && res.data && res.data.length) {
                _.forEach(res.data, function(item) {
                    if(item.paramName){
                        self[item.paramName] = item;
                        if( item.paramName=="ENT_PWD_EXPIRED_DAYS"){
                            self[item.paramName].paramValue = item.paramValue=="-1"?false:true;
                        }else if(item.paramName != 'ENT_EXPIRE_TOKEN'){
                            self[item.paramName].paramValue = item.paramValue=="0"?false:true;
                        }
                        
                        
                        self[item.paramName+"_origin"] = angular.copy(item);
                    }
                });
            }
        });
    }
    self.ENT_EXPIRE_TOKEN = {}; 
    self.ENT_QUOTA_CEHCK_CONFIG = {};
    self.ENT_PWD_FORCE_MODIFY = {};
    self.ENT_PWD_EXPIRED_DAYS = {};

    //监听每个模块的值是否改变，如果没有改变，不能点击保存。
    self.$watch(function(){
        return self.ENT_EXPIRE_TOKEN.paramValue
    },function(value){
        if(self.ENT_EXPIRE_TOKEN_origin){
            if(value == self.ENT_EXPIRE_TOKEN_origin.paramValue ){
                self.conf_token_change = false
            }else{
                self.conf_token_change = true
            }
        }
    })

    self.$watch(function(){
        return self.ENT_QUOTA_CEHCK_CONFIG.paramValue
    },function(value){
        if(self.ENT_QUOTA_CEHCK_CONFIG_origin){
            if(value == self.ENT_QUOTA_CEHCK_CONFIG_origin.paramValue ){
                self.conf_quota_change = false
            }else{
                self.conf_quota_change = true
            }
        }
    })

    self.$watch(function(){
        return self.ENT_PWD_FORCE_MODIFY.paramValue
    },function(value){
        if(self.ENT_PWD_FORCE_MODIFY_origin){
            if(value== self.ENT_PWD_FORCE_MODIFY_origin.paramValue ){
                self.conf_pwdModify_change = false
            }else{
                self.conf_pwdModify_change = true
            }
        }
    })

    self.$watch(function(){
        return self.ENT_PWD_EXPIRED_DAYS.paramValue
    },function(value){
        if(self.ENT_PWD_EXPIRED_DAYS_origin){
            if(value == self.ENT_PWD_EXPIRED_DAYS_origin.paramValue ){
                self.conf_pwdExpired_change = false
            }else{
                self.conf_pwdExpired_change = true
            }
        }
    })


    self.$watch(function(){
        return [self['generalConf'].reclaim_instance_interval,
        self['generalConf'].nova_reserved_memory_size,
        self['generalConf'].cpu_allocation_ratio,
        self['generalConf'].ram_allocation_ratio,
        self['generalConf'].block_device_allocate_retries_interval,
        self['generalConf'].block_device_allocate_retries].join("&");
    },function(value){
        if(value){
            if(value == generalConf_nova('generalConf_origin') && !self.novaRetry){
                self.conf_nova_change = false;
            }else {
                self.conf_nova_change = true;
            }
        }

    })

    self.$watch(function(){
        return self['generalConf'].scheduler_max_attempts;
    },function(value){
        if(value){
            if(value == generalConf_cinder('generalConf_origin') && !self.cinderRetry){
                self.conf_cinder_change = false;
            }else {
                self.conf_cinder_change = true;
            }
        }
    })

    self.$watch(function(){
        return [self['generalConf'].action_retries,
        self['generalConf'].check_interval,
        self['generalConf'].ups_type].join("&");
    },function(value){
        if(value){
            if(value == generalConf_ups('generalConf_origin') && !self.upsRetry){
                self.conf_ups_change = false;
            }else {
                self.conf_ups_change = true;
            }
        }

    });

    self.$watch(function(){
        return self['generalConf'].platform_scale;
    },function(value){
        if(value){
            if(value == generalConf_platform('generalConf_origin') && !self.platformRetry){
                self.conf_platform_change = false;
            }else {
                self.conf_platform_change = true;
            }
        }
    })
    saasConfInfo('777'); //初始化云管超时时间
    saasConfInfo('724'); //初始化云管超时时间
    saasConfInfo('923'); //初始化云管超时时间
}]);
