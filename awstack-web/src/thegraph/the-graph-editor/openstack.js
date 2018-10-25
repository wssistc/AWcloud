console.log("ccccccccccc");
loadGraph(
{
  "properties": {
    "environment": {
      "runtime": "html",
      "content": "<div class='area' title='.area'><img id='clock' src='http://i.meemoo.me/v1/in/GJPUFPc8ThuRp9itdXC9_clock-face.png' style='position:absolute; width:300px; height:300px; top:0; left:0;' /><img id='hours' src='http://i.meemoo.me/v1/in/fRL213GT1uCRltIqXkK2_clock-hours.png' style='position:absolute; top:50px; left:130px; height:200px;' /><img id='minutes' src='http://i.meemoo.me/v1/in/23DZFKYoRTOIAjPA7sed_clock-minutes.png' style='position:absolute; top:0; left:140px; height:300px;' /><img id='seconds' src='http://i.meemoo.me/v1/in/VU2HqPmuTqucRpnUGGBj_clock-seconds.png' style='position:absolute; top:0; left:145px; height:300px;' /></div>",
      "width": 300,
      "height": 300,
      "src": "./preview/iframe.html"
    },
    "name": "NoFlo"
  },
  "exports": [],
"processes":{
        "2cde2568-f891-4f5b-8582-9b42744e3da0":{
            "component":"vm",
            "metadata":{
            	"type":"vm",
                "vm_id":"2cde2568-f891-4f5b-8582-9b42744e3da0",
                "vm_status":"SHUTOFF",
                "x":120,
                "y":561,
                "width":72,
                "label":"host_dzw_06171020"
            }, 
            "inports": { 
  			  "prev": {
  			    "process": "routers/KickRouter_bzaiw",
  			    "port": "prev",
  			    "metadata": {
  			      "x": 0,
  			      "y": 144
  			    }
  			  },
  			  "next": {
  			    "process": "routers/KickRouter_bzaiw",
  			    "port": "next"
  			  }
  			},
        },
        "a9d6a93d-72b7-48d8-bb84-72629d30f6e0":{
            "component":"vm",
            "metadata":{
            	"type":"vm",
                "vm_id":"a9d6a93d-72b7-48d8-bb84-72629d30f6e0",
                "vm_status":"SHUTOFF",
                "x":120,
                "y":803,
                "label":"testvm_0617"
            }
        },
        "39cc30dc-16e7-4973-8f02-c1dfa0cd55ac":{
            "component":"vm",
            "metadata":{
            	"type":"vm",
                "vm_id":"39cc30dc-16e7-4973-8f02-c1dfa0cd55ac",
                "vm_status":"SHUTOFF",
                "x":120,
                "y":104,
                "label":"qos-test1"
            }
        },
        "4666bf4b-6c28-496c-b044-fa8b290760d0":{
            "component":"vm",
            "metadata":{
            	"type":"vm",
                "vm_id":"4666bf4b-6c28-496c-b044-fa8b290760d0",
                "vm_status":"SHUTOFF",
                "x":120,
                "y":958,
                "label":"qos-test0"
            }
        },
        "7317f95d-95c4-4f8f-9a11-e1cc01dcbcc3":{
            "component":"vm",
            "metadata":{
            	"type":"vm",
                "vm_id":"7317f95d-95c4-4f8f-9a11-e1cc01dcbcc3",
                "vm_status":"SHUTOFF",
                "x":120,
                "y":103,
                "label":"dinghh_testvm_06171"
            }
        },
        "730adb15-1f8a-4de1-bc2d-e64631098ce5":{
            "component":"switch",
            "metadata":{
            	"type":"switch",
                "x":360,
                "y":515,
                "switch_id":"730adb15-1f8a-4de1-bc2d-e64631098ce5",
                "label":"net2-test"
            }
        },
        "ea0107c7-b3d8-489b-a587-2901266317ce":{
            "component":"router_ea0107c7-b3d8-489b-a587-2901266317ce",
            "metadata":{
            	"type":"router",
                "x":720,
                "y":623,
                "router_id":"ea0107c7-b3d8-489b-a587-2901266317ce",
                "label":"cy-Router"
            }
        },
        
        "6307991b-a487-40b2-a324-74e804fb19ef":{
            "component":"vm",
            "metadata":{
            	"type":"vm",
                "vm_id":"6307991b-a487-40b2-a324-74e804fb19ef",
                "vm_status":"ERROR",
                "x":120,
                "y":227,
                "label":"testerror"
            }
        },
        "c01200d1-1ba5-4ecb-a3ce-3894eb43c50e":{
            "component":"vm",
            "metadata":{
            	"type":"vm",
                "vm_id":"c01200d1-1ba5-4ecb-a3ce-3894eb43c50e",
                "vm_status":"SHUTOFF",
                "x":120,
                "y":250,
                "label":"dinghh_testvm_06170"
            }
        },
        "a03fc562-2404-4674-a66f-c6234cf55c97":{
            "component":"vm",
            "metadata":{
            	"type":"vm",
                "vm_id":"a03fc562-2404-4674-a66f-c6234cf55c97",
                "vm_status":"SHUTOFF",
                "x":120,
                "y":357,
                "label":"domain2Test"
            }
        },
        "e6015d34-51fa-48c3-affc-f838788e89d5":{
            "component":"switch_ext",
            "metadata":{
            	"hidden":"true",
            	"type":"switch",
                "x":360,
                "y":704,
                "width":72,
                "switch_id":"e6015d34-51fa-48c3-affc-f838788e89d5",
                "router_external":"true",
                "label":"Ext-Net"
            }
        },
        "0c1fedeb-a8e4-4ba6-b95d-cf4616108472":{
            "component":"switch_shared",
            "metadata":{
            	"type":"switch",
            	 "shared":"true",
                "x":360,
                "y":206,
                "switch_id":"0c1fedeb-a8e4-4ba6-b95d-cf4616108472",
                "label":"shared-net"
            }
        },
        "535073f1-19cf-4f69-ad01-0ea59b74770e":{
            "component":"router",
            "metadata":{
            	"type":"router",
                "x":720,
                "y":149,
                "router_id":"535073f1-19cf-4f69-ad01-0ea59b74770e",
                "label":"Router"
            }
        },
        "ff1220e1-5631-4cd0-9e5e-70d46cff5a7b":{
            "component":"switch_ext_shared",
            "metadata":{
            	"type":"switch",
                "shared":"true",
                "router_external":"true",
                "x":360,
                "y":677,
                "switch_id":"ff1220e1-5631-4cd0-9e5e-70d46cff5a7b",
                "label":"cy-Net"
            }
        }
    },
    "connections":[
    	{
            "tgt":{
                "process":"0c1fedeb-a8e4-4ba6-b95d-cf4616108472",
                "port":"in1"
            },
            "src":{
                "process":"2cde2568-f891-4f5b-8582-9b42744e3da0",
                "port":"out"
            },
	        "metadata":{
	        	"route": "1"
	        }
           
        },
        {
            "tgt":{
                "process":"0c1fedeb-a8e4-4ba6-b95d-cf4616108472",
                "port":"in"
            },
            "src":{
                "process":"39cc30dc-16e7-4973-8f02-c1dfa0cd55ac",
                "port":"out"
            }
        },
        {
            "tgt":{
                "process":"0c1fedeb-a8e4-4ba6-b95d-cf4616108472",
                "port":"in"
            },
            "src":{
                "process":"4666bf4b-6c28-496c-b044-fa8b290760d0",
                "port":"out"
            }
        },
        {
            "tgt":{
                "process":"0c1fedeb-a8e4-4ba6-b95d-cf4616108472",
                "port":"in"
            },
            "src":{
                "process":"6307991b-a487-40b2-a324-74e804fb19ef",
                "port":"out"
            }
        },
        {
            "tgt":{
                "process":"0c1fedeb-a8e4-4ba6-b95d-cf4616108472",
                "port":"in"
            },
            "src":{
                "process":"c01200d1-1ba5-4ecb-a3ce-3894eb43c50e",
                "port":"out"
            }
        },
        {
            "tgt":{
                "process":"0c1fedeb-a8e4-4ba6-b95d-cf4616108472",
                "port":"in"
            },
            "src":{
                "process":"a9d6a93d-72b7-48d8-bb84-72629d30f6e0",
                "port":"out"
            }
        },
        {
            "tgt":{
                "process":"730adb15-1f8a-4de1-bc2d-e64631098ce5",//net-2test
                "port":"in"
            },
            "src":{
                "process":"2cde2568-f891-4f5b-8582-9b42744e3da0",//vm
                "port":"out"
            },
	        "metadata":{
	        	"route": "1"
	        }
        },
        {
            "src":{
                "process":"a03fc562-2404-4674-a66f-c6234cf55c97",//vm
                "port":"out"
            },
            "tgt":{
                "process":"730adb15-1f8a-4de1-bc2d-e64631098ce5",
                "port":"in"
            }
        },
        {
            "src":{
                "process":"730adb15-1f8a-4de1-bc2d-e64631098ce5",//net-2test
                "port":"out"
            },
	        "tgt":{
                "process":"ea0107c7-b3d8-489b-a587-2901266317ce",//router
                "port":"in"
            }
        },
        {
            "src":{
                "process":"0c1fedeb-a8e4-4ba6-b95d-cf4616108472",//shared-net
                "port":"out"
            },
            "tgt":{
                "process":"535073f1-19cf-4f69-ad01-0ea59b74770e",//Router
                "port":"in"
            }
        },
        {
            "src":{
                "process":"ea0107c7-b3d8-489b-a587-2901266317ce",//cy-Router
                "port":"vxlan1"
            },
            "tgt":{
                "process":"e6015d34-51fa-48c3-affc-f838788e89d5",
                "port":"ccc"
            },
		      "metadata": {
		        "route": "0"
		      }
        },
        {
            "src":{
                "process":"535073f1-19cf-4f69-ad01-0ea59b74770e",//Router
                "port":"vxlan2"
            },
            "tgt":{
                "process":"e6015d34-51fa-48c3-affc-f838788e89d5",//Ext-Net
                "port":"abc"
            },
		      "metadata": {
		        "route": "5"
		      }
        }
    ]
	}
);