import "./gradeSrv";

angular.module("gradeModule", ["ngSanitize", "ngTable", "ui.bootstrap", "ui.select", "gradeSrv","wsModule"])
    .controller("gradeCtrl", ["$scope", "$rootScope", "$uibModal", "$translate", "NgTableParams", "checkedSrv", "gradesrv", "GLOBAL_CONFIG","$routeParams","$location","$timeout",function($scope, $rootScope, $uibModal, $translate, NgTableParams, checkedSrv, gradesrv, GLOBAL_CONFIG,$routeParams,$location,$timeout) {
        var self = $scope;
        var zoneHostsTableData = [];
        var currentModal = null;
        function openPackModal(resolve){
            if(!currentModal){
                currentModal = $uibModal.open({
                    templateUrl: "installer.html",
                    controller: "checkStatusCtrl",
                    resolve:resolve
                    /*resolve:{
                        packInfo:function(){
                            return pack;
                        },
                        refresh:function(){
                            return init;
                        }
                    }*/
                })
                currentModal.closed.then(function(res){
                    currentModal = null;
                })
            }
            
        }
        //上传更新包
        self.updatePatch = function() {
            $uibModal.open({
                templateUrl: "update.html",
                controller: "updatePatchCtrl"
            })
        }
        gradesrv.currentPack = {
            PackId:null,//当前安装的升级包id
            Percent:'0%',//安装进度百分比
            PackJobIdList:[],//升级包所有job的list
            getJobIdList:[],//已安装job的list
            globalDisabled:false,//升级时设置为true，用来控制升级按钮是否可点
            data:null
        };
        self.checkClickBtn=true;
        function onMessages(event,data){
            self.checkClickBtn=data
            self.$apply()
        };
        self.$on('clickplatbtn',onMessages)
        //检查更新
        var updateStatusTimeOut=null;
        self.checkSaasStatus = function() {
            self.checkUpdateStatus = true;
            clearTimeout(updateStatusTimeOut)
            updateStatusTimeOut=setTimeout(function(){
                self.checkUpdateStatus = false;
            },60000);

            var updating = false;

            gradesrv.currentPack.PackId = null;
            gradesrv.currentPack.Percent = '0%';
            gradesrv.currentPack.PackJobIdList = [];
            gradesrv.currentPack.getJobIdList = [];
            gradesrv.currentPack.globalDisabled = false;
            gradesrv.currentPack.data = null;


            for(let i=0;i<self.cacheData.length;i++){
                if(self.cacheData[i].status<5){
                    gradesrv.GradeDetail(self.cacheData[i].taskId).then(function(pack){
                        if(pack&&pack.data){
                            gradesrv.currentPack.data = pack.data.updatePack;
                            if(pack.data.status==5){
                                gradesrv.currentPack.data.status = 'success';
                                gradesrv.currentPack.Percent = '100%';
                            }else if(pack.data.status<5){
                                gradesrv.currentPack.globalDisabled = true;
                                gradesrv.currentPack.data.status = 'update';
                                gradesrv.currentPack.PackId =  pack.data.updatePack.update_pack_id,//当前安装的升级包id
                                
                                pack.data.updatePack.update_pack_jobs.forEach(item=>{
                                    gradesrv.currentPack.PackJobIdList.push(item.job_id);
                                })
                                pack.data.customMessages.forEach(item=>{
                                    if(JSON.parse(item).output&&JSON.parse(JSON.parse(item).output).job_id){
                                        gradesrv.currentPack.getJobIdList.push(JSON.parse(JSON.parse(item).output).job_id)
                                    }
                                })

                                gradesrv.currentPack.Percent = ((gradesrv.currentPack.getJobIdList.length/gradesrv.currentPack.PackJobIdList.length)*100).toFixed()+"%";
                            }
                            gradesrv.checkSaas()
                        }
                    })
                    updating = true; 
                    break;
                }
            };
            if(!updating){
                gradesrv.checkSaas()
            }
            
        }

        //接收更新包列表
        self.$on('getlistpack',listPack);
        function listPack(event,data){
            self.checkUpdateStatus = false;
            if(data){
                var resolve = {
                    packInfo:function(){
                        return data;
                    },
                    refresh:function(){
                        return init;
                    }
                }
                openPackModal(resolve);
                /*$uibModal.open({
                    templateUrl: "installer.html",
                    controller: "checkStatusCtrl",
                    resolve:
                })*/
            }
        }

        //
        self.reGrade = function(item){
            var data = {
                regionKey:item.regionKey,
                bobId:item.bobId
            }
            gradesrv.reTryGrade(data).then(function(res){
                if(res&&res.data){
                    var pack = {
                        version:res.data.sys_version,
                        packList:res.data.packs,
                        type:"regrade"
                    }
                    /*$uibModal.open({
                        templateUrl: "installer.html",
                        controller: "checkStatusCtrl",
                        resolve:{
                            packInfo:function(){
                                return pack;
                            },
                            refresh:function(){
                                return init;
                            }
                        }
                    })*/
                    var resolve = {
                        packInfo:function(){
                            return pack;
                        },
                        refresh:function(){
                            return init;
                        }
                    }
                    openPackModal(resolve);
                }
            })
        }

        //
        self.checkIn = function(item){
            var data = item.taskId
            gradesrv.GradeDetail(data).then(function(res){
                if(res&&res.data){
                    console.log(JSON.parse(res.data.customMessages[2]))
                    var pack = {
                        version:res.data.sysPreVersion,
                        packList:[res.data.updatePack],
                        type:"detail"
                    }
                    /*$uibModal.open({
                        templateUrl: "installer.html",
                        controller: "checkStatusCtrl",
                        resolve:{
                            packInfo:function(){
                                return pack;
                            },
                            refresh:function(){
                                return init;
                            }
                        }
                    })*/
                    var resolve = {
                        packInfo:function(){
                            return pack;
                        },
                        refresh:function(){
                            return init;
                        }
                    }
                    openPackModal(resolve);
                }
            })
        }

        function init() {
            gradesrv.getHistoryList().then(function(res) {
                if(res&&res.data){
                    var data = res.data;
                    self.cacheData = res.data;
                    self.historyList = data.filter(item=>{
                        switch(item.status){
                            case 5:
                                item.statusAs = $translate.instant("aws.grade.table.status.1");
                                break;
                            case 6:
                                item.statusAs = $translate.instant("aws.grade.table.status.2");
                                break;
                            default:
                                item.statusAs = $translate.instant("aws.grade.table.status.3");
                        }
                        return item.status>=5;
                    });
                    self.tableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: self.historyList });
                    var checkPack=false;
                    for(var i=0;i<self.cacheData.length;i++){
                        if(self.cacheData[i].status<5){
                            checkPack = true;
                            break;
                        }
                    }
                    if($routeParams&&$routeParams.update==1&&!currentModal){
                        self.checkSaasStatus();
                        $location.search({});
                    }else if(checkPack==true){
                        if(!currentModal){
                            self.checkSaasStatus();
                        }
                    }

                }
                
            })
        }
        init()

    }])
    .controller("updatePatchCtrl", ["$scope","gradesrv","alertSrv","$timeout",function($scope,gradesrv,alertSrv,$timeout) {
        var self = $scope;
        function onMessage(event,data){
                //推送成功后重新获取密码
                if(data){
                    gradesrv.getSftpInfo().then(function(res){//调用获取密码api
                        if(res&&res.data){
                            self.sftp = res.data;
                        }
                    }).finally(function(){//api调用完成，关闭loading
                        self.showLoading = false;
                        self.getRandomPasswordResult=false;
                    });
                //推送失败后操作    
                }else{
                    //关闭loading 显示获取密码失败
                    self.showLoading = false;
                    self.getRandomPasswordResult=true;
                    $timeout(function(){
                        self.getRandomPasswordResult=false;
                    },2000);
                }
        };
        self.$on('setsftppasswd',onMessage)

        function init(){
            gradesrv.getSftpInfo().then(function(res){
                if(res&&res.data){
                    if(res.data.mangerIp){
                        self.sftp = res.data;
                    }else{
                        self.showLoading = true;
                        gradesrv.getSftpPassword();
                    }
                }
            })
        };


        function generate_passsword() {
            var letters = [];
            var lowercase = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
            var uppercase = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
            var numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
            var symbols = [']', '[', '?', '/', '~', '#', '`', '!', '@', '$', '^', '&', '*', '+', '=', '|', ':', ';', '>'];
            var randomstring = '';
            letters = letters.concat(lowercase, uppercase, numbers, symbols)
            for (var i = 0; i < 12; i++) {
                var rlet = Math.floor(Math.random() * letters.length);
                randomstring += letters[rlet];
            }
            return randomstring;
        };

        self.getRandomPassword = function() {
            self.showLoading = true;
            self.copytext = 'Copy';
            gradesrv.getSftpPassword();
            $timeout(function(){
                self.showLoading = false;
            },60000);
        };
        self.showSoft = function() {
            self.downloadPatch = !self.downloadPatch;
        }
        init();
    }])
    .controller("checkStatusCtrl", ["$scope","packInfo","gradesrv","refresh", function($scope,packInfo,gradesrv,refresh) {
        var self = $scope;

        self.currentPack = gradesrv.currentPack;


        
        

        //升级包列表数据
        
        self.updateList = packInfo.packList;
        if(gradesrv.currentPack.data){
            if(gradesrv.currentPack.data.status=='success'){
                self.updateList.unshift(gradesrv.currentPack.data);
            }else{
                self.updateList.forEach(item=>{
                    if(item.update_pack_id==gradesrv.currentPack.data.update_pack_id){
                        item.status = gradesrv.currentPack.data.status;
                    }
                }) 
            }
        }
        self.num = self.updateList.length;
        self.packType = packInfo.type;

        if(self.num===0){//没有升级包，则显示无数据并返回
            self.noPatch = true;
            return;
        }

        function tabData(datas){
            var handData=datas.split("-");
            if(datas.split("-")[2]){
                var sData=datas.split("-")[2];
                var sY = sData.substring(0,4);
                var sM = sData.substring(4,6);
                var sD = sData.substring(6);
                var newData = new Date(sY,(sM-1),sD,0,0,0);
                var oldData = new Date(sY,0,1,0,0,0,0);
                var timer = (newData.getTime() - oldData.getTime())/(1000*86400)+1;
                var dataTime =sData.substring(2,4)+timer;
                var name=handData[0]+"-"+dataTime;
            }else{
                var name=handData[0];
            }
            return name;
        }
        //当前底层版本
        self.sys_version = packInfo.version;
        self.sys_versionCon = tabData(self.sys_version);
        //当前云管版本
        gradesrv.GetSaasVersion().then(function(res){
            if(res&&res.data){
                self.saas_version = res.data.curVersion;
                self.saas_versionCon = tabData(self.saas_version);
            }
        })
        self.hide = false;//是否隐藏升级包列表
        //self.infoShow = false;是否显示升级包详情

        //判断升级包是否可用，如果当前底层版本在sys_version.pre数组里面才允许升级，否则显示提示信息
        self.updateList.forEach(item=>{
            item.update_platform_versions.sys_versionCon = tabData(item.update_platform_versions.sys_version.post);
            if(item.update_platform_versions.sys_version.pre.indexOf(packInfo.version)>-1){
                item.canUp = true;
            }
        })
        
        //更多详情
        self.readMore = function(item){
            self.updateInfo = null;
            self.infoShow = true;
            self.hide = true;
            self.updateInfo = item;//赋值当前选中的升级包数据
            self.updateInfo.update_platform_versions.sys_versionCon=tabData(item.update_platform_versions.sys_version.post);
            self.updateInfo.update_platform_versions.saas_versionCon=tabData(item.update_platform_versions.saas_version.post);
        }
        //返回升级列表页
        self.cancel = function(){
            self.updateInfo = null;
            self.infoShow = false;//是否隐藏升级包列表
            self.hide = false;//是否显示升级包详情
        }

        //升级
        self.update = function(pack){
            var data = {
                pack:pack,
                sysVersion:self.sys_version
            };
            self.currentPack.globalDisabled = true;
            self.currentPack.Percent = '0%';
            gradesrv.sassGrade(data).then(function(){
                refresh();
            }).catch(function(){
                self.currentPack.globalDisabled = false;
            })

            self.currentPack.PackJobIdList = [];
            self.currentPack.getJobIdList = [];
            pack.status = 'update';

            self.currentPack.PackId = pack.update_pack_id;

            pack.update_pack_jobs.forEach(item=>{
                self.currentPack.PackJobIdList.push(item.job_id);
            })
        }
        self.$on("runPackJob",runPackProgress);
        function runPackProgress(event,data){
            switch(data){
                case 1:
                    //success
                    self.updateList.forEach(item=>{
                        if(item.update_pack_id==self.currentPack.PackId){
                            item.status = 'success';
                        }
                    })
                    self.currentPack.Percent = '100%';
                    self.currentPack.globalDisabled = false;//升级按钮可用
                    self.currentPack.PackId = null;//当前安装的升级包id设为null
                    self.currentPack.PackJobIdList = [];
                    self.currentPack.getJobIdList = [];
                    refresh();
                    break;
                case 2:
                    //fail
                    self.updateList.forEach(item=>{
                        if(item.update_pack_id==self.currentPack.PackId){
                            item.status = 'fail';
                        }
                    })
                    self.currentPack.Percent = '100%';
                    self.currentPack.globalDisabled = false;//升级按钮可用
                    self.currentPack.PackId = null;//当前安装的升级包id设为null
                    self.currentPack.PackJobIdList = [];
                    self.currentPack.getJobIdList = [];
                    refresh();
                    break;
                default:
                    //ing,data=job_id 如果job_id在升级包所有job的list中并且不在已安装job的list中
                    if(self.currentPack.PackJobIdList.indexOf(data)>-1&&self.currentPack.getJobIdList.indexOf(data)<0){
                        self.currentPack.getJobIdList.push(data);
                        self.currentPack.Percent = ((self.currentPack.getJobIdList.length/self.currentPack.PackJobIdList.length)*100).toFixed()+"%";
                        console.log(self.currentPack.Percent)
                    }
            }
            self.$apply();
        }
        var updateList = [
            {
                "update_pack_jobs": [
                    {            
                        "name": "升级前检查",
                        "playbook": "/var/lib/update_pack/active_update/ansible/pre.yml",
                        "job_id": "d80acd44-213a-4970-a28c-50be81cf9f48",
                        "extra_var_files": [
                            "/var/lib/update_pack/active_update/metadata.yaml"
                        ]          
                    },
                    {
                        "name": "备份数据",
                        "playbook": "/var/lib/update_pack/active_update/ansible/backup.yml",
                        "job_id": "d80acd44-213a-4970-a28c-50be81cf9f48",
                        "extra_var_files": [
                            "/var/lib/update_pack/active_update/metadata.yaml"
                        ]
                    },
                    {
                        "name": "分发文件",
                        "playbook": "/var/lib/update_pack/active_update/ansible/deliver.yml",
                        "job_id": "4c9a6118-664b-4c7b-b6bc-86c2c52519c9",
                        "extra_var_files": [
                        "/var/lib/update_pack/active_update/metadata.yaml"
                        ]
                    },
                    {
                        "name": "升级组件",
                        "playbook": "/var/lib/update_pack/active_update/ansible/update_components.yml",
                        "job_id": "50d581fb-b550-460a-9b53-1c9b2f3e7145",
                        "no_way_out": true,
                        "extra_var_files": [
                        "/var/lib/update_pack/active_update/metadata.yaml"
                        ]
                    },
                    {
                        "name": "升级后检查",
                        "playbook": "/var/lib/update_pack/active_update/ansible/post.yml",
                        "job_id": "262f3f92-4f72-452f-8a6a-e8d4dd256e22",
                        "extra_var_files": [
                        "/var/lib/update_pack/active_update/metadata.yaml"
                        ]
                    }
                ],
                "update_pack_title": "测试更新包",
                "update_pack_id":"afffff",
                "pack_file_name": "test_pack.tar",
                "pack_file_size": 1495,
                "update_link": "http://wiki.corp.awcloud.com/pages/viewpage.action?pageId=39256525",
                "update_auto_rollback": false,
                "update_pack_description": "测试更新包，加入了新功能和一些修订",
                "update_type": "increment",
                "update_components": [
                    {
                        "component_id": "docker_images",
                        "name": "Docker镜像",
                        "description": "更新Nova镜像解决XXX问题。"
                    }, 
                    {
                        "component_id": "os_rpms",
                        "name": "系统RPM包",
                        "description": "更新XXX包解决XXX问题。"
                    }, 
                    {
                        "component_id": "ansible_scripts",
                        "name": "自动化运维脚本",
                        "description": "更新运维脚本，加入XXX功能。"
                    },
                    {
                        "component_id": "saas",
                        "name": "SaaS",
                        "description": "增加XXX功能。修复YYY问题。"
                    }
                ],
                "update_platform_versions": {
                    "saas_version": {
                        "pre": [
                        "20160501-1830"
                        ],
                        "post": "20170501-1830"
                    },
                    "sys_version": {
                        "pre": [
                            "20160501-1830"
                        ],
                        "post": "20170501-1830"
                    }
                },
                "update_manual_rollback": true      
            },
            {
                "update_pack_jobs": [
                    {            
                        "name": "升级前检查",
                        "playbook": "/var/lib/update_pack/active_update/ansible/pre.yml",
                        "job_id": "d80acd44-213a-4970-a28c-50be81cf9f48",
                        "extra_var_files": [
                            "/var/lib/update_pack/active_update/metadata.yaml"
                        ]          
                    },
                    {
                        "name": "备份数据",
                        "playbook": "/var/lib/update_pack/active_update/ansible/backup.yml",
                        "job_id": "d80acd44-213a-4970-a28c-50be81cf9f48",
                        "extra_var_files": [
                            "/var/lib/update_pack/active_update/metadata.yaml"
                        ]
                    },
                    {
                        "name": "分发文件",
                        "playbook": "/var/lib/update_pack/active_update/ansible/deliver.yml",
                        "job_id": "4c9a6118-664b-4c7b-b6bc-86c2c52519c9",
                        "extra_var_files": [
                        "/var/lib/update_pack/active_update/metadata.yaml"
                        ]
                    },
                    {
                        "name": "升级组件",
                        "playbook": "/var/lib/update_pack/active_update/ansible/update_components.yml",
                        "job_id": "50d581fb-b550-460a-9b53-1c9b2f3e7145",
                        "no_way_out": true,
                        "extra_var_files": [
                        "/var/lib/update_pack/active_update/metadata.yaml"
                        ]
                    },
                    {
                        "name": "升级后检查",
                        "playbook": "/var/lib/update_pack/active_update/ansible/post.yml",
                        "job_id": "262f3f92-4f72-452f-8a6a-e8d4dd256e22",
                        "extra_var_files": [
                        "/var/lib/update_pack/active_update/metadata.yaml"
                        ]
                    }
                ],
                "update_pack_title": "测试更新包",
                "pack_file_name": "test_pack.tar",
                "pack_file_size": 1495,
                "update_link": "http://wiki.corp.awcloud.com/pages/viewpage.action?pageId=39256525",
                "update_auto_rollback": false,
                "update_pack_description": "测试更新包，加入了新功能和一些修订",
                "update_type": "increment",
                "update_components": [
                    {
                        "component_id": "docker_images",
                        "name": "Docker镜像",
                        "description": "更新Nova镜像解决XXX问题。"
                    }, 
                    {
                        "component_id": "os_rpms",
                        "name": "系统RPM包",
                        "description": "更新XXX包解决XXX问题。"
                    }, 
                    {
                        "component_id": "ansible_scripts",
                        "name": "自动化运维脚本",
                        "description": "更新运维脚本，加入XXX功能。"
                    },
                    {
                        "component_id": "saas",
                        "name": "SaaS",
                        "description": "增加XXX功能。修复YYY问题。"
                    }
                ],
                "update_platform_versions": {
                    "saas_version": {
                        "pre": [
                        "20160501-1830"
                        ],
                        "post": "20170501-1830"
                    },
                    "sys_version": {
                        "pre": [
                            "20160501-1830"
                        ],
                        "post": "20170501-1830"
                    }
                },
                "update_manual_rollback": true      
            }
        ];
        
        /*for(let i=0;i<3;i++){
            self.updateList.push(updateList[0])
        }*/
    }]);
