const mongoose = require("mongoose");
require('dotenv').config();
const Listing = require("./models/listing.js");
const User = require("./models/user.js");
const Review = require("./models/review.js");
const initData = require("./init/data.js");

// Use Atlas URL from .env
const MONGO_URL = process.env.ATLASDB_URL;
console.log("Using MongoDB Atlas URL for seeding data");

// Sample user data
const sampleUsers = [
  {
    username: "admin",
    email: "admin@wanderway.com"
  },
  {
    username: "traveler",
    email: "traveler@wanderway.com"
  },
  {
    username: "explorer",
    email: "explorer@wanderway.com"
  }
];

// Sample reviews
const sampleReviews = [
  {
    comment: "Amazing place! The views were breathtaking and the accommodation was perfect.",
    rating: 5
  },
  {
    comment: "Great location, very clean and comfortable. Would definitely recommend!",
    rating: 4
  },
  {
    comment: "Wonderful experience. The host was very helpful and friendly.",
    rating: 5
  },
  {
    comment: "Good value for money. The place was as described.",
    rating: 4
  },
  {
    comment: "Nice place but a bit overpriced for what it offers.",
    rating: 3
  }
];

// Connect to MongoDB
async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("Connected to MongoDB Atlas");
}

// Seed the database
async function seedDB() {
  try {
    // Clear existing data
    await Listing.deleteMany({});
    await User.deleteMany({});
    await Review.deleteMany({});
    console.log("Cleared existing data");

    // Create users
    const users = [];
    for (const userData of sampleUsers) {
      const user = new User({
        email: userData.email,
        username: userData.username
      });
      const registeredUser = await User.register(user, "password123");
      users.push(registeredUser);
      console.log(`Created user: ${userData.username}`);
    }

    // Create listings with the first user as owner
    const listings = [];
    for (const listingData of initData.data) {
      const listing = new Listing({
        ...listingData,
        owner: users[0]._id,
        geometry: {
          type: "Point",
          coordinates: [
            listingData.geometry.longitude || 0,
            listingData.geometry.latitude || 0
          ]
        }
      });
      await listing.save();
      listings.push(listing);
      console.log(`Created listing: ${listingData.title}`);
    }

    // Add reviews to listings
    for (const listing of listings) {
      // Add 1-3 random reviews to each listing
      const numReviews = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < numReviews; i++) {
        const randomReviewData = sampleReviews[Math.floor(Math.random() * sampleReviews.length)];
        const randomUser = users[Math.floor(Math.random() * users.length)];
        
        const review = new Review({
          comment: randomReviewData.comment,
          rating: randomReviewData.rating,
          author: randomUser._id
        });
        
        await review.save();
        listing.reviews.push(review);
        console.log(`Added review to listing: ${listing.title}`);
      }
      
      await listing.save();
    }

    console.log("Database seeded successfully!");
  } catch (err) {
    console.error("Error seeding database:", err);
  } finally {
    mongoose.connection.close();
  }
}

// Run the seeding function
main()
  .then(() => {
    return seedDB();
  })
  .catch((err) => {
    console.error("Error:", err);
  });
