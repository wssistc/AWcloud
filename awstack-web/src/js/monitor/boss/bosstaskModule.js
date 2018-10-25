import "./bosstaskSrv";

var bosstaskModule = angular.module("bosstaskModule", ["ngTable", "ngAnimate", "ui.bootstrap", "overviewSrvModule", "ngSanitize","operatelogSrv", "bosstaskSrv"]);
bosstaskModule.controller("bosstaskCtrl", function($scope, $rootScope, NgTableParams, overviewSrv, $translate,operatelogSrv,$uibModal,checkedSrv,bosstaskSrv) {

    self=$scope;
    self.datas = [];
    var initMonitor = function(){
        bosstaskSrv.getMonitor().then(function(result){
      //var aaa = {};
            angular.forEach(result.data, function(v){
                v.enabled = "";
                v.dataValue = JSON.parse(v.dataValue);
                self.datas.push(v);
            });
        });
    };
    var getRegion = function(){
        bosstaskSrv.getRegion().then(function(){
      //var aaa = {};
        });
    };
    initMonitor();
    getRegion();

    self.text = {"taskName":"任务名称","taskCycle":"周期","taskTime":"创建时间","taskOperate":"操作","operate_del":"删除","operate_edit":"编辑","taskEnabled":"启用"};
  /*self.reportdatas = [
    {"task_name":"1","task_period":"1","task_createtime":"1","task_status":"1","task_id":"1",
    "task_content":{"meterlist":["node.cpu.total.percent","node.mem.percent","partition.percent","node.swap.percent"]},
    "task_metadata":{"filetype":"pdf","needmail":"N"},"task_type":"monitor","task_language":"Chinese",
    "task_createtime":"2016-06-30T15:20:29","task_updatetime":"2016-06-30T15:20:29","task_next_rtime":"2016-06-30T15:20:29"},
    {"task_name":"1","task_period":"1","task_createtime":"1","task_status":"1","task_id":"2",
    "task_content":{"meterlist":["node.cpu.total.percent","node.mem.percent","partition.percent","node.swap.percent"]},
    "task_metadata":{"filetype":"pdf","needmail":"N"},"task_type":"monitor","task_language":"Chinese",
    "task_createtime":"2016-06-30T15:20:29","task_updatetime":"2016-06-30T15:20:29","task_next_rtime":"2016-06-30T15:20:29"},
    {"task_name":"1","task_period":"1","task_createtime":"1","task_status":"1","task_id":"3",
    "task_content":{"meterlist":["node.cpu.total.percent","node.mem.percent","partition.percent","node.swap.percent"]},
    "task_metadata":{"filetype":"pdf","needmail":"N"},"task_type":"monitor","task_language":"Chinese",
    "task_createtime":"2016-06-30T15:20:29","task_updatetime":"2016-06-30T15:20:29","task_next_rtime":"2016-06-30T15:20:29"},
    {"task_name":"1","task_period":"1","task_createtime":"1","task_status":"1","task_id":"4",
    "task_content":{"meterlist":["node.cpu.total.percent","node.mem.percent","partition.percent","node.swap.percent"]},
    "task_metadata":{"filetype":"pdf","needmail":"N"},"task_type":"monitor","task_language":"Chinese",
    "task_createtime":"2016-06-30T15:20:29","task_updatetime":"2016-06-30T15:20:29","task_next_rtime":"2016-06-30T15:20:29"}
  ];*/

    self.isDisabled = true;
    self.isDis_enable = true;
    self.delisDisabled = true;

    self.showtaskdetail=function(v){
          // reportsSrv.getTheReportTasks(v).then(function (data) {
          //     self.detail=angular.copy(data.data);
        v = v - 1;
        self.detail = self.reportdatas[v];
          // self.detail.task_content=angular.fromJson(self.reportdatas[v].task_content);
          // self.detail.task_metadata=angular.fromJson(self.reportdatas[v].task_metadata);
          // self.detail.task_type=self.reportdatas[v].task_type;
          // self.detail.task_next_rtime=self.reportdatas[v].task_next_rtime;
          // self.detail.task_language=self.reportdatas[v].task_language;
          // self.detail.task_updatetime=self.reportdatas[v].task_updatetime;
          // formateData(self.detail);
        self.detailAnimateIn = "formAnimateIn";
        self.formAnimateOut = "";
          // });
    };

    self.closeForm = function(){
        self.formAnimateOut = "formAnimateOut";
        self.formAnimateIn = "";
        self.detailAnimateIn = "";
        self.deleteAnimateIn = "";
    };
    self.openEdit=function(value){
        var currentValue=angular.copy(value);
        if(currentValue.task_period=="1"){
            self.creat_task_period="day";
        }else if(currentValue.task_period=="2"){
            self.creat_task_period="week";
        }else{
            self.creat_task_period="month";
        }
        self.edit_task_content=currentValue.task_content;
        self.edit_task_metadata=currentValue.task_metadata;
        self.formAnimateIn = "formAnimateIn";
        self.creat_or_edit="创建编辑";
        self.canCreat=false;
         // self.name_msg = false;
        self.creat_task_name=currentValue.task_name;
        self.creat_task_type=currentValue.task_type;
        currentValue.task_status=="Active"?(self.enabled="Active"):(self.enabled="Inactive");
        self.editTask_id=currentValue.task_id;
        self.edit_task_metadata.needmail=="Y"?self.btnstatus=true:self.btnstatus=false;
        self.edit_task_metadata.to_maillist?self.to_maillist=self.edit_task_metadata.to_maillist.toString():"";
        self.file_type=self.edit_task_metadata.filetype;

        _.forEach(self.edit_task_content.meterlist,function(item){
             //(item=="resource_statistics")?self.creat_resource_statistics=true:"";
            (item=="user_statistics")?self.creat_user_statistics=true:"";
            (item=="vm_statistics")?self.creat_vm_statistics=true:"";
            (item=="node.cpu.total.percent")?self.creat_task_cup=true:"";
            (item=="node.mem.percent")?self.creat_task_mem=true:"";
            (item=="partition.percent")?self.creat_task_partition=true:"";
            (item=="node.swap.percent")?self.creat_task_swap=true:"";
            (item=="host distribute")?self.creat_host_distribute=true:"";
            (item=="user distribute")?self.creat_user_distribute=true:"";
            (item=="type distribute")?self.creat_type_distribute=true:"";
            (item=="severity distribute")?self.creat_time_distribute=true:"";
            (item=="time distribute")?self.creat_severity_distribute=true:"";
            (item=="response time distribute")?self.creat_response_time_distribute=true:"";
        });
    };

    self.initData=function(){
         //������ʼ��
        self.formAnimateIn = "formAnimateIn";
        self.creat_or_edit=$translate.instant("zeus.report.task.createTitle");
        self.canCreat=true;
        self.creat_task_name="";
        self.creat_task_period="day";
        self.creat_task_type="meter";
        self.enabled="Active";
        self.file_type="pdf";
        self.btnstatus=false;
        self.to_maillist="";
        self.initTaskCon(true);
        self.name_msg = false;
    };
    self.deletedata = "";
    self.del=function(checkedItems){
        self.deleteAnimateIn = "deleteAnimateIn";
        self.deletedata = checkedItems;
    };
    self.dels=function(){
        self.deleteAnimateIn = "deleteAnimateIn";
        //self.deletedata = v;
    };
    self.confirmdeleteForm=function(v){
        //var aa = "";
        self.deleteAnimateIn = "";
        angular.forEach(self.reportdatas,function(vv){
            if(vv == v){
                //self.reportdatas.splice(i,1);
            }
        });
        $scope.tableParams = new NgTableParams(
        {count: 10}, {counts: [], dataset: self.reportdatas}
      );
    };

    $scope.tableParams = new NgTableParams(
        {count: 10}, {counts: [], dataset: self.reportdatas}
      );
    var tableId = "task_id";
    checkedSrv.checkDo(self, self.reportdatas, tableId);

    self.checkboxes = {
        checked: false,
        items: {}
    };

    function init_dateTimepicker() {
        $(".form_date").datetimepicker({
            language: "zh-CN",
            weekStart: 1,
            todayBtn: 1,
            autoclose: 1,
            todayHighlight: 1,
            startView: 2,
            minView: "month",
            minuteStep:5,
            forceParse: 0,
            format: "yyyy-mm-dd",
            pickerPosition: "bottom-left"
        });
    }
    init_dateTimepicker();

    self.filterData = {
        pageNum: "1",
        pageSize: "10",
        businessName: "",
        dateStart: "",
        dateEnd: ""
    };

    function init_data(result) {
        self.logsTable = _.map(result.data, function(item) {
            item.state = $translate.instant("aws.statusCode." + item.responseCode);
            item.createTime = new Date(item.createTime);
            return item;
        });
        var e = $("#pageNum")[0];
        if (result.total) {
            self.pages = Math.ceil(result.total / self.filterData.pageSize);
            self.showPage = true;
            setPage(e, self.pages, self.filterData.pageNum);
        } else {
            self.showPage = false;
        }
    }

    function setPage(container, count, pageindex) { //总页数少于10 全部显示,大于10 显示前3 后3 中间3 其余....
        var a = [];

        if (pageindex == 1) {
            a[a.length] = "<li><a href=\"#\" class=\"prev unclick\"><i class=\"fa fa-angle-double-left\"></i></a></li>";
        } else {
            a[a.length] = "<li><a href=\"#\" class=\"prev\"><i class=\"fa fa-angle-double-left\"></i></a></li>";
        }

        function setPageList() {
            if (pageindex == i) {
                a[a.length] = "<li><a href=\"#\" class=\"on\">" + i + "</a></li>";
            } else {
                a[a.length] = "<li><a href=\"#\">" + i + "</a></li>";
            }
        }

        if (count <= 10) { //总页数小于10
            for (var i = 1; i <= count; i++) {
                setPageList();
            }
        } else { //总页数大于10页
            if (pageindex <= 4) {
                for (var ii = 1; ii <= 5; ii++) {
                    setPageList();
                }
                a[a.length] = "<li><span>...</span></li><li><a href=\"#\">" + count + "</a></li>";
            } else if (pageindex >= count - 3) {
                a[a.length] = "<li><a href=\"#\">1</a></li><li><span>...</span></li>";
                for (var iii = count - 4; iii <= count; iii++) {
                    setPageList();
                }
            } else { //当前页在中间部分
                a[a.length] = "<li><a href=\"#\">1</a></li><li><span>...</span></li>";
                for (var j = pageindex - 2; j <= pageindex + 2; j++) {
                    setPageList();
                }
                a[a.length] = "<li><span>...</span></li><li><a href=\"#\">" + count + "</a></li>";
            }
        }
        if (pageindex == count) {
            a[a.length] = "<li><a href=\"#\" class=\"next unclick\"><i class=\"fa fa-angle-double-right\"></i></a></li>";
        } else {
            a[a.length] = "<li><a href=\"#\" class=\"next\"><i class=\"fa fa-angle-double-right\"></i></a></li>";
        }
        container.innerHTML = a.join("");

    /*var pageClick = function() { //事件点击
      var oAlink = container.getElementsByTagName("a");
      var inx = pageindex; //初始的页码
      var clickPageFunc = function(inx) {
        self.filterData.pageNum = inx;
        setPage(container, count, inx);
        self.clickPageToquery = function() {
          initLogsTable(self.filterData);
        }();
      };
      oAlink[0].onclick = function() { //点击上一页
        if (inx == 1) {
          return false;
        }
        inx--;
        clickPageFunc(inx);
        return false;
      };
      for (var i = 1; i < oAlink.length - 1; i++) { //点击页码
        oAlink[i].onclick = function() {
          inx = parseInt(this.innerHTML);
          clickPageFunc(inx);
          return false;
        };
      }
      oAlink[oAlink.length - 1].onclick = function() { //点击下一页
        if (inx == count) {
          return false;
        }
        inx++;
        clickPageFunc(inx);
        return false;
      };
    }();*/
    }

    var initLogsTable = function(params) {
        operatelogSrv.getoperateLogsData(params).then(function(result) {
            init_data(result);
        });
    };
    initLogsTable(self.filterData);

    self.queryFun = function() {
        self.filterData.pageNum = "1";
        initLogsTable(self.filterData);
    };
    self.goToPage = function(num) {
        self.filterData.pageNum = num;
        initLogsTable(self.filterData);
    };
});

