# 🛡️ BoardTAU Search Engine: Technical Defense Reference

This document provides a comprehensive technical breakdown of the **BoardTAU Search & Ranking Engine**. It is designed for IT/CS students and professors to understand the "under-the-hood" logic of the filtering system.

---

## 🏗️ 1. The Two-Tier Architecture
Unlike basic search bars, BoardTAU uses a **Hybrid Search Engine** that distinguishes between what a user *needs* and what a user *prefers*.

### Tier A: The Hard Filters (The Exclusion Logic)
*   **Purpose:** To strictly remove listings that do not match "Dealbreaker" criteria.
*   **Criteria:** Budget, Gender Rules (Female/Male Only), and **Primary Categories** (e.g., Quiet / Study Environment, Flexible Lease).
*   **Outcome:** If a listing fails a hard filter, it is **deleted** from the search results instantly.
*   **Implementation:** MongoDB `$match` and `$geoNear` stages.

### Tier B: Heuristic Scoring (The Ranking Logic)
*   **Purpose:** To "nudge" higher-quality, safer, or better-located listings to the top of the grid.
*   **Outcome:** These filters **never** hide a listing; they only determine its position (Order).
*   **Implementation:** MongoDB `$addFields` with weighted arithmetic.

---

## ⚙️ 2. The Step-by-Step Pipeline (Stage Analysis)

| Stage # | Technique | Function | Technical Reason |
| :--- | :--- | :--- | :--- |
| **0** | **$geoNear** | **Geospatial Proximity** | Uses a `2dsphere` index to calculate distance from the selected College Gate. It is Stage 1 because it's the most restrictive filter. |
| **1** | **Indexed Match** | **Status & Category** | Immediately prunes non-active listings or those in the wrong category (e.g. Quiet Environment) using **Multikey Indexes**. |
| **2** | **$lookup** | **Data Join** | Merges the `Listing` with its `Rooms`, `Rules`, and `Features`. In BoardTAU, we optimize this by joining *after* initial filtering. |
| **3** | **$addFields** | **Data Transformation** | Prepares raw strings into clean arrays for accurate comparison (e.g., merging amenities). |
| **4** | **$match** | **Hard Filtering** | Checks for price, gender rules (Female Only), and room-level requirements. |
| **5** | **$addFields** | **Heuristic Scoring** | The math engine runs. It calculates the `finalScore` based on weighted logic. |
| **6** | **$sort** | **Descending Rank** | Orders the resulting documents from Highest Score to Lowest Score. |
| **7** | **$skip / $limit** | **Pagination** | Implements the **Load More** feature, ensuring the browser only downloads 20 results at a time. |

---

## 📈 3. The Heuristic Scoring Weights

We use a "Heuristic" (Rule of Thumb) system to calculate the value of a property.

### **The Math Equation:**
`FinalScore = (Quality Baseline) + (Security Bonuses) + (Amenity Bonuses) + (Proximity Bonuses)`

### **Individual Weights:**
1.  **Safety First (+15 pts):** CCTV/Surveillance. (Weighted highest because security is the primary concern for students).
2.  **Safety Presence (+10 pts):** 24/7 Security Guard or Landlord living on-site.
3.  **Proximity (+10 pts):** Proximity to tricycle terminals or major Tau gates.
4.  **Quality Baseline (Rating * 2):** Ensures a 5-star house has a **10.0** point advantage over a brand new house.

### **The "New Listing" Benefit of the Doubt (4.8 Rule):**
New listings have 0 reviews. Instead of giving them a score of 0, we use a **Default Baseline of 4.8**.
*   **Why?** To solve the "Cold Start" problem. It allows new properties to be seen on Page 1, but they still rank slightly lower than a "Verified" property with a real 5.0 score.

---

## 🎓 4. Potential Panelist Questions & Champion Answers

### **Q1: "Why did you use MongoDB Aggregation instead of just filtering in JavaScript?"**
**Answer:** *"Performance and Scalability. By doing the math directly on the database server (Aggregation Pipeline), we avoid downloading 1,000 listings into the application memory. The database server is specialized for this math, making the app much faster as we grow from 500 to 5,000 listings."*

### **Q2: "What is the difference between a Hard Filter and a Soft Filter in your code?"**
**Answer:** *"Hard filters use `$match` to prune data (e.g., Budget). Soft filters use `$addFields` to calculate a score. We use Hard filters for dealbreakers (like Gender Rules) and Soft filters for preferences (like CCTV), which allows students to see a variety of results while still prioritizing their favorites."*

### **Q3: "How did you optimize your search for large datasets?"**
**Answer:** *"We implemented three layers of optimization: 1) **Strategic Indexing** on status and category. 2) **Early Exit Logic** where we filter before we join tables. 3) **Projection**, where we exclude large unneeded fields from the final response to save bandwidth."*

### **Q4: "Why is CCTV worth 15 points but Study Friendly only 5?"**
**Answer:** *"This is based on User Priority weighting. In our research of the Tarlac student context, physical security (CCTV) is non-negotiable for most parents, whereas a 'Quiet Environment' is a nice bonus but not necessarily a dealbreaker. The weights reflect the student's values."*

### **Q5: "How does your Load More feature work technically?"**
**Answer:** *"We use cursor-based pagination. The server returns a `nextCursor` (e.g., 'page:2'). When the user reaches the bottom, the frontend sends this token back to the server. The server then uses `$skip: 20` to jump over the listings the user has already seen and show the next batch."*

---

**Documentation Generated by Antigravity AI for BoardTAU.** 🚀🏘️🎓
