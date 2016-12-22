import fs from 'fs';
import path from 'path';
import postcss from 'postcss';
import escapeRegExp from 'lodash.escaperegexp';

const NAME = 'postcss-outside-border-radius';
const FUNCTION_NAME = 'outside-border-radius';
const SHORT_HAND_FUNCTION_NAME = 'obr';
const funcRe = new RegExp(
  `(?:${FUNCTION_NAME}|${SHORT_HAND_FUNCTION_NAME})\\((.+?)\\)`
);

const insideSelectors = new Map();

export default postcss.plugin(NAME, () => {
  return root => {
    root.walkDecls('border-radius', origDecl => {
      const {parent} = origDecl;
      const matches = origDecl.value.match(funcRe);
      let gutters = null;
      if (matches) {
        const insideSelector = matches[1];
        const outSideGutterCollection = collectGutter(parent);

        root.walkRules(new RegExp(escapeRegExp(insideSelector)), rule => {
          const insideGutterCollection = collectGutter(rule);
          gutters =
            concatEachGutter(outSideGutterCollection, insideGutterCollection);

          rule.walkDecls(/border-radius/, ({value}) => {
            const values = splitValue(value);
            gutters = concatEachGutter(gutters, values);
          });
        });

        origDecl.value = gutters.map(collection => {
          return `calc(${collection.join(' + ')})`;
        }).join(' ');
      }
    });
  };
});

function collectGutter(origin) {
  const gutterCollection = [[], [], [], []];
  origin.walkDecls(/^padding|margin/, ({value}) => {
    const values = splitValue(value);
    gutterCollection.forEach((item, idx) => item.push(values[idx]));
  });
  return gutterCollection;
}

function splitValue(value) {
  const splitted = value.split(/\s+/);
  switch (splitted.length) {
    case 1: {
      return Array(4).fill(splitted[0]);
    }
    case 2: {
      const arr = Array(4);
      splitted.forEach((item, idx) => {
        if (idx === 0) {
          arr[0](splitted[0]);
          arr[2](splitted[0]);
        } else {
          arr[1](splitted[0]);
          arr[3](splitted[0]);
        }
      });
      return arr;
    }
    case 4: {
      return splitted;
    }
    default: {
      return null;
    }
  }
}

function concatEachGutter(c1, c2) {
  return c1.map((collection, idx) => {
    return collection.concat(c2[idx]);
  })
}
