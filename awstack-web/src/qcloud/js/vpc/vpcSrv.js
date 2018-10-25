
var vpcSrvModule = angular.module("vpcSrvModule",[]);
vpcSrvModule.service("vpcSrv",["$http",function($http){
    var static_url = "http://192.168.138.41:9080/awcloud-qcloud/v1"
    return {
        getVpcList:function(options){
            return $http({
                method: "POST",
                url: static_url + "/vpc/list",
                data: options
            })
        },
        addVpc:function(options){
            return $http({
                method: "POST",
                url: static_url + "/vpc/create",
                data: options
            })
        },
        editVpc:function(options){
            return $http({
                method: "POST",
                url: static_url + "/vpc/modifyattr",
                data: options
            })
        },
        deleteVpc:function(options){
            return $http({
                method: "POST",
                url: static_url + "/vpc/delete",
                data: options
            })
        },
        getVpcDetail:function(options){
            return $http({
                method:"POST",
                url: static_url + "/vpc/info",
                data:options
            })
        },
        vpcTableData:[],
        regionOptions:[
            {   "name":"北京",
                "value":"bj",
                "child":[
                    {"name":"北京一区","value":"800001"}
                ]
            },
            {
                "name":"广州",
                "value":"gz",
                "child":[
                    {"name":"广州二区","value":"100002"},
                    {"name":"广州三区","value":"100003"}
                ]
            },
            {    "name":"上海",
                "value":"sh",
                "child":[
                    {"name":"上海一区","value":"200001"}
                ]
            }
        ],
        zoneOptions:function(){
            return {
                "bj":[{"name":"北京一区","value":"800001"}],
                "sh":[{"name":"上海一区","value":"200001"}],
                "gz":[
                    {"name":"广州二区","value":"100002"},
                    {"name":"广州三区","value":"100003"}
                ]
            }
        }
    }

}])
