# 1. 베이스 이미지 선택
FROM node:18-alpine

# 2. 작업 디렉토리 설정
WORKDIR /usr/src/app

# 3. 종속성 설치
# package.json과 package-lock.json을 먼저 복사하여 npm install 실행
# 소스 코드가 변경되어도 종속성은 캐시된 레이어를 사용하도록 최적화
COPY package*.json ./
RUN npm install

# 4. 소스코드 복사
# backend, models 디렉토리와 같이 서버 실행에 필요한 파일들 복사
COPY backend/ ./backend/
COPY models/ ./models/
COPY frontend/ ./frontend/

# 5. 포트 노출
EXPOSE 3000

# 6. 실행 명령어 정의
CMD ["node", "backend/server.js"]
