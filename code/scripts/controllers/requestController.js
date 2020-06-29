import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";
import Leaflet from "../models/Leaflet.js";
import Contact from "../models/Contact.js";
import Product from "../models/Product.js";
import DossierBuilder from "../services/DossierBuilder.js";

const PRODUCTS_PATH = "/app/data/products.json";
const PROFILE_PATH = "/app/data/profile.json";
const CONTACTS_PATH = "/app/data/contacts.json";
const LEAFLETS_PATH = "/app/data/leaflets.json";

export default class requestController extends ContainerController {
    constructor(element, history) {
        super(element);

        this.setModel({
            leaflets: {
                label: "Leaflets",
                placeholder: "Select a leaflet",
                options: []
            }, contacts: {
                label: "Health Authority",
                placeholder: "Select a health authority"
            }
        });

        this.DSUStorage.getObject(LEAFLETS_PATH, (err, leafletsRepo) => {
            if (err) {
                throw err;
            }

            this.leafletsRepo = leafletsRepo;

            leafletsRepo.forEach((leaflet, index)=>{
                this.model.leaflets.options.push({label: leaflet.name, value: index});
            });

        });

        this.DSUStorage.getObject(CONTACTS_PATH, (err, contacts) => {
            if (typeof contacts === "undefined") {
                contacts = [];
            }
            this.contacts = contacts;
            const options = [];
            contacts.forEach(contact => options.push(new Contact(contact).generateViewModel()));
            this.model.contacts.options = options;
        });

        this.on('openFeedback', (e) => {
            this.feedbackEmitter = e.detail;
        });

        this.on("send-leaflet", (event) => {
            this.DSUStorage.getObject(PROFILE_PATH, (err, profile) => {
                let newEvent = new Event("send-leaflet");

                if (typeof $$.interactions === "undefined") {
                    require('callflow').initialise();
                    const se = require("swarm-engine");
                    const identity = "test/agent/007";
                    se.initialise(identity);
                    const SRPC = se.SmartRemoteChannelPowerCord;
                    let swUrl = "http://localhost:8080/";
                    const powerCord = new SRPC([swUrl]);
                    $$.swarmEngine.plug(identity, powerCord);
                }

                let leaflet = this.leafletsRepo[0];
                leaflet.healthAuthority = this.contacts[0].code;

                $$.interactions.startSwarmAs("test/agent/007", "dossierBuilder", "createLeafletDossier", leaflet).onReturn((err, seed) => {
                    console.log("=======================================================================");
                    console.log("Leaflet DSU created", err, seed);
                    console.log("=======================================================================");
                    newEvent.data = {
                        leaflet,
                        source: profile.code,
                        leafletSEED: seed
                    };
                    window.parent.dispatchEvent(newEvent);
                });
            });
        }, {capture: true});

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