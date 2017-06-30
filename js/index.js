var chat = {};
var localStream = null;
var app = {
    // Application Constructor
    initialize: function () {

        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },
    onDeviceReady: function () {
        navigator.getUserMedia_ = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
        document.querySelector('div#submit').style.visibility = 'visible';
        if (cordova.plugins) {
            requestMicPermission();
        }
    }
};

function registerName() {
    // Hide
    document.querySelector('div#submit').style.visibility = 'hidden';
    document.getElementById('name').style.visibility = 'hidden';
    var name = document.getElementById("name").value;
    chat = new AudioChat(name);

    chat.userList(function (results) {
        createDomElements(results);
    })

    chat.connect(function(peer) {
        peer.on('call', function (call) {
            console.log("[DEV]Call received");
            // Answer the call, providing our mediaStream
            createNewStream(function (err, stream) {
                call.answer(stream);
            });
            call.on('stream', playStream);
        });
    })


}

function createDomElements(userList) {
    for (var x = 0; x < userList.length; x++) {
        var element = document.createElement('li');
        element.innerHTML = chat.usersObject[userList[x]].username;
        element.setAttribute('key', userList[x]);
        document.getElementById("userList").appendChild(element);
    }

    addListeners("li");
}

function addListeners(type) {
    var elementList = document.getElementsByTagName(type);
    for (var z = 0; z < elementList.length; z++) {
        var elem = elementList[z];
        elem.onclick = function (e) {
            var callee = e.target.getAttribute("key");
            makeCall(callee);
            return false;
        };
    }
}

function makeCall(callee) {
    var call = {};
    createNewStream(function (err, stream) {
        call = chat.peer.call(callee, stream);
        call.on('stream', playStream);
    });

}

function requestMicPermission() {
    cordova.plugins.diagnostic.requestMicrophoneAuthorization(function (status) {
        if (status === cordova.plugins.diagnostic.permissionStatus.GRANTED) {
            console.log("Microphone use is authorized");
        } else {
            console.error('[profile.ctrl...evaluateMicStatus] Mic use not granted');
        }
    }, function (error) {
        console.error(error);
    });
}

function createNewStream(cb) {
    navigator.getUserMedia_({
            audio: true,
            video: false
        },
        function (stream) {
            localStream = stream;
            cb(null, stream);
        },
        function (err) {
            cb(err, {});
        }
    );
}

// Create an <audio> element to play the audio stream
function playStream(stream) {
    console.log("[DEV]Receiving stream");
    var audio = $('<audio autoplay />').appendTo('body');
    audio[0].src = (URL || webkitURL || mozURL).createObjectURL(stream);
}

app.initialize();