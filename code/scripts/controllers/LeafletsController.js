import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";
const leafletsPath = "/app/data/leaflets.json";
const productsPath = "/app/data/products.json";

export default class LeafletsController extends ContainerController {
	constructor(element, history) {
		super(element);
		let self = this;

		this.setModel({});

		this.model.addExpression('leafletsListLoaded', function () {
			console.log("Expression checking", typeof self.model.leaflets !== "undefined");
			return typeof self.model.leaflets !== "undefined";
		}, 'leaflets');

		console.log("Preparing to set up the view model");
		this.DSUStorage.getItem(leafletsPath, "json", function(err, leafletsRepo){
			if(err){
				//todo: implement better error handling
				//throw err;
			}

			if(typeof leafletsRepo === "undefined"){
				return self.model.leaflets = [];
			}

			self.model.leaflets = leafletsRepo.leaflets;
		});

		this.on("add-leaflet", (event)=>{
			history.push("/manage-leaflet");
		});

		this.on("edit-leaflet", (event)=>{
			console.log("Caught event", event);
			let target = event.target;
			let targetLabel = target.getAttribute("label");
			const regex = /[\d]+/gm;
			const index = regex.exec(targetLabel);

			history.push({
				pathname: '/manage-leaflet',
				state: {
					leafletIndex: Array.isArray(index) ? index[0] : index
				}
			});
		}, {capture: true});

/*		this.on("view-drug", (event)=>{
			history.push("/drug-details");
		});*/

		this.on('openFeedback', (e) => {
			this.feedbackEmitter = e.detail;
		});
	}
}