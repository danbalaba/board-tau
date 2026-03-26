# BoardTAU: Complex Search & Filtering Implementation Plan

## 1. Context & Motivation
Currently, the BoardTAU project uses a robust frontend wizard (`SearchModal.tsx`) that generates dynamic URL search parameters. However, the backend logic to securely and efficiently process these complex parameters—including geospatial distance, room capacity, and dynamic user preferences—has not yet been implemented. Furthermore, forcing a "strict match" on every filter risks returning zero results to the user, creating a poor user experience.

To solve this, we are abandoning standard "CRUD" querying and implementing an Enterprise-Grade **Heuristic Scoring Algorithm**. This architecture separates parameters into **Hard Filters** (strict drop conditions) and **Soft Filters** (scoring multipliers), executed directly inside the MongoDB C++ engine via Prisma.

---

## 2. System Architecture Design (End-to-End)

The platform follows a modern, serverless architecture using Next.js App Router for state management and API routing, Prisma as the ORM, and MongoDB as the underlying search engine.

```mermaid
graph TD
    subgraph Frontend (React / Client)
        UI[SearchModal.tsx Wizard] -->|Updates State| State[react-hook-form]
        State -->|Serialization| URL[URL Query Params e.g., ?price=5000&cctv=true]
    end

    subgraph Controller (Next.js Server)
        URL -->|Intercepted on Navigation| ServerPage[app/page.tsx Server Component]
        ServerPage -->|Passes Params| Parser[searchUrlParser.ts]
    end

    subgraph Service Layer (Backend Logic)
        Parser --> Orchestrator[search.service.ts]
        Orchestrator -->|1| BuilderA[buildGeoNear Stage]
        Orchestrator -->|2| BuilderB[buildHardFilters Stage]
        Orchestrator -->|3| BuilderC[buildScoringEngine Stage]
        Orchestrator -->|4| BuilderD[buildSorter Stage]
    end

    subgraph Database Layer (MongoDB via Prisma)
        BuilderA & BuilderB & BuilderC & BuilderD -->|Constructs Pipeline| DBEngine[(MongoDB Engine C++)]
        DBEngine -->|Executes High-Speed Aggregation| DBEngine
    end

    subgraph Presentation (UI)
        DBEngine -->|Returns Sorted JSON| Render[ListingGrid.tsx]
    end
```

---

## 3. Input-Process-Output (IPO) Model

To ensure perfect clarity during implementation, here is the exact Input-Process-Output breakdown of the search feature.

### IPO: The Frontend Serialization
| Input | Process | Output |
| :--- | :--- | :--- |
| User interacts with UI (Slides budget to ₱5,000, checks "CCTV", selects "College of Business"). | `SearchModal.tsx` intercepts the form submission, serializes arrays into boolean query strings, looks up map coordinates for the college, and builds a Next.js `router.push()` action. | A dynamic URL containing the strict parameters: `/?college=business&originLat=15.634&originLng=120.415&maxPrice=5000&cctv=true` |

### IPO: The Backend Heuristic Query Builder
| Input | Process | Output |
| :--- | :--- | :--- |
| Parsed Dictionary object from the URL: `{ originLat: 15.634, originLng: 120.415, maxPrice: 5000, cctv: true }` | `search.service.ts` passes the parameters through modular builder functions (`buildHardFilters()`, `buildScoringEngine()`) to construct native MongoDB instructions. | A highly optimized MongoDB Aggregation Pipeline Array containing `$geoNear`, `$match`, `$addFields`, and `$sort` stages. |

### IPO: The Database Execution & Relevance Calculation
| Input | Process | Output |
| :--- | :--- | :--- |
| MongoDB Aggregation Pipeline Array. | **1. Elimination:** Database scans `2dsphere` index and drops listings > 5km away or with price > ₱5,000.<br>**2. Point Assignment:** Surviving listings start at 0. Add +10 if it has CCTV.<br>**3. Sorting:** B-Tree Engine sorts descending by Total Points. | Array of the Top 20 highest-scoring Boarding House JSON objects (e.g., `[{ id: "123", title: "TAU Dorm", matchScore: 45 }]`). |

