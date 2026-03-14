import { Network as NetworkType } from "@/types/network";
import { useSession } from "next-auth/react";
import { clientSideEditAccess } from "@/utils/userEditAccess";

export default function Network({ network, numberOfConnectors, setIsEditModalOpen, setValues }: { network: NetworkType, numberOfConnectors: number, setIsEditModalOpen: (value: boolean) => void, setValues: (value: NetworkType) => void }) {
  const { data: session } = useSession();
    const role = session?.user.role;

    const privilegeCheck = () => {
      if (!role) return false;
      return clientSideEditAccess(role);
    }
  return (
    <div className="w-full md:w-full mb-4">
      <div className="p-4">
        <div
          className="bg-gray-100 rounded-3xl p-6 transition-transform transform-gpu hover:transform hover:scale-105 hover:shadow-lg hover:invert relative"
          style={{
            boxShadow: '15px 15px 30px rgba(25, 25, 25, 0.2), -15px -15px 30px rgba(60, 60, 60, 0.2)',
            maxHeight: '200px', 
          }}
        >
          <div className="flex items-center justify-between mb-4 mt-2">
            <p className="text-lg font-bold text-black overflow-hidden overflow-ellipsis">
              {network.name}
            </p>
            <button
              className="text-blue-500 font-bold underline"
              onClick={() => {
                setValues(network);
                setIsEditModalOpen(true);
              }}
              disabled={!privilegeCheck()}
            >
              Edit
            </button>
          </div>
          <div className="text-center">
            <p className="text-sm md:text-base text-black mb-2">{numberOfConnectors} Connectors</p>
            <p className="text-sm md:text-base opacity-90">
              <span className="font-bold text-black">{network.location}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
  

}
