const request = require('supertest');
const express = require('express');
const authRoutes = require('../backend/routes/authRoutes');
const errorHandler = require('../backend/middleware/errorHandler');
const authService = require('../backend/services/auth.service');

// Mock the auth service
jest.mock('../backend/services/auth.service', () => ({
  registerUser: jest.fn(),
  login: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use(errorHandler);

describe('Auth API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and return 201', async () => {
      const userData = { username: 'testuser', password: 'password123', email: 'test@example.com' };
      const registeredUser = { _id: 'someUserId', ...userData };

      authService.registerUser.mockResolvedValue(registeredUser);

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.data).toEqual(expect.objectContaining(userData));
      expect(authService.registerUser).toHaveBeenCalledWith(userData);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login a user and return a token', async () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      const token = 'somejwttoken';

      authService.login.mockResolvedValue({ token });

      const res = await request(app)
        .post('/api/auth/login')
        .send(credentials);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.token).toEqual(token);
      expect(authService.login).toHaveBeenCalledWith(credentials.email, credentials.password);
    });
  });
});
