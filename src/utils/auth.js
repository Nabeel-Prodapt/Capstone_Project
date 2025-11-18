// src/utils/auth.js
import jwtDecode from 'jwt-decode';

export function getUserRole() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    // Adjust according to your token payload structure
    return decoded.role || (decoded.authorities && decoded.authorities[0]) || null;
  } catch (error) {
    console.error('Invalid JWT token', error);
    return null;
  }
}