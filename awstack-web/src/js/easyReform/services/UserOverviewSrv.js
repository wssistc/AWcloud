
export function UserOverviewSrv($http){
    var static_url = "/awstack-resource/v1"
    return {
        getSystemInfos:function(){
            return $http({
                method:"GET",
                url:"/awstack-user/v1/enterprises/"+localStorage.enterpriseUid+"/system/infos"
            })
        },
        //获取部门下的项目top5
        getProjectOfDomain:function(){
            return $http({
                method:"GET",
                url:"/awstack-user/v1/enterprises/"+localStorage.enterpriseUid+"/domains/getProjects"
            })
        },
        //获取部门下的user top5
        getUserOfDomain:function(){
            return $http({
                method:"GET",
                url:"/awstack-user/v1/enterprises/"+localStorage.enterpriseUid+"/domains/getUsers"
            })
        },
        //获取各个资源top5的项目
        getProjectResQuotaInfo:function(resName){
            return $http({
                method:"GET", 
                url:"/awstack-user/v1/projects/getUseQuotaRes",
                params:{
                    enterpriseUid:localStorage.enterpriseUid,
                    resName:resName
                }
            })
        },
        getDomainResQuotaInfo:function(){
            return $http({
                method:"GET",
                url:"/awstack-user/v1/domains/getResQuotaInfo",
                params:{enterpriseUid:localStorage.enterpriseUid}
            })
        },
        getDomainDetail:function(domainUid){
            return $http({
                method:"GET", 
                url:"/awstack-user/v1/domains/getProjectResQuotaInfo",
                params:{
                    enterpriseUid:localStorage.enterpriseUid,
                    domainUid:domainUid
                }
            })
        }
    };
}

UserOverviewSrv.$inject = ["$http"];