// const socket = io("http://localhost:9000"); // the / namespace/endpoint
const username = prompt("What is your username?");
const socket = io("http://localhost:9000", {
    query: {
        username
    }
}); // the / namespace/endpoint
let nsSocket = "";

socket.on('nsList', (nsData) => {
    console.log('The list of namespaces has arrived');
    // console.log(nsData);
    let namespacesDiv = document.querySelector('.namespaces');
    namespacesDiv.innerHTML = '';
    nsData.forEach((ns) => {
        namespacesDiv.innerHTML += `<div class="namespace" ns=${ns.endpoint}> <img src="${ns.img}" /></div>`
    })

    //Add a clicklistener for each NS
    Array.from(document.getElementsByClassName('namespace')).forEach((elem) => {
        // console.log(elem);
        elem.addEventListener('click', (e) => {
            const nsEndpoint = elem.getAttribute('ns');
            console.log(`${nsEndpoint} is here`)
            joinNs(nsEndpoint);
        })
    })
    joinNs('/wiki');
})

