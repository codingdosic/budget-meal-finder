const mongoose = require('mongoose');

// 메뉴 스키마 정의
const menuSchema = new mongoose.Schema({

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

  // 주소
  address: { type: String },

  // 위치(GeoJSON)
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }
  },
});

// GeoJSON 인덱스 설정
menuSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Menu', menuSchema);
