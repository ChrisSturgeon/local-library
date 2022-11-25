const mongoose = require('mongoose');
const { stringify } = require('querystring');

const Schema = mongoose.Schema;

const genreSchema = new Schema({
  name: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 100,
  },
});

// Virtual for genre's URL
genreSchema.virtual('url').get(function () {
  return `/catalog/genre/${this._id}`;
});

// Export the model
module.exports = mongoose.model('genre', genreSchema);
