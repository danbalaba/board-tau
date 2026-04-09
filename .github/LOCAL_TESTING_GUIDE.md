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
npm ci
```

**macOS/Linux:**
```bash
rm -rf node_modules package-lock.json
npm ci
```

> [!IMPORTANT]  
> The project uses an `.npmrc` file to automatically handle peer dependency conflicts (like React 19 vs. kbar). You **no longer need to manually add the legacy flag**. Just run `npm ci` and it will work! Always use `npm ci` instead of `npm install` to prevent lock file modifications.

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

### ⚠️ Important: Match Node/npm Versions
If `package-lock.json` keeps changing after pulling, ensure your team uses the same Node and npm versions:
```bash
node -v
npm -v
```
Coordinate with your team to use identical versions, then regenerate the lock file once with `npm ci`.
