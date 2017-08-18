'use strict';

function Report(queue) {
    this.queue = queue;
    this.process = function () {
        if (this.queue.length > 0) {
            this.queue[0].run(this);
            this.queue.splice(0, 1); // Remove from queue element 0
        } else {
            this.finish();
        }
    };
    this.messages = [];
    this.testName = null;
    this.finish = function () {
        console.log('====================================');
        console.log("MESSAGES", this.messages);
        console.log('====================================');  
    };
    this.reportInfo = function (e) {
        this.messages[this.testName].push('[Info]' + e);
    };
    this.reportError = function (e) {
        this.messages[this.testName].push('[Error]' + e);
    };
    this.done = function () {
        this.messages[this.testName].push('[End]');
        this.process();
    };
    this.reportSuccess = function (e) {
        this.messages[this.testName].push('[Success]' + e);
    };
    this.reportWarning = function (e) {
        this.messages[this.testName].push('[Warning]' + e);
    };
    this.setTest = function (testName) {
        this.messages[testName] = [];
        this.testName = testName;
        return this;
    };
};