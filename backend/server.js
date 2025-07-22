require('dotenv').config(); // 💡 최상단에 위치해야 함

const express = require('express');
const connectDB = require('./db/db');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant'); // 🚀 식당 모델 추가
const Menu = require('../models/Menu'); // 🚀 메뉴 모델 추가
const jwt = require('jsonwebtoken');

const app = express();
connectDB();

app.use(express.json());

// JWT 인증 미들웨어
const authMiddleware = async (req, res, next) => {

  // 요청 헤더에서 'Authorization' 값을 가져옵니다.
  const authHeader = req.header('Authorization');

  // 'Authorization' 헤더가 없으면 401 Unauthorized 에러를 보냅니다.
  if (!authHeader) {
    return res.status(401).send('Access denied. No token provided.');
  }

  // 'Bearer ' 접두사를 제거하여 실제 토큰 값만 추출합니다.
  const token = authHeader.replace('Bearer ', '');

  try {
    // jwt.verify 함수를 사용해 토큰의 유효성을 검사합니다.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 유효한 토큰이면, 해독된 사용자 ID를 요청 객체(req)에 추가합니다.
    req.user = decoded;

    // 다음 미들웨어 또는 라우트 핸들러로 제어를 넘깁니다.
    next();

  } catch (error) {
    // 토큰이 유효하지 않으면 400 Bad Request 에러를 보냅니다.
    res.status(400).send('Invalid token.');
  }
};


// 회원가입
app.post('/api/register', async (req, res) => {
  try {

    // 요청 본문에서 사용자 이름, 이메일, 비밀번호 추출
    const { username, email, password } = req.body;

    // 새로운 User 인스턴스 생성
    const user = new User({ username, email, password });

    // 사용자 정보를 데이터베이스에 저장 (비밀번호는 pre-save 훅에서 해싱됨)
    await user.save();

    // 성공 응답 전송 (상태 코드 201: Created)
    res.status(201).send('User created');
  } catch (error) {

    // 에러 발생 시, 상태 코드 400과 에러 메시지 전송
    res.status(400).send(error.message);
  }
});

// 로그인 API 엔드포인트 정의
app.post('/api/login', async (req, res) => {
  try {

    // 요청 본문에서 이메일과 비밀번호 추출
    const { email, password } = req.body;

    // 이메일을 사용하여 데이터베이스에서 사용자 찾기
    const user = await User.findOne({ email });

    // 사용자가 존재하지 않으면 에러 응답 전송
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // 사용자가 입력한 비밀번호와 저장된 해시된 비밀번호 비교
    const isMatch = await user.comparePassword(password);

    // 비밀번호가 일치하지 않으면 에러 응답 전송
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // JWT(JSON Web Token) 생성 (사용자 ID와 환경 변수에 저장된 비밀 키 사용, 1시간 유효)
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // 생성된 토큰을 JSON 형태로 응답 전송
    res.json({ token });

  } catch (error) {
    // 서버 에러 발생 시, 상태 코드 500과 에러 메시지 전송
    res.status(500).json({ error: error.message });
  }
});


// 🚀 [POST] 새로운 식당 정보 등록 (인증 필요)
app.post('/api/restaurants', authMiddleware, async (req, res) => {
  try {

    // 요청 본문에서 식당 이름, 주소, 위치 좌표, 카테고리 추출
    const { name, address, location, category } = req.body;

    // 새로운 Restaurant 인스턴스 생성
    const restaurant = new Restaurant({
      name, // 식당 이름
      address, // 식당 주소
      location, // GeoJSON 형식의 위치 정보
      category, // 식당 카테고리
      createdBy: req.user.userId, // 인증된 사용자의 ID를 작성자로 기록
    });

    // 식당 정보를 데이터베이스에 저장
    await restaurant.save();

    // 성공 응답 전송 (상태 코드 201: Created)
    res.status(201).json(restaurant);

  } catch (error) {
    // 에러 발생 시, 상태 코드 400과 에러 메시지 전송
    res.status(400).json({ message: error.message });
  }
});

