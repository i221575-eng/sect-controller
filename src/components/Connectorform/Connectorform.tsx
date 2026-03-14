import { useState, useEffect } from 'react';
import { Connector as ConnectorType } from '@/types/connector';
import { Network as NetworkType } from '@/types/network';
import { Resource as ResourceType } from '@/types/resource';

export default function ConnectorFormModal({ closeModal, initialValues }: { closeModal: () => void, initialValues?: ConnectorType }) {
  // State to manage form data
  const editMode = Boolean(initialValues);
  const [activeStep, setActiveStep] = useState(1);
  const handleNextStep = () => {
    if (activeStep < 2) {
      setActiveStep(activeStep + 1);
    }
  }
  const handlePrevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };
  const [formData, setFormData] = useState<ConnectorType>({
    _id: initialValues?._id || '',
    name: initialValues?.name || '',
    accessToken: initialValues?.accessToken || '',
    refreshToken: initialValues?.refreshToken || '',
    networkId: initialValues?.networkId || '',
    status: initialValues?.status || false,
    ip: initialValues?.ip || '',
  });

  const [connectorStatus, setConnectorStatus] = useState(formData.status ? 'en' : 'dis');
  const [dockerCommand, setDockerCommand] = useState<string>(''); // Fix: Specify the type of the state variable

  const [networks, setNetworks] = useState<NetworkType[]>([]);
  const [deleteAllowed, setDeleteAllowed] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    navigator.clipboard.writeText(dockerCommand)
      .then(() => setCopied(true))
      .catch((error) => console.error('Failed to copy:', error));

    // Reset the "Copied" text after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }
  useEffect(() => {
    async function getData() {
      const res = await fetch('/api/network');
      const data = await res.json();
      setNetworks(data.networks);
      if (!editMode)
        setFormData((prevData) => ({ ...prevData, networkId: data.networks[0]?._id || '' }));

      if (editMode) {
        const res = await fetch(`/api/connector`);
        const _connectors = await res.json();

        const numberOfConnectorsWithInNetwork = _connectors?.connectors.filter((connector: ConnectorType) => connector.networkId === initialValues?.networkId).length;

        if (numberOfConnectorsWithInNetwork > 1) {
          setDeleteAllowed(true);
        }
        else {
          const res = await fetch(`/api/resource`);
          const _resources = await res.json();

          const numberOfResourcesWithInNetwork = _resources?.resources.filter((resource: ResourceType) => resource.networkId === initialValues?.networkId).length;
          if (numberOfResourcesWithInNetwork === 0) {
            setDeleteAllowed(true);
          }
          else {
            setDeleteAllowed(false);
          }
        }
      }
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
    let response: any;
    if (editMode) { // make PUT request
      await fetch(`/api/connector`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      closeModal();
    }
    else { // make POST request
      const dataToSend = {
        name: formData.name,
        networkId: formData.networkId,
        status: formData.status,
      };

      response = await fetch(`/api/connector`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });
      const responseData = await response.json();
      const { id, ip, accessToken, refreshToken, socketAddr, relayAddr, relayport } = responseData;
      setDockerCommand(`docker run -it --privileged \\\n` +
        `-e ACCESS_TOKEN=${accessToken} \\\n` +
        `-e REFRESH_TOKEN=${refreshToken} \\\n` +
        `-e CONNECTOR_IP=${ip} \\\n` +
        `-e RELAY_IP=${relayAddr} \\\n` +
        `-e RELAY_PORT=${relayport} \\\n` +
        `-e SOCKET_SERVER_ADDR=${socketAddr} \\\n` +
        `fahadsheikh003/sect-connector`);
      handleNextStep();
    }
  };


  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 overflow-x-hidden overflow-y-auto backdrop-blur-md backdrop-filter">
      {/* Main modal */}
      <div className="w-full md:w-auto bg-white absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-opacity-98 border border-gray-600 box-border shadow-lg rounded-2xl p-6">

        {/* Modal header */}
        <div className="flex items-center justify-between p-4 border-b">

          <p className="text-3xl pl6 font-bold text-black m-auto ">
            Connector
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
          {activeStep === 1 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center mb-4">
                  <label
                    htmlFor="name"
                    className="text-sm font-medium text-black me-2 w-1/3 md:w-2/5"
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
                    placeholder="Connector name"
                    required
                  />
                </div>

                <div className="flex items-center mb-4">
                  <label
                    htmlFor="networkId"
                    className="text-sm font-medium text-black me-2 w-1/3 md:w-2/5"
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

                <div className="flex items-center mb-4">
                  <label
                    htmlFor="status"
                    className="text-sm font-medium text-black me-2 w-1/3 md:w-2/5"
                  >
                    Status:
                  </label>
                  <select
                    name="status"
                    id="status"
                    value={connectorStatus}
                    onChange={(e) => {
                      setConnectorStatus(e.target.value);
                      setFormData((prevData) => ({ ...prevData, status: e.target.value === 'en' }));
                    }}
                    className="bg-gray-100 rounded-md hover:border-b-2 hover:border-b-black text-black py-2 px-4 hover:shadow-lg w-full"
                    required
                  >
                    <option value="en" className='text-black'>Enable</option>
                    <option value="dis" className='text-black'>Disable</option>
                  </select>
                </div>
              </div>
              {!editMode && (
                <div>
                  <style jsx>{`
                    .svg-icon:hover path {
                      fill: #4fd1e5; /* Change to sky-700 color */
                    }
                  `}</style>
                  <button
                    type="submit"
                    className=" svg-icon w-full bg-black text-white font-bold py-2 px-4 rounded-md hover:bg-gray-700 flex items-center justify-center"

                  >
                    <span className='inline-block'>
                      <svg
                        className="inline-block align-middle"
                        xmlns="http://www.w3.org/2000/svg"
                        width="40"
                        height="40"
                        viewBox="0 0 256 256"
                      >
                        <path
                          fill="#fff"
                          strokeMiterlimit="10"
                          d="M20 9v5H10v5H5v5H1.125a.974.974 0 00-.969.813A11.73 11.73 0 000 26.75c0 .7.066 1.46.188 2.219 1.144-.274 3.242-.684 2.874-2.032 1.973 2.286 6.708 1.594 7.907.47 1.34 1.94 9.144 1.198 9.687-.313 1.68 1.968 6.887 1.968 8.563 0 .543 1.511 8.316 2.254 9.656.312.426.399 1.313.73 2.344.907.347-.66.668-1.325.968-2.032 6.352-.078 7.723-4.644 7.782-4.843.11-.383-.04-.778-.344-1.032-.105-.09-2.45-1.992-6.25-1.343-1.066-3.473-3.813-5.055-3.938-5.125a.991.991 0 00-1.124.093c-.102.082-2.465 2.086-2.094 6.188a7.371 7.371 0 00.781 2.75c-.82.457-2.23 1.031-4.5 1.031H32v-5h-5V9zm21.219 19.313c-.121.234-.278.46-.407.687h9.032c-1.086-.273-3.418-.64-3.032-2.063-1.277 1.477-3.703 1.696-5.593 1.375zm-.407.687H.188a15.645 15.645 0 001.5 4.5c5.43 1.277 11.128-.668 11.187-.688.523-.183 1.07.106 1.25.626.184.519-.074 1.101-.594 1.28-.191.067-3.625 1.22-7.844 1.22a21.13 21.13 0 01-2.593-.157C5.719 39.261 10.168 42 17 42c10.805 0 19.113-4.59 23.813-13zM.188 29c-.004-.016.003-.016 0-.031-.067.015-.13.015-.188.031zM22 11h3v3h-3zm-10 5h3v3h-3zm5 0h3v3h-3zm5 0h3v3h-3zM7 21h3v3H7zm5 0h3v3h-3zm5 0h3v3h-3zm5 0h3v3h-3zm5 0h3v3h-3zM16 31c.129 0 .262.02.375.063-.121.07-.219.19-.219.343 0 .227.18.438.407.438a.449.449 0 00.375-.219c.05.117.062.238.062.375 0 .55-.45 1-1 1s-1-.45-1-1 .45-1 1-1z"
                          fontFamily="none"
                          fontSize="none"
                          fontWeight="none"
                          textAnchor="none"
                          transform="scale(5.12)"
                        ></path>
                      </svg>
                    </span>
                    <span className='ml-2'>Deploy Connector</span>
                  </button>
                </div>

              )}
            </>
          )}
          {activeStep === 2 && (
            <div className='px-4'>
              Copy the Command below to initilize the connector deployment.
              <div className="bg-gray-100 p-4 rounded-lg max-w-lg break-all max-h-64 overflow-auto relative">
                <pre className="text-gray-800 whitespace-pre-wrap text-left">
                  {dockerCommand}
                </pre>
                <button
                  className={`absolute top-2 right-2 bg-gray-300 text-gray-800 px-4 py-2 rounded ${copied ? 'bg-green-100' : ''}`}
                  onClick={copyToClipboard}
                  style={{ zIndex: 1 }}
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>



            </div>
          )}
          {(activeStep === 2) && (
            <div className='px-4'>
              <button
                type="button"
                className=" px-4 w-full bg-black text-white font-bold py-2 px-4 rounded-md hover:bg-gray-700 mt-2"
                onClick={closeModal}
              >
                Finish Deployment
              </button>
            </div>
          )}

          <div className='px-4'>
            {editMode && (
              <>
                <button
                  className='w-full bg-black text-white font-bold py-2 px-4 rounded-md hover:bg-gray-700 mt-2'
                  type="submit"
                >
                  Save Changes
                </button>
                <button
                  type="submit"
                  className={`mt-2 w-full bg-red-500 text-white font-bold py-2 px-4 rounded-md ${deleteAllowed ? 'hover:bg-red-700' : 'cursor-not-allowed'}`}
                  onClick={async () => {
                    const response = await fetch(`/api/connector`, {
                      method: 'DELETE',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ _id: formData._id }),
                    });
                    const data = await response.json();

                    if (data.error) {
                      alert(data.error);
                    }

                    console.log('Response:', data);
                    closeModal();
                  }}
                  disabled={!deleteAllowed}
                >
                  Delete Connector
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
