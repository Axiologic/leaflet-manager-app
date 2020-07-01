import Utils from "./Utils.js";
export default class Message {
    shortHtml;
    longHtml;
    title;
    dsu;
    to;
    from;

    constructor(message) {
        if (typeof message !== undefined) {
            for (let prop in message) {
                this[prop] = message[prop];
            }
        }

        if (typeof this.id === "undefined") {
            this.id = Utils.generateID(20);
        }
    }

    getApprovalMessage(leaflet) {
        this.title = `${leaflet.name} approval request`;
        this.shortHtml = "Please review the attached leaflet and act accordingly";
        this.to = leaflet.healthAuthority;
        return this;
    }
}