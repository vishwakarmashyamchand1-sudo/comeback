/**
 * Utility: Pagination Helper
 * Purpose: Formats pagination metadata
 */

const getPaginationParams = (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const formatPagination = (total, page, limit) => {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

module.exports = {
  getPaginationParams,
  formatPagination
};
