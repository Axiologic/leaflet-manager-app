export default class Contact {
    logo = '/assets/images/default-logo.png';
    name;
    country;
    code;

    constructor(contact) {
        if (typeof contact !== undefined) {
            for (let prop in contact) {
                this[prop] = contact[prop];
            }
        }
    }

    validate() {
        const errors = [];
        if (!this.name) {
            errors.push('Organization is required.');
        }

        if (!this.country) {
            errors.push('Country is required.');
        }

        return errors.length === 0 ? true : errors;
    }

    generateViewModel() {
        return {label: this.name, value: this.code};
    }
}