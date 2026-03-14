'use client';
import { useDashboardContext } from './Provider';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { User as UserType } from "@/types/user";
import Image from 'next/image';
import Link from 'next/link';

export function TopBar() {
  const [profileDropdownVisible, setProfileDropdownVisible] = useState(false);
  let pathname = usePathname();
  pathname = pathname.replace('/', '');
  pathname = pathname.charAt(0).toUpperCase() + pathname.slice(1);

  const { data: session } = useSession({ required: true });
  const user = session?.user as unknown as UserType;

  const { openSidebar } = useDashboardContext();
  return (
    <header className="relative z-10 h-16 w-full items-center bg-gray-200 shadow md:h-20">
      <div className="relative mx-auto flex h-full flex-col justify-center px-3">
        <div className="relative flex w-full items-center pl-1 sm:ml-0 sm:pr-2 justify-between">
          <div className="relative left-0 flex w-1/5">
            <div className="group relative flex h-full w-12 items-center">
              <button
                type="button"
                aria-expanded="false"
                aria-label="Toggle sidenav"
                onClick={openSidebar}
                className="text-4xl text-black focus:outline-none"
              >
                &#8801;
              </button>
            </div>
          </div>
          <div className='w-3/5 text-center'>
            <p className="text-2xl font-bold">{pathname}</p>
          </div>
          <div className="relative ml-5 flex w-1/5 items-center justify-end p-1 sm:right-auto sm:mr-0">
            {user && (<button onClick={
              () => {
                setProfileDropdownVisible(!profileDropdownVisible)
              }
            }>
              {user?.image ?
                <Image
                  src={user?.image}
                  alt="profile"
                  className="mx-auto h-10 w-10 rounded-full object-cover"
                  width={40}
                  height={40}
                /> 
                : <div className='rounded-full h-10 w-10 flex items-center justify-center text-white text-bold text-lg bg-gray-900'>
                {user?.name[0]}
              </div>
              }
            </button>)}
            {profileDropdownVisible && (
              <div className="absolute top-10 mt-2 right-0 w-48 shadow-xl z-20">
                <div className="px-4 py-3 text-sm text-gray-900 text-black bg-gray-100 mt-0 rounded-t-lg">
                  <div>{user?.name}</div>
                  <div className="font-medium truncate">{user?.email}</div>
                </div>
                <hr />
                <Link href="/api/auth/signout" className="text-center block px-4 py-2 bg-red-600 text-white hover:bg-black hover:text-white rounded-b-lg">Sign out</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
