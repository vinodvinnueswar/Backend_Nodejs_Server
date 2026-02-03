
const Vendor = require('../models/Vendor');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotEnv = require('dotenv');
const { connect } = require('mongoose');

dotEnv.config()

const secretKey = process.env.WhatIsYourName


const vendorRegister = async (req,res) =>{
    const {username,email,password} = req.body;

    try {
        const vendorEmail = await Vendor.findOne({email});
        if(vendorEmail){
            return res.status(400).json('Email already exist');
        }
        const hashedpassword = await bcrypt.hash(password,10);

        const newVendor = new Vendor(
            {
            username,
            email,
            password: hashedpassword
        } );
        await newVendor.save()

        res.status(201).json({message: 'vendor registered successfully'})
        console.log('register')

        } catch (error) {
            res.status(500).json({error: 'Internal Server error'});
            console.log(error);
        
    }

}

const vendorLogin = async(req,res) =>{
        const {email,password} = req.body;

        try {
            const vendor = await Vendor.findOne({email});
        if(!vendor || !(await bcrypt.compare(password, vendor.password))){
            return res.status(401).json("Invaild username or password");
        }

        const token = jwt.sign({vendorId: vendor._id} , secretKey , {expiresIn:"1h"})

        res.status(200).json({success: "Login Succesfully" , token});
        console.log(email,"This is token:" ,token)
        } catch (error) {
            console.log(error);
            res.status(500).json({error:"Internal server Error"});
            
        }
        
    }


    // Get All Vendors
    const getAllVendors = async(req,res) => {
        
        try {
            const vendors = await Vendor.find().populate('inventory');
            res.json({vendors})
        } catch (error) {
            console.log(error);
            return res.status(500).json({error:"Internal server error"})
            
        }
    }

module.exports = { vendorRegister ,vendorLogin, getAllVendors}