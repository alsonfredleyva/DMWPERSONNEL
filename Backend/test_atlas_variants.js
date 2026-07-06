const mongoose = require('mongoose');

const uris = [
  'mongodb+srv://dmwrox:KHuMrxUeh1dkjBqt@cluster0.u4ijswb.mongodb.net/dmwrox?retryWrites=true&w=majority',
  'mongodb+srv://dmwrox:KHuMrxUeh1dkjBqt@cluster0.u4ijswb.mongodb.net/dmwrox?authSource=admin&retryWrites=true&w=majority',
  'mongodb+srv://dmwrox:KHuMrxUeh1dkjBqt@cluster0.u4ijswb.mongodb.net/admin?authSource=admin&retryWrites=true&w=majority',
  'mongodb+srv://dmwrox:KHuMrxUeh1dkjBqt@cluster0.u4ijswb.mongodb.net/?authSource=admin&retryWrites=true&w=majority'
];

(async () => {
  for (const uri of uris) {
    console.log('Testing:', uri);
    try {
      await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
      console.log('SUCCESS');
      await mongoose.disconnect();
    } catch (err) {
      console.error('FAILED', err.name, err.message);
    }
    console.log('---');
  }
})();
