# Freeside.js

__This is a node.js API wrapper for [Freeside Billing Software](https://github.com/freeside/Freeside)__

Freeside uses xml-rpc for its api. This wrapper will serialize methods and parameters for transport.
___
#### Installation

``` 
# using npm
npm install freesidejs
```

#### Documentation
You will need to use the `require()` method to get the module into your project. If you are going to use the `post()` method, please specify your hostname and port of your freeside server.
```
var Freeside = require('freesidejs');
Freeside.hostname = "127.0.0.1";
Freeside.port = 8080;
Freeside.timeout = 15000; //.post() timeout
```

**_Freeside.pack(methodName, params)_**

The `pack()` method can be used to generate an xml-rpc request body. It takes 2 parameters, a `methodName` which is a string, and a object `params` which has key value pairs. It is worth noting that all the parameters for a method must be included even if they are blank.

``` javascript
// generate an xml-rpc request for the freeside api
var xmlData = Freeside.pack("login", {
    email: "test@email.com",
    username: "",
    domain: "",
    password: "password"
});

## VALUE OF xmlData ##
<?xml version="1.0" encoding="utf-8"?>
<methodCall>
    <methodName>FS.ClientAPI_XMLRPC.login</methodName>
    <params>
        <param><value><string>email</string></value></param>
        <param><value><string>test@email.com</string></value></param>
        <param><value><string>username</string></value></param>
        <param><value><string></string></value></param>
        <param><value><string>domain</string></value></param>
        <param><value><string></string></value></param>
        <param><value><string>password</string></value></param>
        <param><value><string>password</string></value></param>
    </params>
</methodCall>
```

**_Freeside.unpack(xmlResponse, callback(results))_**

The `unpack()` method will parse the xml-rpc response body. The parsed values are available through the callback results parameter.
``` javascript
Freeside.unpack(xmlResponse, function(results){
    console.dir(results);
    // results: { session_id: 'deb0bc80c62f04fa0fc759989886299e', error: '' }
});
```

**_Freeside.post(requestBody, callback(results))_**

The `post()` method will POST your xml-rpc request using http and provide the return xml body.
```
var xmlData = Freeside.pack("login", {
    email: "test@email.com",
    username: "",
    domain: "",
    password: "password"
});
Freeside.post(xmlData, function(results){
    console.log(results); // will be xml-rpc response body
});
```