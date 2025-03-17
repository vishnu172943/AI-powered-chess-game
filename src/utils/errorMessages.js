export const getFirebaseErrorMessage = (error) => {
  const errorMap = {
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Invalid password',
    'auth/email-already-in-use': 'Email is already registered',
    'auth/invalid-email': 'Invalid email format',
    'auth/weak-password': 'Password should be at least 6 characters',
    'auth/network-request-failed': 'Network error. Please check your connection',
    'auth/too-many-requests': 'Too many attempts. Please try again later',
  };

  return errorMap[error.code] || 'An error occurred. Please try again.';
};
