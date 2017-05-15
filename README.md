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

**Acceptable methodName Strings (some are deprecated, check freeside docs)**
'passwd'
'chfn'
'chsh'
'login_info'
'login_banner_image'
'login'
'logout'
'switch_acct'
'switch_cust'
'customer_info'
'customer_info_short'
'customer_recurring'
'contact_passwd'
'list_contacts'
'edit_contact'
'delete_contact'
'new_contact'
'billing_history'
'edit_info'
'invoice'
'invoice_pdf'
'legacy_invoice'
'legacy_invoice_pdf'
'invoice_logo'
'list_invoices'
'list_payby'
'insert_payby'
'update_payby'
'delete_payby'
'cancel'
'payment_info'
'payment_info_renew_info'
'process_payment'
'store_payment'
'process_stored_payment'
'process_payment_order_pkg'
'process_payment_change_pkg'
'process_payment_order_renew'
'process_prepay'
'start_thirdparty'
'finish_thirdparty'
'realtime_collect'
'list_pkgs'
'list_svcs'
'list_svc_usage'
'svc_status_html'
'svc_status_hash'
'set_svc_status_hash'
'set_svc_status_listadd'
'set_svc_status_listdel'
'set_svc_status_vacationadd'
'set_svc_status_vacationdel'
'acct_forward_info'
'process_acct_forward'
'list_dsl_devices'
'add_dsl_device'
'delete_dsl_device'
'port_graph'
'list_cdr_usage'
'list_support_usage'
'order_pkg'
'change_pkg'
'order_recharge'
'renew_info'
'order_renew'
'cancel_pkg'
'suspend_pkg'
'charge'
'part_svc_info'
'provision_acct'
'provision_phone'
'provision_pbx'
'provision_external'
'unprovision_svc'
'myaccount_passwd'
'reset_passwd'
'check_reset_passwd'
'process_reset_passwd'
'validate_passwd'
'list_tickets'
'create_ticket'
'get_ticket'
'adjust_ticket_priority'
'did_report'
'signup_info'
'skin_info'
'access_info'
'domain_select_hash'
'new_customer'
'new_customer_minimal'
'capture_payment'
'clear_signup_cache'
'new_prospect'
'new_agent'
'agent_login'
'agent_logout'
'agent_info'
'agent_list_customers'
'check_username'
'suspend_username'
'unsuspend_username'
'mason_comp'
'call_time'
'call_time_nanpa'
'phonenum_balance'
'list_quotations'
'quotation_new'
'quotation_delete'
'quotation_info'
'quotation_print'
'quotation_add_pkg'
'quotation_remove_pkg'
'quotation_order'
'freesideinc_service'


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
___
## Full Use Example

``` javascript

var Freeside = require('freesidejs');

var xmlData = Freeside.pack("login", {
    email: "test@email.com",
    username: "",
    domain: "",
    password: "password"
});

Freeside.post(xmlData, function(xmlResponse){
    
    if(!xmlResponse){
        console.error("No XML Response");
    } else {
        Freeside.unpack(xmlResponse, function(results){

            if(results.error != null && results.error != ""){
                // Handle Error best way you see fit
                conosle.error(JSON.stringify(results));
            } else if (results.faultCode != null){
                // Should never happen, but better to be safe
                console.error(JSON.stringify(results));
            } else {

                // Here is where you handle the data
                console.log(results);

            }

        });
    }

});

