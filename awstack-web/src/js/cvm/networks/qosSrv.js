var qosSrvModule = angular.module("qosSrvModule", []);
qosSrvModule.service("qosSrv", function($http) {
    var static_url = "/awstack-resource/v1";
    return {
        getQosPolicyList:function(){
            return $http({
                method:"GET",
                url:static_url + "/ListQosPolicy"
            })
        },
        getOneQosPolicy:function(options){
            return $http({
                method:"GET",
                url:static_url + "/GetQosPolicy/"+options
            })
        },
        cerateQosPolicy:function(options){
            return $http({
                method:"POST",
                url:static_url + "/QosPolicy",
                data:options
            })
        },
        editQosPolicy:function(options){
            return $http({
                method:"PUT",
                url:static_url + "/UpdateQosPolicy",
                data:options
            })
        },
        deleteQosPolicy:function(options){
            return $http({
                method:"DELETE",
                url:static_url + "/DeleteQosPolicy",
                data:options
            })
        },
        getQosPolicyRules:function(options){
            return $http({
                method:"GET",
                url:static_url + "/Getbandwidth_limit_rules/"+options,
            })
        },
        newQosPolicyRules:function(options){
            return $http({
                method:"POST",
                url:static_url + "/createbandwidth_limit_rules/"+options.policyId,
                data:options.data
            })
        },
        editQosPolicyRules:function(options){
            return $http({
                method:"PUT",
                url:static_url + "/updatebandwidth_limit_rules/"+options.policyId,
                data:options.data
            })
        },
        delQosPolicyRules:function(options){
            return $http({
                method:"DELETE",
                url:static_url + "/deletebandwidth_limit_rules",
                data:options
            })
        }
    }
});

