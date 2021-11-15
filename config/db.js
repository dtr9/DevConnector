const mongoose = require('mongoose');

// mongoose.set('useNewUrlParser', true);
// mongoose.set('useUnifiedTopology', true);

const config = require('config');
const db = config.get('mongoURI');

const connectDB = async() => {
    try{
        await mongoose.connect(db, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        });
        console.log('MongoDB Connected...');
    }catch(err){
        console.log(err.message);
        //Exit the process upon Failure
        process.exit(1);
    }
};

module.exports = connectDB;