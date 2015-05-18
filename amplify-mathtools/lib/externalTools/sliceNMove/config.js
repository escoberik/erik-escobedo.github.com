module.exports = {
    path: 'lib/externalTools/sliceNMove',
    module: 'mtSliceNMove',
    libFileset: 'slicenmoveLib',
    srcFileset: 'slicenmoveSrc',
    unittestFileset: 'slicenmoveSpec',
    acctestFileset: 'slicenmoveAcceptance',

    files: {
        'slicenmoveLib': [
            'bower_components/d3/d3.min.js'
        ],
        'slicenmoveSrc': [
            'lib/externalTools/sliceNMove/src/namespace.js',
            'lib/externalTools/sliceNMove/src/constants.js',
            'lib/externalTools/sliceNMove/src/**/*.js'
        ],
        'slicenmoveSpec': [
            'lib/externalTools/sliceNMove/test/unit/**/*.js'
        ],
        'slicenmoveAcceptance': [
            'lib/externalTools/sliceNMove/test/protractor/spec/**/*.spec.js'
        ]
    }
};
