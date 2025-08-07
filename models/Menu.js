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

  // 추천수
  recommendations: { type: Number, default: 0 },

  // 비추천수
  disrecommendations: { type: Number, default: 0 },

  // 카테고리
  category: { type: String, default: '기타' },

  // 생성일시
  createdAt: { type: Date, default: Date.now },

  // 이미지 URL
  imageUrl: { type: String },
});

module.exports = mongoose.model('Menu', menuSchema);
