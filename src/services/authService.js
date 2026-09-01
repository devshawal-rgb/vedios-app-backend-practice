import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export class AuthService {
  static generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'supersecretjwtkey_videoapp_2026', {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
  }

  static async registerUser({ name, email, password, role }) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user'
    });

    const token = this.generateToken(user._id);
    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      },
      token
    };
  }

  static async loginUser({ email, password }) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      throw new Error('Your account is deactivated. Contact admin.');
    }

    const token = this.generateToken(user._id);
    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      },
      token
    };
  }
}
