import { connect } from "socket.io-client"

const createProducerTransport = (socket, device) => new Promise(async (resolve, reject) => {
    // ask the server to make a transport and send params
    const producerTransportParams = await socket.emitWithAck('requestTransport', {type: 'producer'})
    // console.log(producerTransportParams)
    // use the device to create a front edn transport to send
    const producerTransport = device.createSendTransport(producerTransportParams)
    // console.log(producerTransport)
    producerTransport.on('connect', async ({dtlsParameters}, callback, errback)=> {
        // emit the connecttransport
        console.log("Connect running on producer transport")
        const connectResp = await socket.emitWithAck('connectTransport', {dtlsParameters, type: 'producer'})
        console.log(connectResp," connect response is back " )
        if(connectResp === 'success'){
            callback()
        }else if(connectResp === 'error'){
            errback()
        }

    })
    producerTransport.on('produce', async (parameters, callback, errback) => { 
        // emit startproducing event 
        // transport doesnt connect until the produce event is fired
        console.log("Produce is now running")
        const {kind, rtpParameters} = parameters
        const produceResp = await socket.emitWithAck('startProducing', {kind, rtpParameters})
        console.log(produceResp,"Produce resp is back")   
        if(produceResp === 'error'){
            errback()
        } else {
            callback({id: produceResp})
        }     
    })

    // setTimeout(async()=>{
    //     const stats = await producerTransport.getStats()
    //     for(const report of stats.values()){
    //         // console.log(report.type)
    //         if(report.type === 'outbound-rtp'){
    //             console.log(report.bytesSent,'-',report.packetsSent)
    //         }
    //     }
    // },1000)

    // we will send the transport to the main
    resolve(producerTransport)
})

export default createProducerTransport 