function generateProductCode(length) {
	let result           = '';
	let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let charactersLength = characters.length;
	for ( let i = 0; i < length; i++ ) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

export default class Leaflet {
	name;
	productId;
	activeSubstances;
	recommendations;
	contraindication;
	country;
	healthAuthority;
	attachment = "/resources/images/default.png";
	id = generateProductCode(10);

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