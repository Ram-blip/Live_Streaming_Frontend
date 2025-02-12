# ActiveSpeaker and Video Conferencing with Mediasoup

## Overview

This is a **many-to-many** video conferencing project built using **Mediasoup**, where up to **five active speakers** are showcased in a room. The application leverages **WebRTC, Socket.IO, Node.js, and Express.js** to enable seamless real-time communication between multiple participants.

## Features

- **Many-to-Many Video Conferencing**
- **Mediasoup for SFU (Selective Forwarding Unit) Streaming**
- **Displays Up to 5 Active Speakers**
- **Low Latency Communication with WebRTC**
- **Socket.IO for Real-time Signaling**
- **Scalable and Efficient Media Handling**

## Tech Stack

- **Backend:** Node.js, Express.js, Socket.IO
- **Media Server:** Mediasoup
- **Frontend:** HTML, CSS, JavaScript
- **WebRTC for Media Streaming**

## Installation

### Prerequisites

Ensure you have the following installed:

- **Node.js** (Latest LTS version recommended)
- **NPM or Yarn**

### Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Start the Server**

   ```bash
   npm start
   ```

4. **Access the Application** Open your browser and go to:

   ```
   http://localhost:3000
   ```

## How It Works

1. **Users Join a Room**
   - Each user connects via WebRTC and is assigned a producer/consumer role.
2. **Mediasoup Manages Media Streams**
   - SFU (Selective Forwarding Unit) optimizes video/audio distribution.
3. **Socket.IO Handles Signaling**
   - Real-time communication for session management.
4. **Active Speaker Detection**
   - Displays the top 5 active speakers in the conference.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For any queries, feel free to reach out or create an issue in the repository.

---

### Happy Coding! 🚀

