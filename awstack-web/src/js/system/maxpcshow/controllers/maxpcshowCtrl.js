 import "../services/maxpcshowSrv"

 maxpcshowCtrl.$inject = ["$rootScope", "$scope", "NgTableParams","$uibModal","newCheckedSrv","maxpcshowSrv","$filter","$routeParams","$translate","$location"];

function maxpcshowCtrl($rootScope, $scope,NgTableParams,$uibModal,newCheckedSrv,maxpcshowSrv,$filter,$routeParams,$translate,$location){
    var self = $scope;
    self.context = self;
    self.titleName="maxpcshow";
    if(sessionStorage["maxpcshow"]){
        self.tableCols=JSON.parse(sessionStorage["maxpcshow"]);
    }else{
        self.tableCols = [
            { field: "check", title: "",headerTemplateURL:"headerCheckboxmsTable.html",show: true },
            { field: "name", title: "名称",sortable: "name",show: true,disable:true},
            { field: "resolution", title: "分辨率",sortable: "resolution",show: true,disable:false},
            { field: "created", title: "创建时间",sortable: "created",show: true,disable:true },
            { field: "isEnabledCopy", title: "状态",sortable: "isEnabled",show: true,disable:true },
            { field: "description", title: "描述信息",sortable: "description",show: true,disable:false },
        ];
    }

    function editSearch(item){
        var searchTerm = []
        self.tableCols.map(search => {
            if(search.title && search.show){
                searchTerm.push(item[search.field])
            }
        })
        item.searchTerm =searchTerm.join("\b") ;
		return item;
    }

    self.configSearch = function(tableData){
        var tableData = tableData || self.mstabledata;
        tableData.map(item => {
            //处理数据
            item.isEnabledCopy = $translate.instant('aws.maxpc.table.status.'+ item.isEnabled)
            editSearch(item)
        })
        return tableData;
    }

    function initTable(res){
		if(res && angular.isArray(res)){
            self.mstabledata = self.configSearch(res);
			self.msTable = new NgTableParams({ count: 10 }, { counts: [], dataset: self.mstabledata});
			newCheckedSrv.checkDo(self,"","id","msTable");
		}
    };

    self.getTableList = function(){
        var res = [{
            id:1,
            name:"大屏展示1",
            resolution:"192 X 1080",
            created: "2017-11-24  18:51:24",
            isEnabled: true,
            description:""
        },{
            id:2,
            name:"大屏展示2",
            resolution:"1280 X 1024",
            created: "2017-11-24  18:51:24",
            isEnabled: true,
            description:""
        }]
        initTable(res)
    } 

    self.$watch(function(){
        return self.checkedItemsmsTable
    },function(values){
        if(values){
            self.btns = {
                enabled_btn: true,
                disabled_btn: true
            }
            var enabled_count = 0,disabled_count = 0;
            values.map(item => {
                enabled_count += Number(!item.isEnabled);
                disabled_count += Number(item.isEnabled);
            })

            if(enabled_count > 0  && enabled_count == values.length){
                self.btns.disabled_btn = false;
            }  
            if(disabled_count > 0 && disabled_count == values.length){
                self.btns.enabled_btn = false;
            } 
        }
    })

    self.new = function(){

    }

    self.enabledFunc = function(data){
        var content = {
            target: "enabled",
            msg: "确定要启用该大屏设置吗？",
            btnType: "btn-primary",
            data:data
        };
        self.$emit("delete", content);
    }

    self.$on("enabled", function(e,data) {
        // var postData = chkSome(data);
        // backupsSrv.delBackups(postData).then(function() {
        // });
    });

    self.disabledFunc = function(data){
        var content = {
            target: "disabled",
            msg: "确定要禁用该大屏设置吗？",
            data:data
        };
        self.$emit("delete", content);
    }

    self.$on("disabled", function(e,data) {
        // var postData = chkSome(data);
        // backupsSrv.delBackups(postData).then(function() {
        // });
    });

    self.delFunc = function(data){
        var content = {
            target: "delete",
            msg: "确定要删除该大屏设置吗？",
            data:data
        };
        self.$emit("delete", content);
    }
    self.$on("delete", function(e,data) {
        // var postData = chkSome(data);
        // backupsSrv.delBackups(postData).then(function() {
        // });
    });

    self.getTableList();
}

 export {maxpcshowCtrl}