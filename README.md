
# node-ncid-client

> you can make ncid client useing node.js 

## Getting Started

Install :

* Install with [npm](https://npmjs.org): `npm install node-ncid-client`

Sample Code - es6:

```

import NcidClient from "node-ncid-client"

var client = new NcidClient( "localhost", 
							 "3333", 
							 { 
							 	auto_reconnect: true, 
							 	reconnect_interval: 1000 
							 })

client
	.on( NcidClient.EVENT.ONCONNECT, () => { console.log("onconnect"); } )
	.on( NcidClient.EVENT.ONMESSAGE, (data) => { 

		console.log("-------------------------\n")
		console.log("Recv Message\nHeader : " + data.header )

		for( var key in data.info ){
			console.log( key, " : ", data.info[key] )
		}

		console.log("-------------------------\n" )

	} )
		.start()

```

Sample Code - es5:

```
.
.
.
var NcidClient = require( "node-ncid-client" ).NcidClient
.
.
.
[ Same as es6 ]


```


Options :

# When create new NcidClient instance, you can set some options.
## auto_reconnect 		: Bool 
## reconnect_interval	: Int ( Millisecond )