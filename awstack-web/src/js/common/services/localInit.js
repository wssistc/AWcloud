var localInitModule = angular.module("localInitModule", []);

localInitModule.service("localInit", ["$rootScope", "commonFuncSrv","$http", "$location","alertSrv",function(rootscope, commonFuncSrv,$http,$location,alert) {
    var static_url = "http://192.168.138.134:8080/awstack-user/v1";
    var static_url_code="http://192.168.140.126:9080/awstack-user/v1";
    this.clearLocalstorage = function(){
        let localList = ['pwdLastUpdatedTime','pwdExpiredDate','$AUTH_TOKEN','enterpriseUid',
            'managementRole','userName','regionName','regionKey','domainUid','domainName','projectName',
            'projectUid','firstLogin','firstInitSetting','platformInitialized','canPlatformInit','userUid',
            '$USERID','permission','$LOGINDATA','defaultdomainUid','defaultdomainName','defaultProjectUid',
            'defaultProjectName','enterpriseLoginName','backupsService',,'cinderService','isCustom','isEnabledArbiter',
            'cephService','supportOtherClouds','supportPaas','installK8s','installIronic','TotalListName','$AWLOGINED','$MENUPREMIT',
            'LicenseList','menuList','loginUrl','vmware_flag','regionNum','createTime','pwdForceModify','regionBusiAuth'
        ];
        for(let i=0;i<localList.length;i++){
            localStorage.removeItem(localList[i]);
        }
        
    }
    
    this.localstorageInit = function(result,self) {
        if(result.data.data.token){
            //localStorage.$AUTH_TOKEN =  result.data.data.token;
            localStorage.$AUTH_TOKEN =  result.data.data.authToken;
        };
        localStorage.pwdLastUpdatedTime = result.data.data.pwdLastUpdatedTime; //密码上次修改的时间
        localStorage.pwdExpiredDate = result.data.data.pwdExpiredDate; //密码过期时间
        localStorage.pwdForceModify= result.data.data.pwdForceModify?1:2; //新用户强制修改密码开关
        localStorage.createTime= result.data.data.createTime;//用户创建时间
        localStorage.enterpriseUid = result.data.data.enterpriseUid;
        localStorage.managementRole = result.data.data.managementRole;
        localStorage.userName = result.data.data.userName;
        self.$emit('region-refresh',{type:'changeRegion',data:result.data.data});
        localStorage.regionName = result.data.data.regionName;
        localStorage.regionKey = result.data.data.regionKey;
        localStorage.regionUid = result.data.data.regionUid;
        localStorage.regionNum = result.data.data.regionList.length;
        localStorage.domainUid = result.data.data.domainUid; //部门Uid
        localStorage.domainName = result.data.data.domainName; //部门Name
        localStorage.projectName = result.data.data.defaultProjectName; //项目Name
        localStorage.projectUid = result.data.data.defaultProjectUid; //项目Uid
        localStorage.firstLogin = result.data.data.firstLogin; //首次登录
        rootscope.firstInitSetting = result.data.data.firstLogin;
        localStorage.platformInitialized = result.data.data.platformInitialized; //初始化设置是否完成
        if (result.data.data.managementRole == 3 && result.data.data.defaultProjectName == "admin_default" && result.data.data.projectList && result.data.data.projectList.length > 0) {
            localStorage.projectName = result.data.data.projectList[0].projectName; //项目Name
            localStorage.projectUid = result.data.data.projectList[0].projectId; //项目Uid
        }
        //如果部门管理员的默认项目删掉了，云管初始化不显示
        if (result.data.data.defaultProjectName == "admin_default") {
            localStorage.canPlatformInit = 1;
        }

        localStorage.userUid = result.data.data.userUid;
        //localStorage.rolename = ""; 当给项目管理员重新分配为member角色时，云端未同步，所以不以这里的rolename为准
        localStorage.$USERID = result.data.data.id;
        //localStorage.permission = data.enterprise;
        localStorage.permission = result.data.data.version == "2" ? 'enterprise' : "stand";
        localStorage.setItem("$LOGINDATA", JSON.stringify(result.data.data));
        localStorage.defaultdomainUid = result.data.data.domainUid; //默认部门Uid
        localStorage.defaultdomainName = result.data.data.domainName; //默认部门Name
        localStorage.defaultProjectUid = result.data.data.defaultProjectUid; //默认项目Uid
        localStorage.defaultProjectName = result.data.data.defaultProjectName; //默认项目Name
        localStorage.enterpriseLoginName = result.data.data.enterpriseLoginName;
        localStorage.backupsService = result.data.data.backupService ? "backups" : ""; //true为超融合模式默认部署了ceph。
        localStorage.cinderService = (result.data.data.cinderService || result.data.data.isCustom) ? "cinder" : "";
        localStorage.isCustom = result.data.data.isCustom; //true为超融合模式，false为软件交付模式
        localStorage.isEnabledArbiter = result.data.data.isEnabledArbiter; // true 为两节点
        localStorage.cephService = result.data.data.enabledCeph ? "ceph" : ""; //true为对接了超融合ceph
        localStorage.regionBusiAuth=result.data.data.regionBusiAuth?JSON.stringify(result.data.data.regionBusiAuth):2;//license初始化数组

        localStorage.supportOtherClouds = 'openStack,PaaS' + result.data.data.supportOtherClouds;

        /*PAAS对接*/
        var supportPaas = {
            "Resource":{isLinked:true},
            "PhysicalResource":{isLinked:true},
            "K8s":{isLinked:true},
            "Monitoring":{isLinked:true},
            "List":{isLinked:true},
            "Log":{isLinked:true},
            "User":{isLinked:true},
            "System":{isLinked:true},
        }
        var  supportPaasLinked = JSON.parse(result.data.data.supportPaas);
        for(var i in supportPaasLinked){
            supportPaas[i] = supportPaasLinked[i];
            supportPaas[i].isLinked = true;
        }
        
        localStorage.supportPaas = JSON.stringify(supportPaas);
        

        localStorage.installK8s = result.data.data.installK8s ? 1 : 2;
        localStorage.installIronic = result.data.data.installIronic ? 1 : 2;
        localStorage.isTopNonTrivial = result.data.data.isTopNonTrivial;
    }

    this.getVerificationCode = function(self, loginForm) {
        self.login.verificationCode = "";
        var url = static_url_code + "/verifycode";
        $http({
            url: url,
            method: 'GET',
            responseType: 'blob'
        }).then(function(res) {
            if (res && res.data) {
                self.imgUrl = window.URL.createObjectURL(res.data);
            }
            if (res && res.headers() && res.headers("x-verification-key")) {
                self.verifyKey = res.headers("x-verification-key");
                // var codeurl = static_url_code + "/verifycode/char?verifyKey="+res.headers("x-verification-key");
                // $http({
                //     url: codeurl,
                //     method: 'GET',
                // }).then(function(result) {
                //     if(result&&result.data&&result.data.data){
                //        self.responseVerifyKey = res.headers("x-verification-key");
                //     }
                // })
            }
            var img = document.getElementById("codeImg");
            //加载完成以后释放blob
            img.onload = function() {
                window.URL.revokeObjectURL(img.src);
            };
        });
    }
    this.getLicenseList = function(result) {
        let userId = result.data.data.id;
        let regionKey = result.data.data.regionKey;
        $http({
            method: "GET",
            url: window.GLOBALCONFIG.APIHOST.BASE + "/v1/region/" + regionKey + "/menus/btn/" + userId
        }).then(function(res) {
            if (res && res.status == 0) {
                localStorage.setItem("LicenseList", JSON.stringify(res.data));
                var urlParams = $location.search();
                if(urlParams.from&&urlParams.from=='jiyun'&&urlParams.jumpUrl&&urlParams.jumpUrl!=''){
                    $location.path(urlParams.jumpUrl).replace(); 
                }else{
                    commonFuncSrv.setLoginViewPage(result.data.data)
                }
            }else {
                if(result.data.data.managementRole==2){
                   $location.path("/system/license"); 
                }else{
                    rootscope.$broadcast("loginerror", "licenseError");
                }
            }
        });
    }
    this.loginError = function(self, v) {
        if (v == "error") {
            self.loginError = 1;
        }
        if (v == "servererror") {
            self.loginError = 2;
        }
        if (v == "ipOut") {
            self.loginError = 3;
        }
        if (v == "noProject") {
            self.loginError = 5;
        }
        if (v == "overTimes") {
            self.loginError = 6;
        }
        if (v == "repeatLogin") {
            self.loginError = 7;
        }
        if (v == "sysUpdate") {
            self.loginError = 8;
        }
        // 验证码失效
        if (v == "codeInvalid") {
            self.loginError = 9;
        }
        //验证码错误
        if (v == "codeError") {
            self.loginError = 10;
        }
        //用户锁定
        if (v == "userLocked") {
            self.loginError = 11;
        }
        //用户锁定
        if (v == "licenseError") {
            self.loginError = 22;
        }
    }
    this.menuInit = function(self, result) {
        var menuList = result.data.data.menuList;
        menuList.forEach(function(item) {
            item.noShow = 1;
            if (item.child[0]) {
                if (item.child[0].child && item.child[0].child.length > 0) {
                    item.href = item.child[0].child[0].href;
                } else {
                    item.href = item.child[0].href;
                }
            }
        })
        if (result.data.data.managementRole == 3 && !result.data.data.projectList) {
            //当为部门管理员时，且当前部门没有项目，需要把资源相关菜单屏蔽掉
            localStorage.noProject = 1;
            menuList.forEach((item, index) => {
                if (NOPROJECTMENU.LIST.indexOf(item.keywords) < 0) {
                    item.noShow = 2;
                }
            })
        }
        //rootscope.ListApplication = true;
        if(result.data.data.managementRole == 5){
            menuList = [
                {
                    "id":1,
                    "text":"普通用户",
                    "keywords":"Resource,List,System,Log,User,Monitoring,Flowing,PhysicalResource,Bill_Management,K8s,Sky_entrance_tenant,DatabaseManage",
                    "version":"2",
                    "href":"/cvm/cvmview",
                    "icon":"icon-aw-storage1",
                    "active":"depart,cvm",
                    "child":menuList
                }
            ]
            // if(angular.toJson(menuList).indexOf('List_ListApplication')>-1){
            //     rootscope.ListApplication = false;
            // }else{
            //     rootscope.ListApplication = true;
            // }
        }

        localStorage.menuList = angular.toJson(menuList);
        //有资源管理权限则跳到欢迎页面
        for (var menu in menuList) {
            if (menuList[menu].keywords == 'Resource' && menuList[menu].noShow == 1) {
                self.hasResManage = true;
                break;
            }
        }

        if (result.data.data.menuList.length == 0) {
            self.loginError = 4;
        }
    }
}])
