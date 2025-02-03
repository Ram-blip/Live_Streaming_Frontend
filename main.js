import './style.css'
import buttons from './uiStuff/uiButtons.js'
import { io } from 'socket.io-client'
import {Device} from 'mediasoup-client'
import getMic2 from './uiStuff/getMic2.js'
import createProducerTransport from './mediaSoupFunctions/createProducerTransport'
import createProducer from './mediaSoupFunctions/createProducer'
import requestTransportToConsume from './mediaSoupFunctions/requestTransportToConsume'

let device = null;
let localStream = null;
let producerTransport = null;
let videoProducer = null;
let audioProducer = null;
let consumers = {}; // key off the audio{pid, value is the consumer}

// Get meeting info from sessionStorage
const meetingInfo = JSON.parse(sessionStorage.getItem('meetingInfo'));
if (!meetingInfo) {
    window.location.href = '/'; // Redirect to join page if no meeting info
}

const socket = io.connect('http://localhost:3031');

socket.on('connect', () => {
    console.log('Connected to server');
    initializeRoom(); // Automatically join room on connect
});

socket.on('updateActiveSpeakers', async newListofActives => {
    console.log(newListofActives);
    let slot = 0;
    const remoteEls = document.getElementsByClassName('remote-video');
    for(let el of remoteEls){
        el.srcObject = null;
    }
    newListofActives.forEach(aid => {
        if(aid !== audioProducer?.id){
            const remoteVideo = document.getElementById(`remote-video-${slot}`);
            const remoteVideoUserName = document.getElementById(`username-${slot}`);
            const consumerForThisSlot = consumers[aid];
            remoteVideo.srcObject = consumerForThisSlot?.combinedStream;
            remoteVideoUserName.innerHTML = consumerForThisSlot?.userName;
            slot++;
        }
    });
});

socket.on('newProducersToConsume', consumeData => {
    requestTransportToConsume(consumeData, socket, device, consumers);
});

const initializeRoom = async () => {
    const joinRoomResp = await socket.emitWithAck('joinRoom', {
        userName: meetingInfo.username,
        roomId: meetingInfo.roomId,
        isPresenter: meetingInfo.isPresenter
    });

    // Update UI with room info
    document.getElementById('room-display').textContent = `Room: ${meetingInfo.roomId}`;
    document.getElementById('user-type-display').textContent = 
        `Role: ${joinRoomResp.isPresenter ? 'Presenter' : 'Participant'}`;

    device = new Device();
    await device.load({ routerRtpCapabilities: joinRoomResp.routerRtpCapabilities });
    console.log(joinRoomResp);

    // Enable the feed button for presenters
    if (joinRoomResp.isPresenter) {
        buttons.enableFeed.disabled = false;
        buttons.enableFeed.classList.remove('btn-secondary');
        buttons.enableFeed.classList.add('btn-primary');
    }

    requestTransportToConsume(joinRoomResp, socket, device, consumers);
};

const enableFeed = async () => {
    const mic2Id = await getMic2();
    localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: { deviceId: { exact: mic2Id } },
    });
    buttons.localMediaLeft.srcObject = localStream;
    buttons.enableFeed.disabled = true;
    buttons.sendFeed.disabled = false;
    buttons.muteBtn.disabled = false;
    
    buttons.sendFeed.classList.remove('btn-secondary');
    buttons.sendFeed.classList.add('btn-success');
    buttons.muteBtn.classList.remove('btn-secondary');
    buttons.muteBtn.classList.add('btn-success');
};

const sendFeed = async () => {
    producerTransport = await createProducerTransport(socket, device);
    const producers = await createProducer(localStream, producerTransport);
    audioProducer = producers.audioProducer;
    videoProducer = producers.videoProducer;
    console.log(producers);
    buttons.hangUp.disabled = false;
    buttons.hangUp.classList.remove('btn-secondary');
    buttons.hangUp.classList.add('btn-danger');
};

const muteAudio = () => {
    if (audioProducer.paused) {
        audioProducer.resume();
        buttons.muteBtn.innerHTML = "Audio On";
        buttons.muteBtn.classList.add('btn-success');
        buttons.muteBtn.classList.remove('btn-danger');
        socket.emit('audioChange', 'unmute');
    } else {
        audioProducer.pause();
        buttons.muteBtn.innerHTML = "Audio Muted";
        buttons.muteBtn.classList.remove('btn-success');
        buttons.muteBtn.classList.add('btn-danger');
        socket.emit('audioChange', 'mute');
    }
};

const hangUp = () => {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    window.location.href = '/';
};

buttons.enableFeed.addEventListener('click', enableFeed);
buttons.sendFeed.addEventListener('click', sendFeed);
buttons.muteBtn.addEventListener('click', muteAudio);
buttons.hangUp.addEventListener('click', hangUp);