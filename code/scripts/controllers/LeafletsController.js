import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";
const LEAFLETS_PATH = "/app/data/leaflets.json";

export default class LeafletsController extends ContainerController {
	constructor(element, history) {
		super(element);

		this.setModel({});

		this.model.addExpression('leafletsListLoaded', () => {
			return typeof this.model.leaflets !== "undefined";
		}, 'leaflets');

		this.DSUStorage.getObject(LEAFLETS_PATH,  (err, leaflets) => {
			if(err){
				//todo: implement better error handling
				//throw err;
			}

			if(typeof leaflets === "undefined"){
				return this.model.leaflets = [];
			}

			this.model.leaflets = leaflets;
		});

		this.on("add-leaflet", (event)=>{
			history.push("/manage-leaflet");
		});

		this.on('copy-leaflet-dsu', (event)=>{
			let target = event.target;
			let targetName = target.getAttribute("name");

			let found = false;
			for(let i=0; i<this.model.leaflets.length; i++){
				if(this.model.leaflets[i].name === targetName){
					found = this.model.leaflets[i];
				}
			}
		}, {capture: true});

		this.on("edit-leaflet", (event)=>{
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

		this.on('openFeedback', (e) => {
			this.feedbackEmitter = e.detail;
		});
	}
}