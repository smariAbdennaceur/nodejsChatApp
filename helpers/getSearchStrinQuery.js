

/**
 * @description getSearchQuery
 * @param {string} field
 * @param {string} searchTerm
 *
 * @returns {object}
 */
 const getFieldRegexQuery = (
  field,
  searchTerm
) => {
  return {
    [field]: {
      $regex: searchTerm.replace("+", ""),
      $options: "mi",
    },
  }
};

/**
 * @description getSearchStringQuery
 *
 * @param {[string]} fields
 * @param {string} searchTerm
 * @param {object} baseQuery
 *
 * @returns {object}
 *
 */
 const getSearchStringQuery = (
  fields = [],
  searchTerm,
  baseQuery = {}
) => {
  $or = []
  if (!searchTerm || searchTerm.trim() === "") return baseQuery;
  if (!baseQuery.$or) baseQuery.$or = [];
  fields.forEach((field) => {
    const condition = getFieldRegexQuery(field, searchTerm);
    console.log('condition ',condition)
    if (condition) baseQuery.$or.push(condition);
  });
  return baseQuery;
};


module.exports = getSearchStringQuery