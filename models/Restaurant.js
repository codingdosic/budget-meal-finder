// models/Restaurant.js
const mongoose = require('mongoose');

// 식당 스키마 정의
const restaurantSchema = new mongoose.Schema({

  // 이름
  name: { type: String, required: true },

  // 주소
  address: { type: String, required: true },

  // 위치(GeoJSON)
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }
  },

  // 카테고리
  category: String,

  // 작성자 id 참조
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // 생성일시
  createdAt: { type: Date, default: Date.now }
});

// GeoJSON 인덱스 설정
restaurantSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Restaurant', restaurantSchema);
