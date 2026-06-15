import { loginUser, registerUser } from '../services/authService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const result = await registerUser(req.body);

  res.status(201).json({
    message: 'Registration successful',
    ...result
  });
});

export const login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.body);

  res.json({
    message: 'Login successful',
    ...result
  });
});
