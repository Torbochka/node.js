"use strict";

module.exports = function() {
  $.gulp.task("watch", function() {
    $.gulp.watch("./js/**/*.js", $.gulp.series("js:process"));
    $.gulp.watch("./style/**/*.scss", $.gulp.series("sass"));
    $.gulp.watch("./views/**/*.pug", $.gulp.series("pug"));
    $.gulp.watch("./images/**/*.*", $.gulp.series("copy:image"));
  });
};