// 🚀 [GET] 전체 식당 목록 조회
app.get('/api/restaurants', async (req, res) => {
  try {

    // 데이터베이스에서 모든 식당 정보를 찾아옴
    const restaurants = await Restaurant.find();

    // 조회된 식당 목록을 JSON 형태로 응답
    res.json(restaurants);

  } catch (error) {
    // 서버 에러 발생 시, 상태 코드 500과 에러 메시지 전송
    res.status(500).json({ message: error.message });
  }
});

// 🚀 [GET] 특정 ID의 식당 정보 조회
app.get('/api/restaurants/:id', async (req, res) => {
  try {

    // 요청 URL의 파라미터에서 식당 ID를 가져와 해당 식당 정보를 조회
    const restaurant = await Restaurant.findById(req.params.id);

    // 식당 정보가 없으면 404 Not Found 에러 전송
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // 조회된 식당 정보를 JSON 형태로 응답
    res.json(restaurant);

  } catch (error) {
    // 서버 에러 발생 시, 상태 코드 500과 에러 메시지 전송
    res.status(500).json({ message: error.message });
  }
});

// 🚀 [POST] 특정 식당에 메뉴 추가 (인증 필요)
app.post('/api/restaurants/:restaurantId/menus', authMiddleware, async (req, res) => {
  try {

    // URL 파라미터에서 레스토랑 ID를 가져옵니다.
    const { restaurantId } = req.params;

    // 요청 본문에서 메뉴 이름, 가격, 설명을 가져옵니다.
    const { name, price, description } = req.body;

    // 새로운 메뉴 인스턴스를 생성합니다.
    const menu = new Menu({
      restaurantId, // 메뉴가 속한 레스토랑의 ID
      name, // 메뉴 이름
      price, // 메뉴 가격
      description, // 메뉴 설명
    });

    // 생성된 메뉴를 데이터베이스에 저장합니다.
    await menu.save();

    // 성공적으로 메뉴가 생성되었음을 알리는 201 상태 코드와 함께 메뉴 정보를 응답합니다.
    res.status(201).json(menu);

  } catch (error) {
    // 오류 발생 시 400 상태 코드와 오류 메시지를 응답합니다.
    res.status(400).json({ message: error.message });
  }
});

// 🚀 [GET] 특정 식당의 메뉴 목록 조회
app.get('/api/restaurants/:restaurantId/menus', async (req, res) => {

  try {
    // URL 파라미터에서 레스토랑 ID를 가져옵니다.
    const { restaurantId } = req.params;

    // 해당 레스토랑 ID를 가진 모든 메뉴를 데이터베이스에서 찾습니다.
    const menus = await Menu.find({ restaurantId });

    // 찾은 메뉴 목록을 JSON 형태로 응답합니다.
    res.json(menus);

  } catch (error) {
    // 서버 오류 발생 시 500 상태 코드와 오류 메시지를 응답합니다.
    res.status(500).json({ message: error.message });
  }
});

// 🚀 [PUT] 특정 메뉴 정보 수정 (인증 필요)
app.put('/api/menus/:id', authMiddleware, async (req, res) => {
  try {

    // URL 파라미터에서 메뉴 ID를 가져옵니다.
    const { id } = req.params;

    // 요청 본문에서 업데이트할 데이터를 가져옵니다.
    const { name, price, description } = req.body;

    // 메뉴 ID로 메뉴를 찾고, 내용을 업데이트합니다. { new: true } 옵션은 업데이트된 문서를 반환하도록 합니다.
    const updatedMenu = await Menu.findByIdAndUpdate(id, { name, price, description }, { new: true });

    // 업데이트할 메뉴를 찾지 못한 경우 404 오류를 응답합니다.
    if (!updatedMenu) {
      return res.status(404).json({ message: 'Menu not found' });
    }

    // 성공적으로 업데이트된 메뉴 정보를 응답합니다.
    res.json(updatedMenu);

  } catch (error) {
    // 오류 발생 시 400 상태 코드와 오류 메시지를 응답합니다.
    res.status(400).json({ message: error.message });
  }
});

