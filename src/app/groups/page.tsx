"use client";
import React, { useState, useEffect } from 'react';
import { User as UserType } from '@/types/user';
import { Group as GroupType } from '@/types/group';
import GroupModal from '@/components/Groupform/Groupform';
import GroupCreationModal from '@/components/Groupform/Groupcreate';
import { useSession } from 'next-auth/react';
import { clientSideEditAccess } from '@/utils/userEditAccess';

export default function Content() {
  const { data: session } = useSession();
  const role = session?.user.role;

  const privilegeCheck = () => {
    if (!role) return false;
    return clientSideEditAccess(role);
  }

  const now = new Date().toDateString();
  const [users, setUsers] = useState<UserType[]>([]);
  const [groups, setGroups] = useState<GroupType[]>([]);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const fetchUsers = async () => {
    const res = await fetch('/api/user');
    const data = await res.json();
    setUsers(data.users);
  }

  const fetchGroups = async () => {
    const res = await fetch('/api/group');
    const data = await res.json();
    setGroups(data.groups);
  }

  useEffect(() => {
    fetchUsers();
    fetchGroups();
  }, []);

  useEffect(() => {
  }, [users, groups]);

  const handleDeleteUser = async (groupId: string, userId: string) => {
    console.log(`Deleting user ${userId} from group ${groupId}`);

    const res = await fetch(`/api/group/user`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ group: groupId, user: userId }),
    });
    const data = await res.json();
    console.log(data);

    fetchUsers();
    fetchGroups();
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    fetchUsers();
    fetchGroups();
  };
  const openEditModal = () => {
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    fetchUsers();
    fetchGroups();
  };
  const [searchTerm, setSearchTerm] = useState('');
  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    users.some(user =>
      user.groups.includes(group._id) &&
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  return (
    <div className="flex flex-wrap h-screen mb-20">
      <div className="w-full rounded-3xl bg-white p-6">
        <div className="mb-8 flex items-center justify-between text-black m-auto">
          <div>
            <p className="text-3xl font-bold">Group Management</p>
            <p className="text-sm text-gray-500">Manage and track group information</p>
          </div>
          <p>{now}</p>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-2 md:mb-0">
            <input
              type="text"
              placeholder="Search groups"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-100 rounded-l-md hover:border-b-2 hover:border-b-black text-black py-2 px-4 hover:shadow-lg w-full md:w-64"
            />
            <button
              className="bg-black text-white font-bold py-2 px-3 rounded-r-md hover:bg-gray-700 ml-0"
            >
              Search
            </button>
          </div>
          <div className="flex items-center"> {/* Wrap the button in a flex container */}
            <button
              data-modal-target="crud-modal"
              data-modal-toggle="crud-modal"
              className="m-auto bg-black text-white font-bold py-3 px-4 rounded-full transition-shadow hover:ring-2 hover:ring-gray-300"
              type="button"
              onClick={openModal}
              disabled={!privilegeCheck()}
            >
              ✢ New Group
            </button>
          </div>
          {isModalOpen && <GroupCreationModal closeModal={closeModal} />}

          <div className="md:w-1/2 sm:w-6/12 md:w-auto">
            <div className="text-4xl font-bold text-white m-1 p-1 bg-black text-center rounded-lg">{groups.length}</div>
            <div className='text-black text-center font-bold'>Groups</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-4">
            {filteredGroups.map((group) => (
              <div
                key={group._id}
                className={`bg-gray-100 rounded-3xl shadow-xl ${expandedGroup === group._id ? 'h-auto border-b' : 'h-14 overflow-hidden'
                  }`}
              >
                <div
                  className="p-3 cursor-pointer bg-stone-300 rounded-3xl"
                  onClick={() =>
                    setExpandedGroup(prev => (prev === group._id ? null : group._id))
                  }
                >
                  <div className="flex items-center justify-between">
                    <p
                      className={`text-xl font-bold mb-2 ${expandedGroup !== group._id ? 'overflow-hidden whitespace-nowrap overflow-ellipsis' : 'overflow-hidden'
                        }`}
                      style={{ wordWrap: 'break-word', wordBreak: 'break-all' }}
                    >
                      {group.name}
                    </p>

                    <button className="text-gray-500 focus:outline-none ml-2">
                      {expandedGroup === group._id ? 'Collapse' : 'Expand'}
                    </button>
                  </div>
                </div>
                {expandedGroup === group._id && (
                  <div className="p-6 max-h-96 overflow-y-auto">
                    <ul>
                      {users
                        .filter((user) => user.groups.includes(group._id))
                        .map((user) => (
                          <li key={user._id} className="flex items-center space-x-4 border-b-4 py-2">
                            {user.image ? (
                              <img
                                src={user.image}
                                alt={user.name}
                                className="w-12 h-12 rounded-full mr-2"
                              />
                            ) : (
                              <label className="inline-flex items-center mr-2">
                                <div className='rounded-full h-12 w-12 flex items-center justify-center text-white text-bold text-lg bg-gray-900'>
                                  {user.email[0]}
                                </div>
                              </label>)}
                            <div className="flex-grow">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold">{user.name}</p>
                                  <p className="text-gray-500">{user.email}</p>
                                </div>
                                <button
                                  className="text-red-500 focus:outline-none"
                                  onClick={() => handleDeleteUser(group._id, user._id)}
                                  disabled={!privilegeCheck()}
                                >
                                  <svg className='w-6 h-6'
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="#FF0000"
                                    stroke="#FF0000"
                                    version="1.1"
                                    viewBox="0 0 408.483 408.483"
                                    xmlSpace="preserve"
                                  >
                                    <g>
                                      <path d="M87.748 388.784c.461 11.01 9.521 19.699 20.539 19.699h191.911c11.018 0 20.078-8.689 20.539-19.699l13.705-289.316H74.043l13.705 289.316zm159.907-217.455a8.35 8.35 0 018.35-8.349h13.355a8.351 8.351 0 018.35 8.349v165.293a8.35 8.35 0 01-8.35 8.349h-13.355a8.35 8.35 0 01-8.35-8.349V171.329zm-58.439 0a8.35 8.35 0 018.349-8.349h13.355a8.35 8.35 0 018.349 8.349v165.293a8.348 8.348 0 01-8.349 8.349h-13.355a8.348 8.348 0 01-8.349-8.349V171.329h0zm-58.441 0a8.35 8.35 0 018.349-8.349h13.356a8.35 8.35 0 018.349 8.349v165.293a8.349 8.349 0 01-8.349 8.349h-13.356a8.348 8.348 0 01-8.349-8.349V171.329zM343.567 21.043h-88.535V4.305A4.305 4.305 0 00250.727 0h-92.971a4.305 4.305 0 00-4.304 4.305v16.737H64.916c-7.125 0-12.9 5.776-12.9 12.901V74.47h304.451V33.944c0-7.125-5.775-12.901-12.9-12.901z"></path>
                                    </g>
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                    </ul>
                    <div className="flex justify-end mt-4">
                      <button className="bg-black text-white px-4 py-2 rounded-md mr-2"
                        disabled={!privilegeCheck()}
                        onClick={openEditModal}
                      >
                        Edit
                      </button>
                      {isEditModalOpen && <GroupModal closeModal={closeEditModal} currentGroup={group} />}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div >
  );
}
