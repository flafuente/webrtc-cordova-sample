var micTest = new MicTest();
var networkTest = new NetworkTest();
var report = new Report([micTest,networkTest]);
report.process();