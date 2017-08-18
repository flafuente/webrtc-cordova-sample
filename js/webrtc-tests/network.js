'use strict';

function NetworkTest() {
    this.configParams = {};
};


NetworkTest.prototype = {
    run: function (report) {
        this.report = report.setTest('network');
        setTimeout(function () {
            this.report.reportSuccess('Network test');
        }, 200);
        setTimeout(function () {
            this.report.reportError('Network failed.');
        }, 1000);
        setTimeout(function () {
            this.report.reportSuccess('Network created');
            this.report.done();
        }, 1200);
        return;
    }
};