userOverviewCtrl.$inject=["$scope", "$rootScope", "$translate","$location","NgTableParams","UserOverviewSrv"];
export function userOverviewCtrl($scope, $rootScope, $translate,$location,NgTableParams,UserOverviewSrv){
    var self = $scope;
    self.info = {};
    

    function getSystemInfo(){
        UserOverviewSrv.getSystemInfos().then(function(res){
            if(res && res.data){
                self.info.domain = res.data.domain;
                self.info.project = res.data.project;
                self.info.user = res.data.user;
                self.info.instances = res.data.instances;
            }
        })
    }

    function setDomainValue(res,color1,color2){
        self.chartdata ={
            name:[] ,
            value:[],
            color:[color1,color2]      
        }
        if(res && res.data && angular.isArray(res.data)){
            res.data.map(item =>{
                item.name = item.name.toLowerCase() == "default"?$translate.instant("aws.common.defaultDepar"):item.name; 
                self.chartdata.name.push(item.name)
                self.chartdata.value.push(item.count)
            })
        }
        fillTheBar(self.chartdata)
    }
    function fillTheBar(values){
        if(values.name.length <5){
            values.name.push("");
            values.value.push("");
            fillTheBar(values)
        }else if(values.name.length == 5){
            return values;
        }
        
    }
    //获取部门下的项目top5
    self.getProjectOfDomain = function(){
        UserOverviewSrv.getProjectOfDomain().then(function(res){
            setDomainValue(res,"#51a3ff","#4e80f5")
        })
    }
    //获取部门下的user top5
    self.getUserOfDomain = function(){
        UserOverviewSrv.getUserOfDomain().then(function(res){
            setDomainValue(res,"#1abc9c","#16a085")
        })
    }
    //获取各个资源top5的项目
    function getProjectResQuotaInfo(type,color1,color2){
        self.chartdata1 ={
            name:[] ,
            value:[],
            color:[color1,color2]
        }
        UserOverviewSrv.getProjectResQuotaInfo(type).then(function(res){
            if(res && res.data &&angular.isArray(res.data)){
                res.data.map(item =>{
                    type == "ram" ? item.inUsed = parseInt(item.inUsed/1024):"";
                    item.name = item.name.toLowerCase() == "admin"?$translate.instant("aws.common.defaultProject"):item.name; 
                    self.chartdata1.name.push(item.name)
                    self.chartdata1.value.push(item.inUsed)
                })
                fillTheBar(self.chartdata1)
            }
        })
    }
    
    self.instancesNum = function(){
        getProjectResQuotaInfo("instances","#4e80f5","#51a3ff")
    }
    
    self.coresNum  = function(){
        getProjectResQuotaInfo("cores","#51a3ff","#4e80f5")
    }

    self.ramNum  = function(){
        getProjectResQuotaInfo("ram","#1abc9c","#16a085")
    }

    function setResDomainQuota(tdata,item,resName){
        if(item.name == resName){
            item.total = item.hardLimit || 100;
            item.inUsed = item.useQuotas || 0;
            tdata[resName] = item;
        }
        return tdata;

    }

    function getDomainResQuotaInfo(){
        UserOverviewSrv.getDomainResQuotaInfo().then(function(res){
            var allTableDomainData = [];
            if(res && res.data ){
                // let domains = new Set();
                // res.data.map(item => {
                //     domains.add(item.domainName)
                // })
                // Array.from(domains).map(dom => {
                //     var tdata ={
                //         "name":dom,
                //         "instances":{},
                //         "cores":{},
                //         "ram":{},
                //         "floatingiP":{}
                //     }
                //     res.data.map(item => {
                //         if(item.domainName == dom){
                //             setResDomainQuota(tdata,item,"instances")
                //             setResDomainQuota(tdata,item,"cores")
                //             setResDomainQuota(tdata,item,"ram")
                //             setResDomainQuota(tdata,item,"floatingip")
                //         }
                //     })
                //     allTableDomainData.push(tdata)
                // })
                // successFunc(allTableDomainData)
                successFunc(res.data)
            }
        })
    }
    getSystemInfo()
    getDomainResQuotaInfo()
    self.getProjectOfDomain()
    self.instancesNum()

    var data = [
        {
            domainName: "fengxy",
            inUsed: 3,
            total: 10
        },
        {
            domainName: "fengxy",
            inUsed: 3,
            total: 10
        },
        {
            domainName: "fengxy",
            inUsed: 3,
            total: 10
        },
        {
            domainName: "fengxy",
            inUsed: 3,
            total: 10
        },
        {
            domainName: "fengxy",
            inUsed: 3,
            total: 10
        },
        {
            domainName: "fengxy",
            inUsed: 3,
            total: 10
        }
        
    ]

    function successFunc(data){
        /*内存单位转换*/
        self.tabledata = data;
        self.tabledata.map(function(items){
            items.domainQuotas.map(function(item){
                if(item.name=='ram'){
                    item.inUsed=item.inUsed/1024;
                    item.total=item.total/1024;
                } 
            })
            if(items.id == 'default'){
                items._name = $translate.instant("aws.common.defaultDepar");
            }else{
                items._name = items.name;
            }
            return items;
        })
        self.tableParams = new NgTableParams(
            { count:5 },
            { counts: [], dataset: self.tabledata }
        );
    }
    
    $scope.$on("getDetail", function(event, value) {
        UserOverviewSrv.getDomainDetail(value).then(function(res){
            res.data.projectQuotas.map(function(items){
                items.projectQuotas.map(function(item){
                    if(item.name=="ram"){
                        item.total =  item.total/1024;
                        item.inUsed =item.inUsed/1024;
                    } 
                })
                if(items.name.toLowerCase() == "admin"){
                    items._name = $translate.instant("aws.common.defaultProject");
                }else{
                    items._name = items.name;
                }
                return items;
            })
            self.getDomainDetailData =res.data.projectQuotas;
            self.getDomainDetailName = res.data.name.toLowerCase() == "default"? $translate.instant("aws.common.defaultDepar"):res.data.name;
            self.DomainDetail = new NgTableParams({
                count: 5
            }, {
                counts: [],
                dataset: res.data.projectQuotas
            });
        })
    });
}