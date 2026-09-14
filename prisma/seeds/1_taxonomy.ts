import { PrismaClient, AttributeType } from "@prisma/client";

export async function seedTaxonomy(prisma: PrismaClient) {
  console.log("🚀 [1/4] Seeding Dynamic Attributes & Taxonomy...");

  // 1. Seed Sub-Group Categories
  const subGroups = [
    { type: AttributeType.AMENITY, key: "STORES", title: "Step 6-1: Nearby Stores & Daily Essentials Proximity", subtitle: "Which daily essentials do you need nearby?", tabLabel: "Stores", displayOrder: 1 },
    { type: AttributeType.AMENITY, key: "WIFI", title: "Step 6-2: Internet & Connectivity Preferences", subtitle: "What type of internet connection do you require?", tabLabel: "Internet", displayOrder: 2 },
    { type: AttributeType.AMENITY, key: "POWER_WATER", title: "Step 6-3: Water & Power Backup Systems", subtitle: "Select your utility resilience requirements", tabLabel: "Backup Systems", displayOrder: 3 },
    { type: AttributeType.AMENITY, key: "PARKING", title: "Step 6-4: Vehicle & Parking Facilities", subtitle: "Do you need parking for a vehicle?", tabLabel: "Parking", displayOrder: 4 },
    { type: AttributeType.AMENITY, key: "LAUNDRY", title: "Step 6-5: Laundry & Clothes Drying Facilities", subtitle: "Select your preferred laundry setup", tabLabel: "Laundry", displayOrder: 5 },
    { type: AttributeType.AMENITY, key: "STUDY_LOUNGE", title: "Step 6-6: Shared Study, Lounge & Caretaker", subtitle: "Select communal study and lounge amenities", tabLabel: "Study & Lounge", displayOrder: 6 },
    { type: AttributeType.AMENITY, key: "CARETAKER", title: "Step 6-7: Property Management & Maintenance", subtitle: "Select management preferences", tabLabel: "Caretaker", displayOrder: 7 },
    { type: AttributeType.AMENITY, key: "GARDEN", title: "Step 6-8: Outdoor & Green Spaces", subtitle: "Which outdoor or garden areas do you want?", tabLabel: "Outdoor Spaces", displayOrder: 8 },

    // In-Unit Comfort Sub-Groups
    { type: AttributeType.ROOM_AMENITY, key: "KITCHEN_APP", title: "Step 7-2: Cooking & Kitchen Appliances", subtitle: "Select cooking appliances for your room/unit", tabLabel: "Kitchen", displayOrder: 2 },
    { type: AttributeType.ROOM_AMENITY, key: "BATHROOM_FIX", title: "Step 7-4: CR Features & Water Fixtures", subtitle: "Select bathroom fixtures and features", tabLabel: "CR Features", displayOrder: 4 },
    { type: AttributeType.ROOM_AMENITY, key: "COOLING", title: "Step 7-5: Aircon & Cooling Systems", subtitle: "Select aircon and cooling preferences", tabLabel: "Cooling", displayOrder: 5 },
    { type: AttributeType.ROOM_AMENITY, key: "FURNITURE", title: "Step 7-6: Bedroom Furniture & Storage", subtitle: "Select bedroom furniture and storage items", tabLabel: "Furniture", displayOrder: 6 },

    // Rules & Security Sub-Groups
    { type: AttributeType.RULE, key: "GENDER_POLICY", title: "Step 8-2: Property Gender Policy", subtitle: "Select gender allowance rules", tabLabel: "Gender Policy", displayOrder: 1 },
    { type: AttributeType.RULE, key: "CURFEW", title: "Step 8-3: Gate & Curfew Rules", subtitle: "Select gate curfew requirements", tabLabel: "Curfew", displayOrder: 2 },
    { type: AttributeType.RULE, key: "VISITOR_POLICY", title: "Step 8-4: Visitor & Guest Policy", subtitle: "Select visitor allowance rules", tabLabel: "Visitor Policy", displayOrder: 3 },
    { type: AttributeType.RULE, key: "PET_POLICY", title: "Step 8-5: Pet Policy", subtitle: "Select pet allowance rules", tabLabel: "Pet Policy", displayOrder: 4 },
    { type: AttributeType.RULE, key: "SMOKING_POLICY", title: "Step 8-5: Property Smoking & Vaping Policy", subtitle: "Select smoking and vaping allowance rules", tabLabel: "Smoking Policy", displayOrder: 5 },
    { type: AttributeType.RULE, key: "ALCOHOL_POLICY", title: "Step 8-6: Alcohol & Drinking Policy", subtitle: "Select alcoholic beverage allowance rules", tabLabel: "Alcohol Policy", displayOrder: 6 },
    { type: AttributeType.FEATURE, key: "SECURITY", title: "Step 9-1: Security & Gate Access", subtitle: "Select security and access features", tabLabel: "Security", displayOrder: 1 },
    { type: AttributeType.FEATURE, key: "DISASTER_PREP", title: "Step 9-2: Disaster Preparedness & Safety", subtitle: "Select safety and emergency features", tabLabel: "Disaster Safety", displayOrder: 2 },
  ];

  for (const sg of subGroups) {
    await (prisma as any).attributeSubGroup.upsert({
      where: { key: sg.key },
      update: {
        type: sg.type,
        title: sg.title,
        subtitle: sg.subtitle,
        tabLabel: sg.tabLabel,
        displayOrder: sg.displayOrder,
        isActive: true,
      },
      create: {
        type: sg.type,
        key: sg.key,
        title: sg.title,
        subtitle: sg.subtitle,
        tabLabel: sg.tabLabel,
        displayOrder: sg.displayOrder,
        isActive: true,
      },
    });
  }
  console.log("   ✓ Attribute Sub-Group Categories seeded.");

  const attributes = [
    // A. STORES Sub-Group
    { type: AttributeType.AMENITY, subGroupKey: "STORES", name: "Near Laundry Shop", icon: "WashingMachine", description: "External commercial laundry shop nearby." },
    { type: AttributeType.AMENITY, subGroupKey: "STORES", name: "Near Sari-Sari Store", icon: "Store", description: "Convenience retail store nearby." },
    { type: AttributeType.AMENITY, subGroupKey: "STORES", name: "Near Convenience Store", icon: "ShoppingBag", description: "24/7 store (7-Eleven / AlfaMart) nearby." },
    { type: AttributeType.AMENITY, subGroupKey: "STORES", name: "Near Carinderia / Eatery", icon: "Utensils", description: "Affordable student dining nearby." },
    { type: AttributeType.AMENITY, subGroupKey: "STORES", name: "Near Water Refilling Station", icon: "Droplets", description: "Purified drinking water station nearby." },

    // B. WIFI Sub-Group
    { type: AttributeType.AMENITY, subGroupKey: "WIFI", name: "Fiber WiFi", icon: "Wifi", description: "High-speed unlimited fiber internet connection on property." },
    { type: AttributeType.AMENITY, subGroupKey: "WIFI", name: "Wireless / Prepaid WiFi", icon: "Wifi", description: "Wireless broadband or prepaid internet connection on property." },

    // C. POWER_WATER Sub-Group
    { type: AttributeType.AMENITY, subGroupKey: "POWER_WATER", name: "Backup Generator", icon: "Zap", description: "Emergency power generator supply for brownouts." },
    { type: AttributeType.AMENITY, subGroupKey: "POWER_WATER", name: "Overhead Water Tank", icon: "Database", description: "Elevated water storage tank for continuous supply." },
    { type: AttributeType.AMENITY, subGroupKey: "POWER_WATER", name: "Electric Water Pump", icon: "Activity", description: "Booster pump for low water pressure hours." },
    { type: AttributeType.AMENITY, subGroupKey: "POWER_WATER", name: "Deep Well (Poso)", icon: "Droplet", description: "Auxiliary deep well water source." },

    // D. PARKING Sub-Group
    { type: AttributeType.AMENITY, subGroupKey: "PARKING", name: "Car Parking Slot", icon: "Car", description: "Designated parking space for automobiles." },
    { type: AttributeType.AMENITY, subGroupKey: "PARKING", name: "Private Covered Garage", icon: "Warehouse", description: "Secure, weather-protected covered garage." },
    { type: AttributeType.AMENITY, subGroupKey: "PARKING", name: "Motorcycle Parking", icon: "Bike", description: "Fenced or covered parking for motorcycles." },
    { type: AttributeType.AMENITY, subGroupKey: "PARKING", name: "Bicycle Rack", icon: "CircleDot", description: "Dedicated rack for bicycles." },

    // E. LAUNDRY Sub-Group
    { type: AttributeType.AMENITY, subGroupKey: "LAUNDRY", name: "Washing Machine", icon: "WashingMachine", description: "Laundry washing machine available for boarders.", propertyTypeNames: ["Boarding House", "Dormitory"] },
    { type: AttributeType.AMENITY, subGroupKey: "LAUNDRY", name: "Laundry Drying Area (Sampayan)", icon: "Sun", description: "Covered outdoor clothesline.", propertyTypeNames: ["Boarding House", "Dormitory"] },

    // F. STUDY_LOUNGE Sub-Group
    { type: AttributeType.AMENITY, subGroupKey: "STUDY_LOUNGE", name: "Common Study Hall", icon: "BookOpen", description: "Quiet room with desks and power sockets for group reviews.", isUniversal: false, propertyTypeNames: ["Boarding House", "Dormitory"] },
    { type: AttributeType.AMENITY, subGroupKey: "STUDY_LOUNGE", name: "Common Student Lounge & Sofa Set", icon: "Sofa", description: "Shared living room space with couches & TV for boarders.", isUniversal: false, propertyTypeNames: ["Boarding House", "Dormitory"] },
    { type: AttributeType.AMENITY, subGroupKey: "STUDY_LOUNGE", name: "Shared Dining Area & Table Set", icon: "Utensils", description: "Communal dining table space next to common kitchen for meals.", isUniversal: false, propertyTypeNames: ["Boarding House", "Dormitory"] },
    { type: AttributeType.AMENITY, subGroupKey: "STUDY_LOUNGE", name: "Drinking Water Dispenser", icon: "Droplet", description: "Purified drinking water dispenser onsite.", isUniversal: false, propertyTypeNames: ["Boarding House", "Dormitory"] },

    // G. CARETAKER Sub-Group
    { type: AttributeType.AMENITY, subGroupKey: "CARETAKER", name: "Resident Caretaker Onsite", icon: "UserCheck", description: "Manager living on the property.", isUniversal: true },
    { type: AttributeType.AMENITY, subGroupKey: "CARETAKER", name: "Regular Common Area Housekeeping", icon: "Sparkles", description: "Scheduled cleaning of shared hallways & restrooms.", isUniversal: true },
    { type: AttributeType.AMENITY, subGroupKey: "CARETAKER", name: "Onsite Maintenance & Repairs", icon: "Wrench", description: "Quick repair staff available for fixes.", isUniversal: true },

    // H. GARDEN Sub-Group (Outdoor Spaces)
    { type: AttributeType.AMENITY, subGroupKey: "GARDEN", setupContext: "IN_UNIT", name: "Private Balcony", icon: "Wind", description: "Outdoor balcony space for the unit.", isUniversal: false, propertyTypeNames: ["Apartment", "Transient House", "Agri-Hostel"] },
    { type: AttributeType.AMENITY, subGroupKey: "GARDEN", setupContext: "IN_UNIT", name: "Private Veranda / Terrace", icon: "Home", description: "Ground-floor covered outdoor porch or patio area.", isUniversal: false, propertyTypeNames: ["Apartment", "Transient House", "Agri-Hostel"] },
    { type: AttributeType.AMENITY, subGroupKey: "GARDEN", setupContext: "IN_UNIT", name: "Private Roof Deck", icon: "Sun", description: "Rooftop deck area for relaxing or drying clothes.", isUniversal: false, propertyTypeNames: ["Apartment", "Transient House", "Agri-Hostel"] },
    { type: AttributeType.AMENITY, subGroupKey: "GARDEN", setupContext: "IN_UNIT", name: "Private Garden / Yard", icon: "Trees", description: "Private outdoor green garden or fenced yard space.", isUniversal: false, propertyTypeNames: ["Apartment", "Transient House", "Agri-Hostel"] },

    // I. KITCHEN_APP Sub-Group (In-Unit Private Kitchenette vs Shared Common Kitchen)
    // 1. Universal Kitchen Features
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "KITCHEN_APP", setupContext: "IN_UNIT", isUniversal: true, name: "Kitchen Sink", icon: "UtensilsCrossed", description: "Private food prep and dishwashing sink inside unit." },
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "KITCHEN_APP", setupContext: "IN_UNIT", isUniversal: true, name: "Cooking Stove Provided", icon: "Flame", description: "Gas stove, electric burner, or induction cooker included." },

    // 2. Boarding House & Dormitory In-Unit Kitchen Features
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "KITCHEN_APP", setupContext: "IN_UNIT", isUniversal: false, propertyTypeNames: ["Boarding House", "Dormitory"], name: "Personal Refrigerator", icon: "Refrigerator", description: "Dedicated refrigerator inside room or unit." },
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "KITCHEN_APP", setupContext: "IN_UNIT", isUniversal: false, propertyTypeNames: ["Boarding House", "Dormitory"], name: "Personal Microwave", icon: "Microwave", description: "Microwave oven inside room or unit." },
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "KITCHEN_APP", setupContext: "IN_UNIT", isUniversal: false, propertyTypeNames: ["Boarding House", "Dormitory"], name: "Personal Electric Kettle", icon: "Coffee", description: "Electric kettle for hot drinking water & coffee." },
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "KITCHEN_APP", setupContext: "IN_UNIT", isUniversal: false, propertyTypeNames: ["Boarding House", "Dormitory"], name: "Rice Cooker Provided", icon: "CookingPot", description: "Electric rice cooker included in unit." },
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "KITCHEN_APP", setupContext: "IN_UNIT", isUniversal: false, propertyTypeNames: ["Boarding House", "Dormitory"], name: "Complete Utensils & Dishware Provided", icon: "Utensils", description: "Plates, cups, cutlery, pots, and pans included." },
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "KITCHEN_APP", setupContext: "IN_UNIT", isUniversal: false, propertyTypeNames: ["Boarding House", "Dormitory"], name: "Dish Drying Rack", icon: "Grid", description: "Countertop or wall-mounted dish drying rack." },

    // 3. Apartment, Transient House & Agri-Hostel In-Unit Kitchen Features
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "KITCHEN_APP", setupContext: "IN_UNIT", isUniversal: false, propertyTypeNames: ["Apartment", "Transient House", "Agri-Hostel"], name: "Full Refrigerator Provided", icon: "Refrigerator", description: "Full-sized refrigerator provided in apartment kitchenette." },
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "KITCHEN_APP", setupContext: "IN_UNIT", isUniversal: false, propertyTypeNames: ["Apartment", "Transient House", "Agri-Hostel"], name: "Microwave Oven Provided", icon: "Microwave", description: "Microwave oven provided for heating meals inside apartment." },
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "KITCHEN_APP", setupContext: "IN_UNIT", isUniversal: false, propertyTypeNames: ["Apartment", "Transient House", "Agri-Hostel"], name: "Electric Kettle & Coffee Station", icon: "Coffee", description: "Hot water kettle and beverage station provided." },
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "KITCHEN_APP", setupContext: "IN_UNIT", isUniversal: false, propertyTypeNames: ["Apartment", "Transient House", "Agri-Hostel"], name: "Electric Rice Cooker Included", icon: "CookingPot", description: "Dedicated rice cooker provided for guest use." },
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "KITCHEN_APP", setupContext: "IN_UNIT", isUniversal: false, propertyTypeNames: ["Apartment", "Transient House", "Agri-Hostel"], name: "Full Kitchen Cookware & Utensils", icon: "Utensils", description: "Complete set of cookware, cutlery, and dishware." },

    // 4. Shared Common Kitchen Features
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "KITCHEN_APP", setupContext: "SHARED", isUniversal: true, name: "Shared Kitchen Sink", icon: "UtensilsCrossed", description: "Communal food prep and dishwashing sink in shared area." },
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "KITCHEN_APP", setupContext: "SHARED", isUniversal: true, name: "Shared Cooking Stove", icon: "Flame", description: "Stove available in ground floor common kitchen." },
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "KITCHEN_APP", setupContext: "SHARED", isUniversal: true, name: "Shared Refrigerator", icon: "Refrigerator", description: "Communal refrigerator in hallway or shared kitchen." },
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "KITCHEN_APP", setupContext: "SHARED", isUniversal: true, name: "Shared Microwave", icon: "Microwave", description: "Common microwave oven for resident use." },
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "KITCHEN_APP", setupContext: "SHARED", isUniversal: true, name: "Shared Electric Kettle", icon: "Coffee", description: "Hot water kettle in common kitchen area." },
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "KITCHEN_APP", setupContext: "SHARED", isUniversal: true, name: "Shared Rice Cooker", icon: "CookingPot", description: "Communal electric rice cooker for resident use." },
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "KITCHEN_APP", setupContext: "SHARED", isUniversal: true, name: "Shared Utensils & Cookware", icon: "Utensils", description: "Communal pots, frying pans, and cooking utensils." },
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "KITCHEN_APP", setupContext: "SHARED", isUniversal: true, name: "Shared Dish Drying Rack", icon: "Grid", description: "Communal dish drying rack and utensil storage." },

    // J. BATHROOM_FIX Sub-Group (Private En Suite CR vs Common Hallway CR)
    // 1. Private CR Fixtures
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "BATHROOM_FIX", setupContext: "PRIVATE", isUniversal: true, name: "Hot & Cold Shower Heater", icon: "ShowerHead", description: "Instant electric shower heater installed inside private CR." },
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "BATHROOM_FIX", setupContext: "PRIVATE", isUniversal: true, name: "Toilet Bidet", icon: "Droplets", description: "Handheld bidet sprayer attachment inside private CR." },
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "BATHROOM_FIX", setupContext: "PRIVATE", isUniversal: true, name: "Exhaust Fan", icon: "Wind", description: "Mechanical exhaust fan for moisture & ventilation inside private CR." },
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "BATHROOM_FIX", setupContext: "PRIVATE", isUniversal: true, name: "Flush Toilet Bowl", icon: "CheckCircle", description: "Standard water flush toilet bowl inside private CR." },
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "BATHROOM_FIX", setupContext: "PRIVATE", isUniversal: true, name: "Water Storage Drum & Tabo", icon: "Database", description: "Backup water storage barrel with dipper inside private CR." },
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "BATHROOM_FIX", setupContext: "PRIVATE", isUniversal: true, name: "Bathroom Mirror & Vanity Sink", icon: "Grid", description: "Wall mirror with washbasin sink counter inside private CR." },

    // 2. Common Hallway CR Fixtures
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "BATHROOM_FIX", setupContext: "COMMON_CR", isUniversal: true, name: "Shared Shower Heater", icon: "ShowerHead", description: "Hot & cold shower heater installed in common hallway CR." },
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "BATHROOM_FIX", setupContext: "COMMON_CR", isUniversal: true, name: "Shared Toilet Bidet", icon: "Droplets", description: "Bidet sprayer available in common hallway CR." },
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "BATHROOM_FIX", setupContext: "COMMON_CR", isUniversal: true, name: "Shared Exhaust Fan", icon: "Wind", description: "Mechanical ventilation fan in common hallway CR." },
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "BATHROOM_FIX", setupContext: "COMMON_CR", isUniversal: true, name: "Shared Water Storage Drum & Tabo", icon: "Database", description: "Communal water barrel with dipper for backup." },
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "BATHROOM_FIX", setupContext: "COMMON_CR", isUniversal: true, name: "Regular Common CR Housekeeping", icon: "Sparkles", description: "Daily scheduled cleaning & sanitation of shared CR." },

    // K. COOLING Sub-Group
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "COOLING", name: "Window Type AC", icon: "Wind", description: "Window-mounted air conditioner." },
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "COOLING", name: "Split Type AC", icon: "Fan", description: "Wall-mounted split system AC." },
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "COOLING", name: "Inverter AC", icon: "Zap", description: "Energy-efficient inverter air conditioner." },
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "COOLING", name: "Ceiling Fan", icon: "Fan", description: "Mounted ceiling fan." },
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "COOLING", name: "Stand Fan", icon: "Wind", description: "Portable floor electric standing fan provided." },
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "COOLING", name: "Wall Fan", icon: "Fan", description: "Wall-mounted electric fan provided." },

    // L. FURNITURE Sub-Group
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "FURNITURE", name: "Study Desk", icon: "Laptop", description: "Private desk for studying." },
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "FURNITURE", name: "Study Chair", icon: "User", description: "Chair provided for the study desk." },
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "FURNITURE", name: "Lockable Closet", icon: "Archive", description: "Lockable wardrobe for clothes and belongings." },
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "FURNITURE", name: "Storage Cabinet", icon: "Square", description: "Cabinet or shelving for personal items." },
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "FURNITURE", name: "Curtains", icon: "Blinds", description: "Fabric window coverings for shade and privacy." },
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "FURNITURE", name: "Window Blinds", icon: "Blinds", description: "Adjustable horizontal or vertical blinds." },
    { type: AttributeType.ROOM_AMENITY, subGroupKey: "FURNITURE", name: "Mosquito Window Screen", icon: "Shield", description: "Wire mesh screen on windows." },

    // M. RULES & SECURITY Sub-Groups
    { type: AttributeType.RULE, subGroupKey: "GENDER_POLICY", name: "Female-Only Property", icon: "UserX", description: "Restricted strictly to female boarders." },
    { type: AttributeType.RULE, subGroupKey: "GENDER_POLICY", name: "Male-Only Property", icon: "UserX", description: "Restricted strictly to male boarders." },
    { type: AttributeType.RULE, subGroupKey: "GENDER_POLICY", name: "Male & Female Allowed (Mixed)", icon: "Users", description: "Open to both male and female boarders." },

    { type: AttributeType.RULE, subGroupKey: "CURFEW", name: "24/7 Open Gate Access (No Curfew)", icon: "Clock", description: "Entry permitted at any time via key/RFID." },
    { type: AttributeType.RULE, subGroupKey: "CURFEW", name: "Night Curfew Enforced (10:00 PM)", icon: "Lock", description: "Main gate locked at 10:00 PM." },
    { type: AttributeType.RULE, subGroupKey: "CURFEW", name: "Early Night Curfew Enforced (9:00 PM)", icon: "Lock", description: "Main gate locked at 9:00 PM." },
    { type: AttributeType.RULE, subGroupKey: "CURFEW", name: "Strict Curfew with Gate Lock (8:00 PM)", icon: "Lock", description: "Main gate locked early at 8:00 PM for maximum security." },
    { type: AttributeType.RULE, subGroupKey: "CURFEW", name: "Quiet Hours Enforced (10:00 PM - 6:00 AM)", icon: "VolumeX", description: "Quiet study environment strictly enforced late night." },

    { type: AttributeType.RULE, subGroupKey: "VISITOR_POLICY", name: "Visitors Allowed", icon: "Users", description: "Outside guests permitted on property during day hours." },
    { type: AttributeType.RULE, subGroupKey: "VISITOR_POLICY", name: "Male Guests Restricted from Female Rooms", icon: "AlertTriangle", description: "Male guests restricted from female bedrooms." },
    { type: AttributeType.RULE, subGroupKey: "VISITOR_POLICY", name: "Strictly No Outside Visitors", icon: "UserX", description: "Outside guests prohibited past main gate." },

    { type: AttributeType.RULE, subGroupKey: "PET_POLICY", name: "Pets Allowed", icon: "PawPrint", description: "Allows pets on property with landlord permission." },
    { type: AttributeType.RULE, subGroupKey: "PET_POLICY", name: "No Pets Allowed", icon: "Ban", description: "Strictly no pets permitted inside room or premises." },

    { type: AttributeType.RULE, subGroupKey: "SMOKING_POLICY", name: "Strictly No Smoking / Vaping", icon: "Ban", description: "Strict non-smoking policy inside rooms, balconies, and indoor areas." },
    { type: AttributeType.RULE, subGroupKey: "SMOKING_POLICY", name: "Smoking Allowed in Designated Areas", icon: "Flame", description: "Smoking permitted strictly in designated outdoor smoking areas." },

    { type: AttributeType.RULE, subGroupKey: "ALCOHOL_POLICY", name: "Strictly No Alcohol / Drinking Allowed", icon: "Ban", description: "Alcoholic beverages prohibited on property grounds." },
    { type: AttributeType.RULE, subGroupKey: "ALCOHOL_POLICY", name: "Moderate Alcohol / Drinking Allowed", icon: "Wine", description: "Moderate alcohol consumption permitted inside private units." },

    { type: AttributeType.FEATURE, subGroupKey: "SECURITY", name: "CCTV Cameras", icon: "Camera", description: "Surveillance cameras installed on property common areas." },
    { type: AttributeType.FEATURE, subGroupKey: "SECURITY", name: "24/7 Security Guard", icon: "Shield", description: "Uniformed guard on duty." },
    { type: AttributeType.FEATURE, subGroupKey: "SECURITY", name: "RFID Keycard Gate Access", icon: "CreditCard", description: "Electronic RFID card or key fob entry at main gate." },
    { type: AttributeType.FEATURE, subGroupKey: "SECURITY", name: "RFID Keycard Door Lock", icon: "KeyRound", description: "Electronic RFID smart keycard lock on main unit/bedroom door." },
    { type: AttributeType.FEATURE, subGroupKey: "SECURITY", name: "Biometric Main Door Access", icon: "Fingerprint", description: "Fingerprint scanner entry at main entrance or lobby door." },

    { type: AttributeType.FEATURE, subGroupKey: "DISASTER_PREP", name: "Flood-Free Area", icon: "ShieldCheck", description: "Located on high ground not prone to typhoon flooding." },
    { type: AttributeType.FEATURE, subGroupKey: "DISASTER_PREP", name: "Fire Extinguisher Provided", icon: "Flame", description: "Accessible fire extinguishers." },
    { type: AttributeType.FEATURE, subGroupKey: "DISASTER_PREP", name: "Emergency Hallway Light", icon: "Sun", description: "Battery backup lights for blackouts." },
    { type: AttributeType.FEATURE, subGroupKey: "DISASTER_PREP", name: "Smoke Detector Installed", icon: "AlertCircle", description: "In-room or hallway smoke alarms." },
    { type: AttributeType.FEATURE, subGroupKey: "DISASTER_PREP", name: "First Aid Kit Available", icon: "Cross", description: "Emergency medical supplies on site." },
  ];

  for (const attr of attributes) {
    const isUniv = (attr as any).isUniversal ?? ((attr as any).propertyTypeNames && (attr as any).propertyTypeNames.length > 0 ? false : true);

    await prisma.dynamicAttribute.upsert({
      where: { name: attr.name },
      update: {
        icon: attr.icon,
        description: attr.description,
        subGroupKey: attr.subGroupKey || null,
        setupContext: attr.setupContext || null,
        isUniversal: isUniv,
        isActive: true,
      } as any,
      create: {
        name: attr.name,
        icon: attr.icon,
        type: attr.type,
        subGroupKey: attr.subGroupKey || null,
        setupContext: attr.setupContext || null,
        description: attr.description,
        isUniversal: isUniv,
        isActive: true,
      } as any,
    });
  }

  console.log("   ✓ Dynamic Attributes seeded & mapped to Sub-Groups.");

  const propertyTypes = [
    {
      name: "Apartment",
      description: "Self-contained whole-unit rentals.",
      icon: "Building",
      roomTypes: [
        {
          name: "Studio Unit", icon: "Square", description: "A single open-space unit with private bathroom (CR).", isFlatRate: true,
          bedSetups: [
            { code: "SINGLE", name: "Single Bed Frame", description: "Standard single bed frame", paxCapacity: 1 },
            { code: "DOUBLE", name: "Double Bed Frame", description: "Full double size bed frame", paxCapacity: 1 },
            { code: "QUEEN", name: "Queen Size Bed Frame", description: "Spacious queen mattress frame", paxCapacity: 1 }
          ]
        },
        {
          name: "1-Bedroom Unit", icon: "DoorClosed", description: "A complete unit with 1 private bedroom, living area, and private CR.", isFlatRate: true,
          bedSetups: [
            { code: "SINGLE", name: "Single Bed Frame", description: "Standard single bed frame", paxCapacity: 1 },
            { code: "DOUBLE", name: "Double Bed Frame", description: "Full double size bed frame", paxCapacity: 1 },
            { code: "QUEEN", name: "Queen Size Bed Frame", description: "Spacious queen mattress frame", paxCapacity: 1 }
          ]
        },
        {
          name: "2-Bedroom Unit", icon: "DoorOpen", description: "A spacious unit with 2 private bedrooms, living area, and private CR.", isFlatRate: true,
          bedSetups: [
            { code: "SINGLE", name: "Single Bed Frames", description: "Single beds per room", paxCapacity: 2 },
            { code: "DOUBLE", name: "Double Bed Frames", description: "Double beds per room", paxCapacity: 2 }
          ]
        },
        {
          name: "Whole House", icon: "Home", description: "An entire multi-room house leased as a whole unit.", isFlatRate: true,
          bedSetups: [
            { code: "SINGLE", name: "Single Bed Frames", description: "Single beds layout", paxCapacity: 4 },
            { code: "DOUBLE", name: "Double Bed Frames", description: "Double beds layout", paxCapacity: 4 }
          ]
        },
      ]
    },
    {
      name: "Transient House",
      description: "Short-term daily/weekly whole unit stays for guests and visitors.",
      icon: "MapPin",
      roomTypes: [
        {
          name: "Transient Room", icon: "MapPin", description: "A private air-conditioned bedroom rented per day or night.", isFlatRate: true,
          bedSetups: [
            { code: "SINGLE", name: "Single Bed Frame", description: "1-pax transient bed", paxCapacity: 1 },
            { code: "DOUBLE", name: "Double Bed Frame", description: "2-pax transient bed", paxCapacity: 2 }
          ]
        },
        {
          name: "Whole House", icon: "Home", description: "An entire house leased per day or night for visiting families.", isFlatRate: true,
          bedSetups: [
            { code: "SINGLE", name: "Single Bed Frames", description: "Single beds layout", paxCapacity: 6 },
            { code: "DOUBLE", name: "Double Bed Frames", description: "Double beds layout", paxCapacity: 6 }
          ]
        },
      ]
    },
    {
      name: "Agri-Hostel",
      description: "Dedicated lodge/flat-rate rooms for visiting researchers and guests.",
      icon: "Sprout",
      roomTypes: [
        {
          name: "Hostel Suite", icon: "Hotel", description: "A hotel-style private room with private CR and study desk.", isFlatRate: true,
          bedSetups: [
            { code: "SINGLE", name: "Single Bed Frame", description: "Single suite bed", paxCapacity: 1 },
            { code: "DOUBLE", name: "Double Bed Frame", description: "Double suite bed", paxCapacity: 1 }
          ]
        },
        {
          name: "Hostel Group Suite", icon: "Building2", description: "A multi-bed room equipped for student delegation groups.", isFlatRate: true,
          bedSetups: [
            { code: "BUNK", name: "Bunk Bed Frames", description: "Multi-deck bunk beds for group reviewees", paxCapacity: 4 }
          ]
        },
      ]
    },
    {
      name: "Boarding House",
      description: "Traditional student housing with shared facilities.",
      icon: "Home",
      roomTypes: [
        {
          name: "Solo Room", icon: "User", description: "A private single-occupant bedroom. Entire room to yourself.", isFlatRate: false,
          bedSetups: [
            { code: "SINGLE", name: "Single Bed Frame", description: "Private 1-pax single mattress frame", paxCapacity: 1 },
            { code: "DOUBLE", name: "Double Bed Frame", description: "Spacious double mattress frame", paxCapacity: 1 },
            { code: "QUEEN", name: "Queen Size Bed Frame", description: "Deluxe queen size mattress frame", paxCapacity: 1 }
          ]
        },
        {
          name: "Bedspace", icon: "Users", description: "A single bed slot inside a shared room. Pay per head.", isFlatRate: false,
          bedSetups: [
            { code: "BUNK", name: "Bunk Bed (Double Deck)", description: "Lower or upper bunk slot in shared room", paxCapacity: 1 },
            { code: "SINGLE", name: "Single Bed Frame", description: "Standalone single bed slot in shared room", paxCapacity: 1 }
          ]
        }
      ]
    },
    {
      name: "Dormitory",
      description: "Institutional multi-bed residence with caretakers and strict rules.",
      icon: "Layers",
      roomTypes: [
        {
          name: "Bedspace", icon: "Users", description: "A single bed slot inside a shared room. Pay per head.", isFlatRate: false,
          bedSetups: [
            { code: "BUNK", name: "Bunk Bed (Double Deck)", description: "Standard dormitory bunk slot", paxCapacity: 1 },
            { code: "SINGLE", name: "Single Bed Frame", description: "Single bed slot in dormitory room", paxCapacity: 1 }
          ]
        },
        {
          name: "Solo Room", icon: "User", description: "A private single-occupant bedroom inside a dormitory.", isFlatRate: false,
          bedSetups: [
            { code: "SINGLE", name: "Single Bed Frame", description: "Private dormitory single bed", paxCapacity: 1 }
          ]
        }
      ]
    }
  ];

  for (const pt of propertyTypes) {
    const propertyType = await prisma.propertyType.upsert({
      where: { name: pt.name },
      update: { description: pt.description, icon: pt.icon },
      create: { name: pt.name, description: pt.description, icon: pt.icon, isActive: true },
    });

    const validNames = pt.roomTypes.map(r => r.name);
    await prisma.roomTypeDefinition.deleteMany({
      where: {
        propertyTypeId: propertyType.id,
        name: { notIn: validNames }
      }
    });

    for (const rt of pt.roomTypes) {
      let roomTypeDef = await prisma.roomTypeDefinition.findFirst({
        where: { name: rt.name, propertyTypeId: propertyType.id }
      });

      if (!roomTypeDef) {
        roomTypeDef = await prisma.roomTypeDefinition.create({
          data: {
            name: rt.name,
            description: rt.description,
            icon: rt.icon,
            isFlatRate: rt.isFlatRate,
            propertyTypeId: propertyType.id,
            isActive: true
          }
        });
      } else {
        roomTypeDef = await prisma.roomTypeDefinition.update({
          where: { id: roomTypeDef.id },
          data: {
            description: rt.description,
            icon: rt.icon,
            isFlatRate: rt.isFlatRate
          }
        });
      }

      // Seed BedSetupDefinition for this RoomTypeDefinition
      if (rt.bedSetups && rt.bedSetups.length > 0) {
        for (const bs of rt.bedSetups) {
          const existingBs = await (prisma as any).bedSetupDefinition.findFirst({
            where: { roomTypeDefinitionId: roomTypeDef.id, code: bs.code }
          });

          if (!existingBs) {
            await (prisma as any).bedSetupDefinition.create({
              data: {
                roomTypeDefinitionId: roomTypeDef.id,
                code: bs.code,
                name: bs.name,
                description: bs.description,
                paxCapacity: bs.paxCapacity,
                isActive: true
              }
            });
          } else {
            await (prisma as any).bedSetupDefinition.update({
              where: { id: existingBs.id },
              data: {
                name: bs.name,
                description: bs.description,
                paxCapacity: bs.paxCapacity
              }
            });
          }
        }
      }
    }
  }
  console.log("   ✓ Property Types, Room Definitions & Bed Setups seeded.");

  const colleges = [
    {
      name: "Tarlac Agricultural University",
      code: "TAU",
      latitude: 15.63520626192894,
      longitude: 120.41535299194243,
      logoUrl: "/Tarlac_Agricultural_University_logo.png",
      order: 1
    },
    {
      name: "TAU - College of Business and Management",
      code: "CBM",
      latitude: 15.63461795280764,
      longitude: 120.41567086580349,
      logoUrl: "/college/cbm.png",
      order: 2
    },
    {
      name: "TAU - College of Veterinary Medicine",
      code: "CVM",
      latitude: 15.635028716210334,
      longitude: 120.41628249139907,
      logoUrl: "/college/cvm.png",
      order: 3
    },
    {
      name: "TAU - College of Veterinary Medicine Annex Bldg.",
      code: "CVM-ANNEX",
      latitude: 15.639998015097824,
      longitude: 120.41934082293733,
      logoUrl: "/college/cvm.png",
      order: 4
    },
    {
      name: "TAU - College of Agriculture and Forestry",
      code: "CAF",
      latitude: 15.63569585241726,
      longitude: 120.41685698462895,
      logoUrl: "/college/caf.png",
      order: 5
    },
    {
      name: "TAU - College of Arts and Sciences",
      code: "CAS",
      latitude: 15.638562886162745,
      longitude: 120.41822900959417,
      logoUrl: "/college/cas.png",
      order: 6
    },
    {
      name: "TAU - College of Engineering and Technology",
      code: "CET",
      latitude: 15.638728853967065,
      longitude: 120.41939489284083,
      logoUrl: "/college/cet.png",
      order: 7
    },
    {
      name: "TAU - Laboratory High School",
      code: "LHS",
      latitude: 15.639259299202225,
      longitude: 120.4208514021004,
      logoUrl: "/college/TAU - Laboratory High School.jpg",
      order: 8
    },
    {
      name: "TAU - College of Education",
      code: "CED",
      latitude: 15.639880862094044,
      longitude: 120.42109471686494,
      logoUrl: "/college/coed.png",
      order: 9
    }
  ];

  for (const col of colleges) {
    await prisma.campusCollege.upsert({
      where: { code: col.code },
      update: {
        name: col.name,
        latitude: col.latitude,
        longitude: col.longitude,
        logoUrl: col.logoUrl,
        order: col.order,
        isActive: true
      },
      create: {
        name: col.name,
        code: col.code,
        latitude: col.latitude,
        longitude: col.longitude,
        logoUrl: col.logoUrl,
        order: col.order,
        isActive: true
      }
    });
  }
  console.log("   ✓ All 9 TAU Campus Colleges & Landmarks seeded.");

  const allDbPropTypes = await prisma.propertyType.findMany();
  const propTypeMap = new Map(allDbPropTypes.map(pt => [pt.name, pt.id]));

  for (const attr of attributes) {
    let typeIds: string[] = [];
    if ((attr as any).propertyTypeNames && (attr as any).propertyTypeNames.length > 0) {
      typeIds = (attr as any).propertyTypeNames.map((name: string) => propTypeMap.get(name)).filter(Boolean) as string[];
    }
    const isUniv = (attr as any).isUniversal ?? (typeIds.length > 0 ? false : true);

    await prisma.dynamicAttribute.updateMany({
      where: { name: attr.name },
      data: { 
        propertyTypeIds: typeIds,
        isUniversal: isUniv
      }
    });
  }

  console.log("   ✓ Linked dynamic attribute propertyTypeIds.");
}
