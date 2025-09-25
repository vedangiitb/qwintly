import { validatePassword } from "../utils/validatePassword";

type Props = { password: string };

export default function PasswordTooltip({ password }: Props) {
  const { checks, isValid } = validatePassword(password);

  return (
    <div className="absolute -right-2 top-full mt-2 w-72 border bg-white p-4 rounded-xl shadow-xl transform translate-x-full z-50">
      <h4 className="font-medium text-sm mb-2 text-gray-700">Password Requirements</h4>
      <ul className="space-y-2">
        {checks.map((req, i) => (
          <li
            key={i}
            className={`flex items-center gap-2 text-sm transition-colors ${
              req.check ? "text-green-600" : "text-gray-500"
            }`}
          >
            <span
              className={`inline-flex items-center justify-center w-6 h-6 rounded-full border text-xs font-medium ${
                req.check ? "border-green-200 bg-green-50 text-green-600" : "border-gray-200 bg-gray-50"
              }`}
            >
              {req.icon}
            </span>
            {req.text}
            <span className="ml-auto">{req.check ? "✓" : ""}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3 pt-3 border-t">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isValid ? "bg-green-500" : checks.filter((i) => i.check).length > 3 ? "bg-yellow-500" : "bg-rose-500"
            }`}
            style={{ width: `${(checks.filter((i) => i.check).length / 6) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

