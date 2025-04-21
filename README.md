# WanderWay - Travel Accommodation Platform

WanderWay is a web application for finding and listing travel accommodations around the world. Users can browse listings, create their own listings, leave reviews, and more.

## Features

- User authentication (signup, login, logout)
- Browse listings with filters
- Create, edit, and delete listings
- Leave reviews on listings
- Interactive maps for location visualization
- Responsive design for all devices

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript, Bootstrap 5, EJS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: Passport.js
- **Image Storage**: Cloudinary
- **Maps**: MapBox API
- **Deployment**: Render

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- Cloudinary account
- MapBox account

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
ATLASDB_URL=your_mongodb_atlas_connection_string
SECRET=your_session_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
MAP_TOKEN=your_mapbox_token
```

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/wanderway.git
   cd wanderway
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Seed the database with sample data:
   ```
   npm run seed
   ```

4. Start the application:
   ```
   npm start
   ```

5. Open your browser and navigate to `http://localhost:8080`

## Database Seeding

To populate the database with sample listings and users:

```
npm run seed
```

This will create:
- Sample listings with images and locations
- Test users with the following credentials:
  - Username: admin, Password: password123
  - Username: traveler, Password: password123
  - Username: explorer, Password: password123

## Deployment

### Deploying on Render

The application is configured for deployment on Render. Follow these steps:

1. Create a [Render](https://render.com/) account
2. Click on the "New +" button and select "Web Service"
3. Connect your GitHub repository or use the "Public Git repository" option
4. Fill in the following details:
   - **Name**: wanderway (or your preferred name)
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node app.js`
5. Under the "Advanced" section, add the following environment variables:
   ```
   ATLASDB_URL=your_mongodb_atlas_connection_string
   SECRET=your_session_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   MAP_TOKEN=your_mapbox_token
   ```
6. Click "Create Web Service"

Render will automatically deploy your application and provide you with a URL to access it.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Images from Unsplash
- Icons from Font Awesome
- Bootstrap for UI components
