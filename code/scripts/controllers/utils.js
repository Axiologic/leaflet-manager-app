const initializeSwarmEnvironment = function(identity){

	if(typeof identity === "undefined"){
		identity = getIdentity();
	}

	//test if swarm engine already initialized
	if (typeof $$.interactions === "undefined") {

		//test if callflow already initialized
		if(typeof $$.flow === "undefined"){
			require('callflow').initialise();
		}

		const se = require("swarm-engine");
		se.initialise(identity);

		ensureConnectionForIdentity(identity);
	}else{
		//already initialized ... let's try to connect pc for identity
		ensureConnectionForIdentity(identity);
	}
}

const ensureConnectionForIdentity = function(identity){
	const se = require("swarm-engine");
	const SRPC = se.SmartRemoteChannelPowerCord;
	let swUrl = window.location.origin;
	if(!swUrl.endsWith("/")){
		swUrl += "/";
	}
	const powerCord = new SRPC([swUrl]);
	try{
		$$.swarmEngine.plug(identity, powerCord);
	}catch(err){
		//if err caught... pc for identity already connected
	}
}

const getIdentity = function(){
	return "demo/agent/007";
}

export default {
	initializeSwarmEnvironment,
	ensureConnectionForIdentity,
	getIdentity
}