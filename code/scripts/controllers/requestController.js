import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";
import Utils from "./utils.js";
import Contact from "../models/Contact.js";

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
            const options = [];
            leafletsRepo.forEach((leaflet, index)=>{
                options.push({label: leaflet.name, value: index});
            });
            this.model.setChainValue("leaflets.options", options);
        });

        this.DSUStorage.getObject(CONTACTS_PATH, (err, contacts) => {
            if (typeof contacts === "undefined") {
                contacts = [];
            }
            this.contacts = contacts;
            const options = [];
            contacts.forEach(contact => options.push(new Contact(contact).generateViewModel()));
            this.model.setChainValue("contacts.options", options);
        });

        this.on('openFeedback', (e) => {
            this.feedbackEmitter = e.detail;
        });

        this.on("send-leaflet", (event) => {
            this.DSUStorage.getObject(PROFILE_PATH, (err, profile) => {

                Utils.initializeSwarmEnvironment()

                let leaflet = this.leafletsRepo[0];
                leaflet.healthAuthority = this.contacts[0].code;

                $$.interactions.startSwarmAs(Utils.getIdentity(), "dossierBuilder", "createLeafletDossier", leaflet).onReturn((err, seed) => {
                    console.log("=======================================================================");
                    console.log("Leaflet DSU created", err, seed);
                    console.log("=======================================================================");
                    let newEvent = new Event("send-leaflet");
                    newEvent.data = {
                        leaflet,
                        source: profile.code,
                        target: leaflet.healthAuthority,
                        dsu: seed
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