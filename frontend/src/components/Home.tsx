import { type User } from "firebase/auth";
import { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  return (
    <div className="home p-6">
      <h1 className="text-4xl font-bold mb-6">Home</h1>
      
      {user ? (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Welcome, {user.displayName}!</h2>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Please log in to access Google Docs</h2>
        </div>
      )}
    </div>
  );
}