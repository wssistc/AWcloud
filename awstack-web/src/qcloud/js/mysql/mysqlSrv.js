angular.module("mysqlsrv", [])
.factory("mysqlSrv", ["$rootScope", "$http","$q",function($rootScope,$http,$q) {
    
    var static_url = "http://192.168.137.44:8080/awcloud-qcloud";
    return {
        getList:function(option){
            var def = {
                "projectId": 0,
                "status.0":0,
                "status.1":1,
                "status.2":4
            }
            var req = {
                params:$.extend(def,option)
            };
            var url="http://192.168.137.44:8080/awcloud-qcloud/v1/cdb/instances";
            if(req.params.Region=='all'){
                delete req.params.Region;
                url="http://192.168.137.44:8080/awcloud-qcloud/v1/cdb/allinstances"
            }
            /*
            response
            uInstanceId(string)-->实例ID，格式如：cdb-c1nl9rpv。
                          与云数据库控制台页面显示的实例ID相同，
                          可用于查询或操作实例。推荐使用
            initFlag(int)   --> 实例初始化标记，可能返回值：0-未初始化；1-已初始化
            cdbInstanceType(int) -->实例类型，可能返回值：1-主实例；2-灾备实例
            cdbInstanceName(string)  -->实例名称          
            cdbInstanceVip(string)  -->实例访问IP          
            cdbInstanceVport(int)  -->实例访问端口          
            cdbWanDomain(string)  -->外网访问域名          
            cdbInstanceDeadlineTime(string)  -->实例到期时间，如实例为按量计费模式，
                                                则此字段值为0000-00-00 00:00:00。
                                                时间格式：yyyy-mm-dd hh:mm:ss  
            cdbTypeSet(string)  -->实例类型的序号
                                   可用此参数购买同类型实例
                                   或者查询同类型实例的续费价格        
            cdbType(string)  -->实例规格描述，如：CUSTOM         
            maxQueryCount(int)  -->实例最大查询次数，单位：次/秒         
            memory(int)  -->实例内存大小，单位：MB         
            volume(int)  -->实例硬盘大小，单位：GB         
            zoneId(int)  -->实例所在可用区ID         
            vpcId(int)  -->实例所在私有网络ID         
            subnetId(int)  -->实例所在私有网络子网ID         
            projectId(int)  -->实例所在项目ID         
            payType(int)  -->实例计费类型，可能返回值：0-包年包月；1-按量计费；2-后付费月结         
            masterInfo(array)  -->主实例信息，如实例是灾备实例或只读实例，则该字段返回其主实例信息，否则返回null         
            roInfo(array)  -->只读实例信息         
            drInfo(array)  -->灾备实例信息         
            */
            /*
            request
            "Region":"gz",            地域[必填]                    
            "projectId":1019871,      项目ID[可选]:如果为空则查询所有项目    
            "offset":0,               记录偏移量[可选]:默认0
            "limit":5,                单次请求返回数量[可选]:默认20,最大100
            "cdbInstanceIds.0":"cdb-9a7bmed9",       实例ID[可选]:精确匹配
            "cdbInstanceVips.0":"10.66.200.239"      访问地址[可选]:精确匹配
            */
            return $http({
               url:url,
                method:"POST",
                data:req
            })
        },
        getProject:function(){
            return $http({
                url:"http://192.168.137.44:8080/awcloud-qcloud/v1/cdb/projects",
                method:"POST",
                data:{
                    params:{}
                }
            });
        },
        getRegionList:function(option){
            let deferred = $q.defer();
            let regionList = [
                {
                    regionName:"广州",
                    region:"gz"
                },
                {
                    regionName:"上海",
                    region:"sh"
                },
                /*{
                    regionName:"上海金融",
                    region:"shjr"
                },*/
                {
                    regionName:"北京",
                    region:"bj"
                }/*,
                {
                    regionName:"香港",
                    region:"hk"
                },
                {
                    regionName:"新加坡",
                    region:"sg"
                },
                {
                    regionName:"多伦多",
                    region:"ca"
                }*/
            ];
            if(option=="all"){
                regionList.unshift({
                    regionName:"全部地域",
                    region:"all"
                })
            };
            return regionList;
        },
        getNetwork:function(option){
            return $http({
                url:"http://192.168.137.44:8080/awcloud-qcloud/v1/cdb/netList",
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        getNetNum:function(option){
            return $http({
                url:"http://192.168.137.44:8080/awcloud-qcloud/v1/cdb/netList",
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        test:function(){
            let deferred = $q.defer();
            $http({
                url:"http://192.168.137.44:8080/awcloud-qcloud/v1/cdb/regions",
                method:"POST",
                data:{
                    params:{
                        "instanceType":"2"
                    }
                }
            }).then(function(res){
                deferred.resolve(res.availableRegion);
            })
            return deferred.promise;
        },
        getProductList:function(option){
            return $http({
                url:"http://192.168.137.44:8080/awcloud-qcloud/v1/cdb/ProductList",
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        createInstan:function(option,payType){
            var url = "http://192.168.137.44:8080/awcloud-qcloud/v1/cdb/CreateCdbMonth";
            if(payType=="hourPay"){
                url = "http://192.168.137.44:8080/awcloud-qcloud/v1/cdb/CreateCdbHour"
            }
            return $http({
                url:url,
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        
        getPrice:function(option,payType){
            var url = "http://192.168.137.44:8080/awcloud-qcloud/v1/cdb/PriceMonth";
            if(payType=="hourPay"){
                url="http://192.168.137.44:8080/awcloud-qcloud/v1/cdb/PriceHour";
            }
            return $http({
                url:url,
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        upgradeCdb:function(option){
            var url = "/v1/cdb/UpgradeCdb";
            return $http({
                url:static_url+url,
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        upgradePrice:function(option){
            var url = "/v1/cdb/UpgradePrice";
            return $http({
                url:static_url+url,
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        getDetail:function(option){
            var url = "/v1/cdb/DescribeCdbInstances";
            return $http({
                url:"http://192.168.137.42:8080/awcloud-qcloud"+url,
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        editName:function(option){
            return $http({
                url:"/awcloud-qcloud/v1/cdb/modifyname",
                method:"POST",
                data:{
                    params:option
                }
            })
        },
        myinit:function(option){
            return $http({
                url:"/awcloud-qcloud/v1/cdb/instanceinit",
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        updateCharset:function(option){
            return $http({
                url:"/awcloud-qcloud/v1/cdb/modifycharset",
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        updatePort:function(option){
            return $http({
                url:"/awcloud-qcloud/v1/cdb/modifyport",
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        openExtrance:function(option){
            return $http({
                url:"/awcloud-qcloud/v1/cdb/openextrance",
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        closeExtrance:function(option){
            return $http({
                url:"/awcloud-qcloud/v1/cdb/closeextrance",
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        renewCdb:function(option){
            return $http({
                url:"/awcloud-qcloud/v1/cdb/RenewCdb",
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        getAccoutList:function(option){
            return $http({
                url:"/awcloud-qcloud/v1/cdb/instance/accountlist",
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        priceMonth:function(option){
            return $http({
                url:"/awcloud-qcloud/v1/cdb/PriceMonth",
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        getPrivileges:function(option){
            return $http({
                url:"/awcloud-qcloud/v1/cdb/instance/privileges",
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        setautorenew:function(option){
            return $http({
                url:"/awcloud-qcloud/v1/cdb/setautorenew",
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        getAllPrivileges:function(option){
            return $http({
                url:"/awcloud-qcloud/v1/cdb/instance/accountavailableprivileges",
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        getDatabase:function(option){
            return $http({
                url:"/awcloud-qcloud/v1/cdb/querydatabases",
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        getDatabaseTable:function(option){
            return $http({
                url:"/awcloud-qcloud/v1/cdb/querydatabasetables",
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        updatePrivileges:function(option){
            return $http({
                url:"/awcloud-qcloud/v1/cdb/instance/modifyprivileges",
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        getParamsList:function(option){
            return $http({
                url:"/awcloud-qcloud/v1/cdb/instance/params",
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        getParamsHistory:function(option){
            return $http({
                url:"/awcloud-qcloud/v1/cdb/instance/paramsmodifyhis",
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        editParams:function(option){
            return $http({
                url:"/awcloud-qcloud/v1/cdb/instance/paramsmodify",
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        Addaccount:function(option){
            return $http({
                url:"/awcloud-qcloud/v1/cdb/instance/addaccount",
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        editPassWord:function(option){
            return $http({
                url:"/awcloud-qcloud/v1/cdb/instance/modifypasswd",
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        getReadList:function(option){
            return $http({
                url:"/awcloud-qcloud/v1/cdb/ReadOnlyInstances",
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        deleteaccout:function(option){
            return $http({
                url:"/awcloud-qcloud/v1/cdb/instance/deleteaccout",
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        editRemarks:function(option){
            return $http({
                url:"/awcloud-qcloud/v1/cdb/instance/modifyremarks",
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        delReadInstan:function(option){
            return $http({
                url:"/awcloud-qcloud/v1/cdb/instanceclose",
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        getRoDetail:function(option){
            return $http({
                url:"/awcloud-qcloud/v1/cdb/DescribeROInstances",
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        getNetNum:function(option){
            return $http({
                url:"/awcloud-qcloud/v1/subnet/info",
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        getAllDB:function(option){
            return $http({
                url:"/awcloud-qcloud/v1/cdb/instance/allschema",
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        getInstanNum:function(option){
            return $http({
                url:"/awcloud-qcloud/v1/cdb/getInstanceNumHour",
                method:"POST",
                data:{
                    params:option
                }
            });
        },
        getDefaultTmplParam:function(options){
            return $http({
                url:"/awcloud-qcloud/v1/cdb/paramtmpldefaultdetail",
                method:"POST",
                data:options
            })
        },
    };

}]);
