var AudioChat = function (name) {
    this.uuid = device.uuid;
    this.peer = {};
    this.usersObject = {};
    var self = this;
    if (!device.uuid) {
        this.uuid = "PC-" + device.model;
    }
    
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    this.databaseRef = firebase.database().ref("chat");
    var user = {};
    firebase.database().ref('chat/' + this.uuid).set({
        username: name,
    });

    this.connect = function (cb) {
        self.peer = new Peer(self.uuid, peerConfig);
        cb(self.peer);
    }

}