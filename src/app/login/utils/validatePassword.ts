type PasswordCheck = { check: boolean; text: string; icon: string };

export const validatePassword = (
  password: string
): { isValid: boolean; checks: PasswordCheck[] } => {
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  const hasNumeric = /[0-9]/.test(password);
  const isMinLen = password.length >= 8;
  const notMaxLen = password.length <= 16;
  const isValid =
    hasUppercase &&
    hasLowercase &&
    hasSpecialChar &&
    hasNumeric &&
    isMinLen &&
    notMaxLen;

  const checks = [
    {
      check: hasUppercase,
      text: "Upper case letter (A-Z)",
      icon: "ABC",
    },
    {
      check: hasLowercase,
      text: "Lower case letter (a-z)",
      icon: "abc",
    },
    {
      check: hasSpecialChar,
      text: "Special character (!@#$%^&*)",
      icon: "@#$",
    },
    {
      check: hasNumeric,
      text: "Number (0-9)",
      icon: "123",
    },
    {
      check: isMinLen,
      text: "8+ characters",
      icon: "8+",
    },
    {
      check: notMaxLen,
      text: "Maximum 16 characters",
      icon: "16-",
    },
  ];

  console.log(isValid, checks);

  return { isValid, checks };
};
