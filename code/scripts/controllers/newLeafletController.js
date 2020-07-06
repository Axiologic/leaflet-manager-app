import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";
import Utils from "./utils.js";

//models
import Leaflet from "../models/Leaflet.js";
import Product from "../models/Product.js";
import Message from "../models/Message.js";

//working paths for different storage files
const PRODUCTS_PATH = "/app/data/products.json";
const PROFILE_PATH = "/app/data/profile.json";
const LEAFLETS_PATH = "/app/data/leaflets.json";

export default class newLeafletController extends ContainerController {
    constructor(element, history) {
        super(element);

        this.setModel({
            products: {
                label: "Products",
                placeholder: "Select a product"
            }
        });

        if (typeof history.location.state !== "undefined") {
            this.leafletIndex = history.location.state.leafletIndex;
        }

        if (typeof this.leafletIndex !== "undefined") {
            this.DSUStorage.getObject(LEAFLETS_PATH, (err, leaflets) => {
                if (err) {
                    throw err;
                }

                this.model.leaflet = new Leaflet(leaflets[this.leafletIndex]);

            });
        } else {
            this.model.leaflet = new Leaflet();
        }

        this.DSUStorage.getObject(PRODUCTS_PATH, (err, products) => {
            if (err) {
                throw err;
            }

            let availableProducts = [];
            products.forEach(product => availableProducts.push(new Product(product).generateViewModel()));
            this.model.setChainValue("products.options", availableProducts);
        });

        this.on("attachment-selected", (event) => {
            this.attachment = event.data[0];
            this.model.attachment = event.data[0];
        });

        this.on('openFeedback', (e) => {
            this.feedbackEmitter = e.detail;
        });

        this.on("send-leaflet", (event) => {
            this.DSUStorage.getObject(PROFILE_PATH, (err, profile) => {
                let newEvent = new Event("send-leaflet");
                this.persistLeaflet(this.model.leaflet, (err) => {

                    Utils.initializeSwarmEnvironment();
                    $$.interactions.startSwarmAs(Utils.getIdentity(), "dossierBuilder", "createLeafletDossier", this.model.leaflet).onReturn((err, seed) => {
                        const message = new Message().getApprovalMessage(this.model.leaflet);
                        message.from = profile.code;
                        message.dsu = seed;
                        this.buildMessageDSU(message, (err, messageDSUSeed) => {
                            newEvent.data = messageDSUSeed;
                            window.parent.dispatchEvent(newEvent);
                        });
                    });
                });
            });
        }, {capture: true});

        this.on("add-leaflet", (event) => {
            this.saveLeaflet(history);
        });
    }

    saveLeaflet(history) {
        let leaflet = this.model.leaflet;
        let validationResult = leaflet.validate();
        if (Array.isArray(validationResult)) {
            for (let i = 0; i < validationResult.length; i++) {
                let err = validationResult[i];
                this.showError(err);
            }
            return;
        }

        if (typeof this.packagePhoto !== "undefined") {
            let leafletImagePath = `/data/photos/${leaflet.name}/image.png`;
            this.DSUStorage.setItem(leafletImagePath, this.packagePhoto, (err) => {
                if (err) {
                    return this.showError(err, "Leaflet photo upload failed.");
                }

                leaflet.photo = "/download" + leafletImagePath;

                this.persistLeaflet(leaflet, (err) => {
                    if (err) {
                        this.showError(err, "Leaflet add process failed.");
                        return;
                    }

                    history.push("/leaflets");
                });
            });
        } else {
            this.persistLeaflet(leaflet, (err) => {
                if (err) {
                    this.showError(err, "Leaflet add process failed.");
                    return;
                }

                history.push("/leaflets");
            });
        }
    }

    persistLeaflet(leaflet, callback) {
        leaflet.name = this.model.products.options.find(availableProduct => availableProduct.value === leaflet.productId).label;

        this.DSUStorage.getObject(LEAFLETS_PATH, (err, leaflets) => {
            if (err) {
                // if no leaflets file found an error will be captured here
                //todo: improve error handling here
            }

            if (typeof leaflets === "undefined") {
                leaflets = [];
            }

            if (typeof this.leafletIndex !== "undefined") {
                //update of a leaflet scenario
                leaflets.splice(this.leafletIndex, 1);
            } else {
                let existingLeaflet = leaflets.find(l => l.name === leaflet.name && l.id === leaflet.id);
                if (typeof existingLeaflet !== "undefined") {
                    return callback(new Error("Leaflet already exists into the list!"));
                }
            }

            this.DSUStorage.setItem(`/app/data/${leaflet.id}/attachment.pdf`, this.attachment, (err) => {
                leaflet.attachment = `/app/data/${leaflet.id}/attachment.pdf`;
                leaflets.push(leaflet);
                this.DSUStorage.setItem(LEAFLETS_PATH, JSON.stringify(leaflets), callback);
            });
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