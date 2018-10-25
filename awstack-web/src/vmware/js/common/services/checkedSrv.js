var checkedSrvModule = angular.module("checkedSrvModule", ["ngTable"]);

checkedSrvModule.service("checkedSrv", function() {
    this.checkDo = function(self,tableId,tableName) {
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

        self.$watch(function() {
            return self.checkboxes.checked;
        }, function(value) {
            angular.forEach(self[tableName].data, function(item) {
                if(!item.unChecked){
                    self.checkboxes.items[item[tableId]] = value;
                }
            });
        });
        self.$watch(function() {
            return self.checkboxes.items;
        }, function(values) {
            chkDo(values);
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
            angular.element(".select-all").prop("indeterminate", (checked != 0 && unchecked != 0));
        };
    };
});

export default checkedSrvModule.name;