var gulp = require('gulp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

var serve = function() {
  browserSync({
    port: 9001,
    notify: false,
    logPrefix: 'KOA',
    snippetOptions: {
      rule: {
        match: '<span id="browser-sync-binding"></span>',
        fn: function(snippet) {
          return snippet;
        }
      }
    },
    server: {
      baseDir: './',
      index: "index.html"
    }
  });
}; 

// Serve project and watch files for changes
gulp.task('serve', [], function() {
  serve();

  gulp.watch(['**/*'], reload);
});