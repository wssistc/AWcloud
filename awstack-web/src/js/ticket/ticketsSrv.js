
angular.module("ticketsSrv", [])
.service("ticketsSrv", function($rootScope, $http) {
    var static_quota_url = "awstack-user/v1";
    return {
        getApplyTypes: function() {
            return $http({
                method: "get",
                url:"/awstack-workflow/v1/enterpriseUid/"+localStorage.enterpriseUid+"/domain/"+localStorage.domainUid,
            });       
        },
        getProjectsList:function(){
            return $http({
                method:"GET",
                url:"/awstack-user/v1/user/domains/projects"
            });
        },
        getProHave: function(projectUid) {
            return $http({
                method: "get",
                url: static_quota_url + "/getNewQuotas?type=project_quota&targetId="+projectUid+"&enterpriseUid="+localStorage.enterpriseUid
            });       
        },
        getAllNode: function(regionUides) {
            return $http({
                method: "get",
                url: "awstack-user/v1/enterprises/"+localStorage.enterpriseUid+"/regions/"+regionUides+"/nodes/list"
            });
        },
        getDomainHave:function(domainUid) {
            return $http({
                method: "get",
                url: static_quota_url + "/getNewQuotas?type=domain_quota&targetId="+domainUid+"&enterpriseUid="+localStorage.enterpriseUid
            });       
        },
        getDomainQuotas:function(domainUid){
            return $http({
                method: "get",
                url: static_quota_url + "/domain/quotas?type=domain_quota&targetId="+domainUid+"&enterpriseUid="+localStorage.enterpriseUid
            });  
          
        },
        startJob: function(data,enterpriseUid) {
            return $http({
                method:"POST",
                url:"/awstack-workflow/v1/enterprises/"+enterpriseUid+"/domainUid/"+localStorage.domainUid+"/instances",
                data:data
            });
        },
        getAddressee: function() {
            return $http({
                method: "get",
                url:"/awstack-user/v1/enterprises/"+localStorage.enterpriseUid+"/users",
            });       
        },
        addQaFun: function(params,id) {
            return $http({
                method: "POST",
                url:"/awstack-workflow/v1/qa/enterprises/"+localStorage.enterpriseUid+"/aqa/"+id,
                data:params
            });       
        },
        getMasTask:function(enterpriseUid,userId){
        	return $http({
                method:"GET",
                url:"/awstack-workflow/v1/qa/enterprises/"+enterpriseUid+"/wq/"+userId
            })
        },
        getQaByUserTo: function(id,cFlag) {
            return $http({
                method: "get",
                url:"/awstack-workflow/v1/qa/enterprises/"+localStorage.enterpriseUid+"/haqa/"+id+"/"+cFlag,
            });       
        },
        getFlowList:function(){
            return $http({
                method:"GET",
                url:"/awstack-workflow/v1/ticketType"
            });
        },
        getQaRepliesByQaId : function(id) {
            return $http({
                method: "get",
                url:"/awstack-workflow/v1/qa/enterprises/"+localStorage.enterpriseUid+"/qard/"+id,
            });       
        },
        addQaReply: function(params,id) {
            return $http({
                method: "POST",
                url:"/awstack-workflow/v1/qa/enterprises/"+localStorage.enterpriseUid+"/aqar/"+id,
                data:params
            });       
        },
        getAssignName:function(id){
            return $http({
                method: "get",
                url:static_quota_url+"/enterprises/"+localStorage.enterpriseUid+"/users/"+id,
            }); 
        },
        getNoSignList: function(enterpriseUid,userId) {
            return $http({
                method:"GET",
                url:"/awstack-workflow/v1/enterprises/"+enterpriseUid+"/tasks/"+userId
            });
        },
        //我的申请 信息咨询
        getApplyList:function(id,flag){
            return $http({
                method:"GET",
                url:"/awstack-workflow/v1/qa/enterprises/"+localStorage.enterpriseUid+"/myqa/"+id
            });
        },
        //w我的申请 资源申请
        getApplyListR:function(id){
            return $http({
                method:"GET",
                url:"/awstack-workflow/v1/instances/his/user/"+id
            });
        },
        seeTicket: function(processInstanceId) {
            return $http({
                method: "get",
                url:"/awstack-workflow/v1/enterprises/"+localStorage.enterpriseUid+"/histasks/instance/"+processInstanceId,
            });       
        },
         //关闭信息咨询
         closeMasQur:function(masId,data){
        	return $http({
                method:"POST",
               	url:"/awstack-workflow/v1/qa/enterprises/"+localStorage.enterpriseUid+"/cqa/"+masId,
               	data:data
            });
        },
        SignedTask: function(taskid,userId) {
            return $http({
                method:"PUT",
                url:"/awstack-workflow/v1/tasks/"+taskid+"/assignee/"+userId
            });
        },
        
        handleTask: function(taskid,data) {
            return $http({
                method:"PUT",
                url:"/awstack-workflow/v1/tasks/"+taskid,
                data:data
            });
        },
       //所有工单 资源申请 api
        getAllResApplys:function(userId){
            return $http({
                method:"GET",
                url:"/awstack-workflow/v1/enterprises/"+localStorage.enterpriseUid+"/tasks/user/"+userId
            });
        },
         //所有工单 信息咨询
        getAllQas:function(userId){
            return $http({
                method:"GET",
                url:"/awstack-workflow/v1/qa/enterprises/"+localStorage.enterpriseUid+"/haqa/"+userId+"/user"
            });
        },
        //资源申请 网络申请获取所有网络列表
        getNetworks:function(userId){
            return $http({
                method:"GET",
                url:"/awstack-resource/v1/listPrivateNetworks"
            });
        },
         //资源申请 路由器申请获取路由器公网列表
         getExtNets:function(userId){
            return $http({
                method:"GET",
                url:"/awstack-resource/v1/extnets"
            });
        },
         //资源申请 路由器申请获取路由器子网列表
        getTenantSubs: function() {
            return $http({
                method: "get",
                url: "/awstack-resource/v1/projectSubs"
            });
        },
        //资源申请 获取审批人信息
        getTicketFlowInfo:function(deploymentId,processInstanceId) {
            return $http({
                method: "get",
                url: "/awstack-workflow/v1/enterprises/"+localStorage.enterpriseUid+"/deploymentId/"+deploymentId+"/assignment?processInstanceId="+processInstanceId
            });
        },
        //云主机申请 获取部门项目 网络
        getProjectNetwork: function() {
            return $http({
                method: "GET",
                url:"awstack-resource/v1/projectNetworks",
            });
        },
        //云主机申请 规格
        getFlavors: function() {
            return $http({
                method: "GET",
                url:"awstack-resource/v1/flavors",
            });
        },
        //云硬盘申请 获取存储设备
        getStorageDeviceList: function() {
            return $http({
                method: "GET",
                url:"awstack-user/v1/storage/list",
            });
        },
        changeMasStatus:function(userId,masId,data){
            return $http({
                method:"POST",
               	url:"/awstack-workflow/v1/qa/enterprises/"+localStorage.enterpriseUid+"/rdqa/"+userId+"/"+masId,
               	data:data
            });
        },
        //工单报表 列表
        getTicketReportsList:function(enterpriseUid,params) {
            return $http({
                method: "get",
                url: "/awstack-workflow/v1/enterpriseUid/"+enterpriseUid+"/his/ticket",
                params:params

            });
        },
        //工单报表 列表
        getDepartmentUser:function() {
            return $http({
                method: "get",
                url: "/awstack-user/v1/enterprises/"+localStorage.enterpriseUid+"/domains/users"

            });
        },
        //获取所有用户
        getAllUser:function() {
            return $http({
                method: "get",
                url: "/awstack-user/v1/enterpriseUid/"+localStorage.enterpriseUid+"/all/domain/user"

            });
        },
         //撤销申请
         repealResApply:function(processInstanceId) {
            return $http({
                method: "put",
                url: "/awstack-workflow/v1/enterpriseUid/processInstanceId/"+processInstanceId+"/delete"

            });
        },
        //工单报表 信息咨询api
        reportApplyLists:function(enterpriseUid,params) {
            return $http({
                method: "get",
                url: "/awstack-workflow/v1/enterpriseUid/"+enterpriseUid+"/his/qaWithTicket",
                params:params
            });
        },
        //获取数据中心列表
        getRegionList:function(){
            return $http({
                method: "get",
                url: "/awstack-user/v1/enterprises/"+localStorage.enterpriseUid+"/regions",
            });
        },
        unHandledTickets:[],
        unHandledMessage:0,
    };
});
