const DOSSIER_SEED_FILE_PATH = "./seed";
const BRICK_STORAGE_PORT = process.env.BRICK_STORAGE_PORT || 8080;
const BRICK_STORAGE_ENDPOINT = `http://127.0.0.1:${BRICK_STORAGE_PORT}`;

require("./../../privatesky/psknode/bundles/csbBoot.js");
require("./../../privatesky/psknode/bundles/edfsBar.js");
const fs = require("fs");
const EDFS = require("edfs");

const edfs = EDFS.attachToEndpoint(BRICK_STORAGE_ENDPOINT);

function storeSeed(seed_path, seed, callback) {
	fs.writeFile(seed_path, seed, (err) => {
		return callback(err, seed);
	});
}

function createWallet(callback) {
	const bar = edfs.createBar();
	updateWallet(bar, callback);
}

function updateWallet(bar, callback) {

	console.log("updating...");
	bar.delete("/", function(err){
		if(err){
			throw err;
		}

		bar.addFolder("code", "/", (err, archiveDigest) => {
			if (err) {
				return callback(err);
			}

			storeSeed(DOSSIER_SEED_FILE_PATH, bar.getSeed(), callback);
		});
	});
}

function build(callback) {
	fs.readFile(DOSSIER_SEED_FILE_PATH, (err, content) => {
		if (err || content.length === 0) {
			return createWallet(callback);
		}
		const bar = edfs.loadBar(content);
		updateWallet(bar, callback);
	});
}

build(function (err, seed) {
	if (err) {
		console.log(err);
		process.exit(1);
	}

	console.log("SSApp Seed:", seed);
});