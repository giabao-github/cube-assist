export const AUTH_FORM_TEXTS = {
  loginWelcome: "Welcome back",
  loginSubtitle: "Please login to continue exploring",
  emailLogin: "Or login using email",
  alreadyHaveAccount: "Already have an account?",
  loginNow: "Sign in now",
  registerWelcome: "Hi, I'm Cube Assist. Nice to meet you",
  registerSubtitle: "First, let's create your account",
  emailRegister: "Or register using email",
  noAccount: "Don't have an account?",
  registerNow: "Sign up now",
} as const;

export const LABELS = {
  username: "Username *",
  email: "Email *",
  password: "Password *",
  confirmPassword: "Confirm password *",
  forgotPassword: "Forgot password?",
} as const;

export const BUTTON_TEXTS = {
  login: "Sign in",
  pendingLogin: "Signing in",
  register: "Sign up",
  pendingRegister: "Creating your account",
} as const;

export const ERROR_TEXTS = {
  emptyFields: "Please fill out all required fields",
  multipleErrors: "Please correct all form errors",
  singleErrorFallback: "A form error occurred",
  invalidCredentials: "Incorrect email or password",
  emailExists: "This email has already registered",
  networkError: "Network error",
  serverError: "Server connection issue",
  unknown: "An unknown error occurred",
} as const;

export const SUCCESS_TEXTS = {
  register: "Signed up successfully",
} as const;

export const DESCRIPTIONS = {
  checkCredentials: "Please check your credentials and try again",
  useAnotherEmail: "Please use another email or login",
  useRegisteredInfo: "Please use registered credentials to login",
  networkError: "Please check your connection and try again",
  serverError: "Something went wrong. Please try again later",
  unknown: "An unexpected error occurred. Please try again.",
} as const;

export const PLACEHOLDERS = {
  username: "John Doe",
  email: "name@example.com",
  loginPassword: "Enter your password",
  registerPassword: "Create a secure password",
  confirmPassword: "Re-enter password",
} as const;

export const SOCIAL_BUTTON_TEXTS = {
  google: "Continue with Google",
  github: "Continue with Github",
} as const;

export const AGREEMENT = {
  prefix: "By continuing, you are agreeing to our ",
  terms: "Terms of Service",
  and: " and ",
  policy: "Privacy Policy",
};
