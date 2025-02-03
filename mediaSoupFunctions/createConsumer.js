
const createConsumer = (consumerTransport, pid, device, socket, kind, slot) => {
    return new Promise(async (resolve, reject) => {
        // consume from the basics and emit the consume media event 
        // we take the params and get back and run consume
        const consumerParams = await socket.emitWithAck('consumeMedia', { rtpCapabilities: device.rtpCapabilities, pid, kind })
        console.log(consumerParams)

        if(consumerParams === 'cannotConsume'){
            console.log("Cannot consume")
            resolve()
        }else if(consumerParams === 'consumeFailed'){
            console.log("Consume failed...")
            resolve()
        } else {
            const consumer = await consumerTransport.consume(consumerParams)
            console.log("consume() has finished")
            const { track } = consumer
            // add track events
            // unpause
            await socket.emitWithAck('unpauseConsumer', {pid, kind})
            resolve(consumer)
        }
        
    })
}

export default createConsumer;