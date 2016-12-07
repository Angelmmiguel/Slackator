/**
 * Check if the given string contains another string
 */
const contains = (str, search) => {
  let contains = false;
  str = str.toLowerCase();

  if (typeof search === 'string') {
    contains = str.indexOf(search) > -1;
  } else {
    search.forEach(s => {
      contains = contains || str.indexOf(s) > -1;
    });
  }

  return contains;
}

// Export
module.exports = {
  contains
}
