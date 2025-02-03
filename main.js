import './style.css'
import buttons from './uiStuff/uiButtons.js'
import { io } from 'socket.io-client'
import {Device} from 'mediasoup-client'
import getMic2 from './uiStuff/getMic2.js'
import createProducerTransport from './mediaSoupFunctions/createProducerTransport'
import createProducer from './mediaSoupFunctions/createProducer'
import requestTransportToConsume from './mediaSoupFunctions/requestTransportToConsume'

let device = null
let localStream = null
let producerTransport = null
let videoProducer = null
let audioProducer = null
let consumers = {} // key off the audio{pid, value is the consumer}

// const socket = io('https://localhost:3031')
// FOR LOCAL ONLY.. no https
const socket = io.connect('http://localhost:3031')
socket.on('connect',() => {
  console.log('connected to server');
})

socket.on('updateActiveSpeakers', async newListofActives =>{
  // console.log("updateActiveSpeakers")
  // console.log(newListofActives)
  console.log(newListofActives)
  let slot = 0
  // remove all videos from the video elements
  const remoteEls = document.getElementsByClassName('remote-video')
  for(let el of remoteEls){
    el.srcObject = null // clear the video
  }
  newListofActives.forEach(aid=>{
    if(aid !== audioProducer?.id){
      // do not show this client in a video tag other than local
      // put this video in the next avaiable slot
      const remoteVideo = document.getElementById(`remote-video-${slot}`)
      const remoteVideoUserName = document.getElementById(`username-${slot}`)
      const consumerForThisSlot = consumers[aid]
      remoteVideo.srcObject = consumerForThisSlot?.combinedStream
      remoteVideoUserName.innerHTML = consumerForThisSlot?.userName
      slot++ // for the next iteration
    }
  })
})

socket.on('newProducersToConsume', consumeData =>{
  // console.log("newProducersToConsume", consumeData)
  requestTransportToConsume(consumeData, socket, device, consumers)
})

const joinRoom = async () => {
    // console.log('Join Room button clicked')
    const userName = document.getElementById('username').value
    const roomName = document.getElementById('room-input').value 
    const joinRoomResp =await socket.emitWithAck('joinRoom',{userName, roomName})
    // console.log("Is room new", joinRoomResp)
    device = new Device()
    await device.load({routerRtpCapabilities: joinRoomResp.routerRtpCapabilities})
    // console.log(device)
    console.log(joinRoomResp)

    // palceholder for next steps start making the transport for current speakers
    // joinroomresp contains arrays for:
    // audioPidsToCreate
    // mapped to videoPidsToCreate
    // mapped to userNames
    // these arrays may be emtpy they may have a max of 5 indices
    requestTransportToConsume(joinRoomResp, socket, device, consumers)


    buttons.control.classList.remove('d-none')
}

const enableFeed = async() => {
  const mic2Id = await getMic2()
  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: {deviceId:{exact:mic2Id}},
  })
  buttons.localMediaLeft.srcObject = localStream
  buttons.enableFeed.disabled = true
  buttons.sendFeed.disabled = false 
  buttons.muteBtn.disabled = false
}

const sendFeed = async() => {
  // create a transport for this client upstream
  // it will handle both audio and video producers
  producerTransport = await createProducerTransport(socket, device)
  // console.log("Have Producer Transport. Time to produce")
  const producers = await createProducer(localStream, producerTransport)
  audioProducer = producers.audioProducer
  videoProducer = producers.videoProducer
  console.log(producers)
  buttons.hangUp.disabled = false
}

const muteAudio = () => {
  // mute at the producer level to keep the transport and other mechanism at place
  if(audioProducer.paused){
    audioProducer.resume()
    buttons.muteBtn.innerHTML = "Audio On"
    buttons.muteBtn.classList.add('btn-success') // turn to green
    buttons.muteBtn.classList.remove('btn-danger') // remove the red
    // unpause on the server
    socket.emit('audioChange','unmute')
  } else {
    //currently on, users wants to pause
    audioProducer.pause()
    buttons.muteBtn.innerHTML = "Audio Muted"
    buttons.muteBtn.classList.remove('btn-success') // turn to green
    buttons.muteBtn.classList.add('btn-danger') // remove the red
    socket.emit('audioChange','mute')
  }
}

buttons.joinRoom.addEventListener('click', joinRoom)
buttons.enableFeed.addEventListener('click', enableFeed)
buttons.sendFeed.addEventListener('click', sendFeed)  
buttons.muteBtn.addEventListener('click', muteAudio)