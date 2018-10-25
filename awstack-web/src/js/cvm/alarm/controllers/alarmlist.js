alarmListCtrl.$inject=["$scope", "$rootScope","$uibModal","NgTableParams","checkedSrv","alarmService"];
export function alarmListCtrl($scope, $rootScope,$uibModal,NgTableParams,checkedSrv,alarmService){
    var self=$scope;
    function table_list(data){
        data.forEach((x)=>{
            x.detail={};
        })
        self.tableParams = new NgTableParams({ count: 6 }, { counts: [], dataset: data });
        checkedSrv.checkDo(self, data, "id");
        self.$watch(function(){
            return self.checkedItems
        },function(value){
            if(value.length==0){
                self.showDetail=false;
                self.detailActive=0;
            }
        })
    }
    function get_alarm(){
        alarmService.getAlarms().then(function(result){
            if(result && result.data){
                self.table_data=result.data;
                table_list(result.data)
            }
        });
    }
    self.look_detail=function(obj){
        self.table_data.forEach((x)=>{
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
    //tab切换函数
    self.selectIndex=function(page){
        self.detailActive=page;
        //详情列表里的table默认不选中所有
        if(page==0){
            get_detail();
        }
    }

    function show_actived_true(){
        self.table_data.forEach((x)=>{
            if(x.actived){
                self.select_alarm_baseinfo_show=x.detail.baseinfo;
            }
        })
    }
    function add_detail_baseinfo(id,data){
        self.table_data.forEach((x)=>{
            if(x.id==id){
                x.detail.baseinfo=data;
            }
            if(x.actived){
                self.select_alarm_baseinfo_show=x.detail.baseinfo;
            }
        });
       // show_actived_true();
    }
    function get_detail(){
        alarmService.getAlarmDetail(self.detail_obj.id).then(function(result){
            if(result && result.data){
                self.select_alarm_baseinfo=result.data;
                add_detail_baseinfo(self.detail_obj.id,self.select_alarm_baseinfo);
            }
        })
    }

    //创建告警自动触发任务
    self.newAlarm = function(type,editData) {
        $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "js/cvm/alarm/tmpl/createAlarm.html",
            controller: "createAlarmCtrl",
            resolve: {
                /*get_cluster_list: function() {
                    return get_cluster_list
                },
                type: function(){
                    return type 
                },
                editData: function(){
                    return editData
                }*/
            }
        });
    };
}
