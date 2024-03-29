const express = require("express");
const connectDB = require('./config/db.js');
const gravatar = require('gravatar');
const path = require('path');

const app = express();

// Connect Database
connectDB();
  

//Inig Middlware
app.use(express.json({extended: false}));

 
// Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/profile', require('./routes/api/profile'));
//console.log("all middlewares working");

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static('client/build'));
  
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

console.log("checking for port")
const PORT = process.env.PORT || 5000;
console.log("selected port: " + PORT);
app.listen(PORT,function(){
    console.log(`Server started on port ${PORT}`);
})
