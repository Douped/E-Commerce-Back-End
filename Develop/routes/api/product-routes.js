const router = require("express").Router();
const { Product, Category, Tag, ProductTag } = require("../../models");

// The `/api/products` endpoint

// get all products
router.get("/", async (req, res) => {
  try {
    const productData = await Product.findAll({
      include: [{ model: Category }, { model: Tag, through: ProductTag }],
    });
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get one product
router.get("/:id", async (req, res) => {
  // find a single product by its `id`
  // be sure to include its associated Category and Tag data
  try {
    const productData = await Product.findByPk(req.params.id, {
      include: [{ model: Category }, { model: Tag, through: ProductTag }],
    });

    if (!productData) {
      res.status(404).json({ message: "No product found!" });
      return;
    }

    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// create new product
router.post("/", (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  Product.create(req.body)
    .then((product) => {
      if (req.body.tagIds.length) {
        // map tags to an array to use bulkcreate
        const tagArray = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(tagArray);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((tagIds) => res.status(200).json(tagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put("/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const { tagIds } = req.body;

    // update product data
    await Product.update(req.body, {
      where: { id: productId },
    });

    if (tagIds && tagIds.length) {
      // get existing product tags
      const productTags = await ProductTag.findAll({
        where: { product_id: productId },
      });
      // map json id to number ids
      const existingTagIds = productTags.map(({ tag_id }) => tag_id);

      // find new tags to add
      const newProductTags = tagIds
        // filter out existing tags then attach product ids
        .filter((tag_id) => !existingTagIds.includes(tag_id))
        .map((tag_id) => ({
          product_id: productId,
          tag_id,
        }));

      // find tags to remove
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !tagIds.includes(tag_id))
        .map(({ id }) => id);

      // remove old tags and add new tags
      await Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    }

    const updatedProduct = await Product.findByPk(productId);

    return res.json(updatedProduct);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

router.delete("/:id", async (req, res) => {
  // delete one product by its `id` value
  try {
    const productData = await Product.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (!productData) {
      res.status(404).json({ message: "No product found" });
      return;
    }
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
