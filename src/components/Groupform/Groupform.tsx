import React, { useState, useEffect } from 'react';
import { Group as GroupType } from '@/types/group';
import { User as UserType } from '@/types/user';

export default function GroupModal({
  closeModal,
  currentGroup,
}: {
  closeModal: () => void;
  currentGroup?: GroupType;
}) {

  const [formData, setFormData] = useState({ name: currentGroup?.name || '' });
  const [groupUsers, setGroupUsers] = useState<UserType[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserType[]>([]);

  const setUsers = async () => {
    const res = await fetch('/api/user');
    const data = await res.json();
    const users = data.users;

    // Initially, set groupUsers based on the users in the current group
    const initialGroupUsers = users.filter((user: UserType) => user.groups.includes(currentGroup?._id || ''));
    setGroupUsers(initialGroupUsers);

    // Initially, set availableUsers as users not in the current group
    const usersNotInGroup = users.filter((user: UserType) => !initialGroupUsers.includes(user));
    setAvailableUsers(usersNotInGroup);
  };

  useEffect(() => {
    setUsers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleUserSelect = (selectedUserId: string) => {
    const selectedUser = availableUsers.find((user) => user._id === selectedUserId);

    if (selectedUser) {
      setGroupUsers((prevGroupUsers) => [...prevGroupUsers, selectedUser]);
      setAvailableUsers((prevAvailableUsers) =>
        prevAvailableUsers.filter((user) => user._id !== selectedUserId)
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // console.log('Form Data:', formData);
    // console.log('Group Users:', groupUsers);

    // Update the group
    const res = await fetch(`/api/group/users`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        group: currentGroup?._id,
        users: groupUsers.map((user) => user._id),
      }),
    });

    const data = await res.json();
    console.log(data);

    closeModal();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 overflow-x-hidden overflow-y-auto backdrop-blur-md backdrop-filter">
      {/* Main modal */}
      <div className="bg-white absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-opacity-98 border border-gray-600 box-border shadow-lg rounded-2xl p-6 w-96">
        {/* Modal header */}
        <div className="flex items-center justify-between border-b pb-2">
          <p className="text-2xl font-bold text-black text-center">Edit Group</p>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-700 rounded-lg text-sm w-8 h-8"
            onClick={closeModal}
          >
            <svg
              className="w-3 h-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
          </button>
        </div>
        {/* Modal body */}
        <form className="flex flex-col" onSubmit={handleSubmit}>
          <label className="text-sm text-gray-500 mb-2">Group</label>
          <input
            type="text"
            name="name"
            id="name"
            onChange={handleChange}
            value={formData.name}
            className="w-full bg-gray-100 rounded-md mb-4 py-2 px-4 focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter Group Name"
            required
          />
          {/* Section for users in the current group */}
          <div>
            <p className="text-sm text-gray-500 mb-2">Users in Group</p>
            <ul className="flex flex-wrap">
              {groupUsers.map((user) => (
                <li key={user._id} className="flex items-center mb-2 bg-gray-200 p-1 rounded-lg m-2">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full mr-2 bg-gray-500 text-center pt-1">{user.email[0]}</div>
                  )}
                  <span>{user.name}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* Section for selecting users not in the group */}
          <div>
            <p className="text-sm text-gray-500 mb-2">Add Users</p>
            <ul className="flex flex-wrap">
              {availableUsers.map((user) => (
                <li key={user._id} className="flex items-center mb-2 bg-gray-200 p-1 rounded-lg min-w-full">
                  <input
                    type="radio"
                    name="selectedUser"
                    value={user._id}
                    onChange={() => handleUserSelect(user._id)}
                    className="mr-2"
                  />
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full mr-2 bg-gray-500 text-center pt-1">{user.email[0]}</div>
                  )}
                  <label>{user.name}</label>
                </li>
              ))}
            </ul>
          </div>
          <button
            type="submit"
            className="bg-black text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition-all duration-300"
          >
            Save <span role="img" aria-label="Disk"></span>
          </button>

            <button
              type="submit"
              className="mt-2 w-full bg-red-500 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-700"
              onClick={async (e: React.FormEvent) => {
                e.preventDefault();
                const response = await fetch(`/api/group`, {
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ _id: currentGroup?._id}),
                });
                const data = await response.json();
                console.log('Response:', data);
                closeModal();
              }}
            >
              Delete Group
            </button>
        </form>
      </div>
    </div>
  );
}


