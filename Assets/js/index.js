let localStream;
let username;
let remoteUser;
let url = new URL(window.location.href);
// username = url.searchParams.get("username");
// remoteUser = url.searchParams.get("remoteuser");
let peerConnection;
let remoteStream;
let sendChannel;
let receiveChannel;
let msgSendBtn = document.querySelector(".msg-send-button");
let msgInput = document.querySelector("#msg-input");
let chatTextArea = document.querySelector(".messages-chat");
// const axios = window.axios;


var omeID = localStorage.getItem("omeID");

if (omeID) {
  username = omeID;

  fetch(`/new-user-update/${username}`, {
    method: 'POST',
  })
    .then(response => response.json())
    .then(data => {
      console.log(data);
    })
    .catch(error => {
      console.error(error);
    });
} else {
  const postData = "Demo Data";

  fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: postData }),
  })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      localStorage.setItem('omeID', data);
      username = data;
    })
    .catch(error => {
      console.error(error);
    });
}


let init = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
  document.getElementById("user-1").srcObject = localStream;



  fetch("/get-remote-users", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ omeID: omeID }),
  })
    .then(response => response.json())
    .then(data => {

      console.log(remoteUser);
      if (data[0]) {

        if (data[0]._id != remoteUser || data[0]._id != username) {
          remoteUser = data[0]._id;
        }
      }
      createOffer();
      console.log('Local stream:', localStream);
      console.log('Response from /get-remote-users:', data);
      console.log('Remote user:', remoteUser);

    })
    .catch(error => {
      console.error("Error during fetch:", error);
    });

};
init();

let socket = io.connect();

socket.on("connect", () => {
  if (socket.connected) {
    socket.emit("userconnect", {
      displayName: username,
    });
  }
});
let servers = {
  iceServers: [
    {
      urls: ["stun:stun1.1.google.com:19302", "stun:stun2.1.google.com:19302"],
    },
  ],
};

let createPeerConnection = async () => {
  peerConnection = new RTCPeerConnection(servers);
  remoteStream = new MediaStream();
  console.log(remoteStream);

  document.getElementById("user-2").srcObject = remoteStream;

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.ontrack = async (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };

  remoteStream.oninactive = () => {
    remoteStream.getTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    peerConnection.close();
  };

  peerConnection.onicecandidate = async (event) => {
    if (event.candidate) {
      socket.emit("candidateSentToUser", {
        username: username,
        remoteUser: remoteUser,
        iceCandidateData: event.candidate,
      });
    }
  };

  sendChannel = peerConnection.createDataChannel("sendDataChannel");
  sendChannel.onopen = () => {
    console.log("data channel is open now");
    onSendChannelStateChange();

  };


  peerConnection.ondatachannel = receiveChannelCallback;
  //   sendChannel.onmessage = onSendChannelMessageCallBack;


};

function receiveChannelCallback(event) {
  console.log("Receive Channel Callback");
  receiveChannel = event.channel;
  receiveChannel.onmessage = onReceiveChannelMessageCallback;
  receiveChannel.onopen = onReceiveChannelStateChange;
  receiveChannel.onclose = onReceiveChannelStateChange;

}


function onReceiveChannelMessageCallback(event) {
  console.log("Recieved Message");
  chatTextArea.innerHTML += "<div class='message'>" +" <div class='sender'>Stranger</div>"+ 
     "<p class='text'>" + event.data + "</p> " + "</div>"

    + "</div>"

    ;
}

function onReceiveChannelStateChange() {
  const readystate = receiveChannel.readystate;
  console.log("Recieve Channel state is :", readystate);
  if (readystate === "open") {
    console.log("Data channel in ready state and open - onReceiveChannelStateChange  Change");

  } else {
    console.log("Data channel in ready state not open - onReceiveChannelStateChange  Change");
  }
}


