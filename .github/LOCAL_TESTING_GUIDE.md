# 🛠️ Team Sync & Local Testing Guide

Your local environment might be broken due to recent dependency conflicts (React 19 vs. Legacy Peers). This guide helps you get back to a stable state so you can test and develop safely.

---

## 1. Get the Latest Changes
Once the stability PR is merged, update your local main branch:
```bash
git checkout main
git pull origin main
```

## 2. Reset Your Environment (The "Clean Slate")
Since the `package-lock.json` and versions have changed significantly, we recommend a fresh install:

**Windows (PowerShell):**
```powershell
rm -r -Force node_modules, package-lock.json
npm install --legacy-peer-deps
```

**macOS/Linux:**
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

> [!IMPORTANT]  
> **NEVER** run just `npm install`. You must **ALWAYS** use the `--legacy-peer-deps` flag for now. This is because our project uses **React 19**, which has version conflicts with some older utility libraries (like `kbar`).

---

## 3. Re-Generate the Database Client
Ensure your Prisma Client is synced with the new v5.22.0 downgrade:
```bash
npx prisma generate
```

---

## 4. Verify Your Setup
Run these commands to ensure your local environment is clean:

```bash
# Check for type errors (Should be 0)
npm run type-check

# Test the compilation
npm run build
```

---

### ❓ Troubleshooting
- **"Cannot convert undefined or null to object"**: This means your Prisma CLI and Client are out of sync. Ensure you've run the clean install above.
- **"ERESOLVE could not resolve"**: You forgot the `--legacy-peer-deps` flag! 
- **"uuid types not found"**: We have upgraded to `uuid` v10 with built-in types. Remove `@types/uuid` if it's still in your package.json manually.
