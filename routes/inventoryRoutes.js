
const express = require('express');
const inventoryController = require('../controllers/inventoryController');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

router.post('/add-inventory' , verifyToken, inventoryController.addInventory);

// router.get('/uploads/:imageName' , (req,res) => {
//     const imageName = req.params.imageName;
//     res.headersSent('Content-Type' , 'image/jpeg' );
//     res.sendFile(Path.join(__dirname, '..' , 'uploads' , imageName));
// });

router.delete('/:inventoryId', inventoryController.deleteInventoryById)


module.exports = router