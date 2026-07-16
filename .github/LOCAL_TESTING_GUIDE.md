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
# Remove old dependencies and lockfiles
rm -r -Force node_modules, package-lock.json

# Perform a clean install
npm install
```

**macOS/Linux:**
```bash
# Remove old dependencies and lockfiles
rm -rf node_modules package-lock.json

# Perform a clean install
npm install
```

> [!IMPORTANT]  
> The project uses an `.npmrc` file to automatically handle peer dependency conflicts (like React 19 vs. kbar) and overrides (like PostCSS and uuid). You **no longer need to manually add the legacy flag**. Running `npm install` will resolve all dependencies securely.

---

## 3. Re-Generate the Database Client
Ensure your Prisma Client is synced with the database:
```bash
npx prisma generate
```

---

## 4. Verify Your Setup
Run these commands to ensure your local environment is clean and passing all tests:

```bash
# Check for type errors (Should be 0)
npm run type-check

# Run unit tests to check component functionality
npm run test

# Test the build compilation
npm run build
```

---

### ❓ Troubleshooting
- **"Cannot convert undefined or null to object"**: This means your Prisma CLI and Client are out of sync. Ensure you've run the clean install above.
- **"ERESOLVE could not resolve"**: You forgot the overrides in package.json or NPM is out of date. Check that you ran a fresh `npm install` after deleting `node_modules`.
- **"uuid types not found"**: We have upgraded to `uuid` v11 with built-in types.

### ⚠️ Important: Match Node/npm Versions
If `package-lock.json` keeps changing after pulling, ensure your team uses the same Node and npm versions:
```bash
node -v
npm -v
```
Coordinate with your team to use identical versions, then regenerate the lock file once with `npm install`.
