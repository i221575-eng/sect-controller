"use client";
import React, { useState, useEffect } from 'react';
import { Network as NetworkType } from "@/types/network";
import { Resource as ResourceType } from '@/types/resource';
import Resource from '@/components/Resources/resource';
import ResourceFormModal from '@/components/Resourceform/resourceform';
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
  const [resources, setResources] = useState<ResourceType[]>([]);

  async function getData() {
    const res = await fetch('/api/network');
    const data = await res.json();
    setNetworks(data.networks);

    const res2 = await fetch('/api/resource');
    const data2 = await res2.json();
    setResources(data2.resources);
  }

  useEffect(() => {
    getData();
  }, []);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredResources, setFilteredResources] = useState<ResourceType[]>([]);

  const handleSearch = () => {
    // Filter resources based on the search term
    const filtered = resources.filter(resource =>
      resource.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredResources(filtered);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [values, setValues] = useState({} as ResourceType); // values to be edited
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
            <p className="text-3xl font-bold">Resource Management</p>
            <p className="text-sm text-gray-500">Manage and track resource information</p>
          </div>
          <p>{now}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between p-0 m-auto">
        <div className="w-full md:w-5/12 lg:w-4/12 xl:w-3/12 text-black pr-6 mb-4 md:mb-0">
            <div className="flex flex-col mt-2">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Resources"
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

          <div className="w-full md:w-4/12 flex items-center text-center m-auto">
            <button
              data-modal-target="crud-modal"
              data-modal-toggle="crud-modal"
              className="m-auto bg-black text-white font-bold py-3 px-4 rounded-full transition-shadow hover:ring-2 hover:ring-gray-300"
              type="button"
              onClick={openModal}
              disabled={!privilegeCheck()}
            >
              ✢ New Resource
            </button>
            {/* Modal */}
            {isModalOpen && <ResourceFormModal closeModal={closeModal} />}
            {isEditModalOpen && <ResourceFormModal closeModal={closeEditModal} initialValues={values} />}
          </div>

          <div className="flex w-full md:w-3/12 justify-center md:justify-end mt-2 md:mt-0">
            <div className="w-6/12 text-white">
              <div className="text-4xl font-bold text-white m-1 p-1 bg-black text-center rounded-lg">{networks.length}</div>
              <div className='text-black text-center text-bold'>Networks</div>
            </div>

            <div className="w-6/12 text-white">
              <div className="text-4xl font-bold text-white m-1 p-1 bg-black text-center rounded-lg">{resources.length}</div>
              <div className='text-black text-center text-bold'>Resources</div>
            </div>
          </div>
        </div>



        {filteredResources.length > 0 && (
          <div>
            <p className="text-2xl font-bold text-black pb-5">Filtered Resources</p>
            <div className="mb-3 flex flex-wrap" style={{ borderRadius: '8px', opacity: 0.7 }}>
              {networks.map((network, index) => {
                const networkResources = filteredResources.filter(resource => resource.networkId === network._id);
                // Only render the network if there are matching resources
                if (networkResources.length > 0) {
                  return (
                    <Resource key={index} row={index} network={network} resource={networkResources} setIsEditModalOpen={setIsEditModalOpen} setValues={setValues} />
                  );
                }
              })}
            </div>
          </div>
        )}
        {/* Display original resources if no filtering or show a message when no resources match the search */}
        {(filteredResources.length === 0 && searchTerm !== '') && (
          <p className="text-red-500 text-md">No resources found for the given search term.</p>
        )}

        {!filteredResources.length && (
          <div>
            <p className="text-2xl font-bold text-black pb-5">Networks</p>
            <div className="mb-3 flex flex-wrap" style={{ borderRadius: '8px', opacity: 0.7 }}>
              {networks.map((network, index) => {
                const networkResources = resources.filter(resource => resource.networkId === network._id);
                // Only render the network if there are matching resources
                if (networkResources.length > 0) {
                  return (
                    <Resource key={index} row={index} network={network} resource={networkResources} setIsEditModalOpen={setIsEditModalOpen} setValues={setValues} />
                  );
                }
                // Don't render the network if no matching resources
                return null;
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
