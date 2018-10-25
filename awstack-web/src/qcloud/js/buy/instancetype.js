export var Region_VmType = [
	{
		"name": "广州",
		"value": "gz",
		"zones": [
			{
				"zonename": "广州二区",
				"zoneId": "100002",
				"type":[
					{
						"typename":"系列1",
						"instancetypes":[
							{
								"instancetypes":[
									{
										"instancetype":"CVM.S1",
										"instancetypename":"标准型S1",
										"deviceType":"standard"
									},
									{
										"instancetype":"CVM.I1",
										"instancetypename":"高IO型I1",
										"deviceType":"highIO"
									}
								],
								"instances":[
									{"id":1,"cpu": 1, "mem": 1, "category": "S1.small", "deviceType":"standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":2,"cpu": 1, "mem": 2, "category": "S1.small2", "deviceType": "standard","name":"标准型S1","isvol":"是", "selected": "true", "local_disk":[0,500], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":3,"cpu": 1, "mem": 4, "category": "S1.small4", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":4,"cpu": 2, "mem": 2, "category": "S1.medium2", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":5,"cpu": 2, "mem": 4, "category": "S1.medium4", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":6,"cpu": 2, "mem": 8, "category": "S1.medium8", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":7,"cpu": 2, "mem": 12, "category": "S1.medium12", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":8,"cpu": 4, "mem": 4, "category": "S1.large4", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":9,"cpu": 4, "mem": 8, "category": "S1.large8", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":10,"cpu": 4, "mem": 12, "category": "S1.large12", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":11,"cpu": 4, "mem": 16, "category": "S1.large16", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":12,"cpu": 4, "mem": 24, "category": "S1.large24", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":13,"cpu": 8, "mem": 8, "category": "S1.2large8", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":14,"cpu": 8, "mem": 16, "category": "S1.2large16", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":15,"cpu": 8, "mem": 24, "category": "S1.2large24", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":16,"cpu": 8, "mem": 32, "category": "S1.2large32", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":17,"cpu": 12, "mem": 12, "category": "S1.3large12", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":18,"cpu": 12, "mem": 24, "category": "S1.3large24", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":19,"cpu": 12, "mem": 28, "category": "S1.3large28", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":20,"cpu": 16, "mem": 16, "category": "S1.4large16", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,800], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":21,"cpu": 16, "mem": 32, "category": "S1.4large32", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,800], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":22,"cpu": 16, "mem": 48, "category": "S1.4large48", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,800], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":23,"cpu": 24, "mem": 56, "category": "S1.6large56", "deviceType": "standard","name":"标准型S1","isvol":"否", "local_disk":[1000,1000], "disk_map":[{"1":["1"]}]},
									{"id":24,"cpu": 2, "mem": 4, "category": "I1.medium4", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[50,250], "disk_map":[{"3":["3"]}]},
									{"id":25,"cpu": 2, "mem": 8, "category": "I1.medium8", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "selected": "true", "local_ssd":[50,250], "disk_map":[{"3":["3"]}]},
									{"id":26,"cpu": 2, "mem": 16, "category": "I1.medium16", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[50,250], "disk_map":[{"3":["3"]}]},
									{"id":27,"cpu": 4, "mem": 8, "category": "I1.large8", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[50,500], "disk_map":[{"3":["3"]}]},
									{"id":28,"cpu": 4, "mem": 16, "category": "I1.large16", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[50,500], "disk_map":[{"3":["3"]}]},
									{"id":29,"cpu": 4, "mem": 32, "category": "I1.large32", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[50,500], "disk_map":[{"3":["3"]}]},
									{"id":30,"cpu": 8, "mem": 16, "category": "I1.2large16", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[100,1000], "disk_map":[{"3":["3"]}]},
									{"id":31,"cpu": 8, "mem": 24, "category": "I1.2large24", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "devPayMode": ["monthly"], "local_ssd":[100,1000], "disk_map":[{"3":["3"]}]},
									{"id":32,"cpu": 8, "mem": 32, "category": "I1.2large32", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[100,1000], "disk_map":[{"3":["3"]}]},
									{"id":33,"cpu": 8, "mem": 40, "category": "I1.2large40", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[100,1000], "disk_map":[{"3":["3"]}]},
									{"id":34,"cpu": 12, "mem": 24, "category": "I1.3large24", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "devPayMode": ["monthly"], "local_ssd":[500,1500], "disk_map":[{"3":["3"]}]},
									{"id":35,"cpu": 12, "mem": 36, "category": "I1.3large36", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "devPayMode": ["monthly"], "local_ssd":[500,1500], "disk_map":[{"3":["3"]}]},
									{"id":36,"cpu": 12, "mem": 48, "category": "I1.3large48", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "devPayMode": ["monthly"], "local_ssd":[500,1500], "disk_map":[{"3":["3"]}]},
									{"id":37,"cpu": 12, "mem": 60, "category": "I1.3large60", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[500,1500], "disk_map":[{"3":["3"]}]},
									{"id":38,"cpu": 24, "mem": 120, "category": "I1.6large120", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[2950,2950], "disk_map":[{"3":["3"]}]}
								]
							}
						]
					}
				]
			},
			{
				"zonename": "广州三区",
				"zoneId": "100003",
				"type":[
					{
						"typename":"系列1",
						"instancetypes":[
							{
								"instancetypes":[
									{
										"instancetype":"CVM.S1",
										"instancetypename":"标准型S1",
										"deviceType":"standard"
									},
									{
										"instancetype":"CVM.I1",
										"instancetypename":"高IO型I1",
										"deviceType":"highIO"
									},
									{
										"instancetype":"CVM.M1",
										"instancetypename":"内存型M1",
										"deviceType":"bigMem"
									}
								],
								"instances":[
									{"id":1,"cpu": 1, "mem": 1, "category": "S1.small", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":2,"cpu": 1, "mem": 2, "category": "S1.small2", "deviceType": "standard","name":"标准型S1","isvol":"是", "selected": "true", "local_disk":[0,500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":3,"cpu": 1, "mem": 4, "category": "S1.small4", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":4,"cpu": 2, "mem": 2, "category": "S1.medium2", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":5,"cpu": 2, "mem": 4, "category": "S1.medium4", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":6,"cpu": 2, "mem": 8, "category": "S1.medium8", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":7,"cpu": 2, "mem": 12, "category": "S1.medium12", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":8,"cpu": 4, "mem": 4, "category": "S1.large4", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":9,"cpu": 4, "mem": 8, "category": "S1.large8", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":10,"cpu": 4, "mem": 12, "category": "S1.large12", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":11,"cpu": 4, "mem": 16, "category": "S1.large16", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":12,"cpu": 4, "mem": 24, "category": "S1.large24", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":13,"cpu": 8, "mem": 8, "category": "S1.2large8", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":14,"cpu": 8, "mem": 16, "category": "S1.2large16", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":15,"cpu": 8, "mem": 24, "category": "S1.2large24", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":16,"cpu": 8, "mem": 32, "category": "S1.2large32", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":17,"cpu": 12, "mem": 12, "category": "S1.3large12", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":18,"cpu": 12, "mem": 24, "category": "S1.3large24", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":19,"cpu": 12, "mem": 48, "category": "S1.3large48", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":20,"cpu": 16, "mem": 16, "category": "S1.4large16", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,800], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":21,"cpu": 16, "mem": 32, "category": "S1.4large32", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,800], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":22,"cpu": 16, "mem": 48, "category": "S1.4large48", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,800], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":23,"cpu": 24, "mem": 24, "category": "S1.6large24", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,1200], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":24,"cpu": 24, "mem": 48, "category": "S1.6large48", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,1200], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":25,"cpu": 24, "mem": 56, "category": "S1.6large60", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,1200], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":26,"cpu": 32, "mem": 64, "category": "S1.8large64", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,1600], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":27,"cpu": 2, "mem": 4, "category": "I1.medium4", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[50,250], "disk_map":[{"3":["3"]}]},
									{"id":28,"cpu": 2, "mem": 8, "category": "I1.medium8", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "selected": "true", "local_ssd":[50,250], "disk_map":[{"3":["3"]}]},
									{"id":29,"cpu": 2, "mem": 16, "category": "I1.medium16", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[50,250], "disk_map":[{"3":["3"]}]},
									{"id":30,"cpu": 4, "mem": 8, "category": "I1.large8", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[50,500], "disk_map":[{"3":["3"]}]},
									{"id":31,"cpu": 4, "mem": 16, "category": "I1.large16", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[50,500], "disk_map":[{"3":["3"]}]},
									{"id":32,"cpu": 4, "mem": 32, "category": "I1.large32", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[50,500], "disk_map":[{"3":["3"]}]},
									{"id":33,"cpu": 8, "mem": 16, "category": "I1.2large16", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[100,1000], "disk_map":[{"3":["3"]}]},
									{"id":34,"cpu": 8, "mem": 24, "category": "I1.2large24", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "devPayMode": ["monthly"], "local_ssd":[100,1000], "disk_map":[{"3":["3"]}]},
									{"id":35,"cpu": 8, "mem": 32, "category": "I1.2large32", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[100,1000], "disk_map":[{"3":["3"]}]},
									{"id":36,"cpu": 8, "mem": 40, "category": "I1.2large40", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[100,1000], "disk_map":[{"3":["3"]}]},
									{"id":37,"cpu": 12, "mem": 24, "category": "I1.3large24", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "devPayMode": ["monthly"], "local_ssd":[500,1500], "disk_map":[{"3":["3"]}]},
									{"id":38,"cpu": 12, "mem": 36, "category": "I1.3large36", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "devPayMode": ["monthly"], "local_ssd":[500,1500], "disk_map":[{"3":["3"]}]},
									{"id":39,"cpu": 12, "mem": 48, "category": "I1.3large48", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "devPayMode": ["monthly"], "local_ssd":[500,1500], "disk_map":[{"3":["3"]}]},
									{"id":40,"cpu": 12, "mem": 60, "category": "I1.3large60", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[500,1500], "disk_map":[{"3":["3"]}]},
									{"id":41,"cpu": 16, "mem": 80, "category": "I1.4large80", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[2350,2350], "disk_map":[{"3":["3"]}]},
									{"id":42,"cpu": 24, "mem": 120, "category": "I1.6large120", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[3000,3000], "disk_map":[{"3":["3"]}]},
									{"id":43,"cpu": 32, "mem": 160, "category": "I1.8large160", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[4800,4800], "disk_map":[{"3":["3"]}]},
									{"id":44,"cpu": 48, "mem": 240, "category": "I1.12large240", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[7200,7200], "disk_map":[{"3":["3"]}]},
									{"id":45,"cpu": 1, "mem": 8, "category": "M1.samll8", "deviceType":"bigMem","name":"内存型M1","isvol":"是", "local_disk":[0,800], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":46,"cpu": 2, "mem": 16, "category": "M1.medium16", "deviceType":"bigMem","name":"内存型M1","isvol":"是", "selected": "true", "local_disk":[0,800], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":47,"cpu": 4, "mem": 32, "category": "M1.large32", "deviceType":"bigMem","name":"内存型M1","isvol":"是", "local_disk":[0,800], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":48,"cpu": 8, "mem": 64, "category": "M1.2large64", "deviceType":"bigMem","name":"内存型M1","isvol":"是", "local_disk":[0,800], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":49,"cpu": 12, "mem": 96, "category": "M1.3large96", "deviceType":"bigMem","name":"内存型M1","isvol":"是", "local_disk":[0,800], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":50,"cpu": 16, "mem": 128, "category": "M1.4large128", "deviceType":"bigMem","name":"内存型M1","isvol":"是", "local_disk":[0,800], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":51,"cpu": 24, "mem": 192, "category": "M1.6large192", "deviceType":"bigMem","name":"内存型M1","isvol":"是", "local_disk":[0,1200], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":52,"cpu": 32, "mem": 256, "category": "M1.8large256", "deviceType":"bigMem","name":"内存型M1","isvol":"是", "local_disk":[0,1800], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":53,"cpu": 48, "mem": 368, "category": "M1.12large368", "deviceType":"bigMem","name":"内存型M1","isvol":"是", "local_disk":[0,2500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]}
								]
							}
						]
					},
					{
						"typename":"系列2",
						"instancetypes":[
							{
								"instancetypes":[
									{
										"instancetype":"CVM.S2",
										"instancetypename":"标准型S2",
										"deviceType":"standard"
									},
									{
										"instancetype":"CVM.I2",
										"instancetypename":"高IO型I2",
										"deviceType":"highIO"
									},
									{
										"instancetype":"CVM.M2",
										"instancetypename":"内存型M2",
										"deviceType":"bigMem"
									},
									{
										"instancetype":"CVM.C2",
										"instancetypename":"计算型C2",
										"deviceType":"compute"
									}
									
								],
								"instances":[
									{"id":1,"cpu": 1, "mem": 1, "category": "S1.small", "deviceType": "standard","name":"标准型S2","isvol":"是", "local_disk": [0,500], "cloud_disk": [0,16000], "cloud_ssd": [250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":2,"cpu": 1, "mem": 2, "category": "S1.small2", "deviceType": "standard","name":"标准型S2","isvol":"是", "selected":"true", "local_disk": [0,500], "cloud_disk": [0,16000], "cloud_ssd": [250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":3,"cpu": 1, "mem": 4, "category": "S1.small4", "deviceType": "standard","name":"标准型S2","isvol":"是", "local_disk": [0,500], "cloud_disk": [0,16000], "cloud_ssd": [250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":4,"cpu": 2, "mem": 4, "category": "S1.medium4", "deviceType": "standard","name":"标准型S2","isvol":"是", "local_disk": [0,500], "cloud_disk": [0,16000], "cloud_ssd": [250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":5,"cpu": 2, "mem": 8, "category": "S1.medium8", "deviceType": "standard","name":"标准型S2","isvol":"是", "local_disk": [0,500], "cloud_disk": [0,16000], "cloud_ssd": [250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":6,"cpu": 4, "mem": 8, "category": "S1.large8", "deviceType": "standard","name":"标准型S2","isvol":"是", "local_disk": [0,500], "cloud_disk": [0,16000], "cloud_ssd": [250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":7,"cpu": 4, "mem": 16, "category": "S1.large16", "deviceType": "standard","name":"标准型S2","isvol":"是", "local_disk": [0,500], "cloud_disk": [0,16000], "cloud_ssd": [250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":8,"cpu": 8, "mem": 16, "category": "S1.2large16", "deviceType": "standard","name":"标准型S2","isvol":"是", "local_disk": [0,500], "cloud_disk": [0,16000], "cloud_ssd": [250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":9,"cpu": 8, "mem": 32, "category": "S1.2large32", "deviceType": "standard","name":"标准型S2","isvol":"是", "local_disk": [0,500], "cloud_disk": [0,16000], "cloud_ssd": [250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":10,"cpu": 12, "mem": 24, "category": "S1.3large24", "deviceType": "standard","name":"标准型S2","isvol":"是", "local_disk": [0,500], "cloud_disk": [0,16000], "cloud_ssd": [250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":11,"cpu": 12, "mem": 48, "category": "S1.3large48", "deviceType": "standard","name":"标准型S2","isvol":"是", "local_disk": [0,500], "cloud_disk": [0,16000], "cloud_ssd": [250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":12,"cpu": 16, "mem": 32, "category": "S1.4large32", "deviceType": "standard","name":"标准型S2","isvol":"是", "local_disk": [0,800], "cloud_disk": [0,16000], "cloud_ssd": [250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":13,"cpu": 16, "mem": 48, "category": "S1.4large48", "deviceType": "standard","name":"标准型S2","isvol":"是", "local_disk": [0,800], "cloud_disk": [0,16000], "cloud_ssd": [250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":14,"cpu": 24, "mem": 48, "category": "S1.6large48", "deviceType": "standard","name":"标准型S2","isvol":"是", "local_disk": [0,1200], "cloud_disk": [0,16000], "cloud_ssd": [250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":15,"cpu": 24, "mem": 56, "category": "S1.6large60", "deviceType": "standard","name":"标准型S2","isvol":"是", "local_disk": [0,1200], "cloud_disk": [0,16000], "cloud_ssd": [250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":16,"cpu": 32, "mem": 64, "category": "S1.8large64", "deviceType": "standard","name":"标准型S2","isvol":"是", "local_disk": [0,1600], "cloud_disk": [0,16000], "cloud_ssd": [250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":17,"cpu": 32, "mem": 120, "category": "S1.8large120", "deviceType": "standard","name":"标准型S2","isvol":"是", "local_disk": [0,1600], "cloud_disk": [0,16000], "cloud_ssd": [250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":18,"cpu": 2, "mem": 4, "category": "I1.medium4", "deviceType":"highIO","name":"高IO型I2","isvol":"否", "local_ssd":[50,500], "disk_map":[{"3":["3"]}]},
									{"id":19,"cpu": 2, "mem": 8, "category": "I1.medium8", "deviceType":"highIO","name":"高IO型I2","isvol":"否", "selected": "true", "local_ssd":[50,500], "disk_map":[{"3":["3"]}]},
									{"id":20,"cpu": 2, "mem": 16, "category": "I1.medium16", "deviceType":"highIO","name":"高IO型I2","isvol":"否", "local_ssd":[50,500], "disk_map":[{"3":["3"]}]},
									{"id":21,"cpu": 4, "mem": 8, "category": "I1.large8", "deviceType":"highIO","name":"高IO型I2","isvol":"否", "local_ssd":[50,500], "disk_map":[{"3":["3"]}]},
									{"id":22,"cpu": 4, "mem": 16, "category": "I1.large16", "deviceType":"highIO","name":"高IO型I2","isvol":"否", "local_ssd":[50,500], "disk_map":[{"3":["3"]}]},
									{"id":23,"cpu": 4, "mem": 32, "category": "I1.large32", "deviceType":"highIO","name":"高IO型I2","isvol":"否", "local_ssd":[50,500], "disk_map":[{"3":["3"]}]},
									{"id":24,"cpu": 8, "mem": 16, "category": "I1.2large16", "deviceType":"highIO","name":"高IO型I2","isvol":"否", "local_ssd":[100,500], "disk_map":[{"3":["3"]}]},
									{"id":25,"cpu": 8, "mem": 24, "category": "I1.2large24", "deviceType":"highIO","name":"高IO型I2","isvol":"否", "devPayMode": ["monthly"], "local_ssd":[100,500], "disk_map":[{"3":["3"]}]},
									{"id":26,"cpu": 8, "mem": 32, "category": "I1.2large32", "deviceType":"highIO","name":"高IO型I2","isvol":"否", "local_ssd":[100,500], "disk_map":[{"3":["3"]}]},
									{"id":27,"cpu": 12, "mem": 24, "category": "I1.3large24", "deviceType":"highIO","name":"高IO型I2","isvol":"否", "devPayMode": ["monthly"], "local_ssd":[500,1500], "disk_map":[{"3":["3"]}]},
									{"id":28,"cpu": 12, "mem": 48, "category": "I1.3large48", "deviceType":"highIO","name":"高IO型I2","isvol":"否", "devPayMode": ["monthly"], "local_ssd":[500,1500], "disk_map":[{"3":["3"]}]},
									{"id":29,"cpu": 16, "mem": 32, "category": "I1.4large32", "deviceType":"highIO","name":"高IO型I2","isvol":"否", "local_ssd":[500,2500], "disk_map":[{"3":["3"]}]},
									{"id":30,"cpu": 16, "mem": 64, "category": "I1.4large64", "deviceType":"highIO","name":"高IO型I2","isvol":"否", "local_ssd":[500,2500], "disk_map":[{"3":["3"]}]},
									{"id":31,"cpu": 24, "mem": 96, "category": "I1.6large96", "deviceType":"highIO","name":"高IO型I2","isvol":"否", "local_ssd":[3000,3000], "disk_map":[{"3":["3"]}]},
									{"id":32,"cpu": 32, "mem": 120, "category": "I1.8large120", "deviceType":"highIO","name":"高IO型I2","isvol":"否", "local_ssd":[4000,4000], "disk_map":[{"3":["3"]}]},
									{"id":33,"cpu": 1, "mem": 8, "category": "M1.samll8", "deviceType":"bigMem","name":"内存型M2","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":34,"cpu": 2, "mem": 16, "category": "M1.medium16", "deviceType":"bigMem","name":"内存型M2","isvol":"是", "selected": "true", "local_disk":[0,500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":35,"cpu": 4, "mem": 32, "category": "M1.large32", "deviceType":"bigMem","name":"内存型M2","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":36,"cpu": 8, "mem": 64, "category": "M1.2large64", "deviceType":"bigMem","name":"内存型M2","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":37,"cpu": 12, "mem": 96, "category": "M1.3large96", "deviceType":"bigMem","name":"内存型M2","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":38,"cpu": 16, "mem": 128, "category": "M1.4large128", "deviceType":"bigMem","name":"内存型M2","isvol":"是", "local_disk":[0,800], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":39,"cpu": 24, "mem": 192, "category": "M1.6large192", "deviceType":"bigMem","name":"内存型M2","isvol":"是", "local_disk":[0,1200], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":40,"cpu": 32, "mem": 256, "category": "M1.8large256", "deviceType":"bigMem","name":"内存型M2","isvol":"是", "local_disk":[0,1800], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":41,"cpu": 48, "mem": 384, "category": "M1.12large368", "deviceType":"bigMem","name":"内存型M2","isvol":"是", "local_disk":[0,2500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":42,"cpu": 4, "mem": 8, "category": "M1.medium8", "deviceType":"compute","name":"计算型C2","isvol":"是", "local_ssd":[50,500], "cloud_ssd":[250,4000], "disk_map":[{"3":["3"]}]},
									{"id":43,"cpu": 4, "mem": 16, "category": "M1.medium16", "deviceType":"compute","name":"计算型C2","isvol":"是", "selected": "true", "local_ssd":[50,500], "cloud_ssd":[250,4000], "disk_map":[{"3":["3"]}]},
									{"id":44,"cpu": 4, "mem": 32, "category": "M1.large32", "deviceType":"compute","name":"计算型C2","isvol":"是", "local_ssd":[50,500], "cloud_ssd":[250,4000], "disk_map":[{"3":["3"]}]},
									{"id":45,"cpu": 8, "mem": 16, "category": "M1.2large16", "deviceType":"compute","name":"计算型C2","isvol":"是", "local_ssd":[100,500], "cloud_ssd":[250,4000], "disk_map":[{"3":["3"]}]},
									{"id":46,"cpu": 8, "mem": 32, "category": "M1.2large32", "deviceType":"compute","name":"计算型C2","isvol":"是", "local_ssd":[100,500], "cloud_ssd":[250,4000], "disk_map":[{"3":["3"]}]},
									{"id":47,"cpu": 16, "mem": 32, "category": "M1.4large32", "deviceType":"compute","name":"计算型C2","isvol":"是", "local_ssd":[200,800], "cloud_ssd":[250,4000], "disk_map":[{"3":["3"]}]},
									{"id":48,"cpu": 16, "mem": 60, "category": "M1.4large60", "deviceType":"compute","name":"计算型C2","isvol":"是", "local_ssd":[200,800], "cloud_ssd":[250,4000], "disk_map":[{"3":["3"]}]},
									{"id":49,"cpu": 32, "mem": 120, "category": "M1.8large120", "deviceType":"compute","name":"计算型C2","isvol":"否", "local_ssd":[1000,1000], "disk_map":[{"3":["3"]}]},
									{"id":50,"cpu": 28, "mem": 60, "gpu": 1, "deviceType":"gpu", "selected": "true", "devPayMode": ["monthly"],"gpuDesc": "1颗Tesla M40", "vendorId": "10de", "deviceId": "17fd","tip":"单机峰值计算能力突破7T Flops单精度浮点运算，0.2T Flops双精度浮点运算"},
									{"id":51,"cpu": 56, "mem": 120, "gpu": 2, "deviceType":"gpu", "devPayMode": ["monthly"],"gpuDesc": "2颗Tesla M40", "vendorId": "10de", "deviceId": "17fd","tip":"单机峰值计算能力突破14T Flops单精度浮点运算，0.4T Flops双精度浮点运算"}
								]
							}
						]
					}
				]
			}			
		]
	},
	{
		"name": "上海",
		"value": "sh",
		"zones": [
			{
				"zonename": "上海一区",
				"zoneId": "200001",
				"type":[
					{
						"typename":"系列1",
						"instancetypes":[
							{
								"instancetypes":[
									{
										"instancetype":"CVM.S1",
										"instancetypename":"标准型S1",
										"deviceType":"standard"
									},
									{
										"instancetype":"CVM.I1",
										"instancetypename":"高IO型I1",
										"deviceType":"highIO"
									},
									{
										"instancetype":"CVM.M1",
										"instancetypename":"内存型M1",
										"deviceType":"bigMem"
									}
								],
								"instances":[
									{"id":1,"cpu": 1, "mem": 1, "category": "S1.small", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":2,"cpu": 1, "mem": 2, "category": "S1.small2", "deviceType": "standard","name":"标准型S1","isvol":"是", "selected": "true", "local_disk":[0,500], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":3,"cpu": 1, "mem": 4, "category": "S1.small4", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":4,"cpu": 2, "mem": 2, "category": "S1.medium2", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":5,"cpu": 2, "mem": 4, "category": "S1.medium4", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":6,"cpu": 2, "mem": 8, "category": "S1.medium8", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":7,"cpu": 2, "mem": 12, "category": "S1.medium12", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":8,"cpu": 4, "mem": 4, "category": "S1.large4", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":9,"cpu": 4, "mem": 8, "category": "S1.large8", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":10,"cpu": 4, "mem": 12, "category": "S1.large12", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":11,"cpu": 4, "mem": 16, "category": "S1.large16", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":12,"cpu": 4, "mem": 24, "category": "S1.large24", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":13,"cpu": 8, "mem": 8, "category": "S1.2large8", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":14,"cpu": 8, "mem": 16, "category": "S1.2large16", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":15,"cpu": 8, "mem": 24, "category": "S1.2large24", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":16,"cpu": 8, "mem": 32, "category": "S1.2large32", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":17,"cpu": 12, "mem": 12, "category": "S1.3large12", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":18,"cpu": 12, "mem": 24, "category": "S1.3large24", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":19,"cpu": 12, "mem": 28, "category": "S1.3large28", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":20,"cpu": 16, "mem": 16, "category": "S1.4large16", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,800], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":21,"cpu": 16, "mem": 32, "category": "S1.4large32", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,800], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":22,"cpu": 16, "mem": 48, "category": "S1.4large48", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,800], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":23,"cpu": 24, "mem": 56, "category": "S1.6large56", "deviceType": "standard","name":"标准型S1","isvol":"否", "local_disk":[1000,1000], "disk_map":[{"1":["1"]}]},
									{"id":24,"cpu": 2, "mem": 4, "category": "I1.medium4", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[50,250], "disk_map":[{"3":["3"]}]},
									{"id":25,"cpu": 2, "mem": 8, "category": "I1.medium8", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "selected": "true", "local_ssd":[50,250], "disk_map":[{"3":["3"]}]},
									{"id":26,"cpu": 2, "mem": 16, "category": "I1.medium16", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[50,250], "disk_map":[{"3":["3"]}]},
									{"id":27,"cpu": 4, "mem": 8, "category": "I1.large8", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[50,500], "disk_map":[{"3":["3"]}]},
									{"id":28,"cpu": 4, "mem": 16, "category": "I1.large16", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[50,500], "disk_map":[{"3":["3"]}]},
									{"id":29,"cpu": 4, "mem": 32, "category": "I1.large32", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[50,500], "disk_map":[{"3":["3"]}]},
									{"id":30,"cpu": 8, "mem": 16, "category": "I1.2large16", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[100,1000], "disk_map":[{"3":["3"]}]},
									{"id":31,"cpu": 8, "mem": 24, "category": "I1.2large24", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "devPayMode": ["monthly"], "local_ssd":[100,1000], "disk_map":[{"3":["3"]}]},
									{"id":32,"cpu": 8, "mem": 32, "category": "I1.2large32", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[100,1000], "disk_map":[{"3":["3"]}]},
									{"id":33,"cpu": 8, "mem": 40, "category": "I1.2large40", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[100,1000], "disk_map":[{"3":["3"]}]},
									{"id":34,"cpu": 12, "mem": 24, "category": "I1.3large24", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "devPayMode": ["monthly"], "local_ssd":[500,1500], "disk_map":[{"3":["3"]}]},
									{"id":35,"cpu": 12, "mem": 36, "category": "I1.3large36", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "devPayMode": ["monthly"], "local_ssd":[500,1500], "disk_map":[{"3":["3"]}]},
									{"id":36,"cpu": 12, "mem": 48, "category": "I1.3large48", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "devPayMode": ["monthly"], "local_ssd":[500,1500], "disk_map":[{"3":["3"]}]},
									{"id":37,"cpu": 12, "mem": 60, "category": "I1.3large60", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[500,1500], "disk_map":[{"3":["3"]}]},
									{"id":38,"cpu": 24, "mem": 120, "category": "I1.6large120", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[2950,2950], "disk_map":[{"3":["3"]}]},
									{"id":39,"cpu": 1, "mem": 8, "category": "M1.samll8", "deviceType":"bigMem","name":"内存型M1","isvol":"是", "local_disk":[0,800], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":40,"cpu": 2, "mem": 16, "category": "M1.medium16", "deviceType":"bigMem","name":"内存型M1","isvol":"是", "selected": "true", "local_disk":[0,800], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":41,"cpu": 4, "mem": 32, "category": "M1.large32", "deviceType":"bigMem","name":"内存型M1","isvol":"是", "local_disk":[0,800], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":42,"cpu": 8, "mem": 64, "category": "M1.2large64", "deviceType":"bigMem","name":"内存型M1","isvol":"是", "local_disk":[0,800], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":43,"cpu": 12, "mem": 96, "category": "M1.3large96", "deviceType":"bigMem","name":"内存型M1","isvol":"是", "local_disk":[0,800], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":44,"cpu": 16, "mem": 128, "category": "M1.4large128", "deviceType":"bigMem","name":"内存型M1","isvol":"是", "local_disk":[0,800], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":45,"cpu": 24, "mem": 192, "category": "M1.6large192", "deviceType":"bigMem","name":"内存型M1","isvol":"是", "local_disk":[0,1200], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":46,"cpu": 32, "mem": 256, "category": "M1.8large256", "deviceType":"bigMem","name":"内存型M1","isvol":"是", "local_disk":[0,1800], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":47,"cpu": 48, "mem": 368, "category": "M1.12large368", "deviceType":"bigMem","name":"内存型M1","isvol":"是", "local_disk":[0,2500], "cloud_disk":[0,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]}
								]
							}
						]
					},
					{
						"typename":"系列2",
						"instancetypes":[
							{
								"instancetypes":[
									{
										"instancetype":"CVM.S2",
										"instancetypename":"标准型S2",
										"deviceType":"standard"
									},
									{
										"instancetype":"CVM.I2",
										"instancetypename":"高IO型I2",
										"deviceType":"highIO"
									},
									{
										"instancetype":"CVM.M2",
										"instancetypename":"内存型M2",
										"deviceType":"bigMem"
									},
									{
										"instancetype":"CVM.C2",
										"instancetypename":"计算型C2",
										"deviceType":"compute"
									}
									
								],
								"instances":[
									{"id":1,"cpu": 1, "mem": 1, "category": "S1.small", "deviceType": "standard","name":"标准型S2","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":2,"cpu": 1, "mem": 2, "category": "S1.small2", "deviceType": "standard","name":"标准型S2","isvol":"是", "selected": "true", "local_disk":[0,500], "cloud_disk":[0,4000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":3,"cpu": 1, "mem": 4, "category": "S1.small4", "deviceType": "standard","name":"标准型S2","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":4,"cpu": 2, "mem": 4, "category": "S1.medium4", "deviceType": "standard","name":"标准型S2","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":5,"cpu": 2, "mem": 8, "category": "S1.medium8", "deviceType": "standard","name":"标准型S2","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":6,"cpu": 4, "mem": 8, "category": "S1.large8", "deviceType": "standard","name":"标准型S2","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":7,"cpu": 4, "mem": 16, "category": "S1.large16", "deviceType": "standard","name":"标准型S2","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":8,"cpu": 8, "mem": 16, "category": "S1.2large16", "deviceType": "standard","name":"标准型S2","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":9,"cpu": 8, "mem": 32, "category": "S1.2large32", "deviceType": "standard","name":"标准型S2","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":10,"cpu": 12, "mem": 24, "category": "S1.3large24", "deviceType": "standard","name":"标准型S2","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":11,"cpu": 12, "mem": 48, "category": "S1.3large48", "deviceType": "standard","name":"标准型S2","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":12,"cpu": 16, "mem": 32, "category": "S1.4large32", "deviceType": "standard","name":"标准型S2","isvol":"是", "local_disk":[0,800], "cloud_disk":[0,4000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":13,"cpu": 16, "mem": 48, "category": "S1.4large48", "deviceType": "standard","name":"标准型S2","isvol":"是", "local_disk":[0,800], "cloud_disk":[0,4000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":14,"cpu": 24, "mem": 48, "category": "S1.6large48", "deviceType": "standard","name":"标准型S2","isvol":"是", "local_disk":[0,1200], "cloud_disk":[0,4000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":15,"cpu": 24, "mem": 56, "category": "S1.6large60", "deviceType": "standard","name":"标准型S2","isvol":"是", "local_disk":[0,1200], "cloud_disk":[0,4000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":16,"cpu": 32, "mem": 64, "category": "S1.8large64", "deviceType": "standard","name":"标准型S2","isvol":"是", "local_disk":[0,1600], "cloud_disk":[0,4000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":17,"cpu": 32, "mem": 120, "category": "S1.8large120", "deviceType": "standard","name":"标准型S2","isvol":"是", "local_disk":[0,1600], "cloud_disk":[0,4000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":18,"cpu": 2, "mem": 4, "category": "I1.medium4", "deviceType":"highIO","name":"高IO型I2","isvol":"否", "local_ssd":[50,500], "disk_map":[{"3":["3"]}]},
									{"id":19,"cpu": 2, "mem": 8, "category": "I1.medium8", "deviceType":"highIO","name":"高IO型I2","isvol":"否", "selected": "true", "local_ssd":[50,500], "disk_map":[{"3":["3"]}]},
									{"id":20,"cpu": 2, "mem": 16, "category": "I1.medium16", "deviceType":"highIO","name":"高IO型I2","isvol":"否", "local_ssd":[50,500], "disk_map":[{"3":["3"]}]},
									{"id":21,"cpu": 4, "mem": 8, "category": "I1.large8", "deviceType":"highIO","name":"高IO型I2","isvol":"否", "local_ssd":[50,500], "disk_map":[{"3":["3"]}]},
									{"id":22,"cpu": 4, "mem": 16, "category": "I1.large16", "deviceType":"highIO","name":"高IO型I2","isvol":"否", "local_ssd":[50,500], "disk_map":[{"3":["3"]}]},
									{"id":23,"cpu": 4, "mem": 32, "category": "I1.large32", "deviceType":"highIO","name":"高IO型I2","isvol":"否", "local_ssd":[50,500], "disk_map":[{"3":["3"]}]},
									{"id":24,"cpu": 8, "mem": 16, "category": "I1.2large16", "deviceType":"highIO","name":"高IO型I2","isvol":"否", "local_ssd":[100,500], "disk_map":[{"3":["3"]}]},
									{"id":25,"cpu": 8, "mem": 24, "category": "I1.2large24", "deviceType":"highIO","name":"高IO型I2","isvol":"否", "devPayMode": ["monthly"], "local_ssd":[100,500], "disk_map":[{"3":["3"]}]},
									{"id":26,"cpu": 8, "mem": 32, "category": "I1.2large32", "deviceType":"highIO","name":"高IO型I2","isvol":"否", "local_ssd":[100,500], "disk_map":[{"3":["3"]}]},
									{"id":27,"cpu": 12, "mem": 24, "category": "I1.3large24", "deviceType":"highIO","name":"高IO型I2","isvol":"否", "devPayMode": ["monthly"], "local_ssd":[500,1500], "disk_map":[{"3":["3"]}]},
									{"id":28,"cpu": 12, "mem": 48, "category": "I1.3large48", "deviceType":"highIO","name":"高IO型I2","isvol":"否", "devPayMode": ["monthly"], "local_ssd":[500,1500], "disk_map":[{"3":["3"]}]},
									{"id":29,"cpu": 16, "mem": 32, "category": "I1.4large32", "deviceType":"highIO","name":"高IO型I2","isvol":"否", "local_ssd":[500,2500], "disk_map":[{"3":["3"]}]},
									{"id":30,"cpu": 16, "mem": 64, "category": "I1.4large64", "deviceType":"highIO","name":"高IO型I2","isvol":"否", "local_ssd":[500,2500], "disk_map":[{"3":["3"]}]},
									{"id":31,"cpu": 24, "mem": 96, "category": "I1.6large96", "deviceType":"highIO","name":"高IO型I2","isvol":"否", "local_ssd":[3000,3000], "disk_map":[{"3":["3"]}]},
									{"id":32,"cpu": 32, "mem": 120, "category": "I1.8large120", "deviceType":"highIO","name":"高IO型I2","isvol":"否", "local_ssd":[4000,4000], "disk_map":[{"3":["3"]}]},
									{"id":33,"cpu": 1, "mem": 8, "category": "M1.samll8", "deviceType":"bigMem","name":"内存型M2","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":34,"cpu": 2, "mem": 16, "category": "M1.medium16", "deviceType":"bigMem","name":"内存型M2","isvol":"是", "selected": "true", "local_disk":[0,500], "cloud_disk":[0,4000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":35,"cpu": 4, "mem": 32, "category": "M1.large32", "deviceType":"bigMem","name":"内存型M2","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":36,"cpu": 8, "mem": 64, "category": "M1.2large64", "deviceType":"bigMem","name":"内存型M2","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":37,"cpu": 12, "mem": 96, "category": "M1.3large96", "deviceType":"bigMem","name":"内存型M2","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,4000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":38,"cpu": 16, "mem": 128, "category": "M1.4large128", "deviceType":"bigMem","name":"内存型M2","isvol":"是", "local_disk":[0,800], "cloud_disk":[0,4000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":39,"cpu": 24, "mem": 192, "category": "M1.6large192", "deviceType":"bigMem","name":"内存型M2","isvol":"是", "local_disk":[0,1200], "cloud_disk":[0,4000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":40,"cpu": 32, "mem": 256, "category": "M1.8large256", "deviceType":"bigMem","name":"内存型M2","isvol":"是", "local_disk":[0,1800], "cloud_disk":[0,4000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":41,"cpu": 48, "mem": 384, "category": "M1.12large368", "deviceType":"bigMem","name":"内存型M2","isvol":"是", "local_disk":[0,2500], "cloud_disk":[0,4000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":42,"cpu": 4, "mem": 8, "category": "M1.medium8", "deviceType":"compute","name":"计算型C2","isvol":"是", "local_ssd":[50,500], "cloud_ssd":[250,4000], "disk_map":[{"3":["3"]}]},
									{"id":43,"cpu": 4, "mem": 16, "category": "M1.medium16", "deviceType":"compute","name":"计算型C2","isvol":"是", "selected": "true", "local_ssd":[50,500], "cloud_ssd":[250,4000], "disk_map":[{"3":["3"]}]},
									{"id":44,"cpu": 4, "mem": 32, "category": "M1.large32", "deviceType":"compute","name":"计算型C2","isvol":"是", "local_ssd":[50,500], "cloud_ssd":[250,4000], "disk_map":[{"3":["3"]}]},
									{"id":45,"cpu": 8, "mem": 16, "category": "M1.2large16", "deviceType":"compute","name":"计算型C2","isvol":"是", "local_ssd":[100,500], "cloud_ssd":[250,4000], "disk_map":[{"3":["3"]}]},
									{"id":46,"cpu": 8, "mem": 32, "category": "M1.2large32", "deviceType":"compute","name":"计算型C2","isvol":"是", "local_ssd":[100,500], "cloud_ssd":[250,4000], "disk_map":[{"3":["3"]}]},
									{"id":47,"cpu": 16, "mem": 32, "category": "M1.4large32", "deviceType":"compute","name":"计算型C2","isvol":"是", "local_ssd":[200,800], "cloud_ssd":[250,4000], "disk_map":[{"3":["3"]}]},
									{"id":48,"cpu": 16, "mem": 60, "category": "M1.4large60", "deviceType":"compute","name":"计算型C2","isvol":"是", "local_ssd":[200,800], "cloud_ssd":[250,4000], "disk_map":[{"3":["3"]}]},
									{"id":49,"cpu": 32, "mem": 120, "category": "M1.8large120", "deviceType":"compute","name":"计算型C2","isvol":"否", "local_ssd":[1000,1000], "disk_map":[{"3":["3"]}]},
									{"id":50,"cpu": 28, "mem": 60, "gpu": 1, "deviceType":"gpu", "selected": "true", "devPayMode": ["monthly"],"gpuDesc": "1颗Tesla M40", "vendorId": "10de", "deviceId": "17fd","tip":"单机峰值计算能力突破7T Flops单精度浮点运算，0.2T Flops双精度浮点运算"},
									{"id":51,"cpu": 56, "mem": 120, "gpu": 2, "deviceType":"gpu", "devPayMode": ["monthly"],"gpuDesc": "2颗Tesla M40", "vendorId": "10de", "deviceId": "17fd","tip":"单机峰值计算能力突破14T Flops单精度浮点运算，0.4T Flops双精度浮点运算"}
								]
							}
						]
					}
				]
			}			
		]
	},
	{
		"name": "北京",
		"value": "bj",
		"zones": [
			{
				"zonename": "北京一区",
				"zoneId": "800001",
				"type":[
					{
						"typename":"系列1",
						"instancetypes":[
							{
								"instancetypes":[
									{
										"instancetype":"CVM.S1",
										"instancetypename":"标准型S1",
										"deviceType":"standard"
									},
									{
										"instancetype":"CVM.I1",
										"instancetypename":"高IO型I1",
										"deviceType":"highIO"
									},
									{
										"instancetype":"CVM.M1",
										"instancetypename":"内存型M1",
										"deviceType":"bigMem"
									}
								],
								"instances":[
									{"id":1,"cpu": 1, "mem": 1, "category": "S1.small", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":2,"cpu": 1, "mem": 2, "category": "S1.small2", "deviceType": "standard","name":"标准型S1","isvol":"是", "selected": "true", "local_disk":[0,500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":3,"cpu": 1, "mem": 4, "category": "S1.small4", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":4,"cpu": 2, "mem": 2, "category": "S1.medium2", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":5,"cpu": 2, "mem": 4, "category": "S1.medium4", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":6,"cpu": 2, "mem": 8, "category": "S1.medium8", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":7,"cpu": 2, "mem": 12, "category": "S1.medium12", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":8,"cpu": 4, "mem": 4, "category": "S1.large4", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":9,"cpu": 4, "mem": 8, "category": "S1.large8", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":10,"cpu": 4, "mem": 12, "category": "S1.large12", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":11,"cpu": 4, "mem": 16, "category": "S1.large16", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":12,"cpu": 4, "mem": 24, "category": "S1.large24", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":13,"cpu": 8, "mem": 8, "category": "S1.2large8", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":14,"cpu": 8, "mem": 16, "category": "S1.2large16", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":15,"cpu": 8, "mem": 24, "category": "S1.2large24", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":16,"cpu": 8, "mem": 32, "category": "S1.2large32", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":17,"cpu": 12, "mem": 12, "category": "S1.3large12", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":18,"cpu": 12, "mem": 24, "category": "S1.3large24", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":19,"cpu": 12, "mem": 48, "category": "S1.3large48", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":20,"cpu": 16, "mem": 16, "category": "S1.4large16", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,800], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":21,"cpu": 16, "mem": 32, "category": "S1.4large32", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,800], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":22,"cpu": 16, "mem": 48, "category": "S1.4large48", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,800], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":23,"cpu": 24, "mem": 24, "category": "S1.6large24", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,1200], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":24,"cpu": 24, "mem": 48, "category": "S1.6large48", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,1200], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":25,"cpu": 24, "mem": 56, "category": "S1.6large56", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,1200], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":26,"cpu": 32, "mem": 64, "category": "S1.8large64", "deviceType": "standard","name":"标准型S1","isvol":"是", "local_disk":[0,1600], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":27,"cpu": 2, "mem": 4, "category": "I1.medium4", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[50,250], "disk_map":[{"3":["3"]}]},
									{"id":28,"cpu": 2, "mem": 8, "category": "I1.medium8", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "selected": "true", "local_ssd":[50,250], "disk_map":[{"3":["3"]}]},
									{"id":29,"cpu": 2, "mem": 16, "category": "I1.medium16", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[50,250], "disk_map":[{"3":["3"]}]},
									{"id":30,"cpu": 4, "mem": 8, "category": "I1.large8", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[50,500], "disk_map":[{"3":["3"]}]},
									{"id":31,"cpu": 4, "mem": 16, "category": "I1.large16", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[50,500], "disk_map":[{"3":["3"]}]},
									{"id":32,"cpu": 4, "mem": 32, "category": "I1.large32", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[50,500], "disk_map":[{"3":["3"]}]},
									{"id":33,"cpu": 8, "mem": 16, "category": "I1.2large16", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[100,1000], "disk_map":[{"3":["3"]}]},
									{"id":34,"cpu": 8, "mem": 24, "category": "I1.2large24", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "devPayMode": ["monthly"], "local_ssd":[100,1000], "disk_map":[{"3":["3"]}]},
									{"id":35,"cpu": 8, "mem": 32, "category": "I1.2large32", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[100,1000], "disk_map":[{"3":["3"]}]},
									{"id":36,"cpu": 8, "mem": 40, "category": "I1.2large40", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[100,1000], "disk_map":[{"3":["3"]}]},
									{"id":37,"cpu": 12, "mem": 24, "category": "I1.3large24", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "devPayMode": ["monthly"], "local_ssd":[500,1500], "disk_map":[{"3":["3"]}]},
									{"id":38,"cpu": 12, "mem": 36, "category": "I1.3large36", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "devPayMode": ["monthly"], "local_ssd":[500,1500], "disk_map":[{"3":["3"]}]},
									{"id":39,"cpu": 12, "mem": 48, "category": "I1.3large48", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "devPayMode": ["monthly"], "local_ssd":[500,1500], "disk_map":[{"3":["3"]}]},
									{"id":40,"cpu": 12, "mem": 60, "category": "I1.3large60", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[500,1500], "disk_map":[{"3":["3"]}]},
									{"id":41,"cpu": 16, "mem": 80, "category": "I1.4large80", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[2350,2350], "disk_map":[{"3":["3"]}]},
									{"id":42,"cpu": 24, "mem": 120, "category": "I1.6large120", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[3550,3550], "disk_map":[{"3":["3"]}]},
									{"id":43,"cpu": 32, "mem": 160, "category": "I1.6large160", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[4800,4800], "disk_map":[{"3":["3"]}]},
									{"id":44,"cpu": 48, "mem": 240, "category": "I1.6large240", "deviceType":"highIO","name":"高IO型I1","isvol":"否", "local_ssd":[7200,7200], "disk_map":[{"3":["3"]}]},
									{"id":45,"cpu": 1, "mem": 8, "category": "M1.samll8", "deviceType":"bigMem","name":"内存型M1","isvol":"是", "local_disk":[0,800], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":46,"cpu": 2, "mem": 16, "category": "M1.medium16", "deviceType":"bigMem","name":"内存型M1","isvol":"是", "selected": "true", "local_disk":[0,800], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":47,"cpu": 4, "mem": 32, "category": "M1.large32", "deviceType":"bigMem","name":"内存型M1","isvol":"是", "local_disk":[0,800], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":48,"cpu": 8, "mem": 64, "category": "M1.2large64", "deviceType":"bigMem","name":"内存型M1","isvol":"是", "local_disk":[0,800], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":49,"cpu": 12, "mem": 96, "category": "M1.3large96", "deviceType":"bigMem","name":"内存型M1","isvol":"是", "local_disk":[0,800], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":50,"cpu": 16, "mem": 128, "category": "M1.4large128", "deviceType":"bigMem","name":"内存型M1","isvol":"是", "local_disk":[0,800], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":51,"cpu": 24, "mem": 192, "category": "M1.6large192", "deviceType":"bigMem","name":"内存型M1","isvol":"是", "local_disk":[0,1200], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":52,"cpu": 32, "mem": 256, "category": "M1.8large256", "deviceType":"bigMem","name":"内存型M1","isvol":"是", "local_disk":[0,1800], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]},
									{"id":53,"cpu": 48, "mem": 368, "category": "M1.12large368", "deviceType":"bigMem","name":"内存型M1","isvol":"是", "local_disk":[0,2500], "cloud_disk":[0,16000], "cloud_ssd":[250,4000], "disk_map":[{"1":["1"]},{"2":["2"]}]}
								]
							}
						]
					}
				]
			}			
		]
	}
]