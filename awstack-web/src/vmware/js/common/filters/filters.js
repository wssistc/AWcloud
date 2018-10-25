let filtersModule = angular.module("filtersModule", []);

filtersModule.filter("propsFilter", function() {
    return function(items, props) {
        var out = [];

        if (angular.isArray(items)) {
            var keys = Object.keys(props);

            items.forEach(function(item) {
                var itemMatches = false;

                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    var text = props[prop].toLowerCase();
                    if (item[prop] && item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                        itemMatches = true;
                        break;
                    }
                }

                if (itemMatches) {
                    out.push(item);
                }
            });
        } else {
            // Let the output be the input untouched
            out = items;
        }

        return out;
    };
});
filtersModule.filter("searchFilter", function() {
    return function(items, props) {
        var out = [];

        if (angular.isArray(items)) {
            var keys = Object.keys(props);


            items.forEach(function(item) {
                var itemMatches = false;
                var valueNoEmpty = 0;
                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    if(props[prop]){
                        var text = props[prop].toLowerCase();
                        if (item[prop]&&item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                            itemMatches = true;
                            break;
                        }
                        
                    }else{
                        valueNoEmpty = valueNoEmpty+1;

                    }
                }

                if (itemMatches||valueNoEmpty== keys.length) {
                    out.push(item);
                }
            });
        } else {
            // Let the output be the input untouched
            out = items;
        }

        return out;
    };
});

filtersModule.filter("trust_html", ["$sce", function($sce) {
    return function(text) {
        return $sce.trustAsHtml(text);
    };
}]);

filtersModule.filter("capitalize", function() { //字符串的首字母转化为大写；
    return function(val) {
        if (val) {
            var string = val.toString().toLowerCase();
            return string[0].toUpperCase() + string.slice(1);
        }
    };
});
filtersModule.filter("osdfilter", function() {
    return function(res) {
        if (res.total_gb != 0) {
            return (res.used_gb * 100 / res.total_gb).toFixed(2);
        } else {
            return 0;
        }
    };
});
export default filtersModule.name;