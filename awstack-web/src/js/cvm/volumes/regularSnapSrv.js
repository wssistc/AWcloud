var tableService = angular.module("regularSnapSrvModule", []);
tableService.service("regularSnapSrv", function($rootScope, $http) {
    var static_url = "awstack-schedule/v1/";
    return {
        gettasks: function(obj) {
            return $http({
                method: "get",
                url: static_url + "list/snapshots/schedule/job",
                params:obj
            });
        },
        gettasksDetail: function(id) {
            return $http({
                method: "get",
                url: static_url + "schedule/job/result/schedulejobid/"+id  
            });
        },
        createTask:function(options,ids){
            return $http({
                method: "post",
                url: "awstack-schedule/v1/add/snapshots/schedule/job",
                data: options,
                params:ids
            });
        },
        delTask: function(id) {
            return $http({
                method: "DELETE",
                url: static_url + "snapshots/schedule/job/schedulejobid/"+id
            });
        },
        delTaskBatch: function(ids) {
            return $http({
                method: "DELETE",
                url: static_url + "snapshots/schedule/job/schedulejobids/",
                params:ids
            });
        },
        updateTask: function(data,params) {
            return $http({
                method: "PUT",
                url: static_url + "edit/snapshots/schedule/job",
                data: data,
                params:params
            });
        },
        updateTaskBack:function(option){
            return $http({
                method: "PUT",
                url: static_url + "edit/snapshots/schedule/job/back",
                params:option
            });
        },
        pauseTask: function(id) {
            return $http({
                method: "PUT",
                url: static_url + "pause/snapshots/schedule/job/schedulejobid/"+id
            });
        },
        resumeTask: function(id) {
            return $http({
                method: "PUT",
                url: static_url + "resume/snapshots/schedule/job/schedulejobid/"+id
            });
        },
        getJobSnaps:function(id){
            return $http({
                method: "GET",
                headers:{"project_id":localStorage.projectUid},
                url: static_url + "schedule/job/snapshots",
                params:{"jobId":id}
            });
        },
        getJobBackups:function(id){
            return $http({
                method: "GET",
                headers:{"project_id":localStorage.projectUid},
                url: static_url + "schedule/job/backups",
                params:{"jobId":id}
            });
        }
    };

});
