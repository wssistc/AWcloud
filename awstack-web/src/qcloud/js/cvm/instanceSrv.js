angular.module("instanceSrvModule", [])
    .service("instanceSrv", ["$http",function($http) {
        var static_url = "http://192.168.137.51:8080/awcloud-qcloud";
        return {
            /*vm*/
            getVms: function(options) {
                return $http({
                    method: "POST",
                    url: static_url + "/v1/vms/DescribeInstances",
                    data:{
                        "params": options
                    }  
                });
            },
            DescribeInstancesAll:function(options){
                return $http({
                    method: "POST",
                    url: static_url + "/v1/vms/DescribeInstancesAll",
                    data:{
                        "params": options
                    }  
                });
            },
            getVmsInfo: function(region,id) {
                return $http({
                    method: "POST",
                    url: static_url + "/v1/vms/DescribeInstances/",
                    data:{
                        "params": {
                            "Region": region,
                            "instanceIds":[id]
                        }
                    }  
                });
            },
            getVmsPolling:function(region,ids){
                return $http({
                    method: "POST",
                    url: static_url + "/v1/vms/InstancesPolling/",
                    data:{
                        "params": {
                            "Region": region,
                            "instanceIds":ids
                        }
                    }  
                });
            },
            UpdateInstanceAttributes:function(options){
                return $http({
                    method: "POST",
                    url: static_url + "/v1/vms/UpdateInstanceAttributes",
                    data:{
                        "params": options
                    }  
                });
            },
            bootVms: function(options) {
                return $http({
                    method: "POST",
                    url: static_url + "/v1/vms/StartInstances",
                    data:{
                        "params": options
                    }  
                });
            },
            shutoffVms: function(options) {
                return $http({
                    method: "POST",
                    url: static_url + "/v1/vms/StopInstances",
                    data:{
                        "params": options
                    }  
                });
            },
            rebootVms: function(options) {
                return $http({
                    method: "POST",
                    url: static_url + "/v1/vms/RestartInstances",
                    data:{
                        "params": options
                    }  
                });
            },
            destoryVms:function(options){
                return $http({
                    method: "POST",
                    url: static_url + "/v1/vms/ReturnInstance",
                    data:{
                        "params": options
                    }  
                });
            },
            rename: function(options) {
                return $http({
                    method: "POST",
                    url: static_url + "/v1/vms/ModifyInstanceAttributes",
                    data:{
                        "params":options
                    }  
                });
            },
            repassword: function(options) {
                return $http({
                    method: "POST",
                    url: static_url + "/v1/vms/ResetInstancePassword",
                    data:{
                        "params": options
                    }  
                });
            },
            ResizeInstance:function(options){
                return $http({
                    method: "POST",
                    url: static_url + "/v1/vms/ResizeInstance",
                    data:{
                        "params": options
                    }  
                });
            },
            ResizeInstanceHour:function(options){
                return $http({
                    method: "POST",
                    url: static_url + "/v1/vms/ResizeInstanceHour",
                    data:{
                        "params": options
                    }  
                });
            },
            ResetInstances:function(options){
                return $http({
                    method: "POST",
                    url: static_url + "/v1/vms/ResetInstances",
                    data:{
                        "params": options
                    }  
                });
            },
            UpdateInstanceBandwidth:function(options){
                return $http({
                    method: "POST",
                    url: static_url + "/v1/vms/UpdateInstanceBandwidth",
                    data:{
                        "params": options
                    }  
                });
            },
            UpdateInstanceBandwidthHour:function(options){
                return $http({
                    method: "POST",
                    url: static_url + "/v1/vms/UpdateInstanceBandwidthHour",
                    data:{
                        "params": options
                    }  
                });
            },
            /*image*/
            getImage:function(options){
                return $http({
                    method: "POST",
                    url: static_url + "/v1/image/DescribeImages",
                    data:{
                        "params": options
                    }  
                });
            },
            mkImg:function(options){
                return $http({
                    method: "POST",
                    url: static_url + "/v1/image/CreateImage",
                    data:{
                        "params": options
                    }  
                });
            },
            DeleteImages:function(options){
                return $http({
                    method: "POST",
                    url: static_url + "/v1/image/DeleteImages",
                    data:{
                        "params": options
                    }  
                });
            },
            DescribeMarketImages:function(options){
                return $http({
                    method: "POST",
                    url: static_url + "/v1/vms/DescribeMarketImages",
                    data:{
                        "params": options
                    }  
                });
            },

            /*network*/
            getNetwork:function(options){
                return $http({
                    method: "POST",
                    url: static_url + "/v1/vpc/list",
                    data:{
                        "params": options
                    }  
                });
            },
            getSubnet:function(options){
                return $http({
                    method: "POST",
                    url: static_url + "/v1/subnet/list",
                    data:{
                        "params": options
                    }  
                });
            },
            DescribeEip:function(options){
                return $http({
                    method: "POST",
                    url: static_url + "/v1/vms/DescribeEip",
                    data:{
                        "params": options
                    }  
                });
            },
            DeleteEip:function(options){
                return $http({
                    method: "POST",
                    url: static_url + "/v1/vms/DeleteEip",
                    data:{
                        "params": options
                    }  
                });
            },
            EipUnBindInstance:function(options){
                return $http({
                    method: "POST",
                    url: static_url + "/v1/vms/EipUnBindInstance",
                    data:{
                        "params": options
                    }  
                });
            },
            getPrice:function(options){
                return $http({
                    method: "POST",
                    url: static_url + "/v1/vms/InquiryInstancePrice",
                    data:{
                        "params": options
                    }  
                });
            },
            getPriceHour:function(options){
                return $http({
                    method: "POST",
                    url: static_url + "/v1/vms/InquiryInstancePriceHour",
                    data:{
                        "params": options
                    }  
                });
            },
            addVm:function(options){
                return $http({
                    method: "POST",
                    url: static_url + "/v1/vms/RunInstances",
                    data:{
                        "params": options
                    }  
                });
            },
            addVmHour:function(options){
                return $http({
                    method: "POST",
                    url: static_url + "/v1/vms/RunInstancesHour",
                    data:{
                        "params": options
                    }  
                });
            },
            /*keypair*/
            getKeypairs:function(options) {
                return $http({
                    method: "POST",
                    url: static_url + "/v1/keypair/DescribeKeyPairs",
                    data:{
                        "params": options
                    }  
                });
            },
            loadKeypair:function(options){
                return $http({
                    method: "POST",
                    url: static_url + "/v1/keypair/manageInstanceKey",
                    data:{
                        "params": options
                    }  
                });
            },
            addKeypair:function(options){
                return $http({
                    method: "POST",
                    url: static_url + "/v1/keypair/CreateKeyPair",
                    data:{
                       "params": options
                    }  
                }); 
            },
            importKeyPair:function(options){
                return $http({
                    method: "POST",
                    url: static_url + "/v1/keypair/ImportKeyPair",
                    data:{
                       "params": options
                    }  
                }); 
            },
            modifyKeypair:function(options){
                return $http({
                    method: "POST",
                    url: static_url + "/v1/keypair/ModifyKeyPair",
                    data:{
                       "params": options
                    }  
                }); 
            },
            deleteKeypair:function(options){
                return $http({
                    method: "POST",
                    url: static_url + "/v1/keypair/DeleteKeyPair",
                    data:{
                       "params": options
                    }  
                });
            },
            BindInstanceKey:function(options){
                return $http({
                    method: "POST",
                    url: static_url + "/v1/keypair/BindInstanceKey",
                    data:{
                       "params": options
                    }  
                });
            },
            UnBindInstanceKey:function(options){
                return $http({
                    method: "POST",
                    url: static_url + "/v1/keypair/UnBindInstanceKey",
                    data:{
                       "params": options
                    }  
                });
            },
            checkKeypairBindStatus:function(options){
                return $http({
                    method: "POST",
                    url: static_url + "/v1/vms/checkKeypairBindStatus",
                    data:{
                       "params": options
                    }  
                });
            },
            /*SecurityGroups*/
            getSecurityGroups:function(options){
                return $http({
                    method: "POST",
                    url: static_url + "/v1/SecurityGroup/DescribeSecurityGroups",
                    data:{
                       "params": options
                    }  
                });
            },
            CreateSecurityGroup:function(options){
                return $http({
                    method: "POST",
                    url: static_url + "/v1/SecurityGroup/CreateSecurityGroup",
                    data:{
                       "params": options
                    }  
                });
            },
            instancesOfSecurityGroup:function(options){
                return $http({
                    method: "POST",
                    url: static_url + "/v1/SecurityGroup/DescribeInstancesOfSecurityGroup",
                    data:{
                       "params": options
                    }  
                });
            },
            ModifySecurityGroupsOfInstance:function(options){
                return $http({
                    method: "POST",
                    url: static_url + "/v1/SecurityGroup/ModifySecurityGroupsOfInstance",
                    data:{
                       "params": options
                    }  
                });
            },
            DescribeSecurityGroupPolicy:function(options){
                return $http({
                    method: "POST",
                    url: static_url + "/v1/SecurityGroup/DescribeSecurityGroupPolicy",
                    data:{
                       "params": options
                    }  
                });
            },
            DeleteSecurityGroup:function(options){
                return $http({
                    method: "POST",
                    url: static_url + "/v1/SecurityGroup/DeleteSecurityGroup",
                    data:{
                       "params": options
                    }  
                });
            },
            lbpriceModifySecurityGroupAttributes:function(options){
                return $http({
                    method: "POST",
                    url: static_url + "/v1/SecurityGroup/ModifySecurityGroupAttributes",
                    data:{
                       "params": options
                    }  
                });
            },
            ModifySecurityGroupPolicy:function(options){
                return $http({
                    method: "POST",
                    url: static_url + "/v1/SecurityGroup/ModifySecurityGroupPolicy",
                    data:{
                       "params": options
                    }  
                });
            },
            DescribeSecurityGroupsOfInstance:function(options){
                return $http({
                    method: "POST",
                    url: static_url + "/v1/SecurityGroup/DescribeSecurityGroupsOfInstance",
                    data:{
                       "params": options
                    }  
                });
            },
            getRegionList:function(){
                /*let deferred = $q.defer();*/
                let regionList = [
                    {
                        regionName:"广州",
                        region:"gz",
                        distribute:"华南地区"
                    },
                    {
                        regionName:"上海",
                        region:"sh",
                        distribute:"华东地区"
                    },
                    /*{
                        regionName:"上海金融",
                        region:"shjr",
                        distribute:"华东地区"
                    },*/
                    {
                        regionName:"北京",
                        region:"bj",
                        distribute:"华北地区"
                    }/*,
                    {
                        regionName:"香港",
                        region:"hk",
                        distribute:"东南亚地区",
                    },
                    {
                        regionName:"新加坡",
                        region:"sg",
                        distribute:"东南亚地区"
                    },
                    {
                        regionName:"多伦多",
                        region:"ca",
                        distribute:"北美地区"
                    }*/
                ];
                regionList.map(item => item.info = item.regionName + "(" + item.distribute +")")
                return regionList;
            },
            manageInstanceKey:function(options){
                return $http({
                    method: "POST",
                    url: static_url + "/v1/keypair/manageInstanceKey",
                    data:{
                       "params": options
                    }  
                });
            },
            getToken: function() {
                var getTokenData = {
                    "secret":"O0c1Sc+uL9JJNGxFjJFkCStHlLbN4VnHU55mzV11uGCiKXDBHfClD/sOSreoz5ttVa8HN43wsYyHa+AZUeDSfIMZibrnB4Z5BdhogRDvJtynuJxwHvVhY92Qw6TeM7KCLf8gMLdt+EyeWvwTEVt1HMumB25aze6Nbm3qXqS4PJg="
                };
                return $http({
                    method: "POST",
                    url: "http://192.168.138.41:9080/awcloud-qcloud/exclude/login",
                    data:getTokenData
                });       
        }

        };
    }]);