// utils/SessionHelper.js
import Cookies from 'js-cookie';

// ============ TOKEN MANAGEMENT ============
export const setAuthToken = (token) => {
  if (typeof window !== 'undefined') {
    // Keep both keys for backward compatibility.
    Cookies.set('authToken', token, {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/'
    });
    Cookies.set('token', token, {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/'
    });
    localStorage.setItem('authToken', token);
    localStorage.setItem('token', token);
  }
};

export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    // Cookie is the single source of truth — the Next.js middleware can only
    // read cookies, so falling back to localStorage here would desync the two
    // (cookie expired, localStorage still set) and cause a /dashboard <-> /
    // redirect loop. If the cookie is gone the session is over.
    const token = Cookies.get('authToken') || Cookies.get('token');
    if (!token) {
      // Cookie expired/removed: drop any stale localStorage token so nothing
      // else treats the user as logged in.
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      return null;
    }
    return token;
  }
  return null;
};

// ============ EMAIL MANAGEMENT ============
export const setEmail = (email) => {
  if (typeof window !== 'undefined') {
    Cookies.set('email', email, {
      expires: 1,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/'
    });
    localStorage.setItem('email', email);
  }
};

export const getEmail = () => {
  if (typeof window !== 'undefined') {
    return Cookies.get('email') || localStorage.getItem('email');
  }
  return null;
};

// ============ OTP MANAGEMENT ============
export const setOTP = (otp) => {
  if (typeof window !== 'undefined') {
    Cookies.set('otp', otp, {
      expires: 1 / 24,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/'
    });
    localStorage.setItem('otp', otp);
  }
};

export const getOTP = () => {
  if (typeof window !== 'undefined') {
    return Cookies.get('otp') || localStorage.getItem('otp');
  }
  return null;
};

// ============ USER DETAILS MANAGEMENT ============
export const setUserDetails = (user) => {
  if (typeof window !== 'undefined') {
    const userStr = JSON.stringify(user);
    Cookies.set('userDetails', userStr, {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/'
    });
    Cookies.set('user', userStr, {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/'
    });
    localStorage.setItem('userDetails', userStr);
    localStorage.setItem('user', userStr);
  }
};

export const getUserDetails = () => {
  if (typeof window !== 'undefined') {
    const userStr =
      Cookies.get('userDetails') ||
      Cookies.get('user') ||
      localStorage.getItem('userDetails') ||
      localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error('Error parsing user details:', e);
        return null;
      }
    }
  }
  return null;
};

// Cookies were set with path:'/', so removal MUST also pass path:'/'.
// Otherwise js-cookie removes at the current page path only, the cookie
// survives, and the middleware keeps redirecting to /dashboard forever.
const removeAllCookies = () => {
  ['authToken', 'token', 'email', 'otp', 'userDetails', 'user'].forEach((name) => {
    Cookies.remove(name, { path: '/' });
    Cookies.remove(name); // also clear any legacy path-less cookie
  });
};

// ============ SESSION CLEAR ============
export const clearAllSessions = () => {
  if (typeof window !== 'undefined') {
    removeAllCookies();
    localStorage.clear();
    window.location.href = "/";
  }
};

// ============ LOGOUT ============
export const logout = () => {
  if (typeof window !== 'undefined') {
    removeAllCookies();
    localStorage.clear();
    window.location.href = "/";
  }
};

// ============ CHECK AUTHENTICATION ============
export const isAuthenticated = () => {
  if (typeof window !== 'undefined') {
    const token = getAuthToken();
    return !!token;
  }
  return false;
};