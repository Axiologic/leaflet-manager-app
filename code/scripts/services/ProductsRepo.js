class ProductsRepo {
	constructor() {
		const pskCommunicationNodeAddrs = ["http://localhost:8080/"];
		const se = require("swarm-engine");
		se.initialise();
		const powerCord = new se.SmartRemoteChannelPowerCord(pskCommunicationNodeAddrs);
		$$.swarmEngine.plug("*", powerCord);
	}

	add(product, callback) {
		$$.interactions.startSwarmAs("demo/agent/system", "ProductsManagement", "add", product.name, product.serialNumber, "/resources/images/drug.png").onReturn((err, result) => {
			if (err) {
				return callback(err);
			}
			callback(undefined, result);
		});
	}

	getProducts(callback) {
		$$.interactions.startSwarmAs("demo/agent/system", "ProductsManagement", "getProductsList").onReturn(callback);
	}
}

export default new ProductsRepo();