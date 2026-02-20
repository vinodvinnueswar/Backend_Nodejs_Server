const Inventory = require('../models/Inventory');
const Vendor = require('../models/Vendor');
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

// Cloudinary Storage Setup

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Adding Inventory
const addInventory = async (req, res) => {
  try {
    const { name, price, category, webUrl } = req.body;

    const vendor = await Vendor.findById(req.vendorId);

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    let imageUrl = null;

    // If image exists
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "inventory_images" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );

        stream.end(req.file.buffer);
      });

      imageUrl = uploadResult.secure_url;
    }

    const inventory = await Inventory.create({
      name,
      price,
      category,
      image: imageUrl,
      vendor: vendor._id,
      webUrl,
    });

    vendor.inventory.push(inventory._id);
    await vendor.save();

    return res.status(200).json({
      message: "Inventory added Successfully",
      inventoryId: inventory._id,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const deleteInventoryById = async (req, res) => {
  try {
    const inventoryId = req.params.inventoryId;

    const deletedInventory = await Inventory.findByIdAndDelete(inventoryId);

    if (!deletedInventory) {
      return res.status(404).json({ error: "Inventory Not Found" });
    }

    return res.status(200).json({ message: "Deleted Successfully" });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  addInventory: [upload.single("image"), addInventory],
  deleteInventoryById,
};