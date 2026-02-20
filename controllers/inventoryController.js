const Inventory = require('../models/Inventory');
const Vendor = require('../models/Vendor');
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
require("dotenv").config();

/* ===============================
   ✅ Cloudinary Configuration
================================= */
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

/* ===============================
   ✅ Multer Storage Setup
================================= */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

/* ===============================
   ✅ Add Inventory
================================= */
const addInventoryController = async (req, res) => {
  try {
    const { name, price, category, webUrl } = req.body;

    console.log("File:", req.file);
    console.log("Body:", req.body);
    console.log("VendorId:", req.vendorId);

    const vendor = await Vendor.findById(req.vendorId);

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    let imageUrl = null;

    // If image exists → Upload to Cloudinary
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "inventory_images",
        });

        imageUrl = result.secure_url;

        // Delete file from local uploads folder after upload
        fs.unlinkSync(req.file.path);

      } catch (err) {
        console.error("Cloudinary Upload Error:", err);
        return res.status(500).json({ error: "Image upload failed" });
      }
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
    console.error("Internal Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* ===============================
   ✅ Delete Inventory
================================= */
const deleteInventoryById = async (req, res) => {
  try {
    const inventoryId = req.params.inventoryId;

    const deletedInventory = await Inventory.findByIdAndDelete(inventoryId);

    if (!deletedInventory) {
      return res.status(404).json({ error: "Inventory Not Found" });
    }

    return res.status(200).json({ message: "Deleted Successfully" });

  } catch (error) {
    console.error("Delete Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* ===============================
   ✅ Export
================================= */
module.exports = {
  addInventory: [upload.single("image"), addInventoryController],
  deleteInventoryById,
};