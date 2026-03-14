// components/Resource.js
import { Network as NetworkType } from '@/types/network';
import { Resource as ResourceType } from '@/types/resource';
import { useSession } from 'next-auth/react';
import { clientSideEditAccess } from '@/utils/userEditAccess';

export default function Resource({ row, network, resource, setIsEditModalOpen, setValues }: { row: number, network: NetworkType, resource: ResourceType[], setIsEditModalOpen: (value: boolean) => void, setValues: (value: ResourceType) => void }) {
  const { data: session } = useSession();
  const role = session?.user.role;

  const privilegeCheck = () => {
    if (!role) return false;
    return clientSideEditAccess(role);
  }

  return (
    <div className="w-full p-2 mb-2  border-b-1 border-2 border-gray-400 rounded hover:border-2 hover:border-r-2 hover:border-black hover:shadow-lg hover:shadow-lg" style={{
      background: row % 2 === 0 ? 'white' : '#f0eeee'
    }}>
      <div className="w-full">
        <p className="text-lg text-black"><span className='font-bold'>{network.name}</span> present at <span className='font-bold'>{network.location}</span></p>
      </div>
      <div className="flex flex-wrap mt-3 justify-center">
        {/* Map over the resources array */}
        {resource.map((singleResource, resIndex) => (
          <div
            key={resIndex}
            className="m-3 flex bg-gray-100 rounded-3xl p-4 transition-transform transform-gpu hover:transform hover:scale-105 hover:shadow-lg hover:invert"
            style={{
              boxShadow:
                '5px 5px 10px rgba(25, 25, 25, 0.2), -5px -5px 10px rgba(60, 60, 60, 0.2)',
            }}
          >
            <label className="inline-flex items-center">
              <div className='rounded-full h-10 w-10 flex items-center justify-center text-white text-bold text-lg bg-gray-900'>
                {singleResource.name[0]}
              </div>
            </label>
            <div className="text-left ml-2 flex-grow">
              <p className="text-xs font-bold text-blue-500 truncate w-32">{singleResource.name}</p>
              <p className="text-xs text-gray-500 truncate w-32">
                <span className="font-bold">IP: {singleResource.address}</span>
              </p>
              <p className="text-xs text-gray-500 truncate w-32">Alias: {singleResource.alias}</p>
            </div>
            <div className="flex items-center">
              <button
                className="text-blue-500 font-bold py-2 px-4 rounded-full"
                onClick={() => {
                  setValues(singleResource);
                  setIsEditModalOpen(true);
                }}
                disabled={!privilegeCheck()}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="#0979be"
                  stroke="#0979be"
                  version="1.1"
                  viewBox="0 0 512 512"
                  xmlSpace="preserve"
                >
                  <g>
                    <path d="M311.18 78.008L32.23 356.958.613 485.716a21.221 21.221 0 0025.671 25.671l128.759-31.617 278.95-278.95L311.18 78.008zM40.877 471.123l10.871-44.271 33.4 33.4-44.271 10.871zM502.598 86.818L425.182 9.402c-12.536-12.536-32.86-12.536-45.396 0l-30.825 30.825 122.812 122.812 30.825-30.825c12.536-12.535 12.536-32.86 0-45.396z"></path>
                  </g>
                </svg>
              </button>
            </div>
          </div>
        ))}

      </div>
    </div>
  );

}
