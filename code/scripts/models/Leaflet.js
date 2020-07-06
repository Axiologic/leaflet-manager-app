import Utils from "./Utils.js";

export default class Leaflet {
	name;
	productId;
	activeSubstances;
	recommendations;
	contraindication;
	country;
	healthAuthority;
	attachment = "/resources/images/default.png";
	dsuKeySSI;
	id = Utils.generateID(10);

	constructor(leaflet) {
		if(typeof leaflet !== undefined){
			for(let prop in leaflet){
				this[prop] = leaflet[prop];
			}
		}
	}

	validate(){
		const errors = [];

		if (!this.attachment) {
			errors.push('Leaflet attachment is required.');
		}

		return errors.length === 0 ? true : errors;
	}
}