"use client"
import React, { useState, useEffect } from 'react';
import { Policy as PolicyType } from '@/types/policy';
import { Resource as ResourceType } from '@/types/resource';
import { Group as GroupType } from '@/types/group';
import { User as UserType } from '@/types/user';

export default function PolicyModal({
    closeModal,
    editMode = false,
    currentPolicy = {} as PolicyType,
}: {
    closeModal: () => void;
    editMode?: boolean;
    currentPolicy?: PolicyType;
}) {
    const [formData, setFormData] = useState({
        name: currentPolicy?.name || '',
        description: currentPolicy?.description || '',
        type: currentPolicy?.type || '',
        ids: currentPolicy?.ids || [],
        resourceIds: currentPolicy?.resourceIds || [],
    });
    const [activeTab, setActiveTab] = useState<'group' | 'user'>('group'); // New state for active tab

    const handleTabChange = (tab: 'group' | 'user') => {
        setActiveTab(tab);
    };
    const [resources, setResources] = useState<ResourceType[]>([]);
    const [groups, setGroups] = useState<GroupType[]>([]);
    const [users, setUsers] = useState<UserType[]>([]);

    const [selectedResources, setSelectedResources] = useState<ResourceType[]>([]);
    const [selectedGroups, setSelectedGroups] = useState<GroupType[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<UserType[]>([]);

    const [activeStep, setActiveStep] = useState(1); // Step 1 by default
    const totalSteps = 3; // Total number of steps

    const handleNextStep = () => {
        if (activeStep < totalSteps) {
            setActiveStep(activeStep + 1);
        }
    };

    const handlePrevStep = () => {
        if (activeStep > 1) {
            setActiveStep(activeStep - 1);
        }
    };
    const [searchTerm, setSearchTerm] = useState('');


    //user search functions
    const filterUsers = (userList: any[]) => {
        return userList.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };
    // Find matching selected users and move them to the top
    const matchingSelectedUsers = filterUsers(selectedUsers);
    const remainingSelectedUsers = selectedUsers.filter(user => !matchingSelectedUsers.includes(user));
    const updatedSelectedUsers = [...matchingSelectedUsers, ...remainingSelectedUsers];
    // Find matching available users and move them to the top
    const matchingAvailableUsers = filterUsers(users);
    const remainingAvailableUsers = users.filter(user => !matchingAvailableUsers.includes(user));
    const updatedAvailableUsers = [...matchingAvailableUsers, ...remainingAvailableUsers];
    //----------------------------------------


    //Group search functions 
    const filterGroups = (groupList: any[]) => {
        return groupList.filter(group => group.name.toLowerCase().includes(searchTerm.toLowerCase()));
    };
    // Find matching selected groups and move them to the top
    const matchingSelectedGroups = filterGroups(selectedGroups);
    const remainingSelectedGroups = selectedGroups.filter(group => !matchingSelectedGroups.includes(group));
    const updatedSelectedGroups = [...matchingSelectedGroups, ...remainingSelectedGroups];
    // Find matching available groups and move them to the top
    const matchingAvailableGroups = filterGroups(groups);
    const remainingAvailableGroups = groups.filter(group => !matchingAvailableGroups.includes(group));
    const updatedAvailableGroups = [...matchingAvailableGroups, ...remainingAvailableGroups];
    //---------------------------------------


    //Resource search functions
    const filterResources = (resourceList: any[]) => {
        return resourceList.filter(resource => resource.name.toLowerCase().includes(searchTerm.toLowerCase()));
    };
    // Find matching selected resources and move them to the top
    const matchingSelectedResources = filterResources(selectedResources);
    const remainingSelectedResources = selectedResources.filter(resource => !matchingSelectedResources.includes(resource));
    const updatedSelectedResources = [...matchingSelectedResources, ...remainingSelectedResources];
    // Find matching available resources and move them to the top
    const matchingAvailableResources = filterResources(resources);
    const remainingAvailableResources = resources.filter(resource => !matchingAvailableResources.includes(resource));
    const updatedAvailableResources = [...matchingAvailableResources, ...remainingAvailableResources];
    //----------------------------------------


    const handleSearchKeyDown = (e: { key: string; preventDefault: () => void; }) => {
        // If the pressed key is Enter, prevent the form submission
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    };
    const handleResourceSelect = (resourceId: string) => {
        const resource = resources.find((resource) => resource._id === resourceId);
        if (resource) {
            setSelectedResources((prevSelectedResources) => [...prevSelectedResources, resource]);
        }
    };

    const handleResourceRemove = (resourceId: string) => {
        setSelectedResources((prevSelectedResources) =>
            prevSelectedResources.filter((resource) => resource._id !== resourceId)
        );
    };

    const handleGroupSelect = (groupId: string) => {
        const group = groups.find((group) => group._id === groupId);
        if (group) {
            setSelectedGroups((prevSelectedGroups) => [...prevSelectedGroups, group]);
        }
    };

    const handleGroupRemove = (groupId: string) => {
        setSelectedGroups((prevSelectedGroups) =>
            prevSelectedGroups.filter((group) => group._id !== groupId)
        );
    }

    const handleUserSelect = (userId: string) => {
        const user = users.find((user) => user._id === userId);
        if (user) {
            setSelectedUsers((prevSelectedUsers) => [...prevSelectedUsers, user]);
        }
    };

    const handleUserRemove = (userId: string) => {
        setSelectedUsers((prevSelectedUsers) =>
            prevSelectedUsers.filter((user) => user._id !== userId)
        );
    }

    const fetchResources = async () => {
        const res = await fetch('/api/resource');
        const data = await res.json();
        const resources = data.resources;
        setResources(resources);

        if (editMode) {
            const _selectedResources = resources.filter((resource: ResourceType) => currentPolicy.resourceIds.includes(resource._id));
            setSelectedResources(_selectedResources);
        }
    };

    const fetchUsers = async () => {
        const res = await fetch('/api/user');
        const data = await res.json();
        const users = data.users;
        setUsers(users);

        if (editMode) {
            const _selectedUsers = users.filter((user: UserType) => currentPolicy.ids.includes(user._id));
            setSelectedUsers(_selectedUsers);
        }
    };

    const fetchGroups = async () => {
        const res = await fetch('/api/group');
        const data = await res.json();
        const groups = data.groups;
        setGroups(groups);

        if (editMode) {
            const _selectedGroups = groups.filter((group: GroupType) => currentPolicy.ids.includes(group._id));
            setSelectedGroups(_selectedGroups);
        }
    };

    useEffect(() => {
        fetchResources();
        fetchGroups();
        fetchUsers();

        if (editMode) {
            if (currentPolicy.type === 'group') {
                setActiveTab('group');
            }
            else {
                setActiveTab('user');
            }
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleGroupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editMode) {
            // setFormData(prevData => ({ ...prevData, ids: selectedGroups.map(group => group._id), resourceIds: selectedResources.map(resource => resource._id), type: 'group' }));
            const res = await fetch(`/api/policy/${currentPolicy._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    type: 'group',
                    ids: selectedGroups.map(group => group._id),
                    resourceIds: selectedResources.map(resource => resource._id),
                })
            });
            const data = await res.json();
            console.log(data);
        }
        else {
            // setFormData(prevData => ({ ...prevData, ids: selectedGroups.map(group => group._id), resourceIds: selectedResources.map(resource => resource._id), type: 'group' }));
            const res = await fetch('/api/policy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    type: 'group',
                    ids: selectedGroups.map(group => group._id),
                    resourceIds: selectedResources.map(resource => resource._id),
                })
            });
            const data = await res.json();
            console.log(data);
        }

        closeModal();
    };

    const handleUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editMode) {
            // setFormData(prevData => ({ ...prevData, ids: selectedUsers.map(user => user._id), resourceIds: selectedResources.map(resource => resource._id), type: 'user' }));
            const res = await fetch(`/api/policy/${currentPolicy._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    type: 'user',
                    ids: selectedUsers.map(user => user._id),
                    resourceIds: selectedResources.map(resource => resource._id),
                }),
            });
            const data = await res.json();
            console.log(data);
        }
        else {
            // setFormData(prevData => ({ ...prevData, ids: selectedUsers.map(user => user._id), resourceIds: selectedResources.map(resource => resource._id), type: 'user' }));
            const res = await fetch('/api/policy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    type: 'user',
                    ids: selectedUsers.map(user => user._id),
                    resourceIds: selectedResources.map(resource => resource._id),
                }),
            });
            const data = await res.json();
            console.log(data);
        }

        closeModal();
    };

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch(`/api/policy/${currentPolicy._id}`, {
            method: 'DELETE',
        });
        const data = await res.json();
        console.log(data);
        closeModal();
    };

    return (
        <div className='relative'>
            <div className="fixed inset-0 flex items-center justify-center z-50 overflow-x-hidden backdrop-blur-md backdrop-filter">
                {/* Main modal */}
                <div className="bg-white absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-opacity-98 border border-gray-600 box-border shadow-lg rounded-2xl overflow-y-auto p-6 max-h-screen w-full lg:w-8/12">
                    {/* Modal header */}
                    <div className="flex items-center justify-between border-b pb-2 sm:pt-8 lg:pt-2">
                        <p className="text-2xl font-bold text-black text-center">Policy</p>
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
                    {activeStep === 1 && (

                        <div className="flex justify-center mb-4">
                            {/* Tabs for Group and User */}
                            <div className="flex overflow-x-auto">
                                <div
                                    className={`cursor-pointer mr-4 ${activeTab === 'group'
                                        ? 'border-b-2 border-blue-500 text-blue-500'
                                        : 'text-gray-300'
                                        }`}
                                    onClick={() => {
                                        if (!editMode) {
                                            handleTabChange('group');
                                        }
                                    }}
                                >
                                    Group
                                </div>
                                <div
                                    className={`cursor-pointer mr-4 ${activeTab === 'user'
                                        ? 'border-b-2 border-blue-500 text-blue-500'
                                        : 'text-gray-300'
                                        }`}
                                    onClick={() => {
                                        if (!editMode) {
                                            handleTabChange('user');
                                        }
                                    }}
                                >
                                    User
                                </div>
                            </div>
                        </div>
                    )}
                    <form className="flex flex-col" onSubmit={activeTab === 'group' ? handleGroupSubmit : handleUserSubmit}>
                        {activeStep === 1 && (
                            <div>
                                <div className='border-gray-500 border-b-2'>
                                    <label className="text-sm text-gray-500 mb-2">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        onChange={handleChange}
                                        value={formData.name}
                                        className="w-full bg-gray-100 rounded-md mb-4 py-2 px-4 focus:outline-none focus:ring focus:border-blue-300"
                                        placeholder="Enter Policy Name"
                                        required
                                    />


                                    <label className="text-sm text-gray-500 mb-2">Description</label>
                                    <input
                                        type="text"
                                        name="description"
                                        id="description"
                                        onChange={handleChange}
                                        value={formData.description}
                                        className="w-full bg-gray-100 rounded-md mb-4 py-2 px-4 focus:outline-none focus:ring focus:border-blue-300"
                                        placeholder="Enter Policy Description"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleNextStep}
                                    className="mt-3 bg-black text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition-all duration-300"
                                >
                                    Next
                                </button>

                                {editMode && (
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        className="m-3 mt-3 mb-0 bg-red-500 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700 transition-all duration-300"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        )}
                        {activeStep === 2 && (

                            <div>
                                {activeTab === 'group' && (
                                    <>
                                        <div className="flex flex-col lg:flex-row items-center">
                                            <div className="lg:w-8/12 md:w-full mr-2">
                                                <p className="text-sm text-justify">Please select the groups that you want to add to this policy.</p>
                                            </div>
                                            <div className="lg:w-4/12 md:w-full m-auto lg:mt-0">
                                                <input
                                                    type="text"
                                                    placeholder="Search Groups"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    onKeyDown={handleSearchKeyDown}
                                                    className="mb-2 p-2 border border-gray-300 rounded w-full"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex flex-col md:flex-row border-gray-500 border-b-2 pr-2">
                                            {/* Section for selected groups */}
                                            <div className="w-full md:w-1/2">
                                                <div className="flex flex-col h-30">
                                                    <p className="text-sm text-gray-500 mb-2">Selected Groups</p>
                                                    <ul className="overflow-y-auto">
                                                        {updatedSelectedGroups.map((group) => (
                                                            <li key={group._id} className="list-item">
                                                                <div className="flex items-center bg-gray-200 rounded-lg m-2 border-gray-300 border-r-2 mr-4 mb-2">
                                                                    <p className="text-bold ml-2">{group.name}</p>
                                                                    <button
                                                                        name="selectedGroup"
                                                                        onClick={() => handleGroupRemove(group._id)}
                                                                        className="ml-auto mr-2 text-bolder text-lg text-gray-900"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="16px" height="16px">
                                                                            <path fill="#f44336" d="M44,24c0,11.045-8.955,20-20,20S4,35.045,4,24S12.955,4,24,4S44,12.955,44,24z" />
                                                                            <path fill="#fff" d="M29.656,15.516l2.828,2.828l-14.14,14.14l-2.828-2.828L29.656,15.516z" />
                                                                            <path fill="#fff" d="M32.484,29.656l-2.828,2.828l-14.14-14.14l2.828-2.828L32.484,29.656z" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>

                                            {/* Section for selecting groups not in the policy */}
                                            <div className="w-full md:w-1/2">
                                                <div className="flex flex-col h-30">
                                                    <p className="text-sm text-gray-500 mb-2">Available Groups</p>
                                                    <ul className="overflow-y-auto">
                                                        {updatedAvailableGroups.map((group) => (
                                                            <li key={group._id} className="list-item">
                                                                {!selectedGroups.includes(group) && (
                                                                    <div className="flex items-center bg-gray-200 p-2 rounded-lg mb-2">
                                                                        <input
                                                                            type="radio"
                                                                            name="selectedGroup"
                                                                            value={group._id}
                                                                            onChange={() => handleGroupSelect(group._id)}
                                                                            className="mr-2"
                                                                        />
                                                                        <label>
                                                                            <p>{group.name}</p>
                                                                        </label>
                                                                    </div>
                                                                )}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                    </>
                                )}
                                {activeTab === 'user' && (
                                    <>
                                        <div className="flex flex-col lg:flex-row items-center">
                                            <div className="lg:w-8/12 md:w-full mr-2">
                                                <p className="text-sm text-justify">Please select the users that you want to add to this policy.</p>
                                            </div>
                                            <div className="items-centerlg:w-4/12 md:w-full mt-4 lg:mt-0">
                                                <input
                                                    type="text"
                                                    placeholder="Search Users"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    onKeyDown={handleSearchKeyDown}
                                                    className="mb-2 p-2 border border-gray-300 rounded w-full"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex flex-col md:flex-row border-gray-500 border-b-2">
                                            <div className="w-full md:w-1/2">
                                                <p className="text-sm text-gray-500 mb-2">Selected Users</p>
                                                <ul className="flex flex-wrap max-h-40 overflow-y-auto border-gray-300 border-r-2 mr-4 mb-2">
                                                    {updatedSelectedUsers.map((user) => (
                                                        <li key={user._id} className="flex items-center mb-2 bg-gray-200 pr-2 pl-2 shadow-xl rounded-lg m-2 border-gray-300 border-2">  <div>
                                                            <p className="text-bold">{user.name}</p>
                                                            <p className="text-xs text-gray-500">{user.email}</p>
                                                        </div>
                                                            <button
                                                                name="selectedGroup"
                                                                onClick={() => handleUserRemove(user._id)}
                                                                className="ml-2 text-bolder text-lg text-gray-900"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="16px" height="16px"><path fill="#f44336" d="M44,24c0,11.045-8.955,20-20,20S4,35.045,4,24S12.955,4,24,4S44,12.955,44,24z" /><path fill="#fff" d="M29.656,15.516l2.828,2.828l-14.14,14.14l-2.828-2.828L29.656,15.516z" /><path fill="#fff" d="M32.484,29.656l-2.828,2.828l-14.14-14.14l2.828-2.828L32.484,29.656z" /></svg>
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Section for selecting users not in the policy */}
                                            <div className="w-full md:w-1/2">
                                                <p className="text-sm text-gray-500 mb-2">Available Users</p>
                                                <ul className="flex flex-wrap max-h-40 overflow-y-auto">

                                                    {updatedAvailableUsers.map((user) => (
                                                        <div key={user._id}>
                                                            {selectedUsers.includes(user) ? <></> :
                                                                <li key={user._id} className="flex items-center m-2 bg-gray-200 p-1 rounded-lg min-w-full ml-2">
                                                                    <input
                                                                        type="radio"
                                                                        name="selectedGroup"
                                                                        value={user._id}
                                                                        onChange={() => handleUserSelect(user._id)}
                                                                        className="mr-1"
                                                                    />
                                                                    <label>
                                                                        <p>{user.name}</p>
                                                                        <p className="text-xs text-gray-500">{user.email}</p>
                                                                    </label>
                                                                </li>
                                                            }
                                                        </div>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </>
                                )}
                                <button
                                    type="button"
                                    onClick={handlePrevStep}
                                    className="mt-3 bg-black text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition-all duration-300"
                                >
                                    Previous
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNextStep}
                                    className="mt-3 ml-2 bg-black text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition-all duration-300"
                                >
                                    Next
                                </button>

                                {editMode && (
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        className="m-3 mt-3 mb-0 bg-red-500 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700 transition-all duration-300"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        )}
                        {activeStep === 3 && (
                            <div>
                                <div className="flex flex-col lg:flex-row items-center">
                                    <div className="lg:w-8/12 md:w-full mr-2">
                                        <p className="text-sm text-justify">Please select the resources that you want to add to this policy.</p>
                                    </div>
                                    <div className="lg:w-4/12 md:w-full mt-4 lg:mt-0">
                                        <input
                                            type="text"
                                            placeholder="Search Resources"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onKeyDown={handleSearchKeyDown}
                                            className="mb-2 p-2 border border-gray-300 rounded w-full"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col lg:flex-row border-gray-500 border-b-2">

                                    {/* Section for selected resources */}
                                    <div className="w-full lg:w-1/2 mb-4 lg:mb-0">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-2">Selected Resources</p>
                                            <ul className="flex flex-wrap h-40 overflow-y-auto border-gray-300 border-r-2 lg:border-r-0 lg:border-b-2 lg:mr-4 mb-2">
                                                {updatedSelectedResources.map((resource) => (
                                                    <li key={resource._id} className="resource-item ">
                                                        <div className="flex items-center bg-gray-200 rounded border-2 border-gray-600 m-1 p-1">
                                                            <div>
                                                                <p className="font-bold">{resource.name}</p>
                                                                <p className="text-xs text-gray-500">{resource.address}</p>
                                                            </div>
                                                            <button
                                                                name="selectedResource"
                                                                onClick={() => handleResourceRemove(resource._id)}
                                                                className="ml-2 text-bolder text-lg text-gray-900"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="16px" height="16px">
                                                                    <path fill="#f44336" d="M44,24c0,11.045-8.955,20-20,20S4,35.045,4,24S12.955,4,24,4S44,12.955,44,24z" />
                                                                    <path fill="#fff" d="M29.656,15.516l2.828,2.828l-14.14,14.14l-2.828-2.828L29.656,15.516z" />
                                                                    <path fill="#fff" d="M32.484,29.656l-2.828,2.828l-14.14-14.14l2.828-2.828L32.484,29.656z" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Section for selecting resources not in the policy */}
                                    <div className="w-full lg:w-1/2">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-2">Available Resources</p>
                                            <ul className="flex-wrap h-40 overflow-y-auto">
                                                {updatedAvailableResources.map((resource) => (
                                                    <li key={resource._id} className="resource-item mr-2">
                                                        {!selectedResources.includes(resource) && (
                                                            <div className="flex items-center bg-gray-200 p-2 rounded-lg mb-2">
                                                                <input
                                                                    type="radio"
                                                                    name="selectedResource"
                                                                    value={resource._id}
                                                                    onChange={() => handleResourceSelect(resource._id)}
                                                                    className="mr-2"
                                                                />
                                                                <label>
                                                                    <p>
                                                                        {resource.name} <span className="ml-5 rounded p-1 bg-cyan-900 text-white text-xs font-bold">{resource.address}</span>
                                                                    </p>
                                                                </label>
                                                            </div>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col lg:flex-row">

                                    <button
                                        type="button"
                                        onClick={handlePrevStep}
                                        className="m-3 mb-0 lg:mt-3 lg:mr-3 bg-black text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition-all duration-300"
                                    >
                                        Previous
                                    </button>

                                    <button
                                        type="submit"
                                        className="m-3 mb-0 lg:mr-3 bg-black text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition-all duration-300"                                    >
                                        Save
                                    </button>

                                    {editMode && (
                                        <button
                                            type="button"
                                            onClick={handleDelete}
                                            className="m-3 mt-3 mb-0 bg-red-500 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700 transition-all duration-300"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>

                        )}



                    </form>



                </div>
            </div>
        </div>
    );
}


