"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "@/app/admin/features/property-configuration/components/attribute-tables/cell-action";
import * as LucideIcons from "lucide-react";
import { Badge } from "@/app/admin/components/ui/badge";

export type DynamicAttributeColumn = {
  id: string;
  name: string;
  type: "AMENITY" | "ROOM_AMENITY" | "RULE" | "FEATURE";
  description: string | null;
  icon: string | null;
  isActive: boolean;
  isUniversal?: boolean;
  propertyTypeIds?: string[];
  propertyTypeNames?: string[];
};

const TYPE_CONFIG = {
  AMENITY: { label: "Shared Amenity", bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  ROOM_AMENITY: { label: "Room Amenity", bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" },
  RULE: { label: "House Rule", bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  FEATURE: { label: "Security & Feature", bg: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20" },
};

const SUB_GROUP_CATEGORY_PRESETS: Record<string, string[]> = {
  AMENITY: ["STORES", "WIFI", "POWER_WATER", "PARKING", "LAUNDRY", "STUDY_LOUNGE", "CARETAKER", "GARDEN"],
  ROOM_AMENITY: ["KITCHEN_APP", "BATHROOM_FIX", "COOLING", "FURNITURE"],
  RULE: ["GENDER_POLICY", "CURFEW", "VISITOR_POLICY", "PET_POLICY", "SMOKING_POLICY", "ALCOHOL_POLICY"],
  FEATURE: ["SECURITY", "DISASTER_PREP"],
};

const formatKeyToTitle = (key: string) => {
  return key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
};

export const getColumns = (
  activeCategory: string = "ALL",
  subGroups: any[] = [],
  attributesData: any[] = [],
  onRefresh?: () => void,
  dbPropertyTypes: any[] = []
): ColumnDef<DynamicAttributeColumn>[] => {
  const iconCol: ColumnDef<DynamicAttributeColumn> = {
    id: "icon",
    accessorKey: "icon",
    header: () => <div className="text-center">Icon</div>,
    meta: { label: "Icon" },
    cell: ({ row }) => {
      const iconName = row.original.icon || "Sparkles";
      const Icon = (LucideIcons as any)[iconName] || LucideIcons.Sparkles;
      const typeStyle = TYPE_CONFIG[row.original.type] || TYPE_CONFIG.AMENITY;
      return (
        <div className="flex items-center justify-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-xl border ${typeStyle.bg}`}>
            <Icon size={18} />
          </div>
        </div>
      );
    },
  };

  const nameCol: ColumnDef<DynamicAttributeColumn> = {
    id: "name",
    accessorKey: "name",
    header: "Attribute Name",
    meta: {
      label: "Attribute Name",
      variant: "text",
      placeholder: "Search attributes...",
    },
    enableColumnFilter: true,
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-bold text-slate-800 dark:text-slate-200">{row.original.name}</span>
        {row.original.description && (
          <span className="text-xs text-slate-500 max-w-[280px] truncate" title={row.original.description}>
            {row.original.description}
          </span>
        )}
      </div>
    ),
  };

  // 1. Category Type Filter Column (Only active/filterable when activeCategory === "ALL")
  const typeCol: ColumnDef<DynamicAttributeColumn> = {
    id: "type",
    accessorKey: "type",
    header: () => <div className="text-center">Category Type</div>,
    meta: {
      label: "Category Type",
      variant: "multiSelect",
      options: [
        { label: "Shared Amenity", value: "AMENITY" },
        { label: "Room Amenity", value: "ROOM_AMENITY" },
        { label: "House Rule", value: "RULE" },
        { label: "Security & Feature", value: "FEATURE" },
      ],
    },
    enableColumnFilter: activeCategory === "ALL",
    filterFn: (row, id, filterValue: string[]) => {
      if (!filterValue || filterValue.length === 0) return true;
      const rowVal = String(row.getValue(id));
      return filterValue.includes(rowVal);
    },
    cell: ({ row }) => {
      const typeStyle = TYPE_CONFIG[row.original.type] || TYPE_CONFIG.AMENITY;
      return (
        <div className="text-center">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${typeStyle.bg}`}>
            {typeStyle.label}
          </span>
        </div>
      );
    },
  };

  // 2. Sub-Group Category Filter Column (Active/filterable when activeCategory !== "ALL")
  let subGroupLabel = "Sub-Group Category";
  if (activeCategory === "RULE") subGroupLabel = "Rule Category";
  if (activeCategory === "FEATURE") subGroupLabel = "Safety Category";

  const SUB_GROUP_LABELS: Record<string, string> = {
    STORES: "Stores & Essentials",
    WIFI: "Internet & WiFi",
    POWER_WATER: "Backup Power & Water",
    PARKING: "Parking Facilities",
    LAUNDRY: "Laundry & Drying",
    STUDY_LOUNGE: "Study & Lounge",
    CARETAKER: "Caretaker & Housekeeping",
    GARDEN: "Outdoor & Green Spaces",
    KITCHEN_APP: "Cooking & Kitchen Appliances",
    BATHROOM_FIX: "CR Features & Fixtures",
    COOLING: "Aircon & Cooling",
    FURNITURE: "Furniture & Storage",
    GENDER_POLICY: "Gender Policy",
    CURFEW: "Curfew & Gate Rules",
    VISITOR_POLICY: "Visitor Policy",
    PET_POLICY: "Pet Policy",
    SMOKING_POLICY: "Smoking Policy",
    ALCOHOL_POLICY: "Alcohol Policy",
    SMOKE_ALCOHOL: "Smoke & Alcohol",
    SECURITY: "Security & Access",
    DISASTER_PREP: "Disaster Safety",
  };

  const optionsMap = new Map<string, string>();

  // A. Add sub-groups from database API
  const categorySubGroups = subGroups.filter((sg) => sg.type === activeCategory || !sg.type);
  categorySubGroups.forEach((sg) => {
    const label = SUB_GROUP_LABELS[sg.key] || sg.tabLabel || sg.title || formatKeyToTitle(sg.key);
    optionsMap.set(sg.key, label);
  });

  // B. Add sub-groups present in current attributes data
  const relevantAttributes = attributesData.filter((attr) => attr.type === activeCategory || activeCategory === "ALL");
  relevantAttributes.forEach((attr) => {
    const key = attr.subGroupKey || "GENERAL";
    if (!optionsMap.has(key)) {
      const label = key === "GENERAL" ? "General / Unassigned" : (SUB_GROUP_LABELS[key] || formatKeyToTitle(key));
      optionsMap.set(key, label);
    }
  });

  // C. Add preset defaults for active tab
  const presetKeys = SUB_GROUP_CATEGORY_PRESETS[activeCategory] || [];
  presetKeys.forEach((key) => {
    if (!optionsMap.has(key)) {
      optionsMap.set(key, SUB_GROUP_LABELS[key] || formatKeyToTitle(key));
    }
  });

  const subGroupOptions = Array.from(optionsMap.entries()).map(([key, label]) => ({
    label,
    value: key,
  }));

  const subGroupCol: ColumnDef<DynamicAttributeColumn> = {
    id: "subGroupKey",
    accessorKey: "subGroupKey",
    header: () => <div className="text-center">Sub-Group Category</div>,
    meta: {
      label: subGroupLabel,
      variant: "multiSelect",
      options: subGroupOptions,
    },
    enableColumnFilter: activeCategory !== "ALL",
    filterFn: (row, id, filterValue: string[]) => {
      if (!filterValue || filterValue.length === 0) return true;
      const rawVal = row.getValue(id);
      const rowVal = rawVal ? String(rawVal) : "GENERAL";
      return filterValue.includes(rowVal);
    },
    cell: ({ row }) => {
      const sgKey = (row.original as any).subGroupKey;
      const displayLabel = sgKey ? (optionsMap.get(sgKey) || SUB_GROUP_LABELS[sgKey] || formatKeyToTitle(sgKey)) : "General";
      return (
        <div className="text-center">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {displayLabel}
          </span>
        </div>
      );
    },
  };

  // Dynamically extract all property scope names across the database & attributes dataset
  const scopeOptionsSet = new Set<string>();
  if (dbPropertyTypes && dbPropertyTypes.length > 0) {
    dbPropertyTypes.forEach((pt: any) => {
      if (pt.name) scopeOptionsSet.add(pt.name);
    });
  }
  attributesData.forEach((attr) => {
    if (attr.propertyTypeNames && Array.isArray(attr.propertyTypeNames)) {
      attr.propertyTypeNames.forEach((name: string) => scopeOptionsSet.add(name));
    }
  });

  const scopeOptions = [
    { label: "Universal (All Properties)", value: "UNIVERSAL" },
    ...Array.from(scopeOptionsSet).map((name) => ({ label: name, value: name })),
  ];

  const scopeCol: ColumnDef<DynamicAttributeColumn> = {
    id: "propertyTypeNames",
    accessorKey: "propertyTypeNames",
    header: () => <div className="text-center">Property Scope</div>,
    meta: {
      label: "Property Scope",
      variant: "multiSelect",
      options: scopeOptions,
    },
    enableColumnFilter: true,
    filterFn: (row, id, filterValue: string[]) => {
      if (!filterValue || filterValue.length === 0) return true;
      const names = row.original.propertyTypeNames || [];
      const isUniversal = !row.original.propertyTypeNames || row.original.propertyTypeNames.length === 0;

      return filterValue.some((val) => {
        if (val === "UNIVERSAL") return isUniversal;
        return names.includes(val);
      });
    },
    cell: ({ row }) => {
      const names = row.original.propertyTypeNames || [];
      const isUniversal = row.original.isUniversal || names.length === 0 || (scopeOptionsSet.size > 0 && names.length >= scopeOptionsSet.size);

      if (isUniversal) {
        return (
          <div className="text-center">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Universal (All)
            </span>
          </div>
        );
      }
      return (
        <div className="flex justify-center flex-wrap gap-1 max-w-[200px] mx-auto">
          {names.map((name) => (
            <span key={name} className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-slate-200 dark:border-slate-700">
              {name}
            </span>
          ))}
        </div>
      );
    },
  };

  const statusCol: ColumnDef<DynamicAttributeColumn> = {
    id: "isActive",
    accessorKey: "isActive",
    header: () => <div className="text-center">Status</div>,
    meta: {
      label: "Status",
      variant: "multiSelect",
      options: [
        { label: "Active", value: "true" },
        { label: "Disabled", value: "false" },
      ],
    },
    enableColumnFilter: true,
    filterFn: (row, id, filterValue: string[]) => {
      if (!filterValue || filterValue.length === 0) return true;
      const rowValue = Boolean(row.getValue(id));
      return filterValue.some((val) => {
        if (val === "true" || val === "active" || val === "1") return rowValue === true;
        if (val === "false" || val === "disabled" || val === "0") return rowValue === false;
        return String(rowValue) === val;
      });
    },
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <div className="text-center">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              isActive
                ? "bg-primary/10 text-primary dark:text-primary-light border border-primary/20"
                : "bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20"
            }`}
          >
            {isActive ? "Active" : "Disabled"}
          </span>
        </div>
      );
    },
  };

  const actionsCol: ColumnDef<DynamicAttributeColumn> = {
    id: "actions",
    header: () => <div className="text-right pr-2">Actions</div>,
    cell: ({ row }) => (
      <div className="text-right pr-2">
        <CellAction data={row.original} subGroups={subGroups} onSuccess={onRefresh} />
      </div>
    ),
  };

  // Render Category Type in 3rd column for ALL ITEMS, or Sub-Group Category for specific tabs
  const activeThirdCol = activeCategory === "ALL" ? typeCol : subGroupCol;

  return [iconCol, nameCol, activeThirdCol, scopeCol, statusCol, actionsCol];
};

export const columns = getColumns("ALL");
