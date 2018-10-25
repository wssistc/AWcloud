 /*import "jquery";
import "bootstrap";
import "angular";
import "angular-route";
import "angular-animate";
import "angular-resource";
import "angular-ui-bootstrap";
import "angular-translate";
import "angular-sanitize";
import "angular-file-saver";
import "ng-table";
import "lodash";
import "d3";
import "angular-ui-tree";
import "angular-messages";
import "ui-select";
import "angular-ivh-treeview/dist/ivh-treeview.js";
import "bootstrap-datetime-picker/js/bootstrap-datetimepicker.js";
import "bootstrap-datetime-picker/js/bootstrap-datetimepicker.zh-CN.js";
import "angularjs-dropdown-multiselect/src/angularjs-dropdown-multiselect.js";
import "moment";
import "gojs";*/
import "ip";
import "ipaddr.js";
angular.module("main", [])
    .constant("GLOBAL_CONFIG", { "PAGESIZE": 10 })
    .value("APILOADING", { 
        "reqNum": 0,
        "resNum":0,
        "exclude":[ ".html",
                    "awstack-user/v1/login",
                    "awstack-resource/v1/firewall/askFirewallStatus",
                    "awstack-resource/v1/vpn/askIPSecSiteStatus",
                    "awstack-resource/v1/uploadimagez/space/info",
                    "awstack-resource/v1/image/polling",
                    "awstack-resource/v1/imagespolling",
                    "awstack-resource/v1/physical/image/polling",
                    "awstack-resource/v1/server/",
                    "check/enterprises/",
                    "awstack-user/v1/nodes/status",
                    "plugins/list",
                    "awstack-user/v1/platform/version",
                    "awstack-user/v1/storage",
                    "awstack-resource/v1/images/isoMakeVolume",
                    "/attachments",
                    "awstack-user/v1/k8s/dockerclusters",
                    "platform/initialization",
                    "awstack-resource/v1/volume_type_initialize_all_in",
                    "awstack-resource/v1/ironic/nodes",
                    "awstack-boss/newResourceCharge/",
                ],
        "apiResTime":null
    })
    .value("NOPROJECTMENU",{
        //当为部门管理员时，且当前部门没有项目，需要把资源相关菜单屏蔽掉
        LIST:['List','User','System'],
        InstallIronic:localStorage.installIronic,
        InstallK8s:localStorage.installK8s,
    })
    .controller("MainCtrl", ["$scope", "$rootScope","alertSrv", "$translate", "$http","$timeout", "$location","$interval","$window","$route","$uibModal","ngTableDefaults","APILOADING","NOPROJECTMENU","commonFuncSrv","$translate","insTab",
        function(scope, rootScope, alertSrv, translate, $http,$timeout, $location,$interval,$window,$route,$uibModal,ngTableDefaults,APILOADING,NOPROJECTMENU,commonFuncSrv,$translate,insTab) {
        var self = scope;

        rootScope.isLogined = false;//默认登录状态为false
        rootScope.isAuth = false;//是否为登录页面url
        rootScope.isView = false;//是否在概况页面
        rootScope.isSingle = false;//是否在概况页面
        rootScope.allMenu = [];//菜单默认为空
        rootScope.sideMenu = {
            sideMenuList:[],//当前左侧菜单数据
            activeSubMenu:"",//当前左侧菜单打开的二级菜单的位置
            sideMentTitle:"",//当前左侧菜单标题
            subMenuTitle:"",//当前页面在右侧显示的标题
            menuKeyword:"",//当前页面的keysword
            openFlag:{},
            icons:{
                "Resource_COverview":"icon-aw-gk0", //概况
                "Resource_compute":"icon-aw-data-center1",//计算
                "Resource_Image":" icon-aw-mirroring", //镜像
                "Resource_Storage":" icon-aw-storage1", //存储
                "Resource_Network":"icon-aw-internet",//网络
                "Resource_Security":"icon-aw-aq",//安全
                "Elastic_Expansion":"icon-aw-dtss",//弹性扩展
                "Resource_Recycle":" icon-aw-hsz",//回收站
                "Physical_overview":"icon-aw-gk0",//概况
                "Physical_Instance":"icon-aw-wlj",//物理机
                "Physical_image":"icon-aw-mirroring",//镜像
                "Physical_network":"icon-aw-network",//网络
                "K8s_Clusters":"icon-aw-rqjq",//容器集群
                "K8s":"icon-aw-rqgl",//普通用户容器集群
                "K8s_Services":"icon-aw-rqfw",//容器服务
                "K8s_Projects":"icon-aw-jxfw",//镜像服务
                "Monitoring_MOverview":"icon-aw-gk0",//概况
                "Monitoring_ResourceMonitor":" icon-aw-jk0",//资源监控
                "Monitoring_ServiceMonitor":"icon-aw-fwjk",//服务监控
                "Monitoring_Alarm":" icon-aw-gjjk",//告警管理
                "List_ListApplication":"icon-aw-sqgd",//工单申请
                "List":"icon-aw-gdgl",//普通用户工单
                "List_Lists":"icon-aw-dclgd1",//待处理工单
                "List_Applied":"icon-aw-wdsq",//我的申请
                "List_MyAll":"icon-aw-wdsp",//所有工单
                "ticketReports":"icon-aw-gdbb",//工单报表
                "Log_OperationLog":"icon-aw-czrz",//操作日志
                "Log":"icon-aw-czrz",//普通用户操作日志
                "User_overView":"icon-aw-gk0",//概况
                "User_Department":" icon-aw-bmgl",//部门管理
                "User_Project":"icon-aw-xmgl",//项目管理
                "User_PermitUser":"icon-aw-user1",//用户管理
                "User_Privilege":"icon-aw-jsgl",//角色管理
                "System_Operation":"icon-aw-repair",//运维管理
                "System_Operational":"icon-aw-pie_chart",//运营管理
                "System_SystemSetting":"icon-aw-gear",//系统设置
                "Resource_Storage_RegularSnap":"icon-aw-jhrw",
                "System_Operational_BillingManagement":"icon-aw-compute",//计费管理
                "System_Operational_ResMetering":"icon-aw-ck",//资源计量
                "Alauda_overview":"icon-aw-gk1",
                "Sky_entrance_tenant":"icon-aw-firewall1",
                "DatabaseManage":"icon-aw-sjk",
                /*灵雀*/
                "Alauda_calculation":"icon-aw-data-center1",
                "Alauda_configure":"icon-aw-gear",
                "Alauda_networks":"icon-aw-internet",
                "Alauda_storage":"icon-aw-wlzygl",
                "Alauda_colony":"icon-aw-project",
                "Alauda_others":"icon-aw-rqgl",
                "Alauda_administrator":"icon-aw-user1",
                /*TBase*/
                "TBase_tbClusterManage":"icon-aw-rqjq",
                "TBase_tbNodeManages":"icon-aw-cloud-server",
                "TBase_tbConfigManagement":"icon-aw-dashboard",
                "TBase_tbBackupSettings":"icon-aw-gdbb",
                "TBase_tbClusterMonitor":"icon-aw-cluster",
                "TBase_tbAlarmUserss":"icon-aw-warning",
                "TBase_tbSystemInfos":"icon-aw-gear1",
                /*TDsql*/
                "TDsql_home":"icon-aw-rqjq",
                "TDsql_instance_Manage":"icon-aw-sllb",
                "TDsql_resource":"icon-aw-mirroring",
                "TDsql_resource":"icon-aw-storage1",
                "TDsql_monitor_mysql":"icon-aw-internet",
                "TDsql_proxy_base":"icon-aw-aq",
                "TDsql_vip":"icon-aw-dtss",
                "TDsql_monitor":"icon-aw-fzjh",
                "TDsql_osswf":"icon-aw-repair",
                "TDsql_alarm":"icon-aw-pie_chart",
                "TDsql_cluster_manage":"icon-aw-rqjq",
                "TDsql_business":"icon-aw-bmgl",
                "TDsql_sys":"icon-aw-xmgl",
                /*CTsdb*/
                "CTSDB_instancesList":"icon-aw-storage1",
                "CTSDB_operation_instancesManage":"icon-aw-mirroring",
                "CTSDB_operation_processManage":"icon-aw-bm",
                "CTSDB_equipmentManage":"icon-aw-wlzygl",
                "CTSDB_instancesMonitor":"icon-aw-fwjk",
                /*TBDS*/
                "TBDS_tdAccess":"icon-aw-wlzygl",
                "TBDS_easycount":"icon-aw-storage1",
                "TBDS_workflow":"icon-aw-bm",
                "TBDS_report":"icon-aw-pie_chart",
                "TBDS_supersql":"icon-aw-fzjh",
                "TBDS_data":"icon-aw-pie_chart",
                "TBDS_operation":"icon-aw-aq",
                "TBDS_platform":"icon-aw-rqjq",
                "TBDS_ml":"icon-aw-bmgl",
                /*COC*/
                "COC_CMDB":"icon-aw-wlzygl",
                "COC_moduleManage":"icon-aw-storage1",
                "COC_monitor":"icon-aw-bm",
                "COC_alarm":"icon-aw-gjjk",
                "COC_toolmarket":"icon-aw-bmgl",
                "COC_packageList":"icon-aw-rqjq",
                "COC_cloud":"icon-aw-aq",
                "COC_tenantuser":"icon-aw-mirroring",
                "COC_passwordlib":"icon-aw-xmgl",
                "COC_operationlog":"icon-aw-sllb"
            },
            titleIcon:{
                "Resource":"icon-aw-xnzygl",
                "PhysicalResource":"icon-aw-wlzygl",
                "K8s":"icon-aw-rqgl",
                "Monitoring":"icon-aw-jkgl",
                "List":"icon-aw-gdgl",
                "Log":"icon-aw_rzgl",
                "User":"icon-aw-sfgl",
                "System":"icon-aw-xtgl",
                "Alauda":"icon-aw-linque",
                "TBase":"icon-aw-TBase",
                "TDSQL":"icon-aw-sjk",
                "CTSDB":"icon-aw-rqgl",
                "TBDS":"icon-aw-rqgl",
                "COC":"icon-aw-rqgl",
            }
        };
        rootScope.services = {
            "backups":localStorage.backupsService,
            "cinder":localStorage.cinderService,
            "ceph":localStorage.cephService
        }
        rootScope.miliFormat = commonFuncSrv.miliFormat();
        //console.log(rootScope)
        self.relogin = function(){
            $location.path("/");
            rootScope.effeToken = false;
            rootScope.showNatureStart = false;
            rootScope.cloudGrading = false;
        }
        self.$on('get-create',function(e,val){
            if(val&&val.type){
                /*switch (val.type){
                    case 'project':
                        break;
                    case 'domain':
                        self.$broadcast("send-create",val);
                        break;
                    case 'network':
                        break;
                }*/
                self.$broadcast("send-create",val);
            }
        })
        self.$on('region-refresh',function(e,val){
            if(val&&val.type){
                self.$broadcast("send-create-pd",val);
            }
        })
        //更新部门管理员登录时有无项目的菜单显示视图
        self.$on("update-menu",function(e){
            rootScope.openStackMenu.child[0].child.forEach(item=>{
                if(NOPROJECTMENU.LIST.indexOf(item.keywords)<0){
                    item.noShow=2;
                }
            });
            localStorage.noProject = 1;
        })
        //配置全局搜索框的搜索函数
        self.defaultSettings = {
            filterOptions: {
                filterFn: ageRangeFilter 
            }
        };
        ngTableDefaults.settings = angular.extend({}, ngTableDefaults.settings, self.defaultSettings);
        function ageRangeFilter(data, filterValues/*, comparator*/){
            var filterValuesArr = [];
            for (var i in filterValues) {
                filterValuesArr.push(filterValues[i],i);
            }
            return data.filter(function(item){
                if (item[filterValuesArr[1]]!=undefined&&(
                        item[filterValuesArr[1]]==filterValuesArr[0]||
                        item[filterValuesArr[1]].toString().indexOf(filterValuesArr[0]) >-1)
                   ){
                    return true;
                } else {
                    return false;
                }
            });
        }

        scope.dashAlerts = alertSrv;
        rootScope.enterpriseUid = localStorage.enterpriseUid;
        self.showCont = function(e, cont) {
            // if(cont.type=="danger"){
            //     cont.type="warning";
            //     cont.btnType="btn-warning";
            // }
            if(cont.btnType=="btn-primary"){
                cont.btnType="btn-info"
            }
            self.showAlert = true;
            self.delCont = cont.msg;
            self.ContType = cont.type || "warning";
            self.btnType = cont.btnType || "btn-warning";
            self.notDel = cont.notDel;
            self.showDel = cont.showDelBtn;
            self.delBtnText = cont.delBtnText || translate.instant('aws.tmpl.index.cancel')
            self.btnText = cont.btnText || translate.instant("aws.tmpl.index.ok");
            self.confirm = function() {
                self.showAlert = false;
                self.$broadcast(cont.target, cont.data,self);
            };
        };
        self.supportOtherClouds = function(key) {
            if (localStorage.supportOtherClouds && localStorage.supportOtherClouds.indexOf(key) != -1) {
                return true;
            }
            return false;
        };

        self.supportPaas = function(item) {
            var key = item.keywords;
            var supportPaas = localStorage.supportPaas?JSON.parse(localStorage.supportPaas):{};
            if ((supportPaas[key]&&supportPaas[key].isLinked)||
                key.indexOf('qcloud_')>-1||
                key.indexOf('vMware_')>-1||
                key.indexOf('COC_')>-1
                ){
                return true;
            }
            return false;
        };

        self.$on("delete", self.showCont);
        self.showError=function(e,cont){
            self.del_errpr_cont = cont.msg;
            self.show_delete_error=true;
            self.confirm_error=function(){
                self.show_delete_error=false;
                self.$broadcast(cont.target,cont.data);
            }
        };
        self.$on("delete_error", self.showError);
        self.close = function() {
            self.showAlert = false;
        };
        self.close_error=function(){
            self.show_delete_error=false;
        }
        self.$on("closeNewWindow",self.close)
        self.openInitSettingModal = function() {
            //非admin,若vpc不能设置，则整个初始化设置功能不可用
            if(!rootScope.ADMIN&&!self.canSetInitVpc){
               return;
            }
            $uibModal.open({
                animation: true,
                templateUrl: "js/initSetting/tmpl/initSetting.html",
                controller: "initSettingCtrl",
                resolve: {
                    mainScope: function() {
                        return self;
                    }
                }
            });
        }

        /*容器和物理机安装部署安装完成提示怎么获取相关菜单*/
        self.$on("openPluginTips",function(e,data){
            if(data=='con'){
                self.showConAlert = true;
            }
            if(data=='phy'){
                self.showPhyAlert = true;
            }
            self.$apply();
        });
        /*关闭容器提示*/
        self.hideConMsg = function() {
            self.showConAlert = false;
        };
        /*关闭物理机成功提示*/
        self.hidePhyMsg = function() {
            self.showPhyAlert = false;
        };

        //self.openInitSettingModal()
        self.$on("openInitSettingModal", self.openInitSettingModal);
        self.hideInitAlert = function() {
            self.showInitSettingAlert = false;
        };
        self.menuTitle = translate.instant("aws.property.side.title");
        rootScope.siteTitle="";
        $http({
            url: "/awstack-user/v1/platform/version",
            method:"GET"
        }).then(function(res){
            if(res&&res.data){
                res.data =JSON.parse(res.data.description); 
                rootScope.versionType=localStorage.permission=="stand"?translate.instant("aws.aboutVersion.versionStand"):translate.instant("aws.aboutVersion.versionEnterprise");
                rootScope.systemVersion = res.data.version;
                rootScope.desc= res.data.desc+rootScope.versionType;
                rootScope.siteTitle = res.data.title;
                rootScope.copyright = res.data.copyright;
            }
            
        });
        function changeSiteTitle(path) {
            var titles = path.replace("/", "").split("/");
            var title = titles.length == 1 ? (titles[titles.length - 1] == "" ? "home" : titles[titles.length - 1]) : titles[1];
            var trans_title = translate.instant("aws.siteTitle." + title);
            rootScope.pathTitle = trans_title;
        }

        self.activeMenu = function(evt, current) {
            scope.menuActive = current.originalPath.split("/")[2];
            scope.subMenuActive = current.originalPath.split("/")[3];
            changeSiteTitle(current.originalPath);
        };

        var limit = {
            "2": "/depart/depview",
            "3": "/depart/depview",
            "4": "/cvm/cvmview",
            "5": "/cvm/instances"
        };
        var permitLimit = {
            "2": "/permit/overview",
            "3": "/permit/project"
        }
        var monitor = {
            "2": "/monitor/monitorview",
            "3": "/monitor/vmhost",
            "4": "/monitor/vmhost"
        };
        function getswitchData(){
            if(localStorage.$LOGINDATA){
                $http({
                    method:"GET",
                    url: "/awstack-user/v1/params",
                    params:{
                        "parentId":724,
                        "enterpriseUid":localStorage.enterpriseUid,
                        "regionUid":JSON.parse(localStorage.$LOGINDATA).regionUid
                    }
                }).then(function(res){
                    if(res&&res.data&&res.data.length!=0){
                        var switchData=JSON.parse(res.data[0].paramValue).L3_Active;
                        rootScope.L3 = switchData
                    }else{
                        rootScope.L3 = true;
                    }
                });
            }
        }

        function getBillingStatus() {
            if (localStorage.$LOGINDATA) {
                $http({
                    method: "GET",
                    url: "awstack-user/v1/params?enterpriseUid=" + localStorage.enterpriseUid + "&parentId=80"
                }).then(function(res) {
                    if (res && res.data && res.data[0]) {
                        if (res.data[0].paramValue == "1") { //1 打开 0 关闭
                            rootScope.billingActive = true;
                            $http({
                                method: "GET",
                                url: "awstack-boss/consumptionSatistics/queryLoginAccountConsumptionAmount",
                                params: {
                                    userId: localStorage.userUid
                                }
                            }).then(function(res) {
                                if (res) {
                                    rootScope.loginAccountConsumeData = res.data;
                                }
                            });
                        } else {
                            rootScope.billingActive = false;
                        }
                    }
                });
            }
        }

        function getTotalData(){
            localStorage.TotalListName="";
            $http({
                method:"GET",
                url: "/awstack-user/v1/"+localStorage.regionKey+"/getTotalResourcesStatistics"
            }).then(function(res){
                if(res&&res.data){
                    if(res.data.length>0){
                        for(var i=0;i<res.data.length;i++){
                            if(res.data[i]=="ceph"){
                                res.data[i]=translate.instant('aws.indextran.ceph');
                            }else if(res.data[i]=="memory"){
                                 res.data[i]=translate.instant('aws.indextran.memory');
                            }
                        }
                    }
                    localStorage.TotalListName=res.data.join("、");
                    var totalata = angular.copy(res.data);
                    for(var i=0;i<totalata.length;i++){
                        if(totalata[i].indexOf(":")>-1){
                            totalata[i]=totalata[i].split(":")[1]+translate.instant('aws.indextran.ceph');
                        }
                    }
                    rootScope.ListName= totalata.join("、");
                    if(localStorage.TotalListName!=""&&localStorage.$AWLOGINED=="true"){
                        rootScope.totalResShow=true;
                    }else{
                        rootScope.totalResShow=false;
                    }
                }
                
            }); 
        }
        function getQcloudUid($http) {
            var userRole = localStorage.managementRole;
            self.domainRole= userRole=='3'?true:false;
            rootScope.allMenuJson = [
                {
                    text:'全部',
                    id:1,
                    keywords:"allMenu",
                    cloudType:"openStack",
                    child:[
                    ]
                }
            ]
            /*腾讯云*/
            rootScope.qcloudMenu = {
                text:'腾讯云',
                id:4,
                keywords:"qcloud",
                cloudType:"QCLOUD_API_KEY",
                child:[
                     {
                        text:"腾讯云",
                        id:4,
                        keywords:"qcloud",
                        cloudType:"QCLOUD_API_KEY",
                        child:[
                            {
                                text:"云服务器",
                                keywords:"qcloud_Server",
                                child:[
                                    {
                                        text:"概况",
                                        keywords:"qcloud_Survey",
                                        href:"/"
                                    },
                                    {
                                        text:"云主机",
                                        keywords:"qcloud_Host",
                                        href:"/cvm/instances"
                                    },
                                    {
                                        text:"镜像",
                                        keywords:"qcloud_Image",
                                        href:"/cvm/image"
                                    },
                                    {
                                        text:"云硬盘",
                                        keywords:"qcloud_Disk",
                                        href:"/cvm/cbs"
                                    },
                                    {
                                        text:"快照",
                                        keywords:"qcloud_Snapshot",
                                        href:"/#/cvm/snapshot"
                                    },
                                    {
                                        text:"SSH秘钥",
                                        keywords:"qcloud_SHHkey",
                                        href:"/cvm/sshkey"
                                    },
                                    {
                                        text:"安全组",
                                        keywords:"qcloud_Securitygroup",
                                        href:"/cvm/securitygroup"
                                    },
                                    {
                                        text:"弹性公网IP",
                                        keywords:"qcloud_Elasticip",
                                        href:"/cvm/eip"
                                    }
                                ]
                            },
                            {
                                text:"负载均衡",
                                keywords:"qcloud_loadBalance",
                                child:[
                                    {
                                        text:"LB实例列表",
                                        keywords:"qcloud_LBInstanceList",
                                        href:"/clb/instance"
                                    }
                                ]
                            },
                            {
                                text:"数据库",
                                keywords:"qcloud_Database",
                                child:[
                                    {
                                        text:"实例列表",
                                        keywords:"qcloud_Instancelist",
                                        href:"/cdb/cdblist"
                                    },
                                    {
                                        text:"任务列表",
                                        keywords:"qcloud_Tasklist",
                                        href:"/cdb/task"
                                    },
                                    {
                                        text:"参数模板",
                                        keywords:"qcloud_Parametertemplate",
                                        href:"/cdb/paramtmpl"
                                    }
                                ]
                            },
                            {
                                text:"弹性缓存Redis",
                                keywords:"qcloud_cacheRedis",
                                child:[
                                    {
                                        text:"实例列表",
                                        keywords:"qcloud_Instancelist",
                                        href:"/redis/redislist"
                                    },
                                    {
                                        text:"任务管理",
                                        keywords:"qcloud_Taskmanagement",
                                        href:"/redis/redistask"
                                    }
                                ]
                            },
                            {
                                text:"VPC",
                                keywords:"qcloud_VPC",
                                child:[
                                    {
                                        text:"私有网络",
                                        keywords:"qcloud_Privatenetwork",
                                        href:"/vpc/vpc"
                                    },
                                    {
                                        text:"子网",
                                        keywords:"qcloud_Subnet",
                                        href:"/vpc/subnet"
                                    },
                                    {
                                        text:"路由表",
                                        keywords:"qcloud_Routingtable",
                                        href:"/vpc/route"
                                    },
                                    {
                                        text:"NAT网关",
                                        keywords:"qcloud_NATgateway",
                                        href:"/vpc/natgateway"
                                    }
                                ]
                            }

                        ]
                    }   
                ]
            }
            /*Vmware*/
            rootScope.vmwareMenu = {
                text:'VMware',
                id:5,
                keywords:"vMware",
                cloudType:"VMWARE_API_KEY",
                child:[
                    {
                        text:"VMware",
                        id:5,
                        keywords:"vMware",
                        cloudType:"VMWARE_API_KEY",
                        child:[
                            {
                                text:"菜单",
                                keywords:"vMware_menu",
                                child:[
                                    {
                                        text:"数据中心",
                                        keywords:"vMware_Datacenter",
                                        href:"/vmware/#/?url=datacenter"
                                    },
                                    {
                                        text:"主机",
                                        keywords:"vMware_Host",
                                        href:"/vmware/#/?url=host"
                                    },
                                    {
                                        text:"集群",
                                        keywords:"vMware_colony",
                                        href:"/vmware/#/?url=cluster"
                                    },
                                    {
                                        text:"虚拟机",
                                        keywords:"vMware_virtualmachine",
                                        href:"/vmware/#/?url=virtualmachine"
                                    }
                                ]
                            }
                        ]
                    }      
                ]
            }

            /*删除‘系统概况’*/
            var menuList;
            if(localStorage.menuList){
                var menuList = JSON.parse(localStorage.menuList) 
                /*if(menuList[0].keywords=='SOverview'){
                    menuList.shift();
                }*/
                if(localStorage.noProject==1){
                    menuList.forEach((item,index)=>{
                        if(NOPROJECTMENU.LIST.indexOf(item.keywords)<0){
                            item.noShow=2;
                        }
                    }) 
                }
                
                /*菜单下还有的*/
                for(var i=0;i<menuList.length;i++){
                    if(menuList[i].keywords=='SOverview'){
                        menuList.splice(i,1);
                    }
                    for(var j=0;j<menuList[i].child.length;j++){
                        /*api未对二级菜单进行href填写，现前端只要有child就自己拼接进href操作，跳转*/
                        if(menuList[i].child[j].child.length>0){
                            menuList[i].child[j].href=menuList[i].child[j].child[0].href;
                        }
                    }
                }
            }

            rootScope.openStackMenu ={
                text:'私有云',
                id:2,
                keywords:"openStack",
                cloudType:"openStack",
                child:[
                    {
                        text:"私有云系统概述",
                        id:2,
                        keywords:"openStack_view",
                        cloudType:"",
                        child:menuList
                    }
                ]
            }
            var PaaSList = [
                {
                    "id":9,
                    "text":"COC",
                    "keywords":"COC",
                    "version":"2",
                    "href":"/COC/tbClusterManage",
                    "icon":"icon-aw-storage1",
                    "active":"tbClusterManage",
                    "child":[
                        {
                            "id":1,
                            "text":"CMDB",
                            "keywords":"COC_CMDB",
                            "version":"2",
                            "href":"/COC/cocCmdbServer",
                            "icon":"icon-aw-storage1",
                            "active":"cocCmdbServer",
                            "child":[
                               {
                                  "id":1,
                                  "text":"服务器",
                                  "keywords":"COC_CMDB_server",
                                  "version":"2",
                                  "href":"/COC/cocCmdbServer",
                                  "icon":"icon-aw-storage1",
                                  "active":"cocCmdbServer",
                                  "child":[]
                               }
                            ]
                        }
                    ]
                }
            ]
            rootScope.PaaS={
                text:'PaaS',
                id:3,
                keywords:"PaaS",
                cloudType:"PaaS",
                child:[
                    {
                        text:"PaaS服务",
                        id:3,
                        keywords:"PaaS",
                        cloudType:"PaaS",
                        child:PaaSList
                    }
                ]
            }

            var vmwareUrl = "&token=" + localStorage.$AUTH_TOKEN;
            for(var i=0;i<rootScope.vmwareMenu.child[0].child.length;i++){
                for(var j=0;j<rootScope.vmwareMenu.child[0].child[i].child.length;j++){
                     rootScope.vmwareMenu.child[0].child[i].child[j].href =  rootScope.vmwareMenu.child[0].child[i].child[j].href + vmwareUrl;    
                }
                
            }
            /*路由跳转*/
            self.serviceListHide = true;
            self.jumpScreen = function(){
                window.open('/maxscreen','_blank');
            };
            //TBase/TStudio的跳转
            self.jumpTStudio=function(){
                var PaasData = localStorage.supportPaas?JSON.parse(localStorage.supportPaas):{};
                window.open(PaasData['TBase'].TStudio,'_blank');
            }
            //天眼云镜的跳转
            self.jumpSkyCloudSecurity=function(data){
                var PaasData = localStorage.supportPaas?JSON.parse(localStorage.supportPaas):{};
                //admin有两个登录入口
                if(rootScope.ADMIN){
                    //租户登录入口
                    if(data.keywords=='Sky_entrance'){
                        window.open(PaasData['SkyCloudSecurity'].tenantUrl+data.href+"?token="+localStorage.$AUTH_TOKEN);
                    }else if(data.keywords=='Sky_entrance_manage'){
                    //管理员登录入口
                        window.open(PaasData['SkyCloudSecurity'].url+data.href+"?token="+localStorage.$AUTH_TOKEN);
                    }
                }else{
                    //租户登录入口
                    window.open(PaasData['SkyCloudSecurity'].tenantUrl+data.href+"?token="+localStorage.$AUTH_TOKEN);
                }
            }
            self.routeJump=function(item,privates){
                // if(privates&&localStorage.regionNum==1){
                //     item = "/single"
                // }
                var PaasData = localStorage.supportPaas?JSON.parse(localStorage.supportPaas):{};
                if(item){
                    self.serviceListHide = false;
                    $timeout(function(){
                        self.serviceListHide = true;
                    },500)
                    if(privates.keywords=='CMirror_entrance'){
                        window.open(PaasData['CloudSecurity'].url+"?token="+localStorage.$AUTH_TOKEN);
                        return;
                    }   
                    if(privates.keywords=='TBDS_entrance'){
                        location.replace("#/TBDS/wellCome");
                        return;
                    }
                    if(privates.keywords=='Sky_entrance'||privates.keywords=='Sky_entrance_manage'){
                        self.jumpSkyCloudSecurity(privates);
                        return;
                    }  
                    // if(privates.keywords=='ZY_entrance'){
                    //     window.open(PaasData['COC'].url+"/cmdb/server"+"?token="+localStorage.$AUTH_TOKEN);
                    //     return;
                    // } 

                    location.replace("#"+item);
                    
                }
            }

            /*切换侧边栏主菜单*/
            self.changeMenu = function(id){
                self.menuId = id;
                self.subMenu = rootScope.allMenuJson[id];
            }
            rootScope.allMenuJson[0].child.push(rootScope.openStackMenu.child[0]);
            //rootScope.allMenuJson[0].child.push(rootScope.PaaS.child[0]);
            rootScope.allMenuJson.push(rootScope.openStackMenu);
            //rootScope.allMenuJson.push(rootScope.PaaS);
            if(userRole=='2'){
                rootScope.allMenuJson[0].child.push(rootScope.qcloudMenu.child[0]);
                rootScope.allMenuJson.push(rootScope.qcloudMenu);
                rootScope.allMenuJson[0].child.push(rootScope.vmwareMenu.child[0]);
                rootScope.allMenuJson.push(rootScope.vmwareMenu);
            }
            self.changeMenu(0);
            /*Qcloud跳转*/
            self.qcloudJump = function(item){
                if(item){
                    if(localStorage.$QCLOUD_AUTH_TOKEN){
                        localStorage.removeItem('$QCLOUD_AUTH_TOKEN')
                    }
                    //localStorage.jumpUrl = item;
                    window.open('/qcloud/#/welcome?jumpRoute='+item,'_blank');

                    // $http({
                    //     url: "/awstack-qcloud/exclude/enterprises/" + localStorage.enterpriseUid + "/loginOnce/?awcloudtoken=" + localStorage.$AUTH_TOKEN,
                    //     method: "GET"
                    // }).then(function(res) {
                    //     if(res&&res.data!="无法登录"){
                    //         localStorage.$QCLOUD_AUTH_TOKEN = JSON.stringify(res.data.data);
                    //         // window.open(item+"?token="+res.data.data,'_blank');
                    //     }
                    // })
                    self.serviceListHide = false;
                    $timeout(function(){
                        self.serviceListHide = true;
                    },500)
                }
            }
        }
        //判断快捷操作中得vpc网络是否展示（根据localStorage.regionBusiAuth和定制化java返回的接口来表示rootScope.customizedIsAdmin)
        function needInitVpcNet(customizedIsAdmin){
            let regionBusiAuth=localStorage.regionBusiAuth!=2?JSON.parse(localStorage.regionBusiAuth):[];
            let index=regionBusiAuth.indexOf("3");
            if(index>-1&&customizedIsAdmin){
               self.canSetInitVpc=true;
            }else{
               self.canSetInitVpc=false;
            }
        } 
        self.$watch(function() {
            return localStorage.$AWLOGINED;
        }, function(v) {
            if (v) {
                getQcloudUid($http);
                localStorage.goBack = true;
                getswitchData();
                getBillingStatus();
                if(localStorage.managementRole=="5"&&localStorage.secretFreeLogin=="true"){
                    rootScope.freeLoginHide = true;
                }else{
                    rootScope.freeLoginHide = false;
                }
                if(localStorage.managementRole=="2"){
                    getTotalData();
                    if(localStorage.TotalListName!=""){
                        rootScope.totalResShow=true;
                    }
                    //定制开发判断是否开启快捷操作中的云主机和vpc(非admin用户根据返回的值来进行展示，admin不用做判断)
                    rootScope.customizedIsAdmin=true;
                    needInitVpcNet(rootScope.customizedIsAdmin);
                }else{
                    $http({
                        url: "/awstack-user/v1/params?paramId=802",
                        method:"GET"
                    }).then(function(res){
                        if(res&&res.data&&angular.isArray(res.data)&&res.data.length){
                            let switchValue=Number(res.data[0].paramValue);
                            if(switchValue==1){
                                rootScope.customizedIsAdmin=true;
                            }else{
                                rootScope.customizedIsAdmin=false;
                            }
                            needInitVpcNet(rootScope.customizedIsAdmin);
                        }
                    });
                }  
                self.asde_menu = JSON.parse(localStorage.menuList);

                rootScope.ListApplication = true;
                if(localStorage.managementRole == 5){
                    if(localStorage.menuList.indexOf('List_ListApplication')>-1){
                        rootScope.ListApplication = false;
                    }else{
                        rootScope.ListApplication = true;
                    }
                }

                //快捷操作的显示
                self.hasResManage=false;
                self.hasUserManage=false;
                for(var menu in self.asde_menu){
                    if(self.asde_menu[menu].keywords=='Resource'&&self.asde_menu[menu].noShow==1){
                       self.hasResManage=true;
                    }else if(self.asde_menu[menu].keywords=='User'){
                       self.hasUserManage=true;
                    }
                }
                rootScope.logoUrl = self.asde_menu[0].href;
                localStorage.setItem("$MENUPREMIT",JSON.stringify(self.asde_menu));
                if(localStorage.permission!="enterprise"){
                    self.isShowCloud=false;
                }else{
                    self.isShowCloud=true;
                }
            }else{
                rootScope.totalResShow=false;
                rootScope.effeToken = false;
            }
        });
        self.$on("$routeChangeStart",function(event,next,cur){
            var path = next.originalPath;
            if(path){
                path = path.split("/:")[0];
            }
            if(path!="/" && path!="" && path!="/workflow/createflow" && path!="/first" && path!="/quickconfig/createins" && localStorage.managementRole>2){
                var pa = new RegExp(path);
                if(localStorage.$MENUPREMIT.search(pa)<0){
                    event.preventDefault();
                    if(cur.originalPath=="" || cur.originalPath=="/"){
                        localStorage.removeItem("$AWLOGINED");
                    }
                } 
            }
            if (!localStorage.$AWLOGINED) {
                if(cur){
                    if(localStorage.goBack=='true'){
                        localStorage.removeItem('goBack')
                        return
                    }
                    window.location.reload();
                }
                $location.path("/").replace();

            }
            // if(!localStorage.cinderService && (next.active=='volumes' || next.active =='snapshots'||next.active=='volumesQoS' ||next.active =='makeimages' )){
            //     $location.path("/cvm/instances").replace();  
            // }
            
            
        });
        //
        self.changeMenuFlag = function(item){
            if(item.child.length==0&&item.href.indexOf('tstack/login')>-1){
               self.jumpSkyCloudSecurity(item);
               return;
            }
            if(rootScope.sideMenu.openFlag[item.keywords]){
                rootScope.sideMenu.openFlag[item.keywords] = false;
            }else{
                for(var i in rootScope.sideMenu.openFlag){
                    rootScope.sideMenu.openFlag[i] = false;
                }
                rootScope.sideMenu.openFlag[item.keywords] = true;
            }
        }
        self.checkActive = function(item) {
            let fullpath = $location.path();
            let fullpathArr = fullpath.split("/");
            if (item.active && _.include(item.active.split(","), fullpathArr[2])) {
                self.$broadcast("to-parent");
            }
            if (item.active) {
                return _.include(item.active.split(","), fullpathArr[1]) || _.include(item.active.split(","), fullpathArr[2]);
            }
        };
        self.subMenuCheck = function(){
            console.log($route)
            var cur = item.active.split(",")
            rootScope.sideMenu.activeSubMenu = current.parent;
        }
        /*self.linkTo = function(){
            $http({
                url: "/awstack-qcloud/exclude/enterprises/"+ localStorage.enterpriseUid + "/loginOnce/?awcloudtoken="+localStorage.$AUTH_TOKEN,
                method:"GET"
            }).then(function(res){
                if(res.data){
                    let token = res.data;
                    //let templ = "<a href=/qcloud/#/?token="+token+" id='link-to' target='_blank'>qcloud</a>";
                    let url = "/qcloud/#/?token="+token;
                    var link = document.createElement('a');
                    link.setAttribute('href', url);
                    link.setAttribute('target', "_blank");
                    var event = document.createEvent('MouseEvents');  
                    event.initMouseEvent('click');  
                    link.dispatchEvent(event);
                }
            });    
        };*/
        function changeMenu(evt, current,prev) {
            var PaasData = localStorage.supportPaas?JSON.parse(localStorage.supportPaas):{};
            if(current&&current.parent=="Alauda"){
                if(current.active=='alRegister'){
                    rootScope.alaudaURL = PaasData['Alauda'].url+"/dex/auth/simpletoken?client_id=alauda-auth&token="+ localStorage.$AUTH_TOKEN + "&redirect_uri="+current.jump;
                }else{
                    rootScope.alaudaURL = PaasData['Alauda'].url+"/dex/auth/simpletoken?client_id=alauda-auth&token="+ localStorage.$AUTH_TOKEN + "&redirect_uri="+PaasData['Alauda'].url+"/console/#"+current.jump;
                }
            }
            if(current&&current.parent=="TBase"){
                rootScope.alaudaURL = PaasData['TBase'].url+current.jump;
            }
            if(current&&current.parent=="TDSQL"){
                rootScope.alaudaURL = PaasData['TDSQL'].url+current.jump+'&token='+localStorage.$AUTH_TOKEN;
            }
            if(current&&current.parent=="CTSDB"){
                var CTurl =PaasData['CTSDB'].url +'?token=' + localStorage.$AUTH_TOKEN + "&userid=" + localStorage.$USERID + "&username=" + localStorage.userName;
                rootScope.alaudaURL = CTurl+current.jump;
            }
            if(current&&current.parent=="COC"){
                //rootScope.alaudaURL = PaasData['COC'].url+current.jump+'?token=' + localStorage.$AUTH_TOKEN;
                rootScope.alaudaURL = 'http://zhiyun.qcloud.com'+current.jump+'?token=' + localStorage.$AUTH_TOKEN;
            }

            if(current&&current.parent=="TBDS"){
                rootScope.alaudaURL =PaasData['TBDS'].url+current.jump;
            }

            self.allMenu = "";
            let fullpath = current.originalPath;
            rootScope.currentPath = fullpath;
            rootScope.lazyOnType = {};
            if(current&&current.active){
                rootScope.sideMenu.menuKeyword = current.active;
                rootScope.sideMenu.activeSubMenu = current.parent;
            }
            let menu = localStorage.menuList ? JSON.parse(localStorage.menuList) : "";
            if(current.parent){
                if((prev&&prev.parent!=current.parent)||!prev){
                    // if(current.rtype=='PaaS'){
                    //     if(current.parent=="CMirror"){
                    //       menu = rootScope.CloudMirror.child;
                    //     }else{
                    //         menu = rootScope.PaaS.child[0].child;
                    //         console.log(menu)
                    //     }
                    // }
                    for(let k=0;k<menu.length;k++){
                        if(localStorage.managementRole==5&&menu[k].keywords.indexOf(current.parent)>-1){
                            rootScope.sideMenu.sideMenuList = menu[k].child;
                            rootScope.sideMenu.sideMentTitle = menu[k].keywords;
                            break;
                        }else{
                            if(menu[k].keywords==current.parent){
                                rootScope.sideMenu.sideMenuList = menu[k].child;
                                rootScope.sideMenu.sideMentTitle = menu[k].keywords;
                                break;
                            } 
                        }
                        
                    }

                }
            }
            if(rootScope.sideMenu.sideMenuList.length>0){
                for(let i=0;i<rootScope.sideMenu.sideMenuList.length;i++){
                    var cm = rootScope.sideMenu.sideMenuList[i].active.split(",");
                    if(cm.indexOf(current.active)>-1){
                        rootScope.sideMenu.activeSubMenu = rootScope.sideMenu.sideMenuList[i].keywords;
                        break;
                    }
                }
                /*控制菜单开合*/
                rootScope.sideMenu.openFlag[rootScope.sideMenu.activeSubMenu] = true;
            }
        }
        function clearApiLoading(){
            /*if(APILOADING.reqNum>APILOADING.resNum){
                APILOADING.resNum=0;
                APILOADING.reqNum=APILOADING.reqNum-APILOADING.resNum;
            }else{
                APILOADING.reqNum=0;
                APILOADING.resNum=0;
            }*/
            $("html").scrollTop(0);

        }

        function getInitSettingStatus(originalPath) {
            $http({
                method:"GET",
                url: "awstack-user/v1/ent/" + localStorage.enterpriseUid + "/platform/initialization"
            }).then(function(result){
                if(result && result.data && angular.isArray(result.data)) {
                    result.data.forEach(function(item, index) {
                        if(item.regionKey == localStorage.regionKey) {
                            var status = !item.status;
                            if(originalPath == "/view") {
                                self.showInitSettingAlert = false;
                            }else {
                                self.showInitSettingAlert = status;
                            }
                            if(rootScope.firstInitSetting == 0 && status) {
                                if(rootScope.ListApplication == true){
                                    self.openInitSettingModal();
                                }
                                rootScope.firstInitSetting = 1;
                            }
                        }
                    });
                }
            }); 
        }
        self.$on("delete-current-project", function(e, val) { //删除当前项目时跳到默认部门默认项目
            self.$broadcast('delete-current-p','delete')
        })
        self.$on("$routeChangeSuccess", function(evt, current, prev) {
            rootScope.isLogined = localStorage.$AWLOGINED || false;//是否登录
            if(rootScope.isLogined){
                rootScope.loginData = JSON.parse(localStorage.$LOGINDATA);
            }
            if(rootScope.isLogined && current.originalPath && current.originalPath != ("/") && !(localStorage.canPlatformInit == 1)) {
                getInitSettingStatus(current.originalPath);
            }else {
                self.showInitSettingAlert = false;
            }
            // if(rootScope.isLogined && current.originalPath && current.originalPath != ("/")) {
            //     if(rootScope.firstInitSetting == 0 && localStorage.platformInitialized == "false" && !(localStorage.canPlatformInit == 1)) {
            //         self.openInitSettingModal();
            //         rootScope.firstInitSetting = 1;
            //     }
            // }
            clearApiLoading();
            self.close();//关闭删除资源的提示弹出框
            self.activeMenu(evt, current);//
            changeMenu(evt, current, prev);
            rootScope.ADMIN = false;
            rootScope.DOMAIN_ADMIN = false;
            rootScope.PROJECT_ADMIN = false;
            rootScope.MEM_ADMIN = false;
            switch (localStorage.managementRole) {
                case "2":
                    rootScope.ADMIN = true;
                    break;
                case "3":
                    rootScope.DOMAIN_ADMIN = true;
                    break;
                case "4":
                    rootScope.PROJECT_ADMIN = true;
                    break;                    
                case "5":
                    rootScope.MEM_ADMIN = true;
                    break;
            }
            $interval.cancel($window.rollpolingNodes);
            $interval.cancel($window.firewallTimer);
            $window.IntervalResize = null;
            $window.IntervalImageResize = null;
            $window.updataImageInterval = null;
            $window.nodeProvisionToAvalFunc = null;
            $window.nodeProvisionFunc = null;
            $window.nodeInterFunc = null;
            $window.IntervalFirewallResize = null;
            $window.IntervalVpnResize=null;
            $window.IntervalNodesResize=null;
            $window.InterFunc = null;
            if(current&&current.originalPath&&current.originalPath=="/view"){
                localStorage.domainUid = localStorage.defaultdomainUid;//部门Uid
                localStorage.domainName = localStorage.defaultdomainName;//部门Name
                localStorage.projectUid = localStorage.defaultProjectUid;//项目Uid
                localStorage.projectName = localStorage.defaultProjectName;//项目Name
            }
            if(current&&current.originalPath&&current.originalPath=="/quickconfig/createins"){
                self.isEasyCreateVm = true;
            }else{
                self.isEasyCreateVm = false;
                insTab.currTab = "";
            }

            if (!current.originalPath || current.originalPath == ("/")) {
                rootScope.isAuth = true;
                rootScope.isLogined = false;
                localStorage.removeItem("$AWLOGINED");
                localStorage.removeItem("rolename");
            } else {
                rootScope.isAuth = false;
            }

            if (current.originalPath == "/view" ||current.originalPath == "/single" || current.originalPath == "/view/qcloud") {
                rootScope.isView = true;
                rootScope.isSingle = true;
                rootScope.isActive = false;
                rootScope.isActive2 = false;
                if (current.originalPath == ("/view")) {
                    rootScope.isActive = true;
                    rootScope.isActive2 = false;
                }
                if (current.originalPath == ("/view/qcloud")) {
                    rootScope.isActive = false;
                    rootScope.isActive2 = true;
                }
            } else {
                rootScope.isView = false;
            }
            if(current.originalPath == "/system/billingManagement"){
                rootScope.inBillingModule = true;
            }
        });

        self.viewLoginAccountConsumeDetail = function() {
            rootScope.inBillingModule = false;
            let orgPath = angular.copy($location.path());
            $location.path($location.path()).search({
                "consumeUserId": localStorage.userUid,
                "name": localStorage.userName,
                "type": "user",
                "from":"global"
            });
            rootScope.userAnimation = "animateIn";
            $("body").addClass("animate-open");
            rootScope.$emit("userConsumeDetail", {
                name: localStorage.userName,
                id: localStorage.userUid,
                from: "global",
                topPath: orgPath
            });
        };

        self.viewUserResConsumeDetail = function(item) {
            let orgPath = angular.copy($location.path());
            $location.path($location.path()).search({
                "consumeUserId": $location.search().consumeUserId,
                "name": $location.search().name,
                "regionName": $location.search().regionName,
                "deptId": $location.search().deptId,
                "projectId": $location.search().projectId,
                "type": "user",
                "resName": item.resourceName,
                "from": $location.search().from
            });
            rootScope.userResAnimation = "animateIn";
            rootScope.$emit("userResConsumeDetail", {
                name: $location.search().name,
                id: $location.search().consumeUserId,
                resName: item.resourceName,
                from: "global",
                topPath: orgPath
            });
        };

        self.returnOrgPath = function(type) {
            if (type == 'user') {
                rootScope.userAnimation = "animateOut";
                rootScope.userResAnimation = "animateOut";
                $("body").removeClass("animate-open");
                $location.path($location.path()).search({});
            } else if (type == 'userRes') {
                rootScope.userResAnimation = "animateOut";
                $location.path($location.path()).search({
                    "consumeUserId": $location.search().consumeUserId,
                    "name": $location.search().name,
                    "type": "user",
                    "from": $location.search().from
                });
            }
        };
        self.adminPasswordModify=function(){
                 var scope = self.$new();
                 scope.isRotate=false;
                 scope.successModify=false;
                 scope.canModifyAfterSuccess=false;
                 var adminPasswordModifyModal = $uibModal.open({
                    animation:scope.animationsEnabled,
                    templateUrl:"adminPasswordModify.html",
                    scope:scope
                 });
                 scope.modify={
                    prePassword:"",
                    newPassword:"",
                    confirmPassword:""
                 };
                 scope.canConfirm=function(){
                    scope.confirmTwice=false;
                 };

                 scope.$watch(function(){
                    var prevpwd=$("input[name='prePassword']").val();
                    var newpwd=$("input[name='newPassword']").val();
                    return prevpwd+"------"+newpwd;
                 },function(val){
                    scope.firstStep=false;
                    scope.equalCheck=false;
                    scope.pwdCheck=false; 
                    var pres=val.split("------")[0];
                    var news=val.split("------")[1];
                    if(pres==""){
                        if(news.length){
                            scope.firstStep=true;
                        }
                    }else{
                        scope.firstStep=false;
                        if(pres==news){
                            scope.equalCheck=true;
                        }else{
                           scope.equalCheck=false; 
                        }
                    }
                    if((scope.firstStep==false)&&(scope.equalCheck==false)){
                        scope.pwdCheck=true;
                    }else{
                        scope.pwdCheck=false;
                    }
                 })

                 scope.modifyPwd=function(modify,pwdModify){
                    scope.submitValid =false;
                    if(pwdModify.$valid){
                        if(scope.pwdCheck==false){
                            return;
                        }
                       scope.isRotate=true;
                       scope.canModifyAfterSuccess=true;
                       var data={
                        "userName":localStorage.userName,
                        "oldPwd":modify.prePassword,
                        "newPwd":modify.newPassword,
                        "enterpriseUid":localStorage.enterpriseUid,
                        "userId":localStorage.$USERID,
                        "userUid":localStorage.userUid
                       };
                        $http({
                                method:"PUT",
                                url:"awstack-user/v1/enterprises/modify",
                                data:data
                        }).then(function(result){                          
                            if(result.code==0){
                                scope.canModifyAfterSuccess=true;
                                //修改成功回到登录页面
                                scope.isRotate=false;
                                scope.successModify=true;
                                adminPasswordModifyModal.close();
                                $timeout(function(){
                                    rootScope.logOut();
                                },1000);
                                
                            }
                        });
                    }else{
                       scope.submitValid =true; 
                    }
                 }; 
                 self.$on("modifyerror", function(e, v) {
                    //旧密码错误
                    if (v == "prePasswordError") {
                        scope.isRotate=false;
                        scope.modifyError = 1;
                        $timeout(function(){
                            scope.modifyError ="";
                        },2500);
                        scope.canModifyAfterSuccess=false;
                        scope.confirmTwice=true;
                    }
                    //密码修改错误
                    if (v == "modifyError") {
                        scope.isRotate=false;
                        scope.modifyError = 2;
                        $timeout(function(){
                            scope.modifyError ="";
                        },2500);
                        scope.canModifyAfterSuccess=false;
                        scope.confirmTwice=true;
                    }
                    if (v == "modifyFrequent") {
                        scope.isRotate=false;
                        scope.modifyError = 3;
                        $timeout(function(){
                            scope.modifyError ="";
                        },2500);
                        scope.canModifyAfterSuccess=false;
                    }
                    if (v == "keystoneError") {
                        scope.isRotate=false;
                        scope.modifyError = 4;
                        $timeout(function(){
                            scope.modifyError ="";
                        },2500);
                        scope.canModifyAfterSuccess=false;
                    }
                    if (v == "preventError") {
                        scope.isRotate=false;
                        scope.modifyError = 5;
                        $timeout(function(){
                            scope.modifyError ="";
                        },2500);
                        scope.canModifyAfterSuccess=false;
                    }
                    if (v == "clusterAbnormal") {
                        scope.isRotate=false;
                        scope.modifyError = 6;
                        $timeout(function(){
                            scope.modifyError ="";
                        },2500);
                        scope.canModifyAfterSuccess=false;
                    }
                });
            };

    }])
    
    .directive("a", [function() {
        return {
            restrict: "E",
            link: function(scope, element, attrs) {
                let href = attrs.ngHref;
                if (href && href.toLowerCase().indexOf("http") !== 0) {
                    element.on("click", e => {
                        e.preventDefault();
                        location.hash = href;
                    });
                }
            }
        };
    }])
    .directive("toggleNav", [function() {
        return {
            restrict: "A",
            link: function(scope, element) {
                if (document.body.offsetWidth <= 1365) {
                    element.parent(".main").removeClass("open").addClass("closed");
                } else {
                    element.parent(".main").addClass("open").removeClass("closed");
                }
                element.find(".toggle-icon").on("click", function() {
                    element.parent(".main").toggleClass("open");
                    element.parent(".main").toggleClass("closed");
                    widthFunc()
                });
                function widthFunc(){
                    var width =$(".page-inner").width()-240;
                    var width1 =$(".page-inner").width();
                    if(width1<1035){
                        width =$(".page-inner").width()-180;
                        $(".TBDS-header-right.bottom").css("height",150)
                    }else if(width1<1210){
                        $(".TBDS-header-right.bottom").css("height",100)
                    } else{
                        $(".TBDS-header-right.bottom").css("height",50)
                    }
                    $(".TBDS-header-right").css("width",width)
                }
                
            }
        };
    }])
    .controller("topListCtrl", ["$scope", "$location", "$translate", "$rootScope","$uibModal", "$http", "$route","$timeout", "departmentDataSrv", "ticketsSrv","commonFuncSrv",
        function(scope, $location, translate, rootScope,$uibModal, $http, route, $timeout, departmentDataSrv, ticketsSrv,commonFuncSrv) {
            scope.menuList = angular.fromJson(localStorage.menuList);
            //scope.userName = localStorage.userName;
            var self = scope;
            var tranCache = sessionStorage.tranCache?JSON.parse(sessionStorage.tranCache):undefined;
            /*var enterpriseUid = localStorage.enterpriseUid ? localStorage.enterpriseUid : "";*/
            /*var userId = localStorage.$USERID ? localStorage.$USERID : "";*/
            let path = $location.path().split("/");

            self.trans = {};
            self.tran = {};
            self.cssDisabled = false;
            self.trans.list = [
                {
                    text:"中文",
                    value:"zh"
                },
                {
                    text:"English",
                    value:"en"
                }
            ];
            self.tran.selected = tranCache?tranCache:self.trans.list[0];
            translate.use(self.tran.selected.value)
            self.tranSelect = function(tran){
                self.tran.selected = tran;
                sessionStorage.setItem('tranCache',JSON.stringify(tran));
                translate.use(tran.value);
                route.reload();
            };
            if(sessionStorage.getItem("DASHBOARDSTYLE")){
                $('#setStyle').attr('href',sessionStorage.getItem("DASHBOARDSTYLE"));
            }
            self.changeStyle = function(style){
                if(self.cssDisabled)  return;
                var css = "css/" + style + ".css";
                if(sessionStorage.getItem("DASHBOARDSTYLE")){
                    if(sessionStorage.getItem("DASHBOARDSTYLE") !== css){
                        $('#setStyle').attr('href',css);
                        sessionStorage.setItem("DASHBOARDSTYLE",css)
                    }
                    
                }else{
                    $('#setStyle').attr('href',css);
                    sessionStorage.setItem("DASHBOARDSTYLE",css)
                }
                self.cssDisabled = true;
                $timeout(function(){
                    self.cssDisabled = false;
                },2000)
            }
            

            if (_.include(path, "cvm") || _.include(path,"monitor")||_.include(path, "pvm")) {
                scope.isCvmAuth = true;
                if(localStorage.domainName=='default'){
                    scope.topDomian = translate.instant("aws.common.defaultDepar")
                }else{
                    scope.topDomian = localStorage.domainName;    
                }
                changeCvmView();
            }
            /*if (_.include(path, "depview")) {
                if (scope.DOMAIN_ADMIN) {
                    scope.topDomian = localStorage.domainName;
                    scope.isDomianAuth = true;
                    scope.isAdminAuth = false;
                }
            }*/
            /*switch (localStorage.managementRole) {
            case "2":
                scope.logoUrl = "/view";
                break;
            case "3":
                scope.logoUrl = "/cvm/cvmview";
                break;
            case "4":
                scope.logoUrl = "/cvm/cvmview";
                break;
            case "5":
                scope.logoUrl = "/cvm/cvmview";
                break;
            default:
                scope.logoUrl = "/";
            }*/
            scope.$on("$routeChangeSuccess", function(e, cur, pre) {
                if (cur.originalPath.indexOf("cvm") > -1 
                    || cur.originalPath.indexOf("pvm") > -1
                    || cur.originalPath == "/monitor/vmhost"
                    || cur.originalPath == "/monitor/alarmevent"
                    || cur.originalPath == "/monitor/alarmsetting"
                    || cur.originalPath == "/monitor/alarmtemplate"
                    || cur.originalPath == "/monitor/contractgroup"
                    || cur.originalPath == "/monitor/topology"
                    //|| cur.originalPath.indexOf("monitor") > -1       fix AWUI-7209
                    ) {
                    if (scope.ADMIN) {
                        scope.isAdminAuth = true;
                        scope.isDomianAuth = false;
                    } else {
                        scope.isDomianAuth = true;
                        scope.isAdminAuth = false;
                        if(localStorage.domainName=='default'){
                            scope.topDomian = translate.instant("aws.common.defaultDepar")
                        }else{
                            scope.topDomian = localStorage.domainName;    
                        }
                    }
                } else {
                    scope.isAdminAuth = false;
                    scope.isDomianAuth = false;
                }
                if (cur.originalPath.indexOf("cvm") > -1 
                    ||cur.originalPath.indexOf("pvm") > -1
                    || cur.originalPath == "/monitor/vmhost"
                    || cur.originalPath == "/monitor/alarmevent"
                    || cur.originalPath == "/monitor/alarmsetting"
                    || cur.originalPath == "/monitor/alarmtemplate"
                    || cur.originalPath == "/monitor/contractgroup"
                    || cur.originalPath == "/monitor/topology"
                    //|| cur.originalPath.indexOf("monitor") > -1
                ) { //当前url在项目概况页
                    scope.isCvmAuth = true;
                } else {
                    scope.isCvmAuth = false;

                }

                if (pre) {
                    if ((cur.originalPath.indexOf("pvm") > -1 && pre.originalPath.indexOf("pvm") == -1)||(cur.originalPath.indexOf("cvm") > -1 && pre.originalPath.indexOf("cvm") == -1) || (cur.originalPath.indexOf("monitor") > -1 && pre.originalPath.indexOf("monitor") == -1)) {
                        changeCvmView();
                    }
                }

            });
            function changedepView() {
                self.tops = { deparList: [], depart: {} };
                $http({
                    method: "GET",
                    url: "/awstack-user/v1/user/domains/projects"
                }).success(function(res){
                    if(res){
                        self.tops.deparList = res;
                        for(var i=0;i<self.tops.deparList.length;i++){
                            if(self.tops.deparList[i].domainUid=='default'){
                                self.tops.deparList[i].disDomainName = '默认部门';
                            }else{
                                self.tops.deparList[i].disDomainName = self.tops.deparList[i].domainName;
                            }
                            if(self.tops.deparList[i].projects&&self.tops.deparList[i].projects.length>0){
                                for(var j=0;j<self.tops.deparList[i].projects.length;j++){
                                    if(self.tops.deparList[i].projects[j].projectName == 'admin' && self.tops.deparList[i].domainUid=='default'){
                                        self.tops.deparList[i].projects[j].disProjectName = '默认项目';         
                                    }else{
                                        self.tops.deparList[i].projects[j].disProjectName = self.tops.deparList[i].projects[j].projectName;
                                    }
                                }
                            }
                            
                        } 
                        self.tops.deparList.map(function(item) {
                            if (item.domainName == localStorage.domainName) {
                                self.tops.depart.selected = item;
                            }
                        });
                        if(!localStorage.domainName){
                            self.tops.depart.selected = res[0];
                            localStorage.domainName = self.tops.depart.selected.domainName;
                            localStorage.domainUid = self.tops.depart.selected.domainUid
                        }

                    }
                })
            }
            function changeCvmView() {
                self.tops = {
                    depart: { selected: "" },
                    deparList: [],
                    pro: { selected: "" },
                    projectsList: []
                };
                $http({
                    method: "GET",
                    url: "/awstack-user/v1/user/domains/projects"
                }).success(function(res) {
                    if($location.path().indexOf("pvm") == -1 && $location.path().indexOf("cvm") == -1 && $location.path().indexOf("monitor") == -1 && easy!="easy"){return;}
                    if(res){
                       self.tops.deparList = res; 
                       for(var i=0;i<self.tops.deparList.length;i++){
                            if(self.tops.deparList[i].domainUid=='default'){
                                self.tops.deparList[i].disDomainName = '默认部门';
                            }else{
                                self.tops.deparList[i].disDomainName = self.tops.deparList[i].domainName;
                            }
                            if(self.tops.deparList[i].projects&&self.tops.deparList[i].projects.length>0){
                                for(var j=0;j<self.tops.deparList[i].projects.length;j++){
                                    if(self.tops.deparList[i].projects[j].projectName == 'admin' && self.tops.deparList[i].domainUid=='default'){
                                        self.tops.deparList[i].projects[j].disProjectName = '默认项目';         
                                    }else{
                                        self.tops.deparList[i].projects[j].disProjectName = self.tops.deparList[i].projects[j].projectName;
                                    }
                                }
                            }
                        }
                        self.tops.deparList.map(function(item) {
                            if (item.domainName == localStorage.domainName) {
                                self.tops.depart.selected = item;
                            }
                        });
                        if(!localStorage.domainName){
                            self.tops.depart.selected = res[0];
                            localStorage.domainName = self.tops.depart.selected.domainName;
                            localStorage.domainUid = self.tops.depart.selected.domainUid
                        }
                    }
                    self.tops.projectsList = self.tops.depart.selected.projects
                    if(self.tops.projectsList){
                        self.tops.projectsList.map(function(item) {
                            if (item.projectId == localStorage.projectUid) {
                                self.tops.pro.selected = item;
                                self.getRoleFormUserInProject()
                            }
                        });
                        //解决监控页面：新建部门管理员，没有默认项目，但有其他项目在该部门下，默认给第一个项目
                        if(self.tops.projectsList.length > 0 && !self.tops.pro.selected ){
                            self.tops.pro.selected = self.tops.projectsList[0];
                            localStorage.projectName = self.tops.pro.selected.projectName;
                            localStorage.projectUid = self.tops.pro.selected.projectId;
                        }
                    }
                });
            }
            self.changedepart = function(m) {
                if(!m.projects||m.projects.length==0){
                    self.tops.pro.selected = '';
                    self.tops.deparList.forEach(item=>{
                        if(item.domainUid==localStorage.defaultdomainUid){
                            self.tops.depart.selected = item
                            self.changedepart(item);
                        }
                    })
                    return;
                }
                localStorage.domainName = m.domainName;
                localStorage.domainUid = m.domainUid;
                self.tops.projectsList = m.projects;
                if (self.isCvmAuth) {
                    if (m.projects&&m.projects.length) {
                        self.changeproject(m.projects[0]);
                    } else {
                        var pathArry=$location.path();
                        if(_.include(pathArry,"monitor")){ //如果在监控，留在当前页面
                            self.tops.pro.selected = "";
                            localStorage.projectUid="";
                            route.reload();
                        }else if(_.include(pathArry,"cvm")){
                            self.tops.pro.selected = "";
                            localStorage.projectUid="";
                            $location.path("/depart/depview"); //切换部门后，如果部门下没有项目，则跳转到部门概况
                        }
                    }
                } else if (self.ADMIN) { //当前url在部门概况页时，切换部门，更新localStorage
                    localStorage.domainUid = m.domainUid;
                    localStorage.projectUid = "";
                    localStorage.projectName = "";
                    route.reload();
                }
            };

            self.changeproject = function(n) {
                self.tops.pro.selected = n;
                localStorage.projectName = n.projectName;
                localStorage.projectUid = n.projectId;
                if(/\/cvm\/loadbalancers/.test($location.path())){
                    $location.url("/cvm/loadbalancers");
                }else{
                    $location.url($location.path());
                }
                self.getRoleFormUserInProject()
                route.reload();

            };
            self.getRoleFormUserInProject = function(){
                $http({
                   method: "GET",
                   url: "/awstack-user/v1/user/project/"+localStorage.projectUid+"/roles"
               }).success(function(res){
                   if(res){
                       localStorage.rolename = res.roleName;
                   }
               })
            }
            
            function getUnHandledTickes() {
            	ticketsSrv.getMasTask(localStorage.enterpriseUid, localStorage.$USERID).success(function(result) {
                    if(result){
                        ticketsSrv.unHandledMessage = result ;
                        self.unHandledMessage = ticketsSrv.unHandledMessage;
                    }else{
                        self.unHandledMessage = 0;
                    }
                    
                });
                ticketsSrv.getNoSignList(localStorage.enterpriseUid, localStorage.$USERID).success(function(result) {
                    if(result){
                        ticketsSrv.unHandledTickets = result;
                    }

                    
                });
            }
            self.$watch(function() {
                return localStorage.$AWLOGINED;
            }, function(v) {
                if (v) {
                    var isAdmin = localStorage.$LOGINDATA?JSON.parse(localStorage.$LOGINDATA).roleName:"";
                    self.isUserAdmin = isAdmin=="admin"?true:false;
                    getUnHandledTickes();
                    self.userName = localStorage.userName;
                    localStorage.permission == "stand"?self.isStandBase = false:self.isStandBase=true; 
                    if(localStorage.permission==="enterprise"){
                        self.show_email=true;
                    }else{
                        self.show_email=false;
                    }
                }
            });
            self.$watch(function(){
            	return ticketsSrv.unHandledMessage;
            },function(data){
            	if(data.data != undefined){
            		ticketsSrv.unHandledMessage = data.data;
         	 		self.unHandledMessage = ticketsSrv.unHandledMessage;
            	}
        	
            })
            self.$watch(function() {
                return ticketsSrv.unHandledTickets;
            }, function(data) {
                self.unHandledTickes = []
                if (data) {
                    self.totalUnHandledTickes = data.length;
                    if (data.length > 5) {
                        _.map(data, function(item, i) {
                            if (i > 4) {
                                self.ticketsMore = true;
                                return;
                            }
                            self.unHandledTickes.push(item);
                        });
                    } else {
                        self.unHandledTickes = data;
                        self.ticketsMore = false;
                    }
                }
            });
        }
    ])
    .run(["$rootScope", "$location", function(rootscope, location) {
        //rootscope.allMenu = [];
        //rootscope.isLogined = false;
        //rootscope.isView = false;
        //rootscope.isResource = false;
        //rootscope.isAuth = false;
        /*rootscope.$on("$routeChangeStart", function() {
            if (!localStorage.$AWLOGINED) {
                location.path("/").replace();
            }
        });*/
        /*rootscope.$on("$routeChangeSuccess", function(e, cur) {
            //rootscope.isLogined = localStorage.$AWLOGINED || false;
            if (cur.originalPath == "/view" || cur.originalPath == "/view/qcloud") {
                rootscope.isView = true;
                rootscope.isActive = false;
                rootscope.isActive2 = false;
                if (cur.originalPath == ("/view")) {
                    rootscope.isActive = true;
                    rootscope.isActive2 = false;
                }
                if (cur.originalPath == ("/view/qcloud")) {
                    rootscope.isActive = false;
                    rootscope.isActive2 = true;
                }
            } else {
                rootscope.isView = false;
            }
            /*if (cur.originalPath.indexOf("cvm") > -1) {
                rootscope.isResource = true;
            } else {
                rootscope.isResource = false;
            }*/
            /*if (!cur.originalPath || cur.originalPath == ("/")) {
                rootscope.isAuth = true;
                rootscope.isLogined = false;
                localStorage.removeItem("$AWLOGINED");
                localStorage.removeItem("rolename");
            } else {
                rootscope.isAuth = false;
            }*/
        //});
    }]);
