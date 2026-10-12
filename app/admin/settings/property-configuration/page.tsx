import { PropertyConfigurationClient } from "@/app/admin/features/property-configuration";

export const metadata = {
  title: "Property Configuration | Admin | BoardTAU",
  description: "Configure property types, room categories, and accommodation rules",
};

export default function PropertyConfigurationPage() {
  return (
    <div className="w-full">
      <PropertyConfigurationClient />
    </div>
  );
}
