import "./qcloudInstancesSrv";

angular.module("qcloudInstancesModule", ["ngSanitize", "ngTable", "ui.bootstrap.tpls", "qcloudInstancesSrv", "ui.select"])
    .controller("qcloudInstancesCtrl", function($scope, $rootScope, NgTableParams, $uibModal, qcloudInstancesSrv, $translate, checkedSrv,GLOBAL_CONFIG,$interval,alertSrv) {
        var self = $scope;
        self.activeEnable = true;
        self.stopEnable = true;
        self.errorEnable = true;
        self.createEnable = false;

        var q_regions = [
            {name:"北京",value:"bj"},
            {name:"上海",value:"sh"},
            {name:"广州",value:"gz"},
            {name:"香港地区",value:"hk"}
        ];
        self.regions = {
            options:q_regions,
            selected:q_regions[0].value
        };
        self.selectedRegion = self.regions.selected;
        localStorage.q_Region = self.selectedRegion;
        


        self.changeRegion = function(region){
            localStorage.q_Region = region;
            getInstance(region);
        };

        function getInstance(region) {
            qcloudInstancesSrv.getData({region:region}).then(function(result) {
                result?self.loadData = true:"";
                if (result.data) {
                    var resultdata = angular.fromJson(result.data);
                    if (resultdata.length > 0) {
                        successFunc(resultdata);
                    }
                }                    
            });
        }

        function successFunc(data) {
            self.tabledata = data;
            self.tableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: self.tabledata });
            self.applyGlobalSearch = function() {
                var term = self.globalSearchTerm;
                self.tableParams.filter({ $: term });
            };

            var tableId = "unInstanceId";
            checkedSrv.checkDo(self, data, tableId);
            self.$watch(function() {
                return self.checkedItems;
            }, function(value) {
                if (value.length == 1) {
                    self.removefloatIpDis = false;
                    if (value[0].wanIpSet) {
                        self.removefloatIpDis = true;
                    }
                    if (value[0].lanIp) {
                        value[0].lanIp.length > 1 ? self.removefixIpDis = false : self.removefixIpDis = true;
                        value[0].lanIp.length != value[0].wanIpSet.length ? self.bindfloatingIps = false : self.bindfloatingIps = true;
                    }
                }
                var activeChk = 0,
                    stopChk = 0,
                    errorChk = 0;
                value.map(function(item) {
                    activeChk += (item.status === 2) || 0;
                    stopChk += (item.status === 4) || 0;
                    errorChk += (item.status === 1) || 0;
                });
                var values = [activeChk, stopChk, errorChk];
                if (values[0] != 0 && values[1] == 0 && values[2] == 0) {
                    self.activeEnable = false; //开机可操作
                    self.activeIsEnable = false; //开机可操作
                    if (values[0] == 1) { //开机(选中一条可操作) 
                        self.addfixIp = false; // eg:开机时，选中一条添加网卡
                        self.conIsEnable = false; // 开机时，打开控制台
                    } else {
                        self.addfixIp = true; //开机选中两条不可操作：不可添加网卡，打开控制台，绑定公网IP，解除公网IP绑定
                        self.conIsEnable = true;
                        self.removefixIpDis = true;
                        self.bindfloatingIps = true;
                        self.removefloatIpDis = true;
                    }
                } else if (values[0] == 0 && values[1] != 0 && values[2] == 0) {
                    self.stopEnable = false; //关机允许的操作
                    if (values[1] == 1) { //关机选中一条不允许的操作：允许添加网卡，绑定公网IP，解除绑定公网IP
                        self.removefixIpDis = true;
                        self.bindfloatingIps = true;
                        self.addfixIp = true;
                    } else {
                        self.bindfloatingIps = true;
                    }
                } else if (values[0] == 0 && values[1] == 0 && values[2] != 0) {
                    // self.errorEnable = false; //错误状态不一样时不可操作
                    self.conIsEnable = true;
                    self.activeEnable = true;
                    self.stopEnable = true;
                    self.errorEnable = true;
                    self.activeIsEnable = true;
                    self.addfixIp = true;
                    self.removefixIpDis = true;
                    self.bindfloatingIps = true;
                    self.removefloatIpDis = true;
                    self.isDisabled = true;
                } else {
                    self.conIsEnable = true; //多选状态不一样时不可操作
                    self.activeEnable = true;
                    self.stopEnable = true;
                    self.errorEnable = true;
                    self.activeIsEnable = true;
                    self.addfixIp = true;
                    self.removefixIpDis = true;
                    self.bindfloatingIps = true;
                    self.removefloatIpDis = true;
                }
            });
        }
        $scope.$on("getDetail", function(event, value) {
            qcloudInstancesSrv.getServerDetail(value).then(function(result) {
                var resultdata = eval(result.data);
                $scope.qcloudinsConfigData = resultdata;
            });
        });
        $rootScope.$on("refreshInstance", function() {
            getInstance();
        });
        //新建云主机
        self.newInstance = function() {
            /*var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: "addinstances.html",
                controller: "qcloudInstancesModelCtrl",
                resolve: {
                    items: function() {
                        return self.items;
                    }
                }
            });*/
        };
        //选中多个
        self.chkSome = function() {
            var chkGroup = [];
            var InsIds = {};
            var postData = { params: InsIds };
            _.forEach(self.tableParams.data, function(group) {
                if (self.checkboxes.items[group.unInstanceId]) {
                    chkGroup.push(group.unInstanceId);
                }
            });
            var i;
            for (i = 1; i <= chkGroup.length; i++) {
                InsIds["instanceIds." + i] = chkGroup[i - 1];
            }
            return postData;
        };
        //轮询
        self.intervalFunc = function(v,m,n){
          //_.forEach(self.chkSome().params,function(item,index){
            _.forEach(self.chkSome().params,function(item){
            var continuePost = $interval(function(){
                qcloudInstancesSrv.getServerDetail(item).then(function(result){
                    result.data = eval(result.data);
                    _.forEach(self.tableParams.data,function(val){
                      if(val.unInstanceId == item){
                       val.status =  result.data[0].status;
                       alertSrv.set(item, val.instanceName+" "+n, "building");
                       $rootScope.$broadcast("alert-building",n);
                      }
                    });
                    if(result.data[0].status == v){
                        _.forEach(self.tableParams.data,function(val){
                          if(val.unInstanceId == item){
                           val.status =  result.data[0].status;
                            alertSrv.set(item, val.instanceName+" "+m, "success",5000);
                          }
                        });
                        self.checkboxes.items = {};
                        $interval.cancel(continuePost);
                        continuePost = undefined;
                    }else if(result.data[0].status == 1){
                        //val.status =  result[0].data.status;
                        result.msg = 1;
                        alertSrv.set(item, "失败", "errot",5000);
                        self.checkboxes.items = {};
                        $interval.cancel(continuePost);
                        continuePost = undefined;
                        }
                    });
            },5000);
          });
        };
        //开启虚拟机
        self.startServer = function() {
            var content = {
                target: "startServer",
                msg: "<span>您确定要启动虚拟机吗？</span>",
                type: "info",
                btnType: "btn-primary"
            };
            self.$emit("delete", content);
        };
        self.$on("startServer", function() {
            qcloudInstancesSrv.startServer(self.chkSome()).then(function() {
                //getInstance();
            });
            self.intervalFunc(2,"开机成功","开机中");
        });
        //关闭虚拟机
        self.stopServer = function() {
            var content = {
                target: "stopServer",
                msg: "<span>您确定要关机吗？</span>",
                type: "warning",
                btnType: "btn-warning"
            };
            self.$emit("delete", content);
        };
        self.$on("stopServer", function() {
            qcloudInstancesSrv.stopServer(self.chkSome()).then(function() {
                //getInstance();
            });
            self.intervalFunc(4,"关机成功","关机中");
        });
        //删除虚拟机
        self.delSever = function() {
            var content = {
                target: "delInstance",
                msg: "<span>您确定要删除吗？</span>"
            };
            self.$emit("delete", content);
        };
        self.$on("delInstance", function() {
            qcloudInstancesSrv.delServer(self.chkSome()).then(function() {
                getInstance();
            });
        });
        //重启虚拟机
        self.reboot = function() {
            var content = {
                target: "rebootIns",
                msg: "<span>您确定要重启吗？</span>",
                type: "info",
                btnType: "btn-primary"
            };
            self.$emit("delete", content);
        };
        self.$on("rebootIns", function() {
            qcloudInstancesSrv.rebootServer(self.chkSome()).then(function() {
                getInstance();
            });
        });
        //强制关机
        self.shutdown = function() {
            var content = {
                target: "shutdownIns",
                msg: "<span>您确定要强制关机吗？</span>",
                type: "warning",
                btnType: "btn-warning"
            };
            self.$emit("delete", content);
        };
        self.$on("shutdownIns", function() {
            var shutdwParams = self.chkSome();
            shutdwParams.params.forceStop = 1;
            qcloudInstancesSrv.stopServer(shutdwParams).then(function() {
                //getInstance();
            });
            self.intervalFunc("stopped","关机成功");
        });

        //编辑主机名
        self.editSever = function(editData) {
            var scope = $rootScope.$new();
            var modal_os_edit = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: "update-os-edit.html",
                scope: scope
            });
            scope.hostName = editData.instanceName;
            scope.unInsId = editData.unInstanceId;
            return modal_os_edit.result.then(function(hostName) {
                var edSerParams = {
                    instanceName: hostName,
                    instanceId: scope.unInsId
                };
                var postData = { params: edSerParams };
                qcloudInstancesSrv.editServer(postData).then(function() {
                    getInstance();
                });
            });
        };
        // //添加网卡和移除网卡
        // self.updateNetwork = function(type, editData) {
        //   var scope = $rootScope.$new();
        //   var modal_os_net = $uibModal.open({
        //     animation: $scope.animationsEnabled,
        //     templateUrl: "update-os-net.html",
        //     scope: scope
        //   });
        //   scope.upNet = {};
        //   switch (type) {
        //   case "add":
        //     scope.netTitle = "添加网卡";
        //     //获取该项目下的网卡
        //     qcloudinstancesSrv.getProjectNetwork().then(function(result) {
        //       scope.netList = result.data;
        //       scope.upNet.selected = result.data[10].id;
        //     });
        //     return modal_os_net.result.then(function(upNet) {
        //       var postData = {
        //         networkid: upNet
        //       };
        //       instancesSrv.addNetwork(editData.uid, postData).then(function() {
        //         getInstance();
        //       });
        //     });
        //   case "remove":
        //     scope.netTitle = "移除网卡";
        //     instancesSrv.getServerNetwork(editData.uid).then(function(result) {
        //       scope.netList = [];
        //       result.data.map(function(item) {
        //         scope.netList.push({
        //           id: item.port_id,
        //           name: item.fixed_ips[0].ip_address
        //         });
        //       });
        //       scope.upNet.selected = scope.netList[0].id;
        //     });
        //     return modal_os_net.result.then(function(upNet) {
        //       var postData = {
        //         portid: upNet
        //       };
        //       instancesSrv.removeNetwork(editData.uid, postData).then(function() {
        //         getInstance();
        //       });
        //     });
        //   }
        // };
        //   //绑定公网IP和解除公网IP绑定
        // self.bindFloatingIp = function(type, editData) {
        //   var scope = $rootScope.$new();
        //   var modal_os_ip = $uibModal.open({
        //     animation: $scope.animationsEnabled,
        //     templateUrl: "update-os-FloatingIp.html",
        //     scope: scope
        //   });
        //   scope.floatingIp = {};
        //   switch (type) {
        //   case "bind":
        //     scope.floatTitle = "绑定公网IP";
        //     //获取所有的公网IP
        //     qcloudInstancesSrv.getAllfloalingIp().then(function(result) {
        //       var resultdata = result.data
        //       scope.IpsList = resultdata;
        //       scope.floatingIp.floatingip_id = resultdata[0].eipId;
        //     });
        //     //获取选中云主机下的网卡
        //     qcloudInstancesSrv.getOsNet(editData.unInstanceId).then(function(result) {
        //       scope.osNetList = [];
        //       result.data.map(function(item) {
        //         scope.osNetList.push({
        //           id: item.port_id,
        //           name: editData.name + ":" + item.fixed_ips[0].ip_address
        //         });
        //       });
        //       scope.floatingIp.port_id = scope.osNetList[0].id;
        //     });
        //     return modal_os_ip.result.then(function(fip) {
        //       //与后台交互
        //       instancesSrv.bind_floatingip(fip).then(function() {
        //         getInstance();
        //       });
        //     });
        //   case "relieve":
        //     scope.floatTitle = "解除公网IP绑定";
        //     scope.hideips = true;
        //     //获取选中云主机下绑定的公网IP
        //     instancesSrv.osInterfaceFips(editData.uid).then(function(result) {
        //       scope.osNetList = result.data;
        //       scope.floatingIp.port_id = result.data[0].id;
        //     });
        //     return modal_os_ip.result.then(function(fip) {
        //       var postData = {
        //         floatingip_id: fip.port_id
        //       };
        //       instancesSrv.relieve_floatingip(postData).then(function() {
        //         getInstance();
        //       });
        //     });
        //   }
        // };


        getInstance(self.selectedRegion);
    })
    .controller("qcloudInstancesModelCtrl", function($scope, $rootScope, qcloudInstancesSrv, $uibModalInstance) {
    //.controller("qcloudInstancesModelCtrl", function($scope, $rootScope, qcloudInstancesSrv, $uibModalInstance, items, $translate) {
        var self = $scope;
        self.allList = [];
        self.options = {
            disabled: true,
            img: "public",
            arch: "x86_64",
            cpu_mem: "1",
            creatBy: "isImage",
            cpu: 1,
            mem: "0.5G"
        };
        self.image = {};
        self.arch = {};
        self.os = {};
        self.network = {};
        self.keypairs = {};
        self.securities = {};
        self.setting_tip = [];
        self.conf = {};
        var imgType = [{
            text: "公有",
            tag: "public",
            value: 2
        }, {
            text: "私有",
            tag: "private",
            value: 1
        }];
        var framework = [{
            text: "x86_64",
            value: "x86_64"
        }];

        self.vm = {
            imgType: imgType,
            framework: framework
        };
        self.osType = [];
        self.archType = [];
        self.images2 = [];
        self.chooseCpuMem = function(data) {
            self.options.cpu_mem = data.id;
            self.options.cpu = data.vcpus;
            self.options.mem = data.ram / 1024 + "G";
        };

        self.choosen = function(data) {
            self.options.img = data.tag;

            setOSType();
            setArchType();
            setImage2();
        };
        self.framework = function(data) {
            self.options.arch = data.value;
            setOSType();
            setArchType();
            setImage2();
        };
        self.os_changed = function() {
            setOSType();
            setArchType();
            setImage2();
        };

        function getImage() {
        //function getImage(is_public = true) {
            return self.allList.filter(img => img.imageType === 2);
        }

        function getOSType(is_public = true) {
            return getImage(is_public).reduce((list, img) => {
                img.osName !== "" && list.indexOf(img.osName) === -1 && list.push(img.osName);
                return list;
            }, []).map(osName => ({ type: osName }));
        }

        function setOSType() {
            self.osType.splice(0, self.osType.length);
            self.osType.push.apply(self.osType, getOSType(self.options.img === "public"));
            //self.image.selected = self.image.selected || self.osType[0];
            self.image.selected = self.osType[0] || "";

        }

        function setArchType() {
            self.archType.splice(0, self.archType.length);
            self.archType.push.apply(self.archType, getArchType(
                self.options.img === "public",
                self.image.selected.type,
                self.options.arch
            ));

        }

        function getArchType(is_public = true /*, os_type = "", arch_type = ""*/ ) {
            return getImage(is_public).reduce((list, img) => {
                img.arch !== "" && list.indexOf(img.arch) === -1 && list.push(img.arch);
                return list;
            }, []);
        }

        function getImage2(is_public = true, os_type = "") {
            return getImage(is_public)
                .filter(img => img.osName === os_type)
                .filter(img => img.imageName !== "");
        }

        function setImage2() {
            self.images2.splice(0, self.images2.length);
            self.images2.push.apply(self.images2, getImage2(
                self.options.img === "public",
                self.image.selected.type
            ));
            self.images2.length == 0 ? self.arch.selected = "" : self.arch.selected = self.images2[0].unImageId;

        }

        qcloudInstancesSrv.getImages(imgType[0].value).then(function(result) {
            //var test=[{os:'centoS',name:'123',arch:'x86_64','imageUid':'1',"is_public":true},{os:'win7',name:'234',arch:'x86_64','imageUid':'1',"is_public":true}]
            var imagedata = eval(result.data);
            self.allList.splice(0, self.allList.length);
            self.allList.push.apply(self.allList, imagedata);
            setOSType();
            // setArchType();
            setImage2();
            self.options.disabled = false;
            self.osList = self.os[self.options.img];
        });
        $scope.$watch(function() {
            return self.image.selected;
        }, function() {
            //console.log(value);
        });
        $scope.cancel = function() {
            $uibModalInstance.dismiss("cancel");
        };

        self.create = function() {
            var postData = {
                name: self.unInstanceId+"<br>"+self.instanceName,
                count: self.hostNum,
                admin_pass: self.admin_pass || "",
                network_id: self.network.selected,
                keypair_id: self.keypairs.selected || "",
                use_local: self.use_local || true,
                flavor: self.conf.selected ? self.conf.selected.id : self.options.cpu_mem,
                image_id: self.arch.selected,
                security_id: self.securities.selected || ""
            };
            $uibModalInstance.close();
            qcloudInstancesSrv.createServer(postData).then(function() {
                $rootScope.$broadcast("refreshInstance");
            });
        };

        self.choseImg = function() {

        };
        // //获取网络数据
        // instancesSrv.getProjectNetwork().then(function(result) {
        //   self.networkList = result.data;
        //   self.network.selected = result.data[0].id;
        // });

        // //获取密钥对数据
        // instancesSrv.getKeypairs().then(function(result) {
        //   self.keypairsList = result.data;
        // });

        // //
        // //获取防火墙数据
        // instancesSrv.getSecurity().then(function(result) {
        //   self.securityList = result.data;
        // });

        // //获取内存数据
        // instancesSrv.getFlavors().then(function(result) {
        //   self.flavorHighList = [];
        //   self.flavorNormalList = [];
        //   _.forEach(result.data, function(val) {
        //     if (val.name != "m1.tiny" && val.name != "m1.small" && val.name != "m1.medium") {
        //       val.text = $translate.instant("aws.instances.conf.pretip")+val.vcpus+$translate.instant("aws.instances.conf.memtip") + (val.ram/1024).toFixed(2) + $translate.instant("aws.instances.conf.endtip");
        //       self.flavorHighList.push(val);
        //     } else {
        //       val.tip = $translate.instant("aws.instances.conf." + val.name);
        //       val.name = $translate.instant("aws.instances.confName." + val.name);
        //       self.flavorNormalList.push(val);
        //     }
        //   });
        // });
    });