// 🚀 [DELETE] 특정 메뉴 삭제 (인증 필요)
app.delete('/api/menus/:id', authMiddleware, async (req, res) => {
  try {

    // URL 파라미터에서 메뉴 ID를 가져옵니다.
    const { id } = req.params;

    // 해당 ID의 메뉴를 찾아 삭제합니다.
    const deletedMenu = await Menu.findByIdAndDelete(id);

    // 삭제할 메뉴를 찾지 못한 경우 404 오류를 응답합니다.
    if (!deletedMenu) {
      return res.status(404).json({ message: 'Menu not found' });
    }

    // 성공적으로 삭제되었음을 알리는 메시지를 응답합니다.
    res.json({ message: 'Menu deleted successfully' });

  } catch (error) {
    // 서버 오류 발생 시 500 상태 코드와 오류 메시지를 응답합니다.
    res.status(500).json({ message: error.message });
  }
});

// 🚀 [GET] 위치와 예산 기반 메뉴 검색
app.get('/api/search', async (req, res) => {
  try {
    
    // 쿼리 파라미터에서 위도(lat), 경도(lon), 예산(budget), 검색 반경(distance)을 추출합니다.
    const { lat, lon, budget, distance = 2000 } = req.query;

    // 위도, 경도, 예산 값이 없으면 400 오류를 반환합니다.
    if (!lat || !lon || !budget) {
      return res.status(400).json({ message: 'Latitude, longitude, and budget are required.' });
    }

    // MongoDB Aggregation Pipeline을 정의합니다.
    const results = await Restaurant.aggregate([
      // 1. $geoNear: 현재 위치에서 가까운 식당을 검색합니다.
      {
        $geoNear: {
          near: {
            type: 'Point', // 검색 기준점의 타입
            coordinates: [parseFloat(lon), parseFloat(lat)], // 경도, 위도 순서로 좌표를 배열로 제공
          },
          distanceField: 'dist.calculated', // 계산된 거리를 저장할 필드 이름
          maxDistance: parseInt(distance), // 최대 검색 반경 (미터 단위)
          spherical: true, // 구형 지구 모델을 사용하여 거리를 계산
        },
      },
      // 2. $lookup: 'menus' 컬렉션과 조인하여 각 식당의 메뉴 정보를 가져옵니다.
      {
        $lookup: {
          from: 'menus', // 조인할 컬렉션 이름
          localField: '_id', // 'restaurants' 컬렉션의 조인 키 (식당 ID)
          foreignField: 'restaurantId', // 'menus' 컬렉션의 조인 키 (식당 ID)
          as: 'menus', // 조인된 메뉴 정보를 저장할 배열 필드 이름
        },
      },
      // 3. $unwind: 'menus' 배열을 개별 문서로 분리합니다.
      {
        $unwind: '$menus',
      },
      // 4. $match: 예산(budget)보다 가격(price)이 낮거나 같은 메뉴만 필터링합니다.
      {
        $match: {
          'menus.price': { $lte: parseInt(budget) },
        },
      },
      // 5. $project: 최종 결과의 형식을 지정합니다.
      {
        $project: {
          _id: 0, // 결과에서 _id 필드 제외
          restaurantName: '$name', // 식당 이름
          restaurantAddress: '$address', // 식당 주소
          distance: '$dist.calculated', // 계산된 거리
          menuName: '$menus.name', // 메뉴 이름
          menuPrice: '$menus.price', // 메뉴 가격
        },
      },
    ]);

    // 검색 결과를 JSON 형태로 응답합니다.
    res.json(results);
  } catch (error) {
    // 서버 오류 발생 시 500 상태 코드와 오류 메시지를 응답합니다.
    res.status(500).json({ message: error.message });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
