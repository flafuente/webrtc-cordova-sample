'use strict';
var NetworkCandidates = function (settings) {
    this.settings = {
        iceServers: [{
            username: settings.user,
            credential: settings.password,
            urls: settings.server
        }]
    };
};

NetworkCandidates.prototype = {
    run: function (report) {
        this.report = report.setTest('network');
        this.gatherCandidates();
    },

    // Create a PeerConnection, and gather candidates using RTCConfig |config|
    // and ctor params |params|. Succeed if any candidates pass the |isRelay|
    // check, fail if we complete gathering without any passing.
    gatherCandidates: function () {
        var pc;
        try {
            pc = new RTCPeerConnection(this.settings, null);
        } catch (error) {
            this.report.reportError('Failed to create peer connection: ' + error);
            this.report.done();
            return;
        }

        // In our candidate callback, stop if we get a candidate that |isRelay|.
        pc.addEventListener('icecandidate', function (e) {
            // Once we've decided, ignore future callbacks.
            if (e.currentTarget.signalingState === 'closed') {
                return;
            }
            if (e.candidate) {
                var parsed = this.parseCandidate(e.candidate.candidate);
                if (this.isRelay(parsed)) {
                    this.report.reportSuccess('Gathered candidate of Type: ' + parsed.type +
                        ' Protocol: ' + parsed.protocol + ' Address: ' + parsed.address);
                    pc.close();
                    pc = null;
                    this.report.done();
                }
            } else {
                pc.close();
                pc = null;
                this.report.reportError('Failed to gather specified candidates');
                this.report.done();
            }
        }.bind(this));

        this.createAudioOnlyReceiveOffer(pc);
    },

    // Create an audio-only, recvonly offer, and setLD with it.
    // This will trigger candidate gathering.
    createAudioOnlyReceiveOffer: function (pc) {
        var createOfferParams = {
            offerToReceiveAudio: 1
        };
        pc.createOffer(
            createOfferParams
        ).then(
            function (offer) {
                pc.setLocalDescription(offer).then(
                    noop,
                    noop
                );
            },
            noop
        );

        // Empty function for callbacks requiring a function.
        function noop() {}
    },
    // Parse a 'candidate:' line into a JSON object.
    parseCandidate: function (text) {
        var candidateStr = 'candidate:';
        var pos = text.indexOf(candidateStr) + candidateStr.length;
        var fields = text.substr(pos).split(' ');
        return {
            'type': fields[7],
            'protocol': fields[2],
            'address': fields[4]
        };
    },
    isRelay: function (candidate) {
        return candidate.type === 'relay';
    }
};