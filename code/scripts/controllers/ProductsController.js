import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";
const storagePath = "/app/data/products.json";

export default class ProductsController extends ContainerController {
	constructor(element, history) {
		super(element);
		this.setModel({});

		this.model.addExpression('productsListLoaded',  () => {
			return typeof this.model.products !== "undefined";
		}, 'products');

		console.log("Preparing to set up the view model");
		this.DSUStorage.getItem(storagePath, "json", (err, products) => {
			if(err){
				//todo: implement better error handling
				//throw err;
			}

			if(typeof products === "undefined"){
				return this.model.products = [];
			}

			this.model.products = products;
		});

		this.on("add-product", (event)=>{
			history.push("/manage-product");
		});

		this.on("edit-product", (event)=>{
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