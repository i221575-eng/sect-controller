// Import necessary dependencies

import { useEffect, useState } from 'react';
import { User as UserType } from '@/types/user';
import { Group as GroupType } from '@/types/group';
import { checkUserEditAccess } from '@/utils/userEditAccess';
import { useSession } from 'next-auth/react';
import { set } from 'mongoose';

// Create the UserFormModal component
export default function UserFormModal({ closeModal, initialValues }: { closeModal: () => void, initialValues?: UserType }) {
  const { data: session } = useSession();
  const role = session?.user.role;
  const initialUserAccountStatus = initialValues?.status;

  const [formData, setFormData] = useState<UserType>({
    _id: initialValues?._id || '',
    name: initialValues?.name || '',
    email: initialValues?.email || '',
    role: initialValues?.role || 'member',
    image: initialValues?.image || '',
    groups: initialValues?.groups || [],
    status: initialUserAccountStatus === undefined ? true : initialUserAccountStatus,
    ip: initialValues?.ip || '',
  });

  const [userStatus, setUserStatus] = useState<string>(formData.status ? 'en' : 'dis');

  // Event handler for form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const [groups, setGroups] = useState<GroupType[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>(initialValues?.groups || []);

  useEffect(() => {
    const fetchGroups = async () => {
      const res = await fetch('/api/group');
      const data = await res.json();
      setGroups(data.groups);
    }
    fetchGroups();
  }, []);

  const handleGroupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (selectedGroups.includes(value)) {
      setSelectedGroups(selectedGroups.filter((selectedGroup) => selectedGroup !== value));
    } else {
      setSelectedGroups([...selectedGroups, value]);
    }
  };

  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  // Event handler for form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormData((prevData) => ({ ...prevData, groups: selectedGroups }));
    // Add logic to handle form submission (e.g., sending data to a server)
    const dataToSend = { ...formData, groups: selectedGroups };

    const response = await fetch('/api/user', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    });
    const data = await response.json();
    console.log('Response:', data);

    // Close the modal after submission
    closeModal();
  };

  return (

    <div className="fixed inset-0 flex items-center justify-center z-50 overflow-x-hidden overflow-y-auto backdrop-blur-md backdrop-filter">
      {/* Main modal */}
      <div className="bg-white w-full md:w-1/2 lg:w-1/2 xl:w-1/3 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-opacity-98 border border-gray-600 box-border shadow-lg rounded-2xl p-6 max-h-screen overflow-y-auto">
        {/* Modal header */}
        <div className="flex items-center justify-between pt-2 pb-4 md:pb-2 border-b">
          <p className="text-3xl pl-6 font-bold text-black m-auto">
            User
          </p>
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
        <form className="p-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Column 1: Image */}
            <div className="flex items-center mb-4">
              {formData.image ? (
                <img
                  src={formData.image}
                  alt={formData.email}
                  className="max-h-4/12 w-full object-cover rounded-3xl"
                />
              ) : (
                <div className="relative h-60 w-full ">
                  <div className="absolute rounded-full h-full w-full object-cover flex items-center justify-center text-black font-bold text-5xl bg-zinc-300">
                    <div className="h-full w-full flex items-center justify-center">
                      <span className="text-5xl">{formData.email[0].charAt(0).toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>




            {/* Column 2: Email, Username, Role */}
            <div className="grid grid-cols-1 gap-4 lg:col-span-2">
              {/* Display Email */}
              <div className="flex items-center mb-4">
                <label htmlFor="email" className="text-sm font-medium text-black me-2 w-20">
                  Email:
                </label>
                <input
                  type="text"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-4/5 bg-gray-100 rounded-md hover:border-b-2 hover:border-b-black text-black py-2 px-4 hover:shadow-lg"
                  placeholder="email"
                  disabled
                />
              </div>
              {/* Display Username */}
              <div className="flex items-center mb-4">
                <label htmlFor="name" className="text-sm font-medium text-black me-2 w-20">
                  Name:
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-4/5 bg-gray-100 rounded-md hover:border-b-2 hover:border-b-black text-black py-2 px-4 hover:shadow-lg"
                  placeholder="name"
                  required
                />
              </div>
              {/* Display Role */}
              <div className="flex items-center mb-4">
                <label htmlFor="role" className="text-sm font-medium text-black me-2 w-20">
                  Role:
                </label>
                <select
                  name="role"
                  id="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-4/5 bg-gray-100 rounded-md hover:border-b-2 hover:border-b-black text-black py-2 px-4 hover:shadow-lg"
                  required
                >
                  {role && checkUserEditAccess(role, "admin") && (
                    <option value="admin" className='text-black'>Admin</option>
                  )}
                  {role && checkUserEditAccess(role, "manager") && (
                    <option value="manager" className='text-black'>Manager</option>
                  )}
                  {role && checkUserEditAccess(role, "member") && (
                    <option value="member" className='text-black'>Member</option>
                  )}
                </select>
              </div>
              {/* Display Status */}
              <div className="flex items-center mb-4">
                <label
                  htmlFor="status"
                  className="text-sm font-medium text-black me-2 w-20"
                >
                  Status:
                </label>
                <select
                  name="status"
                  id="status"
                  value={userStatus}
                  onChange={(e) => {
                    setUserStatus(e.target.value);
                    setFormData((prevData) => ({ ...prevData, status: e.target.value === 'en' ? true : false }));
                  }}
                  className="w-4/5 bg-gray-100 rounded-md hover:border-b-2 hover:border-b-black text-black py-2 px-4 hover:shadow-lg"
                  required
                >
                  <option value="en" className='text-black'>Enable</option>
                  <option value="dis" className='text-black'>Disable</option>
                </select>
              </div>
              {/* Display User Groups */}
              <div>
                <button className="w-full bg-black text-white font-bold py-2 px-4 mb-2 rounded-md hover:bg-gray-700"
                  onClick={(event) => {
                    event.preventDefault();
                    toggleDropdown();
                  }}>Manage Groups</button>
                {isDropdownOpen && (
                  <div>
                    <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                      {groups.map((group) => (
                        <div
                          key={group._id}
                          style={{
                            background: '#e0e0e0',
                            marginBottom: '8px',
                            borderRadius: '8px',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <label style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                              type="checkbox"
                              checked={selectedGroups.includes(group._id)}
                              onChange={handleGroupChange}
                              value={group._id}
                              className='m-3'
                            />
                            <span style={{ fontWeight: 'bold', color: selectedGroups.includes(group._id) ? '#2196F3' : 'inherit' }}>
                              {group.name}
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white font-bold py-2 px-4 rounded-md hover:bg-gray-700"
          >
            Save Changes
          </button>
          <button
            type="submit"
            className="w-full bg-red-500 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-700 mt-2"
            onClick={async (event) => {
              event.preventDefault();
              const response = await fetch('/api/user', {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
              });
              const data = await response.json();
              console.log('Response:', data);
              closeModal();
            }}
          >
            Delete User
          </button>
        </form>
      </div>
    </div>
  );
}
