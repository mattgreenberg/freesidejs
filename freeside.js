var http = require('http');

module.exports = (function(){

	var free = function(){
		this.hostname = "127.0.0.1";
		this.port = 8080;
		this.timeout = 15000;
	}

	// pack the method call request
	free.prototype.pack = function(methodName, params){

		var xml = '<?xml version="1.0" encoding="utf-8"?>';
		xml += '<methodCall><methodName>FS.ClientAPI_XMLRPC.';
		xml += methodName + '</methodName><params>';

		for(var param in params){
			xml += "<param><value><string>" + param + "</string></value></param>";
			xml += "<param><value><string>" + params[param] + "</string></value></param>";
		}
		xml += "</params></methodCall>"

		return xml;

	};

	// unpack the response
	free.prototype.unpack = function(xml, callback){

		require('xml2js').parseString(xml, { explicitArray : false, ignoreAttrs : true }, function(err,res){
			res = res.methodResponse.params.param.value.struct.member;
			var delta = {};
			if(Array.isArray(res)){
				for(var value in res){
					var temp = res[value];
					console.dir(temp);
					delta[temp.name] = temp.value.string;
				}	
			} else {
				delta[res.name] = res.value.string;
			}
			callback(delta);
		});

	}

	// send xml post to the server
	free.prototype.post = function(requestBody, callback){

		var postRequest = {
			host: this.hostname,
			port: this.port,
			method: "POST",
			headers: {
				'Content-Type': 'text/xml',
				'Content-Length': Buffer.byteLength(requestBody)
			}
		}

		var buffer = "";
		var timed = {};

		var req = http.request(postRequest, function(res){
			res.on("data", function(data){ buffer += data });
			res.on("end", function(data){
				clearTimeout(timed);
				callback(buffer) 
			});
		});

		req.on('error', function(e){
			if(e.toString() != 'Error: socket hang up'){
				utils.log.error(e);
			}	
			callback(false);
		});

		timed = setTimeout(function(){
			req.abort();
			console.log("Request Timed Out:" + JSON.stringify(postRequest));
		}, this.timeout);


		req.write(requestBody);
		req.end();

	};	

	return new free();

})();