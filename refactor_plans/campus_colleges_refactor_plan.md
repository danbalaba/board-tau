# Dynamic Campus Colleges & Landmarks Refactor Plan

## 1. Rationale & Architectural Goal
University colleges and campus landmarks are dynamically stored in the database (`CampusCollege` model) and seeded with exact GPS coordinates and college logo image assets.

---

## 🗺️ Master 9 TAU Campus Colleges & Landmarks Reference Table

| Order | Code | Name | Latitude | Longitude | Logo Image Asset Path |
| :---: | :---: | :--- | :---: | :---: | :--- |
| 1 | **TAU** | Tarlac Agricultural University | `15.635206` | `120.415353` | `/Tarlac_Agricultural_University_logo.png` |
| 2 | **CBM** | TAU - College of Business and Management | `15.634618` | `120.415671` | `/college/cbm.png` |
| 3 | **CVM** | TAU - College of Veterinary Medicine | `15.635029` | `120.416282` | `/college/cvm.png` |
| 4 | **CVM-ANNEX** | TAU - College of Veterinary Medicine Annex Bldg. | `15.639998` | `120.419341` | `/college/cvm.png` |
| 5 | **CAF** | TAU - College of Agriculture and Forestry | `15.635696` | `120.416857` | `/college/caf.png` |
| 6 | **CAS** | TAU - College of Arts and Sciences | `15.638563` | `120.418229` | `/college/cas.png` |
| 7 | **CET** | TAU - College of Engineering and Technology | `15.638729` | `120.419395` | `/college/cet.png` |
| 8 | **LHS** | TAU - Laboratory High School | `15.639259` | `120.420851` | `/college/TAU - Laboratory High School.jpg` |
| 9 | **CED** | TAU - College of Education | `15.639881` | `120.421095` | `/college/coed.png` |

---

## 2. Database Schema Model (`prisma/schema.prisma`)

```prisma
model CampusCollege {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  name        String   @unique
  code        String   @unique
  latitude    Float
  longitude   Float
  logoUrl     String?
  isActive    Boolean  @default(true)
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([isActive])
}
```

---

## 3. Seed Implementation (`prisma/seeds/1_taxonomy.ts`)
The seed script upserts all 9 colleges using their unique `code` identifier, ensuring exact lat/lng coordinates and logo image links are populated on database initialization.
