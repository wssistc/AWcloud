import "./labelManagementSrv";

var labelModule = angular.module("labelModule", ["labelApi"])
.controller("labelCtrl", ['$routeParams','$scope', '$rootScope', '$location', 'labelSrv', '$translate','GLOBAL_CONFIG','TableCom','modalCom',
function($routeParams,$scope, $rootScope, $location, labelSrv, $translate,GLOBAL_CONFIG,TableCom,modalCom) {
    var self = $scope ;
    self.checkFirst = {
        checked: false,
        items: {}
    };
    self.label_search={};

    var initlabel = function(){
        //  labelSrv.getlabel().then(function(res){
        //     if(res&&angular.isArray(res.data)){
        //         self.labelData = res.data.map(function(item){
        //             item.searchTerm = [item.name,item.specs.write_bytes_sec?item.specs.write_bytes_sec/1024 + "MB/s":"",item.specs.read_bytes_sec?item.specs.read_bytes_sec/1024 + "MB/s":"",item.specs.read_iops_sec? item.specs.read_iops_sec + "个" :"",item.specs.write_iops_sec?item.specs.write_iops_sec + "个":""].join(",")
        //             return item
        //         })
        //         TableCom.init(self,'labelTable',self.labelData,'id',GLOBAL_CONFIG.PAGESIZE,'checkFirst');
        //     }
        // })
    }
    initlabel();

    self.applyGlobalSearch = function() {
        self.labelTable.filter({
            searchTerm: self.label_search.globalSearchTerm
        });
    };
    self.refreshlabel = function(){
        initlabel()
    }

    // 监听主页的单选框，控制操作按钮的状态
    self.$watch(function() {
        return self.checkFirst.items;//监控checkbox
    }, function(val) {
        self.checkedItems = [];
        var arr=[];
        for(var i in self.checkFirst.items){
            arr.push(self.checkFirst.items[i])
        }
        self.checkRelation = null;
        self.checkRelieve = null;
        if(val && arr.length>=0){
            for(var key in val){
                if(val[key]){
                    self.labelData.forEach(item=>{
                        if(item.id==key){
                            self.checkedItems.push(item);
                        }
                    })
                }
            }
        }
        if(self.checkedItems.length==1){  
            
        }else if(self.checkedItems.length>1){
            
        }else if(self.checkedItems.length==0){
            
        }
    },true);

    //详情
     let id = $location.search().id;
     self.$watch(function(){
         return $location.search().id
     },function(ne,old){
         if(!ne||ne==old) return
        //  self.netFirewallData.forEach(function(item){
        //      if(item.id == ne){
        //          self.netfirewallDetail  = item
        //      }
        //  })
     })

    // 新建
    self.createLabel = function() {
        var createLabel = modalCom.init('labelManagement.html',"createLabelCtrl",{refresh:function(){return initlabel},context:function(){return self}})
    };
    // 编辑
    self.editLabel = function() {
        var editLabel = modalCom.init('labelManagement.html',"editLabelCtrl",{refresh:function(){return initlabel},context:function(){return self}})
    };
    // 删除
    self.delLabel= function(checkedItems) {
        var content = {
            target: "delLabel",
            msg: "<span>" + $translate.instant("aws.labelManagement.confirmDelLable") + "</span>",
            data: checkedItems
        };
        self.$emit("delete", content);
    };
    self.$on("delLabel", function(e,data) {
        let obj_id=[]
        data.forEach(function(item){
            obj_id.push(item.id)
        })
        // labelSrv.dellabel(obj_id.join(",")).then(function(res){
        //     initlabel()
        // })
    });  
}])
.controller("createLabelCtrl", ["$scope", "$rootScope","$translate","GLOBAL_CONFIG","$uibModalInstance","labelSrv","refresh",
function($scope, $rootScope, $translate, GLOBAL_CONFIG,$uibModalInstance,labelSrv,refresh) {
    var self = $scope;
    self.createOrEditLabel = $translate.instant("aws.labelManagement.createLabel")
    self.ConfirmLabel = function(field){
        self.submitInValid=false;
            if(field.$valid){
                labelSrv.createlabel(postData).then(function(res){
                    refresh()
                })
                $uibModalInstance.dismiss('cancel');
            }else{
                self.submitInValid=true;
            }
        }
}])
.controller("editLabelCtrl", ["$scope", "$rootScope","$translate","GLOBAL_CONFIG","$uibModalInstance","labelSrv","refresh",
function($scope, $rootScope, $translate, GLOBAL_CONFIG,$uibModalInstance,labelSrv,refresh) {
    var self = $scope;
    self.createOrEditLabel = $translate.instant("aws.labelManagement.editLabel")
    self.ConfirmLabel = function(field){
        self.submitInValid=false;
            if(field.$valid){
                labelSrv.createlabel(postData).then(function(res){
                    refresh()
                })
                $uibModalInstance.dismiss('cancel');
            }else{
                self.submitInValid=true;
            }
        }
}])

