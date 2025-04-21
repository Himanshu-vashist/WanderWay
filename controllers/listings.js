const Listing = require("../models/listing");
const mapToken = process.env.MAP_TOKEN;
var NodeGeocoder = require('node-geocoder');
var options = {
    provider: 'tomtom',

    // Optionnal depending of the providers
    httpAdapter: 'https', // Default
    apiKey: mapToken, // for Mapquest, OpenCage, Google Premier
    formatter: null         // 'gpx', 'string', ...
  };

  const geocoder = NodeGeocoder(options);


module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};


module.exports.renderNewForm = (req, res) => {
    res.render("./listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    try {
        let { id } = req.params;
        const listing = await Listing.findById(id)
            .populate({ path: "reviews", populate: { path: "author" } })
            .populate("owner");

        if (!listing) {
            req.flash("error", "Listing you requested does not exist!");
            return res.redirect("/listings");
        }

        // Log listing data for debugging
        console.log('Listing data:', listing);
        console.log('Geometry data:', listing.geometry);

        // Pass the listing and map token to the template
        res.render("./listings/show.ejs", {
            listing,
            mapToken
        });
    } catch (error) {
        console.error("Error showing listing:", error);
        req.flash("error", "Something went wrong: " + error.message);
        res.redirect("/listings");
    }
};

module.exports.createListing = async (req, res, next) => {
    try {
        // Create new listing from form data
        let newlisting = new Listing(req.body.listing);
        newlisting.owner = req.user._id;

        // Handle image upload
        if (req.file) {
            console.log('Image uploaded:', req.file);
            let url = req.file.path;
            let filename = req.file.filename;
            newlisting.image = {url, filename};
        } else {
            console.log('No image uploaded');
            // Set a default image if needed
            newlisting.image = {
                url: 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60',
                filename: 'default-listing-image'
            };
        }

        // Handle geocoding
        try {
            const response = await geocoder.geocode(req.body.listing.location);
            if (response && response.length > 0) {
                newlisting.geometry = {
                    type: 'Point',
                    coordinates: [response[0].longitude, response[0].latitude]
                };
            } else {
                // Default coordinates if geocoding fails
                newlisting.geometry = {
                    type: 'Point',
                    coordinates: [0, 0]
                };
            }
        } catch (geocodeError) {
            console.error("Geocoding error:", geocodeError);
            // Default coordinates if geocoding fails
            newlisting.geometry = {
                type: 'Point',
                coordinates: [0, 0]
            };
        }

        // Save the new listing
        await newlisting.save();
        req.flash("success", "New listing created!");
        res.redirect("/listings");
    } catch (error) {
        console.error("Error creating listing:", error);
        req.flash("error", "Failed to create listing: " + error.message);
        res.redirect("/listings/new");
    }
};

module.exports.renderEditForm = async (req, res) => {
    try {
        let { id } = req.params;
        const listing = await Listing.findById(id);

        if (!listing) {
            req.flash("error", "Listing you requested does not exist!");
            return res.redirect("/listings");
        }

        // Process image URL for display
        let originalImageUrl = "";
        if (listing.image && listing.image.url) {
            originalImageUrl = listing.image.url;
            originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");
        }

        res.render("./listings/edit.ejs", { listing, originalImageUrl });
    } catch (error) {
        console.error("Error rendering edit form:", error);
        req.flash("error", "Something went wrong: " + error.message);
        res.redirect("/listings");
    }
};

module.exports.updateListing = async (req, res) => {
    try {
        let { id } = req.params;
        let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

        if (!listing) {
            req.flash("error", "Listing not found!");
            return res.redirect("/listings");
        }

        // Update image if a new one is provided
        if (req.file) {
            console.log('New image uploaded:', req.file);
            let url = req.file.path;
            let filename = req.file.filename;
            listing.image = { url, filename };
        } else {
            console.log('No new image uploaded, keeping existing image');
        }

        // Update geometry with geocoding
        try {
            const response = await geocoder.geocode(req.body.listing.location);
            if (response && response.length > 0) {
                listing.geometry = {
                    type: 'Point',
                    coordinates: [response[0].longitude, response[0].latitude]
                };
            }
        } catch (geocodeError) {
            console.error("Geocoding error:", geocodeError);
            // Continue without updating geometry if geocoding fails
        }

        // Save the updated listing
        await listing.save();

        req.flash("success", "Listing Updated!");
        res.redirect(`/listings/${id}`);
    } catch (error) {
        console.error("Error updating listing:", error);
        req.flash("error", "Failed to update listing: " + error.message);
        res.redirect(`/listings/${req.params.id}/edit`);
    }
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};


module.exports.filter = async(req,res,next)=>{
    let {id} = req.params;
    let allListings = await Listing.find({category: id});
    if(allListings.length != 0){
        res.render("listings/index.ejs", { allListings });
    }else{
        req.flash("error",`No listing with ${id}`);
        res.redirect("/listings")
    }
}

module.exports.search = async (req, res) => {
    let { location } = req.query;

    const allListings = await Listing.find({ location });
    res.render("./listings/index.ejs", { allListings });
};
