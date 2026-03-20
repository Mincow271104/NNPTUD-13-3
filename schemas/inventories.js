/**
 * Inventory Schema - In-Memory version
 */
let db = require('../utils/db');

module.exports = {
    createInventory: function (data) {
        let inventoryData = {
            product: data.product,
            stock: data.stock || 0,
            reserved: data.reserved || 0,
            soldCount: data.soldCount || 0
        };
        return db.createDocument('inventories', inventoryData);
    },

    find: function (filter) {
        return db.find('inventories', filter);
    },

    findOne: function (filter) {
        return db.findOne('inventories', filter);
    },

    findById: function (id) {
        return db.findById('inventories', id);
    },

    findByIdAndUpdate: function (id, updateData, options) {
        return db.findByIdAndUpdate('inventories', id, updateData, options);
    }
};
