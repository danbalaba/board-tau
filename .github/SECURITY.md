# 🛡️ Security Policy & Vulnerability Disclosure

We take the security and integrity of **BoardTAU** seriously. If you discover a security vulnerability in this project, please report it immediately via the private disclosure channel detailed below. 

---

## 📋 Supported Versions

We actively maintain and support the current major release branch. 

| Version | Supported | Security Patches | Status |
| :--- | :---: | :---: | :--- |
| **0.1.0 (Current)** | 🟢 Yes | 🟢 Active | Stable production release |
| **< 0.1.0 (Beta/Alpha)** | 🔴 No | 🔴 EOL | Outdated development builds |

---

## 🔒 Reporting a Vulnerability

Please **do not** open public GitHub issues or write public comments for security vulnerabilities. Doing so exposes the platform and its users to exploits before a fix can be deployed.

### Private Reporting Steps
1. **Send a Private Report**: Email our security team at `security@boardtau.com` (or contact the Capstone Project Lead).
2. **Include Technical Details**:
   - A clear description of the vulnerability (e.g., SQL Injection, XSS, SSRF).
   - Step-by-step instructions to reproduce the issue.
   - Proof of Concept (PoC) code or requests, if applicable.
   - The potential impact on user data or server environments.

---

## ⏱️ Response & Remediation SLA

Once a vulnerability report is received, the security team will:
- **Triage & Acknowledge**: Confirm receipt and validate the vulnerability within **24 hours**.
- **Fix & Patch**: Work on a resolution and deploy a secure patch within **7 business days**.
- **Disclosure**: Publish a secure security advisory and release update notes after the fix is successfully merged.

---

## 🔍 Automated Security Scans

BoardTAU integrates automated security analysis into our CI/CD pipeline to continuously scan for vulnerabilities:
- **CodeQL Advanced Static Analysis**: Analyzes source code for semantic vulnerabilities (like SQLi, SSRF, and XSS) on every pull request and push to the `main` branch.
- **Dependabot Alerts**: Scans all direct and transitive dependencies weekly to flag outdated packages and automatically generate updates.
- **NPM Auditing**: Automatically runs `npm audit` on every build pipeline run to flag high-severity security advisories.
