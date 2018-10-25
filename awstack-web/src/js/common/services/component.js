let comModule = angular.module('comModule',[
    "ngTable", 
    "ui.bootstrap"
])
.service("TableCom",["NgTableParams",function(NgTableParams){
    var watchCk,ckAll,pageChange;
    this.init = function(context,tableName,data,uid,page=10,checkboxes="checkboxes"){
     
        context[checkboxes] = { 
            checked: false,//全选按钮
            items: {}//所有当前页数据的checkbox选中状态
        };

        context[checkboxes] = { 
            checked: false,//全选按钮
            items: {}//所有当前页数据的checkbox选中状态
        };
        context[tableName] = new NgTableParams({ count: page }, { counts: [], dataset: data });
            if(watchCk){//清除监控       
              //watchCk()
            }
            if(ckAll){//清除监控
              //ckAll();
            }
            if(pageChange){//清除监控
              //pageChange()
            }
       //监控每条数据的checkbox
        watchCk = context.$watch(function(){
            return context[checkboxes].items
        },function(ne){
            if(!ne){
                return;
            }
            var _length = context[tableName].data.length;
            var checked = 0,uncheck;
            //var arr = Object.values(context.checkboxes.items);
            var arr=[];
            _.forEach(context[checkboxes].items,function(item){
                arr.push(item);
            });
            if(arr.length>0){
                arr.forEach((item,i)=>{
                  checked+=Number(item);
                })
            }
            if(checked==_length){
                context[checkboxes].checked = true;
            }
            if(checked==0){
                context[checkboxes].checked = false;
            }
            angular.element(".table[ng-table="+tableName+"]").find(".select-all").prop("indeterminate", (checked != 0 && checked != _length));
            angular.element(".table[ng-table="+tableName+"]").find(".select-all-"+tableName).prop("indeterminate", (checked != 0 && checked != _length));
        },true)
        //监控全选的checkbox
        ckAll = context.$watch(function(){        
            return context[checkboxes].checked
        },function(ne){
            context[tableName].data.forEach(item=>{
            context[checkboxes].items[item[uid]] = ne;
          })
        },true)
      //监控ngtable的页码
        pageChange = context.$watch(function(){
            return context[tableName].page();
        },function(ne){//翻页之后全选状态取消
            context[checkboxes] = {
                checked: false,
                items: {}
              };
          })
      }
    return this;
  }])
.service("modalCom",["$uibModal",function($uibModal){
    this.init = function(template,controller,resolve){
        var modalInstance = $uibModal.open({
            templateUrl:template,
            backdrop:'static',
            controller:controller,
            resolve:resolve?resolve:null,
          })
          return modalInstance;
      }
    return this;
}])

export default comModule.name;