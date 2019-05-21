const { src, dest, series, watch } = require('gulp');
const sync = require('browser-sync');
const sass = require('gulp-sass');
const prefix = require('gulp-autoprefixer');
const { exec } = require('child_process');

const messages = {
  jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
}

/* Build the Jekyll Site */
const jekyllBuild = (done) => {
  sync.notify(messages.jekyllBuild);
  return exec( 'jekyll build')
    .on('close', done);
}

const jekyllRebuild = series(jekyllBuild, (done) => {
  sync.reload();
  done();
});

const sassBuild = () => {
  return src('sass/main.scss')
    .pipe(sass({
      includePaths: ['sass'],
      outputStyle: 'expanded',
      onError: sync.notify
    }))
    .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
    .pipe(dest('_site/css'))
    .pipe(sync.reload({stream:true}))
    .pipe(dest('css'));
}

const browserSync = series(jekyllBuild, (done) => {
  sync({
    server: {
      baseDir: '_site'
    }
  });
  done();
});

const msg = (cb) => {
  console.log(messages.jekyllBuild);
  cb();
}

exports.build = sassBuild;

exports.default  = series(browserSync, () => {
  watch('./sass/**/*.scss', sassBuild);
  watch(['*.html', '_layouts/*.html', '_includes/*.html', '_posts/*.html'], jekyllRebuild);
});
