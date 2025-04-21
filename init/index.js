const mongoose = require("mongoose");
require('dotenv').config();
const MONGO_URL = process.env.ATLASDB_URL;
const initData = require("./data_updated.js");
const Listing=require("../models/listing.js");

console.log("Using MongoDB Atlas URL for initialization");
async function main(){
  await mongoose.connect(MONGO_URL);
}
main()
  .then(()=>{
    console.log("connected to DB");
  })
  .catch((err)=>{
    console.log(err);
  });


  const initDB =async () =>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({...obj,owner: "657df8711ea745a0c244caee"}));
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
  };
  initDB();
