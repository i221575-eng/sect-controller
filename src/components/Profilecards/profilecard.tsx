import React from 'react';
import { User as UserType } from "@/types/user";

export default function ProfileCard({ user }: { user: UserType }) {
  return (
    <>
      <div className="w-3/8">
        {user.image ? (
          <img src={user.image} alt={user.email} className="h-16 w-full object-cover rounded-3xl" />
        ) : (
          <div className='rounded-3xl h-16 w-16 object-cover flex items-center justify-center text-black text-bold text-xl bg-zinc-300'>
            {user.email[0].charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="w-fit-content m-auto px-2">
        <div className="text-left">
          {user.name ? (
            <p className="w-[180px] line-clamp-1 text-sm font-bold text-blue-500">{user.name}</p>
          ) : (
            <p className="w-[180px] line-clamp-1 text-sm font-bold text-blue-500">{user.email.split('@')[0]}</p>
          )}
          <p className="text-xs text-gray-500">{user.email}</p>
          <p className="text-xs text-gray-500 font-bold">{user.role}</p>
        </div>
      </div>
    </>
  );

}
