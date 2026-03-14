import { useState } from 'react';

// Create the UserFormModal component
export default function GroupCreationModal({ closeModal }: { closeModal: () => void }) {
  // State to manage form data
  const [formData, setFormData] = useState({ groupName: '' });

  // Event handler for form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Event handler for form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form Data:', formData);
    // Add logic to handle form submission (e.g., sending data to a server)

    const response = await fetch('/api/group', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: formData.groupName }),
    });
    const data = await response.json();
    console.log('Data:', data);

    // Close the modal after submission
    closeModal();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 overflow-x-hidden overflow-y-auto backdrop-blur-md backdrop-filter">
      {/* Main modal */}
      <div className="bg-white absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-opacity-98 border border-gray-600 box-border shadow-lg rounded-2xl p-6 max-w-md w-full">
        {/* Modal header */}
        <div className="flex items-center justify-between border-b">
          <p className="text-xl md:text-2xl font-bold text-black m-auto">
            Create Group
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
          <p className="mb-2">Please Enter the name of the Group</p>
          <div className="mb-4">
            <input
              type="text"
              name="groupName"
              id="groupName"
              value={formData.groupName}
              onChange={handleChange}
              className="w-full bg-gray-100 rounded-l-md md:hover:border-b-2 md:hover:border-b-black text-black py-2 px-4 md:hover:shadow-lg"
              placeholder="Group Name"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white font-bold py-2 px-4 rounded-md hover:bg-gray-700 transition-all duration-300"
          >
            Create Group
          </button>
        </form>
      </div>
    </div>
  );
  
}
