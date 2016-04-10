//import NcidClient from "../lib/ncid-client"
import NcidClient from "../lib/ncid-client"

import readline from "readline"

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var client = new NcidClient( "localhost", "3333", { auto_reconnect: true, reconnect_interval: 1000 } )

client.on( NcidClient.EVENT.ONCONNECT, () => { console.log("onconnect"); } )
		.on( NcidClient.EVENT.ONMESSAGE, (data) => { 

			console.log("-------------------------\nRecv Message\nHeader : " + data.header )

			for( var key in data.info ){
				console.log( key, " : ", data.info[key] )
			}
			console.log("-------------------------\n" )

		} )
		.on( NcidClient.EVENT.ONDISCONNECT, () => {
			console.log( "========================\n", "DISCONNECTED" )
		})
		.start()

function inputIterator( client ){
	function iterate( prompt, cb ){
		rl.question( prompt, cb )
	}
	rl.question( ">", (answer) => {
		console.log("cmd : ",answer);
		if( answer == "quit" ){
			rl.close();
		}else{
			client.push( answer )
			inputIterator( client )
		}
	})
}

inputIterator( client )
