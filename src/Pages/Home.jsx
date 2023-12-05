import { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import '../App.css';
import { useParams ,useNavigate} from 'react-router-dom';
import QRCode from 'react-qr-code';

function App() {
  const [peerId, setPeerId] = useState('');
  const [remotePeerId, setRemotePeerId] = useState('');
  const [qrCode, setQrCode] = useState('')
  const remoteVideo = useRef(null);
  const currentVideo = useRef(null);
  const peerConnection = useRef(null);
  const { slug } = useParams();
  const navigate = useNavigate()
  useEffect(() => {
    const peer = new Peer();
    if (slug != null){
      setRemotePeerId(slug)
    }
    peer.on('open', (id) => {
      setPeerId(id);
      setQrCode('https://v1k.netlify.com/' + id);
    });

 
     // Event listener for incoming calls
    peer.on('call', (call) => {
      var getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia;
       // Answer the call and display remote video
      getUserMedia({ video: true, audio: true }, (mediaStream) => {
        currentVideo.current.srcObject = mediaStream;
        currentVideo.current.play();
        call.answer(mediaStream);
        call.on('stream', function (remoteStream) {
          remoteVideo.current.srcObject = remoteStream;
          remoteVideo.current.play();
        });
      });
    });

    peerConnection.current = peer;

    return () => {
      peerConnection.current.destroy();
    };
  }, []);

    // Function to initiate a call to a remote peer
  const call = (remotePeerId) => {
    var getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;

    getUserMedia({ video: true, audio: true }, (mediaStream) => {
      currentVideo.current.srcObject = mediaStream;
      currentVideo.current.play();

      const call = peerConnection.current.call(remotePeerId, mediaStream);

      call.on('stream', (remoteStream) => {
        remoteVideo.current.srcObject = remoteStream;
        remoteVideo.current.play();
      });
    });
    setQrCode(`https://v1k.netlify.com/${remotePeerId}`)
  };

  const remotePeerIdChange = (e) => {
    setRemotePeerId(e.target.value);
  };

  // Function to leave the call
  const leaveCall = () => {
    const currentUserStream = currentVideo.current.srcObject;
    const remoteUserStream = remoteVideo.current.srcObject;
    //Disconnect video from the current user
    if (currentUserStream) {
      const tracks = currentUserStream.getTracks();
      tracks.forEach((track) => track.stop());
    }

    if (remoteUserStream) {
      const tracks = remoteUserStream.getTracks();
      tracks.forEach((track) => track.stop());
    }

    peerConnection.current.disconnect();

    navigate("/");
    window.location.reload(false);
  };

  return (
    <div className="App">
      <h1>ID: {peerId}</h1>
      <input
        type="text"
        value={remotePeerId}
        onChange={remotePeerIdChange}
      />
      <button onClick={() => call(remotePeerId)}>Call</button>
      <button onClick={leaveCall}>Leave Call</button>
   
        <QRCode
          value={qrCode}
          size={300}
        />
    
      <div>
        <video ref={currentVideo} />
      </div>
      <div>
        <video ref={remoteVideo} />
      </div>
    </div>
  );
}

export default App;