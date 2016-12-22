import fs from 'fs';
import path from 'path';
import postcss from 'postcss';
import outsideBorderRadius from '../lib/postcss-outside-border-radius';

const css = fs.readFileSync(path.join(__dirname, '../test/fixtures/test.css'));

postcss([outsideBorderRadius])
  .process(css)
  .then(result => {
    console.log(result.css);
  })
  .catch(err => {
    console.log(err);
  });
