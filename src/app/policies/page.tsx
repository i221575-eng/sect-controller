"use client";
import React, { useState, useEffect } from 'react';
import { User as UserType } from '@/types/user';
import { Group as GroupType } from '@/types/group';
import { Policy as PolicyType } from '@/types/policy';
import { Resource as ResourceType } from '@/types/resource';
import PolicyModal from '@/components/PolicyForm/policyform';
import { useSession } from 'next-auth/react';
import { clientSideEditAccess } from '@/utils/userEditAccess';

export default function Content() {
    const { data: session } = useSession();
    const role = session?.user.role;

    const privilegeCheck = () => {
        if (!role) return false;
        return clientSideEditAccess(role);
    }

    const [policies, setPolicies] = useState<PolicyType[]>([]);
    const [userPolicies, setUserPolicies] = useState<PolicyType[]>([]);
    const [groupPolicies, setGroupPolicies] = useState<PolicyType[]>([]);
    const [users, setUsers] = useState<UserType[]>([]);
    const [groups, setGroups] = useState<GroupType[]>([]);
    const [Resources, setResources] = useState<ResourceType[]>([]);

    const fetchUsers = async () => {
        const res = await fetch('/api/user');
        const data = await res.json();
        setUsers(data.users);
    }

    const fetchGroups = async () => {
        const res = await fetch('/api/group');
        const data = await res.json();
        setGroups(data.groups);
    }

    const fetchPolicies = async () => {
        const res = await fetch('/api/policy');
        const data = await res.json();
        setPolicies(data.policies);

        const _userPolicies = data.policies.filter((policy: PolicyType) => policy.type === 'user');
        setUserPolicies(_userPolicies);

        const _groupPolicies = data.policies.filter((policy: PolicyType) => policy.type === 'group');
        setGroupPolicies(_groupPolicies);
    }

    const fetchResources = async () => {
        const res = await fetch('/api/resource');
        const data = await res.json();
        setResources(data.resources);
    }

    const now = new Date().toDateString();

    const [selectedSection, setSelectedSection] = useState<'user' | 'group'>('user');
    const [isDropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        fetchPolicies();
        fetchUsers();
        fetchGroups();
        fetchResources();
    }, []);

    const [gpSearchQuery, setgpSearchQuery] = useState('');
    const filteredGroupPolicies = groupPolicies.filter((policy) =>
        policy.name.toLowerCase().includes(gpSearchQuery.toLowerCase()) ||
        policy.ids.some(id => {
            const group = groups.find(group => group._id === id);
            return group && group.name.toLowerCase().includes(gpSearchQuery.toLowerCase());
        }) ||
        policy.resourceIds.some(id => {
            const resource = Resources.find(resource => resource._id === id);
            return resource &&
                (resource.name.toLowerCase().includes(gpSearchQuery.toLowerCase()) ||
                    resource.address.toLowerCase().includes(gpSearchQuery.toLowerCase()));
        })
    );

    const [upSearchQuerry, setupSearchQuerry] = useState('');
    const filteredUserPolicies = userPolicies.filter((userPolicy) =>
        userPolicy.name.toLowerCase().includes(upSearchQuerry.toLowerCase()) ||
        userPolicy.ids.some(id => users.find(user => user._id === id && (user.name.toLowerCase().includes(upSearchQuerry.toLowerCase()) || user.email.toLowerCase().includes(upSearchQuerry.toLowerCase())))) ||
        userPolicy.resourceIds.some(id => Resources.find(resource => resource._id === id && (resource.name.toLowerCase().includes(upSearchQuerry.toLowerCase()) || resource.address.toLowerCase().includes(upSearchQuerry.toLowerCase()))))
    );

    const handleDeleteUser = async (groupId: string, userId: string) => {
        console.log(`Deleting user ${userId} from group ${groupId}`);

        const res = await fetch(`/api/group/user`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ group: groupId, user: userId }),
        });
        const data = await res.json();
        console.log(data);

        fetchUsers();
        fetchGroups();
    };

    const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const openModal = () => {
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setIsModalOpen(false);

        fetchUsers();
        fetchGroups();
        fetchPolicies();
        fetchResources();
    };
    const openEditModal = () => {
        setIsEditModalOpen(true);
    };
    const closeEditModal = () => {
        setIsEditModalOpen(false);

        fetchUsers();
        fetchGroups();
        fetchPolicies();
        fetchResources();
    };

    return (
        <div className="flex flex-wrap h-screen mb-20">
            <div className="w-full rounded-3xl bg-white p-6 shadow-lg">
                <div className="mb-8 flex flex-col md:flex-row items-center justify-between text-black">
                    <div className="mb-4 md:mb-0">
                        <p className="text-3xl font-bold">Policy Management</p>
                        <p className="text-sm text-gray-500">Manage and track user/group policies</p>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setSelectedSection('user')}
                            className={`px-6 py-3 rounded-lg focus:outline-none ${selectedSection === 'user'
                                ? 'bg-black text-white'
                                : 'bg-gray-300 text-gray-800'
                                }`}
                        >
                            User Policies
                        </button>

                        <button
                            onClick={() => setSelectedSection('group')}
                            className={`px-6 py-3 rounded-lg focus:outline-none ${selectedSection === 'group'
                                ? 'bg-black text-white'
                                : 'bg-gray-300 text-gray-800'
                                }`}
                        >
                            Group Policies
                        </button>
                    </div>
                </div>

                <div className="mb-4 flex flex-col md:flex-row items-center justify-between">
                    {/* Search Input and Button */}
                    <div className="flex items-center mb-2 md:mb-0">
                        <input
                            type="text"
                            placeholder={`${selectedSection === "group" ? "Group" : "User"} Policies`}
                            value={selectedSection === "group" ? gpSearchQuery : upSearchQuerry}
                            onChange={(e) => {
                                const inputValue = e.target.value;
                                if (selectedSection === "group") {
                                    setgpSearchQuery(inputValue);
                                } else {
                                    setupSearchQuerry(inputValue);
                                }
                            }}
                            className="bg-gray-100 rounded-l-md hover:border-b-2 hover:border-b-black text-black py-2 px-4 hover:shadow-lg w-full md:w-64"
                        />
                        <button
                            className="bg-black text-white font-bold py-2 px-3 rounded-r-md hover:bg-gray-700 ml-0"
                        >
                            Search
                        </button>
                    </div>
                    {/* Create Policy Button */}
                    <button
                        data-modal-target="crud-modal"
                        data-modal-toggle="crud-modal"
                        className="bg-black text-white font-bold px-4 py-2 rounded-full transition-shadow hover:ring-2 hover:ring-gray-300 focus:outline-none mb-2 md:mb-0"
                        type="button"
                        disabled={!privilegeCheck()}
                        onClick={openModal}
                    >
                        ✢ Create Policy
                    </button>

                    {/* Policy Count Display */}
                    <div className="flex">
                        <div className="flex items-center bg-black text-white rounded-lg p-4 mr-2">
                            <div className="text-3xl md:text-4xl font-bold ">
                                {userPolicies.length}
                            </div>
                            <div className='text-bold pl-1'>
                                User {userPolicies.length === 1 ? 'Policy' : 'Policies'}
                            </div>
                        </div>
                        <div className="flex items-center bg-black text-white rounded-lg p-4">
                            <div className="text-3xl md:text-4xl font-bold">
                                {groupPolicies.length}
                            </div>
                            <div className='text-bold pl-1'>
                                Group {groupPolicies.length === 1 ? 'Policy' : 'Policies'}
                            </div>
                        </div>
                    </div>

                </div>

                {isModalOpen && <PolicyModal closeModal={closeModal} />}

                <div className="flex flex-wrap">
                    <div className="w-full">
                        {selectedSection === 'group' && (
                            <div className="bg-white p-6 rounded-lg shadow-md mb-4">
                                <p className="text-xl font-bold mb-4">Group Policies</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-4">
                                    {filteredGroupPolicies.map((groupPolicy) => (
                                        filteredGroupPolicies.length !== groupPolicies.length && (
                                            <div
                                                key={groupPolicy._id}
                                                className={`bg-gray-100 rounded-3xl shadow-xl ${expandedGroup === groupPolicy._id ? 'h-auto border-b' : 'overflow-hidden overflow-none h-14'

                                                    }`}
                                            >
                                                <div
                                                    className="p-3 cursor-pointer bg-stone-300 rounded-3xl animate-pulse "
                                                    onClick={() => setExpandedGroup((prev) => (prev === groupPolicy._id ? null : groupPolicy._id))}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className='truncate'>
                                                            <p className="text-xl sm:text-lg md:text-xl lg:text-xl  font-bold truncate">
                                                                {groupPolicy.name}
                                                            </p>
                                                        </div>


                                                        <button className="text-gray-500 focus:outline-none">
                                                            {expandedGroup === groupPolicy._id ? 'Collapse' : 'Expand'}
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="p-2 text-sm text-gray-800 mb-2">{groupPolicy.description}</p>
                                                {expandedGroup === groupPolicy._id && (
                                                    <div className="p-6 max-h-96 overflow-y-auto border-b-4 rounded-lg border-gray-800 ">
                                                        <div>
                                                            <p
                                                                className="text-sm text-gray-500 mb-2"
                                                            >Groups</p>
                                                            <ul>
                                                                {groupPolicy.ids.map((id) => (
                                                                    <div key={id}>
                                                                        {groups.filter((group) => group._id === id).map((group) => (
                                                                            <li key={group._id} className="flex items-center space-x-4 border-b-4 py-2">
                                                                                <div className="flex-grow">
                                                                                    <div className="flex items-center justify-between">
                                                                                        <div>
                                                                                            <p className="font-bold">{group.name}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </li>
                                                                        ))}
                                                                    </div>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                        <div>
                                                            <p
                                                                className="text-sm text-gray-500 mb-2"
                                                            >Resources</p>

                                                            <ul>
                                                                {groupPolicy.resourceIds.map((id) => (
                                                                    <div key={id}>
                                                                        {Resources.filter((resource) => resource._id === id).map((resource) => (
                                                                            <div
                                                                                key={resource._id}
                                                                                className="m-3 flex bg-gray-100 p-4 transition-transform transform-gpu"
                                                                                style={{
                                                                                    boxShadow:
                                                                                        '5px 5px 10px rgba(25, 25, 25, 0.2), -5px -5px 10px rgba(60, 60, 60, 0.2)',
                                                                                }}
                                                                            >
                                                                                <label className="inline-flex items-center">
                                                                                    <div className='rounded-full h-10 w-10 flex items-center justify-center text-white text-bold text-lg bg-gray-900'>
                                                                                        {resource.name[0]}
                                                                                    </div>
                                                                                </label>
                                                                                <div className="text-left ml-2 flex-grow">
                                                                                    <p className="text-xs font-bold text-blue-500">{resource.name}</p>
                                                                                    <p className="text-xs text-gray-500">
                                                                                        <span className="font-bold">IP: {resource.address}</span>
                                                                                    </p>
                                                                                    <p className="text-xs text-gray-500">Alias: {resource.alias}</p>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                        <div className="flex justify-end mt-4">
                                                            <button className="bg-black text-white px-4 py-2 rounded-md mr-2"
                                                                disabled={!privilegeCheck()}
                                                                onClick={openEditModal}
                                                            >
                                                                Edit
                                                            </button>
                                                            {isEditModalOpen && <PolicyModal closeModal={closeEditModal} editMode={true} currentPolicy={groupPolicy} />}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    ))}


                                    {groupPolicies.map((groupPolicy) => (
                                        (!filteredGroupPolicies.includes(groupPolicy) || filteredGroupPolicies.length === groupPolicies.length) && (

                                            <div
                                                key={groupPolicy._id}
                                                className={`bg-gray-100 rounded-3xl shadow-xl ${expandedGroup === groupPolicy._id ? 'h-auto border-b' : 'overflow-hidden overflow-none h-14'

                                                    }`}
                                            >
                                                <div
                                                    className="p-3 cursor-pointer bg-stone-300 rounded-3xl"
                                                    onClick={() => setExpandedGroup((prev) => (prev === groupPolicy._id ? null : groupPolicy._id))}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className='truncate'>
                                                            <p className="text-xl sm:text-lg md:text-xl lg:text-xl  font-bold truncate">
                                                                {groupPolicy.name}
                                                            </p>
                                                        </div>


                                                        <button className="text-gray-500 focus:outline-none">
                                                            {expandedGroup === groupPolicy._id ? 'Collapse' : 'Expand'}
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="p-2 text-sm text-gray-800 mb-2">{groupPolicy.description}</p>
                                                {expandedGroup === groupPolicy._id && (
                                                    <div className="p-6 max-h-96 overflow-y-auto border-b-4 rounded-lg border-gray-800 ">
                                                        <div>
                                                            <p
                                                                className="text-sm text-gray-500 mb-2"
                                                            >Groups</p>
                                                            <ul>
                                                                {groupPolicy.ids.map((id) => (
                                                                    <div key={id}>
                                                                        {groups.filter((group) => group._id === id).map((group) => (
                                                                            <li key={group._id} className="flex items-center space-x-4 border-b-4 py-2">
                                                                                <div className="flex-grow">
                                                                                    <div className="flex items-center justify-between">
                                                                                        <div>
                                                                                            <p className="font-bold">{group.name}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </li>
                                                                        ))}
                                                                    </div>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                        <div>
                                                            <p
                                                                className="text-sm text-gray-500 mb-2"
                                                            >Resources</p>

                                                            <ul>
                                                                {groupPolicy.resourceIds.map((id) => (
                                                                    <div key={id}>
                                                                        {Resources.filter((resource) => resource._id === id).map((resource) => (
                                                                            <div
                                                                                key={resource._id}
                                                                                className="m-3 flex bg-gray-100 p-4 transition-transform transform-gpu"
                                                                                style={{
                                                                                    boxShadow:
                                                                                        '5px 5px 10px rgba(25, 25, 25, 0.2), -5px -5px 10px rgba(60, 60, 60, 0.2)',
                                                                                }}
                                                                            >
                                                                                <label className="inline-flex items-center">
                                                                                    <div className='rounded-full h-10 w-10 flex items-center justify-center text-white text-bold text-lg bg-gray-900'>
                                                                                        {resource.name[0]}
                                                                                    </div>
                                                                                </label>
                                                                                <div className="text-left ml-2 flex-grow">
                                                                                    <p className="text-xs font-bold text-blue-500">{resource.name}</p>
                                                                                    <p className="text-xs text-gray-500">
                                                                                        <span className="font-bold">IP: {resource.address}</span>
                                                                                    </p>
                                                                                    <p className="text-xs text-gray-500">Alias: {resource.alias}</p>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                        <div className="flex justify-end mt-4">
                                                            <button className="bg-black text-white px-4 py-2 rounded-md mr-2"
                                                                disabled={!privilegeCheck()}
                                                                onClick={openEditModal}
                                                            >
                                                                Edit
                                                            </button>
                                                            {isEditModalOpen && <PolicyModal closeModal={closeEditModal} editMode={true} currentPolicy={groupPolicy} />}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedSection === 'user' && (
                            <div className="bg-white p-6 rounded-lg shadow-md mb-4">
                                <p className="text-xl font-bold mb-4">User Policies</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-4">
                                    {filteredUserPolicies.map((userPolicy) => (
                                        filteredUserPolicies.length !== userPolicies.length && (
                                            <div
                                                key={userPolicy._id}
                                                className={`bg-gray-100 rounded-3xl shadow-xl ${expandedGroup === userPolicy._id ? 'h-auto border-b' : 'h-14 overflow-hidden'
                                                    }`}
                                            >
                                                <div
                                                    className="p-3 cursor-pointer bg-stone-300 rounded-3xl animate-pulse"
                                                    onClick={() => setExpandedGroup((prev) => (prev === userPolicy._id ? null : userPolicy._id))}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className='truncate'>
                                                            <p className="text-xl sm:text-lg md:text-xl lg:text-xl  font-bold truncate">
                                                                {userPolicy.name}
                                                            </p>
                                                        </div>
                                                        <button className="text-gray-500 focus:outline-none">
                                                            {expandedGroup === userPolicy._id ? 'Collapse' : 'Expand'}
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="p-2 text-sm text-gray-800 mb-2">{userPolicy.description}</p>
                                                {expandedGroup === userPolicy._id && (
                                                    <div className="p-6 max-h-96 overflow-y-auto border-b-4 rounded-lg border-gray-800 ">
                                                        <div>
                                                            <p
                                                                className="text-sm text-gray-500 mb-2"
                                                            >Users</p>
                                                            <ul>
                                                                {userPolicy.ids.map((id) => (
                                                                    <div key={id}>
                                                                        {users.filter((user) => user._id === id).map((user) => (
                                                                            <li key={user._id} className="flex items-center space-x-4 border-b-4 py-2">
                                                                                {user.image ? (
                                                                                    <img
                                                                                        src={user.image}
                                                                                        alt={user.name}
                                                                                        className="w-12 h-12 rounded-full mr-2"
                                                                                    />
                                                                                ) : (

                                                                                    <label className="inline-flex items-center mr-2">
                                                                                        <div className='rounded-full h-12 w-12 flex items-center justify-center text-white text-bold text-lg bg-gray-500'>
                                                                                            {user.email[0]}
                                                                                        </div>
                                                                                    </label>
                                                                                )
                                                                                }
                                                                                <div className="flex-grow">
                                                                                    <div className="flex items-center justify-between overflow-hidden">
                                                                                        <div>
                                                                                            <p className="font-semibold">{user.name}</p>
                                                                                            <p className="text-gray-500 overflow-auto	">{user.email}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </li>
                                                                        ))}
                                                                    </div>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                        <div>
                                                            <p
                                                                className="text-sm text-gray-500 mb-2"
                                                            >Resources</p>

                                                            <ul>
                                                                {userPolicy.resourceIds.map((id) => (
                                                                    <div key={id}>
                                                                        {Resources.filter((resource) => resource._id === id).map((resource) => (
                                                                            <div
                                                                                key={resource._id}
                                                                                className="m-3 flex bg-gray-100 p-4 transition-transform transform-gpu"
                                                                                style={{
                                                                                    boxShadow:
                                                                                        '5px 5px 10px rgba(25, 25, 25, 0.2), -5px -5px 10px rgba(60, 60, 60, 0.2)',
                                                                                }}
                                                                            >
                                                                                <label className="inline-flex items-center">
                                                                                    <div className='rounded-full h-10 w-10 flex items-center justify-center text-white text-bold text-lg bg-gray-900'>
                                                                                        {resource.name[0]}
                                                                                    </div>
                                                                                </label>
                                                                                <div className="text-left ml-2 flex-grow">
                                                                                    <p className="text-xs font-bold text-blue-500">{resource.name}</p>
                                                                                    <p className="text-xs text-gray-500">
                                                                                        <span className="font-bold">IP: {resource.address}</span>
                                                                                    </p>
                                                                                    <p className="text-xs text-gray-500">Alias: {resource.alias}</p>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                        <div className="flex justify-end mt-4">
                                                            <button className="bg-black text-white px-4 py-2 rounded-md mr-2"
                                                                disabled={!privilegeCheck()}
                                                                onClick={openEditModal}
                                                            >
                                                                Edit
                                                            </button>
                                                            {isEditModalOpen && <PolicyModal closeModal={closeEditModal} editMode={true} currentPolicy={userPolicy} />}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    ))}
                                    {userPolicies.map((userPolicy) => (
                                        (!filteredUserPolicies.includes(userPolicy) || filteredUserPolicies.length === userPolicies.length) && (
                                            <div
                                                key={userPolicy._id}
                                                className={`bg-gray-100 rounded-3xl shadow-xl ${expandedGroup === userPolicy._id ? 'h-auto border-b' : 'h-14 overflow-hidden'
                                                    }`}
                                            >
                                                <div
                                                    className="p-3 cursor-pointer bg-stone-300 rounded-3xl"
                                                    onClick={() => setExpandedGroup((prev) => (prev === userPolicy._id ? null : userPolicy._id))}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className='truncate'>
                                                            <p className="text-xl sm:text-lg md:text-xl lg:text-xl  font-bold truncate">
                                                                {userPolicy.name}
                                                            </p>
                                                        </div>
                                                        <button className="text-gray-500 focus:outline-none">
                                                            {expandedGroup === userPolicy._id ? 'Collapse' : 'Expand'}
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="p-2 text-sm text-gray-800 mb-2">{userPolicy.description}</p>
                                                {expandedGroup === userPolicy._id && (
                                                    <div className="p-6 max-h-96 overflow-y-auto border-b-4 rounded-lg border-gray-800 ">
                                                        <div>
                                                            <p
                                                                className="text-sm text-gray-500 mb-2"
                                                            >Users</p>
                                                            <ul>
                                                                {userPolicy.ids.map((id) => (
                                                                    <div key={id}>
                                                                        {users.filter((user) => user._id === id).map((user) => (
                                                                            <li key={user._id} className="flex items-center space-x-4 border-b-4 py-2">
                                                                                {user.image ? (
                                                                                    <img
                                                                                        src={user.image}
                                                                                        alt={user.name}
                                                                                        className="w-12 h-12 rounded-full mr-2"
                                                                                    />
                                                                                ) : (

                                                                                    <label className="inline-flex items-center mr-2">
                                                                                        <div className='rounded-full h-12 w-12 flex items-center justify-center text-white text-bold text-lg bg-gray-500'>
                                                                                            {user.email[0]}
                                                                                        </div>
                                                                                    </label>
                                                                                    )}
                                                                                <div className="flex-grow">
                                                                                    <div className="flex items-center justify-between overflow-hidden">
                                                                                        <div>
                                                                                            <p className="font-semibold">{user.name}</p>
                                                                                            <p className="text-gray-500 overflow-auto	">{user.email}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </li>
                                                                        ))}
                                                                    </div>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                        <div>
                                                            <p
                                                                className="text-sm text-gray-500 mb-2"
                                                            >Resources</p>

                                                            <ul>
                                                                {userPolicy.resourceIds.map((id) => (
                                                                    <div key={id}>
                                                                        {Resources.filter((resource) => resource._id === id).map((resource) => (
                                                                            <div
                                                                                key={resource._id}
                                                                                className="m-3 flex bg-gray-100 p-4 transition-transform transform-gpu"
                                                                                style={{
                                                                                    boxShadow:
                                                                                        '5px 5px 10px rgba(25, 25, 25, 0.2), -5px -5px 10px rgba(60, 60, 60, 0.2)',
                                                                                }}
                                                                            >
                                                                                <label className="inline-flex items-center">
                                                                                    <div className='rounded-full h-10 w-10 flex items-center justify-center text-white text-bold text-lg bg-gray-900'>
                                                                                        {resource.name[0]}
                                                                                    </div>
                                                                                </label>
                                                                                <div className="text-left ml-2 flex-grow">
                                                                                    <p className="text-xs font-bold text-blue-500">{resource.name}</p>
                                                                                    <p className="text-xs text-gray-500">
                                                                                        <span className="font-bold">IP: {resource.address}</span>
                                                                                    </p>
                                                                                    <p className="text-xs text-gray-500">Alias: {resource.alias}</p>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                        <div className="flex justify-end mt-4">
                                                            <button className="bg-black text-white px-4 py-2 rounded-md mr-2"
                                                                disabled={!privilegeCheck()}
                                                                onClick={openEditModal}
                                                            >
                                                                Edit
                                                            </button>
                                                            {isEditModalOpen && <PolicyModal closeModal={closeEditModal} editMode={true} currentPolicy={userPolicy} />}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </div>


            </div>
        </div>
    );


}
