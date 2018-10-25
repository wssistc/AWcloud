import "../../user/userDataSrv";
import "./cvmViewSrv";
import "../../project/projectSrv";
import "../../department/depviewSrv";
import "../../monitor/alarmManagement/alarmEventSrv";
import {PiePanelDefault} from"../../chartpanel";


angular.module("cvmViewModule", ["ngTable", "ngAnimate", "ui.bootstrap","ngSanitize","cvmViewSrv","alarmEventSrvModule"])
.controller("cvmViewCtrl", ["$scope","$rootScope", "NgTableParams","$timeout","userDataSrv","$translate","cvmViewSrv","$uibModal","projectDataSrv","depviewsrv","alarmEventSrv",
    function(scope, rootScope, NgTableParams,timeout,userDataSrv,$translate,cvmViewSrv,uibModal,projectDataSrv,depviewsrv,alarmEventSrv) {
        var self = scope;
        self.headers = {
            "name": $translate.instant("aws.users.userName"),
            "role": $translate.instant("aws.users.role")
        };
        //获取用户列表
        function getProUserList(){
            cvmViewSrv.getProUserTableData(localStorage.projectUid).then(function(result) {
                result?self.loadData = true:"";
                if(result && result.data){
                    result.data.map(function(item){
                        item.role=item.roleidlist[0].name;
                    });
                    userDataSrv.userTableAllData = result.data;
                    self.tableParams = new NgTableParams({ count: 5 }, { counts: [], dataset: result.data });
                }
            });    
        }
        //根据切换头部的project来获取当前用户在该项目的角色。localStorage.rolename在common.js里面
        scope.$watch(function(){
            return localStorage.rolename;
        },function(val){
            if(val){
                lisrProUserList();
            }
        });
        function lisrProUserList(){
            if(localStorage.managementRole == "2" || localStorage.managementRole == "3"){
                scope.showUerList =true;
                getProUserList();
            }else if(localStorage.rolename != "_member_" && localStorage.rolename != "member"){
                scope.showUerList =true;
                getProUserList();
            }else{
                scope.showUerList = false;
            }
        }
        
        //分配用户
        self.allocateUser = function() {
            var scope = rootScope.$new();
            var userModal = uibModal.open({
                animation: scope.animationsEnabled,
                templateUrl: "proallocateUser.html",
                scope:scope
            });
            userModal.opened.then(function(){
                depviewsrv.getDomainUsers(localStorage.domainUid).then(function(result){
                    return  result.data = result.data.filter(function(item){
                        return (item.managementRole >3 ); //过滤掉admin用户和domain_admin用户
                    });
                }).then(function(data){            
                    projectDataSrv.usersInProject(localStorage.projectUid).then(function(result){
                        if(result && result.data && result.data.length){
                            result.data = result.data.filter(function(obj){
                                return obj.name !="admin";
                            });
                            _.forEach(result.data,function(per){
                                _.forEach(per.roleidlist,function(val){
                                    val.name = $translate.instant("aws.users.cu.roles."+ val.name );
                                });
                                _.remove(data,function(item){
                                    return item.userUid==per.userUid;
                                });
                            });
                            scope.users=data;
                            scope.havedUsers2=angular.copy(result.data);
                            scope.havedUsers=result.data;
                        }else{
                            scope.users=data;
                            scope.havedUsers2=[];
                            scope.havedUsers=[];
                        }
                        //scope.havedUsers2=angular.copy(result.data);
                        //项目管理员登录时，无法将自己已分配中移到未分配中.视觉上将其隐藏
                        if(localStorage.rolename == "project_admin"){
                            scope.havedUsers=result.data.map(function(item){
                                if(item.name == localStorage.userName){
                                    item.hideProjectAdmin = true;
                                }else{
                                    item.hideProjectAdmin = false;
                                }
                                return item;
                            });
                        }else{
                            scope.havedUsers=result.data;
                        }
                    });
                    scope.example5settings = {displayProp: "name", idProp: "id",externalIdProp: ""};
                    scope.example5customTexts = {buttonDefaultText: "Select"};
                });
                userDataSrv.getRolesData().then(function(result){ 
                    scope.roles =[];
                    result.data.map(function(role){
                        if(role.name =="member" || role.name =="project_admin" )  //只留下project_admin和menber角色
                            scope.roles.push(role);
                    });
                    scope.roles.map(role => {role.name = $translate.instant("aws.users.cu.roles."+ role.name );});                
                });
                scope.selectUserToProject=function(user){
                    _.remove(scope.users,function(item){
                        return item.userUid==user.userUid;
                    });
                    /*_.forEach(scope.roles,function(item){
                        if(item.name=="member"){
                            user.roleidlist=[{id:item.id,name:"member"}];
                        }
                    });*/
                    _.forEach(scope.roles,function(item){
                        if(item.name=="普通用户"){
                            user.roleidlist=[{id:item.id,name:item.name}];
                        }
                    });
                    
                    scope.havedUsers.push(user);
                };
                scope.removeUserFromProject=function(havedUser){
                    _.remove(scope.havedUsers,function(item){
                        return item.userUid==havedUser.userUid;
                    });
                    havedUser.roleidlist=[];
                    scope.users.push(havedUser);
                };                   
            });
            userModal.result.then(function(){
                // 判断用户的角色数组中哪些是新加的，哪些是被删除的
                
                function isAddOrDelete(newData,oldData){
                    var deleteRoles=[];
                    var reData=[];
                    var addRoles=[];
                    var length=angular.copy(oldData).length;
                    var k=0;
                    for(var i=0;i<newData.length;i++){
                            
                        for(var j=0;j<oldData.length+k;j++){
                            if(newData[i]==oldData[j]){
                                oldData.splice(j,1);
                                k++;
                                break;      
                            }
                        }
                        if(j==length){
                            addRoles.push(newData[i]);
                        }
                    }
                    deleteRoles=oldData;                
                    reData.push(addRoles);
                    reData.push(deleteRoles);
                    return reData;
                }
                function convertUser(obj){
                    //由于使用了angularjs-dropdown-multiselect插件，选中用户角色后以字典对象保存，把它转化成字符串。
                    _.forEach(obj,function(item){
                        item.userid=item.userUid;
                        for(var i=0;i<item.roleidlist.length;i++){
                            if(typeof(item.roleidlist[i])!="string"){
                                item.roleidlist.push(item.roleidlist[i].id);
                                item.roleidlist.splice(i,1);
                                //由于item.roleidlist被删除了一项，被删除的数据会向前移位，为防止有的数据没有进入循环，使索引值减少1
                                i--;
                            }
                        }
                    });
                    return obj;
                }
                scope.havedUsers=convertUser(scope.havedUsers);
                scope.havedUsers2=convertUser(scope.havedUsers2);
                    
                //deleteUser保存的是被删除的用户。
                var deleteUser=[];
                
                for (var i = 0; i < scope.havedUsers2.length; i++) {
                    for (var j =0; j< scope.havedUsers.length ; j++) {
                        if(scope.havedUsers2[i].userid==scope.havedUsers[j].userid){
                            break;
                        }
                    }
                    if(j==scope.havedUsers.length){
                        deleteUser.push(scope.havedUsers2[i]);
                    }
                }
                    
                var postParams=[];
                for (var m = 0; m < scope.havedUsers.length; m++) {
                    for(var n=0; n<scope.havedUsers2.length;n++){
                        if (scope.havedUsers[m].userid==scope.havedUsers2[n].userid){
                            var reData=isAddOrDelete(scope.havedUsers[m].roleidlist,scope.havedUsers2[n].roleidlist);
                            scope.havedUsers[m].oper="add";
                            scope.havedUsers[m].roleidlist=reData[0];
                            postParams.push(scope.havedUsers[m]);
                            var newItem=angular.copy(scope.havedUsers[m]);
                            newItem.oper="remove";
                            newItem.roleidlist=reData[1];
                            postParams.push(newItem);
                            break;
                        }
                    }
                    if(n==scope.havedUsers2.length){
                        scope.havedUsers[m].oper="add";
                        postParams.push(scope.havedUsers[m]);
                    }
                }
                _.forEach(deleteUser,function(item){
                    item.oper="remove";
                    postParams.push(item);
                });
                var paramsData = _.filter(postParams,function(item){
                    return item.roleidlist.length >0;
                });
                if(paramsData.length>0){
                    projectDataSrv.addUserToProject(localStorage.projectUid,postParams).then(function(){
                        getProUserList();
                    });
                }
                
            });
        };

        scope.instancesquota={};
        scope.coresquota = {icon:"icon-aw-cpu",type:$translate.instant("aws.cvmview.cpu_unit"),"usedText":$translate.instant("aws.cvmview.used"),used:0};
        scope.ramquota = {icon:"icon-aw-ram",type:$translate.instant("aws.cvmview.ram_unit"),"usedText":$translate.instant("aws.cvmview.used"),used:0};
        scope.snapshotsquota = {icon:"icon-aw-camera",type:$translate.instant("aws.cvmview.snap_unit"),"usedText":$translate.instant("aws.cvmview.used"),used:0};
        scope.floatingipquota = {icon:"icon-aw-internet1",type:$translate.instant("aws.cvmview.fip_unit"),"usedText":$translate.instant("aws.cvmview.used"),used:0};
        scope.counts = {
            projectserverscount : {name:$translate.instant("aws.cvmview.ins_num"),bar_type:"height","normalText":$translate.instant("aws.cvmview.normal"),"abnormalText":$translate.instant("aws.cvmview.abnormal")},
            projectNetworksCount: {name:$translate.instant("aws.cvmview.net_num"),bar_type:"height","normalText":$translate.instant("aws.cvmview.normal"),"abnormalText":$translate.instant("aws.cvmview.abnormal")},
            routerscount : {name:$translate.instant("aws.cvmview.router_num"),bar_type:"height","normalText":$translate.instant("aws.cvmview.normal"),"abnormalText":$translate.instant("aws.cvmview.abnormal")},
            volumescount : {name:$translate.instant("aws.cvmview.volume_num"),bar_type:"height","normalText":$translate.instant("aws.cvmview.normal"),"abnormalText":$translate.instant("aws.cvmview.abnormal")}
        };
        //获取项目配额和使用量
        function getQuotas(){
            var postData= {
                type:"project_quota",
                targetId:localStorage.projectUid,
                enterpriseUid:localStorage.enterpriseUid
            };
            if(localStorage.projectUid){
                cvmViewSrv.getproQuotas(postData).then(function(result){
                    if(result && result.data && result.data.length){
                        _.forEach(result.data,function(item){
                            if(item.name =="instances" ||item.name =="cores"||item.name=="ram"||item.name=="floatingip"||item.name=="snapshots"){
                                scope[item.name+"quota"].total = item.defaultQuota || item.hardLimit;
                                if(item.name=="ram"){
                                    //if(scope[item.name+"quota"].total>(9999*1024)){
                                        //scope[item.name+"quota"].total = (scope[item.name+"quota"].total/(1024*1024)).toFixed(1);
                                        //scope.ramquota.type = $translate.instant("aws.cvmview.ram_unitTb");
                                    //}else{
                                        scope[item.name+"quota"].total = (scope[item.name+"quota"].total/1024).toFixed(1);
                                    //}
                                }
                            }
                        });
                        getused();
                    }
                });
            }
            
        }
        function getused(){
            var postData= {
                type:"project_quota",
                projectUid:localStorage.projectUid,
                enterpriseUid:localStorage.enterpriseUid
            };
            if(localStorage.domainUid){
                postData.domainUid = localStorage.domainUid;
            }else{
                postData.domainName = localStorage.domainName;
            }
            if(localStorage.domainUid || localStorage.domainName){
                cvmViewSrv.getProused(postData).then(function(result){
                    _.forEach(result.data,function(item){
                        if(item.name =="instances" ||item.name =="cores"||item.name=="ram"||item.name=="floatingip"||item.name=="snapshots"){
                            scope[item.name+"quota"].used = item.inUse ;
                            if(item.name=="ram"){
                                var ram = scope[item.name+"quota"].used/1024;
                                if(ram.toString().split(".")[1] && ram.toString().split(".")[1].length>1){
                                    scope[item.name+"quota"].used = ram.toFixed(1);
                                }else{
                                    scope[item.name+"quota"].used = ram;
                                }
                            }    
                        }
                    });
                    self.pieshow = true;
                    self.cvmViewInsPieChart = new PiePanelDefault();
                    self.cvmViewInsPieChart.panels.data = [
                        {name:$translate.instant("aws.overview.inUsed"),value:scope.instancesquota.used?scope.instancesquota.used:0},
                        {name:$translate.instant("aws.overview.unUsed"),value:(scope.instancesquota.total-scope.instancesquota.used)?scope.instancesquota.total-scope.instancesquota.used:0}
                    ];
                    self.cvmViewInsPieChart.panels.pieType = "percent";
                    self.cvmViewInsPieChart.panels.colors = ["#1ABC9C","#e5e5e5"]; 
                });
            }
            
        }
        getQuotas();

        //获取不同资源的数量
        
        function getresCount(name){
            cvmViewSrv.getResCont(name).then(function(result){
                // scope.name = true;
                // scope[name]= scope.counts[name];
                // scope[name].total= result.data.total ||0;
                // scope[name].success= result.data.success||0 ;
                // scope[name].error= result.data.error ||0;
                scope[name] =  {
                    "colors":
                        [
                            "#51a3ff",
                            "#f39c12",
                            "#e74c3c",
                            "#666666"
                        ],
                        "type":"pie",
                        "width":200,
                        "height":200,
                        "outerRadius":75,
                        "innerRadius":50,
                        "total":result.data.total,
                        "data":[
                            {"name":'正常',"value":result.data.success,"status":"success"},
                            {"name":"异常","value":result.data.error,"status":"error"}
                        ],
                        "title":"",
                        "id":"",
                        "pieType":"category",
                        "progressRate":true
                    }
            });
        }
        getresCount("projectserverscount");
        getresCount("projectNetworksCount");
        getresCount("routerscount");
        getresCount("volumescount");

        function formateTableData(item){
            if(item.alarmType == "threshold"){
                item._alarmType = $translate.instant("aws.monitor.alarmModule.threshold");
            }else if(item.alarmType == "healthcheck"){
                item._alarmType = $translate.instant("aws.monitor.alarmModule.healthcheck");
            }else if(item.alarmType == "computeha"){
                item._alarmType = $translate.instant("aws.monitor.alarmModule.computeha");
            }
            if(item.severity == "critical"){
                item.severity_status="critical";
                item.severity = $translate.instant("aws.monitor.alarmModule.critical");
            }else if(item.severity == "moderate"){
                item.severity_status="moderate";
                item.severity = $translate.instant("aws.monitor.alarmModule.moderate");
            }else if(item.severity == "low"){
                item.severity_status="low";
                item.severity = $translate.instant("aws.monitor.alarmModule.low");
            }
        }

        alarmEventSrv.getNewAlarm({
            status:"new",
            //projectId:localStorage.projectUid,
            //enterpriseId:localStorage.enterpriseUid
        }).then(function(result){
            self.newAlarms_data = [];
            if(result && result.data){
                if(result.data.length>5){
                    _.map(result.data, function(item,i) {
                        formateTableData(item);
                        if(i>4){return;}
                        self.newAlarms_data.push({
                            hostname:item.hostname,
                            _alarmType:item._alarmType,
                            alarmType:item.alarmType,
                            severity:item.severity,
                            severity_status:item.severity_status,
                            createtime:item.createtime
                        });
                    });
                }else{
                    self.newAlarms_data = _.map(result.data, function(item) {
                        formateTableData(item);
                        return item;
                    });
                }
            }
        });

    }])
