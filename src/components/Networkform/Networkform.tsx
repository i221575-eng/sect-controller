// Import necessary dependencies
import { useState } from 'react';
import { Network as NetworkType } from '@/types/network';

// Create the NetworkFormModal component
export default function NetworkFormModal({ closeModal, initialValues }: { closeModal: () => void, initialValues?: NetworkType }) {
  
  const editMode = Boolean(initialValues);
  // State to manage form data
  const [formData, setFormData] = useState<NetworkType>({
    _id: initialValues?._id || '',
    location: initialValues?.location || '',
    name: initialValues?.name || '',
  });

  const title = editMode ? 'Edit Remote Network' : 'Add Remote Network';

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

    if (editMode) { // make PUT request
      const response = await fetch(`/api/network`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      console.log('Response:', data);
    }
    else { // make POST request
      const response = await fetch(`/api/network`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      console.log('Response:', data);
    }

    // Close the modal after submission
    closeModal();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 overflow-x-hidden overflow-y-auto backdrop-blur-md backdrop-filter">
      {/* Main modal */}
      <div className="bg-white absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-opacity-98 border border-gray-600 box-border shadow-lg rounded-2xl p-6">
        {/* Your content goes here */}

        {/* Modal header */}
        <div className="flex items-center justify-between p-4 border-b">
        <p className="text-xl pl6 font-bold text-black m-auto ">
            {title}
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
          <div className="grid gap-4 mb-4">
            <div className="flex items-center mb-4">
              <label
                htmlFor="name"
                className="text-sm font-medium text-black me-2 w-20"
              >
                Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="bg-gray-100 rounded-l-md hover:border-b-2 hover:border-b-black text-black py-2 px-4 hover:shadow-lg"
                placeholder="Type network name"

                required
              />
            </div>
            <div className="flex items-center mb-4">
              <label
                htmlFor="location"
                className="text-sm font-medium text-black me-2 w-20"
              >
                Location
              </label>
              <input
                type="text"
                name="location"
                id="location"
                value={formData.location}
                onChange={handleChange}
                className="bg-gray-100 rounded-l-md hover:border-b-2 hover:border-b-black text-black py-2 px-4 hover:shadow-lg"
                placeholder="Type location"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white font-bold py-2 px-4 rounded-md hover:bg-gray-700"
            >
            Save Network
          </button>
          {
          editMode && (
            <button
              type="submit"
              className="mt-2 w-full bg-red-500 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-700"
              onClick={async () => {
                const response = await fetch(`/api/network`, {
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ _id: formData._id }),
                });
                const data = await response.json();
                if (data.error) {
                  alert(data.error);
                  return;
                }
                console.log('Response:', data);
                closeModal();
              }}
            >
              Delete Network
            </button>
          )
        }
        </form>
        
      </div>
    </div>
  );
}
