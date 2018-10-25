import  vmSrv from "../services/vmSrv"

bootMenuCtrl.$inject=["$scope", "$rootScope", "$translate","$uibModalInstance","$location","vmSrv","editData","$filter"];
export function bootMenuCtrl($scope, $rootScope, $translate,$uibModalInstance,$location,vmSrv,editData,$filter){
    var self = $scope;
    self.cannot_Confirm = false
    function GetOsBootMenu(){
        vmSrv.osBootMenu(editData.uid).then(function(result){
            if(result && result.data && result.data.bootMenus && angular.isArray(result.data.bootMenus)){
                self.osMenus = result.data.bootMenus.filter(item => item.dev != "fd"); //目前不支持floopy
                self.osMenus.map((item,index) => {
                    item.dev == "hd" ? item.name = "Hard Disk":"";
                    item.dev == "cdrom" ? item.name = "CDROM":"";
                    item.dev == "fd" ? item.name = "Floppy":"";
                    item.dev == "network" ? item.name = "Network(PXE)":"";
                    item.checked = false;
                })
            }
        })
    }
    // 交换数组元素
    function swapItems(arr, index1, index2) {
        arr[index1] = arr.splice(index2, 1, arr[index1])[0];
        return arr;
    };
  
    // 上移
    function upRecord(arr, index) {
        if(index != 0) {
            swapItems(arr, index, index - 1);
        }
        
    };
  
    function downOrderFunc(type){
        if(type == "down"){
            self.osMenus.map((item,index) => {
                item.num = Number(index);
            })
            self.osMenus = $filter("orderBy")(self.osMenus, "num",true);
        }
    }

    //置顶,置底
    self.adjustFunEdge = function(type){
        var arr = self.osMenus
        var checkArr = arr.filter(item => item.checked);
        var uncheckArr = arr.filter(item => !item.checked);
        arr.map(item => {item.checked = false})
        switch(type){
            case "top":
                arr = [...checkArr,...uncheckArr]
                break;
            case "bottom":
                arr = [...uncheckArr,...checkArr]
                break;

        }
        self.osMenus = arr;
    }
    //上移、下移
    self.adjustMenu = function(type){
        if(self.osMenus && self.osMenus.length){
            downOrderFunc(type)
            var top = self.osMenus.findIndex(function(value, index, arr) {
                return value.checked;
            }) 
            self.osMenus.map((item,index) => {
                if(item.checked){
                    item.checked = false;
                    upRecord(self.osMenus,index);
                }
            })
            downOrderFunc(type)
        }
    }

    self.bootMenus = function(){
        self.cannot_Confirm = true;
        var postParams = {
            bootMenu:[],
            serverName : editData.name
        }
        self.osMenus.map(item => {
            postParams.bootMenu.push(item.dev);
        })
        postParams.bootMenu.push("fd")
        vmSrv.osBootMenuPut(editData.uid,postParams).then(function(){
            self.cannot_Confirm = false;
        })
        $uibModalInstance.close()
    }
    GetOsBootMenu()
    
    
}


