import net from 'net'
import EventEmitter from 'events';

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
			this.dispatcher.emit( NcidClient.EVENT.ONMESSAGE, temp[i] )
		}

		this.recv_buff = temp[ temp.length - 1 ]

		console.log( "remind buff : ", this.recv_buff )
	}

}