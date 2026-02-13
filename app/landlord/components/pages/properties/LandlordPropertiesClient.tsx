'use client';

import React from 'react';
import Link from 'next/link';
import { FaBuilding, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  status: string;
  roomCount: number;
  guestCount: number;
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

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    flagged: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Properties
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your rental properties
          </p>
        </div>
        <Link
          href="/landlord/properties/create"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <FaBuilding size={16} />
          <span>Add Property</span>
        </Link>
      </div>

      {/* Properties List */}
      {listings.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <FaBuilding size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No properties found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You haven't added any properties yet. Start by adding your first property.
          </p>
          <Link
            href="/landlord/properties/create"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FaBuilding size={16} />
            <span>Add First Property</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((property) => (
            <div
              key={property.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Property Image */}
              <div className="h-48 bg-gray-100 dark:bg-gray-700">
                {property.imageSrc ? (
                  <img
                    src={property.imageSrc}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaBuilding size={32} className="text-gray-400" />
                  </div>
                )}
              </div>

              {/* Property Details */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {property.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {property.roomCount} rooms · {property.guestCount} guests · {property.bathroomCount} bathrooms
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${statusColors[property.status]}`}>
                    {formatStatus(property.status)}
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {property.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    ₱{property.price.toLocaleString()}/month
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Added {new Date(property.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/landlord/properties/${property.id}/edit`}
                    className="flex-1 flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
                  >
                    <FaEdit size={14} />
                    <span>Edit</span>
                  </Link>
                  <button
                    className="flex-1 flex items-center justify-center gap-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-3 py-2 rounded text-sm transition-colors"
                    onClick={() => console.log('View property details')}
                  >
                    <FaEye size={14} />
                    <span>View</span>
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors"
                    onClick={() => console.log('Delete property')}
                  >
                    <FaTrash size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {nextCursor && (
        <div className="text-center">
          <button
            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-6 py-2 rounded-lg transition-colors"
            onClick={() => console.log('Load more properties')}
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