---

## 4. The Heuristic Scoring Algorithm (The Math)

Artificial Intelligence is not required here because the user provides explicitly defined constraints.
Instead, we use a **Weighted Sum Model (WSM)** for exact deterministic precision.

```mermaid
flowchart LR
    Start([Raw Boarding Houses in DB]) --> Filter{Hard Filters Match?}
    
    Filter -->|No: price > budget| Drop([Removed from Results])
    Filter -->|No: out of 5km radius| Drop
    
    Filter -->|Yes| Score[Start Score at 0]
    
    Score --> C1{Has CCTV?}
    C1 -->|Yes| Add10[+10 Points] --> C2
    C1 -->|No| C2{Has 24/7 Security?}
    
    C2 -->|Yes| Add15[+15 Points] --> C3
    C2 -->|No| C3{Rating > 4.5?}
    
    C3 -->|Yes| AddScore[(Rating * 5) Points] --> FinalRank
    C3 -->|No| FinalRank[Calculate Total Points]
    
    FinalRank --> Sort[Sort Descending]
    Sort --> UI([Show to User])
```

---

## 5. Fallback Mechanism (Query Relaxation)
To prevent the dreaded "0 Results Found" screen when a user's Hard Filters are too strict:
1.  Run the Primary Pipeline (Strict Match).
2.  Check if `results.length === 0`.
3.  If true, the Backend creates a *Secondary Pipeline* (Relaxed Match). 
    *   *Action:* Delete the `maxPrice` limit and expand `distance` from 5km to 15km.
4.  Run the query again.
5.  Return results to UI with a flag: `isRelaxed: true`. 
6.  The Frontend detects this flag and renders: *"We couldn't find exact matches for your budget, but here are similar boarding houses slightly outside your constraints."*

---

## 6. Database Indexing Strategy (Performance)
To achieve O(log n) speeds, these indexes must be manually added to MongoDB via Prisma:
*   **Geospatial:** A `2dsphere` index on `location.coordinates`. (CRITICAL: without this, `$geoNear` will throw a fatal error).
*   **Compound:** `{ status: 1, price: 1 }` to instantly filter approved listings within budget.

---

## 7. Step-by-Step Implementation Checklist

### Phase 1: Code Clean-up (Anti-Spaghetti Refactoring)
- [ ] Create `utils/searchUrlBuilder.ts` to extract the 70+ lines of URL serialization logic out of `SearchModal.tsx`'s `onSubmit` function.
- [ ] Create a custom React hook `hooks/useSearchSummary.ts` to centralize the parsing of URL parameters.
- [ ] Refactor `SearchManager.tsx` and `Search.tsx` to use the new exact hook (Dry up the UI logic duplication).

### Phase 2: Database Preparation
- [ ] Update `prisma.schema` if necessary to ensure `location` is properly formatted for geospatial queries. (Requires GeoJSON format: `{ type: "Point", coordinates: [lng, lat] }`).
- [ ] Manually apply adding the `2dsphere` index via MongoDB Shell or Prisma migrations on the `Listing` collection.

### Phase 3: Backend Service Creation (`services/listing/search.service.ts`)
- [ ] Implement `buildGeoNear()` stage function.
- [ ] Implement `buildHardFilters()` stage function.
- [ ] Implement `buildScoringEngine()` stage function.
- [ ] Implement `buildSorter()` and `$limit` (Pagination) functions.
- [ ] Combine all stages into `executeComplexSearch()`.

### Phase 4: Query Relaxation (Zero Results Handler)
- [ ] Wrap `executeComplexSearch()` in a conditional block checking array length.
- [ ] If 0, execute a modified fallback pipeline and return `{ data: [...], relaxed: true }`.

### Phase 5: UI Integration
- [ ] Update `app/page.tsx` (Search Page) to await the new `executeComplexSearch()` backend service.
- [ ] Pass the returned data to the `<ListingGrid />` component.
- [ ] Add a conditional Yellow Warning Banner if `relaxed === true` to notify the user of the compromise.
