"use client";
import React, { useState, useEffect } from 'react';
import { User as UserType } from "@/types/user";
import ProfileCard from "@/components/Profilecards/profilecard";
import UserFormModal from '@/components/userform/userform';
import UserInviteModel from '@/components/userform/userinvite';
import { checkUserEditAccess } from '@/utils/userEditAccess';
import { useSession } from 'next-auth/react';
import { clientSideEditAccess } from '@/utils/userEditAccess';

export default function User() {
  const { data: session } = useSession();
  const role = session?.user.role;

  const privilegeCheck = () => {
    if (!role) return false;
    return clientSideEditAccess(role);
  }

  const now = new Date().toDateString();

  const predefinedRoles = ['admin', 'manager', 'member'];
  const initialCountState = Object.fromEntries(predefinedRoles.map((role) => [role, 0]));
  const [users, setUsers] = useState<UserType[]>([]);

  const fetchUsers = async () => {
    const response = await fetch('/api/user');
    const data = await response.json();
    setUsers(data.users as UserType[]);
  };
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredUsers, setFilteredUsers] = useState(users);

  const handleSearch = () => {
    const searchTermLower = searchTerm.toLowerCase();

    const filtered = users.reduce((acc: UserType[], user: UserType) => {
      const nameLower = user.name.toLowerCase();

      if (nameLower.includes(searchTermLower)) {
        acc.unshift(user);
      } else {
        // If the user's name does not contain the search term, add to the end
        acc.push(user);
      }

      return acc;
    }, []);

    setFilteredUsers(filtered);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const countedUsers: Record<string, boolean> = {};

  const usersCountByRole = users.reduce((countState, user) => {
    const { role, _id } = user;

    // Check if the user ID is not already counted
    if (!countedUsers[_id]) {
      countState[role]++;
      countedUsers[_id] = true;
    }

    return countState;
  }, { ...initialCountState });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [values, setValues] = useState<UserType>({} as UserType);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    fetchUsers();
  };

  const openEditModal = () => {
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    fetchUsers();
  };

  return (
    <div className="flex flex-wrap">
      <div className="w-full rounded-3xl bg-white p-6">
        <div className="mb-4 flex items-center justify-between text-black">
          <div>
            <p className="text-3xl font-bold">User Management</p>
            <p className="text-sm text-gray-500">Manage and track user information</p>
          </div>
          <div>{now}</div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between p-4">
          <div className="w-full md:w-5/12 lg:w-4/12 xl:w-4/12 text-black pr-6 md:pr-0">
            <div className="flex flex-col mt-2 mb-2 md:mb-0">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Users"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-100 rounded-l-md hover:border-b-2 hover:border-b-black text-black py-2 px-4 hover:shadow-lg w-full md:w-auto"
                />
                <button
                  className="bg-black text-white font-bold py-2 px-3 rounded-r-md hover:bg-gray-700"
                  onClick={handleSearch}
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          <div className="w-full sm:w-1/2 lg:w-2/12 flex items-center justify-center mt-2 md:mt-0">
            <button
              data-modal-target="crud-modal"
              data-modal-toggle="crud-modal"
              className="m-auto bg-black text-white font-bold py-2 px-5 rounded-full transition-shadow hover:ring-2 hover:ring-gray-300 w-fit-content"
              type="button"
              onClick={openModal}
              disabled={!privilegeCheck()}
            >
              ✢ New User
            </button>
            {/* Modal */}
            {isModalOpen && <UserInviteModel closeModal={closeModal} />}
            {isEditModalOpen && <UserFormModal closeModal={closeEditModal} initialValues={values} />}
          </div>

          <div className="w-full lg:w-4/12 flex flex-wrap justify-center">
            {Object.keys(usersCountByRole).map(
              (role) =>
                usersCountByRole[role] > 0 && (
                  <div key={role} className="w-4/12 p-2 text-white">
                    <div className="text-4xl font-bold text-white m-1 p-1 bg-black text-center rounded-lg">
                      {usersCountByRole[role]}
                    </div>
                    <div className="text-sm text-center text-gray-600">{role}</div>
                  </div>
                )
            )}
          </div>
        </div>



        {/* Users */}

      </div>
      <div className="flex flex-wrap justify-center mt-5 overflow-x-hidden">
        {!(filteredUsers.length === 0) ? (
          <div className="flex flex-wrap justify-center mt-5">
            {filteredUsers.map((profile, index) => (
              <div key={index} className="ml-5 mr-5 mb-8">
                <div
                  className="flex bg-gray-100 rounded-3xl transition-transform transform-gpu hover:transform hover:scale-105 hover:shadow-lg hover:bg-zinc-800 hover:text-white relative p-2"
                  style={{
                    boxShadow: '5px 5px 10px rgba(25, 25, 25, 0.2), -5px -5px 10px rgba(60, 60, 60, 0.2)',
                    alignItems: 'flex-start', // Add this line for vertical alignment
                  }}
                >
                  <ProfileCard user={profile} />
                  <div>
                    {profile.status ? (
                      <span className={`flex w-3 h-3 me-3 bg-green-500 rounded-full ml-10 mt-3 mb-3`}></span>
                    ) : (
                      <span className={`flex w-3 h-3 me-3 bg-red-500 rounded-full ml-10 mt-3 mb-3`}></span>
                    )}
                    <button
                      className={`px-1 font-bold m-auto text-sm flex items-center ${!role || !checkUserEditAccess(role, profile.role) || !privilegeCheck() ? 'text-gray-500' : 'text-blue-500'}`}
                      onClick={() => {
                        setValues(profile);
                        openEditModal();
                      }}
                      disabled={!role || !checkUserEditAccess(role, profile.role) || !privilegeCheck()}
                    >
                      Edit <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="10"
                        height="10"
                        className='ml-1'
                        fill="currentcolor"
                        stroke="currentcolor"
                        version="1.1"
                        viewBox="0 0 512 512"
                        xmlSpace="preserve"
                      >
                        <g>
                          <path d="M311.18 78.008L32.23 356.958.613 485.716a21.221 21.221 0 0025.671 25.671l128.759-31.617 278.95-278.95L311.18 78.008zM40.877 471.123l10.871-44.271 33.4 33.4-44.271 10.871zM502.598 86.818L425.182 9.402c-12.536-12.536-32.86-12.536-45.396 0l-30.825 30.825 122.812 122.812 30.825-30.825c12.536-12.535 12.536-32.86 0-45.396z"></path>
                        </g>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (

          <div className="flex flex-wrap justify-center mt-5">
            {users.map((profile, index) => (
              <div key={index} className="ml-5 mr-5 mb-8">
                <div
                  className="flex bg-gray-100 rounded-3xl transition-transform transform-gpu hover:transform hover:scale-105 hover:shadow-lg hover:bg-zinc-800 hover:text-white relative p-2"
                  style={{
                    boxShadow: '5px 5px 10px rgba(25, 25, 25, 0.2), -5px -5px 10px rgba(60, 60, 60, 0.2)',
                    alignItems: 'flex-start', // Add this line for vertical alignment
                  }}
                >
                  <ProfileCard user={profile} />
                  <div>
                    {profile.status ? (
                      <span className={`flex w-3 h-3 me-3 bg-green-500 rounded-full ml-10 mt-3 mb-3`}></span>
                    ) : (
                      <span className={`flex w-3 h-3 me-3 bg-red-500 rounded-full ml-10 mt-3 mb-3`}></span>
                    )}
                    <button
                      className={`px-1 font-bold m-auto text-sm flex items-center ${!role || !checkUserEditAccess(role, profile.role) || !privilegeCheck() ? 'text-gray-500' : 'text-blue-500'}`}
                      onClick={() => {
                        setValues(profile);
                        openEditModal();
                      }}
                      disabled={!role || !checkUserEditAccess(role, profile.role) || !privilegeCheck()}
                    >
                      Edit <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="10"
                        height="10"
                        className='ml-1'
                        fill="currentcolor"
                        stroke="currentcolor"
                        version="1.1"
                        viewBox="0 0 512 512"
                        xmlSpace="preserve"
                      >
                        <g>
                          <path d="M311.18 78.008L32.23 356.958.613 485.716a21.221 21.221 0 0025.671 25.671l128.759-31.617 278.95-278.95L311.18 78.008zM40.877 471.123l10.871-44.271 33.4 33.4-44.271 10.871zM502.598 86.818L425.182 9.402c-12.536-12.536-32.86-12.536-45.396 0l-30.825 30.825 122.812 122.812 30.825-30.825c12.536-12.535 12.536-32.86 0-45.396z"></path>
                        </g>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
