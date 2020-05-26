import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";

export default class ProductsController extends ContainerController {
	constructor(element, history) {
		super(element);
		let self = this;

		this.setModel({});

		this.model.addExpression('productsListLoaded', function () {
			console.log("Expression checking", typeof self.model.products !== "undefined");
			return typeof self.model.products !== "undefined";
		}, 'products');

		console.log("Preparing to set up the view model");
		this.DSUStorage.getItem("/data/products.json", "json", function(err, productsRepo){
			if(err){
				//todo: implement better error handling
				//throw err;
			}

			if(typeof productsRepo === "undefined"){
				return self.model.products = [];
			}

			self.model.products = productsRepo.products;
		});

		this.on("add-product", (event)=>{
			history.push("/manage-product");
		});

		this.on("edit-product", (event)=>{
			console.log("Caught event", event);
			let target = event.target;
			let targetLabel = target.getAttribute("label");
			const regex = /[\d]+/gm;
			const index = regex.exec(targetLabel);

			history.push({
				pathname: '/manage-product',
				state: {
					productIndex: Array.isArray(index) ? index[0] : index
				}
			});
		}, {capture: true});

		this.on("view-drug", (event)=>{
			history.push("/drug-details");
		});

		this.on('openFeedback', (e) => {
			this.feedbackEmitter = e.detail;
		});
	}
}