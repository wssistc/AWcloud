"use strict";
import "ip";
import "./cvm/all";
import "./clb/all";
import "./redis/all";
import "./vpc/all";
import "./overview/overviewModule";
import "./mysql/all";
import "./buy/all";
import "./common/filters/filters";
import "./common/services/services";
import "./common/services/angularResizeSrv";
import "./common/directives/all";
import { zh_CN } from "./i18n/zh_CN";
import { en_US } from "./i18n/en_US";



angular.module("app",["ngRoute","ngSanitize","ngCsv","pascalprecht.translate","cvmModule","vpcAllModule","clbModule","overviewModule","services","rt.resize","filtersModule","directiveModule","redisModule","mysqlModule","buyModule"])
.constant("API_HOST", GLOBALCONFIG.APIHOST)
.config(["$routeProvider", "$locationProvider", "$httpProvider", "$translateProvider", function($routeProvider, $locationProvider, $httpProvider, $translateProvider){
    $translateProvider.translations("en", en_US);
    $translateProvider.translations("zh", zh_CN);
    $translateProvider.preferredLanguage("zh");
    $httpProvider.interceptors.push(["$q", "$rootScope","API_HOST",function(q,$rootScope,api_host){
      return {
        request:function(config){
          var regionId = sessionStorage.getItem("RegionSession")?sessionStorage.getItem("RegionSession"):'sh';
          if(config.url.indexOf("/crs/GetRedisTaskList") == -1){  //redis任务管理列表不需要传region
            if(config.data && config.data.params ){
              config.data.params.Region = config.data.params.Region?config.data.params.Region:regionId;
            }else{
                config.data = {
                  "params":{
                    "Region":regionId
                  }
                };
            }
          }
          var user_url = null;
          if (config.url.indexOf("awcloud-qcloud") > -1) {
              user_url = config.url.split("awcloud-qcloud");
              config.url = api_host.QCLOUD + user_url[1];
          }
          //临时用，刷两下即可
          //config.headers["X-Auth-Token"] = localStorage.$AUTH_TOKEN;
          //config.headers["X-Auth-Token"] = "959f10172a224867969803e74aec0045";
          if(localStorage.$AUTH_TOKENS){
            config.headers["X-Auth-Token"] = localStorage.$AUTH_TOKENS;
          }
          return config;
        },
        response:function(res){
          var regMes = /(connect)[^connect]*(timed)[^timed*](out)/;//连接超时
          var reg = /(\u4f59\u989d)[^\u4f59\u989d]*(\u4e0d\u8db3)/;//余额不足
          var regLess = /(balance)[^0]*(less)[^0]*(error)/;//mysqlw余额不足
          var regDeal = /(deal)[^0]*(lock)[^0]*(error)/;//mysqlw余额不足
          if (/\.html/.test(res.config.url)) {
              return res;
          }
          if(res.data.code){
            if(res.data.code=="00010101"){
              $rootScope.Notoken = true;
              return;
            }
            if(res.data.code==4000|| res.data.code==5300){
              if(res.data.message && (reg.test(res.data.message)||regLess.test(res.data.message))){
                $rootScope.NoMoney = true;
                return;
              }
            }
            if(res.data.code!=0&&res.data.code!=4400&&res.data.code!=-2700){
                var mes = res.data.message;
                if(mes&&regDeal.test(mes)){
                  mes = "有未完成的扣费，请联系管理员。";
                }
                $rootScope.$broadcast("alert-error",mes);
                return;
            }
          }
          //$rootScope.$broadcast("alert-error",res.data.code);
          return res.data;
        },
        requestError:function(rej){
          return rej;
        },
        responseError:function(rej){
          return rej;
        }
      }


    }]);
    
    $routeProvider
      .when("/",{
        templateUrl:"js/overview/tmpl/overview.html",
        controller:"overviewCtrl",
        active:{
          parent:"cvm",
          current:"root"
        }
      })
      .when("/welcome",{
        templateUrl:"tmpl/welcome.html",
        controller:"welcomeCtrl",
        active:{
          parent:"cvm",
          current:""
        }
      })
      .when("/cvm/cbs",{
        templateUrl:"js/cvm/tmpl/volumes.html",
        controller:"VolumesCtrl",
        active:{
          parent:"cvm",
          current:"cbs"
        }
      })
      .when("/cvm/overview",{
        templateUrl:"js/cvm/tmpl/volumes.html",
        controller:"VolumesCtrl",
        active:{
          parent:"cvm",
          current:"overview"
        }
      })
      .when("/cvm/instances",{
         templateUrl:"js/cvm/tmpl/instances.html",
         controller:"InstancesCtrl",
         reloadOnSearch:false,
         active:{
           parent:"cvm",
           current:"instances"
         }
       })
       .when("/buy/instances",{
         templateUrl:"js/buy/tmpl/buyInstances.html",
         controller:"buyInstancesCtrl",
         active:{
           parent:"cvm",
           current:"instances"
         }
       })
       .when("/buy/cbs",{
         templateUrl:"js/buy/tmpl/buyCbs.html",
         controller:"buyCbsCtrl",
         active:{
           parent:"cvm",
           current:"cbs"
         }
       })
       .when("/buy/redis",{
          templateUrl:"js/buy/tmpl/buyRedis.html",
          controller:"buyRedisCtrl",
          active:{
            parent:"redis",
            current:"redislist"
          },
          resolve:{
            AllenableZone:function($q,redisSrv){
              var deferred = $q.defer();
              redisSrv.getZoneList({Region:"gz"}).then(function(res){
                if (res&&res.data) {
                    deferred.resolve(res.data.zones);
                }else{
                  deferred.resolve();
                }
              })
              return deferred.promise;
          }
          }
       })
       .when("/buy/mysql",{
          templateUrl:"js/buy/tmpl/buymysql.html",
          controller:"MysqlCreateCtrl",
          active:{
           parent:"cdb",
           current:"cdblist"
          }
          /*resolve:{
            proList:["$q","mysqlSrv",function($q,mysqlSrv){
              var deferred = $q.defer();
              mysqlSrv.getProject().then(function(res){
                deferred.resolve(res.data);
              })
              return deferred.promise;
            }]
          }*/
       })
       .when("/buy/vpc",{
          templateUrl:"js/buy/tmpl/buyVpc.html",
          controller:"buyVpcCtrl",
          active:{
            parent:"vpc",
            current:"vpc"
          }
       })
        .when("/buy/clb",{
          templateUrl:"js/buy/tmpl/buyClb.html",
          controller:"buyCLBCtrl",
          active:{
            parent:"clb",
            current:"clb"
          }
       })
      .when("/cvm/cvmcdh",{
        templateUrl:"js/cvm/tmpl/volumes.html",
        controller:"VolumesCtrl",
        active:{
          parent:"cvm",
          current:"cvmcdh"
        }
      })
      .when("/cvm/image",{
        templateUrl:"js/cvm/tmpl/images.html",
        controller:"imagesCtrl",
        reloadOnSearch:false,
        active:{
          parent:"cvm",
          current:"image"
        }
      })
      .when("/cvm/snapshot",{
        templateUrl:"js/cvm/tmpl/snapshots.html",
        controller:"SnapshotCtrl",
        active:{
          parent:"cvm",
          current:"snapshot"
        }
      })
      .when("/cvm/sshkey",{
        templateUrl:"js/cvm/tmpl/keypairs.html",
        controller:"keypairsCtrl",
        reloadOnSearch:false,
        active:{
          parent:"cvm",
          current:"sshkey"
        }
      })
      .when("/cvm/securitygroup",{
        templateUrl:"js/cvm/tmpl/secrityGroups.html",
        controller:"secGroupsCtrl",
        active:{
          parent:"cvm",
          current:"securitygroup"
        }
      })
      .when("/cvm/securitygroup/:id",{
        templateUrl:"js/cvm/tmpl/secrityGroupsDetail.html",
        controller:"secGroupsDetailCtrl",
        active:{
          parent:"cvm",
          current:"securitygroup"
        }
      })
      .when("/cvm/eip",{
        templateUrl:"js/cvm/tmpl/eip.html",
        controller:"eipCtrl",
        active:{
          parent:"cvm",
          current:"eip"
        }
      })
      .when("/cvm/recycle/cvm",{
        templateUrl:"js/cvm/tmpl/volumes.html",
        controller:"VolumesCtrl",
        active:{
          parent:"cvm",
          current:"cvmrecycle",
          subparent:"cvmrecycle"
        }
      })
      .when("/cvm/recycle/cdh",{
        templateUrl:"js/cvm/tmpl/volumes.html",
        controller:"VolumesCtrl",
        active:{
          parent:"cvm",
          current:"cdhrecycle",
          subparent:"cvmrecycle"
        }
      })
      .when("/cvm/recycle/cbs",{
        templateUrl:"js/cvm/tmpl/volumes.html",
        controller:"VolumesCtrl",
        active:{
          parent:"cvm",
          current:"cbsrecycle",
          subparent:"cvmrecycle"
        }
      })
      .when("/clb/instance",{
        templateUrl:"js/clb/tmpl/instance.html",
        controller:"clbInstanceCtrl",
        reloadOnSearch:false,
        active:{
          parent:"clb",
          current:"instance"
        }
      })
      .when("/clb/instance/:loadBalancerId",{
        templateUrl:"js/clb/tmpl/instanceDetails.html",
        controller:"clbInstanceDetailsCtrl",
        reloadOnSearch:false,
        active:{
          parent:"instance",
          current:"instanceDetails"
        }
      })
      .when("/clb/instance/:loadBalancerId/listener",{
        templateUrl:"js/clb/tmpl/instanceDetails.html",
        controller:"clbInstanceDetailsCtrl",
        reloadOnSearch:false,
        active:{
          parent:"instance",
          current:"instanceDetails"
        }
      })
      .when("/clb/instance/:loadBalancerId/listener/:listenerId",{
        templateUrl:"js/clb/tmpl/listenerDetails.html",
        controller:"clbListenerDetailsCtrl",
        reloadOnSearch:false,
        active:{
          parent:"instanceDetails",
          current:"listenerDetails"
        }
      })
      .when("/vpc/vpc",{
        templateUrl:"js/vpc/tmpl/vpc.html",
        controller:"vpcCtrl",
        reloadOnSearch: false,
        active:{
          parent:"vpc",
          current:"vpc"
        }
      })
      .when("/vpc/subnet",{
        templateUrl:"js/vpc/tmpl/subnet.html",
        controller:"subnetCtrl",
        reloadOnSearch: false,
        active:{
          parent:"vpc",
          current:"subnet"
        }
      })
      .when("/vpc/natgateway",{
        templateUrl:"js/vpc/tmpl/natgateway.html",
        controller:"natGatewayCtrl",
        reloadOnSearch: false,
        active:{
          parent:"vpc",
          current:"natgateway"
        }
      })
      .when("/vpc/route",{
        templateUrl:"js/vpc/tmpl/route.html",
        controller:"routeCtrl",
        reloadOnSearch: false,
        active:{
          parent:"vpc",
          current:"route"
        }
      })
      .when("/redis/redislist",{
        templateUrl:"js/redis/tmpl/list.html",
        controller:"redisCtrl",
        reloadOnSearch: false,
        /*resolve:{
          proList:function($q,mysqlSrv){
            var deferred = $q.defer();
            mysqlSrv.getProject().then(function(res){
              deferred.resolve(res.data);
            })
            return deferred.promise;
          }
        },*/
        active:{
          parent:"redis",
          current:"redislist"
        }
      })
      .when("/redis/redistask",{
        templateUrl:"js/redis/tmpl/redistask.html",
        controller:"redisTaskCtrl",
        active:{
          parent:"redis",
          current:"redistask"
        }
      })
      .when("/redis/redismigrate",{
        templateUrl:"js/cvm/tmpl/volumes.html",
        controller:"VolumesCtrl",
        active:{
          parent:"redis",
          current:"redismigrate"
        }
      })
      .when("/cdb/cdblist",{
        templateUrl:"js/mysql/tmpl/list.html",
        controller:"MysqlListCtrl",
        reloadOnSearch: false,
        /*resolve:{
          proList:function($q,mysqlSrv){
            var deferred = $q.defer();
            mysqlSrv.getProject().then(function(res){
              deferred.resolve(res.data);
            })
            return deferred.promise;
          }
        },*/
        active:{
          parent:"cdb",
          current:"cdblist"
        }
      })
      .when("/cdb/task",{
        templateUrl:"js/mysql/tmpl/tasklist.html",
        controller:"tasklistCtrl",
        active:{
          parent:"cdb",
          current:"task"
        }
      })
      .when("/cdb/paramtmpl",{
        templateUrl:"js/mysql/tmpl/paramtmpl.html",
        controller:"paramTmplCtrl",
        active:{
          parent:"cdb",
          current:"paramtmpl"
        }
      })
      .when("/cdb/cdbmigrate",{
        templateUrl:"js/cvm/tmpl/volumes.html",
        controller:"VolumesCtrl",
        active:{
          parent:"cdb",
          current:"cdbmigrate"
        }
      })
      .when("/cdb/cdbrecycle",{
        templateUrl:"js/mysql/tmpl/demo.html",
        controller:function(){},
        active:{
          parent:"cdb",
          current:"cdbrecycle"
        }
      })
      /*.when("/vpc/network",{
        templateUrl:"js/cvm/tmpl/volumes.html",
        controller:"VolumesCtrl",
        active:{
          parent:"vpc",
          current:"network"
        }
      })
      .when("/vpc/subnet",{
        templateUrl:"js/cvm/tmpl/volumes.html",
        controller:"VolumesCtrl",
        active:{
          parent:"vpc",
          current:"subnet"
        }
      })*/
      /*.when("/vpc/route",{
        templateUrl:"js/cvm/tmpl/volumes.html",
        controller:"VolumesCtrl",
        active:{
          parent:"vpc",
          current:"route"
        }
      })
      .when("/vpc/nat",{
        templateUrl:"js/cvm/tmpl/volumes.html",
        controller:"VolumesCtrl",
        active:{
          parent:"vpc",
          current:"nat"
        }
      })*/
      .otherwise({ redirectTo: "/" });
      //$locationProvider.html5Mode(false);
}])
.controller("mainCtrl",["alertSrv","$scope","$http","$location","$routeParams","$window","$timeout","$interval","API_HOST","$rootScope",function(alertSrv,scope,$http,$location,$routeParams,$window,$timeout,$interval,API_HOST,rootScope){
  var self = scope;
  self.showCont = function(e, cont) {
      self.showAlert = true;
      self.delCont = cont.msg;
      self.ContType = cont.type || "danger";
      self.btnType = cont.btnType || "btn-danger";
      self.notDel = cont.notDel;
      self.confirm = function() {
          self.showAlert = false;
          self.$broadcast(cont.target, cont.data);
      };
  };
  self.$on("delete", self.showCont);
  self.close = function() {
      self.showAlert = false;
  };
  self.globalMenu = [
    {
      name:"云服务器",
      url: "#/",
      icon:"icon-aw-yunfuwuqi",
      active:"cvm",
      child:[
        {
          name:"概况",
          url: "#/",
          icon:"icon-process",
          active:"root"
        },
        {
          name:"云主机",
          url: "#/cvm/instances",
          active:"instances"
        },
        /*{
          name:"专用宿主机",
          url: "#/cvm/cvmcdh",
          active:"cvmcdh"
        },*/
        {
          name:"镜像",
          url: "#/cvm/image",
          active:"image"
        },
        {
          name:"云硬盘",
          url: "#/cvm/cbs",
          active:"cbs"
        },
        {
          name:"快照",
          url: "#/cvm/snapshot",
          active: "snapshot"
        },
        {
          name:"SSH密钥",
          url: "#/cvm/sshkey",
          active: "sshkey"
        },
        {
          name:"安全组",
          url: "#/cvm/securitygroup",
          active: "securitygroup"
        },
        {
          name:"弹性公网IP",
          url: "#/cvm/eip",
          active: "eip"
        }/*,
        {
          name:"回收站",
          url: "#/cvm/recycle/cvm",
          active: "cvmrecycle",
          topAct:"cvmrecycle"
        }*/
      ]
    },
    {
      name:"负载均衡",
      url:"#/clb/instance",
      active:"clb",
      icon:"icon-aw-dashboard",
      child:[
        {
          name:"LB实例列表",
          url: "#/clb/instance",
          active:"instance"
        }/*,
        {
          name:"证书管理",
          url: "#/lbbm/lbbmcart",
          active: "lbbmcart"
        }*/
      ]
    },
    {
      name:"弹性缓存",
      url:"#/redis/redislist",
      active:"redis",
      icon:"icon-aw-cloud-upload",
      child:[
        {
          name:"实例列表",
          url: "#/redis/redislist",
          active:"redislist"
        },
        {
          name:"任务管理",
          url: "#/redis/redistask",
          active: "redistask"
        }/*,
        {
          name:"数据迁移",
          url: "#/redis/redismigrate",
          active: "redismigrate"
        }*/
      ]
    },
    {
      name:"数据库",
      url: "#/cdb/cdblist",
      active:"cdb",
      icon:"icon-aw-information",
      child:[
        {
          name:"实例列表",
          url: "#/cdb/cdblist",
          active: "cdblist"
        },
        {
          name:"任务列表",
          url: "#/cdb/task",
          active: "task"
        },
        {
          name:"参数模板",
          url: "#/cdb/paramtmpl",
          active: "paramtmpl"
        } /*,
        {
          name:"数据传输",
          url: "#/cdb/cdbmigrate",
          active: "cdbmigrate"
        },
        {
          name:"回收站",
          url: "#/cdb/cdbrecycle",
          active: "cdbrecycle"
        }*/
      ]
    },
    {
      name:"VPC",
      url: "#/vpc/vpc",
      active:"vpc",
      icon:"icon-aw-internet",
      child:[
        {
          name:"私有网络",
          url: "#/vpc/vpc",
          active: "vpc"
        },
        {
          name:"子网",
          url: "#/vpc/subnet",
          active: "subnet"
        },
        {
          name:"路由表",
          url: "#/vpc/route",
          active: "route"
        },
        {
          name:"NAT网关",
          url: "#/vpc/natgateway",
          active: "natgateway"
        }
      ]
    }
  ];
  self.allMenu = {
    cvmrecycle:[
      {
        name:"云服务器回收站",
        url: "#/cvm/recycle/cvm",
        active:"cvmrecycle"
      },
      {
        name:"专用宿主机回收站",
        url: "#/cvm/recycle/cdh",
        active:"cdhrecycle"
      },
      {
        name:"云硬盘回收站",
        url: "#/cvm/recycle/cbs",
        active:"cbsrecycle"
      }
    ]
  }
  self.tipsClose = function(){
    rootScope.NoMoney = false;
  }
  function menuCurrent(e,cur){
    if(cur.originalPath){
      self.topAct=null;
      self.menuCurrent = cur.active.parent;
      self.menuOpen = cur.active.parent;
      self.subCurrent = cur.active.current;
      self.topMenuCurrent = cur.active.current;
      self.topMenu = self.allMenu[cur.active.subparent];
      if(cur.active.subparent){
        self.topAct = cur.active.subparent;
      }
    }
  }
  localStorage.getItem("itemActive") ? localStorage.getItem("itemActive")!="cvm" ? self.itemActive = localStorage.getItem("itemActive") : self.itemActive = "cvm": self.itemActive = "cvm";
  function getActive(item){
      self.itemActive = item.active;
      localStorage.itemActive = item.active;  
  }
  self.homePage = API_HOST.HOMEPAGE;
  //self.Recharge = API_HOST.Recharge;
  self.Recharge = 'https://console.cloud.tencent.com/account/recharge';
  // self.$on("$routeChangeStart",function(e, cur){
  //   if(!localStorage.$QCLOUD_AUTH_TOKEN){
  //     $location.path("/welcome");
  //   }
  // })
  self.$on("$routeChangeSuccess",function(e, cur){
    menuCurrent(e,cur);
    $window.vmInterFunc = null;
    $window.cdbInterFunc = null;
    $window.redisFunc = null;
    $window.keypairInterFunc = null;
    $window.imageInterFunc = null;
    $window.readOnlyFunc = null;
    $window.taskListTimer = null;
    
    // $interval.cancel($window.taskListTimer);
    $timeout.cancel($window.taskInterFunc);
    //console.log($routeParams);
    if($routeParams.token){
      localStorage.$AUTH_TOKENS = $routeParams.token;
    }
    //localStorage.$AUTH_TOKENS = localStorage.$QCLOUD_AUTH_TOKEN;

    /*if(cur&&cur.active){
      switch(cur.active.current){
        case "cdblist":
          break;
      }
    }*/
    if(cur&&cur.active){
      self.itemActive = cur.active.parent;
    }
  })
  self.getActive = getActive;
  self.dashAlerts = alertSrv;
  
}])
.factory('RegionID', function() {
    return {
        Region:function(){
          return  sessionStorage.getItem("RegionSession")?sessionStorage.getItem("RegionSession"):'sh';
        }
    }
});
