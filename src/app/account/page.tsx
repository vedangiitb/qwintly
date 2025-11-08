"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/app/login/hooks/AuthContext";
import { useRouter } from "next/navigation";

export default function Account() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-50 via-gray-100 to-gray-200 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 px-4">
      <Card className="w-full max-w-md mx-auto shadow-lg border border-gray-200 dark:border-gray-800 bg-white/85 dark:bg-gray-950/90 backdrop-blur-md transition-colors duration-300">
        <CardHeader className="flex flex-col items-center gap-4 py-8">
          <Avatar className="w-20 h-20 mb-1 ring-4 ring-blue-200 dark:ring-blue-700 ring-offset-2">
            <AvatarImage src={user?.avatar || ""} alt="User avatar" />
            <AvatarFallback className="bg-blue-500 text-white text-3xl">
              {user?.displayName?.charAt(0)?.toUpperCase() || "A"}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
            {user?.displayName || "Welcome"}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {user?.email || ""}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className="space-y-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${user?.emailVerified ? "bg-green-100 text-green-600 border-green-300 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700" : "bg-red-100 text-red-600 border-red-300 dark:bg-red-900/50 dark:text-red-200 dark:border-red-800"}`}
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  {user?.emailVerified ? (
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  ) : (
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-7V7a1 1 0 112 0v4a1 1 0 01-2 0zm1 4a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  )}
                </svg>
                {user?.emailVerified ? "Verified" : "Unverified"}
              </span>
              <div>
                {!user?.emailVerified && (
                  <Button
                    onClick={() => router.push(`/login/verify`)}
                    className="h-8 px-3 py-0.5 text-xs rounded focus:ring-2 focus:ring-blue-400 transition-all"
                    variant="outline"
                  >
                    Verify
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 py-2 text-center">
          <p className="mt-1 text-base text-gray-700 dark:text-gray-300 leading-relaxed">
            Welcome to your account dashboard. Here you can manage your profile,
            check your verification status, and more.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center py-5 gap-2">
          <Button
            variant="outline"
            className="w-full font-semibold tracking-wide focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all"
            onClick={logout}
          >
            Sign Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
