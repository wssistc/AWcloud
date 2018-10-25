angular.module("flowapplyModule", ["ngTable", "ngAnimate", "ui.bootstrap.tpls", "ui.tree", "checkedsrv"])
  .controller("flowapplyCtrl", ["$scope", "$rootScope", "NgTableParams", "$uibModal", "workflowsrv", "alertSrv", "$translate","checkedSrv","$location","GLOBAL_CONFIG",function(scope, rootScope, NgTableParams, $uibModal, workflowsrv, alertSrv, $translate,checkedSrv,$location,GLOBAL_CONFIG) {
      var self = scope;
      var enterpriseUid = localStorage.enterpriseUid ? localStorage.enterpriseUid : "";
      self.headers = {
          "name": $translate.instant("aws.workflow.ticketName"),
          "description": $translate.instant("aws.workflow.description"),
          "modelName": $translate.instant("aws.workflow.name")
      };
      self.applyGlobalSearch = function() {
          var term = self.flow.globalSearchTerm;
          self.tableParams.filter({ $: term });
      };
      self.createJob = function(){
          $uibModal.open({
              animation: scope.animationsEnabled,
              templateUrl: "createJob.html",
              controller: "createJobCtrl",
              resolve: {
                  items: function() {
                      return getJobList;
                  }
              }
          });
      };

      self.editJob = function(editData){
          self.itemsDeliver = {editData:editData,getJobList:getJobList};
          $uibModal.open({
              animation: scope.animationsEnabled,
              templateUrl: "createJob.html",
              controller: "editJobCtrl",
              resolve: {
                  items: function() {
                      return self.itemsDeliver;
                  }
              }
          });
      };
      function getJobList(){
          workflowsrv.getJobList().then(function(result){
              if(result.data){
                  var data = result.data;
                  self.Jobdatas = result.data;
                  self.tableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: data });
                  checkedSrv.checkDo(self,result,"paramId");
              }
          });
      }
      if(enterpriseUid){
          getJobList();
      }
      self.refresh = function(){
          if(enterpriseUid){
              getJobList();
          }
      };
      self.startJob = function(editData) {
          var content = {
              target: "startJob",
              msg: "<span>您确定要启动吗？</span>",
              type: "info",
              btnType: "btn-primary",
              data:editData
          };
          self.$emit("delete", content);
      };
      self.$on("startJob", function(e,data) {
          var _data = {
              key:data.paramName,
              busiData:{}
          };
          if(enterpriseUid){
              workflowsrv.startJob(enterpriseUid,_data);
          }
      });
      self.deleteJob = function(checkedItems) {
          var content = {
              target: "deleteJob",
              msg: "<span>您确定要删除吗？</span>",
              data:checkedItems
          };
          self.$emit("delete", content);
      };
      self.$on("deleteJob", function(e,data) {
          var arr = [];
          var postData = {dataIds: arr };
          angular.forEach(data,function(v){
              arr.push(v.id);
          });
          if(enterpriseUid){
              workflowsrv.deleteJob(enterpriseUid,postData)
        .then(function(){
            getJobList();
        });
          }
      });
  }])
  .controller("createJobCtrl",["$scope","workflowsrv","$location","$uibModalInstance","items",function(scope,workflowsrv,$location,$uibModalInstance,items){
      var self = scope;
      var enterpriseUid = localStorage.enterpriseUid ? localStorage.enterpriseUid : "";
      self.jobname = {
          selected:""
      };
      workflowsrv.getTaskData(enterpriseUid).then(function(result){
          if(result.data){
              self.jobData = result.data;
          }
      });
      self.createJobconfirm = function(m){
          if(m.$valid){
              if(enterpriseUid){
                  var urlName = encodeURI(self.name);
                  var data = {
                      "paramDesc":self.decription,
                      "enterpriseUid":enterpriseUid,
                      "paramValue":self.jobname.selected,
                      "paramName":urlName,
                      "parentId":15,
                      "paramLevel":2,
                      "regionUid":angular.fromJson(localStorage.$LOGINDATA).regionUid,
                      "regionKey":localStorage.regionKey
                  };
                  workflowsrv.createJob(data).then(function(){
                      items(enterpriseUid);
                      $uibModalInstance.close();
                  });
              }
          }else{
              self.submitValid = true;
          }
      };
  }])
  .controller("editJobCtrl",["$scope","workflowsrv","$location","$uibModalInstance","items",function(scope,workflowsrv,$location,$uibModalInstance,items){
      var self = scope;
      var enterpriseUid = localStorage.enterpriseUid ? localStorage.enterpriseUid : "";
      self.jobname = {
          selected:""
      };
      self.name = items.editData.paramName;
      self.decription = items.editData.paramDesc;
      workflowsrv.getTaskData(enterpriseUid).then(function(result){
          if(result.data){
              self.jobData = result.data;
              self.jobname.selected = items.editData.paramValue;
          }
      });
      self.createJobconfirm = function(m){
          if(m.$valid){
            if(enterpriseUid){
              var data = {
                  "paramDesc":self.decription,
                  "enterpriseUid":enterpriseUid,
                  "regionUid":0,
                  "paramValue":self.jobname.selected,
                  "paramId":items.editData.paramId,
                  "paramName":self.name,
                  "parentId":15
              };
              workflowsrv.editJob(data).then(function(){
                  $uibModalInstance.close();
                  items.getJobList(enterpriseUid);
              });
            }
          }else{
              self.submitValid = true;
          }
      };
  }]);
