var ipSrvModule = angular.module("ipSrvModule", []);
ipSrvModule.service('ipSrv', [function() {
	let ipSrv = {};
	/**
	 * 获取子网IP地址池起止范围
	 * @param cidr
	 * @returns []
	 * @author:daijing
	 */
	ipSrv.getIPZone = function(cidr) { //'0.0.0.0/1'
		let ipDetailObj = _IP.cidrSubnet(cidr);
		let minUintIp = _IP.toLong(ipDetailObj.firstAddress) + 1; //去除第一个网关IP
		let maxUnitIp = _IP.toLong(ipDetailObj.lastAddress);
		return [minUintIp, maxUnitIp]; //[2, 2147483646]
	};

	/**
	 * 获取子网所有IP地址池起止范围
	 * @param allocationPools
	 * @returns {[]}
	 * @author:daijing
	 */
	ipSrv.getIpPoolsZone = function(allocationPools) {
		let pools = {};
		_.each(allocationPools, function(item, i) {
			pools[i] = [_IP.toLong(item.start), _IP.toLong(item.end)];
		});
		return pools; //返回所有IP池的IP范围
	};

	ipSrv.chkIpOverlapFunc = function(allocationPools) { //校验IP地址池是否交叉重叠
		let targetNetOverlap = false;
		let startArr = [];
		let endArr = [];
		allocationPools.forEach(function(item) {
			startArr.push(_IP.toLong(item.start));
			endArr.push(_IP.toLong(item.end));
		});
		let startSortArr = startArr.sort(function(a, b) {
			return a - b
		});
		let endSortArr = endArr.sort(function(a, b) {
			return a - b
		});
		for (var k = 1; k < startSortArr.length; k++) {
			if (startSortArr[k] <= endSortArr[k - 1]) {
				targetNetOverlap = true;
				break;
			}
		}
		return targetNetOverlap;
	};

	ipSrv.checkIpInPool = function(allocationPools, ip) { //校验IP地址池中是否含有网关IP(校验IP池中是否含有某个IP)
		let ipInPool = false;
		let poolsObj = ipSrv.getIpPoolsZone(allocationPools);
		for (let key in poolsObj) {
			if (_IP.toLong(ip) >= poolsObj[key][0] && _IP.toLong(ip) <= poolsObj[key][1]) {
				ipInPool = true;
				break;
			}
		}
		return ipInPool;
	};

	ipSrv.checkIpInCidr = function(subCidr, allocationPools) { //校验IP地址池中的IP是否在子网的cidr内
		let poolBoundaryIpSet = [];
		let ipNotInCidr = false;
		_.each(allocationPools, function(item) {
			poolBoundaryIpSet.push(item.start);
			poolBoundaryIpSet.push(item.end);
		});
		for (let i = 0; i < poolBoundaryIpSet.length; i++) {
			if (!_IP.cidrSubnet(subCidr).contains(poolBoundaryIpSet[i])) {
				ipNotInCidr = true;
				break;
			}
		}
		return ipNotInCidr;
	};

	ipSrv.checkGtIp = function(allocationPools) { //校验IP地址池中的结束IP必须大于起始IP
		let startIpgtEndIp = false;
		for (let i = 0; i < allocationPools.length; i++) {
			if (_IP.toLong(allocationPools[i].start) >= _IP.toLong(allocationPools[i].end)) {
				startIpgtEndIp = true;
				break;
			}
		}
		return startIpgtEndIp;
	};

	ipSrv.checkPoolRange = function(prePool, newPool) { //校验IP池范围，需要限制不能变小，以防止将已分配出去的IP地址，从IP地址池中删除
		let poolNarrow = false;
		for (let i = 0; i < prePool.length; i++) {
			if (_IP.toLong(newPool[i].start) > _IP.toLong(prePool[i].start) || _IP.toLong(newPool[i].end) < _IP.toLong(prePool[i].end)) {
				poolNarrow = true;
				break;
			}
		}
		return poolNarrow;
	};

	ipSrv.isInV6Cidr=function(cidr,range){
        var range=_IPAddr.parse(range);
        var inCidr=range.match(_IPAddr.parseCIDR(cidr));
        return inCidr;
	};
	return ipSrv;
}])