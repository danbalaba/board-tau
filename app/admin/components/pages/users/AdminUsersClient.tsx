'use client';

import React, { useState } from 'react';
import DataTable from '@/app/admin/components/common/DataTable';
import ConfirmModal from '@/app/admin/components/common/ConfirmModal';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
  created: string;
  emailVerified: boolean;
  isVerifiedLandlord: boolean;
  phoneNumber: string;
  businessName: string;
  image: string | null;
}

interface Pagination {
  current: number;
  total: number;
  perPage: number;
  totalPages: number;
}

interface AdminUsersClientProps {
  users: User[];
  pagination: Pagination;
}

const AdminUsersClient: React.FC<AdminUsersClientProps> = ({ users, pagination }) => {
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const handleAddUser = () => {
    setIsAddModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Add user submitted');
    setIsAddModalOpen(false);
  };

  const handleEditUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Edit user submitted');
    setIsEditModalOpen(false);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };



  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Refresh the page or update the users list
        window.location.reload();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setDeleteLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = roleFilter ? user.role.toLowerCase() === roleFilter.toLowerCase() : true;
    const matchesStatus = statusFilter ? user.status.toLowerCase() === statusFilter.toLowerCase() : true;
    return matchesRole && matchesStatus;
  });

  const columns = [
    {
      key: 'select',
      title: (
        <input
          type="checkbox"
          checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
          onChange={handleSelectAll}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
      ),
      sortable: false,
      render: (value: any, row: any) => (
        <input
          type="checkbox"
          checked={selectedUsers.includes(row.id)}
          onChange={() => handleSelectUser(row.id)}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
      ),
    },
    {
      key: 'name',
      title: 'Name',
      sortable: true,
      render: (value: string, row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {value.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-white">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      title: 'Role',
      sortable: true,
      render: (value: string) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          value === 'Admin'
            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            : value === 'Moderator'
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
            : 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-400'
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value: string) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          value === 'Active'
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: 'emailVerified',
      title: 'Email Verified',
      sortable: true,
      render: (value: boolean) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          value
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {value ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'phoneNumber',
      title: 'Phone',
      sortable: true,
      render: (value: string) => (
        <span className="text-gray-800 dark:text-white">{value}</span>
      ),
    },
    {
      key: 'lastLogin',
      title: 'Last Login',
      sortable: true,
      render: (value: string) => (
        <span className="text-gray-800 dark:text-white">{value}</span>
      ),
    },
    {
      key: 'created',
      title: 'Created',
      sortable: true,
      render: (value: string) => (
        <span className="text-gray-800 dark:text-white">{value}</span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      sortable: false,
      render: (value: any, row: any) => (
        <div className="flex items-center gap-2">
          <button
            className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
            onClick={() => handleViewUser(row)}
          >
            <FaEye className="text-lg" />
          </button>
          <button
            className="p-2 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-all duration-200"
            onClick={() => handleEditUser(row)}
          >
            <FaEdit className="text-lg" />
          </button>
          <button
            className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
            onClick={() => handleDeleteUser(row)}
          >
            <FaTrash className="text-lg" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Filters and Add User Button */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="landlord">Landlord</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          onClick={handleAddUser}
        >
          Add User
        </button>
      </div>

      <DataTable
        columns={columns}
        data={filteredUsers}
        searchable={true}
        filterable={true}
        pagination={{
          current: pagination.current,
          total: pagination.total,
          perPage: pagination.perPage,
          onPageChange: (page) => console.log('Page change to:', page),
        }}
      />

      {/* View User Modal */}
      {isViewModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setIsViewModalOpen(false)}
            aria-hidden="true"
          />
          <div className="relative transform overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 px-6 py-6 shadow-xl transition-all sm:max-w-lg w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                User Details Screen
              </h3>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Profile Summary */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Profile Summary:</h4>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                    {selectedUser.image ? (
                      <img
                        src={selectedUser.image}
                        alt={selectedUser.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                        <span className="text-white font-medium text-xl">
                          {selectedUser.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Name:</label>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedUser.name}</p>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Role:</label>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedUser.role === 'Admin'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : selectedUser.role === 'Moderator'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-400'
                      }`}>
                        {selectedUser.role}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email:</label>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedUser.email}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status:</label>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedUser.status === 'Active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {selectedUser.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div>
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Account Info:</h4>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Created On:</label>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedUser.created}</p>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Login:</label>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedUser.lastLogin}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setIsAddModalOpen(false)}
            aria-hidden="true"
          />
          <div className="relative transform overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 px-6 py-6 shadow-xl transition-all sm:max-w-lg w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                Add User
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddUserSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
                  placeholder="Enter name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                <select
                  required
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                  <option value="Moderator">Moderator</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                <select
                  required
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setIsEditModalOpen(false)}
            aria-hidden="true"
          />
          <div className="relative transform overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 px-6 py-6 shadow-xl transition-all sm:max-w-lg w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                Edit User
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditUserSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
                <input
                  type="text"
                  required
                  defaultValue={selectedUser.name}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
                  placeholder="Enter name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  defaultValue={selectedUser.email}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                <select
                  required
                  defaultValue={selectedUser.role}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                  <option value="Moderator">Moderator</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                <select
                  required
                  defaultValue={selectedUser.status}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={isDeleteModalOpen}
        title="Delete User"
        message={`Are you sure you want to delete user "${selectedUser?.name}"? This action cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        loading={deleteLoading}
      />
    </>
  );
};

export default AdminUsersClient;
