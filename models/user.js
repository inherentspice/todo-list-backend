const mongoose = require("mongoose");

const url = process.env.MONGODB_URI;

console.log("connecting to", url);

mongoose.connect(url)
  .then(result => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log(`error connecting to MongoDB`, error.message);
  })

const userSchema = new mongoose.Schema({
  username: {
      type: String,
      required: true,
      minLength: 1,
    },
  password: {
    type: String,
    required: true,
    minLength: 5,
  },
})

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
});

module.exports = mongoose.model('User', userSchema);
