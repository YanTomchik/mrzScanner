/**
 * @generator
 * @param {object} options - An object. Each key should countain an array of possible values for this key. If not an array, then the given value is the only possible value for this parameter.
 * Returns a very important number
 * @yields {object} - The generated parameter object.
 */
export default function* paramGrid(options) {
  options = Object.assign({}, options);
  const keys = Object.keys(options);
  let total = 1;
  let lengths = [];
  let cumLengths = [];

  for (let i = keys.length - 1; i >= 0; i--) {
    const key = keys[i];
    if (!Array.isArray(options[key])) {
      options[key] = [options[key]];
    }
    total *= options[key].length;
    lengths[i] = options[key].length;
    cumLengths[i] = total;
  }
  cumLengths.push(1);

  for (let i = 0; i < total; i++) {
    const params = {};
    for (let j = keys.length - 1; j >= 0; j--) {
      params[keys[j]] =
        options[keys[j]][Math.floor(i / cumLengths[j + 1]) % lengths[j]];
    }
    yield params;
  }
}
