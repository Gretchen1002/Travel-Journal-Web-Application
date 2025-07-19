/******************************************************************************** 
*  WEB322 – Assignment 05 
* 
*  I declare that this assignment is my own work and completed based on my 
*  current understanding of the course concepts. 
*  
*  The assignment was completed in accordance with: 
*  a. The Seneca's Academic Integrity Policy 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html 
*  
*  b. The academic integrity policies noted in the assessment description 
*   
*  I did NOT use generative AI tools (ChatGPT, Copilot, etc) to produce the code  
*  for this assessment. 
* 
*  Name: Gretchen Ding  Student ID: 123509242  
* 
*  Published URL: web-assignment3-alpha.vercel.app
********************************************************************************/ 


const HTTP_PORT = process.env.PORT || 8080;

const { name } = require("ejs");
const express = require("express");
const app = express();
app.use(express.static(__dirname + '/public'));
app.set("view engine", "ejs");      //ejs
app.set('views', __dirname + '/views'); //vercel

app.use(express.urlencoded({ extended: true })); //forms
require("dotenv").config() //reads values from .env file 

require('pg'); // explicitly require the "pg" module
const Sequelize = require('sequelize');


// +++ Database connection code
// +++ TODO: Remember to add your Neon.tech connection variables to the .env file!!
const { Sequelize } = require("sequelize")
const sequelize = new Sequelize(process.env.PGDATABASE, process.env.PGUSER, process.env.PGPASSWORD, {
  host: process.env.PGHOST,
  dialect: "postgres",
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
});

// +++  4. TODO: Define your database table
const Location = sequelize.define("Location",
{
   name: Sequelize.TEXT,
   address: Sequelize.TEXT,
   category: Sequelize.TEXT,
   comments: Sequelize.TEXT,
   image: Sequelize.TEXT 
},
{
    createdAt: false,
    updatedAt: false
}
);


// +++ 5. TODO: Define your server routes
app.get("/", async(req, res) => {    
    //get all locations from database
    try {
        const locationList = await Location.findAll();
        if(locationList.length === 0){
            return res.render("home.ejs", {locations: [ ]})
        }
        else{
            return res.render("home.ejs", {locations: locationList})
        }
        
    } catch (error) {
        console.log(error);
    }
})

app.get("/memories/add", (req, res) => {    
    return res.render("add.ejs")
})

//endpoint to receive form data and create new location
app.post("/memories/add", async(req, res)=>{
    console.log("Getting data from the form");
    console.log(req.body);

    try{
        await Location.create({name: req.body.name, address: req.body.address, 
            category: req.body.category, comments: req.body.comments, image: req.body.image});
        console.log("Location was created.")
        return res.redirect("/");
    } catch (err){
        console.log(err);
        return res.send("Error, please refresh the page and try again.")
    }
})

//endpoint for deleting a location
app.get("/memories/delete/:id", async(req, res)=>{
    try {
        await Location.destroy({where: {id: req.params.id}})
        console.log(`Deleted object ID: ${req.params.id}`);
    } catch (error) {
        console.log(error);
    }
    return res.redirect("/");

})

// +++  Function to start serer
async function startServer() {
    
    try {            
        await sequelize.authenticate();  //connect to the DB      
        await sequelize.sync() //generate the table

        console.log("SUCCESS connecting to database")
        console.log("STARTING Express web server")        
        
        app.listen(HTTP_PORT, () => {      
            console.log(`server listening on: http://localhost:${HTTP_PORT}`) 
        })    
    }    
    catch (err) {        
        console.log("ERROR: connecting to database")        
        console.log(err)
        console.log("Please resolve these errors and try again.")
    }
}

startServer()



