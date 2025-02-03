import { io } from 'socket.io-client';

const socket = io.connect('http://localhost:3031');

document.getElementById('joinForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const roomId = document.getElementById('roomId').value;
    const isPresenter = document.getElementById('isPresenter').checked;

    // Check with server if can join as presenter
    const joinResponse = await socket.emitWithAck('checkRoom', {
        username,
        roomId,
        isPresenter
    });

    if (joinResponse.success) {
        // Store join info in sessionStorage
        sessionStorage.setItem('meetingInfo', JSON.stringify({
            username,
            roomId,
            isPresenter: joinResponse.isPresenter // Use server's response about presenter status
        }));
        
        // Redirect to meeting room
        window.location.href = '/meeting.html';
    } else {
        alert(joinResponse.message || 'Unable to join room');
    }
});