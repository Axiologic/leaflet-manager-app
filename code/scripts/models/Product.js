function generateProductCode(length) {
	var result           = '';
	var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charactersLength = characters.length;
	for ( var i = 0; i < length; i++ ) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

export default class Product {
	name = "";
	productTypeSerialNumber = "";
	photo = "/assets/images/default.png";
	serialNumber = generateProductCode(10);

	constructor(product) {
		if(typeof product !== undefined){
			for(let prop in product){
				this[prop] = product[prop];
			}
		}
	}

	validate(){
		const errors = [];
		if (!this.name) {
			errors.push('Name is required.');
		}

		if (!this.productTypeSerialNumber) {
			errors.push('Product Type Serial Number is required.');
		}

		return errors.length === 0 ? true : errors;
	}
}