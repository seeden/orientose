var gulp = require('gulp');
var mocha = require('gulp-mocha');
var babel = require('gulp-babel');


gulp.task('test', function () {
    return gulp.src('./tests/**/*.js')
    .pipe(babel())
    .pipe(mocha({
    	timeout: 20000
    }));
});

gulp.doneCallback = function (err) {
	process.exit(err ? 1 : 0);
};