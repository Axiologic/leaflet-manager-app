import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";
import ProductsRepo from "../services/ProductsRepo.js";

export default class ProductsController extends ContainerController {
	constructor(element, history) {
		super(element);
		console.log("Preparing to set up the view model");
		let viewModel = {
			AddProductBtn:{
				label: "Add product",
				eventName: "add-product"
			}
		}
		this.model = this.setModel(viewModel);
		let self = this;

		this.model.addExpression('productsListLoaded', function () {
			console.log("Expression checking", typeof self.model.products !== "undefined");
			return typeof self.model.products !== "undefined";
		}, 'products');

		ProductsRepo.getProducts(function (err, products){
			self.model.products = products;
		});

		this.on("add-product", (event)=>{
			history.push("/add-product");
		});

		this.on("view-drug", (event)=>{
			history.push("/drug-details");
		}, {capture: true});
	}
}