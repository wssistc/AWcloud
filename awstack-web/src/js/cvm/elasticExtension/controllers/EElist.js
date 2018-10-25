eeListCtrl.$inject=["$scope", "$rootScope","$uibModal","$translate","NgTableParams","GLOBAL_CONFIG","checkedSrv","EEService","EELogService","configService","clusterService"];
export function eeListCtrl($scope, $rootScope,$uibModal,$translate,NgTableParams,GLOBAL_CONFIG,checkedSrv,EEService,EELogService,configService,clusterService){
    var self=$scope;
    function table_list(data){
       data = data.filter((x)=>{
           return x.statusName!="已删除"
        })
        data.forEach((x)=>{
            x.detail={};
        })
        self.cluster_list=data;
        self.tableParams = new NgTableParams({ count: 6 }, { counts: [], dataset: data });
        checkedSrv.checkDo(self, data, "id","tableParams");
        self.$watch(function() {
            return self.checkedItems;
        }, function(value) {
          if(value.length==0){
            self.showDetail=false;
            self.detailActive=0;
            self.can_del=false;
          }else{
              self.can_del=true;
          }
            if(value.length==1){
                //是否可以编辑
                 self.can_edit=true;
                if(value[0].statusName=='已启用'){
                    self.can_enabled=false;
                    self.can_stop=true;
                }else if(value[0].statusName=='已禁用'){
                    self.can_enabled=true;
                    self.can_stop=false;
                }
            }else{
                self.can_enabled=false;
                self.can_stop=false;
                self.can_edit=false;
            }
        })
    }
    function get_cluster_list(){
        clusterService.getClusterList().then(function(result){
            if(result && result.data){
                self.table_data=result.data;
                table_list(self.table_data);
            }
            result?self.loadData = true:"";
        });
    }
    get_cluster_list();


    //启用and禁用
    self.enable_cluster=function(status,editData){
        let data={
            statusId:status
        }
        clusterService.updateCluster(editData.id,data).then(function(){
            get_cluster_list();
        });
    }
    //删除弹性伸缩
    self.del_cluster = function(data){
        let scope = self.$new()
        let delclusterModal= $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "delcluster.html",
            scope:scope
        });
        
        scope.delName="";
        data.forEach(x=>{
            scope.delName=scope.delName+"、"+x.name
        })
        scope.delName=scope.delName.substring(1,scope.delName.length)
        
        scope.confirmCluster = function(){
            delclusterModal.close();
            let cluster_ids=[];
            _.forEach(data,function(item){
                cluster_ids.push(item.id);
            });
            let delParams = {
                ids: cluster_ids
            };

            clusterService.delClusters(delParams).then(function() { 
                
                get_cluster_list();
            });
        };
        scope.cancelCluster = function() {
            delclusterModal.close();
            self.checkboxes.items={};
        };
    };
    //刷新函数
    self.refresh=function(){
        get_cluster_list();
    }
    //给self.cluter_list中的每个集群添加详情
    function add_detail_baseinfo(id,data){
        self.cluster_list.forEach((x)=>{
            if(x.id==id){
                x.detail.baseinfo=data;
            }
            if(x.actived){
                self.select_cluster_baseinfo_show=x.detail.baseinfo;
            }
        });
    }
    //获取弹性伸缩(方案)的详情信息
    function get_detail(){
        clusterService.getClusterDetail(self.detail_obj.id).then(function(result){
            if(result && result.data){
                self.select_cluster_baseinfo=result.data;
                self.select_cluster_baseinfo.cluster={};
                add_detail_baseinfo(self.detail_obj.id,self.select_cluster_baseinfo);
            }
        })
    }
    //点击弹性伸缩名字查看详情

    self.look_detail=function(obj){
        self.cluster_list.forEach((x)=>{
            if(x.id==obj.id){
                x.actived=true;
            }else{
                x.actived=false;
            }
        });
        //查看的cluster
        self.detail_obj=obj;
        //显示详情列表
        self.showDetail=true;
        self.table_data.forEach((x)=>{
            if(self.checkboxes.items[x.id]){
                self.checkboxes.items[x.id]=false;
            }
        });
      self.checkboxes.items[obj.id]=true;
      //查看的集群变化时，更新详情页面
      if(self.detailActive){
        self.selectIndex(self.detailActive);
      }else{
        self.selectIndex(0);
      }
    }
    self.checkAllClick=function(checked){
      if(self.select_cluster_table_show){
        self.select_cluster_table_show.forEach(item=>item._checked=checked)
      }
    };
    self.checkAll=function(data){
      if(self.select_cluster_table_show && self.select_cluster_table_show.length>0){
        return self.select_cluster_table_show.every(item=>item._checked)
      }
    }
    //判断按钮是否可用
    self.can_remove=function(){
      if(self.select_cluster_table_show){
        return self.select_cluster_table_show.some(item=>{
          return item._checked 
        });
      }
    }
    self.can_del_config=function(){
        return !self.select_cluster_table_show.some(item=>{
          return item._checked && item.statusName=="已启用" 
        });
    }
    //获取instance
     //给self.cluter_list中的每个集群添加云主机详情
    function add_detail_hostinfo(id,data){
        self.cluster_list.forEach((x)=>{
            if(x.clusterId==id){
                x.detail.hostinfo=data;
            }
            if(x.actived){
                //对云主机操作时，从这里取ID,(复选框)
                self.select_cluster_table_show=x.detail.hostinfo;
                self.insTableParams = new NgTableParams({ count: 4 }, { counts: [], dataset: x.detail.hostinfo });
            }
        });
    }
    function get_instance(){
        self.select_cluster_table_show="";
        EEService.getHostList(self.detail_obj.clusterId).then(function(result){
            if(result && result.data){
                result.data.forEach(x=>{
                    x._checked=false;
                });
                //获取云主机用集群的id
                add_detail_hostinfo(self.detail_obj.clusterId,result.data);
            }
        });
    }
    // 删除虚拟机
    self.del_hosts = function(){
        let scope = self.$new()
        let delhostModal= $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "delhost.html",
            scope:scope
        });
        let host_ids=[];
        let host_name=[];
        
        self.select_cluster_table_show.forEach(item=>{
            if(item._checked){
                host_ids.push(item.id);
                host_name.push(item.name)
            } 
        });
        let delParams = {
			ids: host_ids
		};
        scope.delName="";
        host_name.forEach(x=>{
            scope.delName=scope.delName+"、"+x
        })
        scope.delName=scope.delName.substring(1,scope.delName.length);
        scope.confirmHost = function(){
            delhostModal.close();
            EEService.delhosts(delParams).then(function(){
                get_instance();
            })
        };
        scope.cancelHost = function() {
            delhostModal.close();
             self.checkAllClick(false);
        };
    };


    //获取集群的配置
    self.can_select=function(){
        if(self.select_cluster_table_show){
            let data=self.select_cluster_table_show.filter(x=>{
                return x._checked
            })
            if(data.length==1 && data[0].statusName!=="已启用" ){
                return true
            }else{
                return false
            }
            
        }
    }

    function add_detail_configinfo(id,data){
        self.cluster_list.forEach((x)=>{
            if(x.id==id){
                x.detail.configinfo=data;
            }
            if(x.actived){
                //对云主机操作时，从这里取ID,(复选框)
                self.select_cluster_table_show=x.detail.configinfo;
                self.confTableParams = new NgTableParams({ count: 4 }, { counts: [], dataset: x.detail.configinfo });
            }
        });
    }
    function get_config(){
        self.show_config=true;
        self.select_cluster_table_show="";
        configService.getConfigList(self.detail_obj.id).then(function(result){
            if(result&&result.data){
                result.data.forEach(x=>{
                    x._checked=false;
                });
                //获取配置用方案的ID
                add_detail_configinfo(self.detail_obj.id,result.data);
            }
        });
    }
    self.updateConfig=function(){
        let confId;
        self.select_cluster_table_show.forEach(item=>{
            if(item._checked){
                confId=item.id
            } 
        });
        let data={
            statusId:1 //状态1为启用
        }
        configService.updateConfig(confId,data).then(function(result){
            get_config();
        })
    }
    //删除配置
    self.delconf = function(){
        let scope = self.$new()
        let delconfModal= $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "delconfig.html",
            scope:scope
        });
        let conf_ids=[];
        let conf_name=[];
        
        self.select_cluster_table_show.forEach(item=>{
            if(item._checked){
                conf_ids.push(item.id);
                conf_name.push(item.name)
            } 
        });
        let delParams = {
			ids: conf_ids
		};
        scope.delName="";
        conf_name.forEach(x=>{
            scope.delName=scope.delName+"、"+x
        })
        scope.delName=scope.delName.substring(1,scope.delName.length)
        
        scope.confirmConf = function(){
            delconfModal.close();
            configService.delConfigs(delParams).then(function(){
                get_config();
            })
        };
        scope.cancelConf = function() {
            delconfModal.close();
             self.checkAllClick(false);
        };
    };
    //配置列表与详情页面的转换
    
    self.config_detail=function(obj){
        self.show_config=false;
        configService.getConfigDetail(obj.id).then(function(result){
            if(result&&result.data){
                self.selected_conf=result.data;
            }
        });

    };
    self.return_list_page=function(obj){
      self.show_config=true;
    };
    //获取伸缩活动日志
    function add_detail_loginfo(id,data){
        self.cluster_list.forEach((x)=>{
            if(x.id==id){
                x.detail.loginfo=data;
            }
            if(x.actived){
                self.activityTableParams = new NgTableParams({ count: 4 }, { counts: [], dataset: x.detail.loginfo });
            }
        });
    }
    function get_log(){
        self.log_data="";
        EELogService.getLogList(self.detail_obj.clusterId).then(function(result){
            if(result&&result.data){
                self.log_data=result.data;
                add_detail_loginfo(self.detail_obj.id,result.data);
            }
        });
      self.show_log=true;
    }
     self.log_detail=function(obj){
        self.show_log=false;
        EELogService.getLogDetail(obj.id).then(function(result){
            if(result&&result.data){
                self.selected_log=result.data;
                
            }
            
        });
    };
    self.return_log_page=function(){
        self.show_log=true;
    }
    //获取伸缩规则
    function add_detail_ruleinfo(id,data){
        self.cluster_list.forEach((x)=>{
            if(x.id==id){
                x.detail.ruleinfo=data;
            }
            if(x.actived){
                //对云主机操作时，从这里取ID,(复选框)
                self.select_cluster_table_show=x.detail.configinfo;
                self.ruleTableParams = new NgTableParams({ count: 4 }, { counts: [], dataset: x.detail.ruleinfo });
            }
        });
    }
    function get_rules(){
        self.show_rules=true;
        self.select_cluster_table_show="";
        configService.getRuleList(self.detail_obj.id).then(function(result){
            if(result&&result.data){
                result.data.forEach(x=>{
                    x._checked=false;
                });
                add_detail_ruleinfo(self.detail_obj.id,result.data);
            }
        });
    }
    self.rule_detail=function(obj){
        self.show_rules=false;
        configService.getRuleDetail(obj.id).then(function(result){
            if(result&&result.data){
                self.selected_rule=result.data;
            }
        });
    };
    self.return_list_page_rule=function(obj){
         self.show_rules=true;
    }
   
    

    //tab切换函数
    self.selectIndex=function(page){
        self.detailActive=page;
        //详情列表里的table默认不选中所有
        self.new_checkboxes={};
        self.new_checkboxes.checked=false;
        if(page==0){
            get_detail();
        }else if(page==1){
            get_instance();
        }else if(page==2){
            get_log();
        }else if(page==3){
            get_config();
        }else if(page==4){
            get_rules();
        }
    }
    //创建弹性伸缩集群
    self.newEE = function(type,editData) {
        $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "js/cvm/elasticExtension/tmpl/eecreate.html",
            controller: "eeCreateCtrl",
            resolve: {
                get_cluster_list: function() {
                    return get_cluster_list
                },
                type: function(){
                    return type 
                },
                editData: function(){
                    return editData
                }
            }
        });
    };
    //创建弹性伸缩配置
    self.creteEEConfig = function() {
        //$uibModalInstance.close();
        $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "js/cvm/elasticExtension/tmpl/eecreateCon.html",
            controller: "eeCreateConCtrl",
             resolve: {
                 detail_obj:function(){
                     return self.detail_obj
                 },
                 get_config:function(){
                     return get_config
                 },
                 deefaultInuse:function(){
                     false
                 }
             }
        });
    };

    //创建伸缩规则
    self.createRule = function() {
        $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "js/cvm/elasticExtension/tmpl/createRule.html",
            controller: "createRuleCtrl",
             resolve: {
                 detail_obj:function(){
                     return self.detail_obj
                 },
                 get_rules:function(){
                     return get_rules
                 }
             }
        });
    };
}