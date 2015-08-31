var testRunnerConfig = {
  describe: 'Stem stylus bem',
  stylus: {
    use: function plugin(stylus) {
      stylus.include(__dirname + '../');
    },
    import: ['../bower_components/stem-stylus-utils', '../bem']
  }
}

require('stylus-test-runner')(testRunnerConfig)