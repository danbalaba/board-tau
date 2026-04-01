# Contributing to BoardTAU

Welcome to BoardTAU! We appreciate your interest in contributing to our project. This guide will help you get started with the development process.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB database
- Stripe account (for payments)
- EdgeStore account (for file storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/danbalaba/board-tau.git
   cd board-tau
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```
   > [!NOTE]
   > The `--legacy-peer-deps` flag is required because the project uses **React 19**, which has peer dependency conflicts with some older utility libraries (like `kbar`). This flag safely bypasses those version checks.

3. **Set up environment variables**
   Create a `.env` file in the root directory with the required variables. See `.env.example` for a template.

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   npm run seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

## 🔍 Testing Setup

BoardTAU includes a comprehensive testing setup using:

- **Jest**: JavaScript/TypeScript testing framework
- **React Testing Library**: UI testing library for React
- **Jest DOM**: Custom matchers for React DOM elements

### Available Scripts

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Type check
npm run type-check
```

### Adding New Tests

We require tests for every PR to ensure code quality and prevent regression. Test files should follow these conventions:

#### **Test File Naming**
- Component tests: `<ComponentName>.test.tsx` (same directory as component)
- API tests: `<endpoint-name>.test.ts` (in `tests/api/` directory)
- Utility functions: `<function-name>.test.ts` (same directory as function)

#### **Component Test Example**
```typescript
// components/common/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button Component', () => {
  it('renders correctly with default props', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('handles click events', () => {
    const mockOnClick = jest.fn();
    render(<Button onClick={mockOnClick}>Click Me</Button>);
    fireEvent.click(screen.getByRole('button', { name: /click me/i }));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('displays loading state', () => {
    render(<Button isLoading={true}>Click Me</Button>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
```

#### **API Test Example**
```typescript
// tests/api/auth.test.ts
import request from 'supertest';
import app from '@/app';

describe('Authentication API', () => {
  it('responds with 200 OK for login', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' })
      .set('Content-Type', 'application/json');

    expect(response.statusCode).toBe(200);
  });

  it('returns 401 for invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' })
      .set('Content-Type', 'application/json');

    expect(response.statusCode).toBe(401);
  });
});
```

#### **Test Templates**
We provide test templates in `tests/__template__/` directory:
- `component.test.tsx`: Template for React components
- `api.test.ts`: Template for API endpoints

#### **Testing Guidelines**
- **Write meaningful tests**: Tests should describe what they're testing
- **Test all paths**: Cover happy paths, edge cases, and error scenarios
- **Keep tests focused**: Each test should test one thing
- **Use descriptive names**: Test names should be readable and clear
- **Isolate tests**: Tests should not share state or dependencies

#### **Code Coverage**
We aim for 80% test coverage. Run `npm run test:coverage` to see your coverage report.


### Running Tests Locally

```bash
# Run all tests
npm run test

# Run specific test file
npm run test components/common/Button.test.tsx

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### CI/CD Pipeline

Our CI/CD pipeline automatically runs tests on every push and pull request. The pipeline includes:

1. **Quality Check**: Linting and type checking
2. **Build**: Compile the application
3. **Security**: Audit dependencies for vulnerabilities
4. **Tests**: Run all tests with coverage
5. **PR Validation**: Verify PR changes
6. **Deployment**: Deploy to production

## 🌿 Branching Strategy

We use a simple and effective branching strategy:

- `main`: **Production branch (protected)** - All production code lives here
- `feature/*`: Feature branches for new functionality
- `fix/*`: Bug fix branches for critical issues

### Creating a Branch

```bash
# Create a new feature branch
git checkout main
git pull origin main
git checkout -b feature/your-feature-name

# Create a new bug fix branch
git checkout main
git pull origin main
git checkout -b fix/your-bug-fix
```

### Committing Changes

Follow these guidelines for commits:

1. **Use meaningful commit messages** that describe the change
2. **Prefix commits**: Use prefixes like `feat:`, `fix:`, `docs:`, `refactor:`
3. **Keep commits small and focused**

Example:
```bash
git add .
git commit -m "feat: add user profile page"
git push origin feature/your-feature-name
```

## 📝 Pull Requests

### Creating a PR

1. Push your changes to your branch
2. Go to the repository on GitHub
3. Click "Compare & pull request"
4. Fill out the PR template
5. Assign reviewers

### PR Template

Our PR template includes sections for:
- Description of changes
- Type of change (feature, bug fix, etc.)
- Testing details
- Checklist

### Review Process

1. **Testing Requirements**: PRs must include tests for all changes
2. **Approval**: PRs must be reviewed by at least one team member
3. **CI/CD Checks**: All tests must pass
4. **Code Style**: Changes must follow the code style guidelines
5. **Issue Linking**: PRs should address an issue
6. **Documentation**: Changes must include appropriate documentation updates

#### **Review Checklist**
- [ ] Are all changes tested?
- [ ] Are tests meaningful and focused?
- [ ] Does the PR follow the existing coding style?
- [ ] Are there any breaking changes?
- [ ] Is the documentation updated?
- [ ] Are all existing tests passing?


## 💻 Code Style Guidelines

### JavaScript/TypeScript

- Follow the existing code style
- Use TypeScript for all new files
- Keep lines under 80 characters
- Use meaningful variable and function names
- Add comments to complex logic

### React Components

- Use functional components with hooks
- Create tests for all components
- Follow the existing directory structure
- Use TypeScript interfaces for props and types

### CSS/Tailwind

- Use Tailwind CSS utilities
- Create reusable components
- Follow the existing color scheme and design system

## 📚 Documentation

### Updating Documentation

- Update README.md with any new features or changes
- Create or update documentation in the `docs/` directory
- Add comments to complex code
- Update this CONTRIBUTING.md if needed

### Code Comments

```typescript
// Bad
const x = 5; // some number

// Good
// Number of items to display per page
const ITEMS_PER_PAGE = 10;
```

## 🔧 Troubleshooting

### Common Issues

1. **Dependency issues**: Run `npm install --legacy-peer-deps` again to clear peer conflicts.
2. **Database connection errors**: Check your `.env` file
3. **Type errors**: Run `npm run type-check`
4. **Test failures**: Run `npm run test:watch` to debug

### Getting Help

- **Check the FAQ**: Visit `/legal/help` for frequently asked questions
- **Contact Support**: Email support@boardtau.com
- **Report Bugs**: Create an issue on GitHub
- **Ask for Help**: Use the #development channel on our Discord server

## 🤝 Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Listen to others' opinions
- Be open to feedback
- Help others learn

### Reporting Issues

When reporting issues, please include:
- A clear and descriptive title
- Detailed steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots if applicable

### Feature Requests

When requesting features, please include:
- A clear and descriptive title
- Detailed description of the feature
- Use cases and benefits
- Any relevant examples or mockups

## 📄 License

By contributing to BoardTAU, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to BoardTAU! We look forward to your contributions.

**Built with ❤️ for the TAU community**
