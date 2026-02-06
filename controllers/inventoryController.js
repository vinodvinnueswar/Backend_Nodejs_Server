
const Inventory = require('../models/Inventory');
const Vendor =  require('../models/Vendor');
const multer = require('multer')
const path = require('path')

// Multer Storage Setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// adding Inventory details
const addInventory = async(req,res) => {
   
    try {
         const {name,price,category,webUrl} = req.body;

        const image = req.file ? req.file.filename : null;
   

    // Vendor Id 
    const vendor = await Vendor.findById(req.vendorId);

    if(!vendor){
        return res.status(404).json({message: 'Vendor not found'})
    }

    const inventory = await Inventory.create({
        name,price,category,image,vendor: vendor._id,webUrl
    });

    // const savedInventory = await inventory.save();
    // const inventoryId = savedInventory._id;

    vendor.inventory.push(inventory._id);
    await vendor.save();

    return res.status(200).json({message: "Inventory added Succesfully" ,inventoryId : inventory._id})

    } catch (error) {
        console.log(error)
        return res.status(500).json("Internal server error")
        
    }
}


const deleteInventoryById = async(req,res) => {
     
    try {
        const inventoryId = req.params.inventoryId;

    const deleteInventory = await Inventory.findByIdAndDelete(inventoryId);

    if(!deleteInventory){
        return res.status(404).json({error: "Inventory Not Found"})
    }
    } catch (error) {
        console.log(error)
        return res.status(500).json({error: "Internal server error"})
        
    }

}

module.exports = {addInventory : [upload.single('image'), addInventory] , deleteInventoryById}