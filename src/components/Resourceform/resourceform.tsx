// Import necessary dependencies
import { useState, useEffect } from 'react';
import { Resource as ResourceType } from '@/types/resource';
import { Network as NetworkType } from '@/types/network';

// Create the ResourceFormModal component
export default function ResourceFormModal({ closeModal, initialValues }: { closeModal: () => void, initialValues?: ResourceType }) {
  // State to manage form data
  const editMode = Boolean(initialValues);

  const [formData, setFormData] = useState<ResourceType>({
    _id: initialValues?._id || '',
    name: initialValues?.name || '',
    address: initialValues?.address || '',
    alias: initialValues?.alias || '',
    networkId: initialValues?.networkId || '',
    tcpStatus: initialValues?.tcpStatus || 'blocked', // default value for tcpStatus is 'blocked
    udpStatus: initialValues?.udpStatus || 'blocked', // default value for udpStatus is 'blocked
    icmpStatus: initialValues?.icmpStatus || 'blocked', // default value for icmpStatus is 'blocked
    tcpPorts: initialValues?.tcpPorts || [],
    udpPorts: initialValues?.udpPorts || [],
  });

  const [networks, setNetworks] = useState<NetworkType[]>([]);

  useEffect(() => {
    async function getData() {
      const res = await fetch('/api/network');
      const _networks = await res.json();

      const res2 = await fetch('/api/connector');
      const _connectors = await res2.json();

      const _filteredNetworks: NetworkType[] = [];

      if (_networks.networks && _connectors.connectors) {
        _connectors.connectors.forEach((connector: any) => {
          const network = _networks.networks.find((network: any) => network._id === connector.networkId);
          if (network && !_filteredNetworks.includes(network)) {
            _filteredNetworks.push(network);
          }
        });
      }

      setNetworks(_filteredNetworks);
      if (!editMode)
        setFormData((prevData) => ({ ...prevData, networkId: _filteredNetworks[0]?._id || '' }));
    }
    getData();
  }, []);

  // Event handler for form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Event handler for form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form Data:', formData);
    // Add logic to handle form submission (e.g., sending data to a server)

    if (editMode) { // make PUT request
      await fetch(`/api/resource`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
    }
    else { // make POST request
      await fetch(`/api/resource`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
    }

    // Close the modal after submission
    closeModal();
  };

  return (
    <div className='relative'>
      <div className="fixed inset-0 flex items-center justify-center z-50 overflow-x-hidden backdrop-blur-md backdrop-filter">
        {/* Main modal */}
        <div className="bg-white absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-opacity-98 border border-gray-600 box-border shadow-lg rounded-2xl overflow-y-auto p-6 max-h-screen w-full lg:w-auto">
          {/* Modal header */}
          <div className="flex items-center justify-between border-b pb-2 sm:pt-8 lg:pt-2">
            <p className="text-3xl pl6 font-bold text-black m-auto ">
              Resource
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
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center mb-4">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-black me-2 w-2/5"
                >
                  Name:
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-gray-100 rounded-md hover:border-b-2 hover:border-b-black text-black py-2 px-4 hover:shadow-lg w-full"
                  placeholder="Resource name"
                  required
                />
              </div>
              <div className="flex items-center mb-4">
                <label
                  htmlFor="address"
                  className="text-sm font-medium text-black me-2 w-2/5"
                >
                  Address:
                </label>
                <input
                  type="text"
                  name="address"
                  id="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="bg-gray-100 rounded-md hover:border-b-2 hover:border-b-black text-black py-2 px-4 hover:shadow-lg w-full"
                  placeholder="Resource address"
                  required
                />
              </div>
              <div className="flex items-center mb-4">
                <label
                  htmlFor="alias"
                  className="text-sm font-medium text-black me-2 w-2/5"
                >
                  Alias:
                </label>
                <input
                  type="text"
                  name="alias"
                  id="alias"
                  value={formData.alias}
                  onChange={handleChange}
                  className="bg-gray-100 rounded-md hover:border-b-2 hover:border-b-black text-black py-2 px-4 hover:shadow-lg w-full"
                  placeholder="Resource alias"
                />
              </div>

              <div className="flex items-center mb-4">
                <label
                  htmlFor="networkId"
                  className="text-sm font-medium text-black me-2 w-2/5"
                >
                  Network:
                </label>
                <select
                  name="networkId"
                  id="networkId"
                  value={formData.networkId}
                  onChange={handleChange}
                  className="bg-gray-100 rounded-md hover:border-b-2 hover:border-b-black text-black py-2 px-4 hover:shadow-lg w-full"
                  required
                  disabled={editMode}
                >
                  {/* Set first network as default */}
                  {networks.map((network, index) => (
                    <option value={network._id} key={index} className='text-black'>{network.name} ({network.location})</option>
                  ))}
                </select>
              </div>

              {/* Add similar blocks for other fields (tcpStatus, udpStatus, icmpStatus, tcpPorts, udpPorts) */}
              <div className="flex items-center mb-4">
                <label
                  htmlFor="tcpStatus"
                  className="text-sm font-medium text-black me-2 w-2/5"
                >
                  TCP Status:
                </label>
                <select
                  name="tcpStatus"
                  id="tcpStatus"
                  value={formData.tcpStatus}
                  onChange={handleChange}
                  className="bg-gray-100 rounded-md hover:border-b-2 hover:border-b-black text-black py-2 px-4 hover:shadow-lg w-full"
                  required
                >
                  <option value="allowed" className='text-black'>Allow All</option>
                  <option value="blocked" className='text-black'>Block</option>
                  <option value="custom" className='text-black'>Custom</option>
                </select>
              </div>
              <div className="flex items-center mb-4">
                <label
                  htmlFor="tcpPorts"
                  className="text-sm font-medium text-black me-2 w-2/5"
                >
                  TCP Ports:
                </label>
                <input
                  type="text"
                  name="tcpPorts"
                  id="tcpPorts"
                  value={formData.tcpPorts.join(',')} // Convert array to string
                  onChange={(e) => {
                    // Convert comma-separated string to an array
                    const ports = e.target.value.split(',').map(port => port.trim());
                    setFormData((prevData) => ({ ...prevData, tcpPorts: ports }));
                  }}
                  className="bg-gray-100 rounded-md hover:border-b-2 hover:border-b-black text-black py-2 px-4 hover:shadow-lg w-full"
                  placeholder="comma-separated"

                  // disable the input if tcpStatus is not custom
                  disabled={formData.tcpStatus !== 'custom'}
                />
              </div>

              <div className="flex items-center mb-4">
                <label
                  htmlFor="udpStatus"
                  className="text-sm font-medium text-black me-2 w-2/5"
                >
                  UDP Status:
                </label>
                <select
                  name="udpStatus"
                  id="udpStatus"
                  value={formData.udpStatus}
                  onChange={handleChange}
                  className="bg-gray-100 rounded-md hover:border-b-2 hover:border-b-black text-black py-2 px-4 hover:shadow-lg w-full"
                  required
                >
                  <option value="allowed" className='text-black'>Allow All</option>
                  <option value="blocked" className='text-black'>Block</option>
                  <option value="custom" className='text-black'>Custom</option>
                </select>
              </div>
              <div className="flex items-center mb-4">
                <label
                  htmlFor="udpPorts"
                  className="text-sm font-medium text-black me-2 w-2/5"
                >
                  UDP Ports:
                </label>
                <input
                  type="text"
                  name="udpPorts"
                  id="udpPorts"
                  value={formData.udpPorts.join(',')} // Convert array to string
                  onChange={(e) => {
                    // Convert comma-separated string to an array
                    const ports = e.target.value.split(',').map(port => port.trim());
                    setFormData((prevData) => ({ ...prevData, udpPorts: ports }));
                  }}
                  className="bg-gray-100 rounded-md hover:border-b-2 hover:border-b-black text-black py-2 px-4 hover:shadow-lg w-full"
                  placeholder="comma-separated"

                  // disable the input if udpStatus is not custom
                  disabled={formData.udpStatus !== 'custom'}
                />
              </div>

              <div className="flex items-center mb-4">
                <label
                  htmlFor="icmpStatus"
                  className="text-sm font-medium text-black me-2 w-2/5"
                >
                  ICMP Status:
                </label>
                <select
                  name="icmpStatus"
                  id="icmpStatus"
                  value={formData.icmpStatus}
                  onChange={handleChange}
                  className="bg-gray-100 rounded-md hover:border-b-2 hover:border-b-black text-black py-2 px-4 hover:shadow-lg w-full"
                  required
                >
                  <option value="allowed" className='text-black'>Allow</option>
                  <option value="blocked" className='text-black'>Block</option>
                </select>
              </div>

            </div>
            <button
              type="submit"
              className="w-full bg-black text-white font-bold py-2 px-4 rounded-md hover:bg-gray-700"
            >
              Save Resource
            </button>
          </form>
          <div className='px-4'>
            {editMode && (
              <button
                type="submit"
                className="mt-2 w-full bg-red-500 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-700"
                onClick={async () => {
                  const response = await fetch(`/api/resource`, {
                    method: 'DELETE',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ _id: formData._id }),
                  });
                  const data = await response.json();
                  console.log('Response:', data);
                  closeModal();
                }}
              >
                Delete Reource
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
