"use strict";
export default function routeConfig($routeProvider,$locationProvider){
        function listAllOrg(arr, options) {
            _.forEach(arr, function(item) {
                options.push(item);
                if (item.children.length > 0) {
                    listAllOrg(item.children, options);
                }
            });
        }

        function choosenTemp(enterprisetmp, standLonetmp) {
            var permission = localStorage.permission;
            //var tempEnt = enterprisetmp;
            //var tempStan = standLonetmp;
            return permission == "enterprise" ? enterprisetmp : standLonetmp
        }
        $locationProvider.html5Mode(false);
        $routeProvider
            .when("/", {
                templateUrl: "js/auth/tmpl/login.html",
                controller: "loginCtrl",
                region:false,
                domainProject:false
            })
            .when("/view", {
                templateUrl: function() {
                    return choosenTemp("js/overview/tmpl/overviewa.html", "js/overview/tmpl/standlone.html")
                },
                controller: "viewCtrl",
                resolve: {
                    /*qcloudUid: function($q, $http) {
                        if (localStorage.supportOtherClouds && localStorage.supportOtherClouds.indexOf('QCLOUD_API_KEY') > -1) {
                            var deferred = $q.defer();
                            $http({
                                url: "/awstack-qcloud/exclude/enterprises/" + localStorage.enterpriseUid + "/loginOnce/?awcloudtoken=" + localStorage.$AUTH_TOKEN,
                                method: "GET"
                            }).then(function(res) {
                                deferred.resolve(res && res.data ? res.data : '')
                            }, function(err) {
                                deferred.resolve('')
                            });
                            return deferred.promise;
                        } else {
                            return '';
                        }
                    },
                    vmwareUid: function($q, $http) {
                        if (localStorage.supportOtherClouds && localStorage.supportOtherClouds.indexOf('VMWARE_API_KEY') > -1) {
                            $http({
                                url: GLOBALCONFIG.APIHOST.VMWARE + "/v1/enterprises/" + localStorage.enterpriseUid + "/login",
                                method: "GET"
                            }).then(function(res) {
                                if (res && res.data && res.data.data) {
                                    localStorage.VMware_url = res.data.data.url ? res.data.data.url : "";
                                    localStorage.VMware_uuid = res.data.data.uuid ? res.data.data.uuid : ""
                                }
                            });
                        }
                    },*/
                },
                parent:"SOverview",
                active:"view",
                region:false,
                domainProject:false
            })
            .when("/single", {
                templateUrl: "js/overview/tmpl/overview.html",
                controller: "viewaCtrl",
                reloadOnSearch:false,
                region:false,
                domainProject:false
            })
            .when("/quickconfig/createins", {
                templateUrl: "js/shortcuts/instances/tmpl/createIns.html",
                controller: "createInsCtrl",
                reloadOnSearch:false,
                region:true,
                domainProject:true
            })
            /*.when("/depart/depview", {
                templateUrl: "js/department/tmpl/depview.html",
                controller: "depviewCtrl"
            })*/
            .when("/permit/overview",{
                templateUrl:"js/easyReform/tmpl/userOverview.html",
                controller:"userOverviewCtrl",
                reloadOnSearch:false,
                parent:"User",
                active:"overview",
                region:false,
                domainProject:false
            })
            .when("/permit/user", {
                templateUrl: function() {
                    return choosenTemp("js/user/tmpl/user.html", "js/user/tmpl/user_sv.html")
                },
                controller: "UserCtrl",
                parent:"User",
                active:"user",
                region:false,
                domainProject:false
            })
            .when("/permit/role", {
                templateUrl: function() {
                    return choosenTemp("js/roles/tmpl/role.html", "js/roles/tmpl/role_sv.html")
                },
                controller: "RoleCtrl",
                parent:"User",
                active:"role",
                region:false,
                domainProject:false
            })
            /*.when("/permit/newRole", {
                templateUrl: "js/roles/tmpl/newRole.html",
                controller: "NewRoleCtrl"
            })*/
            .when("/permit/org", {
                templateUrl: "js/org/tmpl/org.html",
                controller: "OrgCtrl",
                parent:"User",
                active:"org",
                region:false,
                domainProject:false
            })
            .when("/permit/department", {
                templateUrl: "js/department/tmpl/department.html",
                controller: "DepartmentCtrl",
                reloadOnSearch: false,
                parent:"User",
                active:"department",
                region:false,
                domainProject:false
            })
            .when("/permit/project", {
                templateUrl: "js/project/tmpl/project.html",
                controller: "ProjectCtrl",
                reloadOnSearch: false,
                parent:"User",
                active:"project",
                region:false,
                domainProject:false
            })
            .when("/configure/node", {
                templateUrl: "js/configure/node/tmpl/node.html",
                controller: "NodeCtrl",
                reloadOnSearch: false,
                parent:"System",
                active:"node",
                region:true,
                domainProject:false
            })
            .when("/configure/cluster", {
                templateUrl: "js/configure/cluster/tmpl/cluster.html",
                controller: "clusterCtrl",
                reloadOnSearch: false,
                parent:"System",
                active:"cluster",
                region:false,
                domainProject:false
            })
            .when("/configure/cluster/:stepId", {
                templateUrl: function($routeParams) {
                    var url = "js/configure/cluster/tmpl/";
                    var path = 'stepone.html';
                    var params = $routeParams.stepId;
                    if (params) {
                        switch (params) {
                            case 'stepone':
                                path = 'stepone.html';
                                break;
                            case 'steptwo':
                                path = 'steptwo.html';
                                break;
                            case 'stepthree':
                                path = 'stepfour.html';
                                break;
                                /*case 'stepfour':
                                    path = 'stepfour.html';
                                    break;*/
                            case 'complete':
                                path = 'complete.html';
                                break;
                        }
                        return url + path;
                    }
                },
                controller: "clusterDeployCtrl",
                reloadOnSearch: false,
                region:false,
                domainProject:false
            })
            .when("/cvm/cvmview", {
                templateUrl: function() {
                    return choosenTemp("js/cvm/overview/tmpl/cvmView.html", "js/cvm/overview/tmpl/cvmView_sv.html")
                },
                controller: "cvmViewCtrl",
                reloadOnSearch: false,
                parent:"Resource",
                active:"cvmview",
                region:true,
                domainProject:true 
            })
            .when("/cvm/instances", {
                templateUrl: function() {
                    return choosenTemp("js/cvm/instances/tmpl/instances.html", "js/cvm/instances/tmpl/instances_sv.html")
                },
                controller: "InstancesCtrl",
                reloadOnSearch: false,
                parent:"Resource",
                active:"instances",
                region:true,
                domainProject:true 
            })
            .when("/cvm/affinity", {
                templateUrl:"js/cvm/instances/tmpl/affinity.html",
                controller: "affinityCtrl",
                reloadOnSearch: false,
                parent:"Resource",
                active:"affinity",
                region:true,
                domainProject:true 
            })
            .when("/cvm/ports", {
                templateUrl: "js/cvm/instances/tmpl/ports.html",
                controller: "portsCtrl",
                reloadOnSearch: false,
                parent:"Resource",
                active:"ports",
                region:true,
                domainProject:true 
            })
            .when("/cvm/elasticexpansion", {
                templateUrl: "js/cvm/instances/tmpl/elasticExpansion.html",
                controller: "elasticExpansionCtrl",
                reloadOnSearch: false,
                parent:"Resource",
                active:"elasticexpansion",
                region:true,
                domainProject:true 
            })
            .when("/cvm/images", {
                templateUrl: function() {
                    return choosenTemp("js/cvm/images/tmpl/images.html", "js/cvm/images/tmpl/images_sv.html")
                },
                controller: "ImagesCtrl",
                reloadOnSearch: false,
                parent:"Resource",
                active:"images",
                region:true,
                domainProject:true 
            })
            .when("/cvm/makeimages", {
                templateUrl: "js/cvm/images/tmpl/makeImage.html",
                controller: "makeImageCtrl",
                reloadOnSearch: false,
                parent:"Resource",
                active:"makeimages",
                region:true,
                domainProject:true 
            })
            .when("/cvm/extension", {
                templateUrl: "js/cvm/extension/tmpl/extension.html",
                controller: "extensionCtrl",
                reloadOnSearch: false,
                parent:"Resource",
                active:"extension",
                region:true,
                domainProject:true 
            })
            .when("/cvm/elasticExtension", {
                templateUrl: "js/cvm/elasticExtension/tmpl/eelist.html",
                controller: "eeListCtrl",
                reloadOnSearch: false,
                parent:"Resource",
                active:"elasticExtension",
                region:true,
                domainProject:true 
            })
            .when("/cvm/alarm", {
                templateUrl: "js/cvm/alarm/tmpl/alarmlist.html",
                controller: "alarmListCtrl",
                reloadOnSearch: false,
                parent:"Resource",
                active:"alarm",
                region:true,
                domainProject:true 
            })
            .when("/cvm/extensionins/:id", {
                templateUrl: "js/cvm/extension/tmpl/extensionins.html",
                controller: "extensionInsInfoCtrl",
                reloadOnSearch: false,
                parent:"Resource",
                active:"extensionins",
                region:true,
                domainProject:true 
            })
            .when("/cvm/scalpolicy", {
                templateUrl: "js/cvm/extension/tmpl/scalpolicy.html",
                controller: "scalpolicyCtrl",
                reloadOnSearch: false,
                parent:"Resource",
                active:"scalpolicy",
                region:true,
                domainProject:true 
            })
            .when("/logs/operatelogs", {
                // templateUrl: "js/logs/operatelog/tmpl/operatelog.html",
                templateUrl: function(){
                    return choosenTemp("js/logs/operatelog/tmpl/operatelog.html", "js/logs/operatelog/tmpl/operatelog_sv.html")
                },
                controller: "operatelogCtrl",
                reloadOnSearch: false,
                parent:"Log",
                active:"operatelogs",
                region:false,
                domainProject:false
            })
            .when("/cvm/volumes", {
                templateUrl: "js/cvm/volumes/tmpl/volumesNew.html",
                controller: "volumesTabCtrl",
                reloadOnSearch: false,
                parent:"Resource",
                active:"volumes",
                region:true,
                domainProject:true 
            })
            .when("/cvm/snapshots", {
                // templateUrl: "js/cvm/volumes/tmpl/snapshots.html",
                templateUrl: function() {
                    return choosenTemp("js/cvm/volumes/tmpl/snapshots.html", "js/cvm/volumes/tmpl/CopySnapshots.html")
                },
                controller: "SnapshotsCtrl",
                reloadOnSearch: false,
                parent:"Resource",
                active:"snapshots",
                region:true,
                domainProject:true 
            })
            .when("/system/regularSnap", {
                templateUrl: "js/cvm/volumes/tmpl/regularSnap.html",
                controller: "regularSnapCtrl",
                reloadOnSearch: false,
                parent:"System",
                active:"regularSnap",
                region:true,
                domainProject:true 
            })
            .when("/cvm/backups", {
                templateUrl: "js/cvm/volumes/tmpl/backups.html",
                controller: "backupsChainCtrl",
                reloadOnSearch: false,
                parent:"Resource",
                active:"backups",
                region:true,
                domainProject:true 
            })
            .when("/cvm/networks", {
                templateUrl: function() {
                    return choosenTemp("js/cvm/networks/tmpl/networks.html", "js/cvm/networks/tmpl/networks_sv.html")
                },
                controller: "networksCtrl",
                reloadOnSearch: false,
                parent:"Resource",
                active:"networks",
                region:true,
                domainProject:true 
            })
            .when("/cvm/physicalnetworks", {
                templateUrl: "js/cvm/networks/tmpl/physicalNetworks.html",
                controller: "physicalNetworksCtrl",
                reloadOnSearch: false,
                parent:"Resource",
                active:"physicalnetworks",
                region:true,
                domainProject:true 
            })
            .when("/cvm/routers", {
                templateUrl: "js/cvm/networks/tmpl/routers.html",
                controller: "routersCtrl",
                reloadOnSearch: false,
                parent:"Resource",
                active:"routers",
                region:true,
                domainProject:true 
            })
            .when("/cvm/vpn", {
                templateUrl: "js/cvm/networks/tmpl/vpn.html",
                controller: "vpnCtrl",
                reloadOnSearch: false,
                parent:"Resource",
                active:"vpn",
                region:true,
                domainProject:true 
            })
            .when("/cvm/loadbalancers", {
                templateUrl: "js/cvm/loadbalancers/tmpl/balance.html",
                controller: "balanceCtrl",
                reloadOnSearch: false,
                parent:"Resource",
                active:"loadbalancers",
                region:true,
                domainProject:true 
            })
            .when("/cvm/loadbalancing", {
                templateUrl: "js/cvm/loadbalancersNew/tmpl/balance.html",
                controller: "balanceNewCtrl",
                reloadOnSearch: false,
                parent:"Resource",
                active:"loadbalancing",
                region:true,
                domainProject:true 
            })
            .when("/cvm/loadbalancers/:balanceId", {
                templateUrl: "js/cvm/loadbalancers/tmpl/balanceDetail.html",
                controller: "balanceDetailCtrl",
                reloadOnSearch: false,
                parent:"Resource",
                region:true,
                domainProject:true 
            })
            .when("/cvm/loadbalancers/:balanceId/:poolId", {
                templateUrl: "js/cvm/loadbalancers/tmpl/poolsDetail.html",
                controller: "poolsDetailCtrl",
                reloadOnSearch: false,
                parent:"Resource",
                active:"loadbalancers",
                region:true,
                domainProject:true 
            })
            .when("/cvm/monitors", {
                templateUrl: "js/cvm/loadbalancers/tmpl/monitors.html",
                controller: "monitorsCtrl",
                reloadOnSearch: false,
                parent:"Resource",
                active:"monitors",
                region:true,
                domainProject:true 
            })
            .when("/cvm/bandwidth", {
                templateUrl: "js/cvm/networks/tmpl/bandwidth.html",
                controller: "bandwidthCtrl",
                parent:"Resource",
                active:"bandwidth",
                region:true,
                domainProject:true 
            })
            .when("/cvm/floating_ips", {
                templateUrl: "js/cvm/networks/tmpl/floating_ips.html",
                controller: "floatipsCtrl",
                parent:"Resource",
                active:"floating_ips",
                region:true,
                domainProject:true 
            })
            .when("/cvm/firewall", {
                templateUrl: "js/cvm/networks/tmpl/netfirewall.html",
                controller: "netfirewallCtrl",
                reloadOnSearch: false,
                parent:"Resource",
                active:"firewall",
                region:true,
                domainProject:true 
            })
            .when("/cvm/qos", {
                templateUrl: "js/cvm/networks/tmpl/qos.html",
                controller: "qosCtrl",
                reloadOnSearch: false,
                parent:"Resource",
                active:"qos",
                region:true,
                domainProject:true 
            })
            .when("/cvm/security_groups", {
                templateUrl: function() {
                    return choosenTemp("js/cvm/security/tmpl/firewall.html", "js/cvm/security/tmpl/firewall_sv.html")
                },
                controller: "firewallCtrl",
                reloadOnSearch: false,
                parent:"Resource",
                active:"security_groups",
                region:true,
                domainProject:true 
            })
            .when("/cvm/keypairs", {
                templateUrl: function() {
                    return choosenTemp("js/cvm/security/tmpl/keyPairs.html", "js/cvm/security/tmpl/keyPairs_sv.html")
                },
                controller: "keyPairsCtrl",
                parent:"Resource",
                active:"keypairs",
                region:true,
                domainProject:true 
            })
            .when("/cvm/recycle", {
                templateUrl: "js/cvm/recycle/tmpl/recycle.html",
                controller: "recycleCtrl",
                reloadOnSearch: false,
                parent:"Resource",
                active:"recycle",
                region:true,
                domainProject:true 
            })
            .when("/cvm/netTopo", {
                templateUrl: "js/zrenderTopo/tmpl/topo.html",
                controller: "zrenderTopoCtrl",
                reloadOnSearch: false,
                parent:"Resource",
                active:"netTopo",
                region:true,
                domainProject:true 
            })
            /*.when("/topology", {
                templateUrl: "js/topology/tmpl/topo.html",
                controller: "TopologyCtrl"
            })*/
            .when("/monitor/topology", {
                templateUrl: "js/zrenderTopo/tmpl/topo.html",
                controller: "zrenderTopoCtrl",
                reloadOnSearch: false,
                parent:"Monitoring",
                active:"topology",
                region:true,
                domainProject:true
            })
            /*.when("/monitor/topology", {
                templateUrl: "js/monitor/graph/tmpl/topo.html",
                controller: "theGraphCtrl",
                parent:"Monitoring",
                active:"topology",
                region:true,
                domainProject:false
            })*/
            .when("/system/quotas", {
                templateUrl: "js/settings/quotas/tmpl/quotas.html",
                controller: "quotaCtrl",
                parent:"System",
                active:"quotas",
                region:false,
                domainProject:false
            })
            .when("/system/systeminspection", {
                 templateUrl: "js/system/tmpl/systemInspection.html",
                 controller: "systemInspectionCtrl",
                 parent:"System",
                 active:"systeminspection",
                 reloadOnSearch: false,
                 region:true,
                 domainProject:false
             })
            .when("/system/networksmanage", {
                templateUrl: "js/system/tmpl/networksManage.html",
                controller: "networksManageCtrl",
                parent:"System",
                active:"networksmanage",
                region:true,
                domainProject:false
            })
            .when("/system/maxpcshow", {//大屏展示
                templateUrl: "js/system/maxpcshow/tmpl/maxpcshow.html",
                controller: "maxpcshowCtrl",
                parent:"System",
                active:"maxpcshow",
                region:false,
                domainProject:false
            })
            .when("/system/grade", {//云平台升级
                templateUrl: "js/system/tmpl/grade.html",
                controller: "gradeCtrl",
                parent:"System",
                active:"grade",
                region:false,
                domainProject:false
            })
            .when("/system/about", {
                templateUrl: "js/system/tmpl/about.html",
                controller: "aboutCtrl",
                parent:"System",
                active:"about",
                region:false,
                domainProject:false
            })
            .when("/system/cloud", {
                templateUrl: "js/settings/cloud/tmpl/cloud.html",
                controller: "cloudCtrl",
                parent:"System",
                active:"cloud",
                region:false,
                domainProject:false
            })
            .when("/monitor/monitorview", {
                templateUrl: "js/monitor/monitorview/tmpl/view.html",
                controller: "monitorviewCtrl",
                parent:"Monitoring",
                active:"monitorview",
                region:true,
                domainProject:false
            })
            .when("/monitor/resview", {
                templateUrl: "js/monitor/resource/tmpl/resview.html",
                controller: "resviewCtrl",
                parent:"Monitoring",
                active:"resview",
                region:false,
                domainProject:false
            })
            .when("/monitor/physical", {
                templateUrl: "js/monitor/resource/tmpl/physical_host.html",
                controller: "phyHostCtrl",
                reloadOnSearch: false,
                parent:"Monitoring",
                active:"physical",
                region:true,
                domainProject:false
            })
            .when("/monitor/sqlDatabase", {
                templateUrl: "js/monitor/resource/tmpl/sqlDatabase.html",
                controller: "sqlDatabaseCtrl",
                reloadOnSearch: false,
                parent:"Monitoring",
                active:"physical",
                region:true,
                domainProject:false
            })
            .when("/monitor/vmhost", {
                templateUrl: "js/monitor/resource/tmpl/vm_host.html",
                controller: "vmHostCtrl",
                reloadOnSearch: false,
                parent:"Monitoring",
                active:"vmhost",
                region:true,
                domainProject:true
            })
            .when("/monitor/monceph", {
                templateUrl: "js/monitor/resource/tmpl/monceph.html",
                parent:"Monitoring",
                active:"monceph",
                region:false,
                domainProject:false
            })
            .when("/monitor/cephview", {
                templateUrl: "js/monitor/resource/tmpl/ceph.html",
                controller: "cephCtrl",
                reloadOnSearch: false,
                parent:"Monitoring",
                active:"cephview",
                region:true,
                domainProject:false
            })
            /*.when("/monitor/service", {
                templateUrl: "js/monitor/service/tmpl/service.html",
                controller: "ServiceCtrl"
            })*/
            .when("/monitor/openstackService", {
                templateUrl: "js/monitor/service/tmpl/openstackService.html",
                controller: "openstackServiceCtrl",
                reloadOnSearch: false,
                parent:"Monitoring",
                active:"openstackService",
                region:true,
                domainProject:false
            })
            .when("/monitor/mysql", {
                templateUrl: "js/monitor/service/tmpl/mysql.html",
                controller: "mysqlCtrl",
                reloadOnSearch: false,
                parent:"Monitoring",
                active:"mysql",
                region:true,
                domainProject:false
            })
            .when("/monitor/rabbitmq", {
                templateUrl: "js/monitor/service/tmpl/rabbitmq.html",
                controller: "rabbitmqCtrl",
                reloadOnSearch: false,
                parent:"Monitoring",
                active:"rabbitmq",
                region:true,
                domainProject:false
            })
            .when("/monitor/memcached", {
                templateUrl: "js/monitor/service/tmpl/memcached.html",
                controller: "memcachedCtrl",
                reloadOnSearch: false,
                parent:"Monitoring",
                active:"memcached",
                region:true,
                domainProject:false
            })
            .when("/monitor/routermonitor", {
                templateUrl: "js/monitor/service/tmpl/routerMonitor.html",
                controller: "routerMonitorCtrl",
                reloadOnSearch: false,
                parent:"Monitoring",
                active:"routermonitor",
                region:true,
                domainProject:true
            })
            .when("/monitor/alarmevent", {
                templateUrl: "js/monitor/alarmManagement/tmpl/alarmEvent.html",
                controller: "alarmEventCtrl",
                parent:"Monitoring",
                active:"alarmevent",
                region:true,
                domainProject:true
            })
            .when("/monitor/alarmsetting", {
                templateUrl: "js/monitor/alarmManagement/tmpl/alarmSetting.html",
                controller: "alarmSettingCtrl",
                parent:"Monitoring",
                active:"alarmsetting",
                region:true,
                domainProject:true
            })
            .when("/monitor/alarmtemplate", {
                templateUrl: "js/monitor/alarmManagement/tmpl/alarmTemplate.html",
                controller: "alarmTemplateCtrl",
                parent:"Monitoring",
                active:"alarmtemplate",
                region:false,
                domainProject:false
            })
            .when("/monitor/contractgroup", {
                templateUrl: "js/monitor/alarmManagement/tmpl/contractGroup.html",
                controller: "contactGroupCtrl",
                parent:"Monitoring",
                active:"contractgroup",
                region:false,
                domainProject:false
            })
            .when("/monitor/strategy", {
                templateUrl: "js/monitor/strategy/tmpl/strategy.html",
                controller: "strategyCtrl",
                parent:"Monitoring",
                active:"strategy",
                region:true,
                domainProject:true
            })
            /*.when("/monitor/bosstask", {
                templateUrl: "js/monitor/boss/tmpl/bosstask.html",
                controller: "bosstaskCtrl"
            })
            .when("/monitor/fileManagement", {
                templateUrl: "js/monitor/boss/tmpl/fileManagement.html",
                controller: "fileManagementCtrl"
            })*/
            .when("/system/flavors", {
                templateUrl: function() {
                    return choosenTemp("js/system/tmpl/flavors.html", "js/system/tmpl/flavors_sv.html")
                },
                controller: "FlavorsCtrl",
                reloadOnSearch: false,
                parent:"System",
                active:"flavors",
                region:false,
                domainProject:false
            })
            .when("/system/bandlimit", {
                templateUrl: "js/system/limitband/tmpl/bandwidth.html",
                controller: "bandWidthCtrl",
                parent:"System",
                active:"bandlimit",
                region:false,
                domainProject:false
            })
            .when("/system/flowManage", {
                templateUrl: "js/system/flowManage/tmpl/flowManage.html",
                controller: "flowCtrl",
                parent:"System",
                reloadOnSearch: false,
                active:"flowManage",
                region:false,
                domainProject:false
            })
            .when("/system/resMetering", {
                templateUrl: "js/system/resMetering/tmpl/resMetering.html",
                controller: "resMeteringCtrl",
                reloadOnSearch: false,
                parent:"System",
                active:"resMetering",
                region:false,
                domainProject:false
            })
            .when("/system/billingManagement", {
                templateUrl: "js/system/billingManagement/tmpl/billingManagement.html",
                controller: "billingCtrl",
                reloadOnSearch: false,
                parent:"System",
                active:"billingManagement",
                region:false,
                domainProject:false
            })
            .when("/system/switch", {
                templateUrl: "js/system/switch/tmpl/switch.html",
                controller: "switchCtrl",
                parent:"System",
                active:"switch",
                region:false,
                domainProject:false
            })
            .when("/system/aggregates", {
                templateUrl: "js/system/tmpl/aggregates.html",
                controller: "AggregatesCtrl",
                parent:"System",
                active:"aggregates",
                region:true,
                domainProject:false
            })
            .when("/system/storageManagement", {
                templateUrl: "js/system/storageManagement/tmpl/storageManagement.html",
                controller: "storageManagementCtrl",
                reloadOnSearch: false,
                parent:"System",
                active:"storageManagement",
                region:true,
                domainProject:false
            })
            .when("/system/imageManagement", {
                templateUrl: "js/system/imageManagement/tmpl/imageManage.html",
                controller: "imageManageCtrl",
                reloadOnSearch: false,
                parent:"System",
                active:"imageManagement",
                region:true,
                domainProject:false
            })
            .when("/system/hypervisors", {
                templateUrl: "js/system/tmpl/hypervisors.html",
                controller: "HypervisorsCtrl",
                parent:"System",
                active:"hypervisors",
                region:false,
                domainProject:false
            })
            .when("/system/accesspolicy", {
                templateUrl: "js/system/accesspolicy/tmpl/accesspolicy.html",
                controller: "accessPolicyCtrl",
                parent:"System",
                active:"accesspolicy",
                region:false,
                domainProject:false
            })
            .when("/system/plugin", {
                templateUrl:"js/system/pluginManage/tmpl/plugin.html",
                controller: "pluginCtrl",
                reloadOnSearch: false,
                parent:"System",
                active:"plugin",
                region:true,
                domainProject:false
            })
            .when("/system/paas", {
                templateUrl:"js/settings/paasService/tmpl/paas.html",
                controller: "paasCtrl",
                reloadOnSearch: false,
                parent:"System",
                active:"paas",
                region:true,
                domainProject:false
            })
            .when("/system/license", {
                templateUrl: "js/system/license/tmpl/license.html",
                controller: "licenseCtrl",
                parent:"System",
                active:"license",
                region:false,
                domainProject:false
            })
            .when("/system/mailserver", {
                templateUrl: "js/system/mailServer/tmpl/mailServer.html",
                controller: "mailServerCtrl",
                parent:"System",
                active:"mailserver",
                region:false,
                domainProject:false
            })
            .when("/system/wechatserver", {
                templateUrl: "js/system/weChatAlarm/tmpl/weChatAlarm.html",
                controller: "weChatAlarmCtrl",
                parent:"System",
                active:"wechatserver",
                region:false,
                domainProject:false
            })
            .when("/system/general", {
                templateUrl: "js/settings/general/tmpl/general.html",
                controller: "generalCtrl",
                parent:"System",
                active:"general",
                region:true,
                domainProject:false
            })
            .when("/system/storagedevice", {
                templateUrl: "js/system/storage/tmpl/storageDevice.html",
                controller: "storageDeviceCtrl",
                reloadOnSearch: false,
                parent:"System",
                active:"storagedevice",
                region:false,
                domainProject:false
            })
            .when("/system/storagemanage", {
                templateUrl: "js/system/storage/tmpl/storageManage.html",
                controller: "storageManageCtrl",
                reloadOnSearch: false,
                parent:"System",
                active:"storagemanage",
                region:false,
                domainProject:false
            })
            .when("/system/storagedevice/:id/pool", {
                templateUrl: "js/system/storage/tmpl/storagePool.html",
                controller: "storagePoolCtrl",
                parent:"System",
                active:"storagedevice",
                region:false,
                domainProject:false
            })
            .when("/system/storagefeatures", {
                templateUrl: "js/system/storage/tmpl/storageFeatures.html",
                controller: "storageFeaturesCtrl",
                parent:"System",
                active:"storagefeatures",
                region:false,
                domainProject:false
            })
            .when("/system/volumetype", {
                templateUrl: "js/system/storage/tmpl/volumeType.html",
                controller: "volumeTypeCtrl",
                parent:"System",
                active:"volumetype",
                region:false,
                domainProject:false
            })
            .when("/system/datacluster", {
                templateUrl: "js/system/datacluster/tmpl/datacluster.html",
                controller: "dataclusterCtrl",
                parent:"System",
                active:"datacluster",
                reloadOnSearch: false,
                region:false,
                domainProject:false
            })
            .when("/view/qcloud", {
                templateUrl: "js/qcloud/instances/tmpl/instances.html",
                controller: "qcloudInstancesCtrl",
                active:"qcloud",
                region:false,
                domainProject:false
            })
            .when("/menu", {
                templateUrl: "js/menuManage/tmpl/menuManage.html",
                controller: "menuCtrl",
                active:"menu",
                region:false,
                domainProject:false
            })
            .when("/workflow/flowtask", {
                templateUrl: "js/workflow/tmpl/flowtask.html",
                controller: "flowtaskCtrl",
                // resolve: {
                //     userGroup: function($q, workflowsrv) {
                //         var enterpriseUid = localStorage.enterpriseUid ? localStorage.enterpriseUid : "";
                //         var deferred = $q.defer();
                //         $q.all([workflowsrv.getUserList(enterpriseUid), workflowsrv.getGroupList(enterpriseUid)]).then(function(result) {
                //             if (result && result[0] && result[1]) {
                //                 var options = [];
                //                 listAllOrg(result[1].data, options);
                //                 options.map(item => {
                //                     item.levname = item.name;
                //                     for (let i = 0; i < item.deptLevel; i++) {
                //                         item.levname = "|__" + item.levname;
                //                     }
                //                 });
                //                 deferred.resolve({
                //                     user: result[0].data,
                //                     group: options
                //                 });
                //             }

                //         });
                //         return deferred.promise;
                //     }
                // },
                parent:"Flowing",
                active:"flowtask",
                region:false,
                domainProject:false
            })
            .when("/workflow/flowapply", {
                templateUrl: "js/workflow/tmpl/flowapply.html",
                controller: "flowapplyCtrl",
                parent:"Flowing",
                active:"flowapply",
                region:false,
                domainProject:false
            })
            .when("/workflow/createflow", {
                templateUrl: "js/workflow/tmpl/createflow.html",
                controller: "createflowCtrl",
                parent:"Flowing",
                active:"createflow",
                region:false,
                domainProject:false
            })
            .when("/workflow/createflow:modelId", {
                templateUrl: "js/workflow/tmpl/createflow.html",
                controller: "createflowCtrl",
                parent:"Flowing",
                active:"createflow",
                region:false,
                domainProject:false
            })
            .when("/workflow/createCoustomflow", {
                templateUrl: "js/workflow/tmpl/createflow.html",
                controller: "createflowCtrl",
                parent:"Flowing",
                active:"createflow",
                region:false,
                domainProject:false
            })
            .when("/workflow/createCoustomflow/createflow:modelId", {
                templateUrl: "js/workflow/tmpl/createflow.html",
                controller: "createflowCtrl",
                parent:"Flowing",
                active:"createflow",
                region:false,
                domainProject:false
            })
            .when("/workflow/flowprogress", {
                templateUrl: "js/workflow/tmpl/flowprogress.html",
                controller: "flowprogressCtrl",
                parent:"Flowing",
                active:"flowprogress",
                region:false,
                domainProject:false
            })
            .when("/ticket/lists", {
                templateUrl: "js/ticket/tmpl/list.html",
                controller: "ticketListCtrl",
                reloadOnSearch: false,
                parent:"List",
                active:"lists",
                region:true,
                domainProject:false
            })
            .when("/ticket/apply", {
                templateUrl: "js/ticket/tmpl/apply.html",
                controller: "ticketApplyCtrl",
                parent:"List",
                active:"apply",
                region:true,
                domainProject:false
            })
            .when("/ticket/create", {
                templateUrl: "js/ticket/tmpl/create.html",
                controller: "ticketCreateCtrl",
                resolve: {
                    ticketListData: function($q, workflowsrv) {
                        var enterpriseUid = localStorage.enterpriseUid ? localStorage.enterpriseUid : "";
                        return workflowsrv.getJobList(enterpriseUid);
                    }
                },
                reloadOnSearch: false,
                parent:"List",
                active:"create",
                region:true,
                domainProject:false
            })
            .when("/demotpl", {
                templateUrl: "js/demotpl/tmpl/index.html",
                controller: "demotplCtrl",
                region:false,
                domainProject:false
            })
            .when("/bill/consumeview",{
                templateUrl:"js/consumeStatistics/consumeView/tmpl/consumeview.html",
                controller:"consumeViewCtrl",
                reloadOnSearch:false,
                parent:"Bill_Management",
                active:"consumeview",
                region:false,
                domainProject:false
            })
            .when("/bill/resourceprice",{
                templateUrl:"js/resourceprice/tmpl/resoucepricelist.html",
                controller:"resoucepriceCtrl",
                parent:"Bill_Management",
                active:"resourceprice",
                region:false,
                domainProject:false
            })
            .when("/pvm/pvmview",{
                templateUrl:"js/pvm/physicalResource/tmpl/pOverview.html",
                controller:"pOverviewCtrl",
                reloadOnSearch:false,
                parent:"PhysicalResource",
                active:"pvmview",
                region:true,
                domainProject:true
            })
            .when("/pvm/pvminstances",{
                templateUrl:"js/pvm/physicalResource/tmpl/pInstances.html",
                controller:"pInstancesCtrl",
                reloadOnSearch:false,
                parent:"PhysicalResource",
                active:"pvminstances",
                region:true,
                domainProject:true
            })
            .when("/pvm/pvmimages",{
                templateUrl:"js/pvm/physicalResource/tmpl/pImages.html",
                controller:"pImagesCtrl",
                reloadOnSearch:false,
                parent:"PhysicalResource",
                active:"pvmimages",
                region:true,
                domainProject:true
            })
            .when("/pvm/pvmnetworks",{
                templateUrl:"js/pvm/physicalResource/tmpl/pNetwork.html",
                controller:"pNetworkCtrl",
                reloadOnSearch:false,
                parent:"PhysicalResource",
                active:"pvmnetworks",
                region:true,
                domainProject:true
            })
            .when("/system/physicalConductor",{
                templateUrl:"js/pvm/physicalConductor/tmpl/physicalConductor.html",
                controller:"physicalConductorCtrl",
                reloadOnSearch:false,
                parent:"System",
                active:"physicalConductor",
                region:true,
                domainProject:false
            })
            .when("/first",{
                templateUrl:"js/easyReform/tmpl/first.html",
                controller:"easyCtrl",
                region:false,
                domainProject:false
            })
            .when("/cvm/volumesQoS",{
                templateUrl:"js/cvm/volumes/tmpl/volumesQoS.html",
                controller:"VolumesQoSCtrl",
                parent:"Resource",
                active:"volumesQoS",
                region:true,
                domainProject:true 
            })
            .when("/system/labelManagement",{
                templateUrl: "js/system/labelManagement/temp/labelManagement.html",
                controller: "labelCtrl",
                parent:"System",
                active:"labelManagement",
                region:false,
                domainProject:false
            })
            .when("/system/transmissionMag",{
                templateUrl: "js/system/transmissionMag/temp/transmissionMag.html",
                controller: "TransMagaCtrl",
                reloadOnSearch:false,
                parent:"System",
                active:"transmissionMag",
                region:true,
                domainProject:false
            })
            .when("/system/cephView",{
                templateUrl: "js/system/cephView/tmpl/cephView.html",
                controller: "cephViewCtrl",
                parent:"System",
                active:"cephView",
                region:true,
                domainProject:false
            })
            .when("/system/cephViewInfo",{
                templateUrl: "js/system/cephView/tmpl/cephViewInfo.html",
                controller: "cephViewInfoCtrl",
                parent:"System",
                active:"cephViewInfo",
                region:false,
                domainProject:false
            })
	      //待处理工单
            .when("/ticket/pendingTickets", {
                templateUrl: "js/ticket/tmpl/pendingTicket.html",
                controller: "pendingTicketCtrl",
                reloadOnSearch: false,
                parent:"List",
                active:"pendingTickets",
                region:true,
                domainProject:false
            })
            //工单申请
            .when("/ticket/ticketApply", {
                templateUrl: "js/ticket/tmpl/ticketApply.html",
                controller: "ticketsApplyCtrl",
                reloadOnSearch: false,
                parent:"List",
                active:"ticketApply",
                region:true,
                domainProject:false
            })
            //关系型数据库TDSQL
            .when("/database/relationalTdsql", {
                templateUrl: "js/paas/tdsql/tmpl/tdsql.html",
                controller: "tdsqlCtrl",
                reloadOnSearch: false,
                parent:"DatabaseManage",
                active:"relationalTdsql",
                region:true,
                domainProject:true
            })

            //我的申请
            .when("/ticket/myApply", {
                templateUrl: "js/ticket/tmpl/myApply.html",
                controller: "myApplyCtrl",
                reloadOnSearch: false,
                parent:"List",
                active:"myApply",
                region:true,
                domainProject:false
            })
            //所有工单
            .when("/ticket/allTickets", {
                templateUrl: "js/ticket/tmpl/allTickets.html",
                controller: "allTicketsCtrl",
                reloadOnSearch: false,
                parent:"List",
                active:"allTickets",
                region:true,
                domainProject:false
            })
            //工单报表
            .when("/ticket/ticketReports", {
                templateUrl: "js/ticket/tmpl/ticketReports.html",
                controller: "ticketReportsCtrl",
                reloadOnSearch: false,
                parent:"List",
                active:"ticketReports",
                region:false,
                domainProject:false
            })
            // 容器管理
            // .when("/k8s/clusters", {
            //     templateUrl: "js/kubernetes/dockerClusters/tmpl/dockerClusters.html",
            //     controller: "dockerClustersCtrl",
            // })


            .when("/k8s/clusters", {
                templateUrl: "js/kubernetes/dockerClusters/tmpl/dockerClusters.html",
                controller: "dockerClustersCtrl",
                reloadOnSearch:false,
                parent:"K8s",
                active:"clusters",
                region:true,
                domainProject:true
            })
            // .when("/k8s/clusters/:clusterName", {
            //     templateUrl: "js/kubernetes/dockerClusters/tmpl/dockerClusterDetails.html",
            //     controller: "dockerClusterDetailCtrl",
            //     parent:"K8s",
            //     active:"clusters",
            //     region:true,
            //     domainProject:true
            // })
            // .when("/k8s/clusters/:clusterName/replicas", {
            //     templateUrl: "js/kubernetes/dockerClusters/tmpl/dockerClusterReplicaDetails.html",
            //     controller: "dockerClusterReplicaDetailCtrl",
            //     parent:"K8s",
            //     active:"clusters",
            //     region:true,
            //     domainProject:true
            // })
            // .when("/k8s/clusters/:clusterName/replicas/:replicaName", {
            //     templateUrl: "js/kubernetes/dockerClusters/tmpl/dockerClusterReplicaDetails.html",
            //     controller: "dockerClusterReplicaDetailCtrl",
            //     parent:"K8s",
            //     active:"clusters",
            //     region:true,
            //     domainProject:true
            // })
            // .when("/k8s/clusters/:clusterName/replicas/:replicaName/containers", {
            //     templateUrl: "js/kubernetes/dockerClusters/tmpl/dockerContainerDetails.html",
            //     controller: "dockerContainerDetailCtrl",
            //     parent:"K8s",
            //     active:"clusters",
            //     region:true,
            //     domainProject:true
            // })
            // .when("/k8s/clusters/:clusterName/replicas/:replicaName/containers/:containerName", {
            //     templateUrl: "js/kubernetes/dockerClusters/tmpl/dockerContainerDetails.html",
            //     controller: "dockerContainerDetailCtrl",
            //     parent:"K8s",
            //     active:"clusters",
            //     region:true,
            //     domainProject:true
            // })
            .when("/k8s/services", {
                templateUrl: "js/kubernetes/dockerServices/tmpl/dockerServices.html",
                controller: "dockerServicesCtrl",
                reloadOnSearch:false,
                parent:"K8s",
                active:"services",
                region:true,
                domainProject:true
            })
            // .when("/k8s/services/:serviceName", {
            //     templateUrl: "js/kubernetes/dockerServices/tmpl/dockerServiceDetails.html",
            //     controller: "dockerServiceDetailsCtrl",
            //     parent:"K8s",
            //     active:"services",
            //     region:true,
            //     domainProject:true
            // })
            .when("/k8s/projects", {
                templateUrl: "js/kubernetes/dockerImages/tmpl/harborProjects.html",
                controller: "harborProjectsCtrl",
                reloadOnSearch:false,
                parent:"K8s",
                active:"projects",
                region:true,
                domainProject:true
            })
            // .when("/k8s/projects/:projectId", {
            //     templateUrl: "js/kubernetes/dockerImages/tmpl/harborProjectDetails.html",
            //     controller: "harborProjectDetailsCtrl",
            //     parent:"K8s",
            //     active:"projects",
            //     region:true,
            //     domainProject:true
            // })
            // .when("/k8s/projects/:projectId/repositories/:repoName", {
            //     templateUrl: "js/kubernetes/dockerImages/tmpl/dockerImages.html",
            //     controller: "dockerImagesCtrl",
            //     parent:"K8s",
            //     active:"projects",
            //     region:true,
            //     domainProject:true
            // })
            // .when("/k8s/projects/:projectId/repositories/:repoName/tags/:tag", {
            //     templateUrl: "js/kubernetes/dockerImages/tmpl/dockerImageManifests.html",
            //     controller: "dockerImageManifestsCtrl",
            //     parent:"K8s",
            //     active:"projects",
            //     region:true,
            //     domainProject:true
            // })
            .when("/k8s/nodes", {
                templateUrl: "js/kubernetes/dockerNodes/tmpl/dockerNodes.html",
                controller: "dockerNodesCtrl",
                reloadOnSearch: false,
                parent:"K8s",
                active:"projects",
                region:true,
                domainProject:true
            })
            .when("/k8s/nodes/:nodeName", {
                templateUrl: "js/kubernetes/dockerNodes/tmpl/dockerNodes.html",
                controller: "dockerNodeDetailsCtrl"
            })
            .when("/console", {
                templateUrl:  "js/cvm/console/tmpl/index.html",
                controller: "consoleCtrl",
            })
            /*灵雀*/
            .when("/alauda/overview", {
                templateUrl: "js/paas/tmpl/alauda_1.html",
                controller: "alauda_1Ctrl",
                parent:"Alauda",
                rtype:"PaaS",
                jump:"/overview",
                active:"overview",
                region:false,
                domainProject:false
            })
            .when("/alauda/deploy", {
                templateUrl: "js/paas/tmpl/alauda_2.html",
                controller: "alauda_2Ctrl",
                parent:"Alauda",
                rtype:"PaaS",
                jump:"/deployment/list",
                active:"deploy",
                region:false,
                domainProject:false
            })
            .when("/alauda/daemon", {
                templateUrl: "js/paas/tmpl/alauda_3.html",
                controller: "alauda_3Ctrl",
                parent:"Alauda",
                rtype:"PaaS",
                jump:"/daemonset/list",
                active:"daemon",
                region:false,
                domainProject:false
            })
            .when("/alauda/stateful", {
                templateUrl: "js/paas/tmpl/alauda_4.html",
                controller: "alauda_4Ctrl",
                rtype:"PaaS",
                jump:"/statefulset/list",
                parent:"Alauda",
                active:"stateful",
                region:false,
                domainProject:false
            })
            .when("/alauda/replica", {
                templateUrl: "js/paas/tmpl/alauda_5.html",
                controller: "alauda_5Ctrl",
                parent:"Alauda",
                rtype:"PaaS",
                jump:"/replicaset/list",
                active:"replica",
                region:false,
                domainProject:false
            })
            .when("/alauda/pod", {
                templateUrl: "js/paas/tmpl/alauda_6.html",
                controller: "alauda_6Ctrl",
                parent:"Alauda",
                rtype:"PaaS",
                jump:"/pod/list",
                active:"pod",
                region:false,
                domainProject:false
            })
            .when("/alauda/configmap", {
                templateUrl: "js/paas/tmpl/alauda_7.html",
                controller: "alauda_7Ctrl",
                parent:"Alauda",
                rtype:"PaaS",
                jump:"/configmap/list",
                active:"configmap",
                region:false,
                domainProject:false
            })
            .when("/alauda/secret", {
                templateUrl: "js/paas/tmpl/alauda_8.html",
                controller: "alauda_8Ctrl",
                parent:"Alauda",
                rtype:"PaaS",
                jump:"/secret/list",
                active:"secret",
                region:false,
                domainProject:false
            })
            .when("/alauda/service", {
                templateUrl: "js/paas/tmpl/alauda_9.html",
                controller: "alauda_9Ctrl",
                parent:"Alauda",
                rtype:"PaaS",
                jump:"/service/list",
                active:"service",
                region:false,
                domainProject:false
            })
            .when("/alauda/ingress", {
                templateUrl: "js/paas/tmpl/alauda_10.html",
                controller: "alauda_10Ctrl",
                parent:"Alauda",
                rtype:"PaaS",
                jump:"/ingress/list",
                active:"ingress",
                region:false,
                domainProject:false
            })
            .when("/alauda/networkpolicy", {
                templateUrl: "js/paas/tmpl/alauda_11.html",
                controller: "alauda_11Ctrl",
                parent:"Alauda",
                rtype:"PaaS",
                jump:"/networkpolicy/list",
                active:"networkpolicy",
                region:false,
                domainProject:false
            })
            .when("/alauda/persistentvolumeclaim", {
                templateUrl: "js/paas/tmpl/alauda_12.html",
                controller: "alauda_12Ctrl",
                parent:"Alauda",
                rtype:"PaaS",
                jump:"/persistentvolumeclaim/list",
                active:"persistentvolumeclaim",
                region:false,
                domainProject:false
            })
            .when("/alauda/persistentvolume", {
                templateUrl: "js/paas/tmpl/alauda_13.html",
                controller: "alauda_13Ctrl",
                parent:"Alauda",
                rtype:"PaaS",
                jump:"/persistentvolume/list",
                active:"persistentvolume",
                region:false,
                domainProject:false
            })
            .when("/alauda/storageclass", {
                templateUrl: "js/paas/tmpl/alauda_14.html",
                controller: "alauda_14Ctrl",
                parent:"Alauda",
                rtype:"PaaS",
                jump:"/storageclass/list",
                active:"storageclass",
                region:false,
                domainProject:false
            })
            .when("/alauda/node", {
                templateUrl: "js/paas/tmpl/alauda_15.html",
                controller: "alauda_15Ctrl",
                parent:"Alauda",
                rtype:"PaaS",
                jump:"/node/list",
                active:"node",
                region:false,
                domainProject:false
            })
            .when("/alauda/namespace", {
                templateUrl: "js/paas/tmpl/alauda_16.html",
                controller: "alauda_16Ctrl",
                parent:"Alauda",
                rtype:"PaaS",
                jump:"/namespace/list",
                active:"namespace",
                region:false,
                domainProject:false
            })
            .when("/alauda/othersspaced", {
                templateUrl: "js/paas/tmpl/alauda_17.html",
                controller: "alauda_17Ctrl",
                parent:"Alauda",
                rtype:"PaaS",
                jump:"/others/namespaced/list",
                active:"othersspaced",
                region:false,
                domainProject:false
            })
            .when("/alauda/clustered", {
                templateUrl: "js/paas/tmpl/alauda_18.html",
                controller: "alauda_18Ctrl",
                parent:"Alauda",
                rtype:"PaaS",
                jump:"/others/clustered/list",
                active:"clustered",
                region:false,
                domainProject:false
            })
            .when("/alauda/roles", {
                templateUrl: "js/paas/tmpl/alauda_19.html",
                controller: "alauda_19Ctrl",
                parent:"Alauda",
                rtype:"PaaS",
                jump:"/administrator/roles/list",
                active:"roles",
                region:false,
                domainProject:false
            })
            .when("/alauda/bindings", {
                templateUrl: "js/paas/tmpl/alauda_20.html",
                controller: "alauda_20Ctrl",
                parent:"Alauda",
                rtype:"PaaS",
                jump:"/administrator/role-bindings/list",
                active:"bindings",
                region:false,
                domainProject:false
            })
            
            /*TBase*/
            .when("/TBase/tbClusterManage", {
                templateUrl: "js/paas/tmpl/alauda_21.html",
                controller: "alauda_21Ctrl",
                parent:"TBase",
                rtype:"PaaS",
                jump:"/operation/clusterManage",
                active:"tbClusterManage",
                region:false,
                domainProject:false
            })
            .when("/TBase/tbNodeManage", {
                templateUrl: "js/paas/tmpl/alauda_22.html",
                controller: "alauda_22Ctrl",
                parent:"TBase",
                rtype:"PaaS",
                jump:"/operation/nodeManage",
                active:"tbNodeManage",
                region:false,
                domainProject:false
            })
            .when("/TBase/tbNodeGroup", {
                templateUrl: "js/paas/tmpl/alauda_23.html",
                controller: "alauda_23Ctrl",
                parent:"TBase",
                rtype:"PaaS",
                jump:"/operation/nodeGroup",
                active:"tbNodeGroup",
                region:false,
                domainProject:false
            })
            .when("/TBase/tbConfigManagement", {
                templateUrl: "js/paas/tmpl/alauda_24.html",
                controller: "alauda_24Ctrl",
                parent:"TBase",
                rtype:"PaaS",
                jump:"/operation/configManagement#!/system",
                active:"tbConfigManagement",
                region:false,
                domainProject:false
            })
            .when("/TBase/tbBackupSetting", {
                templateUrl: "js/paas/tmpl/alauda_25.html",
                controller: "alauda_25Ctrl",
                parent:"TBase",
                rtype:"PaaS",
                jump:"/operation/backupSetting",
                active:"tbBackupSetting",
                region:false,
                domainProject:false
            })
            .when("/TBase/tbBackupCheck", {
                templateUrl: "js/paas/tmpl/alauda_26.html",
                controller: "alauda_26Ctrl",
                parent:"TBase",
                rtype:"PaaS",
                jump:"/operation/backupCheck#!/backup",
                active:"tbBackupCheck",
                region:false,
                domainProject:false
            })
            .when("/TBase/tbClusterMonitor", {
                templateUrl: "js/paas/tmpl/alauda_27.html",
                controller: "alauda_27Ctrl",
                parent:"TBase",
                rtype:"PaaS",
                jump:"/monitor/clusterMonitor",
                active:"tbClusterMonitor",
                region:false,
                domainProject:false
            })
            .when("/TBase/tbNodeMonitor", {
                templateUrl: "js/paas/tmpl/alauda_28.html",
                controller: "alauda_28Ctrl",
                parent:"TBase",
                rtype:"PaaS",
                jump:"/monitor/nodeMonitor",
                active:"tbNodeMonitor",
                region:false,
                domainProject:false
            })
            .when("/TBase/tbVolumeMonitor", {
                templateUrl: "js/paas/tmpl/alauda_29.html",
                controller: "alauda_29Ctrl",
                parent:"TBase",
                rtype:"PaaS",
                jump:"/monitor/volumeMonitor",
                active:"tbVolumeMonitor",
                region:false,
                domainProject:false
            })
            .when("/TBase/tbAlarmLists", {
                templateUrl: "js/paas/tmpl/alauda_30.html",
                controller: "alauda_30Ctrl",
                parent:"TBase",
                rtype:"PaaS",
                jump:"/alert_middleware/lists",
                active:"tbAlarmLists",
                region:false,
                domainProject:false
            })
            .when("/TBase/tbAlarmRecords", {
                templateUrl: "js/paas/tmpl/alauda_31.html",
                controller: "alauda_31Ctrl",
                parent:"TBase",
                rtype:"PaaS",
                jump:"/alert_middleware/records",
                active:"tbAlarmRecords",
                region:false,
                domainProject:false
            })
            .when("/TBase/tbAlarmUsers", {
                templateUrl: "js/paas/tmpl/alauda_32.html",
                controller: "alauda_32Ctrl",
                parent:"TBase",
                rtype:"PaaS",
                jump:"/alert_middleware/users",
                active:"tbAlarmUsers",
                region:false,
                domainProject:false
            })
            .when("/TBase/tbAlarmMethods", {
                templateUrl: "js/paas/tmpl/alauda_33.html",
                controller: "alauda_33Ctrl",
                parent:"TBase",
                rtype:"PaaS",
                jump:"/alert_middleware/methods",
                active:"tbAlarmMethods",
                region:false,
                domainProject:false
            })
            .when("/TBase/tbSystemInfo", {
                templateUrl: "js/paas/tmpl/alauda_34.html",
                controller: "alauda_34Ctrl",
                parent:"TBase",
                rtype:"PaaS",
                jump:"/sys/systemInfo",
                active:"tbSystemInfo",
                region:false,
                domainProject:false
            })
            .when("/TBase/tbLicenseInfo", {
                templateUrl: "js/paas/tmpl/alauda_35.html",
                controller: "alauda_35Ctrl",
                parent:"TBase",
                rtype:"PaaS",
                jump:"/sys/licenseInfo",
                active:"tbLicenseInfo",
                region:false,
                domainProject:false
            })
            .when("/TBase/tbUserList", {
                templateUrl: "js/paas/tmpl/alauda_36.html",
                controller: "alauda_36Ctrl",
                parent:"TBase",
                rtype:"PaaS",
                jump:"/user/userList",
                active:"tbUserList",
                region:false,
                domainProject:false
            })
            /*TDsql*/
            .when("/TDsql/tdHome", {
                templateUrl: "js/paas/tmpl/alauda_37.html",
                controller: "alauda_37Ctrl",
                parent:"TDSQL",
                rtype:"PaaS",
                jump:"/tdsqlpcloud/?ctrl=home",
                active:"tdHome",
                region:false,
                domainProject:false
            })
            .when("/TDsql/tdInstanceManage", {
                templateUrl: "js/paas/tmpl/alauda_38.html",
                controller: "alauda_38Ctrl",
                parent:"TDSQL",
                rtype:"PaaS",
                jump:"/tdsqlpcloud/?ctrl=instance/manage",
                active:"tdInstanceManage",
                region:false,
                domainProject:false
            })
            .when("/TDsql/tdResourceDevice", {
                templateUrl: "js/paas/tmpl/alauda_39.html",
                controller: "alauda_39Ctrl",
                parent:"TDSQL",
                rtype:"PaaS",
                jump:"/tdsqlpcloud/?ctrl=resource/device",
                active:"tdResourceDevice",
                region:false,
                domainProject:false
            })
            .when("/TDsql/tdResourceSpec", {
                templateUrl: "js/paas/tmpl/alauda_40.html",
                controller: "alauda_40Ctrl",
                parent:"TDSQL",
                rtype:"PaaS",
                jump:"/tdsqlpcloud/?ctrl=resource/spec",
                active:"tdResourceSpec",
                region:false,
                domainProject:false
            })
            .when("/TDsql/tdResourceIdc", {
                templateUrl: "js/paas/tmpl/alauda_41.html",
                controller: "alauda_41Ctrl",
                parent:"TDSQL",
                rtype:"PaaS",
                jump:"/tdsqlpcloud/?ctrl=resource/idc",
                active:"tdResourceIdc",
                region:false,
                domainProject:false
            })
            .when("/TDsql/tdMonitorMysql", {
                templateUrl: "js/paas/tmpl/alauda_42.html",
                controller: "alauda_42Ctrl",
                parent:"TDSQL",
                rtype:"PaaS",
                jump:"/tdsqlpcloud/?ctrl=monitor/mysql",
                active:"tdMonitorMysql",
                region:false,
                domainProject:false
            })
            .when("/TDsql/tdProxyBase", {
                templateUrl: "js/paas/tmpl/alauda_43.html",
                controller: "alauda_43Ctrl",
                parent:"TDSQL",
                rtype:"PaaS",
                jump:"/tdsqlpcloud/?ctrl=proxy/base",
                active:"tdProxyBase",
                region:false,
                domainProject:false
            })
            .when("/TDsql/tdVipLvsgroup", {
                templateUrl: "js/paas/tmpl/alauda_44.html",
                controller: "alauda_44Ctrl",
                parent:"TDSQL",
                rtype:"PaaS",
                jump:"/tdsqlpcloud/?ctrl=vip/lvsgroup",
                active:"tdVipLvsgroup",
                region:false,
                domainProject:false
            })
            .when("/TDsql/tdVipLvsmachine", {
                templateUrl: "js/paas/tmpl/alauda_45.html",
                controller: "alauda_45Ctrl",
                parent:"TDSQL",
                rtype:"PaaS",
                jump:"/tdsqlpcloud/?ctrl=vip/lvsmachine",
                active:"tdVipLvsmachine",
                region:false,
                domainProject:false
            })
            .when("/TDsql/tdMonitorZookeeper", {
                templateUrl: "js/paas/tmpl/alauda_46.html",
                controller: "alauda_46Ctrl",
                parent:"TDSQL",
                rtype:"PaaS",
                jump:"/tdsqlpcloud/?ctrl=monitor/zookeeper",
                active:"tdMonitorZookeeper",
                region:false,
                domainProject:false
            })
            .when("/TDsql/tdMonitorScheduler", {
                templateUrl: "js/paas/tmpl/alauda_47.html",
                controller: "alauda_47Ctrl",
                parent:"TDSQL",
                rtype:"PaaS",
                jump:"/tdsqlpcloud/?ctrl=monitor/scheduler",
                active:"tdMonitorScheduler",
                region:false,
                domainProject:false
            })
            .when("/TDsql/tdMonitorManager", {
                templateUrl: "js/paas/tmpl/alauda_48.html",
                controller: "alauda_48Ctrl",
                parent:"TDSQL",
                rtype:"PaaS",
                jump:"/tdsqlpcloud/?ctrl=monitor/manager",
                active:"tdMonitorManager",
                region:false,
                domainProject:false
            })
            .when("/TDsql/tdMonitorOssserver", {
                templateUrl: "js/paas/tmpl/alauda_49.html",
                controller: "alauda_49Ctrl",
                parent:"TDSQL",
                rtype:"PaaS",
                jump:"/tdsqlpcloud/?ctrl=monitor/ossserver",
                active:"tdMonitorOssserver",
                region:false,
                domainProject:false
            })
            .when("/TDsql/tdMonitorOssjob", {
                templateUrl: "js/paas/tmpl/alauda_50.html",
                controller: "alauda_50Ctrl",
                parent:"TDSQL",
                rtype:"PaaS",
                jump:"/tdsqlpcloud/?ctrl=monitor/ossjob",
                active:"tdMonitorOssjob",
                region:false,
                domainProject:false
            })
            .when("/TDsql/tdMonitorOsslog", {
                templateUrl: "js/paas/tmpl/alauda_51.html",
                controller: "alauda_51Ctrl",
                parent:"TDSQL",
                rtype:"PaaS",
                jump:"/tdsqlpcloud/?ctrl=monitor/osslog",
                active:"tdMonitorOsslog",
                region:false,
                domainProject:false
            })
            .when("/TDsql/tdMonitorHdfs", {
                templateUrl: "js/paas/tmpl/alauda_52.html",
                controller: "alauda_52Ctrl",
                parent:"TDSQL",
                rtype:"PaaS",
                jump:"/tdsqlpcloud/?ctrl=monitor/hdfs",
                active:"tdMonitorHdfs",
                region:false,
                domainProject:false
            })
            .when("/TDsql/tdMonitorSyncjob", {
                templateUrl: "js/paas/tmpl/alauda_53.html",
                controller: "alauda_53Ctrl",
                parent:"TDSQL",
                rtype:"PaaS",
                jump:"/tdsqlpcloud/?ctrl=monitor/syncjob",
                active:"tdMonitorSyncjob",
                region:false,
                domainProject:false
            })
            .when("/TDsql/tdMonitorKafka", {
                templateUrl: "js/paas/tmpl/alauda_54.html",
                controller: "alauda_54Ctrl",
                parent:"TDSQL",
                rtype:"PaaS",
                jump:"/tdsqlpcloud/?ctrl=monitor/kafka",
                active:"tdMonitorKafka",
                region:false,
                domainProject:false
            })
            .when("/TDsql/tdOsswf", {
                templateUrl: "js/paas/tmpl/alauda_55.html",
                controller: "alauda_55Ctrl",
                parent:"TDSQL",
                rtype:"PaaS",
                jump:"/tdsqlpcloud/?ctrl=osswf",
                active:"tdOsswf",
                region:false,
                domainProject:false
            })
            .when("/TDsql/tdAlarmSearch", {
                templateUrl: "js/paas/tmpl/alauda_56.html",
                controller: "alauda_56Ctrl",
                parent:"TDSQL",
                rtype:"PaaS",
                jump:"/tdsqlpcloud/?ctrl=alarm_search",
                active:"tdAlarmSearch",
                region:false,
                domainProject:false
            })
            .when("/TDsql/tdAlarmConfig", {
                templateUrl: "js/paas/tmpl/alauda_57.html",
                controller: "alauda_57Ctrl",
                parent:"TDSQL",
                rtype:"PaaS",
                jump:"/tdsqlpcloud/?ctrl=alarm_config",
                active:"tdAlarmConfig",
                region:false,
                domainProject:false
            })
            .when("/TDsql/tdAlarmExcept", {
                templateUrl: "js/paas/tmpl/alauda_58.html",
                controller: "alauda_58Ctrl",
                parent:"TDSQL",
                rtype:"PaaS",
                jump:"/tdsqlpcloud/?ctrl=except",
                active:"tdAlarmExcept",
                region:false,
                domainProject:false
            })
            .when("/TDsql/tdAlarmGlobal", {
                templateUrl: "js/paas/tmpl/alauda_59.html",
                controller: "alauda_59Ctrl",
                parent:"TDSQL",
                rtype:"PaaS",
                jump:"/tdsqlpcloud/?ctrl=alarm_global",
                active:"tdAlarmGlobal",
                region:false,
                domainProject:false
            })
            .when("/TDsql/tdClusterManage", {
                templateUrl: "js/paas/tmpl/alauda_60.html",
                controller: "alauda_60Ctrl",
                parent:"TDSQL",
                rtype:"PaaS",
                jump:"/tdsqlpcloud/?ctrl=cluster/manage",
                active:"tdClusterManage",
                region:false,
                domainProject:false
            })
            .when("/TDsql/tdBusinessUserDatabaseApply", {
                templateUrl: "js/paas/tmpl/alauda_61.html",
                controller: "alauda_61Ctrl",
                parent:"TDSQL",
                rtype:"PaaS",
                jump:"/tdsqlpcloud/?ctrl=business/user_database_apply",
                active:"tdBusinessUserDatabaseApply",
                region:false,
                domainProject:false
            })
            .when("/TDsql/tdBusinessUserDbclusterGrant", {
                templateUrl: "js/paas/tmpl/alauda_62.html",
                controller: "alauda_62Ctrl",
                parent:"TDSQL",
                rtype:"PaaS",
                jump:"/tdsqlpcloud/?ctrl=business/user_dbcluster_grant",
                active:"tdBusinessUserDbclusterGrant",
                region:false,
                domainProject:false
            })
            .when("/TDsql/tdSysUser", {
                templateUrl: "js/paas/tmpl/alauda_63.html",
                controller: "alauda_63Ctrl",
                parent:"TDSQL",
                rtype:"PaaS",
                jump:"/tdsqlpcloud/?ctrl=sys/user",
                active:"tdSysUser",
                region:false,
                domainProject:false
            })
            .when("/TDsql/tdSysRole", {
                templateUrl: "js/paas/tmpl/alauda_64.html",
                controller: "alauda_64Ctrl",
                parent:"TDSQL",
                rtype:"PaaS",
                jump:"/tdsqlpcloud/?ctrl=sys/role",
                active:"tdSysRole",
                region:false,
                domainProject:false
            })
            .when("/TDsql/tdSysLog", {
                templateUrl: "js/paas/tmpl/alauda_65.html",
                controller: "alauda_65Ctrl",
                parent:"TDSQL",
                rtype:"PaaS",
                jump:"/tdsqlpcloud/?ctrl=sys/log",
                active:"tdSysLog",
                region:false,
                domainProject:false
            })
            .when("/TDsql/tdSysVersion", {
                templateUrl: "js/paas/tmpl/alauda_66.html",
                controller: "alauda_66Ctrl",
                parent:"TDSQL",
                rtype:"PaaS",
                jump:"/tdsqlpcloud/?ctrl=sys/version",
                active:"tdSysVersion",
                region:false,
                domainProject:false
            })
            /*CTsdb*/
            .when("/CTsdb/ctInstancesList", {
                templateUrl: "js/paas/tmpl/alauda_67.html",
                controller: "alauda_67Ctrl",
                parent:"CTSDB",
                rtype:"PaaS",
                jump:"/",
                active:"ctInstancesList",
                region:false,
                domainProject:false
            })
            .when("/CTsdb/ctOperationInsManage", {
                templateUrl: "js/paas/tmpl/alauda_68.html",
                controller: "alauda_68Ctrl",
                parent:"CTSDB",
                rtype:"PaaS",
                jump:"/#/admin/instance",
                active:"ctOperationInsManage",
                region:false,
                domainProject:false
            })
            .when("/CTsdb/ctProcessManage", {
                templateUrl: "js/paas/tmpl/alauda_69.html",
                controller: "alauda_69Ctrl",
                parent:"CTSDB",
                rtype:"PaaS",
                jump:"/#/task",
                active:"ctProcessManage",
                region:false,
                domainProject:false
            })
            .when("/CTsdb/ctEquipmentManage", {
                templateUrl: "js/paas/tmpl/alauda_70.html",
                controller: "alauda_70Ctrl",
                parent:"CTSDB",
                rtype:"PaaS",
                jump:"/#/admin/machine",
                active:"ctEquipmentManage",
                region:false,
                domainProject:false
            })
            .when("/CTsdb/ctInstancesMonitor", {
                templateUrl: "js/monitor/resource/tmpl/sqlDatabase.html",
                controller: "sqlDatabaseCtrl",
                reloadOnSearch: false,
                parent:"CTSDB",
                rtype:"PaaS",
                active:"ctInstancesMonitor",
                region:true,
                domainProject:false
            })
            .when("/TBase/TStudio", {
                templateUrl: "js/paas/tmpl/alauda_71.html",
                controller: "alauda_71Ctrl",
                parent:"TBase",
                rtype:"PaaS",
                jump:"",
                active:"TStudio",
                region:false,
                domainProject:false
            })
            /*云镜*/
            // .when("/CMirror/cmOverview", {
            //     templateUrl: "js/paas/tmpl/alauda_72.html",
            //     controller: "alauda_72Ctrl",
            //     parent:"CMirror",
            //     rtype:"PaaS",
            //     jump:"",
            //     active:"CMirror",
            //     region:false,
            //     domainProject:false
            // })
            // .when("/CMirror/cmhostList", {
            //     templateUrl: "js/paas/tmpl/alauda_73.html",
            //     controller: "alauda_73Ctrl",
            //     parent:"CMirror",
            //     rtype:"PaaS",
            //     jump:"/host/host_list",
            //     active:"cmhostList",
            //     region:false,
            //     domainProject:false
            // })
            // .when("/CMirror/cmpush", {
            //     templateUrl: "js/paas/tmpl/alauda_74.html",
            //     controller: "alauda_74Ctrl",
            //     parent:"CMirror",
            //     rtype:"PaaS",
            //     jump:"/host/push/",
            //     active:"cmpush",
            //     region:false,
            //     domainProject:false
            // })
            // .when("/CMirror/cmmalware", {
            //     templateUrl: "js/paas/tmpl/alauda_75.html",
            //     controller: "alauda_75Ctrl",
            //     parent:"CMirror",
            //     rtype:"PaaS",
            //     jump:"/events/malware/",
            //     active:"cmmalware",
            //     region:false,
            //     domainProject:false
            // })
            // .when("/CMirror/cmlogin", {
            //     templateUrl: "js/paas/tmpl/alauda_76.html",
            //     controller: "alauda_76Ctrl",
            //     parent:"CMirror",
            //     rtype:"PaaS",
            //     jump:"/events/login/",
            //     active:"cmlogin",
            //     region:false,
            //     domainProject:false
            // })
            // .when("/CMirror/cmbruteforce", {
            //     templateUrl: "js/paas/tmpl/alauda_77.html",
            //     controller: "alauda_77Ctrl",
            //     parent:"CMirror",
            //     rtype:"PaaS",
            //     jump:"/events/bruteforce/?status=1",
            //     active:"cmbruteforce",
            //     region:false,
            //     domainProject:false
            // })
            // .when("/CMirror/cmvul", {
            //     templateUrl: "js/paas/tmpl/alauda_78.html",
            //     controller: "alauda_78Ctrl",
            //     parent:"CMirror",
            //     rtype:"PaaS",
            //     jump:"/events/vul/",
            //     active:"cmvul",
            //     region:false,
            //     domainProject:false
            // })
            // .when("/CMirror/cmcomponents", {
            //     templateUrl: "js/paas/tmpl/alauda_79.html",
            //     controller: "alauda_79Ctrl",
            //     parent:"CMirror",
            //     rtype:"PaaS",
            //     jump:"/vul/components/",
            //     active:"cmcomponents",
            //     region:false,
            //     domainProject:false
            // })
            // .when("/CMirror/cmvul_scan_task", {
            //     templateUrl: "js/paas/tmpl/alauda_80.html",
            //     controller: "alauda_80Ctrl",
            //     parent:"CMirror",
            //     rtype:"PaaS",
            //     jump:"/vul/vul_scan_task/",
            //     active:"cmvul_scan_task",
            //     region:false,
            //     domainProject:false
            // })
            // .when("/CMirror/cmupgrade", {
            //     templateUrl: "js/paas/tmpl/alauda_81.html",
            //     controller: "alauda_81Ctrl",
            //     parent:"CMirror",
            //     rtype:"PaaS",
            //     jump:"/update/task/",
            //     active:"cmupgrade",
            //     region:false,
            //     domainProject:false
            // })
            // .when("/COC/manage", {
            //     templateUrl: "js/paas/tmpl/alauda_82.html",
            //     controller: "alauda_82Ctrl",
            //     parent:"COC",
            //     rtype:"PaaS",
            //     jump:"/module/manage",
            //     active:"manage",
            //     region:false,
            //     domainProject:false
            // })
            .when("/COC/cocCmdbServer", {
                templateUrl: "js/paas/tmpl/alauda_82.html",
                controller: "alauda_82Ctrl",
                parent:"COC",
                rtype:"PaaS",
                jump:"/cmdb/server",
                active:"cocCmdbServer",
                region:false,
                domainProject:false
            })
            .when("/COC/cocCmdbNetDevice", {
                templateUrl: "js/paas/tmpl/alauda_83.html",
                controller: "alauda_83Ctrl",
                parent:"COC",
                rtype:"PaaS",
                jump:"/cmdb/netdevice",
                active:"cocCmdbNetDevice",
                region:false,
                domainProject:false
            })
            .when("/COC/cocCmdbIdc", {
                templateUrl: "js/paas/tmpl/alauda_84.html",
                controller: "alauda_84Ctrl",
                parent:"COC",
                rtype:"PaaS",
                jump:"/cmdb/idc",
                active:"cocCmdbIdc",
                region:false,
                domainProject:false
            })
            .when("/COC/cocCmdbIdcExport", {
                templateUrl: "js/paas/tmpl/alauda_85.html",
                controller: "alauda_85Ctrl",
                parent:"COC",
                rtype:"PaaS",
                jump:"/cmdb/idcexport",
                active:"cocCmdbIdcExport",
                region:false,
                domainProject:false
            })
            // .when("/COC/cocCmdbIdcExport", {
            //     templateUrl: "js/paas/tmpl/alauda_86.html",
            //     controller: "alauda_86Ctrl",
            //     parent:"COC",
            //     rtype:"PaaS",
            //     jump:"/cmdb/idcexport",
            //     active:"cocCmdbIdcExport",
            //     region:false,
            //     domainProject:false
            // })
            .when("/COC/cocCmdbIdcLine", {
                templateUrl: "js/paas/tmpl/alauda_87.html",
                controller: "alauda_87Ctrl",
                parent:"COC",
                rtype:"PaaS",
                jump:"/cmdb/idcline",
                active:"cocCmdbIdcLine",
                region:false,
                domainProject:false
            })
            .when("/COC/cocCmdbCustomCategory", {
                templateUrl: "js/paas/tmpl/alauda_88.html",
                controller: "alauda_88Ctrl",
                parent:"COC",
                rtype:"PaaS",
                jump:"/cmdb/custom/category",
                active:"cocCmdbCustomCategory",
                region:false,
                domainProject:false
            })
            .when("/COC/cocModuleManage", {
                templateUrl: "js/paas/tmpl/alauda_89.html",
                controller: "alauda_89Ctrl",
                parent:"COC",
                rtype:"PaaS",
                jump:"/module/manage",
                active:"cocModuleManage",
                region:false,
                domainProject:false
            })
            .when("/COC/cocMonitorServer", {
                templateUrl: "js/paas/tmpl/alauda_90.html",
                controller: "alauda_90Ctrl",
                parent:"COC",
                rtype:"PaaS",
                jump:"/basemonitor/serverlist",
                active:"cocMonitorServer",
                region:false,
                domainProject:false
            })
            .when("/COC/cocMonitorNetdevice", {
                templateUrl: "js/paas/tmpl/alauda_91.html",
                controller: "alauda_91Ctrl",
                parent:"COC",
                rtype:"PaaS",
                jump:"/basemonitor/netdevicelist",
                active:"cocMonitorNetdevice",
                region:false,
                domainProject:false
            })
            .when("/COC/cocMonitorNetoutpoint", {
                templateUrl: "js/paas/tmpl/alauda_92.html",
                controller: "alauda_92Ctrl",
                parent:"COC",
                rtype:"PaaS",
                jump:"/basemonitor/netoutpointlist",
                active:"cocMonitorNetoutpoint",
                region:false,
                domainProject:false
            })
            .when("/COC/cocMonitorNetspecialLine", {
                templateUrl: "js/paas/tmpl/alauda_93.html",
                controller: "alauda_93Ctrl",
                parent:"COC",
                rtype:"PaaS",
                jump:"/basemonitor/netspeciallinelist",
                active:"cocMonitorNetspecialLine",
                region:false,
                domainProject:false
            })
            .when("/COC/cocMonitorMiddleware", {
                templateUrl: "js/paas/tmpl/alauda_94.html",
                controller: "alauda_94Ctrl",
                parent:"COC",
                rtype:"PaaS",
                jump:"/basemonitor/middleware",
                active:"cocMonitorMiddleware",
                region:false,
                domainProject:false
            })
            .when("/COC/cocMonitorSelfdefineMonitor", {
                templateUrl: "js/paas/tmpl/alauda_95.html",
                controller: "alauda_95Ctrl",
                parent:"COC",
                rtype:"PaaS",
                jump:"/basemonitor/selfdefinemonitor",
                active:"cocMonitorSelfdefineMonitor",
                region:false,
                domainProject:false
            })
            .when("/COC/cocMonitorCustomBoard", {
                templateUrl: "js/paas/tmpl/alauda_96.html",
                controller: "alauda_96Ctrl",
                parent:"COC",
                rtype:"PaaS",
                jump:"/basemonitor/customboard/board",
                active:"cocMonitorCustomBoard",
                region:false,
                domainProject:false
            })
            .when("/COC/cocAlarmOverview", {
                templateUrl: "js/paas/tmpl/alauda_97.html",
                controller: "alauda_97Ctrl",
                parent:"COC",
                rtype:"PaaS",
                jump:"/alarm/overview",
                active:"cocAlarmOverview",
                region:false,
                domainProject:false
            })
            .when("/COC/cocAlarmSearch", {
                templateUrl: "js/paas/tmpl/alauda_98.html",
                controller: "alauda_98Ctrl",
                parent:"COC",
                rtype:"PaaS",
                jump:"/alarm/searchlist",
                active:"cocAlarmSearch",
                region:false,
                domainProject:false
            })
            .when("/COC/cocAlarmStrategy", {
                templateUrl: "js/paas/tmpl/alauda_99.html",
                controller: "alauda_99Ctrl",
                parent:"COC",
                rtype:"PaaS",
                jump:"/alarm/strategylist",
                active:"cocAlarmStrategy",
                region:false,
                domainProject:false
            })
            .when("/COC/cocAlarmShield", {
                templateUrl: "js/paas/tmpl/alauda_100.html",
                controller: "alauda_100Ctrl",
                parent:"COC",
                rtype:"PaaS",
                jump:"/alarm/shield",
                active:"cocAlarmShield",
                region:false,
                domainProject:false
            })
            .when("/COC/cocToolmarketToolist", {
                templateUrl: "js/paas/tmpl/alauda_101.html",
                controller: "alauda_101Ctrl",
                parent:"COC",
                rtype:"PaaS",
                jump:"/toolmarket/toollist",
                active:"cocToolmarketToolist",
                region:false,
                domainProject:false
            })
            .when("/COC/cocToolmarketPublicAll", {
                templateUrl: "js/paas/tmpl/alauda_102.html",
                controller: "alauda_102Ctrl",
                parent:"COC",
                rtype:"PaaS",
                jump:"/toolmarket/public?tag=所有",
                active:"cocToolmarketPublicAll",
                region:false,
                domainProject:false
            })
            .when("/COC/cocToolmarketPublicInit", {
                templateUrl: "js/paas/tmpl/alauda_103.html",
                controller: "alauda_103Ctrl",
                parent:"COC",
                rtype:"PaaS",
                jump:"/toolmarket/public?tag=初始化",
                active:"cocToolmarketPublicInit",
                region:false,
                domainProject:false
            })
            .when("/COC/cocToolmarketPublicDiagnose", {
                templateUrl: "js/paas/tmpl/alauda_104.html",
                controller: "alauda_104Ctrl",
                parent:"COC",
                rtype:"PaaS",
                jump:"/toolmarket/public?tag=诊断",
                active:"cocToolmarketPublicDiagnose",
                region:false,
                domainProject:false
            })
            .when("/COC/cocToolmarketPublicRepaire", {
                templateUrl: "js/paas/tmpl/alauda_105.html",
                controller: "alauda_105Ctrl",
                parent:"COC",
                rtype:"PaaS",
                jump:"/toolmarket/public?tag=维护",
                active:"cocToolmarketPublicRepaire",
                region:false,
                domainProject:false
            })
            .when("/COC/cocToolmarketPublicDown", {
                templateUrl: "js/paas/tmpl/alauda_106.html",
                controller: "alauda_106Ctrl",
                parent:"COC",
                rtype:"PaaS",
                jump:"/toolmarket/public?tag=下架",
                active:"cocToolmarketPublicDown",
                region:false,
                domainProject:false
            })
            .when("/COC/cocToolmarketFlowlist", {
                templateUrl: "js/paas/tmpl/alauda_107.html",
                controller: "alauda_107Ctrl",
                parent:"COC",
                rtype:"PaaS",
                jump:"/toolmarket/flowlist",
                active:"cocToolmarketFlowlist",
                region:false,
                domainProject:false
            })
            .when("/COC/cocToolmarketSchedulelist", {
                templateUrl: "js/paas/tmpl/alauda_108.html",
                controller: "alauda_108Ctrl",
                parent:"COC",
                rtype:"PaaS",
                jump:"/toolmarket/schedulelist",
                active:"cocToolmarketSchedulelist",
                region:false,
                domainProject:false
            })
            .when("/COC/cocToolmarketLoglist", {
                templateUrl: "js/paas/tmpl/alauda_109.html",
                controller: "alauda_109Ctrl",
                parent:"COC",
                rtype:"PaaS",
                jump:"/toolmarket/loglist",
                active:"cocToolmarketLoglist",
                region:false,
                domainProject:false
            })
            .when("/COC/cocPackageList", {
                templateUrl: "js/paas/tmpl/alauda_110.html",
                controller: "alauda_110Ctrl",
                parent:"COC",
                rtype:"PaaS",
                jump:"/package/list",
                active:"cocPackageList",
                region:false,
                domainProject:false
            })
            .when("/COC/cocCloudServer", {
                templateUrl: "js/paas/tmpl/alauda_111.html",
                controller: "alauda_111Ctrl",
                parent:"COC",
                rtype:"PaaS",
                jump:"/cloud/server",
                active:"cocCloudServer",
                region:false,
                domainProject:false
            })
            .when("/COC/cocCloudUsers", {
                templateUrl: "js/paas/tmpl/alauda_112.html",
                controller: "alauda_112Ctrl",
                parent:"COC",
                rtype:"PaaS",
                jump:"/cloud/users",
                active:"cocCloudUsers",
                region:false,
                domainProject:false
            })
            .when("/COC/cocTenantuserUserlist", {
                templateUrl: "js/paas/tmpl/alauda_113.html",
                controller: "alauda_113Ctrl",
                parent:"COC",
                rtype:"PaaS",
                jump:"/tenancy/userlist2",
                active:"cocTenantuserUserlist",
                region:false,
                domainProject:false
            })
            .when("/COC/cocTenantuserGrouplist", {
                templateUrl: "js/paas/tmpl/alauda_114.html",
                controller: "alauda_114Ctrl",
                parent:"COC",
                rtype:"PaaS",
                jump:"/tenantuser/grouplist",
                active:"cocTenantuserGrouplist",
                region:false,
                domainProject:false
            })
            .when("/COC/cocTenantuserAuthlist", {
                templateUrl: "js/paas/tmpl/alauda_115.html",
                controller: "alauda_115Ctrl",
                parent:"COC",
                rtype:"PaaS",
                jump:"/tenantuser/authlist",
                active:"cocTenantuserAuthlist",
                region:false,
                domainProject:false
            })
            .when("/COC/cocPasswordlib", {
                templateUrl: "js/paas/tmpl/alauda_116.html",
                controller: "alauda_116Ctrl",
                parent:"COC",
                rtype:"PaaS",
                jump:"/passwordlib",
                active:"cocPasswordlib",
                region:false,
                domainProject:false
            })
            .when("/COC/cocOperationlog", {
                templateUrl: "js/paas/tmpl/alauda_117.html",
                controller: "alauda_117Ctrl",
                parent:"COC",
                rtype:"PaaS",
                jump:"/toollib/operationlog",
                active:"cocOperationlog",
                region:false,
                domainProject:false
            })
            .when("/TBDS/tbMyApply", {
                templateUrl: "js/paas/tmpl/alauda_118.html",
                controller: "alauda_118Ctrl",
                parent:"TBDS",
                rtype:"PaaS",
                jump:"/index.html#/tdAccess/myApply",
                active:"tbMyApply",
                region:false,
                domainProject:false
            })
            .when("/TBDS/tbHippoAccess", {
                templateUrl: "js/paas/tmpl/alauda_119.html",
                controller: "alauda_119Ctrl",
                parent:"TBDS",
                rtype:"PaaS",
                jump:"/index.html#/hippo/access",
                active:"tbHippoAccess",
                region:false,
                domainProject:false
            })
            .when("/TBDS/tbTdMertrics", {
                templateUrl: "js/paas/tmpl/alauda_120.html",
                controller: "alauda_120Ctrl",
                parent:"TBDS",
                rtype:"PaaS",
                jump:"/index.html#/tdMertrics",
                active:"tbTdMertrics",
                region:false,
                domainProject:false
            })
            .when("/TBDS/tbWherehows", {
                templateUrl: "js/paas/tmpl/alauda_121.html",
                controller: "alauda_121Ctrl",
                parent:"TBDS",
                rtype:"PaaS",
                jump:"/index.html#/tdAccess/wherehows",
                active:"tbWherehows",
                region:false,
                domainProject:false
            })
            .when("/TBDS/tbEasycountTaskmanage", {
                templateUrl: "js/paas/tmpl/alauda_122.html",
                controller: "alauda_122Ctrl",
                parent:"TBDS",
                rtype:"PaaS",
                jump:"/index.html#/easycount/taskmanage",
                active:"tbEasycountTaskmanage",
                region:false,
                domainProject:false
            })
            .when("/TBDS/tbEasycountDbmanage", {
                templateUrl: "js/paas/tmpl/alauda_123.html",
                controller: "alauda_123Ctrl",
                parent:"TBDS",
                rtype:"PaaS",
                jump:"/index.html#/easycount/dbmanage",
                active:"tbEasycountDbmanage",
                region:false,
                domainProject:false
            })
            .when("/TBDS/tbWorkflowCanvas", {
                templateUrl: "js/paas/tmpl/alauda_124.html",
                controller: "alauda_124Ctrl",
                parent:"TBDS",
                rtype:"PaaS",
                jump:"/index.html#/workflow/canvas",
                active:"tbWorkflowCanvas",
                region:false,
                domainProject:false
            })
            .when("/TBDS/tbWorkflowList", {
                templateUrl: "js/paas/tmpl/alauda_125.html",
                controller: "alauda_125Ctrl",
                parent:"TBDS",
                rtype:"PaaS",
                jump:"/index.html#/workflow/list",
                active:"tbWorkflowList",
                region:false,
                domainProject:false
            })
            .when("/TBDS/tbWorkflowServer", {
                templateUrl: "js/paas/tmpl/alauda_126.html",
                controller: "alauda_126Ctrl",
                parent:"TBDS",
                rtype:"PaaS",
                jump:"/index.html#/workflow/server",
                active:"tbWorkflowServer",
                region:false,
                domainProject:false
            })
            .when("/TBDS/tbReportList", {
                templateUrl: "js/paas/tmpl/alauda_127.html",
                controller: "alauda_127Ctrl",
                parent:"TBDS",
                rtype:"PaaS",
                jump:"/index.html#/report",
                active:"tbReportList",
                region:false,
                domainProject:false
            })
            .when("/TBDS/tbSupersqlHive", {
                templateUrl: "js/paas/tmpl/alauda_128.html",
                controller: "alauda_128Ctrl",
                parent:"TBDS",
                rtype:"PaaS",
                jump:"/index.html#/supersql/hive",
                active:"tbSupersqlHive",
                region:false,
                domainProject:false
            })
            .when("/TBDS/tbDataDbmanage", {
                templateUrl: "js/paas/tmpl/alauda_129.html",
                controller: "alauda_129Ctrl",
                parent:"TBDS",
                rtype:"PaaS",
                jump:"/index.html#/dbmanage",
                active:"tbDataDbmanage",
                region:false,
                domainProject:false
            })
            .when("/TBDS/tbDataMeta", {
                templateUrl: "js/paas/tmpl/alauda_130.html",
                controller: "alauda_130Ctrl",
                parent:"TBDS",
                rtype:"PaaS",
                jump:"/index.html#/meta",
                active:"tbDataMeta",
                region:false,
                domainProject:false
            })
            .when("/TBDS/tbDataMap", {
                templateUrl: "js/paas/tmpl/alauda_131.html",
                controller: "alauda_131Ctrl",
                parent:"TBDS",
                rtype:"PaaS",
                jump:"/index.html#/dataMap",
                active:"tbDataMap",
                region:false,
                domainProject:false
            })
            .when("/TBDS/tbOperationOverview", {
                templateUrl: "js/paas/tmpl/alauda_132.html",
                controller: "alauda_132Ctrl",
                parent:"TBDS",
                rtype:"PaaS",
                jump:"/index.html#/overview",
                active:"tbOperationOverview",
                region:false,
                domainProject:false
            })
            .when("/TBDS/tbOperationComponents", {
                templateUrl: "js/paas/tmpl/alauda_133.html",
                controller: "alauda_133Ctrl",
                parent:"TBDS",
                rtype:"PaaS",
                jump:"/index.html#/components",
                active:"tbOperationComponents",
                region:false,
                domainProject:false
            })
            .when("/TBDS/tbOperationAccesscontrol", {
                templateUrl: "js/paas/tmpl/alauda_134.html",
                controller: "alauda_134Ctrl",
                parent:"TBDS",
                rtype:"PaaS",
                jump:"/index.html#/accesscontrol?type=0",
                active:"tbOperationAccesscontrol",
                region:false,
                domainProject:false
            })
            .when("/TBDS/tbOperationBasefs", {
                templateUrl: "js/paas/tmpl/alauda_135.html",
                controller: "alauda_135Ctrl",
                parent:"TBDS",
                rtype:"PaaS",
                jump:"/index.html#/basefs/file",
                active:"tbOperationBasefs",
                region:false,
                domainProject:false
            })
            .when("/TBDS/tbOperationMonitor", {
                templateUrl: "js/paas/tmpl/alauda_136.html",
                controller: "alauda_136Ctrl",
                parent:"TBDS",
                rtype:"PaaS",
                jump:"/index.html#/monitor",
                active:"tbOperationMonitor",
                region:false,
                domainProject:false
            })
            .when("/TBDS/tbPlatformProject", {
                templateUrl: "js/paas/tmpl/alauda_137.html",
                controller: "alauda_137Ctrl",
                parent:"TBDS",
                rtype:"PaaS",
                jump:"/index.html#/project",
                active:"tbPlatformProject",
                region:false,
                domainProject:false
            })
            .when("/TBDS/tbPlatformResource", {
                templateUrl: "js/paas/tmpl/alauda_138.html",
                controller: "alauda_138Ctrl",
                parent:"TBDS",
                rtype:"PaaS",
                jump:"/index.html#/resource",
                active:"tbPlatformResource",
                region:false,
                domainProject:false
            })
            .when("/TBDS/tbPlatformUsermanage", {
                templateUrl: "js/paas/tmpl/alauda_139.html",
                controller: "alauda_139Ctrl",
                parent:"TBDS",
                rtype:"PaaS",
                jump:"/index.html#/usermanage",
                active:"tbPlatformUsermanage",
                region:false,
                domainProject:false
            })
            .when("/TBDS/tbPlatformSystem", {
                templateUrl: "js/paas/tmpl/alauda_140.html",
                controller: "alauda_140Ctrl",
                parent:"TBDS",
                rtype:"PaaS",
                jump:"/index.html#/system",
                active:"tbPlatformSystem",
                region:false,
                domainProject:false
            })
            .when("/TBDS/tbMlEngineer", {
                templateUrl: "js/paas/tmpl/alauda_141.html",
                controller: "alauda_141Ctrl",
                parent:"TBDS",
                rtype:"PaaS",
                jump:"/index.html#/ml",
                active:"tbMlEngineer",
                region:false,
                domainProject:false
            })
            .when("/TBDS/tbMlOthers", {
                templateUrl: "js/paas/tmpl/alauda_142.html",
                controller: "alauda_142Ctrl",
                parent:"TBDS",
                rtype:"PaaS",
                jump:"/index.html#/ml/others",
                active:"tbMlOthers",
                region:false,
                domainProject:false
            })
            .when("/TBDS/tbMlModelService", {
                templateUrl: "js/paas/tmpl/alauda_143.html",
                controller: "alauda_143Ctrl",
                parent:"TBDS",
                rtype:"PaaS",
                jump:"/index.html#/ml/modelService",
                active:"tbMlModelService",
                region:false,
                domainProject:false
            })
            .when("/TBDS/tbMlModelManage", {
                templateUrl: "js/paas/tmpl/alauda_144.html",
                controller: "alauda_144Ctrl",
                parent:"TBDS",
                rtype:"PaaS",
                jump:"/index.html#/ml/modelManager",
                active:"tbMlModelManage",
                region:false,
                domainProject:false
            })
            .when("/TBDS/tbMlResourceManage", {
                templateUrl: "js/paas/tmpl/alauda_145.html",
                controller: "alauda_145Ctrl",
                parent:"TBDS",
                rtype:"PaaS",
                jump:"/index.html#/ml/resourceManager",
                active:"resourceManager",
                region:false,
                domainProject:false
            })
            .when("/TBDS/tbMlModuleManage", {
                templateUrl: "js/paas/tmpl/alauda_146.html",
                controller: "alauda_146Ctrl",
                parent:"TBDS",
                rtype:"PaaS",
                jump:"/index.html#/ml/moduleManager",
                active:"tbMlModuleManage",
                region:false,
                domainProject:false
            })
            .when("/TBDS/tbMlAdminControl", {
                templateUrl: "js/paas/tmpl/alauda_147.html",
                controller: "alauda_147Ctrl",
                parent:"TBDS",
                rtype:"PaaS",
                jump:"/index.html#/ml/adminControl",
                active:"tbMlAdminControl",
                region:false,
                domainProject:false
            })
            .when("/TBDS/wellCome", {
                templateUrl: "js/paas/tmpl/alauda_148.html",
                controller: "alauda_148Ctrl",
                parent:"TBDS",
                rtype:"PaaS",
                jump:"/zhiyun/entrance",
                active:"TBDS_entrance",
                region:false,
                domainProject:false
            })
            .when("/alauda/alRegister", {
                templateUrl: "js/paas/tmpl/alauda_149.html",
                controller: "alauda_149Ctrl",
                parent:"Alauda",
                rtype:"PaaS",
                jump:"/devops/#/home/projects",
                active:"alRegister",
                region:false,
                domainProject:false
            })

            .otherwise({ redirectTo: "/view" });
        }
routeConfig.$inject = ["$routeProvider","$locationProvider"];
