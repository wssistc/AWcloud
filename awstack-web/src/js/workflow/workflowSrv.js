angular.module("workflowSrv", [])
.service("workflowsrv", function($rootScope, $http) {
    //var enterpriseUid = localStorage.enterpriseUid ? localStorage.enterpriseUid : "";
    //var userId = localStorage.$USERID ? localStorage.$USERID : "";
    return {
        getTaskData: function(options) {
            return $http({
                method:"GET",
                url:"/awstack-workflow/v1/enterprises/"+options+"/processes"
            });
        },
        getModelData: function(options) {
            return $http({
                method:"GET",
                url:"/awstack-workflow/v1/enterprises/"+options+"/models"
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
                url:"/awstack-workflow/v1/enterprises/"+options+"/models/"+id+"/assignment",
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
