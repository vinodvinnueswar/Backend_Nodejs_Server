
const mongoose = require('mongoose')

const inventorySchema = new mongoose.Schema({
    name:{
        type: String,
        required:true,
    },
    price:{
        type: String,
        required: true,
    },
    category:{
        type:[{
            type: String,
            enum:['Wedding' , 'Birthday' , 'Halfsaree' , 'Housewarming' ]
        }]
    },
    image:{
        type: String,
    },
    vendor:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor'
    }]
})

const Inventory = mongoose.model('Inventory' , inventorySchema)

module.exports = Inventory;