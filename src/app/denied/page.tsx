"use client";
import { signOut } from 'next-auth/react';

export default function Denied() {
  return (
    <div className="h-screen flex items-center justify-center" style={{
      background: 'radial-gradient(circle, rgba(44,2,2,1) 60%, rgba(237,10,10,1) 100%)',
      color: '#fff',
    }}>
      <div className="text-center">
        <h1 className="text-5xl font-extrabold mb-4">Access Denied</h1>
        <p className="text-lg leading-6">
          Oops! It seems you don't have the necessary permissions to access this page.
        </p>
        <button
          className="mt-8 font-semibold py-2 px-4 rounded-lg border-2 border-transparent hover:border-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
          style={{
            background: 'radial-gradient(circle, rgba(44,2,2,1) 60%, rgba(237,10,10,1) 100%)',
          }}
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          Go back to Home
        </button>
      </div>
    </div>
  );
}