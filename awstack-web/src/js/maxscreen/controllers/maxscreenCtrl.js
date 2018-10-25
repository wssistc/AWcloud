import "../services/resourceSrv";
maxscreenCtrl.$inject =["$scope", "$http","$timeout","$interval","resourceSrv","$route"]; 
export function maxscreenCtrl($scope, $http,$timeout,$interval,resourceSrv,$route){
    let self = $scope;
    let week = ["日","一","二","三","四","五","六"];
    let SetTimerInterval=$interval(SetTimer,1000);
    let SetPageInterval=$interval(SetPageTimer,60000);
    let SetRwBandwidthInterval=$interval(SetRwBandwidth,10000);
    let regionKey = localStorage.regionKey;
    let sqls = {
        iops:{sql:'select cluster_IOPS from ceph_status where time > now() - 30m and code=' +"'" + regionKey + "'"},
        rBandWidth:{sql:'select cluster_rBandwidth from ceph_status where time > now() - 30m and code= '+ "'" + regionKey + "'"},
        wBandWidth:{sql:'select cluster_wBandwidth from ceph_status where time > now() - 30m and code='+ "'" + regionKey+ "'"}
    }
    let node_i = 0;
    let rwBandWidthLabel = "r";
    let setNodev;
    self.data_cpu = [];
    self.data_mem = [];
    self.data_disk = [];
    self.data_iops = [];
    self.data_rBandWidth = [];
    self.data_wBandWidth = [];
    Array.prototype.min = function(){ 
        return Math.min.apply(null,this) 
    }
    self.regionName = localStorage.regionName;
    function SetPageTimer(){
        $interval.cancel(setNodev);  
        resourceSrv.checkToken().then(function(result){
            if(result && result.data){
                getAllPageServer();
            }else{
                resourceSrv.getToken().then(function(result){
                    if(result && result.data){
                        localStorage.$AUTH_TOKEN = result.data;
                        getAllPageServer();
                    }
                })
            }
        })
    }
    function SetRwBandwidth(){
        if(rwBandWidthLabel == "r"){
            self.data_rwBandWidth = self.data_wBandWidth;
            self.color_rwBandWidth = ["#99806a","#4b4353","#0d1440"];
            rwBandWidthLabel = "w"
        }else if(rwBandWidthLabel == "w"){
            self.data_rwBandWidth = self.data_rBandWidth;
            rwBandWidthLabel = "r";
            self.color_rwBandWidth = ["#019fd5","#051d4e","#035184"];
        }
        
    }
    function SetTimer(){
        self.nowDay = moment().format("YYYY-MM-DD");
        self.nowTime = moment().format("HH:mm:ss").split(":");
        self.week = week[Number(moment().format('d'))];
    }
    function setNode(){
        if(node_i == self.nodeList.length){
            node_i = 0;
        }
        self.nodeList.map((item,index) =>{
            self.nodeSelect = self.nodeList[node_i];
        })
        getNodeRes(self.nodeSelect.nodeUid)
        node_i++;
    }
    function systemVmCount(values){
        var total = values.total;
        var active = 0;
        var error = 0;
        var other = 0;
        if(total){
            active = 100*values.active/total;
            error = 100*values.error/total;
            other = 100-active-error;
        }
        
        self.vmdataValue = [{
            name:'运行中的云主机',
            color:"#00b3ff",
            percent:active.toFixed(1)
        },{
            name:'错误的云主机',
            color:"#e74c3c",
            percent:error.toFixed(1)
        },{
            name:'待确认的云主机',
            color:"#ff9600",
            percent:other.toFixed(1)
        }]
    }
    
    function pieDataSet(obj,values){
        self[obj] = [{
            name:'已使用',
            color:"#00b3ff",
            percent:values[0][1].toFixed(1)
        },{
            name:'剩余',
            color:"#32437e",
            percent:100-(values[0][1].toFixed(1))
        }]
        return self[obj]
    }
    function getNodeRes(node_id){
        var cpu_sql = {sql:"select 100-last(usage_idle) from cpu where node_id ="+"'" + node_id +"'" + "and cpu = "+"'"+"cpu-total"+"'" + "and code ="+"'"+regionKey+"'"}
        var mem_sql = {sql:"select last(used_percent) from mem where node_id ="+"'" + node_id +"'" + "and code ="+"'"+regionKey+"'"}
        var disk_sql = {sql:"select last(used_percent) from disk where node_id ="+"'" + node_id +"'" + "and fstype != " +"'"+"rootfs" +"'" + "and path =" +"'"+"/" +"'" + "and code ="+ "'"+regionKey+"'"};
        
        resourceSrv.sqlQuery(cpu_sql).then(function(res){
            if(res && res.data && res.data.results && angular.isArray(res.data.results) && res.data.results[0] && res.data.results[0].series
            && angular.isArray(res.data.results[0].series) && res.data.results[0].series[0]  && res.data.results[0].series[0] .values){
                self.cpudataValue = pieDataSet("cpudataValue",res.data.results[0].series[0] .values)
            }else{
                self.cpudataValue = pieDataSet("cpudataValue",[])
            }
        })
        resourceSrv.sqlQuery(mem_sql).then(function(res){
            if(res && res.data && res.data.results && angular.isArray(res.data.results) && res.data.results[0] && res.data.results[0].series
            && angular.isArray(res.data.results[0].series) && res.data.results[0].series[0]  && res.data.results[0].series[0] .values){
                self.ramdataValue = pieDataSet("ramdataValue",res.data.results[0].series[0] .values)
            }else{
                self.ramdataValue = pieDataSet("ramdataValue",[])
            }
        })
        resourceSrv.sqlQuery(disk_sql).then(function(res){
            if(res && res.data && res.data.results && angular.isArray(res.data.results) && res.data.results[0] && res.data.results[0].series
            && angular.isArray(res.data.results[0].series) && res.data.results[0].series[0]  && res.data.results[0].series[0] .values){
                self.diskdataValue = pieDataSet("diskdataValue",res.data.results[0].series[0] .values)
            }else{
                self.diskdataValue = pieDataSet("diskdataValue",[])
            }
        })
    }

    function getClusterNodeHealth(nodeList,regionUid){
        self.clusterAbnormaNum = 0;
        var nodeNamesArry = [];
        _.forEach(nodeList, function(item) {
            nodeNamesArry.push(item.hostName)
            
        });
        var nodeName = { nodeNames: nodeNamesArry }
        resourceSrv.isHealthAction(nodeName,regionUid).then(function(result) {
            if(result && result.data){
                _.forEach(nodeList, function(item) {
                    self.clusterAbnormaNum += !result.data[item.hostName] ;
                });
            }   
        }); 
    }

    function getAllPageServer(){
        //获取region下所有vm
        resourceSrv.getSystemserverscount().then(function(res){
            if(res && res.data){
                systemVmCount(res.data)
                self.vmcountData = res.data;
            }
        })
        //获取告警信息
        resourceSrv.getSysinfo().then(function(res){
            if(res && res.data){
                self.alarm_total = res.data.alarm_total
            }
        })
        resourceSrv.getalloData().then(function(res){
            if(res&&res.data){
                var allocata = res.data;
                resourceSrv.getCpuMemData().then(function(val){
                    self.overViewData = {
                        totalCpu:[],
                        totalMem:[]
                    }
                    if(val&&val.data){
                        for(var i in val.data){
                            if(val.data[i]){
                                var cpuDetail={
                                    name:i,
                                    total:val.data[i].vcpus*allocata[i].cpu_allocation_ratio,
                                }
                                self.overViewData.totalCpu.push(cpuDetail)
                                var totalMem = (val.data[i].memory_mb*allocata[i].ram_allocation_ratio/1024).toFixed(2);
                                var memDetail={
                                    name:i,
                                    total:totalMem,
                                }
                                self.overViewData.totalMem.push(memDetail)
                            }
                        }
                        /*CPU百分比*/
                        resourceSrv.getCpuSeries().then(function(res){
                            if(res&&res.data){
                                var columns = res.data.columns;
                                var values = res.data.values;
                                for(var k=1;k<columns.length;k++){
                                    var regionNamea = columns[k];
                                    var totalData = self.overViewData.totalCpu.filter(e=>{
                                        return e.name == regionNamea;
                                    })
                                    for (var h = 0; h < values.length; h++){
                                        if(res.data.values[h][k]){
                                            res.data.values[h][k] = totalData[0].total&&totalData[0].total!=0?(((res.data.values[h][k])/totalData[0].total)*100).toFixed(2):0
                                        }
                                    }
                                }
                                self.data_cpu = res.data.values;
                            } 
                        })
                        /*内存百分比*/
                        resourceSrv.getMemSeries().then(function(res){
                            var memHistory = [];
                            if(res&&res.data){
                                var columns = res.data.columns;
                                var values = res.data.values;
                                for(var k=1;k<columns.length;k++){
                                    var regionNamea = columns[k];
                                    var totalData = self.overViewData.totalMem.filter(e=>{
                                        return e.name == regionNamea;
                                    })
                                    for (var h = 0; h < values.length; h++){
                                        if(res.data.values[h][k]){
                                            res.data.values[h][k] = parseInt(res.data.values[h][k]/1024);    
                                            res.data.values[h][k] = totalData[0].total&&totalData[0].total!=0?(((res.data.values[h][k])/totalData[0].total)*100).toFixed(2):0
                                        }
                                    }
                                }
                                self.data_mem = res.data.values;
                            }
                        })
                    }
                })
               
            }
        })
        resourceSrv.getStoData().then(function(res){
            var totalSto = [];
            if(res&&res.data){
                for(var i in res.data){
                    if(res.data[i]){
                        var stoDetail={
                            name:i,
                            total:(res.data[i].total_capacity_gb).toFixed(2),
                        }
                        totalSto.push(stoDetail)
                    }
                }
                resourceSrv.getDiskSeries().then(function(res){
                    var stoHistory = [];
                    if(res&&res.data){
                        var columns = res.data.columns;
                        var values = res.data.values;
                        for(var k=1;k<columns.length;k++){
                            var regionNamea = columns[k];
                            var totalData = totalSto.filter(e=>{
                                return e.name == regionNamea;
                            })
                            for (var h = 0; h < values.length; h++){
                                if(res.data.values[h][k]){
                                    res.data.values[h][k] = totalData[0].total&&totalData[0].total!=0?(((res.data.values[h][k])/totalData[0].total)*100).toFixed(2):0
                                }
                            }
                        }
                        self.data_disk = res.data.values;
                    }
                })

            }
        })
        // //CPU使用率
        // resourceSrv.getCpuSeries().then(function(res){
        //     //self.data_cpu = [["2018-02-20 00:00:00",null],["2018-02-21 00:00:00",null],["2018-02-22 00:00:00",null],["2018-02-23 00:00:00",null],["2018-02-24 00:00:00",null],["2018-02-25 00:00:00",null],["2018-02-26 00:00:00",null],["2018-02-27 00:00:00",null],["2018-02-28 00:00:00",null],["2018-03-01 00:00:00",null],["2018-03-02 00:00:00",null],["2018-03-03 00:00:00",null],["2018-03-04 00:00:00",null],["2018-03-05 00:00:00",null],["2018-03-06 00:00:00",null],["2018-03-07 00:00:00",null],["2018-03-08 00:00:00",null],["2018-03-09 00:00:00",null],["2018-03-10 00:00:00",null],["2018-03-11 00:00:00",null],["2018-03-12 00:00:00",null],["2018-03-13 00:00:00",null],["2018-03-14 00:00:00",null],["2018-03-15 00:00:00",null],["2018-03-16 00:00:00",null],["2018-03-17 00:00:00",null],["2018-03-18 00:00:00",null],["2018-03-19 00:00:00",null],["2018-03-20 00:00:00",8],["2018-03-21 00:00:00",13]];
        //     self.data_cpu = [];
        //     if(res && res.data && res.data  && res.data.values){
        //         self.data_cpu = res.data.values;
        //     }
        //     //console.log(res.data.data.data.values)
        // })
        //内存使用率
        // resourceSrv.getMemSeries().then(function(res){
        //     //self.data_mem = [["2018-02-20 00:00:00",null],["2018-02-21 00:00:00",null],["2018-02-22 00:00:00",null],["2018-02-23 00:00:00",null],["2018-02-24 00:00:00",null],["2018-02-25 00:00:00",null],["2018-02-26 00:00:00",null],["2018-02-27 00:00:00",null],["2018-02-28 00:00:00",null],["2018-03-01 00:00:00",null],["2018-03-02 00:00:00",null],["2018-03-03 00:00:00",null],["2018-03-04 00:00:00",null],["2018-03-05 00:00:00",null],["2018-03-06 00:00:00",null],["2018-03-07 00:00:00",null],["2018-03-08 00:00:00",null],["2018-03-09 00:00:00",null],["2018-03-10 00:00:00",null],["2018-03-11 00:00:00",null],["2018-03-12 00:00:00",null],["2018-03-13 00:00:00",null],["2018-03-14 00:00:00",null],["2018-03-15 00:00:00",null],["2018-03-16 00:00:00",null],["2018-03-17 00:00:00",null],["2018-03-18 00:00:00",null],["2018-03-19 00:00:00",null],["2018-03-20 00:00:00",12288],["2018-03-21 00:00:00",26624]];
        //     self.data_mem = [];
        //     if(res && res.data && res.data  && res.data.values && angular.isArray(res.data.values)){
        //         res.data.values = res.data.values.map(item => {
        //             item[1] = item[1]||0;
        //             item[1] = item[1]/1000;
        //             return item;
        //         })
        //         self.data_mem = res.data.values;
        //     }
        // })
        //存储使用率
        // resourceSrv.getDiskSeries().then(function(res){
        //     //self.data_disk = [["2018-02-20 00:00:00",null],["2018-02-21 00:00:00",null],["2018-02-22 00:00:00",null],["2018-02-23 00:00:00",null],["2018-02-24 00:00:00",null],["2018-02-25 00:00:00",null],["2018-02-26 00:00:00",null],["2018-02-27 00:00:00",null],["2018-02-28 00:00:00",null],["2018-03-01 00:00:00",null],["2018-03-02 00:00:00",null],["2018-03-03 00:00:00",null],["2018-03-04 00:00:00",null],["2018-03-05 00:00:00",null],["2018-03-06 00:00:00",null],["2018-03-07 00:00:00",null],["2018-03-08 00:00:00",null],["2018-03-09 00:00:00",null],["2018-03-10 00:00:00",null],["2018-03-11 00:00:00",null],["2018-03-12 00:00:00",null],["2018-03-13 00:00:00",null],["2018-03-14 00:00:00",null],["2018-03-15 00:00:00",null],["2018-03-16 00:00:00",null],["2018-03-17 00:00:00",null],["2018-03-18 00:00:00",null],["2018-03-19 00:00:00",null],["2018-03-20 00:00:00",122],["2018-03-21 00:00:00",432]];
        //     self.data_disk = [];
        //     if(res && res.data && res.data  && res.data.values && angular.isArray(res.data.values)){
        //         self.data_disk = res.data.values;
        //     }
        // })
        //存储集群IOPS
        resourceSrv.sqlQuery(sqls.iops).then(function(res){
            //self.data = [["2018-03-22T09:37:50.005310639Z",4],["2018-03-22T09:38:00.00638993Z",15],["2018-03-22T09:38:10.008230987Z",4],["2018-03-22T09:38:20.006143497Z",33],["2018-03-22T09:38:30.005139159Z",34],["2018-03-22T09:38:40.005155203Z",39],["2018-03-22T09:38:50.006001119Z",8],["2018-03-22T09:39:00.005629971Z",1],["2018-03-22T09:39:10.00755432Z",9],["2018-03-22T09:39:20.00547923Z",0],["2018-03-22T09:39:30.005924857Z",1],["2018-03-22T09:39:40.037064107Z",5],["2018-03-22T09:39:50.006474008Z",0],["2018-03-22T09:40:00.005729336Z",9],["2018-03-22T09:40:10.009087077Z",6],["2018-03-22T09:40:20.006854595Z",34],["2018-03-22T09:40:30.006972975Z",0],["2018-03-22T09:40:40.007790218Z",66],["2018-03-22T09:40:50.006385094Z",6],["2018-03-22T09:41:00.006288237Z",0],["2018-03-22T09:41:10.009963188Z",7],["2018-03-22T09:41:20.006033764Z",2],["2018-03-22T09:41:30.008044358Z",0],["2018-03-22T09:41:40.007014639Z",2],["2018-03-22T09:41:50.006809487Z",2],["2018-03-22T09:42:00.006046642Z",5],["2018-03-22T09:42:10.005927992Z",80],["2018-03-22T09:42:20.008528998Z",10],["2018-03-22T09:42:30.005848554Z",20],["2018-03-22T09:42:40.006107917Z",121],["2018-03-22T09:42:50.00498947Z",3],["2018-03-22T09:43:00.007777063Z",4],["2018-03-22T09:43:10.008400553Z",9],["2018-03-22T09:43:20.007282831Z",2],["2018-03-22T09:43:30.005463251Z",2],["2018-03-22T09:43:40.006502086Z",10],["2018-03-22T09:43:50.011843018Z",4],["2018-03-22T09:44:00.006923637Z",59],["2018-03-22T09:44:10.006916462Z",0],["2018-03-22T09:44:20.007070573Z",9],["2018-03-22T09:44:30.006434706Z",3],["2018-03-22T09:44:40.008960987Z",1],["2018-03-22T09:44:50.036528806Z",5],["2018-03-22T09:45:00.007326221Z",6],["2018-03-22T09:45:10.006418554Z",0],["2018-03-22T09:45:20.005371607Z",110],["2018-03-22T09:45:30.00638135Z",4],["2018-03-22T09:45:40.006807589Z",0],["2018-03-22T09:45:50.006086539Z",3],["2018-03-22T09:46:00.008244593Z",3],["2018-03-22T09:46:10.007726837Z",9],["2018-03-22T09:46:20.005503244Z",1],["2018-03-22T09:46:30.006194513Z",10],["2018-03-22T09:46:40.006165677Z",4],["2018-03-22T09:46:50.006276536Z",7],["2018-03-22T09:47:00.006928997Z",15],["2018-03-22T09:47:10.008496197Z",2],["2018-03-22T09:47:20.006380049Z",14],["2018-03-22T09:47:30.006519187Z",3],["2018-03-22T09:47:40.005615575Z",1],["2018-03-22T09:47:50.006103605Z",7],["2018-03-22T09:48:00.007024504Z",0],["2018-03-22T09:48:10.006085676Z",8],["2018-03-22T09:48:20.006511104Z",5],["2018-03-22T09:48:30.006053418Z",2],["2018-03-22T09:48:40.007762592Z",4],["2018-03-22T09:48:50.005930615Z",4],["2018-03-22T09:49:00.006780781Z",0],["2018-03-22T09:49:10.005417773Z",2],["2018-03-22T09:49:20.007065007Z",11],["2018-03-22T09:49:30.005729835Z",2],["2018-03-22T09:49:40.006605907Z",6],["2018-03-22T09:49:50.006815189Z",11],["2018-03-22T09:50:00.007193227Z",2],["2018-03-22T09:50:10.006746441Z",1],["2018-03-22T09:50:20.005102971Z",6],["2018-03-22T09:50:30.006278497Z",2],["2018-03-22T09:50:40.00628128Z",7],["2018-03-22T09:50:50.011324997Z",61],["2018-03-22T09:51:00.007879166Z",30],["2018-03-22T09:51:10.007007647Z",0],["2018-03-22T09:51:20.005091942Z",5],["2018-03-22T09:51:30.006217169Z",5],["2018-03-22T09:51:40.005591945Z",1],["2018-03-22T09:51:50.007303755Z",126],["2018-03-22T09:52:00.007136759Z",20],["2018-03-22T09:52:10.006799465Z",96],["2018-03-22T09:52:20.0090033Z",61],["2018-03-22T09:52:30.007083838Z",0],["2018-03-22T09:52:40.007638203Z",64],["2018-03-22T09:52:50.072394766Z",13],["2018-03-22T09:53:00.008559682Z",2],["2018-03-22T09:53:10.010251274Z",14],["2018-03-22T09:53:20.007137417Z",12],["2018-03-22T09:53:30.006936199Z",22],["2018-03-22T09:53:40.006149365Z",12],["2018-03-22T09:53:50.008553242Z",6],["2018-03-22T09:54:00.005108966Z",1],["2018-03-22T09:54:10.006044256Z",16],["2018-03-22T09:54:20.011682588Z",6],["2018-03-22T09:54:30.005668736Z",3],["2018-03-22T09:54:40.005795757Z",330],["2018-03-22T09:54:50.007031558Z",24],["2018-03-22T09:55:00.007189511Z",12],["2018-03-22T09:55:10.012305214Z",16],["2018-03-22T09:55:20.035979555Z",25],["2018-03-22T09:55:30.005178555Z",17],["2018-03-22T09:55:40.007325861Z",5],["2018-03-22T09:55:50.006902348Z",8],["2018-03-22T09:56:00.009476608Z",28],["2018-03-22T09:56:10.013807301Z",6],["2018-03-22T09:56:20.005554754Z",11],["2018-03-22T09:56:30.006455781Z",7],["2018-03-22T09:56:40.005391641Z",4],["2018-03-22T09:56:50.007446552Z",5],["2018-03-22T09:57:00.005717135Z",3],["2018-03-22T09:57:10.004999026Z",5],["2018-03-22T09:57:20.005471279Z",84],["2018-03-22T09:57:30.005793135Z",10],["2018-03-22T09:57:40.005695822Z",5],["2018-03-22T09:57:50.006826786Z",3],["2018-03-22T09:58:00.006339756Z",1],["2018-03-22T09:58:10.00599645Z",15],["2018-03-22T09:58:20.006878697Z",5],["2018-03-22T09:58:30.006031586Z",7],["2018-03-22T09:58:40.005799913Z",1],["2018-03-22T09:58:50.007026942Z",6],["2018-03-22T09:59:00.005803221Z",17],["2018-03-22T09:59:10.005368477Z",19],["2018-03-22T09:59:20.004927067Z",4],["2018-03-22T09:59:30.005751546Z",8],["2018-03-22T09:59:40.00832825Z",1],["2018-03-22T09:59:50.006931955Z",4],["2018-03-22T10:00:00.006042543Z",1],["2018-03-22T10:00:10.004884223Z",5],["2018-03-22T10:00:20.00701737Z",17],["2018-03-22T10:00:30.036094421Z",1],["2018-03-22T10:00:40.005278803Z",4],["2018-03-22T10:00:50.007265329Z",3],["2018-03-22T10:01:00.012563278Z",20],["2018-03-22T10:01:10.067643259Z",4],["2018-03-22T10:01:20.006025269Z",6],["2018-03-22T10:01:30.005550074Z",2],["2018-03-22T10:01:40.005865144Z",9],["2018-03-22T10:01:50.009812828Z",4],["2018-03-22T10:02:00.005103885Z",0],["2018-03-22T10:02:10.005697613Z",21],["2018-03-22T10:02:20.005107563Z",5],["2018-03-22T10:02:30.00499463Z",9],["2018-03-22T10:02:40.004738023Z",3],["2018-03-22T10:02:50.005975516Z",4],["2018-03-22T10:03:00.020246899Z",3],["2018-03-22T10:03:10.005708841Z",13],["2018-03-22T10:03:20.011287957Z",13],["2018-03-22T10:03:30.005781837Z",3],["2018-03-22T10:03:40.005332126Z",2],["2018-03-22T10:03:50.02045129Z",5],["2018-03-22T10:04:00.005200308Z",3],["2018-03-22T10:04:10.005944628Z",5],["2018-03-22T10:04:20.035337755Z",8],["2018-03-22T10:04:30.005680563Z",10],["2018-03-22T10:04:40.005075344Z",1],["2018-03-22T10:04:50.007124147Z",4],["2018-03-22T10:05:00.005370552Z",26],["2018-03-22T10:05:10.007795313Z",2],["2018-03-22T10:05:20.005896394Z",4],["2018-03-22T10:05:30.012862181Z",3],["2018-03-22T10:05:40.007212859Z",4],["2018-03-22T10:05:50.008343613Z",4],["2018-03-22T10:06:00.005019329Z",2],["2018-03-22T10:06:10.006615539Z",15],["2018-03-22T10:06:20.005733589Z",2],["2018-03-22T10:06:30.03677644Z",2],["2018-03-22T10:06:40.006397533Z",1],["2018-03-22T10:06:50.007653606Z",7],["2018-03-22T10:07:00.005838199Z",3],["2018-03-22T10:07:10.006278449Z",2],["2018-03-22T10:07:20.068748684Z",22],["2018-03-22T10:07:30.005982907Z",31],["2018-03-22T10:07:40.005927161Z",1]]
            if(res && res.data && res.data.results && angular.isArray(res.data.results) && res.data.results[0].series &&  angular.isArray(res.data.results[0].series)){
                if( res.data.results[0].series[0] && res.data.results[0].series[0].values && angular.isArray(res.data.results[0].series[0].values)){
                    self.data_iops = res.data.results[0].series[0].values;
                }
            }
        })
        //存储集群读写吞吐量
        resourceSrv.sqlQuery(sqls.rBandWidth).then(function(res){
            //self.data_r_width = [["2018-03-22T09:37:50.005310639Z",0],["2018-03-22T09:38:00.00638993Z",0],["2018-03-22T09:38:10.008230987Z",0],["2018-03-22T09:38:20.006143497Z",25066],["2018-03-22T09:38:30.005139159Z",19315],["2018-03-22T09:38:40.005155203Z",30484],["2018-03-22T09:38:50.006001119Z",0],["2018-03-22T09:39:00.005629971Z",0],["2018-03-22T09:39:10.00755432Z",0],["2018-03-22T09:39:20.00547923Z",0],["2018-03-22T09:39:30.005924857Z",0],["2018-03-22T09:39:40.037064107Z",0],["2018-03-22T09:39:50.006474008Z",0],["2018-03-22T09:40:00.005729336Z",0],["2018-03-22T09:40:10.009087077Z",0],["2018-03-22T09:40:20.006854595Z",16359],["2018-03-22T09:40:30.006972975Z",0],["2018-03-22T09:40:40.007790218Z",45444],["2018-03-22T09:40:50.006385094Z",0],["2018-03-22T09:41:00.006288237Z",0],["2018-03-22T09:41:10.009963188Z",0],["2018-03-22T09:41:20.006033764Z",0],["2018-03-22T09:41:30.008044358Z",0],["2018-03-22T09:41:40.007014639Z",0],["2018-03-22T09:41:50.006809487Z",0],["2018-03-22T09:42:00.006046642Z",1762],["2018-03-22T09:42:10.005927992Z",4222],["2018-03-22T09:42:20.008528998Z",0],["2018-03-22T09:42:30.005848554Z",0],["2018-03-22T09:42:40.006107917Z",0],["2018-03-22T09:42:50.00498947Z",846],["2018-03-22T09:43:00.007777063Z",0],["2018-03-22T09:43:10.008400553Z",0],["2018-03-22T09:43:20.007282831Z",0],["2018-03-22T09:43:30.005463251Z",0],["2018-03-22T09:43:40.006502086Z",0],["2018-03-22T09:43:50.011843018Z",0],["2018-03-22T09:44:00.006923637Z",237927],["2018-03-22T09:44:10.006916462Z",0],["2018-03-22T09:44:20.007070573Z",0],["2018-03-22T09:44:30.006434706Z",0],["2018-03-22T09:44:40.008960987Z",0],["2018-03-22T09:44:50.036528806Z",0],["2018-03-22T09:45:00.007326221Z",0],["2018-03-22T09:45:10.006418554Z",0],["2018-03-22T09:45:20.005371607Z",404339],["2018-03-22T09:45:30.00638135Z",0],["2018-03-22T09:45:40.006807589Z",0],["2018-03-22T09:45:50.006086539Z",0],["2018-03-22T09:46:00.008244593Z",0],["2018-03-22T09:46:10.007726837Z",0],["2018-03-22T09:46:20.005503244Z",0],["2018-03-22T09:46:30.006194513Z",0],["2018-03-22T09:46:40.006165677Z",0],["2018-03-22T09:46:50.006276536Z",0],["2018-03-22T09:47:00.006928997Z",0],["2018-03-22T09:47:10.008496197Z",0],["2018-03-22T09:47:20.006380049Z",0],["2018-03-22T09:47:30.006519187Z",0],["2018-03-22T09:47:40.005615575Z",0],["2018-03-22T09:47:50.006103605Z",0],["2018-03-22T09:48:00.007024504Z",0],["2018-03-22T09:48:10.006085676Z",0],["2018-03-22T09:48:20.006511104Z",0],["2018-03-22T09:48:30.006053418Z",0],["2018-03-22T09:48:40.007762592Z",0],["2018-03-22T09:48:50.005930615Z",0],["2018-03-22T09:49:00.006780781Z",0],["2018-03-22T09:49:10.005417773Z",0],["2018-03-22T09:49:20.007065007Z",0],["2018-03-22T09:49:30.005729835Z",0],["2018-03-22T09:49:40.006605907Z",0],["2018-03-22T09:49:50.006815189Z",0],["2018-03-22T09:50:00.007193227Z",0],["2018-03-22T09:50:10.006746441Z",0],["2018-03-22T09:50:20.005102971Z",0],["2018-03-22T09:50:30.006278497Z",619],["2018-03-22T09:50:40.00628128Z",0],["2018-03-22T09:50:50.011324997Z",0],["2018-03-22T09:51:00.007879166Z",0],["2018-03-22T09:51:10.007007647Z",0],["2018-03-22T09:51:20.005091942Z",0],["2018-03-22T09:51:30.006217169Z",1692],["2018-03-22T09:51:40.005591945Z",0],["2018-03-22T09:51:50.007303755Z",3614801],["2018-03-22T09:52:00.007136759Z",0],["2018-03-22T09:52:10.006799465Z",1070202],["2018-03-22T09:52:20.0090033Z",825029],["2018-03-22T09:52:30.007083838Z",0],["2018-03-22T09:52:40.007638203Z",244726],["2018-03-22T09:52:50.072394766Z",1292],["2018-03-22T09:53:00.008559682Z",0],["2018-03-22T09:53:10.010251274Z",0],["2018-03-22T09:53:20.007137417Z",0],["2018-03-22T09:53:30.006936199Z",0],["2018-03-22T09:53:40.006149365Z",4668],["2018-03-22T09:53:50.008553242Z",434],["2018-03-22T09:54:00.005108966Z",0],["2018-03-22T09:54:10.006044256Z",0],["2018-03-22T09:54:20.011682588Z",0],["2018-03-22T09:54:30.005668736Z",0],["2018-03-22T09:54:40.005795757Z",7340195],["2018-03-22T09:54:50.007031558Z",1320],["2018-03-22T09:55:00.007189511Z",0],["2018-03-22T09:55:10.012305214Z",0],["2018-03-22T09:55:20.035979555Z",1356],["2018-03-22T09:55:30.005178555Z",0],["2018-03-22T09:55:40.007325861Z",0],["2018-03-22T09:55:50.006902348Z",0],["2018-03-22T09:56:00.009476608Z",18392],["2018-03-22T09:56:10.013807301Z",2120],["2018-03-22T09:56:20.005554754Z",0],["2018-03-22T09:56:30.006455781Z",0],["2018-03-22T09:56:40.005391641Z",0],["2018-03-22T09:56:50.007446552Z",421],["2018-03-22T09:57:00.005717135Z",0],["2018-03-22T09:57:10.004999026Z",0],["2018-03-22T09:57:20.005471279Z",64793],["2018-03-22T09:57:30.005793135Z",0],["2018-03-22T09:57:40.005695822Z",0],["2018-03-22T09:57:50.006826786Z",0],["2018-03-22T09:58:00.006339756Z",0],["2018-03-22T09:58:10.00599645Z",0],["2018-03-22T09:58:20.006878697Z",0],["2018-03-22T09:58:30.006031586Z",0],["2018-03-22T09:58:40.005799913Z",0],["2018-03-22T09:58:50.007026942Z",0],["2018-03-22T09:59:00.005803221Z",0],["2018-03-22T09:59:10.005368477Z",0],["2018-03-22T09:59:20.004927067Z",0],["2018-03-22T09:59:30.005751546Z",0],["2018-03-22T09:59:40.00832825Z",0],["2018-03-22T09:59:50.006931955Z",0],["2018-03-22T10:00:00.006042543Z",0],["2018-03-22T10:00:10.004884223Z",0],["2018-03-22T10:00:20.00701737Z",0],["2018-03-22T10:00:30.036094421Z",0],["2018-03-22T10:00:40.005278803Z",0],["2018-03-22T10:00:50.007265329Z",0],["2018-03-22T10:01:00.012563278Z",0],["2018-03-22T10:01:10.067643259Z",0],["2018-03-22T10:01:20.006025269Z",0],["2018-03-22T10:01:30.005550074Z",0],["2018-03-22T10:01:40.005865144Z",1282],["2018-03-22T10:01:50.009812828Z",0],["2018-03-22T10:02:00.005103885Z",0],["2018-03-22T10:02:10.005697613Z",0],["2018-03-22T10:02:20.005107563Z",0],["2018-03-22T10:02:30.00499463Z",0],["2018-03-22T10:02:40.004738023Z",0],["2018-03-22T10:02:50.005975516Z",0],["2018-03-22T10:03:00.020246899Z",0],["2018-03-22T10:03:10.005708841Z",0],["2018-03-22T10:03:20.011287957Z",0],["2018-03-22T10:03:30.005781837Z",0],["2018-03-22T10:03:40.005332126Z",0],["2018-03-22T10:03:50.02045129Z",0],["2018-03-22T10:04:00.005200308Z",0],["2018-03-22T10:04:10.005944628Z",0],["2018-03-22T10:04:20.035337755Z",0],["2018-03-22T10:04:30.005680563Z",0],["2018-03-22T10:04:40.005075344Z",0],["2018-03-22T10:04:50.007124147Z",0],["2018-03-22T10:05:00.005370552Z",0],["2018-03-22T10:05:10.007795313Z",0],["2018-03-22T10:05:20.005896394Z",0],["2018-03-22T10:05:30.012862181Z",0],["2018-03-22T10:05:40.007212859Z",0],["2018-03-22T10:05:50.008343613Z",0],["2018-03-22T10:06:00.005019329Z",0],["2018-03-22T10:06:10.006615539Z",0],["2018-03-22T10:06:20.005733589Z",0],["2018-03-22T10:06:30.03677644Z",0],["2018-03-22T10:06:40.006397533Z",0],["2018-03-22T10:06:50.007653606Z",0],["2018-03-22T10:07:00.005838199Z",0],["2018-03-22T10:07:10.006278449Z",0],["2018-03-22T10:07:20.068748684Z",423],["2018-03-22T10:07:30.005982907Z",23922],["2018-03-22T10:07:40.005927161Z",0]];
            if(res && res.data && res.data.results && angular.isArray(res.data.results) && res.data.results[0].series &&  angular.isArray(res.data.results[0].series)){
                if( res.data.results[0].series[0] && res.data.results[0].series[0].values && angular.isArray(res.data.results[0].series[0].values)){
                    self.data_rBandWidth = res.data.results[0].series[0].values;
                    self.data_rwBandWidth = self.data_rBandWidth;
                    self.color_rwBandWidth = ["#019fd5","#051d4e","#035184"];
                }
            }
            
        })
        resourceSrv.sqlQuery(sqls.wBandWidth).then(function(res){
            if(res && res.data && res.data.results && angular.isArray(res.data.results) && res.data.results[0].series &&  angular.isArray(res.data.results[0].series)){
                if( res.data.results[0].series[0] && res.data.results[0].series[0].values && angular.isArray(res.data.results[0].series[0].values)){
                    self.data_wBandWidth = res.data.results[0].series[0].values;
                }
            }
        })
        //获取nodeList
        resourceSrv.getCurRegNodeList().then(function(res){
            if(res && res.data && angular.isArray(res.data)){
                self.nodeList = res.data.filter(item => item.regionName == localStorage.regionName);
                self.nodeSelect = res.data[0];
                getNodeRes(self.nodeSelect.nodeUid)
                getClusterNodeHealth(self.nodeList,self.nodeSelect.regionUid)
                setNodev=$interval(setNode,5000);
            }
        })
        //物理机cpu使用率top5
        resourceSrv.phycpuTop().then(function(res){
            if(res && res.data && angular.isArray(res.data)){
                self.phycpuTop_xaxis = [];
                self.phycpuTop_yaxis = [];
                res.data.map(item => {
                    self.phycpuTop_yaxis.push(item.host);
                    self.phycpuTop_xaxis.push(item.usage_total.toFixed(1))
                });
            }
        })
        //虚拟机cpu使用率top5
        resourceSrv.vmcpuTop().then(function(res){
            if(res && res.data && res.data.cpuUsageTop5 && angular.isArray(res.data.cpuUsageTop5)){
                self.vmcpuTop_yaxis = [];
                self.vmcpuTop_xaxis = [];
                res.data.cpuUsageTop5.map(item => {
                    self.vmcpuTop_yaxis.push(item.host);
                    self.vmcpuTop_xaxis.push(item.usage_total.toFixed(1))
                });
            }
        })

        resourceSrv.getOshypervisorsStatistics().then(function(res) {
            if (res && res.data) {
                return res.data;
            }
        }).then(function(statisticsData) {
            resourceSrv.getConfigValues().then(function(res){
                var cpuConfigvalue = res.data.cpu_allocation_ratio ? Number(res.data.cpu_allocation_ratio) : 1; 
                var ramConfigValue = res.data.ram_allocation_ratio ? Number(res.data.ram_allocation_ratio) : 1;
                var diskConfigValue = res.data.disk_allocation_ratio ? Number(res.data.disk_allocation_ratio) : 1; 
                if (statisticsData) {
                    statisticsData.vcpus = statisticsData.vcpus ? statisticsData.vcpus : 0;
                    statisticsData.vcpus_used = statisticsData.vcpus_used ? statisticsData.vcpus_used : 0;
                    statisticsData.memory_mb = statisticsData.memory_mb ? statisticsData.memory_mb : 0;
                    statisticsData.reserved_host_memory_mb = statisticsData.reserved_host_memory_mb ? statisticsData.reserved_host_memory_mb : 0;
                    statisticsData.memory_mb_used = statisticsData.memory_mb_used ? statisticsData.memory_mb_used : 0;
                    self.hostCPUTotal = statisticsData.vcpus * cpuConfigvalue;
                    self.allocatedCpu = statisticsData.vcpus_used;
                    self.unAlloactedCpu = self.hostCPUTotal - self.allocatedCpu;
                    let org_hostMemoryTotal = (Number(statisticsData.memory_mb)*ramConfigValue - Number(statisticsData.reserved_host_memory_mb))/1024;
                    let org_allocatedRam = (Number(statisticsData.memory_mb_used) - Number(statisticsData.reserved_host_memory_mb)) / 1024;
                    self.hostMemoryTotal = Math.ceil(org_hostMemoryTotal) === org_hostMemoryTotal ? org_hostMemoryTotal:org_hostMemoryTotal.toFixed(1);
                    self.allocatedRam = Math.ceil(org_allocatedRam) === org_allocatedRam ? org_allocatedRam:org_allocatedRam.toFixed(1);
                    let _unAllocatedRam = Number(self.hostMemoryTotal) - Number(self.allocatedRam);
                    self.unAllocatedRam = Math.ceil(_unAllocatedRam) === _unAllocatedRam?_unAllocatedRam:_unAllocatedRam.toFixed(1);

                    let storageTotal = statisticsData && statisticsData.local_gb ? Number(statisticsData.local_gb) : 0; //标准版磁盘总量不乘超分
                    let storageUsed = statisticsData && statisticsData.local_gb_used ? Number(statisticsData.local_gb_used) : 0;
                    storageUsed = (storageUsed/1024);
                    storageTotal = (storageTotal/1024);
                    self.free_disk= [];
                    self.free_disk.push({
                        name:"本地磁盘",
                        free:(storageTotal-storageUsed).toFixed(2)
                    })
                    self.total_free_disk = Number((storageTotal-storageUsed).toFixed(2));
                }
                resourceSrv.getStorage().then(function(storage){
                    if(storage && storage.data && angular.isArray(storage.data)){
                        storage.data.map(item => {
                            if (!item.capabilities.max_over_subscription_ratio) {
                                item.capabilities.max_over_subscription_ratio = 1;
                            }
                            var total = item.capabilities.total_capacity_gb * item.capabilities.max_over_subscription_ratio;
                            var allocated_capacity_gb;
                            var free_capacity_gb = item.capabilities.free_capacity_gb;
                            if (item.capabilities.provisioned_capacity_gb) {
                                allocated_capacity_gb = item.capabilities.provisioned_capacity_gb;
                            } else {
                                allocated_capacity_gb = item.capabilities.fresh_allocated_capabilities;
                            }
                            //var unused = [total-allocated_capacity_gb,free_capacity_gb].min();
                            var unused = total-allocated_capacity_gb;
                            self.total_free_disk += Number((unused/1024).toFixed(2));
                            self.free_disk.push({
                                name:item.disPlayName,
                                free:(unused/1024).toFixed(2)
                            })
                        })
                    }
                    self.total_free_disk = self.total_free_disk.toFixed(2);
                })
            })
            
        })
    }
    getAllPageServer();
    SetTimer();
}