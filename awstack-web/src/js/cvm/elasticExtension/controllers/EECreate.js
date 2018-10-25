eeCreateCtrl.$inject=["$scope", "$rootScope","$uibModal","$uibModalInstance","EEService","clusterService","get_cluster_list","type","editData"];
export function eeCreateCtrl($scope, $rootScope,$uibModal,$uibModalInstance,EEService,clusterService,get_cluster_list,type,editData){
    var self=$scope;
    //区分编辑和新建页面
    if(type=='new'){
        self.showNew=true;
        self.cluster_title="创建弹性伸缩集群";
    }else if(type=='edit'){
        self.showNew=false;
        self.cluster_title="修改弹性伸缩集群";
    }
    self.submitted = false;
    self.interacted = function(field) {
        return self.submitted || field.$dirty;
    };
    self.newObj={};
    
    if(type=='edit'){
        self.newObj.name=editData.name;
        self.newObj.minSize=editData.minHostSize;
        self.newObj.maxSize=editData.maxHostSize;
        self.newObj.defaultCooldown=editData.defaultCoolingTime;
        self.loadbalancerId=editData.loadbalancerId;
    }
    
    //获取负载均衡器的监听器
    function get_resorce_pool(obj){
        self.newObj.resource_pool_list=[];
        self.newObj.resource_pool={};
        EEService.getPools(obj.id).then(function(result){
            if(result&&result.data){
                self.newObj.resource_pool_list=result.data;
            }
            if(self.newObj.resource_pool_list.length>0){
                self.newObj.resource_pool=self.newObj.resource_pool_list[0];
                self.havePool=true;
                self.noPool=false;
            }else{
                self.havePool=false;
                self.noPool=true;
            }

        });
        self.change_pool=function(obj){
            self.newObj.resource_pool=obj;
        };
    }   
    
    //获取负载均衡器
    function get_balancers(){
        self.newObj.load_balancer_list=[];
        self.newObj.load_balancer={};
        EEService.getBalancers().then(function(result){
            if(result&&result.data){
                self.newObj.load_balancer_list=result.data;
            }
            if(self.newObj.load_balancer_list.length>0){
                self.newObj.load_balancer=self.newObj.load_balancer_list[0];
                self.haveLB=true;
                get_resorce_pool(self.newObj.load_balancer_list[0]);
            }else{
                self.noLB=true;
            }
        });
    }
    get_balancers();
    
    self.change_load_balance=function(obj){
        self.newObj.load_balancer=obj;
        get_resorce_pool(obj);
    };


    //获取移出策略
    function get_stragegy(){
        self.newObj.remove_strategy_list=[];
        if(type=='edit'){
            //初始化策略
            self.newObj.remove_strategy={
                "id":editData.removeStrategyId,
                "name":editData.removeStrategyName
            }
        }else if(type=='new'){
            self.newObj.remove_strategy={};
        }
        
        EEService.getStragegy().then(function(result){
            if(result&&result.data){
                self.newObj.remove_strategy_list=result.data;
                if(self.newObj.remove_strategy_list.length>0){
                    if(type=='new'){
                        self.newObj.remove_strategy=self.newObj.remove_strategy_list[0];
                    }
                    self.haveStragegy=true;
                }
            }
        });
    }
    self.change_strategy=function(obj){
        self.newObj.remove_strategy=obj;
    };
    get_stragegy();

    function open_tip_html(obj){
        $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "tip_create.html",
            controller: "tipCtrl",
            resolve: {
                 new_obj:function(){
                     return obj
                 },
                 get_cluster_list:function(){
                    return get_cluster_list
                 }
             }
        });
    }
    self.canSecond=true;
    self.creteEE=function(){
        if (self.eeForm.$valid) {
            $uibModalInstance.close();
            self.canSecond=false;
            let postData={};
            postData.cluster={};
            postData.name=self.newObj.name;
            postData.cluster.defaultCooldown=Number(self.newObj.defaultCooldown);
            postData.cluster.hostDeleteStrategyId=self.newObj.remove_strategy.id;
            postData.cluster.maxSize=Number(self.newObj.maxSize);
            postData.cluster.minSize=Number(self.newObj.minSize);
            if(type=='new'){
                postData.cluster.loadbalancerId=self.newObj.load_balancer.id;
                postData.cluster.loadbalancerPoolId=self.newObj.resource_pool.id;
                postData.statusId=1;
                clusterService.createCluster(postData).then(function(result){
                    if(result && result.data){
                        //创建完成打开提醒创建伸缩配置的页面
                        open_tip_html(result.data);
                        get_cluster_list();
                    }
                });
                
            }else{
                clusterService.updateCluster(editData.id,postData).then(function(result){
                    get_cluster_list();
                });
            }
            
            
            
            
        }else{
            self.submitted = true;
        }
        
    };
    self.canCreate=function(){
        if(type=='new'){
            return self.canSecond && self.haveStragegy &&  self.haveLB && self.havePool
        }else{
            return self.canSecond && self.haveStragegy 
        }
    };
    

}