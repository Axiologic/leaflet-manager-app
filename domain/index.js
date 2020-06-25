//Add specific code here (swarms, flows, assets, transactions)
$$.swarm.describe("dossierBuilder", {
    createLeafletDossier: function (leaflet) {
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

                    console.log("Read attachment data");
                    dossier.writeFile("/attachment.pdf", attachmentData, (err) => {
                        if (err) {
                            return this.return(err);
                        }
                        console.log("wrote attachment to dossier");
                        dossier.writeFile("/leaflet.json", JSON.stringify(leaflet), (err) => {
                            console.log("Wrote leaflet.json");
                            this.return(err, dossier.getSeed());
                        });
                    });
                });
            });
        });
    }
});