function onSendChannelStateChange() {
  const readystate = sendChannel.readystate;
  console.log("Send Channel state is :", readystate);
  if (readystate === "open") {
    console.log("Data channel in ready state and open - onSendChannelState  Change");

  } else {
    console.log("Data channel in ready state not open - onSendChannelState  Change");
  }
}


function sendData() {
  msgData = msgInput.value;
  console.log(msgInput);

  chatTextArea.innerHTML += "<div class='message text-only'>" +
    "<div class='response'>" + "<p class='text'>" + msgData + "</p> </div>" + " <div class='sender'>You</div>"

    + "</div>"

    ;
  if (sendChannel) {
    onSendChannelStateChange();
    sendChannel.send(msgData);

  } else {
    receiveChannel.send(msgData);
  }
}


function fetchNextUser() {
  fetch("/get-next-user", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ omeID: omeID, remoteUser: remoteUser }),
  })
    .then(response => response.json())
    .then(data => {
      if (data[0]) {

        if (data[0]._id != remoteUser || data[0]._id != username) {
          remoteUser = data[0]._id;
        }
      }
      createOffer();
    })
    .catch(error => {
      console.error("Error during fetch:", error);

    });

}

let createOffer = async () => {
  createPeerConnection();
  let offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  socket.emit("offerSentToRemote", {
    username: username,
    remoteUser: remoteUser,
    offer: peerConnection.localDescription,


  });

  alert('Offer Created and Send to remote');
};

let createAnswer = async (data) => {
  remoteUser = data.username;

  createPeerConnection();
  await peerConnection.setRemoteDescription(data.offer);
  let answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  socket.emit("answerSentToUser1", {
    answer: answer,
    sender: data.remoteUser,
    receiver: data.username,
  });

  fetch(`/update-on-engagement/${username}`, {
    method: 'POST',
  })
    .then(response => response.json())
    .then(data => {
      alert(data);
    })
    .catch(error => {
      console.error(error);
    });
};

socket.on("ReceiveOffer", function (data) {
  createAnswer(data);
});

let addAnswer = async (data) => {
  if (!peerConnection.currentRemoteDescription) {
    peerConnection.setRemoteDescription(data.answer);
  }
  document.querySelector(".next-chat").style.pointerEvents = "auto";

  fetch(`/update-on-engagement/${username}`, {
    method: 'POST',
  })
    .then(response => response.json())
    .then(data => {
      alert(data);
    })
    .catch(error => {
      console.error(error);
    });
};

socket.on("ReceiveAnswer", function (data) {
  addAnswer(data);
});

socket.on("closedRemoteUser", function (data) {
  fetch(`/update-on-next/${username}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(response => response.json())
    .then(data => {
      fetchNextUser(remoteUser);
    })
    .catch(error => console.error(error));
});

socket.on("candidateReceiver", function (data) {
  peerConnection.addIceCandidate(data.iceCandidateData);
});


msgSendBtn.addEventListener("click", function (event) {
  sendData();
})


window.addEventListener("unload", function (event) {

  alert("I am triggered,unload");
  fetch(`/leaving-user-update/${username}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(response => response.json())
    .then(data => {
      alert(data);
    })
    .catch(error => console.error(error));
});

async function closeConnection() {
  await peerConnection.close();
  await socket.emit("remoteUserClosed", {
    username: username,
    remoteUser: remoteUser
  })

  fetch(`/update-on-next/${username}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(response => response.json())
    .then(data => {
      fetchNextUser(remoteUser);
    })
    .catch(error => console.error(error));



}

document.querySelector(".next-chat").addEventListener("click", function () {
  console.log("clicked nextchat")
  document.querySelector(".chat-text-area").innerHTML = " ";
  if (peerConnection.connectionState === "connected" || peerConnection.iceCandidateState === "connected") {
    closeConnection();
    console.log("User Closed");

  } else {
    fetchNextUser(remoteUser);
    console.log("Moving to next user");
  }
});