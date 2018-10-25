eeCreateConCtrl.$inject=["$scope", "$rootScope","$translate","$uibModalInstance","EEService","detail_obj","configService","get_config","deefaultInuse"];
export function eeCreateConCtrl($scope, $rootScope,$translate,$uibModalInstance,EEService,detail_obj,configService,get_config,deefaultInuse){
    
    var self=$scope;
    self.submitted = false;
    self.interacted = function(field) {
        return self.submitted || field.$dirty;
    };
    self.newObj={};
    self.newObj.weight=50;
    //安全组
    function get_security_groups(){
        self.newObj.securityGroup_list=[];
        self.newObj.securityGroup={};
        EEService.getSecurityGroups().then(function(result){
            if(result&&result.data){
                self.newObj.securityGroup_list=result.data;
            }
            if(self.newObj.securityGroup_list.length>0){
                self.newObj.securityGroup=self.newObj.securityGroup_list[0];
                self.hava_security_group=true;
            }
        });
        self.change_security_group=function(obj){
            self.newObj.securityGroup=obj;
        };
    }
    
    
    get_security_groups();


    //flavor
    function get_flavors(){
        self.newObj.flavor_list=[];
        self.newObj.flavor={};
        EEService.getFlavors().then(function(result){
            if(result&&result.data){
                _.forEach(result.data, function(val) {
                    val.text = val.name + "：" + val.vcpus + $translate.instant("aws.instances.conf.memtip") + (val.ram / 1024).toFixed(1)+"GB ";
                    self.newObj.flavor_list.push(val);
                });
            }
            if(self.newObj.flavor_list.length>0){
                self.newObj.flavor=self.newObj.flavor_list[0];
                self.hava_flavor=true;
            }else{
                self.hava_flavor=false;
            }
        });
        self.change_flavor=function(obj){
            self.newObj.flavor=obj;
        };
    }
    
    get_flavors();

    //image
    function get_images(){
        self.newObj.image_list=[];
        self.newObj.image={};
        EEService.getImages().then(function(result){
            if(result&&result.data){
                result.data.forEach((x)=>{
                    if((x.arch.toLowerCase()==self.newObj.arch.id)&&(x.os_type.toLowerCase()==self.newObj.os_type.id)&&(x.is_public==self.newObj.image_type.id)){
                        self.newObj.image_list.push(x);
                    }
                })
            }
            if(self.newObj.image_list.length>0){
                self.newObj.image=self.newObj.image_list[0];
                self.hava_image=true;
            }else{
                self.hava_image=false;
            }
        });
        self.change_image=function(obj){
            self.newObj.image=obj;
        };
    }
    
    function get_image_conditions(){
        //过滤条件
        self.newObj.arch_list=[{
            name: "x86_64",
            id: "x86_64"
        }, {
            name: "i686",
            id: "i686"
        }];
        self.newObj.arch=self.newObj.arch_list[0];
        self.change_arch=function(obj){
            self.newObj.arch=obj;
            get_images();
        }
        self.newObj.os_type_list=[{
            name: "Windows",
            id: "windows"
        }, {
            name: "Linux",
            id: "linux"
        }];
        self.newObj.os_type=self.newObj.os_type_list[0];
        self.change_os_type=function(obj){
            self.newObj.os_type=obj;
            get_images();
        };
        //image列表字段是is_public ,true为公有，false为私有
        self.newObj.image_type_list=[{
            name: "公有",
            id: true
        }, {
            name: "私有",
            id: false
        }];
        self.newObj.image_type=self.newObj.image_type_list[0];
        self.change_image_type=function(obj){
            self.newObj.image_type=obj;
            get_images();
        }
        get_images();
    }
    get_image_conditions();

    //network
    function get_networks(){
        self.newObj.network_list=[];
        self.newObj.network={};
        EEService.getNetworks().then(function(result){
            if(result&&result.data){
                self.newObj.network_list = _.map(result.data.filter(function(item) {
                    return item.subnets.length; //没有绑定子网的交换机创建云主机时不能使用
                }), function(item) {
                    //创建网络时做了限制：一个交换机只能绑定一个子网，所以这里直接取subnet[0]即可
                    item.net_sub_name = item.name + "---" + item.subnets[0].name + "(" + item.subnets[0].allocationPools[0].start + "~" + item.subnets[0].allocationPools[0].end + ")";
                    return item;
                });
            }
            if(self.newObj.network_list.length>0){
                self.newObj.network=self.newObj.network_list[0];
                self.hava_network=true;
            }else{
                self.hava_network=false;
            }
        });
        self.change_network=function(obj){
            self.newObj.flavor=obj;
        };
    }
    
    get_networks();


    //判断确认按钮是否可以点击
    self.no_double_click=true;
    self.can_confirm=function(){
        return self.hava_network && self.hava_image && self.hava_flavor && self.hava_security_group && self.no_double_click
    };
    self.create=function(){
        if(self.eeFormCon.$valid){
            $uibModalInstance.close();
            self.no_double_click=false;
            console.log(self.newObj)
            let postData=
            {
                "flavorId": self.newObj.flavor.id,
                "imageId": self.newObj.image.imageUid,
                "name": self.newObj.name,
                "networkId": self.newObj.network.id,
                "securityGroupId": self.newObj.securityGroup.id,
                "solutionId": detail_obj.id,
                "weight": self.newObj.weight
            }
            //新建集群时候新建配置默认启用，配置集群列表新建配置默认不启用
            if(deefaultInuse){
                postData.statusId=1;
            }else{
                postData.statusId=2
            }
            configService.createConfig(postData).then(function(result){
                get_config();
            })

        }else{
            self.submitted=true;
        }
    }

}