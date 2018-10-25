var module = angular.module("checkedsrv", ["ngTable"]);

module.service("checkedSrv", function() {
    this.checkDo = function(self, data, tableId,tableName) {
        tableName = tableName || "tableParams";
        self.checkboxes = {
            checked: false,
            items: {}
        };
        self.$watch(function() {
            return self[tableName].page();
        }, function() {
            self.checkboxes.checked = false;
            self.checkboxes.items = {};
        });

        //删除table最后一页所有数据时，table页回到第一页
        self.$watch(function() {
            return self[tableName].data.length;
        }, function(cur,old) {
            if(cur != old && cur == 0){
                self[tableName].page(1);
            }
        });

        self.$watch(function() {
            return self.checkboxes.checked;
        }, function(value) {
            if(!angular.isUndefined(value)){
                angular.forEach(self[tableName].data, function(item) {
                    if(!item.unChecked){
                        self.checkboxes.items[item[tableId]] = value;
                    }
                });
            }
            
        });
        self.$watch(function() {
            return self.checkboxes.items;
        }, function(values) {
            if(values && JSON.stringify(values) != "{}"){
                if(self[tableName].data && self[tableName].data.length){
                    chkDo(values);
                }
            }else{
                self.isDisabled = true;
                self.delisDisabled = true;
                self.checkedItems = [];
                self.checkboxes.checked = false;
                self.checkedItems = [];
                angular.element(".select-all").prop("indeterminate", false);
                angular.element(".select-all-"+tableName).prop("indeterminate", false);
            }
        }, true);

        var chkDo = function() {
            var checked = 0,
                unchecked = 0,
                total = self[tableName].data.length;
            self.checkedItems = [];
            self[tableName].checkedItems = [];
            angular.forEach(self[tableName].data, function(item) {
                checked += (self.checkboxes.items[item[tableId]]) || 0;
                unchecked += (!self.checkboxes.items[item[tableId]]) || 0;
                if (self.checkboxes.items[item[tableId]]) {
                    self.editData = angular.copy(item);
                    self.checkedItems.push(item);
                    self[tableName].checkedItems.push(item);
                }
            });

            if ((unchecked == 0) || (checked == 0)) {
                if (total > 0) {
                    self.checkboxes.checked = (checked == total);
                }
            }
            if (checked === 1) {
                self.delisDisabled = false;
                self.isDisabled = false;
            }else if (checked > 1){
                self.isDisabled = true;
                self.delisDisabled = false;
            }else {
                self.isDisabled = true;
                self.delisDisabled = true;
            }
            angular.element(".select-all-"+tableName).prop("indeterminate", (checked != 0 && unchecked != 0)); //修复弹出层有table，选中无法唯一定位
            angular.element(".select-all").prop("indeterminate", (checked != 0 && unchecked != 0));  //兼容之前的table
        };
    };
    this.setChkIds = function(ids,type){
        var Ids = angular.fromJson(sessionStorage[type]);
        Ids ? "" : Ids = [];
        ids.map(id =>{
            if(Ids.indexOf(id) == -1){
                Ids.push(id)
            }
        })
        sessionStorage[type] = angular.toJson(Ids);
    }
});
