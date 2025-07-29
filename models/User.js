const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// User 스키마 정의
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },  
  password: { type: String, required: true },
  menus: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Menu' }]
});

// 스키마 save 이전 event 정의 
userSchema.pre('save', async function (next) {

  // 비밀번호가 수정되었을 경우에만 실행
  if (!this.isModified('password')){
    return next();
  }

  // 솔트값 생성
  const salt = await bcrypt.genSalt(10);

  // 해당 문서의 비밀번호를 솔트 값으로 해싱
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 비밀번호 비교 메서드 정의 
userSchema.methods.comparePassword = async function (enteredPassword) {
  
  // 현재 User 문서의 비밀번호와 입력된 비밀번호를 비교
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
