
const createProducer = (localStream, producerTransport) => {
    return new Promise(async(resolve,reject) => {
        // get the audio and video tracks so we can produce them
        const videoTrack = localStream.getVideoTracks()[0]
        const audioTrack = localStream.getAudioTracks()[0]

        try{
            // running the produce method on the transport will create a producer
            console.log("Produce running on video")
            const videoProducer = await producerTransport.produce({track: videoTrack})
            console.log("Produce running on audio")
            const audioProducer = await producerTransport.produce({track: audioTrack})
            console.log("producers finished")
            resolve({audioProducer, videoProducer})
        }catch(err){
            console.log(err, "Error creating producer")
        }
    })
}

export default createProducer