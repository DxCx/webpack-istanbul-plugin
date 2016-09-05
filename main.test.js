var ISTANBUL = require('istanbul'),
    Report = ISTANBUL.Report,
    Collector = ISTANBUL.Collector;
var ISTANBUL_REMAP = require('remap-istanbul/lib/remap');

const codeContext = require.context(process.env.CONTEXT_DIRECTORY, true, process.env.CONTEXT_TEST);
codeContext.keys().forEach((file) => {
    // And require all spec files to run them.
    if ( file.match(process.env.CONTEXT_TEST_FILES) !== -1 ) {
        codeContext(file);
    }
});

var reporters;
if (process.env.ISTANBUL_REPORTERS) {
	reporters = process.env.ISTANBUL_REPORTERS.split(',');
} else {
	reporters = ['text-summary', 'html'];
}

var reportDir = process.env.ISTANBUL_REPORT_DIR;
var opts = {};
if (reportDir) {
	opts.dir = reportDir;
}

var cov = global.__coverage__ || {},
	collector = new Collector();

collector.add(cov);
collector = ISTANBUL_REMAP(collector.getFinalCoverage());

reporters.forEach(function(reporter) {
	Report.create(reporter, opts).writeReport(collector, true);
});
