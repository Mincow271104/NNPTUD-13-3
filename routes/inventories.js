var express = require('express');
var router = express.Router();
let db = require('../utils/db');
let inventorySchema = require('../schemas/inventories');

/**
 * Helper: populate product vào inventory document
 */
function populateProduct(inv) {
    let copy = { ...inv };
    if (copy.product) {
        let product = db.collections.products.find(p => p._id === copy.product);
        if (product) {
            copy.product = {
                _id: product._id,
                title: product.title,
                slug: product.slug,
                price: product.price,
                images: product.images
            };
        }
    }
    return copy;
}

/* GET all inventories (có join với product) */
router.get('/', async function (req, res, next) {
    let data = db.collections.inventories;
    let result = data.map(inv => populateProduct(inv));
    res.send(result);
});

/* GET inventory by ID (có join với product) */
router.get('/:id', async function (req, res, next) {
    try {
        let inv = db.collections.inventories.find(i => i._id === req.params.id);
        if (inv) {
            res.send(populateProduct(inv));
        } else {
            res.status(404).send({ message: "Inventory not found" });
        }
    } catch (error) {
        res.status(404).send({ message: "Inventory not found" });
    }
});

/* POST add_stock: tăng stock theo quantity */
router.post('/add_stock', async function (req, res, next) {
    try {
        let { product, quantity } = req.body;
        if (!product || quantity === undefined) {
            return res.status(400).send({ message: "product va quantity la bat buoc" });
        }
        if (quantity <= 0) {
            return res.status(400).send({ message: "quantity phai lon hon 0" });
        }

        let inv = db.collections.inventories.find(i => i.product === product);
        if (!inv) {
            return res.status(404).send({ message: "Inventory khong ton tai cho product nay" });
        }

        inv.stock += quantity;
        inv.updatedAt = new Date();

        res.send(populateProduct(inv));
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

/* POST remove_stock: giảm stock theo quantity */
router.post('/remove_stock', async function (req, res, next) {
    try {
        let { product, quantity } = req.body;
        if (!product || quantity === undefined) {
            return res.status(400).send({ message: "product va quantity la bat buoc" });
        }
        if (quantity <= 0) {
            return res.status(400).send({ message: "quantity phai lon hon 0" });
        }

        let inv = db.collections.inventories.find(i => i.product === product);
        if (!inv) {
            return res.status(404).send({ message: "Inventory khong ton tai cho product nay" });
        }

        if (inv.stock < quantity) {
            return res.status(400).send({ message: "stock khong du de giam" });
        }

        inv.stock -= quantity;
        inv.updatedAt = new Date();

        res.send(populateProduct(inv));
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

/* POST reservation: giảm stock, tăng reserved */
router.post('/reservation', async function (req, res, next) {
    try {
        let { product, quantity } = req.body;
        if (!product || quantity === undefined) {
            return res.status(400).send({ message: "product va quantity la bat buoc" });
        }
        if (quantity <= 0) {
            return res.status(400).send({ message: "quantity phai lon hon 0" });
        }

        let inv = db.collections.inventories.find(i => i.product === product);
        if (!inv) {
            return res.status(404).send({ message: "Inventory khong ton tai cho product nay" });
        }

        if (inv.stock < quantity) {
            return res.status(400).send({ message: "stock khong du de dat hang" });
        }

        inv.stock -= quantity;
        inv.reserved += quantity;
        inv.updatedAt = new Date();

        res.send(populateProduct(inv));
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

/* POST sold: giảm reserved, tăng soldCount */
router.post('/sold', async function (req, res, next) {
    try {
        let { product, quantity } = req.body;
        if (!product || quantity === undefined) {
            return res.status(400).send({ message: "product va quantity la bat buoc" });
        }
        if (quantity <= 0) {
            return res.status(400).send({ message: "quantity phai lon hon 0" });
        }

        let inv = db.collections.inventories.find(i => i.product === product);
        if (!inv) {
            return res.status(404).send({ message: "Inventory khong ton tai cho product nay" });
        }

        if (inv.reserved < quantity) {
            return res.status(400).send({ message: "reserved khong du de ban" });
        }

        inv.reserved -= quantity;
        inv.soldCount += quantity;
        inv.updatedAt = new Date();

        res.send(populateProduct(inv));
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;
