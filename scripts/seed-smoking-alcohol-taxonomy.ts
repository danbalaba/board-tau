import { PrismaClient, AttributeType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Seeding Smoking & Alcohol Policy Taxonomy into MongoDB...");

  const subGroups = [
    {
      type: AttributeType.RULE,
      key: "SMOKING_POLICY",
      title: "Step 8-5: Property Smoking & Vaping Policy",
      subtitle: "Select smoking and vaping allowance rules",
      tabLabel: "Smoking Policy",
      displayOrder: 5,
    },
    {
      type: AttributeType.RULE,
      key: "ALCOHOL_POLICY",
      title: "Step 8-6: Alcohol & Drinking Policy",
      subtitle: "Select alcoholic beverage allowance rules",
      tabLabel: "Alcohol Policy",
      displayOrder: 6,
    },
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
    console.log(`   ✓ AttributeSubGroup '${sg.key}' upserted.`);
  }

  const attributes = [
    {
      type: AttributeType.RULE,
      subGroupKey: "SMOKING_POLICY",
      name: "Strictly No Smoking / Vaping",
      icon: "Ban",
      description: "Strict non-smoking policy inside rooms, balconies, and indoor areas.",
    },
    {
      type: AttributeType.RULE,
      subGroupKey: "SMOKING_POLICY",
      name: "Smoking Allowed in Designated Areas",
      icon: "Flame",
      description: "Smoking permitted strictly in designated outdoor smoking areas.",
    },
    {
      type: AttributeType.RULE,
      subGroupKey: "ALCOHOL_POLICY",
      name: "Strictly No Alcohol / Drinking Allowed",
      icon: "Ban",
      description: "Alcoholic beverages prohibited on property grounds.",
    },
    {
      type: AttributeType.RULE,
      subGroupKey: "ALCOHOL_POLICY",
      name: "Moderate Alcohol / Drinking Allowed",
      icon: "Wine",
      description: "Moderate alcohol consumption permitted inside private units.",
    },
  ];

  for (const attr of attributes) {
    const existing = await (prisma as any).dynamicAttribute.findFirst({
      where: {
        subGroupKey: attr.subGroupKey,
        name: attr.name,
      },
    });

    if (existing) {
      await (prisma as any).dynamicAttribute.update({
        where: { id: existing.id },
        data: {
          type: attr.type,
          icon: attr.icon,
          description: attr.description,
          isActive: true,
          isUniversal: true,
        },
      });
      console.log(`   ✓ DynamicAttribute '${attr.name}' updated.`);
    } else {
      await (prisma as any).dynamicAttribute.create({
        data: {
          type: attr.type,
          subGroupKey: attr.subGroupKey,
          name: attr.name,
          icon: attr.icon,
          description: attr.description,
          isActive: true,
          isUniversal: true,
        },
      });
      console.log(`   ✓ DynamicAttribute '${attr.name}' created.`);
    }
  }

  // Deactivate legacy combined SMOKE_ALCOHOL subgroup and attributes
  await (prisma as any).attributeSubGroup.updateMany({
    where: { key: "SMOKE_ALCOHOL" },
    data: { isActive: false },
  });
  await (prisma as any).dynamicAttribute.updateMany({
    where: { subGroupKey: "SMOKE_ALCOHOL" },
    data: { isActive: false },
  });
  console.log("   ✓ Legacy 'SMOKE_ALCOHOL' sub-group and attributes deactivated.");

  console.log("✅ Smoking & Alcohol Policy Taxonomy successfully seeded into MongoDB!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding smoking & alcohol taxonomy:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
