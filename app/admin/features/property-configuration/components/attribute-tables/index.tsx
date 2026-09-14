"use client";

import React, { useState, useEffect } from "react";
import { getColumns } from "./columns";
import { Button } from "@/app/admin/components/ui/button";
import { Plus } from "lucide-react";
import Modal from "@/components/modals/Modal";
import { AddAttributeModal } from "../modals/add-attribute-modal";
import dynamic from "next/dynamic";
import { DataTable } from "@/app/admin/components/ui/table/data-table";
import { useDataTable } from "@/app/admin/hooks/use-data-table";
import axios from "axios";
import { Skeleton } from "@/app/admin/components/ui/skeleton";

import { useQueryState } from "nuqs";

const DataTableToolbar = dynamic(
  () => import("@/app/admin/components/ui/table/data-table-toolbar").then((mod) => mod.DataTableToolbar),
  { ssr: false }
);

interface AttributeTableProps {
  data?: any[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

function AttributeTableGrid({
  filteredData,
  dynamicColumns,
  isLoading,
}: {
  filteredData: any[];
  dynamicColumns: any[];
  isLoading: boolean;
}) {
  const pageCount = Math.max(1, Math.ceil(filteredData.length / 10));

  const { table } = useDataTable({
    data: filteredData,
    columns: dynamicColumns as any,
    pageCount,
    manualPagination: false,
    manualFiltering: false,
    manualSorting: false,
  });

  return (
    <DataTable table={table} isLoading={isLoading}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}

export function AttributeTable({ data = [], isLoading, onRefresh }: AttributeTableProps) {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
  const [dbSubGroups, setDbSubGroups] = useState<any[]>([]);
  const [dbPropertyTypes, setDbPropertyTypes] = useState<any[]>([]);

  const fetchSubGroups = React.useCallback(() => {
    axios
      .get(`/api/admin/sub-groups?t=${Date.now()}`)
      .then((res) => {
        if (res.data?.data) {
          setDbSubGroups(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  const fetchPropertyTypes = React.useCallback(() => {
    axios
      .get(`/api/admin/property-types?t=${Date.now()}`)
      .then((res) => {
        if (res.data?.data) {
          setDbPropertyTypes(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchSubGroups();
    fetchPropertyTypes();
  }, [data, fetchSubGroups, fetchPropertyTypes]);

  const handleSuccess = (createdData?: any) => {
    setIsCategoryLoading(true);
    fetchSubGroups();
    fetchPropertyTypes();
    if (createdData?.type && activeCategory !== "ALL" && createdData.type !== activeCategory) {
      setActiveCategory(createdData.type);
    }
    if (onRefresh) onRefresh();
    setTimeout(() => setIsCategoryLoading(false), 200);
  };

  const counts = React.useMemo(() => {
    return {
      ALL: data.length,
      AMENITY: data.filter((a) => a.type === "AMENITY").length,
      ROOM_AMENITY: data.filter((a) => a.type === "ROOM_AMENITY").length,
      RULE: data.filter((a) => a.type === "RULE").length,
      FEATURE: data.filter((a) => a.type === "FEATURE").length,
    };
  }, [data]);

  const filteredData = React.useMemo(() => {
    if (activeCategory === "ALL") return data;
    return data.filter((attr) => attr.type === activeCategory);
  }, [data, activeCategory]);

  const dynamicColumns = React.useMemo(() => {
    return getColumns(activeCategory, dbSubGroups, data, handleSuccess, dbPropertyTypes);
  }, [activeCategory, dbSubGroups, data, handleSuccess, dbPropertyTypes]);

  const [subGroupQuery, setSubGroupQuery] = useQueryState("subGroupKey");
  const [propertyScopeQuery, setPropertyScopeQuery] = useQueryState("propertyTypeNames");
  const [, setNameQuery] = useQueryState("name");

  const initialSubGroupKey = React.useMemo(() => {
    if (!subGroupQuery) return undefined;
    if (typeof subGroupQuery === "string") return subGroupQuery;
    if (Array.isArray(subGroupQuery)) return (subGroupQuery as string[])[0];
    return String(subGroupQuery);
  }, [subGroupQuery]);

  const initialPropertyTypeNames = React.useMemo(() => {
    if (!propertyScopeQuery) return undefined;
    if (Array.isArray(propertyScopeQuery)) {
      return (propertyScopeQuery as string[]).map((s) => String(s).trim()).filter(Boolean);
    }
    if (typeof propertyScopeQuery === "string") {
      return propertyScopeQuery.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [String(propertyScopeQuery)];
  }, [propertyScopeQuery]);

  const handleCategoryChange = (cat: string) => {
    setIsCategoryLoading(true);
    setActiveCategory(cat);
    // Auto-clear tab-specific filters in URL query parameters so switching tabs starts fresh!
    setSubGroupQuery(null);
    setPropertyScopeQuery(null);
    setNameQuery(null);
    setTimeout(() => setIsCategoryLoading(false), 150);
  };

  return (
    <div className="space-y-6">
      {/* Title Header & Action Button */}
      <div className="flex items-center justify-between">
        <div>
          {isLoading ? (
            <div className="space-y-2 py-0.5">
              <Skeleton className="h-6 w-48 rounded-lg" />
              <Skeleton className="h-3.5 w-80 rounded-lg" />
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest">
                Amenities & Rules
              </h2>
              <p className="text-xs text-slate-500">
                Manage platform-wide property amenities, room features, house rules, and security infrastructure.
              </p>
            </>
          )}
        </div>
        <Modal>
          <Modal.Trigger name="add-attribute">
            <Button className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 font-black uppercase tracking-wider text-xs gap-2">
              <Plus size={16} /> Add Amenity / Rule
            </Button>
          </Modal.Trigger>
          <Modal.Window name="add-attribute" size="lg" hasFixedFooter closeOnOutsideClick={false}>
            <AddAttributeModal
              existingAttributes={data}
              initialCategory={activeCategory}
              initialSubGroupKey={initialSubGroupKey}
              initialPropertyTypeNames={initialPropertyTypeNames}
              subGroups={dbSubGroups}
              onSuccess={handleSuccess}
            />
          </Modal.Window>
        </Modal>
      </div>

      {/* Category Sub-Filter Pills with Dynamic Live Counts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => handleCategoryChange("ALL")}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeCategory === "ALL"
              ? "bg-purple-600 dark:bg-purple-500 text-white shadow-lg shadow-purple-500/20"
              : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
          }`}
        >
          All Items ({counts.ALL})
        </button>
        <button
          onClick={() => handleCategoryChange("AMENITY")}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeCategory === "AMENITY"
              ? "bg-blue-600 dark:bg-blue-500 text-white shadow-lg shadow-blue-500/20"
              : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
          }`}
        >
          Shared Amenities ({counts.AMENITY})
        </button>
        <button
          onClick={() => handleCategoryChange("ROOM_AMENITY")}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeCategory === "ROOM_AMENITY"
              ? "bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
              : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
          }`}
        >
          Room Amenities ({counts.ROOM_AMENITY})
        </button>
        <button
          onClick={() => handleCategoryChange("RULE")}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeCategory === "RULE"
              ? "bg-amber-600 dark:bg-amber-500 text-white shadow-lg shadow-amber-500/20"
              : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
          }`}
        >
          House Rules ({counts.RULE})
        </button>
        <button
          onClick={() => handleCategoryChange("FEATURE")}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeCategory === "FEATURE"
              ? "bg-emerald-600 dark:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
              : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
          }`}
        >
          Security & Features ({counts.FEATURE})
        </button>
      </div>

      <AttributeTableGrid
        key={`${activeCategory}-${dbSubGroups.length}-${data.length}`}
        filteredData={filteredData}
        dynamicColumns={dynamicColumns}
        isLoading={isLoading || isCategoryLoading}
      />
    </div>
  );
}

