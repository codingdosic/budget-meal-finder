const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {

    // 문서는 OpenAPI 3.0 표준을 따름
    openapi: '3.0.0',

    // 문서 기본 정보 
    info: {

      // 제목, 버전, 설명
      title: 'Budget Meal Finder API',
      version: '1.0.0',
      description: 'API documentation for the Budget Meal Finder application.',
    },

    // 서버 설정(현재는 테스트 서버만 정의)
    servers: [
      {

        // api 서버의 기본 URL 설정
        url: 'http://localhost:3000',
      },
    ],

    // 공통 요소 정의 
    components: {

      // 보안 스키마 정의
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },

    // 전역 보안 설정
    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  // jsdoc 주석 파일 경로 설정
  apis: ['./backend/routes/*.js'], // Path to the API docs
};

// 문서 스펙 생성
const specs = swaggerJsdoc(options);

module.exports = specs;