.directive("pieChart", ["resize",
    function(resize) {
        return {
            restrict: "EA",
            scope:{
                chartValue:"="
            },
            link: function(scope, elem) {
                function renderPieFunc(width){
                    var total = scope.chartValue.total || 0;
                    var normal = scope.chartValue.used || 0;
                    var twoPi = 2 * Math.PI;
                    var formatPercent = d3.format(".0%");
                    var piepercent;
                    total==0?piepercent= "0%" : piepercent = normal / total *100;
                    var tooltip = d3.select(elem[0])
                        .append("div")
                        .attr("class","tooltip")
                        .style("display","none");
                    var centerText =d3.select(elem[0])
                        .append("div")
                        .attr("class","pie-center");

                    var svg = d3.select(elem[0]).append("svg")
                        .attr("width", width)
                        .attr("height", width);
                    var outerRadius =Number(width/2-2); //外半径
                    var innerRadius =Number(width/2-18); //内半径，为0则中间没有空白
                    var arc = d3.svg.arc() //弧生成器
                        .startAngle(0)
                        .innerRadius(innerRadius) //设置内半径
                        .outerRadius(outerRadius); //设置外半径

                    var arc_a = d3.svg.arc() //弧生成器
                        .startAngle(0)
                        .innerRadius(innerRadius - 2) //设置内半径
                        .outerRadius(outerRadius + 2); //设置外半径

                    var arcs = svg.append("g")
                        .attr("transform", "translate(" + (width / 2) + "," + (width / 2) + ")");

                    var background = arcs.append("path")
                        .attr("class", "background")
                        .attr("d", arc.endAngle(twoPi));

                    var foreground = arcs.append("path");
                    switch(true){
                    case piepercent>=0 && piepercent<=30:
                        foreground.attr("class","progress-bar-green");
                        elem[0].parentNode.parentNode.getElementsByTagName("i")[0].setAttribute("class","progress-bar-green");
                        break;
                    case piepercent>30 && piepercent<=50:
                        foreground.attr("class","progress-bar-blue");
                        elem[0].parentNode.parentNode.getElementsByTagName("i")[0].setAttribute("class","progress-bar-blue");
                        break;
                    case piepercent>50 && piepercent<=65:
                        foreground.attr("class","progress-bar-blueDark");
                        elem[0].parentNode.parentNode.getElementsByTagName("i")[0].setAttribute("class","progress-bar-blueDark");
                        break;
                    case piepercent>65 && piepercent<=75:
                        foreground.attr("class","progress-bar-orange");
                        elem[0].parentNode.parentNode.getElementsByTagName("i")[0].setAttribute("class","progress-bar-orange");
                        break;
                    case piepercent>75 && piepercent<=85:
                        foreground.attr("class","progress-bar-orangeDark");
                        elem[0].parentNode.parentNode.getElementsByTagName("i")[0].setAttribute("class","progress-bar-orangeDark");
                        break;
                    case piepercent>85 && piepercent<=95:
                        foreground.attr("class","progress-bar-red");
                        elem[0].parentNode.parentNode.getElementsByTagName("i")[0].setAttribute("class","progress-bar-red");
                        break;
                    case piepercent>95 && piepercent<=100:
                        foreground.attr("class","progress-bar-redDark");
                        elem[0].parentNode.parentNode.getElementsByTagName("i")[0].setAttribute("class","progress-bar-redDark");
                        break;
                    }
                    /*var text = arcs.append("text")
                        .attr("text-anchor", "middle")
                        .attr("class", "center-text")*/
                    if(total != 0){
                        var i = d3.interpolate(0, normal / total);
                        var trans = d3.transition();
                        trans.duration(1000);
                        trans.tween("progress", function() {
                            return function(t) {
                                foreground.attr("d", arc_a.endAngle(twoPi * i(t)));
                                centerText.text(formatPercent(normal / total));
                                //text.text(formatPercent(normal / total));
                            };
                        });
                    }else{
                        centerText.text("0%");
                    }
                    foreground.on("mouseover",function(){
                        tooltip.html("已使用 " + formatPercent(normal / total))
                                    .style("left", (d3.event.pageX + 20) + "px")
                                    .style("top", (d3.event.pageY + 20) + "px")
                                    .style("display","block");
                    })
                        .on("mousemove",function(){
                            tooltip.style("left", (d3.event.pageX-elem.offset().left+20) + "px").style("top", (d3.event.pageY-elem.offset().top-20) + "px");
                        })
                        .on("mouseout",function(){

                            tooltip.style("display","none");
                        });

                    background.on("mouseover",function(){
                        tooltip.html("未使用 " + formatPercent(1-normal / total))
                                    .style("left", (d3.event.pageX + 20) + "px")
                                    .style("top", (d3.event.pageY + 20) + "px")
                                    .style("display","block");
                    })
                        .on("mousemove",function(){
                            tooltip.style("left", (d3.event.pageX-elem.offset().left+20) + "px").style("top", (d3.event.pageY-elem.offset().top-20) + "px");
                        })
                        .on("mouseout",function(){
                            tooltip.style("display","none");
                        });    
                }
                resize().call(function () {
                    elem.html("");
                    renderPieFunc(elem.width()); 
                });  
            }
        };
    }
])

