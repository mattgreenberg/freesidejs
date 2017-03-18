var http = require('http');

module.exports = (function(){

	var free = function(){
		this.hostname = "10.1.2.2";
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
			
			var xmlMemebers;
			var returnData = {};

			// check for server fault.
			if(res.methodResponse.fault != null){

				xmlMembers = res.methodResponse.fault.value.struct.member;
				if(Array.isArray(xmlMembers)){

					for(var member in xmlMembers){

						var memberVal = xmlMembers[member];
						if(memberVal.value.string != null){
							returnData[memberVal.name] = memberVal.value.string;
						} else {
							returnData[memberVal.name] = undefined;
						}

					}

				}
				return callback(returnData);

			}
			
			// unpack response starts here if not faulted
			xmlMembers = res.methodResponse.params.param.value.struct.member;
			if(Array.isArray(xmlMembers)){

				for(var member in xmlMembers){

					var memberVal = xmlMembers[member];

					if(memberVal.value.string != null){
						returnData[memberVal.name] = memberVal.value.string;
					} else if (memberVal.value.array != null){
						returnData[memberVal.name] = unpackArray(memberVal.value.array);
					} else {
						returnData[memberVal.name] = undefined;
					}
	
				}
			} else {
				returnData[xmlMembers.name] = xmlMembers.value.string;
			}
			callback(returnData);
		});

	}

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
				callback(buffer);
			});
		});

		req.on('error', function(e){
			if(e.toString() != 'Error: socket hang up'){
				console.error(e.toString());
			}	
			callback(false);
		});

		timed = setTimeout(function(){
			req.abort();
			console.error("Request Timed Out: " + JSON.stringify(postRequest));
		}, this.timeout);

		req.write(requestBody);
		req.end();

	};


	return new free();

	// method to unpack the array values into normal json
	function unpackArray(input){

		var returnData = [];

		// strip down object to get to array
		var xmlArray = input.data.value;

		if(Array.isArray(xmlArray)){

			for(var obj in xmlArray){

				var xmlObj = xmlArray[obj];

				if(xmlObj.string != undefined){

					returnData.push(xmlObj.string);

				} else {

					var memberArray = xmlObj.struct.member;
					var tempObj = {};

					for(var index in memberArray){

						var member = memberArray[index];
						tempObj[member.name] = member.value.string;

					}

					returnData.push(tempObj);

				}

			}

		} else {

			if(xmlArray != undefined){
				
				var tempObj = {};
				var memberArray = xmlArray.struct.member;
				for(var index in memberArray){

					var member = memberArray[index];
					tempObj[member.name] = member.value.string;

				}

				returnData.push(tempObj);

			} 

		}

		return returnData;

	};

})();