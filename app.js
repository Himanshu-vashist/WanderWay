if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const path = require("path");
const ExpressError = require("./utils/ExpressError.js");
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const wrapAsync = require("./utils/wrapAsync.js");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// MongoDB URL - Use Atlas URL from .env
const MONGO_URL = process.env.ATLASDB_URL;
console.log("Using MongoDB Atlas URL for the application");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine('ejs', ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

// Log method override for debugging
app.use((req, res, next) => {
  if (req.query._method) {
    console.log(`Method override: ${req.method} to ${req.query._method}`);
  }
  next();
});

app.use(express.static(path.join(__dirname, "/public")));

// Configure MongoDB session store
const store = MongoStore.create({
  mongoUrl: MONGO_URL,
  crypto: {
      secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600 // Only update the session every 24 hours
});

// Error handling for session store
store.on("error", (err) => {
  console.log("Error in Mongo session store", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 week
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
  }
};

app.use(session(sessionOptions));
app.use(flash());

// Passport configuration for user authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Connect to MongoDB
async function main() {
  await mongoose.connect(MONGO_URL);
}
main()
  .then(() => {
      console.log("Connected to DB");
  })
  .catch((err) => {
      console.log("DB Connection Error:", err);
  });

// Middleware for setting local variables
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// Define routes
app.get("/home", (req, res) => {
  res.render("listings/home.ejs");
});
app.get("/", (req, res) => {
  res.render("listings/home.ejs");
});
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/listings", listingsRouter);
app.use("/", userRouter);

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Handle all other routes as 404
app.all("*", (req, res, next) => {
  console.log(`404 Not Found: ${req.method} ${req.originalUrl}`);
  next(new ExpressError(404, `Page Not Found! Route: ${req.originalUrl}`));
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error("ERROR:", err);
  const { statusCode = 500, message = "Something went wrong" } = err;

  if (!res.headersSent) {
    req.flash("error", message);

    // For validation errors, redirect back to the form
    if (err.name === "ValidationError" || statusCode === 400) {
      return res.redirect(req.originalUrl);
    }

    // For 404 errors, redirect to listings page
    if (statusCode === 404) {
      return res.redirect("/listings");
    }

    // For other errors, render the error page
    res.status(statusCode).render("error.ejs", {
      message,
      statusCode,
      error: process.env.NODE_ENV === "development" ? err : {}
    });
  }
});

// Start server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