.directive("progressBar",["$timeout","resize",function(timeout,resize){
    return {
        restrict:"E",
        scope:{
            progressValue:"=",
            barType:"="
        },
        templateUrl:"../../../tmpl/qutoa_modal.html",
        link:function(scope,e){
            let data = scope.progressValue;
            var percentQuota = data.used*100/data.total;
            var percentRes = data.success*100/data.total;
            var percentAll = [percentQuota,percentRes];
            var nodeQuota = e.find(".progress-bar");
            scope.$watch(function(){
                return data.showUsed;
            },function(val){
                if(val){
                    if(data.showUsed/data.total + data.used/data.total > 1){
                        renderBar_Exceed(percentQuota,(1-data.used/data.total)*100);
                    }else{
                        renderBar_hide(percentQuota,data.showUsed*100/data.total);
                    }
                }
            });
            function renderBar_Exceed(percentQuota,val){
                nodeQuota.parent().append("<div class='progress-bar progress-bar-redDark'></div>");
                e.find(".progress-bar").eq(1).css({"width":+val+"%"});
                e.find(".progress-bar").eq(1).attr("title","已添加 "+data.showUsed);
            }
            function renderBar_hide(percentQuota,val){
                switch(true){
                case percentQuota>=0 && percentQuota<=30:
                    nodeQuota.parent().append("<div class='progress-bar progress-bar-DarkgreenLight'></div>");
                    break;
                case percentQuota>30 && percentQuota<=50:
                    nodeQuota.parent().append("<div class='progress-bar progress-bar-blueDark'></div>");
                    break;
                case percentQuota>50 && percentQuota<=65:
                    nodeQuota.parent().append("<div class='progress-bar progress-bar-blue'></div>");
                    break;
                case percentQuota>65 && percentQuota<=75:
                    nodeQuota.parent().append("<div class='progress-bar progress-bar-orangeDark'></div>");
                    break;
                case percentQuota>75 && percentQuota<=85:
                    nodeQuota.parent().append("<div class='progress-bar progress-bar-orange'></div>");
                    break;
                case percentQuota>85 && percentQuota<=95:
                    nodeQuota.parent().append("<div class='progress-bar progress-bar-red'></div>");
                    break;
                case percentQuota>95 && percentQuota<=100:
                    nodeQuota.parent().append("<div class='progress-bar progress-bar-redDark'></div>");
                    break;
                }
                e.find(".progress-bar").eq(1).css({"width":+val+"%"});
                e.find(".progress-bar").eq(1).attr("title","已添加 "+data.showUsed);

            }
            function renderQuota(percentQuota){
                switch(true){
                case percentQuota>=0 && percentQuota<=30:
                    nodeQuota.eq(0).addClass("progress-bar-green");
                    break;
                case percentQuota>30 && percentQuota<=50:
                    nodeQuota.eq(0).addClass("progress-bar-blue");
                    break;
                case percentQuota>50 && percentQuota<=65:
                    nodeQuota.eq(0).addClass("progress-bar-blueDark");
                    break;
                case percentQuota>65 && percentQuota<=75:
                    nodeQuota.eq(0).addClass("progress-bar-orange");
                    break;
                case percentQuota>75 && percentQuota<=85:
                    nodeQuota.eq(0).addClass("progress-bar-orangeDark");
                    break;
                case percentQuota>85 && percentQuota<=95:
                    nodeQuota.eq(0).addClass("progress-bar-red");
                    break;
                case percentQuota>95 && percentQuota<=100:
                    nodeQuota.eq(0).addClass("progress-bar-redDark");
                    break;
                case percentQuota>100:
                    nodeQuota.eq(0).addClass("progress-bar-redDark");
                    break;
                }
            }
            
            resize().call(function () {
                scope.$watch(function(){
                    return percentAll;
                },function(val){
                    renderBar(val);
                }); 
            });
            function renderBar(val){
                if(val[0]>=0 && scope.barType=="width"){
                    nodeQuota.eq(0).css({"width":val[0]  + "%"});
                    renderQuota(val[0]);
                }
                if(val[1]>=0 && scope.barType=="height"){
                    nodeQuota.eq(0).css({"height":val[1] + "%"});
                    nodeQuota.addClass("progress-bar-blue");
                }
            }
            
        }
    };
}])
.directive("mprogressBar",["$timeout",function(timeout){
    return {
        restrict:"E",
        scope:{
            progressValue:"=",
            barType:"="
        },
        templateUrl:"../../../tmpl/mqutoa_modal.html",
        link:function(scope,e){
            let data = scope.progressValue;
            if(scope.barType=="width"){
                timeout(function(){
                    e.find(".progress-bar").css({"width":data.used*100/data.total + "%"});
                },100);
            }else if(scope.barType=="height"){
                timeout(function(){
                    e.find(".progress-bar").css({"height":data.normal*100/data.total + "%"});
                },100);
            }
        }
    };
}])
.directive("nprogressBar",["$timeout",function(timeout){
    return {
        restrict:"E",
        scope:{
            progressValue:"=",
            barType:"="
        },
        templateUrl:"../../../tmpl/nqutoa_modal.html",
        link:function(scope,e){
            let data = scope.progressValue;
            if(scope.barType=="width"){
                timeout(function(){
                    e.find(".progress-bar").css({"width":data.used*100/data.total + "%"});
                },100);
            }else{
                timeout(function(){
                    e.find(".progress-bar").css({"height":data.normal*100/data.total + "%"});
                },100);
            }
        }
    };
}]);
