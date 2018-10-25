angular.module("flowManageSrvModule", [])
.service("flowManageSrv", function($rootScope, $http) {
    //var enterpriseUid = localStorage.enterpriseUid ? localStorage.enterpriseUid : "";
    //var userId = localStorage.$USERID ? localStorage.$USERID : "";
    return {
        getTaskData: function(options) {
            return $http({
                method:"GET",
                url:"/awstack-workflow/v1/enterprises/"+options+"/processes"
            });
        },
        //自定义流程列表
        getModelData: function(options) {
            return $http({
                method:"GET",
                url:"/awstack-workflow/v1/enterprises/"+options+"/models"
            });
        },
        //自定义流程详情
        getFlowDetail:function(options,modelId){
            return $http({
                method:"GET",
                url:"/awstack-workflow/v1/enterprises/"+options+"/models/"+modelId+"/detail"
            });
        },
        //新建工作流选择工单类型列表
        getFlowList:function(){
            return $http({
                method:"GET",
                url:"/awstack-workflow/v1/ticketType"
            });
        },
        //新建工作流选择部门列表
        getDepartments:function(options){
            return $http({
                method:"GET",
                url:"/awstack-user/v1/enterprises/"+options+"/domainsList"
            });
        },
        //工作流列表
        getWorkflowList:function(){
            return $http({
                method:"GET",
                url:"/awstack-workflow/v1/enterpriseUid/"+localStorage.enterpriseUid+"/deployModelList"
            });
        },
        //自定义流程 新建 获取id
        createModel:function(id){
            return $http({
                method:"GET",
                url:"/awstack-workflow/v1/enterprises/"+id+"/getModelId",
            });
        },
        //获取审批人
        getApprovers:function(){
            return $http({
                method:"GET",
                url:  "/awstack-user/v1/domain/project/users",
            });
        },
        //新建工作流
        createWorkflow: function(data) {
            return $http({
                method:"PUT",
                url:"/awstack-workflow/v1/enterprises/models/assignment",
                data:data
            });
        },
        //编辑工作流
        editWorkflow: function(data) {
            return $http({
                method:"PUT",
                url:"/awstack-workflow/v1/enterprises/models/assignment/userRela",
                data:data
            });
        },
       
         //编辑工作流审批人
         editGetApprovers: function(id) {
            return $http({
                method:"GET",
                url:"/awstack-user/v1/domain/project/users/"+id,
            });
        },
        //判断新建流程类型是否重复
        checkFlowRepeat:function(enterpriseUid,ticketType,data){
            return $http({
                method:"GET",
                url:"/awstack-workflow/v1/enterpriseUid/"+enterpriseUid+"/deploycheck/"+ticketType,
                params:data,
            });
        },
        getWorkflowDetail:function(id){
            return $http({
                method:"GET",
                url:"/awstack-workflow/v1/enterpriseUid/"+localStorage.enterpriseUid+"/deployModelDetail/"+id
            });
        },
        createFlow: function(options,data) {
            return $http({
                method:"POST",
                url:"/awstack-workflow/v1/enterprises/"+options+"/models",
                data:data
            });
        },
        deployedFlow: function(options,id,data) {
            return $http({
                method:"PUT",
                url:"/awstack-workflow/v1/enterprises/"+options+"/models/"+id+"/",
                data:data
            });
        },
        getModelNode: function(options,id) {
            return $http({
                method:"GET",
                url:"/awstack-workflow/v1/enterprises/"+options+"/models/"+id+"/assignment"
            });
        },
        getUserList: function(options) {
            return $http({
                method:"GET",
                url:"/awstack-user/v1/enterprises/"+options+"/users"
            });
        },
        getGroupUser: function(id){
            return $http({
                method:"GET",
                url:"/awstack-user/v1/dept/"+id+"/users"
            });
        },
        getGroupList: function(options) {
            return $http({
                method:"GET",
                url:"/awstack-user/v1/enterprises/"+options+"/departments"
            });
        },
        deleteFlow: function(options,data) {
            return $http({
                method:"DELETE",
                url:"/awstack-workflow/v1/enterprises/"+options+"/models",
                params:data
            });
        },
        deleteTask: function(data) {
            return $http({
                method:"DELETE",
                url:"/awstack-workflow/v1/processes",
                params:data
            });
        },
        getTaskDetail: function(options,data) {
            return $http({
                method:"GET",
                url:"/awstack-workflow/v1/enterprises/"+options+"/processes/"+data
            });
        },
        getJobList: function() {
            return $http({
                method:"GET",
                url:"/awstack-user/v1/params",
                params:{
                    parentId:15,
                    enterpriseUid:localStorage.enterpriseUid
                }
            });
        },
        createJob: function(data) {
            return $http({
                method:"POST",
                url:"/awstack-user/v1/params",
                data:data
            });
        },
        editJob: function(data) {
            return $http({
                method:"PUT",
                url:"/awstack-user/v1/params",
                data:data
            });
        },
        deleteJob: function(options,data) {
            return $http({
                method:"DELETE",
                url:"/awstack-user/v1/dictionarys/15/enterprises/"+options+"/datas",
                params:data
            });
        },
        startJob: function(options,data) {
            return $http({
                method:"POST",
                url:"/awstack-workflow/v1/enterprises/"+options+"/instances",
                data:data
            });
        }
    };
});
