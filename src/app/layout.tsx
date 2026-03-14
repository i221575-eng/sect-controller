import 'tailwindcss/tailwind.css';
import React from 'react';
import type { Metadata } from 'next';
import { DashboardLayout } from '@/dashboard/Layout';
import AuthProvider from '@/app/context/AuthProvider';
import { headers } from "next/headers";
export const metadata: Metadata = {
  title: 'Zero Trust Network Access',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {

  const headersList = await headers();
  const path = headersList.get('x-pathname');
  const withoutDashboard = path === '/denied' || path === '/profile' || path === null;

  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {!withoutDashboard ? (
            <DashboardLayout>
              {children}
            </DashboardLayout>
          ) : (
            <div>
              {children}
            </div>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}
