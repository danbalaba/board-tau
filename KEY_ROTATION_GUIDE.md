# 🔐 BoardTAU Encryption & Key Rotation Guide

This guide explains how to set up encryption environment variables in `.env` and perform **Zero-Downtime Key Rotations** for database chat messages.

---

## 1. Environment Variable Setup (`.env`)

Add the following variables to your `.env` file:

```env
# 1. Active Database Message Encryption Key (Server-Only)
# 64-character hex string used to encrypt/decrypt message content in MongoDB.
MESSAGE_ENCRYPTION_KEY=your_64_character_hex_key_here

# 2. URL Chat Token Encryption Secret (Client & Server)
# Secret string used to obfuscate listingId and otherUserId in browser address bars.
NEXT_PUBLIC_CHAT_TOKEN_SECRET=your_custom_chat_token_secret_here

# 3. Key History for Rotated Keys (Optional / During Key Rotations)
# Comma-separated list of previous keys used to decrypt historical messages.
PREVIOUS_MESSAGE_ENCRYPTION_KEYS=old_key_1,old_key_2
```

---

## 2. Generating Your Secrets

### Generate a 64-character (32-byte) Hex Key for `MESSAGE_ENCRYPTION_KEY`:
Run this command in PowerShell or terminal:

```powershell
node -e "console.log(require('crypto').createHash('sha256').update('YOUR_CUSTOM_PASSPHRASE_HERE').digest('hex'))"
```

---

## 3. How to Perform Key Rotation (Step-by-Step)

If a key compromise occurs or you want to rotate keys periodically:

### Step 1: Update `.env` with the New & Old Keys
1. Copy your current `MESSAGE_ENCRYPTION_KEY` value into `PREVIOUS_MESSAGE_ENCRYPTION_KEYS`.
2. Generate a new key and set it as `MESSAGE_ENCRYPTION_KEY`.

```env
# Active primary key for NEW messages
MESSAGE_ENCRYPTION_KEY=new_64_character_hex_key_here

# Previous key history for HISTORICAL messages
PREVIOUS_MESSAGE_ENCRYPTION_KEYS=old_compromised_or_deprecated_key_here
```

### Step 2: Run the Re-encryption Script
Run the CLI script in your terminal to re-encrypt all database messages:

```bash
npx tsx scripts/rotate-encryption-keys.ts
```

**What the script does**:
- Reads all message records in MongoDB.
- Decrypts each message using `PREVIOUS_MESSAGE_ENCRYPTION_KEYS`.
- Re-encrypts each message with your new `MESSAGE_ENCRYPTION_KEY`.
- Updates MongoDB records.

### Step 3: Revoke Old Keys
Once the script prints `🎉 Key Rotation Completed Successfully!`, all messages in MongoDB are encrypted under the new key. You can safely remove the old key from `PREVIOUS_MESSAGE_ENCRYPTION_KEYS`!
