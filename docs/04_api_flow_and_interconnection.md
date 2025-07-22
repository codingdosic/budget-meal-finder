# 04_API_동작_방식_및_상호_연결_구조.md

## 📝 작업 내용

- `Restaurant` 및 `Menu` 모델을 기반으로 구현된 백엔드 API의 전체적인 흐름과 각 엔드포인트의 역할, 그리고 데이터 모델 간의 상호 연결 관계를 문서화한다.

## ⚙️ API 엔드포인트 상세 설명

### 1. 사용자 인증 (Authentication)

사용자 인증은 JWT(JSON Web Token)를 기반으로 동작하며, 보호된 API에 접근하기 위한 첫 단계이다.

- **`POST /api/register`**: 새로운 사용자를 생성한다.
- **`POST /api/login`**: 사용자 정보를 확인하고, 성공 시 JWT 토큰을 발급한다.
- **`authMiddleware`**: 라우터에 적용되는 미들웨어로, 요청 헤더의 `Authorization: Bearer <token>` 값을 검증하여 사용자를 인증한다. 인증이 필요한 모든 API는 이 미들웨어를 통과해야 한다.

### 2. 식당 (Restaurant) API

식당 정보는 `Restaurant` 모델을 통해 관리된다.

- **`POST /api/restaurants` (인증 필요)**
  - **동작**: `authMiddleware`를 통과한 사용자가 새로운 식당 정보를 등록한다.
  - **요청**: `name`, `address`, `location` (GeoJSON), `category`를 `body`에 담아 전송한다.
  - **연결**: 요청을 보낸 사용자의 ID(`req.user.userId`)가 해당 식당의 `createdBy` 필드에 저장되어, 누가 식당을 등록했는지 기록한다.

- **`GET /api/restaurants`**
  - **동작**: 전체 식당 목록을 조회한다. 인증이 필요 없다.

- **`GET /api/restaurants/:id`**
  - **동작**: 특정 ID를 가진 식당의 상세 정보를 조회한다. 인증이 필요 없다.

### 3. 메뉴 (Menu) API

메뉴 정보는 `Menu` 모델을 통해 관리되며, 항상 특정 식당(`Restaurant`)에 종속된다.

- **`POST /api/restaurants/:restaurantId/menus` (인증 필요)**
  - **동작**: 특정 식당에 새로운 메뉴를 추가한다.
  - **요청**: URL의 `:restaurantId`를 통해 어떤 식당에 메뉴를 추가할지 지정하고, `name`, `price`, `description`을 `body`에 담아 전송한다.
  - **연결**: `Menu` 모델의 `restaurantId` 필드에 해당 식당의 ID가 저장되어, 메뉴와 식당 간의 1:N 관계를 형성한다.

- **`GET /api/restaurants/:restaurantId/menus`**
  - **동작**: 특정 식당에 속한 모든 메뉴 목록을 조회한다.

- **`PUT /api/menus/:id` (인증 필요)**
  - **동작**: 특정 메뉴의 정보를 수정한다. (현재 구현에서는 메뉴를 등록한 사용자만 수정할 수 있는 권한 확인 로직은 추가되지 않았지만, 추후 확장이 가능하다.)

- **`DELETE /api/menus/:id` (인증 필요)**
  - **동작**: 특정 메뉴를 삭제한다.

### 4. 핵심 검색 API

이 프로젝트의 핵심 기능으로, 여러 모델의 정보를 복합적으로 활용하여 결과를 도출한다.

- **`GET /api/search`**
  - **동작**: 사용자의 위치와 예산에 맞는 메뉴를 검색하여 추천한다.
  - **요청**: 쿼리 파라미터로 `lat`(위도), `lon`(경도), `budget`(예산), `distance`(선택적, 검색 반경)를 받는다.
  - **연결 및 처리 흐름 (MongoDB Aggregation Pipeline)**:
    1.  **`$geoNear`**: `Restaurant` 컬렉션에서 요청된 좌표(`lon`, `lat`)를 기준으로 `distance` 반경 내에 있는 식당들을 찾고, 각 식당까지의 거리를 계산한다.
    2.  **`$lookup`**: 위 단계에서 찾은 식당들의 ID(`_id`)를 기준으로, `Menu` 컬렉션에서 `restaurantId`가 일치하는 모든 메뉴 문서를 가져와 각 식당 문서에 `menus` 배열로 첨부한다. (Restaurant-Menu 조인)
    3.  **`$unwind`**: `menus` 배열을 풀어, 각 메뉴가 개별적인 문서가 되도록 만든다. (예: 식당 A - 메뉴 1, 식당 A - 메뉴 2)
    4.  **`$match`**: `budget` 쿼리 파라미터 값보다 가격(`menus.price`)이 낮거나 같은 메뉴들만 필터링한다.
    5.  **`$project`**: 최종 결과에 필요한 정보(식당 이름, 주소, 거리, 메뉴 이름, 가격 등)만 선택하여 응답 형식을 맞춘다.

## 📊 데이터 모델 및 API 흐름도

```
[사용자] --1. 회원가입/로그인--> [인증 API] --2. JWT 발급--> [사용자]
   |
   | 3. (JWT와 함께) 식당 정보 등록 요청
   v
[식당 API] --4. createdBy 필드에 사용자 ID 저장--> [Restaurant 컬렉션]
   |
   | 5. (JWT와 함께) 메뉴 정보 등록 요청 (Restaurant ID 포함)
   v
[메뉴 API] --6. restaurantId 필드에 식당 ID 저장--> [Menu 컬렉션]

------------------------------------------------------------------

[사용자] --7. 위치, 예산 정보로 검색 요청--> [검색 API]
   |
   v
[Aggregation Pipeline]
   - (Restaurant) $geoNear: 위치 기반 식당 필터링
   - (Menu) $lookup: 식당에 메뉴 정보 조인
   - (Menu) $match: 예산 기반 메뉴 필터링
   |
   v
[사용자] <--8. 최종 결과 반환-- [검색 API]
```
