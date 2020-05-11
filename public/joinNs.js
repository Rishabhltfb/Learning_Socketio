function joinNs(endpoint) {
    if (nsSocket) {
        nsSocket.close();
        document.querySelector('#user-input').removeEventListener('submit', formSubmission)
    }
    nsSocket = io(`http://localhost:9000${endpoint}`);
    nsSocket.on('nsRoomLoad', (nsRooms) => {
        // console.log(nsRooms);
        let roomList = document.querySelector('.room-list');
        roomList.innerHTML = ""
        nsRooms.forEach((room) => {

            let glyph;
            if (room.privateRoom) {
                glyph = 'lock'
            } else {
                glyph = 'globe'
            }
            roomList.innerHTML += `<li class="room"><span class="glyphicon glyphicon-${glyph}"></span>${room.roomTitle}</li>`
        })
        let roomNodes = document.getElementsByClassName('room');
        Array.from(roomNodes).forEach((elem) => {
            elem.addEventListener('click', (e) => {
                // console.log("Someone clicked on ", e.target.innerText);
                joinRoom(e.target.innerText);
            })
        })
        // add room automatically... first time here
        const topRoom = document.querySelector('.room');
        const topRoomName = topRoom.innerText;
        // console.log(topRoomName);
        joinRoom(topRoomName);
    })

    nsSocket.on('messageToClients', (msg) => {
        console.log(msg);
        const newMsg = buildHTML(msg);
        document.querySelector('#messages').innerHTML += newMsg;
    })
    document.querySelector(".message-form").addEventListener("submit", formSubmission);

}

function formSubmission(event) {
    event.preventDefault();
    const newMessage = document.querySelector("#user-message").value;
    document.querySelector("#user-message").value = "";
    nsSocket.emit("newMessageToServer", { text: newMessage });
}

function buildHTML(msg) {
    const convertedDate = new Date(msg.time).toLocaleString();
    const newHTML = `<li>
    <div class="user-image">
      <img src="${msg.avatar}" />
    </div>
    <div class="user-message">
      <div class="user-name-time">${msg.username} <span>${convertedDate} pm</span></div>
      <div class="message-text">${msg.text}</div>
    </div>
  </li>`
    return newHTML;
}