"use client";

import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast } from "@/app/admin/components/ui/sonner";
import { motion } from "framer-motion";
import { Building, MapPin, Sparkles } from "lucide-react";
import Skeleton from "@/components/common/Skeleton";
import { PropertyTable } from "./components/property-tables";
import { CollegeTable } from "./components/college-tables";
import { AttributeTable } from "./components/attribute-tables";
import { PropertyConfigurationHeader } from "./components/property-configuration-header";
import { PropertyConfigurationKpiCards } from "./components/property-configuration-kpi-cards";
import { exportToCSV, exportToExcel } from "@/utils/export-utils";

export function PropertyConfigurationClient() {
  const [activeTab, setActiveTab] = useState<"property-types" | "campus-landmarks" | "dynamic-attributes">("property-types");
  const [propertyTypes, setPropertyTypes] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [attributes, setAttributes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [range, setRange] = useState("30d");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAnyLoading = !mounted || isLoading || isFetching;

  const fetchData = async (showFetching = false) => {
    try {
      if (showFetching) setIsFetching(true);
      else setIsLoading(true);

      const timestamp = Date.now();
      const [propRes, collegeRes, attrRes] = await Promise.all([
        axios.get(`/api/admin/property-types?t=${timestamp}`),
        axios.get(`/api/colleges?includeDisabled=true&t=${timestamp}`),
        axios.get(`/api/admin/attributes?t=${timestamp}`),
      ]);

      setPropertyTypes(propRes.data.data || []);
      setColleges(collegeRes.data || []);
      setAttributes(attrRes.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch configuration data");
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalRoomTypes = useMemo(() => {
    return propertyTypes.reduce((acc, pt) => acc + (pt.roomTypes?.length || 0), 0);
  }, [propertyTypes]);

  const handleExport = (format: "CSV" | "EXCEL" | "PDF") => {
    let exportData: any[] = [];
    let title = "Property_Configuration";

    if (activeTab === "property-types") {
      title = "Property_Categories_Report";
      exportData = propertyTypes.map((pt) => ({
        Name: pt.name,
        Description: pt.description || "N/A",
        "Active Status": pt.isActive ? "Active" : "Disabled",
        "Room Types Count": pt.roomTypes?.length || 0,
        "Attached Listings": pt._count?.listings || 0,
      }));
    } else if (activeTab === "campus-landmarks") {
      title = "Campus_Landmarks_Report";
      exportData = colleges.map((c) => ({
        Name: c.name,
        Code: c.code,
        Latitude: c.latitude,
        Longitude: c.longitude,
        "Active Status": c.isActive ? "Active" : "Disabled",
      }));
    } else {
      title = "Attributes_Amenities_Rules_Report";
      exportData = attributes.map((a) => ({
        Name: a.name,
        Category: a.type,
        "Sub-Group": a.subGroupKey || "N/A",
        Availability: a.isUniversal ? "Universal" : "Targeted",
        Description: a.description || "N/A",
      }));
    }

    const fileName = `${title}_${new Date().toLocaleDateString().replace(/\//g, "-")}`;
    if (format === "CSV") {
      exportToCSV(exportData, fileName);
      toast.success("Exported CSV successfully!");
    } else if (format === "EXCEL") {
      exportToExcel(exportData, fileName, "Data");
      toast.success("Exported Excel successfully!");
    } else {
      toast.info("PDF Export feature coming soon.");
    }
  };

  const handleRangeChange = (newRange: string) => {
    setRange(newRange);
    fetchData(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Banner */}
      <PropertyConfigurationHeader
        range={range}
        setRange={handleRangeChange}
        isFetching={isFetching}
        isLoading={isLoading}
        onRefresh={() => fetchData(true)}
        onExport={handleExport}
      />

      {/* Dynamic KPI Cards */}
      <PropertyConfigurationKpiCards
        propertyTypes={propertyTypes}
        totalRoomTypesCount={totalRoomTypes}
        colleges={colleges}
        attributes={attributes}
        isLoading={isAnyLoading}
        range={range}
      />

      {/* Segmented Control Tab Navigation */}
      {isAnyLoading ? (
        <div className="flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 backdrop-blur-xl w-fit gap-2">
          <Skeleton className="h-12 w-44 rounded-xl" />
          <Skeleton className="h-12 w-48 rounded-xl" />
          <Skeleton className="h-12 w-44 rounded-xl" />
        </div>
      ) : (
        <div className="flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 backdrop-blur-xl w-fit gap-2">
          <button
            onClick={() => setActiveTab("property-types")}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer ${
              activeTab === "property-types"
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5"
            }`}
          >
            <Building size={16} />
            <span>Property Categories</span>
          </button>

          <button
            onClick={() => setActiveTab("campus-landmarks")}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer ${
              activeTab === "campus-landmarks"
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5"
            }`}
          >
            <MapPin size={16} />
            <span>TAU Campus Landmarks</span>
          </button>

          <button
            onClick={() => setActiveTab("dynamic-attributes")}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer ${
              activeTab === "dynamic-attributes"
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5"
            }`}
          >
            <Sparkles size={16} />
            <span>Amenities, Rules & Features</span>
          </button>
        </div>
      )}

      {/* Table Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-[2.5rem] border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl overflow-hidden"
      >
        {activeTab === "property-types" && (
          <PropertyTable 
            data={propertyTypes} 
            isLoading={isLoading || isFetching} 
            onRefresh={(deletedId?: string) => {
              if (deletedId) {
                setPropertyTypes((prev) => prev.filter((pt) => pt.id !== deletedId));
              }
              fetchData(true);
            }} 
          />
        )}
        {activeTab === "campus-landmarks" && (
          <CollegeTable data={colleges} isLoading={isLoading || isFetching} onRefresh={fetchData} />
        )}
        {activeTab === "dynamic-attributes" && (
          <AttributeTable data={attributes} isLoading={isLoading || isFetching} onRefresh={fetchData} />
        )}
      </motion.div>
    </div>
  );
}
