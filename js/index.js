var chat = {};
var localStream = null;
var app = {
    // Application Constructor
    initialize: function () {

        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },
    onDeviceReady: function () {
        navigator.getUserMedia_ = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
        if (cordova.plugins) {
            requestMicPermission();
        }
    }
};

function registerName() {
    // Hide
    document.getElementById('app').style.display = 'none';
    document.getElementById('userTitle').style.display = 'block';
    var name = document.getElementById("name").value;
    chat = new AudioChat(name);

    chat.databaseRef.on('child_added', function (snapshot) {
        if (chat.uuid != snapshot.key) {
            createDomElement(snapshot.key, snapshot.val()['username']);
        }
    });
    chat.databaseRef.on('child_removed', function (snapshot) {
        var elem = document.getElementById(snapshot.key);
        elem.parentNode.removeChild(elem);
    });
    chat.databaseRef.on('child_changed', function (snapshot) {
        document.getElementById(snapshot.key).innerHTML = snapshot.val()['username'];
    });

    chat.connect(function (peer) {
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

function createDomElement(userId, userName) {
    var element = document.createElement('li');
    element.innerHTML = userName;
    element.setAttribute('id', userId);
    addListeners(element);
    document.getElementById("userList").appendChild(element);
}

function addListeners(elem) {
    elem.onclick = function (e) {
        var callee = e.target.id;
        makeCall(callee);
        return false;
    };
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

    record(stream);


    var audio = $('<audio autoplay />').appendTo('body');
    audio[0].src = (URL || webkitURL || mozURL).createObjectURL(stream);
    console.log('[AUDIO SRC]', audio[0].src);
}

function record(stream) {
    var recorder = new RecordRTC(stream, {
        type: 'audio',
        recorderType: StereoAudioRecorder // Force StereoAudioRecorder.js for Firefox!
    });
    recorder.startRecording();
    setTimeout(function () {
        $('audio').remove();
        chat.peer.disconnect();
        console.log('[DISCONENECT!!]');
    }, 9000);
    setTimeout(function () {
        recorder.stopRecording(function (url) {
            blob2base64(recorder.getBlob(), function (blob) {
                var timestamp = new Date().getTime().toString();
                var formData = {
                    'name': fileName,
                    'blob': blob
                };
                var formData = {
                    'call': chat.uuid,
                    'role': timestamp,
                    'blob': blob
                };
                xhr('http://localhost:3333/api', formData, function (fileURL) {

                });

                function xhr(url, data, callback) {
                    var request = new XMLHttpRequest();
                    request.onreadystatechange = function () {
                        if (request.readyState == 4 && request.status == 200) {
                            callback(request.responseText);
                        }
                    };
                    request.open('POST', url);
                    request.setRequestHeader('Content-Type', 'application/json');
                    request.send(JSON.stringify(data));
                    // request.send(data);
                }
            });

            function blob2base64(blob, cb) {
                var reader = new FileReader();
                reader.onload = function () {
                    var dataUrl = reader.result;
                    var base64 = dataUrl.split(',')[1];
                    cb(base64);
                };
                reader.readAsDataURL(blob);
            };
        });
    }, 13000);

}


app.initialize();