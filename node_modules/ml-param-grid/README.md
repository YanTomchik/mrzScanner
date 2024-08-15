# param-grid

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![npm download][download-image]][download-url]

Generate a list of possible paramaters combinations. Useful for example for hyper-paramater grid search..

## Installation

`$ npm install --save ml-param-grid`

## Usage

```js
import paramGrid from 'ml-param-grid';

// paramGrid is a generator function so it returns an iterator
for(let param of paramGrid({
  param1: ['x', 'y'],
  param2: [4, 2],
  param3: true
}) {
  console.log(param);
};
// result is
// {param1 : 'x', param2: 4, param3: true}
// {param1 : 'x', param2: 2, param3: true}
// {param1 : 'y', param2: 4, param3: true}
// {param1 : 'y', param2: 2, param3: true}

// Get the result directly as an array
Array.from(paramGrid({
  p: [1, 2]
})); // [{p: 1}, {p: 2}]
```

## License

[MIT](./LICENSE)

[npm-image]: https://img.shields.io/npm/v/ml-param-grid.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/ml-param-grid
[travis-image]: https://img.shields.io/travis/mljs/param-grid/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/mljs/param-grid
[codecov-image]: https://img.shields.io/codecov/c/github/mljs/param-grid.svg?style=flat-square
[codecov-url]: https://codecov.io/gh/mljs/param-grid
[download-image]: https://img.shields.io/npm/dm/ml-param-grid.svg?style=flat-square
[download-url]: https://www.npmjs.com/package/ml-param-grid
