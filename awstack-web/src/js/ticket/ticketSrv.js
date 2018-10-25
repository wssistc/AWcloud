angular.module("ticketSrv", [])
.service("ticketsrv", function($rootScope, $http) {
    var static_quota_url = "awstack-user/v1";
    //var enterpriseUid=localStorage.enterpriseUid;
    return {
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
        getQaByUserTo: function(id,cFlag) {
            return $http({
                method: "get",
                url:"/awstack-workflow/v1/qa/enterprises/"+localStorage.enterpriseUid+"/haqa/"+id+"/"+cFlag,
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
        seeTicket: function(processInstanceId) {
            return $http({
                method: "get",
                url:"/awstack-workflow/v1/enterprises/"+localStorage.enterpriseUid+"/histasks/instance/"+processInstanceId,
            });       
        },
        getAssignName:function(id){
            return $http({
                method: "get",
                url:static_quota_url+"/enterprises/"+localStorage.enterpriseUid+"/users/"+id,
            }); 
        },
        getProHave: function(projectUid) {
            return $http({
                method: "get",
                url: static_quota_url + "/getNewQuotas?type=project_quota&targetId="+projectUid+"&enterpriseUid="+localStorage.enterpriseUid
            });       
        },
        getNoSignList: function(enterpriseUid,userId) {
            return $http({
                method:"GET",
                url:"/awstack-workflow/v1/enterprises/"+enterpriseUid+"/tasks/"+userId
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
        gethandledList: function(enterpriseUid,userId) {
            return $http({
                method:"GET",
                url:"/awstack-workflow/v1/enterprises/"+enterpriseUid+"/histasks/user/"+userId
            });
        },
        startJob: function(data,enterpriseUid) {
            return $http({
                method:"POST",
                url:"/awstack-workflow/v1/enterprises/"+enterpriseUid+"/instances",
                data:data
            });
        },
        setQaTicket:function(userId){
            return $http({
                method:"GET",
                url:"/awstack-workflow/v1/histasks/user/"+userId
            });
        },
        getProjectsList:function(){
            return $http({
                method:"GET",
                url:"/awstack-user/v1/user/projects"
            });
        },
        getApplyList:function(id,flag){
            return $http({
                method:"GET",
                url:"/awstack-workflow/v1/qa/enterprises/"+localStorage.enterpriseUid+"/myqa/"+id
            });
        },
        getApplyListR:function(id){
            return $http({
                method:"GET",
                url:"/awstack-workflow/v1/instances/his/user/"+id
            });
        },
        getassigneeNameList:function(id){
            return $http({
                method:"GET",
                url:"/awstack-workflow/v1/enterprises/"+localStorage.enterpriseUid+"/tasks/"+id+"/identitylinks"
            });
        },
        //获取信息咨询
        getMasTask:function(enterpriseUid,userId){
        	return $http({
                method:"GET",
                url:"/awstack-workflow/v1/qa/enterprises/"+enterpriseUid+"/wq/"+userId
            })
        },
        //改变信息咨询是否已读状态
        changeMasStatus:function(userId,masId,data){
            return $http({
                method:"POST",
               	url:"/awstack-workflow/v1/qa/enterprises/"+localStorage.enterpriseUid+"/rdqa/"+userId+"/"+masId,
               	data:data
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
        unHandledTickets:[],
        unHandledMessage:0,
    };
});
