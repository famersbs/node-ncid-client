import net from 'net'
import EventEmitter from 'events';

class RecvMsg {

	constructor( msg ){
		this.__parse( msg )
	}

	__parse( msg ){

		// Seprate Header and Body
		if( msg[0] >= '0' && msg[0] <= '9' ){

			this.header = msg.substring( 0, 3 ).trim()
			this.body = msg.substring( 4 ).trim()

		}else {
			let tmp = msg.split(":")

			this.header = tmp[0].trim()
			this.body = tmp.splice(1).join().trim()
		}

		// Body Parse to info
		this.info = []
		switch( this.header ){
			case "CID":  		// *DATE*04072016*TIME*1520*LINE*-*NMBR*14154818044*MESG*NONE*NAME*Cell Phone   CA*
			case "CIDLOG": 		// *DATE*04072016*TIME*1520*LINE*-*NMBR*14154818044*MESG*NONE*NAME*Cell Phone   CA*
			case "CIDINFO": 	// *LINE*-*RING*1*TIME*22,20,59*
				var tmp = this.body.split( "*" )
				//console.log("body parse " + tmp + " " + tmp.length )
				for( let i = 1 ; i < tmp.length ; i = i + 2 ){
					
					if( "" == tmp[i].trim() ) {
						break
					}else{
						this.info[ tmp[i] ] = tmp[ i + 1 ]
					}

					
				}
				break
		}
	}
}

export default class NcidClient {

	static EVENT = { 
					ONCONNECT : "connect",
					ONDISCONNECT : "disconnect",
					ONMESSAGE : "onmessage"
	 				}

	constructor( host, port, options ) {
		this.dispatcher = new EventEmitter()
		this.client = new net.Socket()
		this.host = host
		this.port = port

		this.recv_buff = ""
	}

	start(){
		let client = this.client
		client.on('data', this.__OnData.bind(this) )
		client.connect( this.port, this.host, this.__OnConnect.bind(this) )
		return this
	}
	stop(){
		return this
	}

	push( req ){
		this.client.write( req )
	}

	on( event, cb ){
		this.dispatcher.on( event, cb )
		return this
	}

	off( event, cb ){
		this.dispatcher.removeListener( event, cb )
		return this
	}

	////////////////////////////////
	/// internal event
	__OnConnect() {
		this.dispatcher.emit( NcidClient.EVENT.ONCONNECT )
	}
	__OnData( data ){
		this.recv_buff += data
		let temp = this.recv_buff.split("\n")

		for( let i = 0 ; i < temp.length -1 ; ++ i ){
			this.dispatcher.emit( NcidClient.EVENT.ONMESSAGE, new RecvMsg( temp[i] ) )
		}

		this.recv_buff = temp[ temp.length - 1 ]
	}

}