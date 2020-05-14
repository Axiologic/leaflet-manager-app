//Add specific code here (swarms, flows, assets, transactions)
let products = [];
$$.swarms.describe("ProductsManagement", {
	add: function(name, serialNumber, photo){
		products.push({name, serialNumber, photo});
		this.return(undefined, products.length);
	},
	getProductsList: function(){
		this.return(undefined, products);
	}
});

console.log("Leaflet manager app swarm installed");