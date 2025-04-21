const express=require("express");
const Listing=require("./models/listing");
const Review=require("./models/review.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema} =require("./schema.js");
const {reviewSchema} =require("./schema.js");

module.exports.isLoggedIn =(req,res,next)=>{
    if(!req.isAuthenticated()){

       req.session.redirectUrl=req.originalUrl;
        req.flash("error","you must be logged in to create listing!");

        return res.redirect("/login");
      }
      next();
};

module.exports.saveRedirectUrl = (req,res,next) =>{
  if(req.session.redirectUrl){
    res.locals.redirectUrl=req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner= async(req,res,next)=>{
  try {
    let {id}= req.params;
    let listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    if (!listing.owner || !listing.owner.equals(res.locals.currUser._id)) {
      req.flash("error", "You are not the owner of this listing");
      return res.redirect(`/listings/${id}`);
    }

    next();
  } catch (err) {
    console.error("Error in isOwner middleware:", err);
    req.flash("error", "Something went wrong");
    return res.redirect("/listings");
  }
};

module.exports.validateListing = (req, res, next) => {
  try {
    // Log the request body for debugging
    console.log('Validating listing data:', JSON.stringify(req.body));

    const { error } = listingSchema.validate(req.body);

    if (error) {
      const errMsg = error.details.map((ele) => ele.message).join(", ");
      console.error('Validation error:', errMsg);
      throw new ExpressError(400, errMsg);
    } else {
      next();
    }
  } catch (err) {
    console.error('Error in validateListing middleware:', err);
    next(err);
  }
};

module.exports.validateReview = (req, res, next) => {
  try {
    // Log the request body for debugging
    console.log('Validating review data:', JSON.stringify(req.body));

    const { error } = reviewSchema.validate(req.body);

    if (error) {
      const errMsg = error.details.map((ele) => ele.message).join(", ");
      console.error('Review validation error:', errMsg);
      throw new ExpressError(400, errMsg);
    } else {
      next();
    }
  } catch (err) {
    console.error('Error in validateReview middleware:', err);
    next(err);
  }
};

module.exports.isReviewAuthor = async(req, res, next) => {
  try {
    let {id, reviewId} = req.params;
    let review = await Review.findById(reviewId);

    if (!review) {
      req.flash("error", "Review not found");
      return res.redirect(`/listings/${id}`);
    }

    if (!review.author || !review.author.equals(res.locals.currUser._id)) {
      req.flash("error", "You are not the author of this review");
      return res.redirect(`/listings/${id}`);
    }

    next();
  } catch (err) {
    console.error("Error in isReviewAuthor middleware:", err);
    req.flash("error", "Something went wrong");
    return res.redirect(`/listings/${req.params.id}`);
  }
};