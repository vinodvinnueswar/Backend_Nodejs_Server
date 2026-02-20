const Inventory = require('../models/Inventory');
const Vendor = require('../models/Vendor');
const multer = require('multer');
const bucket = require('../firebase');

// Multer Memory Storage
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// 🔥 Add Inventory with Firebase Upload
const addInventory = async (req, res) => {
  try {
    const { name, price, category, webUrl } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    // 🔥 Upload to Firebase
    const fileName = Date.now() + "-" + req.file.originalname;
    const file = bucket.file(fileName);

    const stream = file.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    stream.on("error", (err) => {
      return res.status(500).json({ error: err.message });
    });

    stream.on("finish", async () => {
      await file.makePublic();

      const imageUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;

      // 🔥 Find Vendor
      const vendor = await Vendor.findById(req.vendorId);

      if (!vendor) {
        return res.status(404).json({ message: 'Vendor not found' });
      }

      // 🔥 Save Inventory with Firebase Image URL
      const inventory = await Inventory.create({
        name,
        price,
        category,
        image: imageUrl,   // ✅ SAVE FULL URL
        vendor: vendor._id,
        webUrl
      });

      vendor.inventory.push(inventory._id);
      await vendor.save();

      return res.status(200).json({
        message: "Inventory added successfully",
        inventoryId: inventory._id
      });
    });

    stream.end(req.file.buffer);

  } catch (error) {
    console.log(error);
    return res.status(500).json("Internal server error");
  }
};

// 🔥 Delete Inventory
const deleteInventoryById = async (req, res) => {
  try {
    const inventoryId = req.params.inventoryId;

    const deleted = await Inventory.findByIdAndDelete(inventoryId);

    if (!deleted) {
      return res.status(404).json({ error: "Inventory Not Found" });
    }

    return res.status(200).json({ message: "Inventory deleted successfully" });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  addInventory: [upload.single('image'), addInventory],
  deleteInventoryById
};