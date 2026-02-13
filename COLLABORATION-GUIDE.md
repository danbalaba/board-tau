# BoardTAU Collaboration Guide

This guide explains how to collaborate on the BoardTAU capstone project using Git and GitHub.

## Prerequisites

1. All group members should have:
   - A GitHub account
   - Git installed on their computer
   - VS Code or another code editor
   - Node.js installed (for running the project locally)

## Getting Started

### 1. Add Collaborators on GitHub

First, the repository owner (you) needs to add group members as collaborators:

1. Go to https://github.com/danbalaba/board-tau-master
2. Click **Settings** → **Collaborators and teams**
3. Click **Add people**
4. Search for your groupmates' GitHub usernames
5. Select **Write** permission (allows them to push changes)
6. Click **Add NAME to this repository**

### 2. Clone the Repository

Each group member should clone the repository to their local machine:

```bash
git clone https://github.com/danbalaba/board-tau-master.git
cd board-tau-master
npm install
```

## Standard Collaboration Workflow

Follow this workflow for every task or feature you work on:

### 1. Create a New Branch

Always work on a separate branch for each task:

```bash
# Update your local main branch with latest changes
git checkout main
git pull origin main

# Create and switch to a new branch (use descriptive names)
git checkout -b feature/user-profile
# or for bugs
git checkout -b bug/fix-login-error
```

Branch name examples:
- `feature/search-filter` - for new features
- `bug/fix-image-upload` - for bug fixes
- `docs/update-readme` - for documentation updates
- `style/improve-footer` - for styling changes

### 2. Make Changes

Work on your feature or bug fix. Commit regularly with meaningful messages:

```bash
# Check which files have been modified
git status

# Add files to staging (stage all changes)
git add .

# Commit changes (write clear, descriptive messages)
git commit -m "Add user profile page with edit functionality"
```

### 3. Push Branch to GitHub

Push your branch to the remote repository:

```bash
git push origin feature/user-profile
```

### 4. Create a Pull Request (PR)

1. Go to your repository on GitHub
2. Click the **Compare & pull request** button that appears
3. Fill out the PR form:
   - Title: Descriptive title of your changes
   - Description: Explain what was done and why
   - Reviewers: Add your groupmates as reviewers
4. Click **Create pull request**

### 5. Review and Merge PRs

#### Reviewing PRs:
1. Go to **Pull requests** tab
2. Click on the PR to review
3. Click **Files changed** to see the modifications
4. Add comments or suggestions
5. If everything looks good, click **Approve**

#### Merging PRs:
1. Wait for at least one other person to approve your PR
2. Click **Merge pull request**
3. Click **Confirm merge**
4. Optionally, delete the branch after merging

## Keeping Your Local Branch Updated

If another PR gets merged while you're working, update your branch:

```bash
# Switch to main branch and pull latest changes
git checkout main
git pull origin main

# Switch back to your branch and merge main into it
git checkout feature/user-profile
git merge main

# Resolve any conflicts (if they occur)
```

## Resolving Conflicts

If you encounter merge conflicts:
1. VS Code will highlight the conflicting sections
2. Manually edit the files to resolve the conflicts
3. Save the files
4. Commit the changes: `git commit -m "Resolve merge conflicts"`
5. Continue with your PR

## Team Roles & Responsibilities

- **Owner/Maintainer**: Dan Balaba (Project Manager)
- **Collaborators**: Add your groupmates' names here

## Code Quality Guidelines

1. Write clean, well-commented code
2. Follow the existing coding style
3. Test your changes before creating a PR
4. Update documentation as needed

## Project Structure Overview

```
board-tau-master/
├── app/                 # Next.js app directory
├── components/          # Reusable React components
├── data/                # Static data files
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── prisma/              # Database schema and seed data
├── public/              # Static assets
├── services/            # API and business logic
├── types/               # TypeScript type definitions
├── utils/               # Helper functions
└── package.json         # Project dependencies
```

## Running the Project Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Seed the database
npm run seed
```

## Communication Guidelines

- Use GitHub issues for bug reports and feature requests
- Use PR comments for code review discussions
- Use your team's communication channel (Slack, WhatsApp, etc.) for general discussions

## Git Cheat Sheet

| Command | Description |
|---------|-------------|
| `git status` | Check which files have been modified |
| `git add .` | Stage all changes |
| `git commit -m "message"` | Commit changes with a message |
| `git push origin [branch]` | Push branch to remote repository |
| `git pull origin [branch]` | Pull changes from remote branch |
| `git checkout [branch]` | Switch to a different branch |
| `git checkout -b [branch]` | Create and switch to a new branch |
| `git merge [branch]` | Merge changes from another branch |
| `git log` | View commit history |

## Example Workflow

Here's a step-by-step example of adding a new feature:

1. **User Story**: "As a user, I want to be able to reset my password"
2. **Branch**: `feature/reset-password`
3. **Changes**: Create API endpoint, form component, and logic
4. **Commit**: `git commit -m "Add password reset functionality"`
5. **PR**: Create PR titled "Add password reset feature"
6. **Review**: Team members review and approve
7. **Merge**: PR is merged into main branch
