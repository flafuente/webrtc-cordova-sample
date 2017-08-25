var micTest = new MicTest();
var networkCandidates = new NetworkCandidates({password:"XXXX",server:"turn:XXXX:80",user:"XXXX"});

var report = new Report([micTest,networkCandidates]);
report.process();