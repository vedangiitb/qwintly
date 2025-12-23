import { Suspense } from "react";
import AccountCreatedClient from "./accountCreatedClient";
export default function AccountCreatedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen text-gray-500">
          Loading...
        </div>
      }
    >
      <AccountCreatedClient />
    </Suspense>
  );
}
