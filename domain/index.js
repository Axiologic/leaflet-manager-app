//Add specific code here (swarms, flows, assets, transactions)
$$.swarm.describe("dossierBuilder", {
    createLeafletDossier: function (leaflet, constitutionSeed) {
        require("edfs").attachWithSeed(rawDossier.getSeed(), (err, edfs) => {
            console.log("Got edfs instance");
            if (err) {
                return this.return(err);
            }
            edfs.createRawDossier((err, dossier) => {
                if (err) {
                    return this.return(err);
                }
                console.log("created raw dossier");
                console.log("About to read attachment", leaflet.attachment);
                rawDossier.readFile(leaflet.attachment, (err, attachmentData) => {
                    if (err) {
                        console.log(err);
                        return this.return(err);
                    }

                    console.log("Read attachment data", attachmentData);
                    dossier.writeFile("/attachment.png", attachmentData, (err) => {
                        if (err) {
                            return this.return(err);
                        }
                        console.log("wrote attachment to dossier");
                        dossier.writeFile("/leaflet.json", JSON.stringify(leaflet), (err) => {
                            if (err) {
                                return this.return(err);
                            }
                            console.log("Wrote leaflet.json");

                            dossier.mount("/code", constitutionSeed, (err) => {
                                this.return(err, dossier.getSeed());
                            });
                        });
                    });
                });
            });
        });
    },
    createMessageDSU: function (message, leafletDSUSeed) {
        require("edfs").attachWithSeed(rawDossier.getSeed(), (err, edfs) => {
            console.log("Got edfs instance");
            if (err) {
                return this.return(err);
            }
            edfs.createRawDossier((err, dossier) => {
                if (err) {
                    return this.return(err);
                }
                console.log("created raw dossier");

                dossier.writeFile("/message.json", JSON.stringify(message), (err) => {
                    console.log("Wrote leaflet.json");
                    if (err) {
                        return this.return(err);
                    }

                    dossier.mount("/leaflet", leafletDSUSeed, (err) => {
                        console.log("Mounted leaflet DSU");
                        this.return(err, dossier.getSeed());
                    });
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

