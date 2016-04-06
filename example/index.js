//import NcidClient from "../lib/ncid-client"
import NcidClient from "../lib/ncid-client"

import readline from "readline"

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});



var client = new NcidClient( "localhost", "3333" )

console.log( NcidClient.on )

client.on( NcidClient.EVENT.ONCONNECT, () => { console.log("onconnect"); } )
		.on( NcidClient.EVENT.ONMESSAGE, (data) => { console.log("msg: " + data ); } )
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
