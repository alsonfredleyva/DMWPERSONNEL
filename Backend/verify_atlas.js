const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');

const mongoUri = process.env.MONGODB_URI;
console.log('Testing MongoDB URI:', mongoUri);

mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Atlas connection successful');
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error('Atlas connection failed');
    console.error(err.message);
    if (err.name) console.error('Error name:', err.name);
    process.exit(1);
  });
