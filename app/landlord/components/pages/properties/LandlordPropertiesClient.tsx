'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FaBuilding, FaEdit, FaTrash, FaEye, FaPlus, FaBath, FaChevronDown } from 'react-icons/fa';

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  status: string;
  roomCount: number;
  bathroomCount: number;
  imageSrc: string;
  createdAt: Date;
}

interface LandlordPropertiesClientProps {
  properties: {
    listings: Property[];
    nextCursor: string | null;
  };
}

export default function LandlordPropertiesClient({ properties }: LandlordPropertiesClientProps) {
  const { listings, nextCursor } = properties;
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const statusColors: Record<string, string> = {
    active: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
    pending: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white',
    rejected: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
    flagged: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white',
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Handler for delete button
  const handleDeleteClick = (property: Property) => {
    setSelectedProperty(property);
    setDeleteModalOpen(true);
  };

  // Handler for confirm delete
  const handleConfirmDelete = async () => {
    if (!selectedProperty) return;
    
    try {
      const response = await fetch(`/api/landlord/properties/${selectedProperty.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Property deleted successfully, you might want to refresh the properties list
        window.location.reload();
      } else {
        console.error('Failed to delete property');
      }
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  };

  // Handler for view button
  const handleViewClick = (property: Property) => {
    setSelectedProperty(property);
    setViewModalOpen(true);
  };

  // Handler for edit button
  const handleEditClick = (property: Property) => {
    setSelectedProperty(property);
    setEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <FaTrash size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Property</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Are you sure you want to delete {selectedProperty.title}?</p>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
              <p className="text-xs text-gray-600 dark:text-gray-400">This action cannot be undone. All data related to this property will be permanently deleted.</p>
            </div>
            
            <div className="flex gap-3">
              <button
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-xl transition-all duration-300"
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-xl transition-all duration-300"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Property Modal */}
      {viewModalOpen && selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <FaEye size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">View Property</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Property details for {selectedProperty.title}</p>
                </div>
              </div>
              <button
                className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                onClick={() => setViewModalOpen(false)}
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Property Image */}
              <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden">
                {selectedProperty.imageSrc ? (
                  <img
                    src={selectedProperty.imageSrc}
                    alt={selectedProperty.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                    <FaBuilding size={48} className="text-gray-400 dark:text-gray-500" />
                  </div>
                )}
              </div>

              {/* Property Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Property Information</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Title</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedProperty.title}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Description</p>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedProperty.description}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[selectedProperty.status]}`}>
                        {formatStatus(selectedProperty.status)}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Property Details</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Price</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">₱{selectedProperty.price.toLocaleString()}/month</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Rooms</p>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedProperty.roomCount} rooms</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Bathrooms</p>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedProperty.bathroomCount} bathrooms</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Added On</p>
                      <p className="text-sm text-gray-900 dark:text-white">{new Date(selectedProperty.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => setViewModalOpen(false)}
                >
                  Close
                </button>
                <Link
                  href={`/landlord/properties/${selectedProperty.id}/edit`}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all"
                >
                  <FaEdit size={12} />
                  Edit Property
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Property Modal */}
      {editModalOpen && selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <FaEdit size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit Property</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Update property details for {selectedProperty.title}</p>
                </div>
              </div>
              <button
                className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                onClick={() => setEditModalOpen(false)}
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This modal provides a quick preview of the edit functionality. For full editing capabilities, please use the dedicated edit page.
              </p>

              {/* Property Image */}
              <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden">
                {selectedProperty.imageSrc ? (
                  <img
                    src={selectedProperty.imageSrc}
                    alt={selectedProperty.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                    <FaBuilding size={48} className="text-gray-400 dark:text-gray-500" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Basic Information</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Title</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedProperty.title}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Description</p>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedProperty.description}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Pricing & Details</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Price</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">₱{selectedProperty.price.toLocaleString()}/month</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Rooms</p>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedProperty.roomCount} rooms</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Bathrooms</p>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedProperty.bathroomCount} bathrooms</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => setEditModalOpen(false)}
                >
                  Cancel
                </button>
                <Link
                  href={`/landlord/properties/${selectedProperty.id}/edit`}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all"
                >
                  <FaEdit size={12} />
                  Go to Edit Page
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-6 rounded-2xl border border-blue-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Properties
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Manage your rental properties with ease
            </p>
          </div>
          <Link
            href="/landlord/properties/create"
            className="group flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/30 transform hover:-translate-y-1"
          >
            <FaBuilding size={16} className="group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-sm">Add Property</span>
            <FaPlus size={12} className="group-hover:rotate-90 transition-transform duration-300" />
          </Link>
        </div>
      </div>

      {/* Properties List */}
      {listings.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl mb-4">
            <FaBuilding size={32} className="text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            No properties found
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            You haven't added any properties yet. Start by adding your first property to get started.
          </p>
          <Link
            href="/landlord/properties/create"
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/30 transform hover:-translate-y-1"
          >
            <FaBuilding size={16} className="group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-sm">Add First Property</span>
            <FaPlus size={12} className="group-hover:rotate-90 transition-transform duration-300" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((property) => (
            <div
              key={property.id}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-2xl"
            >
              {/* Property Image */}
              <div className="relative h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden group-hover:scale-[1.02] transition-transform duration-300">
                {property.imageSrc ? (
                  <img
                    src={property.imageSrc}
                    alt={property.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                    <FaBuilding size={32} className="text-gray-400 dark:text-gray-500 group-hover:scale-110 transition-transform" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-3 left-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[property.status]} shadow-lg`}>
                    {formatStatus(property.status)}
                  </span>
                </div>
              </div>

              {/* Property Details */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {property.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
                  {property.description}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <FaBuilding size={12} />
                      {property.roomCount} rooms
                    </span>
                    <span className="flex items-center gap-1">
                      <FaBath size={12} />
                      {property.bathroomCount} bathrooms
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Added {new Date(property.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₱{property.price.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">/month</span>
                </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-2 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 group-hover:scale-[1.02]"
                      onClick={() => handleEditClick(property)}
                    >
                      <FaEdit size={12} />
                      <span className="font-semibold text-xs">Edit</span>
                    </button>
                    <button
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-3 py-2 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-gray-500/30 group-hover:scale-[1.02]"
                      onClick={() => handleViewClick(property)}
                    >
                      <FaEye size={12} />
                      <span className="font-semibold text-xs">View</span>
                    </button>
                    <button
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-red-500/30 group-hover:scale-[1.02]"
                      onClick={() => handleDeleteClick(property)}
                    >
                      <FaTrash size={12} />
                      <span className="font-semibold text-xs">Delete</span>
                    </button>
                  </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {nextCursor && (
        <div className="text-center py-6">
          <button
            className="group flex items-center justify-center gap-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-gray-500/30 transform hover:-translate-y-1"
            onClick={() => console.log('Load more properties')}
          >
            <span className="font-semibold text-sm">Load More</span>
            <FaChevronDown size={12} className="group-hover:translate-y-1 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
}
