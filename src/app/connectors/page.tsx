"use client";
import React, { useState, useEffect } from 'react';
import { Network as NetworkType } from "@/types/network";
import { Connector as ConnectorType } from '@/types/connector';
import Connector from '@/components/Connector/Connector';
import ConnectorFormModal from '@/components/Connectorform/Connectorform';
import { useSession } from 'next-auth/react';
import { clientSideEditAccess } from '@/utils/userEditAccess';

export default function Content() {
  const { data: session } = useSession();
  const role = session?.user.role;

  const privilegeCheck = () => {
    if (!role) return false;
    return clientSideEditAccess(role);
  }

  const [networks, setNetworks] = useState<NetworkType[]>([]);
  const [connector, setConnector] = useState<ConnectorType[]>([]);

  async function getData() {
    const res = await fetch('/api/network');
    const data = await res.json();
    setNetworks(data.networks);

    const res2 = await fetch('/api/connector');
    const data2 = await res2.json();
    setConnector(data2.connectors);
  }

  useEffect(() => {
    getData();
  }, []);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredConnectors, setFilteredConnectors] = useState<ConnectorType[]>([]);

  const handleSearch = () => {
    const filtered = connector.filter((connector) =>
      connector.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredConnectors(filtered);
  };


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [values, setValues] = useState({} as ConnectorType); // values to be edited
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const openEditModal = () => {
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    getData();
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    getData();
  };

  const now = new Date().toDateString();
  return (
    <div className="flex flex-wrap h-screen mb-20">
      <div className="w-full rounded-3xl bg-white p-6">
        <div className="mb-8 flex items-center justify-between text-black m-auto">
          <div>
            <p className="text-3xl font-bold">Connector Management</p>
            <p className="text-sm text-gray-500">Manage and track connector information</p>
          </div>
          <p>{now}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between p-0 m-auto">
          <div className="w-full md:w-5/12 lg:w-4/12 xl:w-3/12 text-black pr-6 mb-4 md:mb-0">
            <div className="flex flex-col mt-2">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Connectors"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-100 rounded-l-md hover:border-b-2 hover:border-b-black text-black py-2 px-4 hover:shadow-lg w-full"
                />
                <button
                  className="bg-black text-white font-bold py-2 px-4 rounded-r-md hover:bg-gray-700 ml-0"
                  onClick={handleSearch}
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          <div className="w-full md:w-5/12 lg:w-4/12 xl:w-3/12 flex items-center text-center m-auto pr-3">
            <button
              data-modal-target="crud-modal"
              data-modal-toggle="crud-modal"
              className="m-auto bg-black text-white font-bold py-3 px-4 rounded-full transition-shadow hover:ring-2 hover:ring-gray-300"
              type="button"
              onClick={openModal}
              disabled={!privilegeCheck()}
            >
              ✢ New Connector
            </button>
            {/* Modal */}
            {isModalOpen && <ConnectorFormModal closeModal={closeModal} />}
            {isEditModalOpen && <ConnectorFormModal closeModal={closeEditModal} initialValues={values} />}
          </div>

          <div className="flex w-full md:w-3/12 justify-center md:justify-end mt-2 md:mt-0">
            <div className="w-6/12 text-white">
              <div className="text-4xl font-bold text-white m-1 p-1 bg-black text-center rounded-lg">{networks.length}</div>
              <div className='text-black text-center font-bold'>Networks</div>
            </div>

            <div className="w-6/12 text-white">
              <div className="text-4xl font-bold text-white m-1 p-1 bg-black text-center rounded-lg">{connector.length}</div>
              <div className='text-black text-center font-bold'>Connectors</div>
            </div>
          </div>
        </div>


        {filteredConnectors.length > 0 && (
          <div>
            <p className="text-2xl font-bold text-black pb-5">Filtered Connectors</p>
            <div className="mb-3 flex flex-wrap" style={{ borderRadius: '8px', opacity: 0.7 }}>
              {networks.map((network, index) => {
                const networkConnector = filteredConnectors.filter(connector => connector.networkId === network._id);
                // Only render the network if there are matching Connectors
                if (networkConnector.length > 0) {
                  return (
                    <Connector key={index} row={index} network={network} connector={networkConnector} setIsEditModalOpen={setIsEditModalOpen} setValues={setValues} />
                  );
                }
              })}
            </div>
          </div>
        )}
        {/* Display original Connectors if no filtering or show a message when no Connectors match the search */}
        {(filteredConnectors.length === 0 && searchTerm !== '') && (
          <p className="text-red-500 text-md">No Connectors found for the given search term.</p>
        )}

        {!filteredConnectors.length && (
          <div>
            <p className="text-2xl font-bold text-black pb-5">Networks</p>
            <div className="mb-3 flex flex-wrap" style={{ borderRadius: '8px', opacity: 0.7 }}>
              {networks.map((network, index) => {
                const networkConnector = connector.filter(connector => connector.networkId === network._id);
                // Only render the network if there are matching Connectors
                if (networkConnector.length > 0) {
                  return (
                    <Connector key={index} row={index} network={network} connector={networkConnector} setIsEditModalOpen={setIsEditModalOpen} setValues={setValues} />
                  );
                }
                // Don't render the network if no matching Connectors
                return null;
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
