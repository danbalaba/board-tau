"use server";

import { db } from "@/lib/db";
import { cache } from "@/lib/redis";

export async function getActiveAttributes() {
  try {
    const cacheKey = "taxonomy:attributes:active";
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const [attributes, propertyTypes] = await Promise.all([
      db.dynamicAttribute.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" }
      }),
      db.propertyType.findMany({
        select: { id: true, name: true }
      })
    ]);

    const propTypeMap = new Map(propertyTypes.map((pt) => [pt.id, pt.name]));

    const data = attributes.map((attr) => {
      const propertyTypeNames = (attr.propertyTypeIds || [])
        .map((id) => propTypeMap.get(id))
        .filter(Boolean);

      return {
        ...attr,
        propertyTypeNames,
        propertyTypes: propertyTypeNames.map((name) => ({ name })),
      };
    });

    await cache.set(cacheKey, data, 86400); // Cache for 24 hours (invalidated on admin mutations)
    return data;
  } catch (error) {
    console.error("getActiveAttributes error:", error);
    return [];
  }
}

export async function getAttributesByType(type: "AMENITY" | "RULE" | "FEATURE" | "ROOM_AMENITY") {
  try {
    const allAttributes = await getActiveAttributes();
    return (allAttributes as any[]).filter(attr => attr.type === type);
  } catch (error) {
    console.error(`getAttributesByType error for ${type}:`, error);
    return [];
  }
}

export async function getActivePropertyTypes() {
  try {
    const cacheKey = "taxonomy:propertyTypes:active";
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const types = await db.propertyType.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" }
    });

    if (types && types.length > 0) {
      await cache.set(cacheKey, types, 86400); // Cache for 24 hours
    }
    return types;
  } catch (error) {
    console.error("getActivePropertyTypes error:", error);
    return [];
  }
}

export async function invalidatePropertyTypesCache() {
  try {
    await cache.del("taxonomy:propertyTypes:active");
    await cache.delPattern("taxonomy:roomTypes:*");
  } catch (error) {
    console.error("invalidatePropertyTypesCache error:", error);
  }
}

export async function getActiveRoomTypes(propertyTypeName?: string) {
  try {
    const cacheKey = `taxonomy:roomTypes:${propertyTypeName || "all"}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    let whereClause: any = { isActive: true };
    if (propertyTypeName) {
      const propType = await db.propertyType.findFirst({
        where: { name: propertyTypeName }
      });
      if (propType) {
        whereClause.propertyTypeId = propType.id;
      }
    }

    const roomTypes = await db.roomTypeDefinition.findMany({
      where: whereClause,
      include: {
        propertyType: true,
        bedSetups: true,
      },
      orderBy: { name: "asc" }
    });

    if (roomTypes && roomTypes.length > 0) {
      await cache.set(cacheKey, roomTypes, 86400); // Cache for 24 hours
    }
    return roomTypes;
  } catch (error) {
    console.error("getActiveRoomTypes error:", error);
    return [];
  }
}

export async function getActiveCampusColleges() {
  try {
    const cacheKey = "taxonomy:campusColleges:active";
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const colleges = await db.campusCollege.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" }
    });

    if (colleges && colleges.length > 0) {
      await cache.set(cacheKey, colleges, 86400); // Cache for 24 hours
    }
    return colleges;
  } catch (error) {
    console.error("getActiveCampusColleges error:", error);
    return [];
  }
}

export async function invalidateCampusCollegesCache() {
  try {
    await cache.del("taxonomy:campusColleges:active");
  } catch (error) {
    console.error("invalidateCampusCollegesCache error:", error);
  }
}

export async function getActiveSubGroups() {
  try {
    const cacheKey = "taxonomy:subGroups:active";
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const subGroups = await db.attributeSubGroup.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" }
    });

    if (subGroups && subGroups.length > 0) {
      await cache.set(cacheKey, subGroups, 86400); // Cache for 24 hours
    }
    return subGroups;
  } catch (error) {
    console.error("getActiveSubGroups error:", error);
    return [];
  }
}
