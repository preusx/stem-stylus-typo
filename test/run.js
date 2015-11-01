var testRunnerConfig = {
  describe: 'Stem stylus typography',
  stylus: {
    use: function plugin(stylus) {
      stylus.include(__dirname + '../');
    },
    import: [
      '../bower_components/stem-stylus-extensions',
      '../bower_components/stem-stylus-utils',
      '../bower_components/stem-stylus-responsive',
      '../bower_components/stem-stylus-bem',
      '../bower_components/stem-stylus-grid',
      '../index'
    ]
  }
}

require('stylus-test-runner')(testRunnerConfig)