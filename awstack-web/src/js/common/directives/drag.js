var dragEventModule = angular.module("dragEventModule", []);
var convertFirstUpperCase = function (str) {
    return str.replace(/(\w)/, function (s) {
        return s.toUpperCase();
    });
};
var awsDragEventDirectives = {};
angular.forEach("dragstart drag dragenter dragover drop dragleave dragend".split(' '), function (eventName) {
    var awsEventName = 'aws' + convertFirstUpperCase(eventName);
    awsDragEventDirectives[awsEventName] = ['$parse', function ($parse) {
        //$parse 语句解析器
        return {
            restrict: 'A',
            compile: function (ele, attr) {
                var fn = $parse(attr[awsEventName]);
                return function awsEventHandler(scope, ele) {
                    ele[0].addEventListener(eventName, function (event) {
                        if (eventName == 'dragover' || eventName == 'drop') {
                            event.preventDefault();
                        }
                        var callback = function () {
                            fn(scope, { event: event });
                        };
                        callback();
                    });
                }
            }
        }
    }]
});
dragEventModule.directive(awsDragEventDirectives);
