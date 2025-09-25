type Props = { isExistingUser: boolean };

export default function AuthHeader({ isExistingUser }: Props) {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 animate-text">
        {isExistingUser ? "Welcome Back 👋" : "Join Us 🚀"}
      </h2>
      <p className="mt-2 text-slate-500 text-sm">
        {isExistingUser ? "Login to your account" : "Create your new account"}
      </p>
    </div>
  );
}
