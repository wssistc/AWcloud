import "./alarmSettingSrv";
import "./alarmTemplateSrv";
import "./contractGroupSrv";
import "../../cvm/instances/instancesSrv";
import "../../department/departmentSrv";
import "../../department/depviewSrv";

var alarmSettingModule = angular.module("alarmSettingModule", ["ngTable", "ngAnimate", "ui.bootstrap", "alarmSettingSrvModule", "alarmTmplSrvModule","contactGroupSrvModule","instancesSrv","ngMessages"]);

alarmSettingModule.controller("alarmSettingCtrl", ["$scope", "$rootScope", "NgTableParams", "alarmSettingSrv","alarmTemplateSrv", "contactGroupSrv","checkedSrv","instancesSrv", "departmentDataSrv","depviewsrv","$uibModal", "$translate","GLOBAL_CONFIG",
function($scope, $rootScope, NgTableParams, alarmSettingSrv,alarmTemplateSrv, contactGroupSrv,checkedSrv,instancesSrv, departmentDataSrv,depviewsrv,$uibModal, $translate,GLOBAL_CONFIG) {
    var self = $scope;
    var alarm_data = [],_alarmTableData = [];
    
    // function formateData(data){
    //     var _data =[];
    //     _.each(angular.fromJson(data),function(item){
    //         var _item = JSON.stringify(item).replace(/\{|\}|\"|'/g,"").split(":");
    //         _data.push({
    //             id:_item[0],
    //             name:_item[1]
    //         });
    //     });
    //     return _data;
    // }
    self.titleName="alarmSetting";
        if(sessionStorage["alarmSetting"]){
            self.titleData=JSON.parse(sessionStorage["alarmSetting"]);
        }else{
            self.titleData=[
                {name:'monitor.alarmModule.alarmName',value:true,disable:true,search:"name"},
                {name:'monitor.alarmModule.resourceType',value:true,disable:false,search:"_resourceType"},
                {name:'monitor.alarmModule.template',value:true,disable:false,search:"alarmtemps"},
                {name:'monitor.alarmModule.resource',value:true,disable:false,search:"labelList"},
                {name:'monitor.alarmModule.contact',value:true,disable:false,search:"contactlists"},
                {name:'monitor.alarmModule.alarmAction',value:true,disable:false,search:"alarmAction"},
                {name:'monitor.alarmModule.enabled',value:true,disable:false,search:"_enabled"},
                
            ];
        }
        function alarmSettingSearchTearm(obj){
            var tableData = obj.tableData;
            var titleData = obj.titleData;
            tableData.map(function(item){
                item.searchTerm="";
                titleData.forEach(function(showTitle){
                    if(showTitle.value){
                        if(showTitle.search=='alarmtemps'){
                              item.searchTerm+=item.alarmtemps_str  
                        }else if(showTitle.search=='labelList'){
                              item.searchTerm+=item.labelList_str
                        }else if(showTitle.search=='contactlists'){
                              item.searchTerm+=item.user_str
                        }
                        else{
                           item.searchTerm+=item[showTitle.search]+"\b";
                        }
                     }
                });
            });
        }
    self.alarmSettingSearchTearm=alarmSettingSearchTearm;
    var initAlarmSettingTable = function(){
        self.globalSearchTerm = "";
        alarmSettingSrv.getAlarmSettings().then(function(result){
            result?self.loadData = true:"";
            return result.data;
        }).then(function(data){
            alarm_data = _.map(data,function(item){
                if(item.resourceType == "physical"){
                    item._resourceType = $translate.instant("aws.monitor.alarmModule.physicalHost");
                }else if(item.resourceType == "virtual"){
                    item._resourceType = $translate.instant("aws.monitor.alarmModule.vmHost");
                }else if(item.resourceType == "ceph"){
                    item._resourceType = "ceph"; 
                }else if(item.resourceType == "computeha"){
                    item._resourceType = $translate.instant("aws.monitor.alarmModule.computeha");
                }else if(item.resourceType == "planwork"){
                    item._resourceType = $translate.instant("aws.monitor.alarmModule.planwork");
                }else if(item.resourceType == "hardware"){
                    item._resourceType = $translate.instant("aws.monitor.alarmModule.hardware");
                }else if(item.resourceType == "ceph_check"){
                    item._resourceType = $translate.instant("aws.monitor.alarmModule.cephCheck");
                }else if(item.resourceType == "tsdb"){
                    item._resourceType = $translate.instant("aws.monitor.alarmModule.tsdb");
                }else if(item.resourceType == "security"){
                    item._resourceType = $translate.instant("aws.monitor.alarmModule.security");
                }else if(item.resourceType == "tdsql"){
                    item._resourceType = $translate.instant("aws.monitor.alarmModule.tdsql");
                }else if(item.resourceType == "alauda"){
                    item._resourceType = $translate.instant("aws.monitor.alarmModule.alauda");
                }else if(item.resourceType == "coc"){
                    item._resourceType = $translate.instant("aws.monitor.alarmModule.coc");
                }else{
                    item._resourceType="";
                }
                if(item.alarmAction == "email") {
                    item._alarmAction = $translate.instant("aws.monitor.alarmModule.email");
                }else if(item.alarmAction == "wechat") {
                    item._alarmAction = $translate.instant("aws.monitor.alarmModule.weChat");
                }else{
                    item._alarmAction = "";
                }
                 item.alarmtemps_str = "";
                 item.labelList_str = "";
                 item.user_str = "";
                if(item.alarmtemps.length>0){
                    item.alarmtemps.forEach(function(value){
                        item.alarmtemps_str +=  value.name
                    });
                }
                if(item.labelList.length>0){
                     item.labelList.forEach(function(value){
                        if(value.hostName){
                            item.labelList_str += value.hostName + "，"
                        }else{
                            item.labelList_str += value.name + "，"
                        }
                        
                    })
                }
                if(item.contactlists.length>0){
                    item.contactlists.forEach(function(value){
                        item.user_str += value.name + "，"
                    })
                }
                item._enabled = item.enabled == true?$translate.instant("aws.monitor.alarmModule.yes"):$translate.instant("aws.monitor.alarmModule.no");
                item.searchTerm = [item.name,item._resourceType,item.alarmtemps_str,item.labelList_str,item.user_str,item._alarmAction,item._enabled].join("\b")
                //item.templates = formateData(item.templates);
                //item.contactLists = formateData(item.contactLists);
                /*item.labels =  function formateLables(){
                    var _labels = [],labels_options = [];
                    if(item.resourceType == "physical"){
                        labels_options = phy_labels;
                    }else if(item.resourceType == "virtual"){
                        labels_options = vm_labels;
                    }
                    _.each(item.labels.split(","),function(id){
                        for(var i = 0; i<labels_options.length;i++){
                            if(id == labels_options[i].resId ){
                                _labels.push(labels_options[i]);
                            }
                        }
                    })
                    return  _labels;
                }();*/
                return item;
            });
            _alarmTableData = angular.copy(alarm_data);
            self.tableData=alarm_data;
            alarmSettingSearchTearm({tableData:self.tableData,titleData:self.titleData});
            self.tableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset:alarm_data });
            checkedSrv.checkDo(self,data, "id");
        });
    };
    initAlarmSettingTable();


    self.$watch(function(){
        return self.checkedItems;
    },function(value){
        if(value && value.length > 0){
            var enabledCount = 0;
            var defaultCount = 0;  //选中了默认的告警不允许删除
            for(let i=0;i<value.length;i++){
                if(value[i].enabled == true){
                    enabledCount++;
                }
                if(value[i].isDefault == true){
                    defaultCount++;
                }
            }
            if(enabledCount == value.length){
                self.isForbiddenBtn = false;
                self.isEnabledBtn = true;
            }else if(enabledCount == 0){
                self.isForbiddenBtn = true;
                self.isEnabledBtn = false;
            }else{
                self.isForbiddenBtn = true;
                self.isEnabledBtn = true;
            }
            if(defaultCount > 0) {
                self.delisDisabled = true;
            }
            //item.resourceType == "tsdb"  item.resourceType == "security" item.resourceType == "tdsql" item.resourceType == "alauda"
            let paasTypeArray=["tsdb","security","tdsql","alauda"];
            if(value.length==1&&(paasTypeArray.indexOf(value[0].resourceType)==-1)){
                self.canCopy=true;
            }else{
                self.canCopy=false;
            }
            //非admin,编辑，复制，删除都不可以
            if(!$rootScope.ADMIN){
               let virtualArray=value.filter(function(item){
                   return item.resourceType=='virtual';
               });
               if(virtualArray.length<value.length){
                  self.canCopy=false;
                  self.isDisabled = true;
                  self.delisDisabled = true;
                  self.isForbiddenBtn = true;
                  self.isEnabledBtn = true;
               }
            }
        }else{
            self.canCopy=false;
            self.isDisabled = true;
            self.delisDisabled = true;
            self.isForbiddenBtn = true;
            self.isEnabledBtn = true;
        }
    });

    self.refreshAlarmTable = function(){
        self.globalSearchTerm = "";
        initAlarmSettingTable();
    };

    self.applyGlobalSearch = function() {
        var term = self.globalSearchTerm;
        self.tableParams.filter({ searchTerm: term });
    };

    //新建、编辑、复制告警
    self.alarmSetting = function(type,editData){
        var scope = self.$new();
        var alarmSettingModal = $uibModal.open({
            animation:true,
            templateUrl:"alarmSetting.html",
            scope:scope
        });
        var phy_labels = [],vm_labels = [],phy_tmpls = [],ha_tmpls = [],vm_tmpls = [], ceph_tmpls = [],tsdb_tmpls=[],_resourceIdEx = [],_tempIdEx =[];
        var _projects = {};
        scope.submitted = {};
        scope.labels = {
            "options":[]
        };
        scope.alarmActionList = [
            {name:"邮箱", value:"email"},
            {name:"微信", value:"wechat"}
        ];
        if(type == "edit") {
            scope.isEdit = true;
        }else {
            scope.isEdit = false;
        }
        var loginData = JSON.parse(localStorage.$LOGINDATA);

        function initAlarmForm(){
            return {
                name:"",
                resourceType:"",
                selectedDepartment:{},
                selectedProject:{},
                labelList:[],
                alarmtemps:[],
                contactlists:[],
                normalToAlarm:"",
                alarmToNormal:"",
                alarmAction: scope.alarmActionList[0],
                enabled:true
            };
        }
        //处理部门和项目的传参形式
        function paramsLimits(department,project){
            return {
                domainName:department.name,
                domainUid:department.domainUid,
                projectName:project.projectName,
                projectUid:project.projectUid
            };
        }
        //只有物理机和云主机可选择资源
        function setResTypeFunc(){ //资源类型
            //单机版没有ceph监控
            self.options=[
                {name:$translate.instant("aws.monitor.alarmModule.physicalHost"),value:"physical"},
                {name:$translate.instant("aws.monitor.alarmModule.vmHost"),value:"virtual"},
                {name:$translate.instant("aws.monitor.alarmModule.computeha"),value:"computeha"},
                {name:$translate.instant("aws.monitor.alarmModule.planwork"),value:"planwork"},
                {name:$translate.instant("aws.monitor.alarmModule.hardware"),value:"hardware"}
            ];
            if(localStorage.permission == "enterprise"){
                self.options.push({name:"ceph",value:"ceph"});
                self.options.push({name:$translate.instant("aws.monitor.alarmModule.cephCheck"),value:"ceph_check"});
            }
            if(type=='new'){
                var paasList=JSON.parse(localStorage.supportPaas);
                let hasCtsdb=false,hasSecurity=false,hasTdsql=false,hasAlauda=false,hasCoc=false;
                var regionBusiAuth=JSON.parse(localStorage.regionBusiAuth);
                //默认部门和默认项目才可以添加pass告警
                if(localStorage.domainName=='default'&&localStorage.domainUid=='default'&&localStorage.projectName=='admin'){
                    //判断对应的paas告警是否已经新建过
                    self.tableData.forEach(function(item){
                        if(item.resourceType == "tsdb"){//11
                           hasCtsdb=true;
                        }
                        if(item.resourceType == "security"){//13
                           hasSecurity=true;
                        }
                        if(item.resourceType == "tdsql"){//10
                           hasTdsql=true;
                        }
                        if(item.resourceType == "alauda"){//16
                           hasAlauda=true;
                        }
                        if(item.resourceType == "coc"){//15
                           hasCoc=true;
                        }
                    });
                    if(paasList&&angular.isObject(paasList)){
                       if(paasList.CTSDB&&paasList.CTSDB.isLinked&&!hasCtsdb&&(regionBusiAuth.indexOf("11")>-1)){
                          self.options.push({name:$translate.instant("aws.monitor.alarmModule.tsdb"),value:"tsdb"});
                       }
                       //云镜
                       if(paasList.CloudSecurity&&paasList.CloudSecurity.isLinked&&!hasSecurity&&(regionBusiAuth.indexOf("13")>-1)){
                          self.options.push({name:$translate.instant("aws.monitor.alarmModule.security"),value:"security"});
                       }
                       //分布式数据库
                       if(paasList.TDSQL&&paasList.TDSQL.isLinked&&!hasTdsql&&(regionBusiAuth.indexOf("10")>-1)){
                          self.options.push({name:$translate.instant("aws.monitor.alarmModule.tdsql"),value:"tdsql"});
                       }
                       //灵雀云
                       if(paasList.Alauda&&paasList.Alauda.isLinked&&!hasAlauda&&(regionBusiAuth.indexOf("16")>-1)){
                          self.options.push({name:$translate.instant("aws.monitor.alarmModule.alauda"),value:"alauda"});
                       }
                       //织云
                       if(paasList.COC&&paasList.COC.isLinked&&!hasCoc&&(regionBusiAuth.indexOf("15")>-1)){
                          self.options.push({name:$translate.instant("aws.monitor.alarmModule.coc"),value:"coc"});
                       }
                    }
                }
            }else{
                if(scope.alarmForm.resourceType=='tsdb'){
                   scope.alarmForm.isEditPaas=true;
                   self.options.push({name:$translate.instant("aws.monitor.alarmModule.tsdb"),value:"tsdb"});
                }
                if(scope.alarmForm.resourceType=='security'){
                   scope.alarmForm.isEditPaas=true;
                   self.options.push({name:$translate.instant("aws.monitor.alarmModule.security"),value:"security"});
                }
                if(scope.alarmForm.resourceType=='tdsql'){
                   scope.alarmForm.isEditPaas=true;
                   self.options.push({name:$translate.instant("aws.monitor.alarmModule.tdsql"),value:"tdsql"});
                }
                if(scope.alarmForm.resourceType=='alauda'){
                   scope.alarmForm.isEditPaas=true;
                   self.options.push({name:$translate.instant("aws.monitor.alarmModule.alauda"),value:"alauda"});
                }
                if(scope.alarmForm.resourceType=='coc'){
                   scope.alarmForm.isEditPaas=true;
                   self.options.push({name:$translate.instant("aws.monitor.alarmModule.coc"),value:"coc"});
                }
            }

            if($rootScope.ADMIN){
                scope.resource = {
                    options:self.options
                };
                if(type == "new"){
                    //获取物理机的资源
                    getPhyResFunc();
                }else{
                    if(editData.resourceType == "physical"){
                        getPhyResFunc();
                    }else if(editData.resourceType == "virtual"){
                        getVmResFunc();
                    }
                }
            }else{ //除超级管理员外资源类型只能选择虚拟机，且部门不可选
                scope.priviliegeLimit = true;
                scope.disabledDepSelect = true;
                if(type == "new"){
                    scope.resource = {
                        options:[
                            {name:$translate.instant("aws.monitor.alarmModule.vmHost"),value:"virtual"}
                        ]
                    };
                    getVmResFunc();
                }else{
                    if(editData.resourceType == "physical"){
                        scope.resource = {
                            options:[
                                {name:$translate.instant("aws.monitor.alarmModule.physicalHost"),value:"physical"},
                                {name:$translate.instant("aws.monitor.alarmModule.vmHost"),value:"virtual"}
                            ]
                        };
                        getPhyResFunc();
                    }else if(editData.resourceType == "virtual"){
                        scope.resource = {
                            options:[
                                {name:$translate.instant("aws.monitor.alarmModule.vmHost"),value:"virtual"}
                            ]
                        };
                        getVmResFunc();
                    }
                }
            }
        }
        //资源，模板，联系人组中的placeholder
        function setFieldFun(option,field){
            if(option.length>0){
                switch(field){
                case "res":
                    scope.labelsPlaceholder = $translate.instant("aws.monitor.alarmModule.placeholder.choseRes");
                    break;
                case "tmpl":
                    scope.tmplsPlaceholder = $translate.instant("aws.monitor.alarmModule.placeholder.choseTmpl");
                    break;
                case "contact":
                    scope.contactPlaceholder = $translate.instant("aws.monitor.alarmModule.placeholder.choseContactGroup");
                    break;
                }
            }else{
                switch(field){
                case "res":
                    scope.labelsPlaceholder = $translate.instant("aws.monitor.alarmModule.placeholder.noResToChose");
                    break;
                case "tmpl":
                    scope.tmplsPlaceholder = $translate.instant("aws.monitor.alarmModule.placeholder.noTmplToChose");
                    break;
                case "contact":
                    scope.contactPlaceholder = $translate.instant("aws.monitor.alarmModule.placeholder.noContactToChose");
                    break;
                }
            }
        }
        
        //获取所有项目
        function getAllProjectsFunc(){
            return     alarmSettingSrv.getAllProjects().then(function(result){
                var proDetailObj = {
                    projectUid:"",
                    projectName:""
                };
                for(var k in result.data){
                    _projects[k] = [];
                    _.each(result.data[k],function(item){
                        proDetailObj = {
                            projectUid:item.projectid,
                            projectName:item.projectname
                        };
                        if(item.projectname != "service"){
                            _projects[k].push(proDetailObj);
                        }
                    });
                }
                return _projects;
            });
        }
        //获取某个部门某个项目下的虚拟机
        function getVmResByLimitsFunc(limit){
            
            alarmSettingSrv.getVmHost(limit).then(function(result){
                var formateOption = function(result){
                    var _labelsDetail = {};
                    vm_labels = vm_labels.splice(vm_labels.length,0);  //获取前清空
                    _.each( _.map(result.data,function(item){
                        item.resId = item.uid;
                        return item;
                    }),function(val){
                        if(val.status == "ACTIVE"){ //过滤出运行状态的虚拟机
                            _labelsDetail = {
                                name:val.name,
                                uid:val.uid,
                                resId:val.resId
                            };
                            vm_labels.push(_labelsDetail);
                        }
                    });
                    return vm_labels;
                };

                if(result && result.data){
                    result.data = result.data.filter(function(item){  //过滤出当前部门项目下虚拟机
                        //return item.proid == scope.alarmForm.selectedProject.projectUid;
                        return item.proid == localStorage.projectUid && item.name != "fixedImageInstanceName";
                    });
                    scope.labels.options = formateOption(result);
                    //资源，模板，联系人组中的placeholder
                    setFieldFun(scope.labels.options,"res");
                }
                
            });
        }
        //获取物理机资源
        function getPhyResFunc(){
            var formateOption = function(data){
                //data = data.filter(item => item.status==4 || item.status==41)
                var _labelsDetail = {};
                phy_labels = phy_labels.splice(phy_labels.length,0); //push前清空
                _.each( _.map(data,function(item){
                    item.resId = item.nodeUid;
                    item.name = item.hostName;
                    return item;
                }),function(val){
                    _labelsDetail = {
                        hostName:val.hostName,
                        name:val.name,
                        nodeUid:val.nodeUid,
                        resId:val.resId
                    };
                    phy_labels.push(_labelsDetail);
                });
                return phy_labels;
            };
            alarmSettingSrv.TubePhyHost().then(function(result) {
                if(result && result.data){
                    scope.labels.options = formateOption(result.data);
                    //资源，模板，联系人组中的placeholder
                    setFieldFun(scope.labels.options,"res");
                }
            });
        }
        //获取虚拟机资源
        function getVmResFunc(){
             //根据header中的部门和项目获取资源，不需要再调api获取部门和项目,改为从localStorage里面获取
            scope.alarmForm.selectedDepartment = {
                "name":localStorage.domainName,
                "domainUid":localStorage.domainUid
            };
            scope.alarmForm.selectedProject = {
                "projectName":localStorage.projectName,
                "projectUid":localStorage.projectUid
            };
            getVmResByLimitsFunc(paramsLimits(scope.alarmForm.selectedDepartment,scope.alarmForm.selectedProject));

            /*function getProjectsOptionsFunc(){
                scope.projectsOfDomain = {
                    options:scope.alarmForm.selectedDepartment.domainUid=="default"?_projects[scope.alarmForm.selectedDepartment.name]:(_projects[scope.alarmForm.selectedDepartment.name]).filter(item => item.projectName != "admin") //自定义部门选择项目时过滤掉admin项目
                };
                //新建或编辑时给出项目的默认选项
                if(type == "new"){
                    scope.alarmForm.selectedProject = scope.projectsOfDomain.options[0];
                }else{
                    scope.alarmForm.selectedProject = {
                        projectName:function(){
                            var _projectname = "";
                            _.each(scope.projectsOfDomain.options,function(item){
                                if(item.projectUid == editData.projectId){
                                    _projectname = item.projectName;
                                }
                            });
                            return _projectname;
                        }(),
                        projectUid:editData.projectId
                    };
                }
                //根据部门和项目信息获取虚拟机资源
                getVmResByLimitsFunc(paramsLimits(scope.alarmForm.selectedDepartment,scope.alarmForm.selectedProject));
            }
            scope.allDepartments = {
                options:[]
            };
            //获取部门
            if($rootScope.ADMIN){
                getAllProjectsFunc().then(function(_projects){
                    //获取所有部门，根据已有项目过滤出有项目的部门
                    departmentDataSrv.getDepart().then(function(result) {
                        _.each(result.data,function(item){ 
                            for(var k in _projects){
                                if(item.name == k){
                                    scope.allDepartments.options.push(item); //超级管理员可获取所有的部门
                                }
                            }
                        });
                        //新建或编辑时给出部门的默认选项
                        if(type == "new"){
                            scope.alarmForm.selectedDepartment = scope.allDepartments.options[0];
                        }else{
                            scope.alarmForm.selectedDepartment = {
                                name:function(){
                                    var _domianname = "";
                                    _.each(scope.allDepartments.options,function(item){
                                        if(item.domainUid == editData.domainId ){
                                            _domianname = item.name;
                                        }
                                    });
                                    return _domianname;
                                }(),
                                domainUid:editData.domainId
                            };
                        }
                        getProjectsOptionsFunc();
                    });
                });
            }else{
                scope.allDepartments.options.push({ //部门选项为默认登录时的部门
                    name:loginData.domainName,
                    domainUid:loginData.domainUid
                });
                scope.alarmForm.selectedDepartment = scope.allDepartments.options[0];
                //获取项目
                getAllProjectsFunc().then(function(){
                    getProjectsOptionsFunc();
                });
            }*/
        }

        function initResField(formField){
            scope.labels.options = scope.labels.options.slice(scope.labels.options.length,0);
            scope.alarmForm.labelList = [];
            scope.alarmForm.alarmtemps = [];
            if(formField.label){
                formField.label.$dirty = false;
            }
            if(formField.template){
                formField.template.$dirty = false;
            }
        }

        scope.changeResType = function(formField,resType){
            //重置可以选择的资源和模板
            initResField(formField);
            if(resType == "physical"){
                getPhyResFunc();
            }else if(resType == "virtual"){
                getVmResFunc();
            }else if(resType == "ceph" || resType == "computeha" || resType == "planwork" || resType == "hardware" || resType == "ceph_check"){
                //不是云主机和物理机时，默认选择资源为defaultcephid
                scope.labels.options = [{name:"cephres",resId:"defaultcephid"}];
                scope.alarmForm.labelList = [scope.labels.options[0].resId];
            }
        };

        scope.changeDepartment = function(department,formField){
            scope.projectsOfDomain = {
                options:(_projects[department.name]).filter(item => item.projectName != "admin")
            };
            scope.alarmForm.selectedProject = scope.projectsOfDomain.options[0];
            scope.labels.options = [];
            getVmResByLimitsFunc(paramsLimits(department,scope.alarmForm.selectedProject));
            getAlarmTmplsFunc();
            initResField(formField);
        };
        scope.changeProject = function(department,project,formField){
            scope.labels.options = [];
            getVmResByLimitsFunc(paramsLimits(department,project));
            getAlarmTmplsFunc();
            initResField(formField);
        };
        
        //获取告警模板（更新对应资源的告警模板，可选的告警模板需要过滤）
        function getAlarmTmplsFunc(){ 
            phy_tmpls = phy_tmpls.splice(phy_tmpls.length,0);
            vm_tmpls = vm_tmpls.splice(vm_tmpls.length,0);
            ceph_tmpls = ceph_tmpls.splice(ceph_tmpls.length,0);
            ha_tmpls = ha_tmpls.splice(ha_tmpls.length,0);
            tsdb_tmpls = tsdb_tmpls.splice(tsdb_tmpls.length,0);
            alarmTemplateSrv.getAlarmTmpls().then(function(result){
                if (result && result.data) {
                    _.each(result.data, function(item) {
                        if (item.resourceType == "physical") {
                            phy_tmpls.push(item);
                        } else if (item.resourceType == "virtual") {
                            vm_tmpls.push(item);
                        } else if (item.resourceType == "ceph") {
                            ceph_tmpls.push(item);
                        } else if (item.resourceType == "computeha") {
                            ha_tmpls.push(item);
                        }else if(item.resourceType == "tsdb"){
                            tsdb_tmpls.push(item);
                        }
                    });
                    setFieldFun(scope.tmpls.options, "tmpl");
                }
                
            });
        }
        getAlarmTmplsFunc();
        
        //获取联系人组（可选的联系人组都一样）
        function initCountGroup(){
            contactGroupSrv.getContactGroup().then(function(result){
                if (result && result.data) {
                    scope.contacts = {
                        options: result.data.data
                    };
                    if(type=='edit'||type=='copy'){
                        var options = [];
                        scope.alarmForm.contactlists.forEach(item=>{
                            scope.contacts.options.forEach(x=>{
                                if(item.name==x.name){
                                    options.push(x);
                                }
                            })      
                        });

                        scope.alarmForm.contactlists= options;
                    }
                    setFieldFun(scope.contacts.options, "contact");
                }
            });
        }
        initCountGroup();
        // 新建联系人组弹框
        scope.insertContact = function(){
            $uibModal.open({
                animation: $scope.animationsEnabled,
                backdrop: "static",
                templateUrl: "insert-contact.html",
                controller: "insertContactCtrl",
                resolve: {
                    initCountGroup: function(){
                        return initCountGroup
                    }
                }

            });
        };


        scope.$watch(function(){
            return scope.alarmForm.resourceType;
        },function(restype){
            scope.isHardwareHandle=false;
            scope.isCephType = false;
            scope.priviliegeLimit = false;
            scope.isha = false;
            scope.isTsdb=false;
            if(restype == "physical"){
                scope.tmpls = {
                    options:phy_tmpls
                };
            }else if(restype == "virtual"){
                scope.priviliegeLimit = true;
                scope.tmpls = {
                    options:vm_tmpls
                };
            }else if(restype == "ceph"){
                scope.isCephType = true;
                scope.tmpls = {
                    options:ceph_tmpls
                };
            }else if(restype == "hardware"){
                scope.isha = true;
                scope.isHardwareHandle=true;
                scope.tmpls = {
                    options:ha_tmpls
                };
                //获取硬件告警下的监控项用于页面展示
                alarmSettingSrv.getHardwareMonitirItems().then(function(res){
                    if(res&&res.data&&angular.isArray(res.data)){
                       scope.monitorItems=res.data;
                       if(type=='edit'||type=='copy'){
                           //硬件故障的监控项处理
                            hardwareMonitorItem(editData.monitoringTasks);
                       }
                    }
                });
                                                                 
            }else if(restype == "computeha" || restype == "planwork" || restype == "ceph_check"||restype == "security"||restype == "tdsql"||restype == "alauda"||restype == "coc"){
                scope.isha = true;
                scope.tmpls = {
                    options:ha_tmpls
                };
            }else if(restype == "tsdb"){
                scope.isTsdb=true;
                scope.tmpls = {
                    options:tsdb_tmpls
                };
            }
            setFieldFun(scope.tmpls.options,"tmpl");
        });

        function formateData(v){
            var _data = [];
            _.each(v,function(item){
                if(typeof(item) == "object"){
                    _data.push(item.resId || item.id);
                }else{
                    _data.push(item);
                }
            });
            return _data;
        }

        function mapLabelListFunc(){
            return  _.map(editData.labelList,function(item){
                item.resId = item.uid || item.nodeUid;
                item.name = item.name || item.hostName;
                return item;
            });
        }

        function hardwareMonitorItem(monitoringTasks){
           monitoringTasks = _.uniq(monitoringTasks, "monitoringItemId");
           scope.monitorItems.forEach(function(monitor){
               monitoringTasks.forEach(function(taskItem){
                   if(taskItem.monitoringItemId==monitor.id){
                      monitor.checked=true;
                      monitor.threshold=taskItem.threshold;
                   }
               });
           });
        }
        switch(type){
        case "new":
            scope.alarmModalTitle = $translate.instant("aws.monitor.alarmModule.creatNewAlarm");
            scope.alarmForm = initAlarmForm();
            setResTypeFunc();
            scope.alarmForm.resourceType = scope.resource.options[0].value;
            scope.newSetting = true;
            break;

        case "edit":
            scope.alarmModalTitle = $translate.instant("aws.monitor.alarmModule.editAlarmSetting");
            //选择资源处理
            editData.labelList = mapLabelListFunc();
            _resourceIdEx = editData.labelList;
            _tempIdEx = editData.alarmtemps;
            scope.alarmForm = editData;
            scope.alarmActionList.forEach(function(item, index) {
                if(item.value == editData.alarmAction) {
                    scope.alarmForm.alarmAction = scope.alarmActionList[index];
                }
            });
            //资源类型处理
            setResTypeFunc();
            break;

        case "copy":
            scope.alarmModalTitle = $translate.instant("aws.monitor.alarmModule.copyAlarm");
            scope.isAddAlarm = false;
            editData.labelList = mapLabelListFunc();
            scope.alarmForm = angular.copy(editData);
            scope.alarmActionList.forEach(function(item, index) {
                if(item.value == editData.alarmAction) {
                    scope.alarmForm.alarmAction = scope.alarmActionList[index];
                }
            });
            scope.alarmForm.name = "";
            scope.alarmForm.id = "";
            setResTypeFunc();
            break;
        }
        //获取运算符列表
        function getOperators(){
            alarmSettingSrv.getOperators().then(function(res){
                if(res&&res.data&&angular.isArray(res.data)){
                   scope.getOperatorList=res.data;
                   scope.getOperatorList.forEach(function(operate){
                      if(operate.name=="大于等于"){
                         scope.largeEquealId=operate.id;
                      }
                      if(operate.name=="等于"){
                         scope.equealId=operate.id;
                      }
                   });
                }
            });
        }
        getOperators();

        scope.alarmConfirm = function(formField,data,monitorItems){
            if(formField.$valid){
                //共同参数处理
                if(type == "new"||type == "copy"){
                    var params = {
                        name:data.name,
                        labels:formateData(data.labelList).join(","),
                        contactLists:formateData(data.contactlists).join(","),
                        resourceType:data.resourceType,
                        alarmAction:scope.alarmForm.alarmAction.value,
                        enabled:data.enabled
                    };
                    if(type == "new"){
                        params.templates=data.alarmtemps.join(",");
                    }else if(type == "copy"){
                        params.templates=formateData(data.alarmtemps).join(",");
                    }
                    //硬件故障需要获取资源类型的id
                    if(data.resourceType=='hardware'){
                       var regionUid=JSON.parse(localStorage.$LOGINDATA).regionUid;
                       alarmSettingSrv.getAllNode(regionUid).then(function(res){
                            if(res&&res.data&&angular.isArray(res.data)){
                                scope.nodeList=res.data;
                                scope.monitoringTasks=[];
                                monitorItems.forEach(function(item){
                                    if(item.checked){
                                       var task={};
                                       if(item.ruleKey=='hardware.cpu.temperature'){
                                          task={
                                               "monitoringTargetId":"",
                                               "monitoringItemId":item.id,
                                               "alarmRuleOperatorId":scope.largeEquealId,
                                               "threshold":Number(item.threshold)
                                          };
                                       }else{
                                          task={
                                               "monitoringTargetId":"",
                                               "monitoringItemId":item.id,
                                               "alarmRuleOperatorId":scope.equealId,
                                               "threshold":1
                                          };
                                       }
                                       scope.nodeList.forEach(function(node){
                                          var taskPush=angular.copy(task);
                                          taskPush.monitoringTargetId=node.nodeUid;
                                          scope.monitoringTasks.push(taskPush);
                                       }); 
                                    }
                                });
                                params.monitoringTasks=scope.monitoringTasks;
                                if(type == "new"){
                                    alarmSettingSrv.createAlarm(params).then(function(){
                                        initAlarmSettingTable();
                                    }); 
                                }else if(type == "copy"){
                                    alarmSettingSrv.copyAlarm(params).then(function(){
                                        initAlarmSettingTable();
                                    });
                                }
                            }
                       });
                    }else{
                        if(type == "new"){
                            alarmSettingSrv.createAlarm(params).then(function(){
                                initAlarmSettingTable();
                            }); 
                        }else if(type == "copy"){
                            alarmSettingSrv.copyAlarm(params).then(function(){
                                initAlarmSettingTable();
                            });
                        }
                        
                    }          
                }else{
                    
                    params = {
                        name:data.name,
                        labels:formateData(data.labelList).join(","),  //数组转化为字符串
                        contactLists:formateData(data.contactlists).join(","),
                        templates:formateData(data.alarmtemps).join(","),
                        resourceType:data.resourceType,
                        alarmAction:scope.alarmForm.alarmAction.value,
                        enabled:data.enabled
                    };
                    if(type == "edit"){
                        params.resourceIdEx = formateData(_resourceIdEx);
                        params.resourceIdNow = formateData(data.labelList);
                        params.tempIdEx = formateData(_tempIdEx);
                        params.tempIdNow = formateData(data.alarmtemps);
                        //硬件故障需要获取资源类型的id
                        if(data.resourceType=='hardware'){
                           var regionUid=JSON.parse(localStorage.$LOGINDATA).regionUid;
                           alarmSettingSrv.getAllNode(regionUid).then(function(res){
                                if(res&&res.data&&angular.isArray(res.data)){
                                    scope.nodeList=res.data;
                                    scope.monitoringTasks=[];
                                    monitorItems.forEach(function(item){
                                        if(item.checked){
                                           var task={};
                                           if(item.ruleKey=='hardware.cpu.temperature'){
                                              task={
                                                   "monitoringTargetId":"",
                                                   "monitoringItemId":item.id,
                                                   "alarmRuleOperatorId":scope.largeEquealId,
                                                   "threshold":Number(item.threshold)
                                              };
                                           }else{
                                              task={
                                                   "monitoringTargetId":"",
                                                   "monitoringItemId":item.id,
                                                   "alarmRuleOperatorId":scope.equealId,
                                                   "threshold":1
                                              };
                                           }
                                           scope.nodeList.forEach(function(node){
                                              var taskPush=angular.copy(task);
                                              taskPush.monitoringTargetId=node.nodeUid;
                                              scope.monitoringTasks.push(taskPush);
                                           }); 
                                        }
                                    });
                                    params.monitoringTasks=scope.monitoringTasks;
                                    var _params = {
                                        id:editData.id,
                                        data:params
                                    };
                                    alarmSettingSrv.editAlarm(_params).then(function(){
                                        initAlarmSettingTable();
                                    });
                                }
                           });
                        }else{
                            var _params = {
                                id:editData.id,
                                data:params
                            };
                            alarmSettingSrv.editAlarm(_params).then(function(){
                                initAlarmSettingTable();
                            });
                        }
                    }
                } 
                alarmSettingModal.close();
            }else{
                if(formField.alarmName.$invalid){
                    scope.submitted.alarmName = true;
                }
                if(formField.label&&formField.label.$invalid){
                    scope.submitted.label = true;
                }
                if(formField.cpuThreshold&&formField.cpuThreshold.$invalid){
                    scope.submitted.cpuThreshold = true;
                }
                if(formField.template.$invalid){
                    scope.submitted.template = true;
                }
                // if(formField.contactGroup.$invalid){
                //     scope.submitted.contactGroup = true;
                // }
            }
        };
    };

    //启用告警
    self.enableAlarm = function(checkedItems) {
        var content = {
            target: "enableAlarm",
            msg: "<span>"+$translate.instant("aws.monitor.alarmModule.enableAlarm")+"</span>",
            type: "info",
            btnType: "btn-primary",
            data:checkedItems
        };
        self.$emit("delete", content);
    };
    self.$on("enableAlarm", function(e,checkedItems) {
        var ids = [];
        _.each(checkedItems,function(item){
            ids.push(item.id);
        });
        alarmSettingSrv.multiAlarm({
            ids:{
                "ids":ids
            },
            states:"enabled"
        }).then(function() {
            initAlarmSettingTable();
        });
    });

    //禁用告警
    self.forbiddenAlarm = function(checkedItems) {
        var content = {
            target: "forbiddenAlarm",
            msg: "<span>"+$translate.instant("aws.monitor.alarmModule.forbiddenAlarm")+"</span>",
            type: "warning",
            btnType: "btn-warning",
            data:checkedItems
        };
        self.$emit("delete", content);
    };
    self.$on("forbiddenAlarm", function(e,checkedItems) {
        var ids = [];
        _.each(checkedItems,function(item){
            ids.push(item.id);
        });
        alarmSettingSrv.multiAlarm({
            ids:{
                "ids":ids
            },
            states:"disabled"
        }).then(function() {
            initAlarmSettingTable();
        });
    });

    //删除告警
    self.deleteAlarm = function(checkedItems){
        var content = {
            target: "deleteAlarm",
            msg: "<span>"+$translate.instant("aws.monitor.alarmModule.deleteAlarm")+"</span>",
            data:checkedItems
        };
        self.$emit("delete", content);
    };
    self.$on("deleteAlarm", function(e,data) {
        var ids = [];
        _.each(data,function(item){
            ids.push(item.id);
        });
        alarmSettingSrv.delAlarm({
            ids:ids
        }).then(function() {
            initAlarmSettingTable();
        });
    });

}]).controller("insertContactCtrl",["$scope","$rootScope","NgTableParams","contactGroupSrv","checkedSrv","$uibModal","$translate","$uibModalInstance","initCountGroup",function($scope, $rootScope, NgTableParams, contactGroupSrv, checkedSrv, $uibModal, $translate, $uibModalInstance,initCountGroup){
    var scope = $scope
    var delContacts = [];
    scope.repeatEmailOrPhone="";
    scope.submitted = {};
    scope.interacted = function(field,index){
        scope.field_form = field;
        return  field.name.$dirty || field["email_"+index].$dirty || field["phone_"+index].$dirty;
    };

    scope.existedNamesList = [];
    contactGroupSrv.getContactGroup().then(function(result){
        if(result && result.data.data){
            var groups_data = result.data.data;
            scope.existedNamesList = [];
            _.each(groups_data,function(item){
                scope.existedNamesList.push(item.name);  
            });
        }
    });

    function checkSubmitted(formField){
        if(formField.name.$invalid){
            scope.submitted.name = true;
        }
        for(var i=0;i<scope.contactGroupForm.email.length;i++){
            if(formField["email_"+i].$invalid){
                scope.submitted["email_"+i] = true;
            }
        }
        for(var i=0;i<scope.contactGroupForm.phone.length;i++){
            if(formField["phone_"+i].$invalid){
                scope.submitted["phone_"+i] = true;
            }
        }
        for(var i=0;i<scope.contactGroupForm.wechat.length;i++){
            if(formField["wechat_"+i].$invalid){
                scope.submitted["wechat_"+i] = true;
            }
        }
    }
    scope.addContactToGroup = function(type){
        scope.contactGroupForm[type].push({
            type: type,
            value: ""
        });
    };
    scope.addWechatToGroup = function() {
        scope.contactGroupForm['wechat'].push({
            type: "wechat",
            value: "",
            check: "验证昵称",
            disable: false
        });
    };
    scope.delContactOfGroup = function(index,contact,type){
        if(contact.id){
            delContacts.push(contact.id);
        }
        scope.contactGroupForm[type].splice(index,1);
    };

    scope.weChatBind = function() {
        scope.QRModal = $uibModal.open({
            animation: true,
            templateUrl: "js/monitor/alarmManagement/tmpl/QRCode.html",
            controller: "QRCodeCrtl",
            resolve:{
                context:function(){
                    return self;
                }
            }
        });
    }

    scope.checkNickname = function(index, wechat, type) {
        if(wechat.disable) {
            scope.contactGroupForm.wechat[index].value = "";
            scope.contactGroupForm.wechat[index].check = "验证昵称";
            scope.contactGroupForm.wechat[index].disable = false;
        }else {
            var wechatName = angular.copy(wechat.value);
            var wechatIndex = angular.copy(index);
            scope.nicknameModal = $uibModal.open({
                animation: true,
                templateUrl: "js/monitor/alarmManagement/tmpl/nicknameCheck.html",
                controller: "nicknameCheckCtrl",
                resolve: {
                    wechatName: function() {
                        return wechatName;
                    },
                    wechatIndex: function() {
                        return wechatIndex;
                    },
                    setWechatInfo: function() {
                        return setWechatInfo;
                    }
                }
            });
        }
    }

    function setWechatInfo(index, wechatData) {
        scope.contactGroupForm.wechat[index].value = wechatData;
        scope.contactGroupForm.wechat[index].check = "取消验证";
        scope.contactGroupForm.wechat[index].disable = true;
    }

  
    scope.groupModalTitle =  $translate.instant("aws.monitor.alarmModule.newCreatContactGroup");
    scope.contactGroupForm = {
        name:"",
        email:[{
            type:"email",
            value:""
        }],
        phone:[{
            type:"phone",
            value:""
        }],
        wechat:[{
            type:"wechat",
            value:"",
            check: "验证昵称",
            disable: false
        }]
    };
    scope.contactGroupConfirm = function(formField){
        if(formField.$valid){
            scope.contactGroupForm.wechat.map(item => {
                if(!item.disable) {
                    item.value = "";
                }
            });
            scope.contactGroupForm.contacts = scope.contactGroupForm.email.concat(scope.contactGroupForm.phone).concat(scope.contactGroupForm.wechat);
            contactGroupSrv.addContactGroup(scope.contactGroupForm).then(function(){
                $uibModalInstance.close();   
                initCountGroup()
            });
        }else{
            checkSubmitted(formField);
        }
    };
}])