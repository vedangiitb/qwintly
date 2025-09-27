"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/app/login/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function Account() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user || !user.emailVerified) {
    return (
      <div>
        <p>Please verify your email</p>
        <Button onClick={() => router.push("/login/verify")}>Verify</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md shadow-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 transition-colors duration-300">
        <CardHeader className="flex flex-col items-center gap-2 py-6">
          <Avatar className="w-16 h-16">
            <AvatarImage src={user?.avatar || ""} alt="User avatar" />
            <AvatarFallback>{user?.name?.charAt(0) || "A"}</AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-50">
            {user?.name || "Welcome"}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {user?.email || ""}
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex flex-col items-center">
            <p className="text-base text-gray-600 dark:text-gray-300">
              Welcome to your account dashboard.
            </p>
            {/* Add more content/components for account management here */}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center py-4">
          <Button variant="outline" className="w-full" onClick={logout}>
            Sign Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
