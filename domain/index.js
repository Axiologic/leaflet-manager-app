//Add specific code here (swarms, flows, assets, transactions)
function initializeBDNS(callback) {
    rawDossier.getKeySSI((err, keySSI) => {
        if (err) {
            return callback(err);
        }

        const keySSIInstance = require("key-ssi-resolver").KeySSIFactory.create(keySSI);
        $$.BDNS.addConfig("default", {
            endpoints: [
                {
                    endpoint: keySSIInstance.getHint(),
                    type: 'brickStorage'
                },
                {
                    endpoint: keySSIInstance.getHint(),
                    type: 'anchorService'
                }
            ]
        })
        callback(undefined);
    });
}

$$.swarm.describe("dossierBuilder", {
    createLeafletDossier: function (leaflet) {
        const EDFS = require("edfs");
        initializeBDNS((err) => {
            if (err) {
                return this.return(err);
            }

            EDFS.createDSU("RawDossier", (err, dossier) => {
                if (err) {
                    return this.return(err);
                }

                rawDossier.readFile(leaflet.attachment, (err, attachmentData) => {
                    if (err) {
                        console.log(err);
                        return this.return(err);
                    }

                    dossier.writeFile("/attachment.pdf", attachmentData, (err) => {
                        if (err) {
                            return this.return(err);
                        }

                        dossier.writeFile("/leaflet.json", JSON.stringify(leaflet), (err) => {
                            if (err) {
                                return this.return(err);
                            }

                            rawDossier.listMountedDossiers("/", (err, mounts) => {
                                if (err) {
                                    return this.return(err);
                                }

                                let constitutionSeed = mounts[0].identifier;
                                dossier.mount("/code", constitutionSeed, (err) => {
                                    if (err) {
                                        return this.return(err);
                                    }

                                    dossier.getKeySSI((err, keySSI) => {
                                        this.return(err, keySSI);
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    },
    createMessageDSU: function (message, leafletDSUKeySSI) {
        const EDFS = require("edfs");
        EDFS.createDSU("RawDossier", (err, dossier) => {
            if (err) {
                return this.return(err);
            }

            dossier.writeFile("/message.json", JSON.stringify(message), (err) => {
                if (err) {
                    return this.return(err);
                }

                dossier.mount("/leaflet", leafletDSUKeySSI, (err) => {
                    this.return(err, dossier.getSeed());
                });
            });
        });
    },
    getConstitutionSeed: function () {
        rawDossier.listMountedDossiers("/", (err, mounts) => {
            this.return(err, mounts[0].identifier);
        });
    }
});

