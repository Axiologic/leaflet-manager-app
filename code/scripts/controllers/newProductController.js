import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";
import ProductsRepo from "../services/ProductsRepo.js";

export default class newProductsController extends ContainerController {
	constructor(element, history) {
		super(element);
		console.log("Preparing to set up the view model");
		let viewModel = {
			AddProductBtn:{
				label: "Add product",
				eventName: "add-product"
			},
			edit:{
				name:{
					label: "Name",
				},
				serialNumber:{
					label: "Product Type Serial Number"
				}
			}
		}

		this.model = this.setModel(viewModel);

		this.on("add-product", (event)=>{
			console.log("Caught event", event);
			let product = {
				name: this.model.edit.name.value,
				serialNumber: this.model.edit.serialNumber.value
			};
			ProductsRepo.add(product, (err, result)=>{
				if(err){
					throw err;
				}
				history.push("/products");
			});
		}, {capture: true});
	}
}