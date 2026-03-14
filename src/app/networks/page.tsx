"use client";

import React, { useEffect, useState } from 'react';
import { Network as NetworkType } from "@/types/network";
import { Connector as ConnectorType } from "@/types/connector";
import Network from "@/components/Networks/network";
import NetworkFormModal from "@/components/Networkform/Networkform";
import { useSession } from 'next-auth/react';
import { clientSideEditAccess } from '@/utils/userEditAccess';

export default function Dashboard() {
  const { data: session } = useSession();
  const role = session?.user.role;

  const privilegeCheck = () => {
    if (!role) return false;
    return clientSideEditAccess(role);
  }

  const now = new Date().toDateString();
  const [networks, setNetworks] = useState<NetworkType[]>([]);

  const getNetworks = async () => {
    const response = await fetch(`/api/network`);
    const data = await response.json();
    setNetworks(data.networks);
  };
  const getConnectors = async () => {
    const response = await fetch(`/api/connector`);
    const data = await response.json();
    setConnectors(data.connectors);
  };
  useEffect(() => {
    getNetworks();
    getConnectors();
  }, []);

  const [connectors, setConnectors] = useState<ConnectorType[]>([]);

  const numberOfNetworks = networks.length;
  const numberOfConnectors = connectors.length;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [values, setValues] = useState({} as NetworkType); // values to be edited
  const [displayMode, setDisplayMode] = useState('card'); // 'card' or 'table'

  const toggleDisplayMode = () => {
    setDisplayMode((prevMode) => (prevMode === 'card' ? 'table' : 'card'));
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    getNetworks();
    getConnectors();
  };

  const openEditModal = () => {
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    getNetworks();
    getConnectors();
  };
  const [searchTerm, setSearchTerm] = useState('');
  const filteredNetworks = networks.filter(
    (network) =>
      network.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      network.location.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="flex flex-wrap h-screen">
      <div className="w-full rounded-3xl bg-white p-6 overflow-x-hidden">
        <div className="mb-3 flex items-center justify-between text-black m-auto">
          <div>
            <p className="text-3xl font-bold">Network Management</p>
            <p className="text-sm text-gray-500">Manage and track network information</p>
          </div>
          <p>{now}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between p-0 m-auto">
          <div className="w-full md:w-5/12 lg:w-4/12 xl:w-3/12 text-black pr-6 mb-4 md:mb-0">
            <div className="flex flex-col mt-2">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Search Networks"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-100 rounded-l-md hover:border-b-2 hover:border-b-black text-black py-2 px-4 hover:shadow-lg w-full"
                />
                <button
                  className="bg-black text-white font-bold py-2 px-4 rounded-r-md hover:bg-gray-700 ml-0"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
          <div className="w-full md:w-4/12 flex justify-center items-center text-center mx-auto">
            <button
              data-modal-target="crud-modal"
              data-modal-toggle="crud-modal"
              className="md:m-auto bg-black text-white font-bold py-3 px-4 rounded-full transition-shadow hover:ring-2 hover:ring-gray-300"
              type="button"
              onClick={openModal}
              disabled={!privilegeCheck()}
            >
              ✢ Remote Network
            </button>
            {/* Modal */}
            {isModalOpen && <NetworkFormModal closeModal={closeModal} />}
            {isEditModalOpen && <NetworkFormModal closeModal={closeEditModal} initialValues={values} />}

            <button
              className="hidden md:block md:m-auto bg-black text-white font-bold py-3 px-4 rounded-full transition-shadow hover:ring-2 hover:ring-gray-300"
              onClick={toggleDisplayMode}
            >
              Switch Display
            </button>
          </div>

          <div className="w-full md:w-2/12 flex mt-2 md:mt-0">
            <div className="w-6/12">
              <div className="text-4xl font-bold text-white m-1 p-1 bg-black text-center rounded-lg">{numberOfNetworks}</div>
              <div className='text-black text-center font-bold'>Networks</div>
            </div>

            <div className="w-6/12">
              <div className="text-4xl font-bold text-white m-1 p-1 bg-black text-center rounded-lg">{numberOfConnectors}</div>
              <div className='text-black text-center font-bold'>Connectors</div>
            </div>
          </div>
        </div>


        <div className="text-xl font-bold text-center text-black mt-5">Available Networks</div>

        {/* Networks */}
        <div className="p-4 hidden md:block">


          {displayMode === 'card' ? (
            <div className="flex flex-wrap justify-center">
              {filteredNetworks.map((network, index) => (

                <div key={index} className="w-full sm:w-1/2 md:w-1/3 lg:w-2/6 xl:w-2/6 p-2">
                  <Network network={network} numberOfConnectors={(connectors.filter(connector => connector.networkId === network._id)).length} setIsEditModalOpen={setIsEditModalOpen} setValues={setValues} />
                </div>
              ))}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-300 rounded-lg overflow-hidden shadow-lg">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="py-2 px-4 text-left">Name</th>
                  <th className="py-2 px-4 text-left">Connectors</th>
                  <th className="py-2 px-4 text-left">Location</th>
                  <th className="py-2 px-4 text-left w-fit-content">Edit</th>
                </tr>
              </thead>
              <tbody>
                {filteredNetworks.map((network, index) => {
                  const numberOfConnectors = connectors.filter(
                    (connector) => connector.networkId === network._id
                  ).length;

                  return (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
                      <td className="py-2 px-4">{network.name}</td>
                      <td className="py-2 px-4">{numberOfConnectors}</td>
                      <td className="py-2 px-4">{network.location}</td>
                      <td className="py-2 px-4 whitespace-nowrap">
                        <button
                          className="text-white font-bold py-1 px-2 rounded bg-green-500"
                          onClick={() => {
                            setValues(network);
                            openEditModal();
                          }}
                          disabled={!privilegeCheck()}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

        </div>
        <div className='p-4 block md:hidden'>
          <div className="flex flex-wrap justify-center">
            {filteredNetworks.map((network, index) => (

              <div key={index} className="w-full sm:w-1/2 md:w-1/3 lg:w-2/6 xl:w-2/6 p-2">
                <Network network={network} numberOfConnectors={(connectors.filter(connector => connector.networkId === network._id)).length} setIsEditModalOpen={setIsEditModalOpen} setValues={setValues} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );


}
