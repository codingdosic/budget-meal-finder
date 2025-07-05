// models/Menu.js
const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
  name: String,
  price: Number,
  description: String,
});

module.exports = mongoose.model('Menu', menuSchema);
