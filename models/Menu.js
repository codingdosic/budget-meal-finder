// models/Menu.js
const mongoose = require('mongoose');

// 메뉴 스키마 정의
const menuSchema = new mongoose.Schema({

  // 식당 id 참조 필드
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },

  // 메뉴 이름
  name: { type: String, required: true },

  // 가격
  price: { type: Number, required: true },

  // 설명
  description: String,

  // 유저 이름
  username: { type: String, required: true },
});

module.exports = mongoose.model('Menu', menuSchema);
