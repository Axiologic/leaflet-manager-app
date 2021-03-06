import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";
import Product from "../models/Product.js";

const PRODUCTS_PATH = "/app/data/products.json";

export default class newProductController extends ContainerController {
    constructor(element, history) {
        super(element);

        this.setModel({});
        if (typeof history.location.state !== "undefined") {
            this.productIndex = history.location.state.productIndex;
        }
        if (typeof this.productIndex !== "undefined") {
            this.DSUStorage.getObject(PRODUCTS_PATH, (err, products) => {
                if (err) {
                    throw err;
                }

                this.model.product = new Product(products[this.productIndex]);
            });
        } else {
            this.model.product = new Product();
        }

        this.on("package-photo-selected", (event) => {
            this.packagePhoto = event.data;
        });

        this.on('openFeedback', (e) => {
            this.feedbackEmitter = e.detail;
        });

        this.on("add-product", (event) => {
            let product = this.model.product;
            let validationResult = product.validate();
            if (Array.isArray(validationResult)) {
                for (let i = 0; i < validationResult.length; i++) {
                    let err = validationResult[i];
                    this.showError(err);
                }
                return;
            }

            if (typeof this.packagePhoto !== "undefined") {
                let productImagePath = `/data/photos/${product.name}/image.png`;
                this.DSUStorage.setItem(productImagePath, this.packagePhoto, (err) => {
                    if (err) {
                        return this.showError(err, "Product photo upload failed.");
                    }

                    product.photo = "/download" + productImagePath;
                    this.persistProduct(product, (err) => {
                        if (err) {
                            this.showError(err, "Product add process failed.");
                            return;
                        }

                        history.push("/products");
                    });
                });
            } else {
                this.persistProduct(product, (err) => {
                    if (err) {
                        this.showError(err, "Product add process failed.");
                        return;
                    }

                    history.push("/products");
                });
            }
        });
    }

    persistProduct(product, callback) {
        this.DSUStorage.getItem(PRODUCTS_PATH, 'json', (err, products) => {
            if (err) {
                // if no products file found an error will be captured here
                //todo: improve error handling here
            }

            if (typeof products === "undefined") {
                products = [];
            }

            if (typeof this.productIndex !== "undefined") {
                products.splice(this.productIndex, 1);
            } else {
                const prod = products.find(prod => prod.name === product.name);
                if (typeof prod !== "undefined") {
                    return callback(new Error("Product already exists into the list!"));
                }
            }

            products.push(product);
            this.DSUStorage.setItem(PRODUCTS_PATH, JSON.stringify(products), callback);
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