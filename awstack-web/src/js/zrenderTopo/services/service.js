export function netTopoSrv($http) {
	var static_quota_url = "awstack-user/v1";
	return {
		getDepart: function() {
			return $http({
				method: "GET",
				url: "awstack-user/v1/enterprises/" + localStorage.enterpriseUid + "/domains"
			});
		},
		getTopo: function() {
			return $http({
				method: "POST",
				url: "awstack-resource/v1/topology",
				data: {}
			})
		},
		getNetworks: function() {
			return $http({
				method: "GET",
				url: "awstack-resource/v1/networks"
			});
		},
		getAllNets: function() {
			return $http({
				method: "GET",
				url: "awstack-resource/v1/listNetworksAndAllSharedNet"
			})
		},
		getFirewallList: function() {
			return $http({
				method: "GET",
				url: "awstack-resource/v1/firewall"
			});
		},
		getFirewallDetail: function(firewall_id) {
			return $http({
				method: "GET",
				url: "awstack-resource/v1/firewall/" + firewall_id + "/getFirewallDetail"
			});
		},
		getRouterDetail: function(routerId) {
			return $http({
				method: "GET",
				url: "awstack-resource/v1/vpn/" + routerId + "/getRouterDetail"
			});
		},
		getSubnetsList: function() {
			return $http({
				method: "GET",
				url: "awstack-resource/v1/subnets"
			});
		},
		getVmDetail: function(vmId) {
			return $http({
				method: "GET",
				url: "awstack-resource/v1/server/" + vmId
			})
		},
		editNetworkAction: function(options) {
			return $http({
				method: "PUT",
				url: "/awstack-resource/v1/networks/" + options.network_id,
				data: options.network_name
			});
		},
		editRouterName: function(options) {
			return $http({
				method: "PUT",
				url: "/awstack-resource/v1/routers",
				data: options
			});
		},
		updateFirewall: function(id, data) {
			return $http({
				method: "PUT",
				url: "/awstack-resource/v1/firewall/" + id + "/updateFirewall",
				data: data
			})
		},
		getTestData: function() {
			let testData = {
				net: [{
					id: 111,
					name: "external_net1",
					cidr: ["191.121.20.5/24"],
					router: [{
						name: "router-1",
						id: "111111111111111111111111",
						gateway: "191.121.20.1",
						firewall: {
							name: "firewall1",
							firewall_id: "24353dsdsds"
						}
					}, {
						name: "router-2",
						id: "222222222222222222222222",
						gateway: "191.121.20.1",
						firewall: {
							name: "firewall2",
							firewall_id: "24353dsdsds"
						}
					}, {
						name: "router-3",
						id: "333333333333333333333333",
						gateway: "191.121.20.1",
						firewall: {
							name: "firewall1",
							firewall_id: "24353dsdsds"
						}
					}, {
						name: "router-4",
						id: "444444444444444444444444",
						gateway: "194.121.20.1",
						firewall: {
							name: "firewall1",
							firewall_id: "24353dsdsds"
						}
					}],
					networks: [{
						id: "8aecf2ad-ff86-4f7a-bed1-29b1d2bf5c16",
						name: "network1001",
						vlanId: 2006,
						subnets: [{
							cidr: "78.78.78.0/24",
							gatewayIp: "78.78.78.1",
							name: "ddsub1",
							id: "d1972e45-bba3-4b57-8ffd-80891dd6b253",
							router_id: "111111111111111111111111"
						}, {
							cidr: "178.78.78.0/24",
							gatewayIp: "178.78.78.1",
							name: "ddsub2",
							id: "d19x72e45-bba3-4b57-8ffd-80891dd6b254",
							router_id: "222222222222222222222222"
						}]
					}, {
						id: "2c95f243-50f7-4813-9482-334626179c26",
						name: "network002",
						vlanId: 2007,
						subnets: [{
							cidr: "178.78.78.0/24",
							gatewayIp: "178.78.78.1",
							name: "ddsub3",
							id: "d19x72e45-bba3-4b57-8ffd-80891dd6b789",
							router_id: "222222222222222222222222"
						}]
					}, {
						id: "2c95f243-50f7-4813-9482-334626179c27",
						name: "network003",
						vlanId: 2008,
						subnets: [{
							cidr: "192.168.22.0/24",
							gatewayIp: "192.168.22.1",
							name: "ddsub4",
							id: "d1972e45-bba3-4b57-8ffd-80891dd6b568",
							router_id: "111111111111111111111111"
						}, {
							cidr: "190.78.78.0/24",
							gatewayIp: "190.78.78.1",
							name: "ddsub5",
							id: "d19x72e45-bba3-4b57-8ffd-80891dd6b787",
							router_id: ""
						}]
					}, {
						id: "2c95f243-50f7-4813-9482-33462617er28",
						name: "net444444",
						vlanId: 2009,
						subnets: [{
							cidr: "11.22.33.0/24",
							gatewayIp: "11.22.33.1",
							name: "ddsub6",
							id: "d1972e45-bba3-4b57-8ffd-ert5hbgfh6767",
							router_id: "333333333333333333333333"
						}, {
							cidr: "100.101.102.0/24",
							gatewayIp: "100.101.102.1",
							name: "ddsub7",
							id: "d19x72e45-bba3-4b57-8ffd-8dgrrty67879",
							router_id: "444444444444444444444444"
						}]
					}, {
						id: "2c95f243-50f7-4813-9482-3356566179c29",
						name: "network00555",
						vlanId: 2008,
						subnets: [{
							cidr: "77.88.99.0/24",
							gatewayIp: "77.88.99.1",
							name: "ddsub888",
							id: "d1972e45-bba3-4b57-8ffd-8waeweeew75",
							router_id: "444444444444444444444444"
						}, {
							cidr: "188.78.78.0/24",
							gatewayIp: "188.78.78.1",
							name: "ddsub999",
							id: "d19x72e45-bba3-4b57-8ffd-8sefertr68",
							router_id: "333333333333333333333333"
						}]
					}]
				}, {
					id: 111,
					name: "external_net1",
					cidr: ["191.121.20.5/24"],
					router: [{
						name: "router-1",
						id: "111111111111111111111111",
						gateway: "191.121.20.1",
						firewall: {
							name: "firewall1",
							firewall_id: "24353dsdsds"
						}
					}, {
						name: "router-2",
						id: "222222222222222222222222",
						gateway: "191.121.20.1",
						firewall: {
							name: "firewall2",
							firewall_id: "24353dsdsds"
						}
					}, {
						name: "router-3",
						id: "333333333333333333333333",
						gateway: "191.121.20.1",
						firewall: {
							name: "firewall1",
							firewall_id: "24353dsdsds"
						}
					}, {
						name: "router-4",
						id: "444444444444444444444444",
						gateway: "194.121.20.1",
						firewall: {
							name: "firewall1",
							firewall_id: "24353dsdsds"
						}
					}],
					networks: [{
						id: "8aecf2ad-ff86-4f7a-bed1-29b1d2bf5c16",
						name: "network1001",
						vlanId: 2006,
						subnets: [{
							cidr: "78.78.78.0/24",
							gatewayIp: "78.78.78.1",
							name: "ddsub1",
							id: "d1972e45-bba3-4b57-8ffd-80891dd6b253",
							router_id: "111111111111111111111111"
						}, {
							cidr: "178.78.78.0/24",
							gatewayIp: "178.78.78.1",
							name: "ddsub2",
							id: "d19x72e45-bba3-4b57-8ffd-80891dd6b254",
							router_id: "222222222222222222222222"
						}]
					}, {
						id: "2c95f243-50f7-4813-9482-334626179c26",
						name: "network002",
						vlanId: 2007,
						subnets: [{
							cidr: "178.78.78.0/24",
							gatewayIp: "178.78.78.1",
							name: "ddsub3",
							id: "d19x72e45-bba3-4b57-8ffd-80891dd6b789",
							router_id: "222222222222222222222222"
						}]
					}, {
						id: "2c95f243-50f7-4813-9482-334626179c27",
						name: "network003",
						vlanId: 2008,
						subnets: [{
							cidr: "192.168.22.0/24",
							gatewayIp: "192.168.22.1",
							name: "ddsub4",
							id: "d1972e45-bba3-4b57-8ffd-80891dd6b568",
							router_id: "111111111111111111111111"
						}, {
							cidr: "190.78.78.0/24",
							gatewayIp: "190.78.78.1",
							name: "ddsub5",
							id: "d19x72e45-bba3-4b57-8ffd-80891dd6b787",
							router_id: ""
						}]
					}, {
						id: "2c95f243-50f7-4813-9482-33462617er28",
						name: "net444444",
						vlanId: 2009,
						subnets: [{
							cidr: "11.22.33.0/24",
							gatewayIp: "11.22.33.1",
							name: "ddsub6",
							id: "d1972e45-bba3-4b57-8ffd-ert5hbgfh6767",
							router_id: "333333333333333333333333"
						}, {
							cidr: "100.101.102.0/24",
							gatewayIp: "100.101.102.1",
							name: "ddsub7",
							id: "d19x72e45-bba3-4b57-8ffd-8dgrrty67879",
							router_id: "444444444444444444444444"
						}]
					}, {
						id: "2c95f243-50f7-4813-9482-3356566179c29",
						name: "network00555",
						vlanId: 2008,
						subnets: [{
							cidr: "77.88.99.0/24",
							gatewayIp: "77.88.99.1",
							name: "ddsub888",
							id: "d1972e45-bba3-4b57-8ffd-8waeweeew75",
							router_id: "444444444444444444444444"
						}, {
							cidr: "188.78.78.0/24",
							gatewayIp: "188.78.78.1",
							name: "ddsub999",
							id: "d19x72e45-bba3-4b57-8ffd-8sefertr68",
							router_id: "333333333333333333333333"
						}]
					}]
				}],
				vm: [{
					id: "23e43rsdsd23345",
					name: "vm-1111111111111111111111",
					subnetsId: [
						"d1972e45-bba3-4b57-8ffd-80891dd6b253",
						"d19x72e45-bba3-4b57-8ffd-80891dd6b254"
					],
				}, {
					id: "232dsdsd2q42354",
					name: "vm-2",
					subnetsId: [
						"d1972e45-bba3-4b57-8ffd-80891dd6b253",
						"d19x72e45-bba3-4b57-8ffd-80891dd6b254",
						"d19x72e45-bba3-4b57-8ffd-80891dd6b789"
					],
				}, {
					id: "2325fergh6fdg5",
					name: "vm-3",
					subnetsId: [
						"d1972e45-bba3-4b57-8ffd-80891dd6b253",
						"d1972e45-bba3-4b57-8ffd-80891dd6b568"
					],
				}, {
					id: "232ersggjnlk34",
					name: "vm-4",
					subnetsId: [
						"d1972e45-bba3-4b57-8ffd-80891dd6b253",
						"d19x72e45-bba3-4b57-8ffd-80891dd6b258"
					],
				}, {
					id: "2325fdwrw4y56u65",
					name: "vm-5",
					subnetsId: [
						"d1972e45-bba3-4b57-8ffd-80891dd6b568",
						"d19x72e45-bba3-4b57-8ffd-5656uyj9898"
					],
				}, {
					id: "23235ey5u56udr4",
					name: "vm-6",
					subnetsId: [
						"d1972e45-bba3-4b57-8ffd-80891dd6b253",
						"d19x72e45-bba3-4b57-8ffd-80891dd6b787"
					],
				}, {
					id: "2323erter4tererst",
					name: "vm-7",
					subnetsId: [
						"d1972e45-bba3-4b57-8ffd-80891dd6b253",
						"d19x72e45-bba3-4b57-8ffd-80891dd6b787",
						"d1972e45-bba3-4b57-8ffd-80891dd6b568",
						"d19x72e45-bba3-4b57-8ffd-5656uyj9898"
					],
				}, {
					id: "232ersgeregjnlk34",
					name: "vm-8",
					subnetsId: [
						"d1972e45-bba3-4b57-8ffd-80891dd6b253",
						"d19x72e45-bba3-4b57-8ffd-80891dd6b258"
					],
				}, {
					id: "2325rr4fdwrw4y56u65",
					name: "vm-9",
					subnetsId: [
						"d1972e45-bba3-4b57-8ffd-80891dd6b568",
						"d19x72e45-bba3-4b57-8ffd-5656uyj9898",
						"d19x72e45-bba3-4b57-8ffd-8sefertr68"
					],
				}, {
					id: "2323ewew5ey5u56udr4",
					name: "vm-10",
					subnetsId: [
						"d1972e45-bba3-4b57-8ffd-80891dd6b253",
						"d19x72e45-bba3-4b57-8ffd-80891dd6b787"
					],
				}],
				sharedNet: [],
				sharedExnet: []

			};
			return testData;
		}
	};
}

netTopoSrv.$inject = ["$http"];