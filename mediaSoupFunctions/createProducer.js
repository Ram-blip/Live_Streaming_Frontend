const createProducer = (localStream, producerTransport, isPresenter) => {
    return new Promise(async(resolve, reject) => {
        try {
            // Get the video track
            const videoTrack = localStream.getVideoTracks()[0];
            
            // Create video producer
            console.log("Produce running on video");
            const videoProducer = await producerTransport.produce({track: videoTrack});
            
            let audioProducer = null;
            // Only create audio producer for presenters
            if (isPresenter && localStream.getAudioTracks().length > 0) {
                const audioTrack = localStream.getAudioTracks()[0];
                console.log("Produce running on audio");
                audioProducer = await producerTransport.produce({track: audioTrack});
            }
            
            console.log("producers finished");
            resolve({audioProducer, videoProducer});
        } catch(err) {
            console.log(err, "Error creating producer");
            reject(err);
        }
    });
}

export default createProducer;