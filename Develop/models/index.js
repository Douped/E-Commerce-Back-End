// import models
const Product = require('./Product');
const Category = require('./Category');
const Tag = require('./Tag');
const ProductTag = require('./ProductTag');

// Products belongsTo Category
Product.belongsToOne(Category);
// Categories have many Products
Category.hasMany(Product);
// Products belongToMany Tags (through ProductTag)
Products.belongsToMany(Tags,{
  through:{
    model: ProductTag,
    unique: false
  }
});
// Tags belongToMany Products (through ProductTag)
Tags.belongsToMany(Products,{
  through:{
    model: ProductTag,
    unique: false
  }
});
module.exports = {
  Product,
  Category,
  Tag,
  ProductTag,
};
