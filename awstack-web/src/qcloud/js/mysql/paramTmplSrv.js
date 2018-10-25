
var paramTmplSrvModule = angular.module("paramTmplSrvModule",[]);
paramTmplSrvModule.service("paramTmplSrv",["$http",function($http){
    var static_url = "http://192.168.138.41:9080/awcloud-qcloud/v1";
    
    return {
        queryParamTmplList:function(options){
            return $http({
                method: "POST",
                url: static_url + "/cdb/paramtmpllist",
                data:options
            })
        },
        createParamTmpl:function(options){
            return $http({
                method: "POST",
                url: static_url + "/cdb/createparamtmpl",
                data:options
            })
        },
        queryParamTmplDetail:function(options){
            return $http({
                method: "POST",
                url: static_url + "/cdb/paramtmpldetail",
                data:options
            })
        },
        modifyParamTmpl:function(options){
            return $http({
                method: "POST",
                url: static_url + "/cdb/modifyparamtmpl",
                data:options
            })
        },
        deleteParamTmpl:function(options){
            return $http({
                method: "POST",
                url: static_url + "/cdb/delparamtmpl",
                data:options
            })
        },
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
        ]
        
    }

}])
