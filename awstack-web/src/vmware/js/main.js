"use strict";
mainCtrl.$inject = ["$scope","$rootScope","$translate","$http","$location","alertSrv","$routeParams","dataCenterSrv","$route"];
var appUrl = "#";
export default function mainCtrl($scope,$rootScope,$translate,$http,$location,alertSrv,$routeParams,dataCenterSrv,$route){
    let self = $scope;
    
    self.dashAlerts = alertSrv;
    self.sideMenu = [
        /*{
            icon:"icon-aw-internet",
            name:"系统概况",
            url:getUrl("/"),
            current:"systemview"
        },*/
        {
            icon:"icon-aw-data-center1",
            name:"数据中心",
            url:getUrl("/datacenter"),
            current:"datacenter",
            child:[
                /* {
                    icon:"icon-aw-ram",
                    name:"摘要",
                    url:getUrl("/datacenter/overview"),
                    current:"datacenter.overview"
                },*/
               /* {
                    icon:"icon-aw-ram",
                    name:"监控",
                    url:getUrl("/datacenter/monitor"),
                    current:"datacenter.monitor",
                    child:[]
                },
                {
                    icon:"icon-aw-ram",
                    name:"管理",
                    url:getUrl("/datacenter/manage"),
                    current:"datacenter.manage",
                    child:[]
                },*/
                {
                    icon:"icon-aw-ram",
                    name:"相关对象",
                    url:getUrl("/datacenter/objects/cluster"),
                    current:"datacenter.objects.cluster",
                    child:[
                        {
                            icon:"icon-aw-ram",
                            name:"集群",
                            url:getUrl("/datacenter/objects/cluster"),
                            current:"datacenter.objects.cluster",
                        },
                        {
                            icon:"icon-aw-ram",
                            name:"主机",
                            url:getUrl("/datacenter/objects/host"),
                            current:"datacenter.objects.host",
                        },
                        {
                            icon:"icon-aw-ram",
                            name:"虚拟机",
                            url:getUrl("/datacenter/objects/vm"),
                            current:"datacenter.objects.vm",
                        },
                        /*{
                            icon:"icon-aw-ram",
                            name:"虚拟机模板",
                            url:getUrl("/datacenter/objects/vmtmpl"),
                            current:"datacenter.objects.vmtmpl",
                        },
                        {
                            icon:"icon-aw-ram",
                            name:"数据存储",
                            url:getUrl("/datacenter/objects/datastore"),
                            current:"datacenter.objects.datastore",
                        },
                        {
                            icon:"icon-aw-ram",
                            name:"标准网络",
                            url:getUrl("/datacenter/objects/vmnetwork"),
                            current:"datacenter.objects.vmnetwork",
                        },*/
                    ]
                }
            ]
        },
        {
            icon:"icon-aw-cluster",
            name:"集群",
            url:getUrl("/cluster"),
            current:"cluster",
            child:[
                /*{
                    icon:"icon-aw-ram",
                    name:"摘要",
                    url:getUrl("/cluster/overview"),
                    current:"cluster.overview"
                },*/
                {
                    icon:"icon-aw-ram",
                    name:"相关对象",
                    url:getUrl("/cluster/objects/host"),
                    current:"cluster.objects.host",
                    child:[
                        {
                            icon:"icon-aw-ram",
                            name:"主机",
                            url:getUrl("/cluster/objects/host"),
                            current:"cluster.objects.host",
                        },
                        {
                            icon:"icon-aw-ram",
                            name:"虚拟机",
                            url:getUrl("/cluster/objects/vm"),
                            current:"cluster.objects.vm",
                        },
                        /*{
                            icon:"icon-aw-ram",
                            name:"数据存储",
                            url:getUrl("/cluster/objects/datastore"),
                            current:"cluster.objects.datastore",
                        },
                        {
                            icon:"icon-aw-ram",
                            name:"标准网络",
                            url:getUrl("/cluster/objects/vmnetwork"),
                            current:"cluster.objects.vmnetwork",
                        },*/
                    ]
                }
            ]
        },
        {
            icon:"icon-aw-pm",
            name:"主机",
            url:getUrl("/host"),
            current:"host",
            child:[
                /*{
                    icon:"icon-aw-ram",
                    name:"摘要",
                    url:getUrl("/host/overview"),
                    current:"host.overview"
                },*/
                {
                    icon:"icon-aw-ram",
                    name:"相关对象",
                    url:getUrl("/host/objects/vm"),
                    current:"host.objects.vm",
                    child:[
                        {
                            icon:"icon-aw-ram",
                            name:"虚拟机",
                            url:getUrl("/host/objects/vm"),
                            current:"host.objects.vm",
                        },
                        /*{
                            icon:"icon-aw-ram",
                            name:"虚拟机模板",
                            url:getUrl("/host/objects/vmtmpl"),
                            current:"host.objects.vmtmpl",
                        },
                        {
                            icon:"icon-aw-ram",
                            name:"数据存储",
                            url:getUrl("/host/objects/datastore"),
                            current:"host.objects.datastore",
                        },
                        {
                            icon:"icon-aw-ram",
                            name:"标准网络",
                            url:getUrl("/host/objects/vmnetwork"),
                            current:"host.objects.vmnetwork",
                        },*/
                    ]
                }
            ]
        },
        
        {
            icon:"icon-aw-cloud-server",
            name:"虚拟机",
            url:getUrl("/virtualmachine"),
            current:"virtualmachine",
            child:[
                {
                    icon:"icon-aw-ram",
                    name:"摘要",
                    url:getUrl("/virtualmachine/overview"),
                    current:"virtualmachine.overview"
                },
                {
                    icon:"icon-aw-ram",
                    name:"相关对象",
                    url:getUrl("/virtualmachine/objects/snapshots"),
                    current:"virtualmachine.objects.snapshots",
                    child:[
                        {
                            icon:"icon-aw-ram",
                            name:"快照",
                            url:getUrl("/virtualmachine/objects/snapshots"),
                            current:"virtualmachine.objects.snapshots",
                        }
                    ]
                }
            ]
        }
    ]; 
    self.$on("$routeChangeSuccess",function(e,cur,old){
        ActiveMenu(e,cur,self);
        self.TAG = localStorage.TAG;
        if(cur&&cur.originalPath){
            var value = cur.originalPath.split("/")[1];
            if(value==="datacenter"){
                self.TAG = localStorage.DCTAG;
            }else if(value==="host"){
                self.TAG = localStorage.TAG;
            }else if(value==="cluster"){
                self.TAG=localStorage.CLUTAG;
            }
        }
    });
    self.showCont = function(e, cont) {
        self.showDel = true;
        self.delCont = cont.msg;
        self.ContType = cont.type || "danger";
        self.btnType = cont.btnType || "btn-danger";
        self.notDel = cont.notDel;
        self.confirm = function() {
            self.showDel = false;
            self.$broadcast(cont.target, cont.data);
        };
    };
    self.$on("delete", self.showCont);
    self.close = function() {
        self.showDel = false;
    };
    self.loadding_func=function(e,cont){
        self.vm_loadding=cont;
    }
    dataCenterSrv.getDictDataByEidAndDid().then(function(res){
        if(res&&res.data){
            var vmData = res.data.filter(item=>{
                return item.paramName == 'VMWARE_API_KEY'
            })
            var vmCenterList = JSON.parse(vmData[0].paramValue).filter(item=>{
                return item.Active == true
            })
            $rootScope.tops={
                vmList:vmCenterList,
                vmData:{}
            }
            $rootScope.tops.vmData.selected = self.tops.vmList[0]
            $rootScope.changevmtype = function(name){
                self.vm_loadding=true;
                var dataParams = {
                    "enterpriseUid":localStorage.enterpriseUid,
                    "vCenterName":name.vCenterName
                }
                dataCenterSrv.logins(dataParams).then(function(res){
                    if (res && res.data ) {
                        localStorage.VMware_url = res.data.url ? res.data.url : "";
                        localStorage.VMware_uuid = res.data.uuid ? res.data.uuid : "";
                        self.vm_loadding=false;
                        /*if($routeParams.url){
                            $location.url($routeParams.url);
                        }else{
                            $location.url("/datacenter");
                        }*/
                        $route.reload();
                        localStorage.vmware_flag=2;
                    }
                })
            }
        }
    })

    self.$on("loadding_vm",self.loadding_func);
    if(localStorage.vmware_flag==1){
        //连接vcenter
        if (localStorage.supportOtherClouds && localStorage.supportOtherClouds.indexOf('VMWARE_API_KEY') > -1) {
            //self.$emit("loadding_vm",true);
            self.vm_loadding=true;
            var dataParams = {
                "enterpriseUid":localStorage.enterpriseUid,
                "vCenterName":""
            }
            dataCenterSrv.logins(dataParams).then(function(res){
                if (res && res.data ) {
                    localStorage.VMware_url = res.data.url ? res.data.url : "";
                    localStorage.VMware_uuid = res.data.uuid ? res.data.uuid : "";
                    self.vm_loadding=false;
                    if($location.search().url){
                        $location.url($location.search().url);
                    }else{
                        $location.url("/datacenter");
                    }
                    localStorage.vmware_flag=2;
                }
            })
        }
    }else{
        if($location.search().url){
            $location.url($location.search().url);
        }
    }

}
function getUrl(url){
    return appUrl+url;
};
function ActiveMenu(e,cur,context){
    if(cur&&cur.current){
        var _current = cur.current.split(".");
        context.pageTitle = "";
        context.currentItem = _current[0];
        context.subMenu = [];
        context.L3Menu = [];
        context.sideMenu.forEach(item => {
            if(_current[1]){ 
                if(item.current == _current[0] && _current[1].indexOf("create") == -1){
                    context.subMenu = item.child; 
                    context.subCurrentItem = cur.current
                    if(_current[2]){
                        context.subMenu.forEach(subItem =>{
                            if(subItem.current.split(".").slice(0,2).join(".") == _current.slice(0,2).join(".")){
                                context.L3Menu = subItem.child;
                                context.subCurrentItem = context.L3Menu[0].current;
                                context.L3CurrentItem = cur.current;
                            }
                        });
                    }
                }
            }else{
                if(item.current == _current[0]){
                    context.pageTitle = item.name;
                }
            }
        });
    }
}







