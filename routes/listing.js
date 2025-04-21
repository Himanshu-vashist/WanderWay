const express=require("express");
const router=express.Router();
const wrapAsync = require("../utils/wrapAsync");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");

const listingController=require("../controllers/listings.js");

const ExpressError=require("../utils/ExpressError.js");
const multer  = require('multer');
const { storage }= require("../cloudConfig.js");
const upload = multer({ storage });



const Listing=require("../models/listing.js");






router
   .route("/")
       .get(wrapAsync(listingController.index))
   .post(
        isLoggedIn,
        upload.single("image"),
        wrapAsync(listingController.createListing)
        );


//new route
router.get("/new",
isLoggedIn,
listingController.renderNewForm);


//show & update & delete route merge
router
     .route("/:id")
         .get(wrapAsync(listingController.showListing))
         .put(
            (req, res, next) => {
              console.log('Update route accessed for listing ID:', req.params.id);
              console.log('Request body:', req.body);
              next();
            },
            isLoggedIn,
            isOwner,
            upload.single("image"),
            // Temporarily disable validation for debugging
            // validateListing,
            wrapAsync(listingController.updateListing))
         .delete(
            isLoggedIn,
            isOwner,
            wrapAsync(listingController.destroyListing)
            );

//edit route
router.get("/:id/edit",
  (req, res, next) => {
    console.log('Edit route accessed for listing ID:', req.params.id);
    next();
  },
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);







module.exports= router;