// Helper functions for metadata comparison
module.exports.lessThanOrEqualTo=function lessThanOrEqualTo(threshold) {
  return (value) => {
    if (value === undefined) return true;
    return value <= threshold;
  };
}

module.exports.moreThanOrEqualTo=function moreThanOrEqualTo(threshold) {
  return (value) => {
    if (value === undefined) return true;
    return value >= threshold;
  };
}