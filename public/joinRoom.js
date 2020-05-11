function joinRoom(roomName) {
    // Send this roomName to the server
    nsSocket.emit('joinRoom', roomName, (newNumberOfMembers) => {
        // we want to update the room number total now that we have joined!
        document.querySelector('.curr-room-num-users').innerHTML = `${newNumberOfMembers} <span class="glyphicon glyphicon-user"></span
        >`
    })
    nsSocket.on('historyCatchup', (history) => {
        // console.log(history);
        const messagesUl = document.querySelector('#messages');
        messagesUl.innerHTML = "";
        history.forEach((msg) => {
            const newMsg = buildHTML(msg);
            const currentMessages = messagesUl.innerHTML;
            messagesUl.innerHTML = currentMessages + newMsg;
        })
        messagesUl.scrollTo(0, messagesUl.scrollHeight);
    })
    nsSocket.on('updateMembers', (newMembers) => {
        document.querySelector('.curr-room-num-users').innerHTML = `${newMembers} <span class="glyphicon glyphicon-user"></span
        >`
        document.querySelector('.curr-room-text').innerText = `${roomName} `

    })
    let searchBox = document.querySelector('#search-box');
    searchBox.addEventListener('input', (e) => {
        console.log(e.target.value);
        let messages = Array.from(document.getElementsByClassName('message-text'));
        // console.log(messages);
        messages.forEach((msg) => {
            if (msg.innerText.toLowerCase().indexOf(e.target.value.toLowerCase()) === -1) {
                // the msg does not contain the user search term!
                msg.style.display = "none";
            } else {
                msg.style.display = "block";
            }
        })
    })
}