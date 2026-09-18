export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(String(email).toLowerCase());
};

export const isValidPassword = (password) => {
  return typeof password === 'string' && password.length >= 6;
};

export const validateSignup = ({ name, email, password, confirmPassword }) => {
  const errors = {};
  if (!name || name.trim().length === 0) {
    errors.name = 'Full name is required';
  }
  if (!email || !isValidEmail(email)) {
    errors.email = 'Valid email address is required';
  }
  if (!password || !isValidPassword(password)) {
    errors.password = 'Password must be at least 6 characters';
  }
  if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateLogin = ({ email, password }) => {
  const errors = {};
  if (!email || !isValidEmail(email)) {
    errors.email = 'Valid email is required';
  }
  if (!password) {
    errors.password = 'Password is required';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
