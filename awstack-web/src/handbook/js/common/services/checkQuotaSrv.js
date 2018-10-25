import "../../cvm/networks/networksSrv";
var checkQuotaModule = angular.module("checkQuotaModule",["networksSrvModule"]);

checkQuotaModule.service("checkQuotaSrv",function(networksSrv,$translate){
    return {
        checkQuota:function(self,name){
            var domain_inUsed = 0,
                pro_inUsed = {
                    [name]:0
                }; 
            self.domain_total = {};
            self.project_total = {};
            self.beyondQuota_dep = {};
            self.beyondQuota_pro = {};
            //判断是否超出部门配额
            networksSrv.getDomianQuota({ //部门配额总数
                type:"domain_quota",
                targetId:localStorage.domainUid,
                enterpriseUid:localStorage.enterpriseUid,
                name:name
            }).then(function(res){
                networksSrv.getQuotaUsed({  //获取已使用的
                    enterpriseUid:localStorage.enterpriseUid,
                    name:name
                }).then(function(result){
                    domain_inUsed = (result && result.data && result.data[0])?Number(result.data[0].inUse):0;
                    if(res && res.data){
                        self.domain_total[name] = res.data[0].hardLimit;
                        if(Number(res.data[0].hardLimit) > domain_inUsed){
                            self.beyondQuota_dep[name] = false;
                        }else{
                            self.beyondQuota_dep[name] = true;
                        }
                        //展示配额柱条
                        self.domain_data={
                            title:$translate.instant("aws.depart.quota"),
                            inUsed:domain_inUsed,
                            beAdded:1,
                            total:self.domain_total[name]
                        };
                    }
                });
            });

            //判断是否超出项目配额
            networksSrv.getDomianQuota({ //获取项目配额总数
                type:"project_quota",
                targetId:localStorage.projectUid,
                enterpriseUid:localStorage.enterpriseUid,
                name:name
            }).then(function(res){
                networksSrv.getProQuotasUsages({
                    type:"project_quota",
                    projectUid:localStorage.projectUid,
                    domainUid:localStorage.domainUid,
                    enterpriseUid:localStorage.enterpriseUid,
                    name:name
                }).then(function(result){
                    pro_inUsed[name] = (result && result.data && result.data[0])?Number(result.data[0].inUse):0;
                    if(res && res.data){
                        self.project_total[name] = res.data[0].hardLimit;
                        if(Number(res.data[0].hardLimit) > pro_inUsed[name]){
                            self.beyondQuota_pro[name] = false;
                        }else{
                            self.beyondQuota_pro[name] = true;
                        }
                        self.project_data={
                            title:$translate.instant("aws.project.quota"),
                            inUsed: pro_inUsed[name],
                            beAdded:1,
                            total:self.project_total[name]
                        };
                    }
                });
            });
        }
    };
});