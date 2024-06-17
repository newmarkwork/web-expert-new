import _config from '../gulp.config.js';
const { config } = _config;

import gulp from 'gulp';
const { src, dest } = gulp;
export const videos = (done) => {
  src(config.videos.src, { encoding: false }).pipe(dest(config.videos.dest));

  done();
};
