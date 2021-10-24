const BookReview = artifacts.require("BookReview");

module.exports = function (deployer) {
  deployer.deploy(BookReview);
};
