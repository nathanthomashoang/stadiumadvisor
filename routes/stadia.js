// express & router
const express = require('express');
const router = express.Router();
// controller
const stadia = require('../controllers/stadia');
//catchAsync
const catchAsync = require('../utils/catchAsync');
// JoiSchema validations
const { validateStadium, isLoggedIn, isOwner, hasMaxImages, validateLocation } = require('../middleware')
// multer & multer-storage-cloudinary
const multer = require('multer');
const { storage } = require('../cloudinary/index');
const { findById } = require('../models/user');
const upload = multer({ 
    storage,
    limits: {
        files: 5,
        fileSize: 5000000
    }
});


// INDEX route
router.get('/', catchAsync(stadia.index));

// CREATE Route
    // render form
router.get('/new', isLoggedIn, stadia.renderNewForm);
    // create stadium
router.post('/', isLoggedIn, upload.array('images'), validateStadium, validateLocation, catchAsync(stadia.createStadium));

// SHOW route
router.get('/:id', catchAsync(stadia.showStadium));

// EDIT route
    // render form
router.get('/:id/edit', isLoggedIn, isOwner, catchAsync(stadia.renderEditForm));
    // edit stadium
router.put('/:id', isLoggedIn, isOwner, hasMaxImages, upload.array('images'), validateStadium, validateLocation, catchAsync(stadia.editStadium));

// DELETE/DESTROY route
    // stadium
router.delete('/:id', isLoggedIn, isOwner, catchAsync(stadia.deleteStadium));

    // stadium images
        // render form
router.get ('/:id/images', isLoggedIn, isOwner, catchAsync(stadia.deleteImgsForm));
        // delete images
router.delete('/:id/images', isLoggedIn, isOwner, catchAsync(stadia.deleteImgs));


// Export Router
module.exports = router;