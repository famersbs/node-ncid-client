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

	constructor( host, port, options = {} ) {

		this.dispatcher = new EventEmitter()
		//this.client = new net.Socket()
		this.host = host
		this.port = port

		this.state = 0		// 0 : none, 1: req_con, 2: connected

		// add options
		this._setOption( "auto_reconnect", options, true )
		this._setOption( "reconnect_interval", options, 1000 )

		this.recv_buff = ""
	}

	start(){
		this._connect()
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
	/// internal functions
	_connect(){
		if( 0 != this.state ){
			return
		}

		// Change State
		this.state = 1
		//this.client = new net.Socket()
		let client = this.client = new net.Socket()//this.client
		//client.removeAllListeners()
		client.on('data', this.__OnData.bind(this) )
		client.on( 'close', this.__OnDisconnect.bind(this) )
		client.connect( this.port, 
						this.host, 
						this.__OnConnect.bind(this) )
	}
	_setOption( opt_name, options, default_value ) {
		if( null != options[opt_name]){
			this[opt_name] = options[opt_name]
		}else{
			this[opt_name] = default_value
		}
	}
	////////////////////////////////
	/// internal event
	__OnConnect() {
		this.state = 2
		this.dispatcher.emit( NcidClient.EVENT.ONCONNECT )
	}
	__OnDisconnect() {

		if( 1 == this.state ){
			console.log( "It just connection error")
		}else if( 2 == this.state ){
			this.dispatcher.emit( NcidClient.EVENT.ONDISCONNECT )	
		}

		// reconnect
		if( this.auto_reconnect ){
			this.state = 0
			console.log("Trying to reconnect after : " + this.reconnect_interval )
			setTimeout( this._connect.bind(this), this.reconnect_interval )
		}
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