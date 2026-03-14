"use client"
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { User as UserType } from "@/types/user";
import Link from 'next/link';
export default function Home() {
  type Stat = {
    userRole: string, // Assuming ownRole is a string

    noOConnectors: number,
    enabledConnectors: number,

    users: number,
    admins: number,
    managers: number,

    noofResources: number,
    enabledResources: number,

    noOfGroupPolicies: number,
    noOfUserPolicies: number,

    noOfNetworks: number,
    awsNetworks: number,
    OnpremNetworks: number,

    noOfGroups: number
  };

  const [isLoading, setIsLoading] = useState(true); // Track loading state

  const [stats, setstats] = useState({} as Stat);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 700);

    fetch("/api/stats")
      .then(res => res.json())
      .then(data => {
        setstats(data.stats);
      })
      .catch(error => console.error("Error fetching stats:", error));

    return () => clearTimeout(timeout);
  }, []);

  const { data: session } = useSession({ required: true });
  const user = session?.user as unknown as UserType;

  if (isLoading) {
    return (
      <div className="animate-ping opacity-60 absolute inset-0 flex items-center justify-center rounded-full">
        <div className="w-80 h-80 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-4xl font-bold text-gray-600">ZTNA</span>
        </div>
      </div>
    );
  }


  return (
    <div>
      <div className="flex flex-col md:flex-row gap-2 pt-5 justify-center">
        <div className="md:w-6/12 mx-auto">
          <div className="bg-white shadow-lg rounded-lg p-3 mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold mb-4">Welcome to the Administration Console</h2>
            <p className="mb-2 lg:text-lg">To get started, follow our setup <a href="#" className="text-blue-500 hover:underline">Guide</a></p>
            <ol className="list-decimal pl-6 lg:text-lg">
              <li>Create a network with an appropriate name</li>
              <li>Create a connector and add it to the network</li>
              <li>Create a resource and add it to the connector</li>
              <li>Configure policy for resources</li>
            </ol>
          </div>
        </div>

        <div className="md:w-6/12 mx-auto flex justify-center">
          <div className="rounded-sm p-3">
            <div className="flex flex-col md:flex-row gap-5">
              <div className="w-full flex items-center md:w-auto">
                <div className="flex items-center justify-center p-4 pt-2">
                  <div className="rounded-sm overflow-hidden h-20 w-20 flex items-center justify-center bg-gray-900 text-white font-bold text-lg">
                    {user?.image ? (
                      <img
                        src={user?.image}
                        alt="profile"
                        className="object-cover h-full w-full"
                      />
                    ) : (
                      <span>{user?.name[0]}</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col justify-center px-4">
                  <h2 className="text-md font-bold lg:text-lg">{user?.name}</h2>
                  <p className="text-gray-600 lg:text-lg">{user?.email}</p>
                  <p className="text-gray-600 lg:text-lg"><strong>Role:</strong> {stats?.userRole}</p>
                </div>
              </div>
            </div>
            <div style={{ width: '100%' }} className="opacity-95 mb-2 p-3 pt-1 lg:text-xl">
              <h3 style={{ paddingLeft: '2px' }} className="text-xl lg:text-2xl text-neutral-700 font-bold">Permissions</h3>
              {user?.role === 'admin' && (
                <ul className="pl-8 space-y-4" style={{ listStyleType: 'disc', textAlign: 'left', color: '#555' }}>
                  <li>You can create, edit, and delete networks, connectors, resources, groups, and policies.</li>
                  <li>You can create, delete, and manage users with the role of Manager or Member.</li>
                  <li>You cannot edit users with the administrators' role.</li>
                </ul>
              )}
              {user?.role === 'manager' && (
                <ul className="pl-8 space-y-0 text-sm lg:text-lg" style={{ listStyleType: 'disc', textAlign: 'left', color: '#555' }}>
                  <li>You can create, edit, and delete networks, connectors, and resources.</li>
                  <li>You can only create and edit users with the role of Member.</li>
                  <li>You cannot create or edit policies or groups.</li>
                </ul>
              )}
              {user?.role === 'superadmin' && (
                <ul className="pl-8 space-y-4" style={{ listStyleType: 'disc', textAlign: 'left', color: '#555' }}>
                  <li>You can create, edit, and delete networks, connectors, and resources.</li>
                  <li>You can create and edit users with the role of Member, Manager, and Admin.</li>
                </ul>
              )}
            </div>
          </div>
        </div>

      </div>

      <div className="flex flex-col md:flex-row gap-2 pt-5 bg-white justify-center items-center w-auto md:p-4">
        <div className="flex flex-col md:flex-row gap-5">
          <div className="flex flex-wrap md:justify-center md:items-centerp-auto m-auto">
          <div className="m-auto">
            <fieldset className="m-2 border border-solid border-gray-400 p-3 rounded-md"  style={{width: "350px"}}>
              <legend className="text-md lg:text-lg">Connectivity</legend>

              {/* First item */}
              <Link href='/networks'>
              <div className="flex items-center border-b border-gray-500 pb-2 pt-2 drop-shadow">
                <div className="flex items-center">
                  <div className="rounded-full bg-gray-200 hover:bg-white p-1 mr-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl lg:text-2xl text-neutral-700 font-bold">{stats.noOfNetworks}{" "}{stats.noOfNetworks <= 1 ? 'Network' : 'Networks'}</p>
                    <p className="text-sm lg:text-lg text-gray-600">{stats.OnpremNetworks}{" On-Prem, "}{stats.awsNetworks}{" AWS & "}{stats.noOfNetworks - stats.OnpremNetworks - stats.awsNetworks}{" Others"}</p>
                  </div>
                </div>
              </div>
              </Link>
              

              {/* Second item */}
              <Link href='/connectors'>
              <div className="flex items-center border-b border-gray-500 pb-2 pt-2 drop-shadow">
                <div className="flex items-center">
                  <div className="rounded-full bg-gray-200 hover:bg-white p-1 mr-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      viewBox="0 0 20 20"
                      fill="#0f0f0f"
                    >
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl lg:text-2xl text-neutral-700 font-bold">{stats.noOConnectors}{" "}{stats.noOConnectors <= 1 ? 'Connector' : 'Connectors'}</p>
                    <p className="text-sm lg:text-lg text-gray-600">{stats.enabledConnectors}{" Enabled & "}{stats.noOConnectors - stats.enabledConnectors}{" Disabled"}</p>
                  </div>
                </div>
              </div>
              </Link>

              {/* Third item */}
              <Link href='/resources'>
              <div className="flex items-center pb-2 pt-2 drop-shadow">
                <div className="flex items-center">
                  <div className="rounded-full bg-gray-200 hover:bg-white p-1 mr-2">
                    <svg
                      fill="currentColor"
                      className="w-6 h-6"
                      viewBox="0 0 2048 1792"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M685 483q16 0 27.5-11.5t11.5-27.5-11.5-27.5-27.5-11.5-27 11.5-11 27.5 11 27.5 27 11.5zm422 0q16 0 27-11.5t11-27.5-11-27.5-27-11.5-27.5 11.5-11.5 27.5 11.5 27.5 27.5 11.5zm-812 184q42 0 72 30t30 72v430q0 43-29.5 73t-72.5 30-73-30-30-73v-430q0-42 30-72t73-30zm1060 19v666q0 46-32 78t-77 32h-75v227q0 43-30 73t-73 30-73-30-30-73v-227h-138v227q0 43-30 73t-73 30q-42 0-72-30t-30-73l-1-227h-74q-46 0-78-32t-32-78v-666h918zm-232-405q107 55 171 153.5t64 215.5h-925q0-117 64-215.5t172-153.5l-71-131q-7-13 5-20 13-6 20 6l72 132q95-42 201-42t201 42l72-132q7-12 20-6 12 7 5 20zm477 488v430q0 43-30 73t-73 30q-42 0-72-30t-30-73v-430q0-43 30-72.5t72-29.5q43 0 73 29.5t30 72.5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl lg:text-2xl text-neutral-700 font-bold">{stats.noofResources}{" "}{stats.noofResources <= 1 ? 'Resource' : 'Resources'}</p>
                    <p className="text-sm lg:text-lg text-gray-600">Registered against networks</p>
                  </div>
                </div>
              </div>
              </Link>

            </fieldset>
            </div>
            <div className="m-auto">
            <fieldset className="m-2 border border-solid border-gray-400 p-3 rounded-md"   style={{width: "350px"}}>
              <legend className="text-md lg:text-lg">Users</legend>

              {/* First item */}
              <Link href='/users'>
              <div className="flex items-center border-b border-gray-500 pb-2 pt-2 drop-shadow">
                <div className="flex items-center">
                  <div className="rounded-full bg-gray-200 hover:bg-white p-1 mr-2">
                    <svg className="h-6 w-6" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 60.671 60.671" xmlSpace="preserve">
                      <g>
                        <g>
                          <ellipse style={{ fill: '#010002' }} cx="30.336" cy="12.097" rx="11.997" ry="12.097" />
                          <path d="M35.64,30.079H25.031c-7.021,0-12.714,5.739-12.714,12.821v17.771h36.037V42.9
                          C48.354,35.818,42.661,30.079,35.64,30.079z"/>
                        </g>
                      </g>
                    </svg>                  </div>
                  <div>
                    <p className="text-xl lg:text-2xl text-neutral-700 font-bold">{stats.users}{" "}{stats.users <= 1 ? 'Member' : 'Members'}</p>
                    <p className="text-sm lg:text-lg text-gray-600">No access to Admin Console</p>
                  </div>
                </div>
              </div>
              </Link>

              {/* Second item */}
              <Link href='/users'>
              <div className="flex items-center border-b border-gray-500 pb-2 pt-2 drop-shadow">
                <div className="flex items-center">
                  <div className="rounded-full bg-gray-200 hover:bg-white p-1 mr-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="#000"
                      version="1.1"
                      viewBox="0 0 218.582 218.582"
                      xmlSpace="preserve"
                    >
                      <path d="M160.798 64.543a13.164 13.164 0 00-4.046-4.005 67.351 67.351 0 00-.712-9.385c.373-4.515 1.676-29.376-13.535-40.585C133.123 3.654 122.676 0 112.294 0c-8.438 0-16.474 2.398-22.629 6.752-5.543 3.922-8.596 8.188-10.212 11.191-4.78.169-14.683 2.118-19.063 14.745-4.144 11.944-.798 19.323 1.663 22.743a65.907 65.907 0 00-.223 5.106 13.164 13.164 0 00-4.046 4.005c-2.74 4.229-3.206 9.9-1.386 16.859 3.403 13.012 11.344 15.876 15.581 16.451 2.61 5.218 8.346 15.882 14.086 21.24 2.293 2.14 5.274 3.946 8.86 5.37 4.577 1.816 9.411 2.737 14.366 2.737s9.789-.921 14.366-2.737c3.586-1.424 6.567-3.23 8.86-5.37 5.74-5.358 11.476-16.022 14.086-21.24 4.236-.575 12.177-3.44 15.581-16.452 1.82-6.957 1.354-12.629-1.386-16.857zm-8.289 14.328c-2.074 7.932-5.781 9.116-7.807 9.116-.144 0-.252-.008-.316-.013-2.314-.585-4.454.631-5.466 2.808-1.98 4.256-8.218 16.326-13.226 21.001-1.377 1.285-3.304 2.425-5.726 3.386-6.796 2.697-14.559 2.697-21.354 0-2.422-.961-4.349-2.101-5.726-3.386-5.008-4.675-11.246-16.745-13.226-21.001-.842-1.81-2.461-2.953-4.314-2.953a4.69 4.69 0 00-1.153.146 3.457 3.457 0 01-.315.013c-2.025 0-5.732-1.185-7.807-9.115-1.021-3.903-1.012-7.016.024-8.764.603-1.016 1.459-1.358 1.739-1.446 2.683-.291 4.299-2.64 4.075-5.347-.005-.066-.18-2.39.042-5.927 3.441-1.479 8.939-4.396 13.574-9.402 2.359-2.549 4.085-5.672 5.314-8.537 3.351 2.736 8.095 5.951 14.372 8.729 10.751 4.758 32.237 7.021 41.307 7.794.375 4.317.156 7.263.15 7.333-.236 2.715 1.383 5.066 4.075 5.357.28.088 1.136.431 1.739 1.446 1.037 1.747 1.046 4.86.025 8.762zm32.064 66.779l-43.715-17.485a5 5 0 00-6.558 2.942l-10.989 30.382-2.176-6.256 3.462-8.463a5.003 5.003 0 00-4.628-6.894H98.614a5 5 0 00-4.628 6.894l3.462 8.463-2.176 6.256-10.989-30.382a4.997 4.997 0 00-6.558-2.942L34.009 145.65c-13.424 5.369-22.098 18.182-22.098 32.641v35.291a5 5 0 005 5h184.76a5 5 0 005-5v-35.291c0-14.459-8.674-27.271-22.098-32.641zm-1.519 47.068a5 5 0 01-5 5h-33.57a5 5 0 01-5-5v-15.59a5 5 0 015-5h33.57a5 5 0 015 5v15.59z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl lg:text-2xl text-neutral-700 font-bold">{stats.managers}{" "}{stats.managers <= 1 ? 'Manager' : 'Managers'}</p>
                    <p className="text-sm lg:text-lg text-gray-600">Oversee configurations</p>
                  </div>
                </div>
              </div>
              </Link>

              {/* Third item */}
              <Link href='/users'>
              <div className="flex items-center pb-2 pt-2 drop-shadow">
                <div className="flex items-center">
                  <div className="rounded-full bg-gray-200 hover:bg-white p-1 mr-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6"
                      viewBox="0 0 24 24"
                    >
                      <path fill="none" d="M0 0h24v24H0z"></path>
                      <path d="M12 14v8H4a8 8 0 018-8zm0-1c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6zm9 4h1v5h-8v-5h1v-1a3 3 0 016 0v1zm-2 0v-1a1 1 0 00-2 0v1h2z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl lg:text-2xl text-neutral-700 font-bold"> {stats.admins}{" "}{stats.admins <= 1 ? 'Admin' : 'Admins'}</p>
                    <p className="text-sm lg:text-lg text-gray-600">Manage Network Inventory</p>
                  </div>
                </div>
              </div>
              </Link>

            </fieldset>
            </div>
            <div className="m-auto">
              <fieldset className="m-2 border border-solid border-gray-400 p-3 rounded-md"  style={{width: "350px"}}>
                <legend className="text-md lg:text-lg">Collections</legend>
                {/* First item */}
                <Link href='/groups'>
                <div className="flex items-center border-b border-gray-500 pb-2 pt-2 drop-shadow">
                  <div className="flex items-center">
                    <div className="rounded-full bg-gray-200 hover:bg-white p-1 mr-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        version="1.1"
                        viewBox="0 -256 1950 1950"
                      >
                        <g transform="matrix(1 0 0 -1 15.186 1359.898)">
                          <path
                            fill="currentColor"
                            d="M593 640q-162-5-265-128H194q-82 0-138 40.5T0 671q0 353 124 353 6 0 43.5-21t97.5-42.5Q325 939 384 939q67 0 133 23-5-37-5-66 0-139 81-256zM1664 3q0-120-73-189.5T1397-256H523q-121 0-194 69.5T256 3q0 53 3.5 103.5t14 109Q284 274 300 324t43 97.5q27 47.5 62 81t85.5 53.5Q541 576 602 576q10 0 43-21.5t73-48q40-26.5 107-48T960 437q68 0 135 21.5t107 48q40 26.5 73 48t43 21.5q61 0 111.5-20t85.5-53.5q35-33.5 62-81t43-97.5q16-50 26.5-108.5t14-109Q1664 56 1664 3zM640 1280q0-106-75-181t-181-75q-106 0-181 75t-75 181q0 106 75 181t181 75q106 0 181-75t75-181zm704-384q0-159-112.5-271.5T960 512q-159 0-271.5 112.5T576 896q0 159 112.5 271.5T960 1280q159 0 271.5-112.5T1344 896zm576-225q0-78-56-118.5T1726 512h-134q-103 123-265 128 81 117 81 256 0 29-5 66 66-23 133-23 59 0 119 21.5t97.5 42.5q37.5 21 43.5 21 124 0 124-353zm-128 609q0-106-75-181t-181-75q-106 0-181 75t-75 181q0 106 75 181t181 75q106 0 181-75t75-181z"
                          ></path>
                        </g>
                      </svg>
                    </div>
                    <div>
                      <p className="text-xl lg:text-2xl text-neutral-700 font-bold">{stats.noOfGroups}{" "}{stats.noOfGroups <= 1 ? 'Group' : 'Groups'}</p>
                      <p className="text-sm lg:text-lg text-gray-600">Collection of Users</p>
                    </div>
                  </div>
                </div>
                </Link>

                {/* Second item */}
                <Link href='/policies'>
                <div className="flex items-center border-b border-gray-500 pb-2 pt-2 drop-shadow">
                  <div className="flex items-center">
                    <div className="rounded-full bg-gray-200 hover:bg-white p-1 mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="-3.5 0 19 19">
                        <path d="M10.05 3.828a1.112 1.112 0 011.11 1.108v10.562a1.112 1.112 0 01-1.11 1.108h-8.1a1.112 1.112 0 01-1.11-1.108V4.936a1.112 1.112 0 011.11-1.108h.415v1.108h-.414l-.002.002v10.558l.002.002h8.098l.002-.002V4.938l-.002-.002h-.414V3.828h.416zm-.98 4.076H2.82v1.108h6.25zm0 2.337H2.82v1.108h6.25zm0 2.337H2.82v1.108h6.25zm-.543-8.935v1.25a.476.476 0 01-.475.476H3.948a.476.476 0 01-.475-.475v-1.25a.476.476 0 01.475-.476h.697V1.87a.476.476 0 01.475-.475h1.76a.476.476 0 01.475.475v1.3h.697a.476.476 0 01.475.474zM6.55 2.67a.554.554 0 10-.554.554.554.554 0 00.554-.554z"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="text-xl lg:text-2xl text-neutral-700 font-bold">{stats.noOfUserPolicies}{" User"}{stats.noOfUserPolicies <= 1 ? ' Policy' : ' Policies'}</p>
                      <p className="text-sm lg:text-lg text-gray-600">Associated with Users</p>
                    </div>
                  </div>
                </div>
                </Link>

                {/* Third item */}
                <Link href='/policies'>
                <div className="flex items-center pb-2 pt-2 drop-shadow">
                  <div className="flex items-center">
                    <div className="rounded-full bg-gray-200 hover:bg-white p-1 mr-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6"
                        fill="#000"
                        version="1.1"
                        viewBox="0 0 512 512"
                        xmlSpace="preserve"
                      >
                        <path d="M432.299 0H79.684c-10.99 0-19.899 8.91-19.899 19.899v413.029c0 10.99 8.91 19.899 19.899 19.899h71.02v39.248c0 16.357 18.732 25.748 31.836 15.921l73.451-55.073 73.45 55.072c13.015 9.759 31.837.563 31.837-15.921v-50.913l85.093-85.118c.451-.45.866-.914 1.262-1.386l.066-.084c3.302-3.985 4.688-8.677 4.499-13.242V19.899C452.198 8.91 443.289 0 432.299 0zM267.943 412.135a19.899 19.899 0 00-23.9 0c-12.237 9.189 2.643-1.969-53.538 40.15 0-64.566.096-86.989.154-116.123 19.219 12.181 41.751 18.9 65.291 18.907h.035c23.615 0 46.223-6.751 65.487-18.993.003 1.603.011 114.881.011 116.209-2.23-1.673-50.123-37.584-53.54-40.15zm56.745-133.831c-32.492 49.186-104.767 49.485-137.459-.129-35.731-54.237 3.127-127.392 68.763-127.392 65.166 0 104.785 72.554 68.696 127.521zm43.043-173.946H144.255c-10.99 0-19.899-8.91-19.899-19.899s8.91-19.899 19.899-19.899h223.477c10.99 0 19.899 8.91 19.899 19.899s-8.91 19.899-19.9 19.899z"></path>
                        <path d="M256 175.85c-31.542 0-57.204 25.655-57.204 57.19s25.662 57.19 57.204 57.19c31.535 0 57.19-25.655 57.19-57.19s-25.655-57.19-57.19-57.19zm-17.406 57.19c0-9.59 7.808-17.392 17.405-17.392 9.59 0 17.392 7.802 17.392 17.392 0 22.985-34.797 22.989-34.797 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="text-xl lg:text-2xl text-neutral-700 font-bold"> {stats.noOfGroupPolicies}{" Group "}{stats.noOfGroupPolicies <= 1 ? 'Policy' : 'Policies'}</p>
                      <p className="text-sm lg:text-lg text-gray-600">Associated with Groups</p>
                    </div>
                  </div>
                </div>
                </Link>

              </fieldset>
            </div>
          </div>

        </div>

      </div>
    </div>
  );

}