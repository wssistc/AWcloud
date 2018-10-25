angular.module("flowprogressModule", ["ngTable", "ngAnimate", "ui.bootstrap.tpls", "ui.tree", "checkedsrv"])
  .controller("flowprogressCtrl", ["$scope", "$rootScope", "NgTableParams", "$uibModal", "workflowsrv", "alertSrv", "$translate","checkedSrv","$location","GLOBAL_CONFIG",function(scope, rootScope, NgTableParams, $uibModal, workflowsrv, alertSrv, $translate,checkedSrv,$location,GLOBAL_CONFIG) {
      var self = scope;
      self.flow = {
          handling:true,
          handled:false
      };
      self.headers = {
          "name": $translate.instant("aws.workflow.name"),
          "description": $translate.instant("aws.workflow.description"),
          "createTime": $translate.instant("aws.workflow.createTime"),
          "lastUpdateTime": $translate.instant("aws.workflow.lastUpdateTime"),
          "version": $translate.instant("aws.workflow.version"),
          "action": $translate.instant("aws.workflow.version")
      };
      self.applyGlobalSearch = function() {
          var term = self.flow.globalSearchTerm;
          self.tableParams.filter({ $: term });
      };
      function getNoSignList(){
          workflowsrv.getNoSignList().success(function(result){
              var data =[];
              if(result){
                  data = result;
                  self.tableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: data });
                  checkedSrv.checkDo(self,result,"id");
              }
          });
      }
      function gethandledList(){
          workflowsrv.gethandledList().success(function(result){
              var data =[];
              if(result){
                  data = result;
                  self.tableParams = new NgTableParams({ count: GLOBAL_CONFIG.PAGESIZE }, { counts: [], dataset: data });
                  checkedSrv.checkDo(self,result,"id");
              }
          });
      }
      getNoSignList();
      self.handle = function(item){
          var scopes = self;
          if(!item.assignee){
              workflowsrv.SignedTask(item.id).then(function(result){
                  if(result && result.status=="0"){
                      var handleModal = $uibModal.open({
                          animation: scope.animationsEnabled,
                          templateUrl: "handleTask.html",
                          scope:scopes
                      });
                      scopes.chosData = [
                          {
                              name:"是",
                              approve:true
                          },
                          {
                              name:"否",
                              approve:false
                          }
                      ];
                      scopes.pro = {
                          signed:654654,
                          decription :""
                      };
                      scopes.handleTaskConfim = function(pro){
                          var data = {
                              approve:pro.signed,
                              dec:pro.decription
                          };
                          workflowsrv.handleTask(item.id,data).then(function(){
                              getNoSignList();
                              handleModal.close();
                          });
                      };
                  }
              });
          }else{
              var handleModal = $uibModal.open({
                  animation: scope.animationsEnabled,
                  templateUrl: "handleTask.html",
                  scope:scopes
              });
              scopes.chosData = [
                  {
                      name:"是",
                      approve:true
                  },
                  {
                      name:"否",
                      approve:false
                  }
              ];
              scopes.pro = {
                  signed:scopes.chosData[0].approve,
                  decription :""
              };
              scopes.handleTaskConfim = function(pro){
                  var data = {
                      approve:pro.signed,
                      dec:pro.decription
                  };
                  workflowsrv.handleTask(item.id,data).then(function(){
                      getNoSignList();
                      handleModal.close();
                  });
              };
          }
      };

      self.choseHandling = function(){
          self.flow = {
              handling:true,
              handled:false
          };
          getNoSignList();
      };
      self.choseHandled = function(){
          self.flow = {
              handling:false,
              handled:true
          };
          gethandledList();
      };
  }]);

