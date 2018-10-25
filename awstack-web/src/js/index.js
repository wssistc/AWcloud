import routeConfig from "./route";
import httpConfig from "./http";
import translateConfig from "./i18n";

let app = angular.module("app", [
        "ngTable","ngAnimate","ui.bootstrap","ngSanitize","ui.select","ngMessages",
        "main","ngCsv","consumeAll","resourcePriceAll", 
        "ngRoute", "monitorAll", "userModule", "depviewModule", 
        "settingsAll", "menuAllModule", "orgModule", "roleAll", "paasModules",
        "departmentAll", "projectAll", "cvm", "system", "configure", 
        "services", "pascalprecht.translate", "filtersModule", "viewModule", 
        "logs", "auth", "topologyCtrl", "qcloud", "workflowModule", 
        "directiveModule", "ticketModule", "demotplModule","physicalConductorModule",
        "easyNetworkModule","shortcutsModule","physicalResourceModule","backupsModule",
        "vmModule","zrenderTopoModule", "KubernetesModule", "initSettingAll","commonModalModule","consoleModule"
    ]);
    if(GLOBALCONFIG &&  GLOBALCONFIG.APIHOST_1 &&  location.hostname ==  GLOBALCONFIG.APIHOST_1.hostname){
        app.constant("API_HOST", GLOBALCONFIG.APIHOST_1)
        window.ACTIVITI.CONFIG =  window.ACTIVITI.CONFIG
    }else{
        app.constant("API_HOST", GLOBALCONFIG.APIHOST)
    }
    app.config(routeConfig)
    app.config(httpConfig)
    app.config(translateConfig)
    
    app.run(["$rootScope", "$route", "alertSrv", "$translate", "API_HOST", "$timeout", "$location", "$uibModal","instancesSrv","bobMesSrv","resize","$http","$uibModalStack",
        function(rootscope, route, alert, translate, api_host, timeout, location, $uibModal,instancesSrv,bobMesSrv,resize,$http,$uibModalStack) {
            let modalOpen = $uibModal.open;
            let modalInstance;
            let ws = null;
            // let lws = null;
            rootscope.hideBottom = [
                // 'physicalConductor',
                // "node",
                // "flavors",
                // "quotas",
                // "flowManage",
                // "accesspolicy",
                // "physical",
                // "alarmevent",
                // "projects",
                // "snapshots",
                // "volumes",
                // "backups",
                // "resMetering"
            ].join('\b');
            function totalRes(name){
                rootscope.totalResShow=false;
                rootscope.totalResAlert=true;
                rootscope.TotalCont = "<dl class='resource-total'>"+
                                    "<dt><i class='icon-aw-prompt1'></i></dt>"+
                                    "<dd>"+
                                        translate.instant('aws.indextran.platform')+"<span>"+name+translate.instant('aws.indextran.resource_70')+"</span>"+translate.instant('aws.indextran.expansions')+
                                        "<a href='handbook/#/vm/shortResource' target='_blank'>当资源不足查看说明</a>"+
                                    "</dd>"+
                                "</dl>";
                                rootscope.$apply();
            }
            rootscope.closeTotal=function(){
                rootscope.totalResAlert=false;
                rootscope.totalResShow=true;
            }
            rootscope.closeTotalTips=function(){
                rootscope.totalResShow=false;
            }
            $uibModal.open = function(...x) {
                modalInstance = modalOpen.call($uibModal, ...x);
                return modalInstance;
            };
            rootscope.$on("$routeChangeStart", function(e, next, pre) {
                if($uibModalStack){
                    $uibModalStack.dismissAll();
                }
                /*try {
                    if (modalInstance) {
                        modalInstance.dismissAll();
                    }
                } catch (e) { console.error(e); } finally {
                    modalInstance = null;
                }*/
                // if (pre && (pre.originalPath == "/system/license" || pre.originalPath == "/configure/node") && lws) { //从节点配置和license切换到其他页面，关闭连接
                //     lws.close();
                // }
                // if (next.originalPath == "/system/license" 
                // || next.originalPath == "/system/general"  || next.originalPath == "/system/cephView") { //节点配置和license页面建立连接
                //     licenseFun(next.originalPath);
                // } else if (lws) {
                //     lws.close();
                // }
                /*if (rootscope.effeToken) {
                    location.path("/").replace();
                    rootscope.effeToken = false;
                }*/

                if(next&&next.originalPath=="/"){
                    rootscope.effeToken = false;
                }
            });
            // history.pushState(null, null, document.URL);
            // if (window.history && window.history.pushState) {
            //     function goBackBtn () {
            //         if(location.path()=='/'){
            //             if(localStorage.goBack=='true'){
            //                 localStorage.removeItem('goBack')
            //                 return
            //             }
            //             window.location.reload();
            //         }
            //     }
            //     window.addEventListener('popstate', goBackBtn);
            // }
            /*监听帮助信息*/
            rootscope.$watch(function() {
                return location.search().helpmodular;
            }, function(val) {
                if(val){
                   rootscope.systemHelp = val;
                }else{
                    rootscope.systemHelp = false;
                }
            })

            rootscope.$watch(function() {
                return rootscope.effeToken;
            }, function(val) {
                if (val) {
                    //考虑到有弹出层的时候token失效。
                    if($uibModalStack){
                        $uibModalStack.dismissAll();
                    }
                    /*try {
                        if (modalInstance) {
                            modalInstance.dismiss();
                        }
                    } catch (e) { console.error(e); }*/
                    /*$uibModal.open({
                        templateUrl: "relogin.html",
                        scope: rootscope
                    });*/
                    ws.close(); //token失效后关闭websocket并清空右上角弹出
                    alert.list = [];
                }
            });
            //用户退出登录后关掉websocket
            rootscope.logOut = function() {
                $http({
                    method: "POST",
                    url:"awstack-user/v1/logout"
                }).then(function(result) {
                    if(result && result.status == 0){
                        ws.close();
                        sessionStorage.removeItem("$AUTH_RETURN_URL");
                        localStorage.removeItem("$AWLOGINED");
                        localStorage.removeItem("$AUTH_TOKEN");
                        localStorage.removeItem("$MENUPREMIT");
                        localStorage.removeItem("rolename");
                        location.path("/").replace();
                    }
                });
            };

            rootscope.$watch(function() {
                return localStorage.$AWLOGINED;
            }, function(val) {
                if (val) {
                    rootscope.linkSocket = val;
                    lickFuc();
                    bobMesSrv.opened();
                } else {
                    if (ws) {
                        ws.close();
                    }
                    alert.list = [];
                }

            });

            function socket(url, open, message, error) {
                let ws = new WebSocket(url);
                console.log(ws)
                ws.onopen = open;
                ws.onmessage = message;
                ws.onclose = function() {
                    ws = Socket(url, open, message, error);
                    console.log(ws);
                }
                ws.onerror = error;
                return ws;
            }

            function matchStart(data,id,tipMsg){
                var idTypeArray= data.eventType.split(".");
                var idType = idTypeArray[0]+idTypeArray[1];
                if(sessionStorage[idType]){
                    var Ids = angular.fromJson(sessionStorage[idType]);
                    if(angular.isArray(Ids) && Ids.indexOf(data.eventMata[id])>-1){
                        alert.set(data.requestId, tipMsg, "building");
                    }
                }
                
            }
            function matchEnd(data,id,tipMsg){
                var idTypeArray= data.eventType.split(".");
                var idType = idTypeArray[0]+idTypeArray[1];
                if(sessionStorage[idType]){
                    var Ids = angular.fromJson(sessionStorage[idType]);
                    if(angular.isArray(Ids) && Ids.indexOf(data.eventMata[id])>-1){
                        alert.set(data.requestId, tipMsg, "success", 5000);
                        Ids = angular.copy(Ids).filter(item => item != data.eventMata[id] );
                    }
                    sessionStorage[idType] = angular.toJson(Ids);
                }
                
            }

            function computeMatchStart(data,id,tipMsg){
                var idTypeArray= data.eventType.split(".");
                var idType = idTypeArray[idTypeArray.length - 2];
                if(idType == "soft_delete"){
                    idType = "delete";
                }
                if(sessionStorage[idType]){
                    var Ids = angular.fromJson(sessionStorage[idType]);
                    if(angular.isArray(Ids) && Ids.indexOf(data.eventMata.instance_id)>-1){
                        alert.set(data.requestId, tipMsg, "building");
                    }
                }
                
            }

            function computeMatchEnd(data,id,tipMsg){
                var idTypeArray= data.eventType.split(".");
                var idType = idTypeArray[idTypeArray.length - 2];
                if(idType == "soft_delete"){
                    idType = "delete";
                }else if(idType == "compute_task"){
                    idType = "create";
                }
                if(sessionStorage[idType]){
                    var Ids = angular.fromJson(sessionStorage[idType]);
                    if(angular.isArray(Ids) && Ids.indexOf(data.eventMata[id])>-1){
                        if(tipMsg){
                            alert.set(data.requestId, tipMsg, "success", 5000);
                        }
                        Ids = angular.copy(Ids).filter(item => item != data.eventMata.instance_id );
                    }
                    sessionStorage[idType] = angular.toJson(Ids);
                }
                
            }
            function lickFuc() {
                if (rootscope.linkSocket) {
                    var url = api_host.MONITORWS + "/v1/event?regionKey=" + localStorage.regionKey + "&userUid=" + localStorage.userUid;
                    if ("WebSocket" in window) {
                        ws = new WebSocket(url);
                    }
                    ws.onopen = function() {
                        console.log(url);
                    };

                    ws.onmessage = function(e) {
                        var data = angular.fromJson(e.data);
                        // console.log(data);
                        var eventMata;

                        /*镜像迁移失败*/
                        if(e.data.indexOf('domain is not running')>-1){
                            alert.set("",'热迁移失败', "error", 5000);
                        }
                        
                        if (data.eventType) { //捕获事件消息
                            var eventType = data.eventType.split(".")[0];
                            if(data.eventType == "total.resources.ceph.usage.overflow"
                                ||data.eventType == "total.resources.memory.usage.overflow"
                                ||data.eventType == "total.resources.cpu.usage.overflow"
                                ){
                                if(localStorage.$AWLOGINED=="true"){
                                    var TotalListName=localStorage.TotalListName ? localStorage.TotalListName:"";
                                    if(data.name=='ceph'){
                                        data.name=translate.instant('aws.indextran.ceph');
                                    }else if(data.name=='memory'){
                                        data.name=translate.instant('aws.indextran.memory');
                                    }
                                    if(TotalListName==""){
                                        TotalListName=data.name;
                                    }else{
                                        if(TotalListName.indexOf(data.name)==-1){
                                            TotalListName=TotalListName+"、"+data.name;
                                        }
                                    }
                                    localStorage.TotalListName=TotalListName;
                                    var totalata = angular.copy(TotalListName);
                                    totalata = totalata.split('、');
                                    for(var i=0;i<totalata.length;i++){
                                        if(totalata[i].indexOf(":")>-1){
                                            totalata[i]=totalata[i].split(":")[1]+translate.instant('aws.indextran.ceph');
                                        }
                                    } 
                                    rootscope.ListName= totalata.join('、');
                                    if(data.name.indexOf(":")>-1){
                                       data.name = data.name.split(":")[1]+translate.instant('aws.indextran.ceph');
                                    } 
                                    totalRes(data.name)
                                    /*resize().call(function () {
                                        totalRes(data.name)
                                    });*/
                                }
                            }

                            if(data.eventType == "wechat_user_info") {
                                rootscope.$broadcast("wechatUserInfo", data);
                                return;
                            }
                            if(data.eventType == "volume.attach.end") {
                                rootscope.$broadcast("createIsoVolumeSuccess", data);
                            }

                            if(data.eventType=="ipsec_site_connection.update.status"){
                                rootscope.$broadcast("changeVpnStatus", data.meta);
                            }

                            if(data.eventType == "total.resources.ceph.usage.ok"
                                ||data.eventType == "total.resources.memory.usage.ok"
                                ||data.eventType == "total.resources.cpu.usage.ok"
                                ){
                                var TotalListName=localStorage.TotalListName;
                                var dataName = null;
                                if(data.name=='ceph'){
                                    data.name=translate.instant('aws.indextran.ceph');
                                    dataName = data.name;
                                }else if(data.name=='memory'){
                                    data.name=translate.instant('aws.indextran.memory');
                                    dataName = data.name;
                                }else if(data.name.indexOf(':')>-1){
                                    dataName = data.name.split(":")[0]
                                }else{
                                    dataName = data.name;
                                }
                                if (TotalListName.indexOf("、")>-1) {
                                    if(TotalListName.indexOf(("、"+dataName))>-1){
                                        TotalListName=TotalListName.replace(("、"+data.name),"")
                                    }else if(TotalListName.indexOf(dataName)>-1){
                                        TotalListName=TotalListName.replace((data.name+"、"),"")
                                    }
                                }else{
                                    TotalListName=TotalListName.replace(data.name,"") 
                                }
                                localStorage.TotalListName=TotalListName;
                                var totalata = angular.copy(TotalListName);
                                totalata = totalata.split('、');
                                for(var i=0;i<totalata.length;i++){
                                    if(totalata[i].indexOf(":")>-1){
                                        totalata[i]=totalata[i].split(":")[1]+translate.instant('aws.indextran.ceph');
                                    }
                                }
                                rootscope.ListName= totalata.join('、');
                                if(localStorage.TotalListName==""){
                                    rootscope.totalResShow=false;
                                }
                            }

                            if (eventType == "cluster") { //捕获集群事件消息
                                rootscope.$broadcast("extensionSocket", data);
                            }
                            if (data.eventType == "port.create.end" || data.eventType == "compute.instance.create.end") {
                                data.meta.replace(/\\/g, "");
                                eventMata = angular.fromJson(data.meta);
                            } else {
                                data.meta.replace(/\\/g, "");
                                data.meta.replace(/\//g, "");
                                eventMata = angular.fromJson(data.meta);  
                            }
                            data.eventMata = eventMata;
                            //捕获高可用消息，高可用没有从页面触发
                            switch (data.eventType) {
                                //case "compute.instance.rebuild.scheduled":
                                case "compute.instance.rebuild.start":
                                case "compute.instance.rebuild.end":
                                case "compute.instance.rebuild.error":
                                case "compute.instance.volume.detach.error":
                                    sessionStorage.setItem(data.eventType, data.eventType);
                                    break;
                                case "snapshot.create.start":
                                case "snapshot.create.end":
                                    var type = sessionStorage.getItem(data.eventType);
                                    if(type == "compute.instance.mkimg.start" || type == "compute.instance.mkimg.end" ){
                                        data.resourceName = "" ;
                                    }
                                    break;
                            }
                            if(data.resourceName == "fixedImageInstanceName"){
                                var errorMsg = "操作失败：" + eventMata.message;
                                var tipMsg = translate.instant("aws.sockets.opLog." + sessionStorage.getItem(data.eventType));
                            }else{
                                var errorMsg = data.resourceName + "操作失败：" + eventMata.message;
                                var tipMsg = data.resourceName + translate.instant("aws.sockets.opLog." + sessionStorage.getItem(data.eventType));
                            }


                            switch (data.eventType) {
                                case "compute.instance.resize.start":
                                case "compute.instance.finish_resize.end":
                                case "compute.instance.resize.confirm.end":
                                case "resize_instance":
                                    if(data.eventMata && data.eventMata.resizeType == "cold_migrate"){
                                        tipMsg = data.resourceName + translate.instant("aws.sockets.opLog." + data.eventMata.resizeType +"." + sessionStorage.getItem(data.eventType));
                                    }
                                    break;
                                case "compute.instance.live_migration.post.dest.end":
                                    rootscope.$broadcast("serverSocket", data);
                                    break;
                            }
                            
                            
                        } else if (data.alarmType == "computeha") {
                            data.severMata = angular.fromJson(data.reason.replace(/\\/g, ""));
                            alert.set(data.requestId, data.severMata.subject, "success", 5000);
                        }else if(data.type == "Monitor_SystemCheckerMessage"||data.type == "Monitor_SubcheckerMessage"){
                            //系统巡检
                            rootscope.$broadcast("systemMonitor", data);
                            return;
                        }
                        if (sessionStorage.getItem(data.eventType)) {
                            if (sessionStorage.getItem(data.eventType) == "compute.instance.upgrade.confirm.start" || sessionStorage.getItem(data.eventType) == "compute.instance.upgrade.confirm.end") {
                                data.eventType = sessionStorage.getItem(data.eventType);
                            }
                            if(data.eventType.indexOf("instance")>-1){
                                if(location.path() == "/cvm/netTopo" && location.search()){
                                    if(location.search() && location.search().type == "edit"){
                                        rootscope.$broadcast("refreshTopo",location.search().type);
                                    }else{
                                        rootscope.$broadcast("refreshTopo");
                                    }
                                }
                            }
                            if (data.eventType != "compute.instance.exists"  &&
                                (eventType == "compute" || eventType == "resize_instance" || eventType == "compute_task") ) {
                                switch (data.eventType) {
                                    case "compute.instance.volume.detach.error":
                                    case "compute.instance.create.error":
                                    case "compute_task.build_instances":
                                    case "compute.instance.rebuild.error":
                                        if (eventMata.message.indexOf("No fixed IP addresses available for network") > -1) {
                                            errorMsg = data.resourceName + translate.instant("aws.metaMsg.noFixedIP");
                                        }else if(eventMata.message.indexOf("There are not enough hosts available.") > -1){
                                            errorMsg = data.resourceName + translate.instant("aws.metaMsg.noHostAvail");
                                        }else if(eventMata.message.indexOf("Binding failed for port") > -1){
                                            errorMsg = data.resourceName + translate.instant("aws.metaMsg.Bindingportfail");
                                        }else if(eventMata.message.indexOf("Build of instance") > -1){
                                            errorMsg = data.resourceName + translate.instant("aws.metaMsg.buildInstancefail");
                                        }else if(eventMata.message.indexOf("disk is too small for requested image") > -1){
                                            errorMsg = data.resourceName + translate.instant("aws.metaMsg.buildInstancefail_2");
                                        }else if(eventMata.message.indexOf("Insufficient compute resources") > -1 && eventMata.message.indexOf("Free memory") > -1 ){
                                            errorMsg = data.resourceName + translate.instant("aws.metaMsg.InsufficientMemory");
                                        }else if(eventMata.message.indexOf("Insufficient compute resources") > -1 && eventMata.message.indexOf("Free vcpu") > -1 ){
                                            errorMsg = data.resourceName + translate.instant("aws.metaMsg.InsufficientVcpu");
                                        }else if(eventMata.message.indexOf("internal error") > -1){
                                            errorMsg = data.resourceName + translate.instant("aws.metaMsg.internalError");
                                        }else if(eventMata.message.indexOf("no target device") > -1){
                                            errorMsg = data.resourceName + translate.instant("aws.metaMsg.volumeError_1")+eventMata.message.split("no target device")[1]+translate.instant("aws.metaMsg.volumeError_3");
                                        }else if(eventMata.message.indexOf("Unable to detach from guest transient domain") > -1){
                                            errorMsg = data.resourceName + translate.instant("aws.metaMsg.volumeError_2");
                                        }else if(eventMata.message.indexOf("Volume status must be available or error or error_restoring or error_extending and must not be migrating") > -1){
                                            errorMsg = data.resourceName+translate.instant("aws.metaMsg.hasQuickError")
                                        }else if(eventMata.message.indexOf("domain is not running") > -1){
                                            errorMsg = data.resourceName+translate.instant("aws.metaMsg.domainInvalid")
                                        }
                                        data.eventMata.status = "error";
                                        alert.set(data.requestId, errorMsg, "error", 5000);
                                        if(data.eventType == "compute.instance.create.error" 
                                           || data.eventType == "compute_task.build_instances"){
                                            computeMatchEnd(data,"instance_id")
                                            //sessionStorage.removeItem(data.eventType);
                                        }
                                        
                                        break;
                                    case "resize_instance":
                                        alert.set(data.requestId, tipMsg, "error", 5000);
                                        sessionStorage.removeItem(data.eventType);
                                        break;
                                    
                                    case "compute.instance.resize.prep.start":
                                    case "compute.instance.resize.prep.end":
                                    case "compute.instance.resize.start":
                                    case "compute.instance.live_migration.pre.start":
                                    case "compute.instance.restore.start":
                                    case "compute.instance.snapshot.start":
                                    case "compute.instance.resize.confirm.start":
                                    case "compute.instance.upgrade.confirm.start":
                                    case "compute.instance.rebuild.start":
                                    case "compute.phy_instance.create.start":
                                        alert.set(data.requestId, tipMsg, "building",5000);
                                        sessionStorage.removeItem(data.eventType);
                                        break;
                                    case "compute.instance.volume.attach":
                                    case "compute.instance.volume.detach":
                                    case "compute.instance.shutdown.start":
                                    case "compute.instance.shutdown.end":
                                    sessionStorage.removeItem(data.eventType);
                                        break;

                                    //存在批量操作的start捕获
                                    case "compute.instance.create.start":
                                        if(data.resourceName == "fixedImageInstanceName"){
                                            alert.set(data.requestId, tipMsg, "building");
                                            sessionStorage.removeItem(data.eventType);
                                        }else{
                                           alert.set(data.requestId, tipMsg, "building",10000);
                                            setTimeout(function() {
                                                sessionStorage.removeItem(data.eventType);
                                            }, 30000); 
                                        }
                                        
                                        break;
                                    case "compute.instance.power_off.start":
                                    case "compute.instance.power_on.start":
                                    case "compute.instance.soft_delete.start":
                                    case "compute.instance.delete.start":
                                    case "compute.instance.reboot.start":
                                    case "compute.instance.pause.start":
                                    case "compute.instance.unpause.start":
                                    case "compute.instance.suspend.start":
                                    case "compute.instance.resume.start":
                                    case "compute.instance.restore.start":
                                    case "compute.phy_instance.power_off.start":
                                    case "compute.phy_instance.power_on.start":
                                    case "compute.phy_instance.reboot.start":
                                    case "compute.phy_instance.delete.start":
                                        computeMatchStart(data,"instance_id",tipMsg)
                                        break;
                                    case "compute_task.build_phy_instances":
                                        if(JSON.parse(data.meta).message.indexOf("No valid host was found") > -1){
                                            var tips =translate.instant("aws.sockets.opLog.compute.phy_instance.nohost")
                                            alert.set(data.requestId, tips, "error", 5000);
                                        }      
                                    break;
                                    case "compute.instance.create.end":
                                        if(data.resourceName == "fixedImageInstanceName"){
                                            alert.set(data.requestId, tipMsg, "success", 5000);
                                            sessionStorage.removeItem(data.eventType);
                                        }else{
                                            computeMatchEnd(data,"instance_id",tipMsg)
                                        }
                                        break;
                                    case "compute.instance.create.end":
                                    case "compute.instance.power_off.end":
                                    case "compute.instance.power_on.end":
                                    case "compute.instance.soft_delete.end":
                                    case "compute.instance.delete.end":
                                    case "compute.instance.reboot.end":
                                    case "compute.instance.pause.end":
                                    case "compute.instance.unpause.end":
                                    case "compute.instance.suspend.end":
                                    case "compute.instance.resume.end":
                                    case "compute.instance.restore.end":
                                    case "compute.phy_instance.power_off.end":
                                    case "compute.phy_instance.power_on.end":
                                    case "compute.phy_instance.reboot.end":
                                    case "compute.phy_instance.delete.end":
                                        computeMatchEnd(data,"instance_id",tipMsg)
                                        break;
                                    default:
                                        alert.set(data.requestId, tipMsg, "success", 5000);
                                        sessionStorage.removeItem(data.eventType);
                                        break;
                                }
                                rootscope.$broadcast("serverSocket", data);
                            } else if (eventType == "compute" && data.resourceName == "fixedImageInstanceName") {
                                rootscope.$broadcast("makeImageSocket", data);

                            } else if (eventType == "volume") {
                                switch (data.eventType) {
                                    case "volume.create.error":
                                        alert.set(data.requestId, errorMsg, "error", 5000);
                                        sessionStorage.removeItem(data.eventType);
                                        break;
                                    case "volume.resize.start":
                                    //case "volume.update.start":
                                    case "volume.create.start":
                                    case "volume.detach.start":
                                    case "volume.attach.start":
                                        alert.set(data.requestId, tipMsg, "building",5000);
                                        sessionStorage.removeItem(data.eventType);
                                        break;
                                    case "volume.delete.start":
                                        matchStart(data,"volume_id",tipMsg)
                                        break;
                                    case "volume.delete.end":
                                        matchEnd(data,"volume_id",tipMsg)
                                        break;
                                    default:
                                        alert.set(data.requestId, tipMsg, "success", 5000);
                                        sessionStorage.removeItem(data.eventType);
                                        break;
                                }
                                rootscope.$broadcast("snapSocket", data);
                                rootscope.$broadcast("volumeSocket", data);
                            } else if (eventType == "snapshot") {
                                switch (data.eventType) {
                                    case "snapshot.create.error":
                                        alert.set(data.requestId, errorMsg, "error", 5000);
                                        sessionStorage.removeItem(data.eventType);
                                        break;
                                    case "snapshot.create.start":
                                        if(sessionStorage.getItem(data.eventType) == "compute.instance.mkimg.start"){
                                            alert.set(data.requestId, tipMsg, "building",5000);
                                            sessionStorage.removeItem(data.eventType); 
                                        }else{
                                            matchStart(data,"volume_id",tipMsg)
                                        }
                                                                               
                                       
                                        break;
                                    case "snapshot.create.end":
                                        if(sessionStorage.getItem(data.eventType) == "compute.instance.mkimg.end" ){
                                            alert.set(data.requestId, tipMsg,"success", 5000);
                                            sessionStorage.removeItem(data.eventType); 
                                        }                                       
                                        matchEnd(data,"volume_id",tipMsg)
                                        break;
                                    case "snapshot.delete.start":
                                    case "snapshot.rollback.start":
                                        matchStart(data,"snapshot_id",tipMsg)
                                        break;
                                    case "snapshot.delete.end":
                                    case "snapshot.rollback.end":
                                        matchEnd(data,"snapshot_id",tipMsg)
                                        break;
                                    default:
                                        alert.set(data.requestId, tipMsg, "success", 5000);
                                        sessionStorage.removeItem(data.eventType);
                                        break;
                                }
                                rootscope.$broadcast("snapSocket", data);
                                rootscope.$broadcast("serverSocket", data);
                            } else if (eventType == "backup"){
                                    console.log(data.eventType);
                                switch (data.eventType){
                                    case "backup.create.start":
                                        alert.set(data.requestId, tipMsg, "building",5000);
                                        setTimeout(function() {
                                            sessionStorage.removeItem(data.eventType);
                                        }, 10000);
                                        break;
                                    case "backup.delete.start":
                                    case "backup.restore.start":
                                    case "backup.reset_status.start":
                                        matchStart(data,"backup_id",tipMsg)
                                        break;
                                    case "backup.delete.end":
                                    case "backup.restore.end":
                                    case "backup.reset_status.end":
                                        matchEnd(data,"backup_id",tipMsg)
                                        break;
                                    case "backup.create.end":
                                        alert.set(data.requestId, tipMsg, "success", 5000);
                                        break;
                                    case "backup.create.error":
                                        if(eventMata.message.indexOf("Create backup aborted, expected volume status") > -1){
                                            errorMsg = data.resourceName + translate.instant("aws.metaMsg.backupError1");
                                        }else if(eventMata.message.indexOf("Create backup aborted, expected backup status") > -1){
                                            errorMsg = data.resourceName + translate.instant("aws.metaMsg.backupError2");
                                        }else if(eventMata.message.indexOf("Hash block size has changed since the last") > -1){
                                            errorMsg = data.resourceName + translate.instant("aws.metaMsg.backupError3");
                                        }else if(eventMata.message.indexOf("Volume size increased since the last backup. Do a full backup") > -1){
                                            errorMsg = data.resourceName + translate.instant("aws.metaMsg.backupError4");
                                        }else if(eventMata.message.indexOf("Backup volume metadata failed") > -1){
                                            errorMsg = data.resourceName + translate.instant("aws.metaMsg.backupError5");
                                        }
                                        alert.set(data.requestId, errorMsg, "error", 5000);
                                        break;
                                }
                                rootscope.$broadcast("backupSocket", data);
                                
                            }else if (eventType == "network" || eventType == "floatingip" || eventType == "router" || eventType == "subnet" 
                                    || eventType == "keypair" || eventType == "security_group" || eventType == "security_group_rule" 
                                    || eventType == "port" || eventType == "aggregate" || eventType == "firewall_rule" || eventType == "firewall_policy" 
                                    || eventType == "firewall" || eventType == "loadbalancer" || eventType == "listener" || eventType == "pool" 
                                    || eventType == "member" || eventType == "scheduler" || eventType == "healthmonitor" || eventType == "cluster"
                                    || eventType == "backup") {
                                switch (data.eventType) {
                                    case "network.create.error":
                                        alert.set(data.requestId, errorMsg, "error", 5000);
                                        break;
                                    case "scheduler.create_volume":
                                        if(eventMata.message.indexOf("No valid host was found.") > -1){
                                            errorMsg = translate.instant("aws.metaMsg.noharddisk");
                                        }
                                        alert.set(data.requestId, errorMsg, "error", 5000);
                                        break;
                                    case "floatingip.update.end":
                                        alert.set(data.requestId, tipMsg, "success", 5000);
                                        rootscope.$broadcast("serverSocket", data);
                                        sessionStorage.removeItem(data.eventType);
                                        break;
                                    case "network.create.end":
                                    case "network.update.end":
                                    case "subnet.create.end":
                                    case "subnet.update.end":
                                    case "router.create.end":
                                    case "router.update.end":
                                    case "router.interface.create":
                                    case "floatingip.create.end":
                                    case "keypair.create.end":
                                    case "keypair.import.end":
                                    case "security_group.create.end":
                                    case "security_group.update.end":
                                    case "security_group_rule.create.end":
                                    case "port.update.end":
                                    case "aggregate.create.end":
                                    case "aggregate.updateprop.end":
                                    case "aggregate.updatemetadata.end":
                                    case "aggregate.addhost.end":
                                    case "aggregate.removehost.end":
                                    case "firewall_rule.create.end":
                                    case "firewall_rule.update.end":
                                    case "firewall_policy.create.end":
                                    case "firewall_policy.update.end":
                                    case "loadbalancer.create.end":
                                    case "loadbalancer.update.end":
                                    case "listener.create.end":
                                    case "listener.update.end":
                                    case "pool.create.end":
                                    case "pool.update.end":
                                    case "member.create.end":
                                    case "member.update.end":
                                    case "healthmonitor.create.end":
                                    case "healthmonitor.update.end":
                                        alert.set(data.requestId, tipMsg, "success", 5000);
                                        sessionStorage.removeItem(data.eventType);
                                        break;
                                    case "cluster.instance.end":
                                        alert.set(data.requestId, tipMsg, "building");
                                        rootscope.$broadcast("serverSocket", data);

                                    case "network.delete.end":
                                    case "subnet.delete.end":
                                    case "router.delete.end":
                                    case "router.interface.delete":
                                    case "floatingip.delete.end":
                                    case "keypair.delete.end":
                                    case "security_group.delete.end":
                                    case "security_group_rule.delete.end":
                                    case "aggregate.delete.end":
                                    case "firewall_rule.delete.end":
                                    case "firewall_policy.delete.end":
                                    case "loadbalancer.delete.end":
                                    case "listener.delete.end":
                                    case "pool.delete.end":
                                    case "member.delete.end":
                                    case "healthmonitor.delete.end":
                                    case "firewall.create.end":
                                    //case "firewall.update.end":
                                    case "firewall.delete.end":
                                    case "backup.create.end":
                                        rootscope.$broadcast("serverSocket", data);
                                        alert.set(data.requestId, tipMsg, "success", 5000);
                                        setTimeout(function() {
                                            sessionStorage.removeItem(data.eventType);
                                        }, 10000);
                                        break;
                                    case "firewall.update.end":
                                        if(location.path() == "/cvm/netTopo" && rootscope.topoAddFirewall){
                                            rootscope.topoAddFirewall = false;
                                            return;
                                        }
                                        rootscope.$broadcast("serverSocket", data);
                                        alert.set(data.requestId, tipMsg, "success", 5000);
                                        setTimeout(function() {
                                            sessionStorage.removeItem(data.eventType);
                                        }, 10000);
                                        break;
                                    default:
                                        sessionStorage.removeItem(data.eventType);
                                }
                            }
                        }
                        rootscope.$apply();
                    };
                    ws.onclose = function() {};
                }
            }

            function licenseFun(path) {
                if (rootscope.linkSocket) {
                    var url = api_host.WEBSOCKET + "/v1/bobmsg/operation?X-Register-Code=" + localStorage.regionKey;
                    if ("WebSocket" in window) {
                        lws = new WebSocket(url);
                    }
                    lws.onopen = function() {
                        console.log(url);
                    };
                    lws.onmessage = function(e) {
                        if (sessionStorage.getItem("license") && e.data.indexOf("license") > -1) {
                            if (e.data.indexOf("format") > -1) {
                                alert.set("", translate.instant("aws.license.format_error"), "error", 5000);
                            } else if (e.data.indexOf("check") > -1) {
                                alert.set("", translate.instant("aws.license.check_error"), "error", 5000);
                            } else if (e.data.indexOf("failed") > -1) {
                                alert.set("", translate.instant("aws.license.error"), "error", 5000);
                            } else if (e.data.indexOf("update") > -1) {
                                alert.set("", translate.instant("aws.license.success"), "success", 5000);
                                rootscope.$broadcast("licenseSocket", e.data);
                            }

                            setTimeout(function() {
                                sessionStorage.removeItem("license");
                            }, 3000);
                        }
                        if (path == "/system/datacluster") {
                            if (/^\{\S*\}$/.test(e.data)) {
                                var data = angular.fromJson(e.data);
                                if (data.event_type&&data.event_type.indexOf('nodeMng')>-1) {
                                    var nodeMsg = translate.instant("aws.node.status." + data.event_type);
                                    switch (data.event_type) {
                                        case "nodeMng.add.ing":
                                        case "nodeMng.del.ing":
                                        case "nodeMng.promote.ing":
                                        case "nodeMng.manit.ing":
                                        case "nodeMng.active.ing":
                                            alert.set(data.nodes[0], nodeMsg, "building");
                                            break;
                                        case "nodeMng.add.fail":
                                        case "nodeMng.del.fail":
                                        case "nodeMng.promote.fail":
                                        case "nodeMng.manit.fail":
                                        case "nodeMng.active.fail":
                                            alert.set(data.nodes[0], nodeMsg, "error");
                                            break;
                                        default:
                                            alert.set(data.nodes[0], nodeMsg, "success", 5000);
                                            break;
                                    }
                                    rootscope.$broadcast("nodeSocket", data);
                                }
                            }
                        }
                        // if(path == "/system/general"){
                        //     if(e.data == "config.Update.success") {
                        //         rootscope.$broadcast("recycleTimeSuccess", e.data);
                        //     }
                        // }

                        // if(path == "/system/storageManagement") {
                        //     if(e.data == "config.Update.success") {
                        //         rootscope.$broadcast("storageDockingSuccess", e.data);
                        //     }else if(e.data.indexOf("config.Update.fail") > -1) {
                        //         rootscope.$broadcast("storageDockingFailed", e.data);
                        //     }else if(e.data == "checkout.ip.success") {
                        //         rootscope.$broadcast("checkIpSuccess", e.data);
                        //     }else if(e.data.indexOf("checkout.ip.fail") > -1) {
                        //         rootscope.$broadcast("checkIpFailed", e.data);
                        //     }else if(e.data.indexOf("share_dir") > -1) {
                        //         rootscope.$broadcast("checkNfsSuccess", e.data);
                        //     }else if(e.data.indexOf("nfs.sharedir.fail") > -1) {
                        //         rootscope.$broadcast("checkNfsFiled", e.data);
                        //     }
                        // }

                        if(path == "/system/cephView"){
                            if(e.data.indexOf("ceph_osd_restart.py.success") > -1){
                                rootscope.$broadcast("restartOSDSuccess", e.data);
                            }else if(e.data.indexOf("ceph_osd_restart.py.failed") > -1){
                                rootscope.$broadcast("restartOSDFailed", e.data);
                            }else if(e.data.indexOf("operate.ceph.disk.ing") > -1 ){
                                rootscope.$broadcast("startTasking", e.data);
                            }else if(e.data.indexOf("operate.ceph.disk.fail.server failed") > -1){
                                rootscope.$broadcast("startTaskFailed", e.data);
                            }else if(e.data.indexOf("operate.ceph.disk.success") > -1){
                                rootscope.$broadcast("startTaskSuccess", e.data);
                            }
                        }
                        
                        rootscope.$apply();
                    };
                }
            }

            // let licenseList = [
                // {keywords:"resource-vm-addNetwork",selected:false},
                // {keywords:"resource-vm-removeNetwork",selected:false},
                // {keywords:"resource-vm-modifyFixdIp",selected:false},
                // {keywords:"resource-vm-bindfloatingIp",selected:false},
                // {keywords:"resource-vm-removefloatIpDis",selected:false},
                // {keywords:"resource-vm-changeMac",selected:false},
                // {keywords:"resource-vm-loadIptables",selected:false},
                // {keywords:"resource-vm-networkCardConfig",selected:true},
                // {keywords:"resource-vm-create",selected:true},

                // {keywords:"resource-vmgports-load",selected:true},
                // {keywords:"resource-vmgports-unload",selected:true},
                // {keywords:"resource-vm-create",selected:false},
                
            // ]
            // localStorage.setItem("LicenseList",JSON.stringify(licenseList))
        }
    ]);
    export default app;
