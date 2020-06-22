import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";
import Leaflet from "../models/Leaflet.js";
const productsPath = "/app/data/products.json";
const leafletsPath = "/app/data/leaflets.json";

export default class newLeafletController extends ContainerController {
	constructor(element, history) {
		super(element);

		this.setModel({});
		if(typeof history.location.state !== "undefined"){
			this.leafletIndex = history.location.state.leafletIndex;
		}
		if(typeof this.leafletIndex !== "undefined"){
			this.DSUStorage.getItem(leafletsPath, "json", (err, leafletsRepo)=>{
				if(err){
					throw err;
				}

				this.model.leaflet = new Leaflet(leafletsRepo.leaflets[this.leafletIndex]);
			});
		}else{
			this.model.leaflet = new Leaflet();
		}

		this.DSUStorage.getItem(productsPath, "json", (err, productsRepo)=>{
			if(err){
				throw err;
			}

			let availableProducts = [];
			for(let i=0; i<productsRepo.products.length; i++){
				let product = productsRepo.products[i];
				availableProducts.push({
					label: product.name,
					value: product.serialNumber
				});
			}
			this.model.products = {
				label: "Products",
				placeholder: "select product",
				options: availableProducts
			};
		});


		this.model.contacts = {
			label: "Health Authority",
			placeholder: "select",
			options: [
				{
					label: "Food and Drug Administration",
					value: "FDA"
				},
				{
					label: "National Institute of Health",
					value: "NIH"
				}]
		};

		this.on("attachment-selected", (event)=>{
			this.model.attachment = event.data[0];
		});

		this.on('openFeedback', (e) => {
			this.feedbackEmitter = e.detail;
		});

		this.on("add-leaflet", (event)=>{
			let leaflet = this.model.leaflet;
			let validationResult = leaflet.validate();
			if(Array.isArray(validationResult)){
				for(let i = 0; i<validationResult.length; i++){
					let err = validationResult[i];
					this.showError(err);
				}
				return;
			}

			if(typeof this.packagePhoto !== "undefined"){
				let leafletImagePath = `/data/photos/${leaflet.name}/image.png`;
				this.DSUStorage.setItem(leafletImagePath, this.packagePhoto, (err)=>{
					if(err){
						return this.showError(err, "Leaflet photo upload failed.");
					}

					leaflet.photo = "/download"+leafletImagePath;
					for(let i=0; i<this.model.products.options.length; i++){
						let prod = this.model.products.options[i];
						if(prod.value === leaflet.productId){
							leaflet.name = `${prod.label}(${leaflet.country})`;
							break;
						}
					}
					this.persistLeaflet(leaflet, (err)=>{
						if(err){
							this.showError(err, "Leaflet add process failed.");
							return;
						}

						history.push("/leaflets");
					});
				});
			}else{
				this.persistLeaflet(leaflet, (err)=>{
					if(err){
						this.showError(err, "Leaflet add process failed.");
						return;
					}

					history.push("/leaflets");
				});
			}
		});
	}

	persistLeaflet(leaflet, callback){
		this.DSUStorage.getItem(leafletsPath, 'json', (err, leafletsRepo)=>{
			if(err){
				// if no leaflets file found an error will be captured here
				//todo: improve error handling here
			}

			if(typeof leafletsRepo === "undefined"){
				leafletsRepo = {leaflets: []};
			}


			if(typeof this.leafletIndex !== "undefined"){
				//update of a leaflet scenario
				leafletsRepo.leaflets.splice(this.leafletIndex, 1);
			}else{
				for(let i=0; i<leafletsRepo.leaflets.length; i++){
					let prod = leafletsRepo.leaflets[i];
					if(prod.name === leaflet.name && prod.leafletTypeSerialNumber === leaflet.leafletTypeSerialNumber){
						return callback(new Error("Leaflet already exists into the list!"));
					}
				}
			}

			leafletsRepo.leaflets.push(leaflet);
			this.DSUStorage.setItem(leafletsPath, JSON.stringify(leafletsRepo), callback);
		});
	}

	showError(err, title, type) {
		let errMessage;
		title = title ? title : 'Validation Error';
		type = type ? type : 'alert-danger';

		if (err instanceof Error) {
			errMessage = err.message;
		} else if (typeof err === 'object') {
			errMessage = err.toString();
		} else {
			errMessage = err;
		}
		this.feedbackEmitter(errMessage, title, type);
	}
}