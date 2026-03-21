# BoardTAU Project Guidelines, Instructions, and Policies

## Table of Contents
1. [Project Overview](#project-overview)
2. [Team Guidelines & Policies](#team-guidelines--policies)
3. [Development Workflow](#development-workflow)
4. [Code Quality Standards](#code-quality-standards)
5. [Security Practices](#security-practices)
6. [Feature Implementation Instructions](#feature-implementation-instructions)
   - [User Profile Page with CRUD](#user-profile-page-with-crud)
   - [Become a Host Feature](#become-a-host-feature)
   - [Search & Filtering Feature](#search--filtering-feature)
7. [Testing & Quality Assurance](#testing--quality-assurance)
8. [Documentation Requirements](#documentation-requirements)
9. [Deployment Process](#deployment-process)
10. [Communication & Collaboration](#communication--collaboration)
11. [Emergency Procedures](#emergency-procedures)

---

## Project Overview

BoardTAU is a comprehensive web platform designed to help Tarlac Agricultural University (TAU) students find suitable boarding houses. The platform features:
- Advanced search & filtering capabilities
- Interactive map visualization
- Property management for landlords
- Admin dashboard for platform management
- Secure payment integration
- Review and rating system

**Technology Stack:** Next.js 16 + TypeScript + Tailwind CSS + MongoDB + Prisma + NextAuth.js

---

## Team Guidelines & Policies

### 1. Code Review Policy
- **All changes must be reviewed by at least one team member** before merging to main
- PRs must include clear descriptions of changes and reference related issues
- Reviews must check for:
  - Code quality and consistency
  - Security vulnerabilities
  - Performance optimization
  - Test coverage

### 2. Branching Strategy
```
main              # Production branch
develop           # Development branch (staging)
feature/[feature-name]  # Feature development
bugfix/[bug-number]    # Bug fixes
hotfix/[issue]         # Critical production fixes
```

### 3. Commit Message Standards
```
feat: Add user profile page
fix: Resolve search filtering issues
docs: Update README with new features
refactor: Optimize database queries
test: Add unit tests for reservation system
```

### 4. Working Hours & Availability
- Core development hours: 9AM - 6PM (Manila time)
- Daily standup: 9:30AM sharp
- Response time for critical issues: < 1 hour

### 5. Documentation Policy
- All features must have documentation in the PRD
- Code must include clear comments for complex logic
- API endpoints must be documented
- Update README.md with new features

---

## Development Workflow

### Before Starting Development

1. **Scan the Project First**
   - Review existing PRD and documentation
   - Analyze current implementation
   - Check existing components and services
   - Identify dependencies and conflicts

2. **Analyze Requirements**
   - Understand feature specifications
   - Check current implementation
   - Identify changes needed
   - Estimate development time

3. **Create Task Checklist**
   - Break feature into small, manageable tasks
   - Prioritize tasks
   - Assign responsibilities
   - Set deadlines

### Development Process

1. **Create Branch**
   ```bash
   git checkout -b feature/[feature-name]
   git push origin feature/[feature-name]
   ```

2. **Implement Feature**
   - Write clean, maintainable code
   - Follow coding standards
   - Add appropriate tests
   - Update documentation

3. **Test & Verify**
   - Test functionality locally
   - Check responsiveness
   - Verify all edge cases
   - Test integration with existing features

4. **Create PR**
   - Push changes to remote branch
   - Create PR targeting develop branch
   - Assign reviewers
   - Add comprehensive description

---

## Code Quality Standards

### 1. TypeScript Guidelines
- Use strict type definitions
- Avoid `any` type unless absolutely necessary
- Use interfaces for complex types
- Implement proper error handling

### 2. Component Structure
```typescript
// File structure
components/
├── common/          # Reusable components
├── feature-name/    # Feature-specific components
└── layout/          # Layout components

// Component template
import React from 'react';

interface ComponentProps {
  // Props definition
}

const Component: React.FC<ComponentProps> = ({}) => {
  return (
    <div className="...">
      {/* Content */}
    </div>
  );
};

export default Component;
```

### 3. Services Architecture
```typescript
// Services should be in services/ directory
export const serviceName = async (params: Params) => {
  try {
    // Logic here
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
```

### 4. API Routes
```typescript
// app/api/[feature]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Logic here
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
```

### 5. Styling Guidelines
- Use Tailwind CSS utility classes
- Maintain consistent design system
- Implement responsive design
- Ensure accessibility standards

---

## Security Practices

### 1. Authentication & Authorization
- Always use NextAuth.js for authentication
- Verify user roles before accessing sensitive data
- Implement proper session management

### 2. Data Validation
- Validate all input data
- Sanitize user input
- Use Zod for schema validation
- Prevent SQL injection

### 3. API Security
- Use HTTPS for all API calls
- Implement rate limiting
- Validate request headers
- Use secure cookies

### 4. File Upload Security
- Validate file types
- Limit file size
- Store files in secure storage
- Scan for malware

---

## Feature Implementation Instructions

### 1. User Profile Page with CRUD

#### Current Status
- Landlord profile exists in `app/landlord/settings/`
- No tenant user profile page

#### Requirements
Create a complete user profile page with:
- View profile information
- Edit personal details
- Update profile picture
- Change password
- View activity history
- Manage preferences

#### Implementation Steps

**Step 1: Create Profile Page Structure**
```typescript
// app/profile/page.tsx
import { getCurrentUser } from '@/services/user/user';

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    return <div>Please login to view your profile</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      {/* Profile content here */}
    </div>
  );
}
```

**Step 2: Create Profile Client Component**
```typescript
// app/profile/components/ProfileClient.tsx
'use client';

import React, { useState } from 'react';
import { updateUserProfile } from '@/services/user/user';

interface ProfileClientProps {
  user: any;
}

const ProfileClient: React.FC<ProfileClientProps> = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile form */}
    </div>
  );
};

export default ProfileClient;
```

**Step 3: Create API Route**
```typescript
// app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { updateUserProfile } from '@/services/user/user';

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const result = await updateUserProfile(data);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
```

**Step 4: Update Service**
```typescript
// services/user/user.ts
export const updateUserProfile = async (data: any) => {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const updatedUser = await db.user.update({
    where: { id: user.id },
    data: {
      name: data.name,
      email: data.email,
      image: data.image,
      // Add other fields
    },
  });

  return updatedUser;
};
```

#### Design Inspiration
- **Airbnb profile page** for clean, user-friendly design
- **LinkedIn profile** for professional layout
- **Reddit user profile** for activity history display
- Use Tailwind UI components for modern design

---

### 2. Become a Host Feature

#### Current Status
- Host application modal exists but not fully working
- Services and API routes are implemented
- Application submission may have issues

#### Requirements
- Fix the host application flow
- Ensure all steps are properly validated
- Implement proper error handling
- Test the complete application process
- Add loading states and feedback

#### Implementation Steps

**Step 1: Fix Application Submission**
```typescript
// components/modals/HostApplicationModal.tsx
const onSubmit = async (data: HostApplicationFormData) => {
  if (step !== STEPS.REVIEW) {
    nextStep();
    return;
  }

  if (isSubmitting) {
    return;
  }

  setIsSubmitting(true);

  try {
    const validationResult = validateStep(STEPS.REVIEW, data);
    if (!validationResult.valid) {
      toast.error(validationResult.errors[0].message);
      setTimeout(() => setIsSubmitting(false), 3000);
      return;
    }

    const formattedData = formatApplicationData(data);
    await createHostApplication(formattedData);

    toast.success('Application submitted successfully!');
    onCloseModal?.();
  } catch (error) {
    toast.error('Error submitting application');
  } finally {
    setIsSubmitting(false);
  }
};
```

**Step 2: Improve Validation**
```typescript
// services/validation/hostApplication.ts
export const validateStep = (step: number, data: any) => {
  const errors = [];

  switch (step) {
    case STEPS.DOCUMENTS:
      const requiredDocs = ['governmentId', 'businessPermit', 'landTitle', 'barangayClearance', 'fireSafetyCertificate'];
      requiredDocs.forEach(doc => {
        if (!data.documents[doc]) {
          errors.push({
            field: doc,
            message: `Please upload ${doc}`,
          });
        }
      });
      break;
    // Add other steps
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
```

**Step 3: Test Application Flow**
```typescript
// Add comprehensive tests
describe('Host Application', () => {
  it('should validate business information', async () => {
    const data = {
      businessInfo: {
        businessName: '',
        businessType: '',
        businessDescription: '',
      },
    };

    const result = validateStep(STEPS.BUSINESS_INFO, data);
    expect(result.valid).toBe(false);
  });
});
```

**Step 4: Improve User Feedback**
```typescript
// components/modals/HostApplicationModal.tsx
const nextStep = async () => {
  const validationResult = validateStep(step, getValues());

  if (!validationResult.valid) {
    validationResult.errors.slice(0, 3).forEach(error => {
      toast.error(error.message, { duration: 5000 });
    });

    const firstError = validationResult.errors[0];
    if (firstError) {
      const element = document.getElementById(firstError.field);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return;
  }

  setStep(step + 1);
};
```

---

### 3. Search & Filtering Feature

#### Current Status
- Search modal exists with multiple steps
- Filter logic implemented in services
- Results may not be filtered correctly

#### Requirements
- Fix filtering logic
- Ensure all filters work correctly
- Improve search performance
- Add loading states
- Implement proper error handling

#### Implementation Steps

**Step 1: Fix Search Parameters**
```typescript
// services/user/listings/index.ts
export const getListings = async (query?: { [key: string]: string | string[] | undefined | null }) => {
  try {
    const parsedQuery = {
      minPrice: query?.minPrice ? parseInt(query.minPrice as string) : undefined,
      maxPrice: query?.maxPrice ? parseInt(query.maxPrice as string) : undefined,
      distance: query?.distance ? parseInt(query.distance as string) : undefined,
      // Fix other query parameters
    };

    // Debug query parsing
    console.log('Parsed query:', parsedQuery);

    // Filter logic here
  } catch (error) {
    console.error('Error getting listings:', error);
    return {
      type: 'error',
      message: 'Failed to get listings',
      listings: [],
      nextCursor: null,
    };
  }
};
```

**Step 2: Fix Filter Logic**
```typescript
// services/user/listings/index.ts
const roomWhere: any = {};

if (roomType) {
  roomWhere.roomType = roomType;
}

if (bedType) {
  roomWhere.bedType = bedType;
}

if (capacity != null && capacity > 0) {
  roomWhere.capacity = { gte: capacity };
}

if (availableSlots != null && availableSlots > 0) {
  roomWhere.availableSlots = { gte: availableSlots };
}

// Add room amenities filtering
if (roomAmenities && Array.isArray(roomAmenities) && roomAmenities.length > 0) {
  roomWhere.amenities = { hasEvery: roomAmenities };
}
```

**Step 3: Fix Search Modal Query Params**
```typescript
// components/modals/SearchModal.tsx
const onSubmit: SubmitHandler<FieldValues> = (data) => {
  if (step !== STEPS.SUMMARY) {
    onNext();
    return;
  }

  const co = colleges.find((c) => c.value === data.college);
  const origin = co?.latlng ?? null;

  let currentQuery: Record<string, unknown> = {};
  if (searchParams) {
    currentQuery = queryString.parse(searchParams.toString()) as Record<string, unknown>;
  }

  const updatedQuery: Record<string, unknown> = {
    ...currentQuery,
    college: data.college,
    categories: (data.categories ?? []).length ? data.categories : undefined,
    distance: data.distance,
    moveInDate: data.moveInMonth || undefined,
    stayDuration: data.stayDuration || undefined,
    amenities: (data.amenities ?? []).length ? data.amenities : undefined,
    roomType: data.roomType || undefined,
    bedType: data.bedType || undefined,
    roomAmenities: (data.roomAmenities ?? []).length ? data.roomAmenities : undefined,
    capacity: data.roomType === ROOM_TYPES.SOLO ? undefined : (data.capacity || undefined),
    availableSlots: data.roomType === ROOM_TYPES.SOLO ? undefined : (data.availableSlots || undefined),
    roomSize: data.roomSize || undefined,
    minPrice: data.minPrice || undefined,
    maxPrice: data.maxPrice || undefined,
  };

  // Convert boolean params correctly
  const rulesMap: Record<string, string> = {
    "female-only": "femaleOnly",
    "male-only": "maleOnly",
    "visitors-allowed": "visitorsAllowed",
    "pets-allowed": "petsAllowed",
    "smoking-allowed": "smokingAllowed",
  };

  (data.rules ?? []).forEach((rule: string) => {
    if (rulesMap[rule]) {
      updatedQuery[rulesMap[rule]] = "true";
    }
  });

  // Advanced filters
  const advancedMap: Record<string, string> = {
    "24-7-security": "security24h",
    "cctv": "cctv",
    "fire-safety": "fireSafety",
    "near-public-transport": "nearTransport",
    "study-friendly": "studyFriendly",
    "quiet-environment": "quietEnvironment",
    "flexible-lease": "flexibleLease",
  };

  (data.advanced ?? []).forEach((advanced: string) => {
    if (advancedMap[advanced]) {
      updatedQuery[advancedMap[advanced]] = "true";
    }
  });

  if (origin && origin.length >= 2) {
    updatedQuery.originLat = origin[0];
    updatedQuery.originLng = origin[1];
  }

  const url = queryString.stringifyUrl(
    { url: "/", query: updatedQuery as Record<string, string | string[] | number | undefined> },
    { skipNull: true }
  );
  onCloseModal?.();
  router.push(url);
};
```

**Step 4: Add Loading States**
```typescript
// components/modals/SearchModal.tsx
const [isLoading, setIsLoading] = useState(false);

const onSubmit = async (data: FieldValues) => {
  if (step !== STEPS.SUMMARY) {
    onNext();
    return;
  }

  setIsLoading(true);

  try {
    // Search logic here
  } catch (error) {
    toast.error('Error searching for properties');
  } finally {
    setIsLoading(false);
  }
};

// Display loading indicator
{isLoading && (
  <div className="flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
)}
```

---

## Testing & Quality Assurance

### 1. Testing Strategy
- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test API endpoints and services
- **E2E Tests**: Test complete user flows
- **Accessibility Tests**: Ensure WCAG compliance

### 2. Test Coverage
- Aim for at least 80% coverage
- Test critical paths
- Test edge cases
- Test error handling

### 3. Testing Tools
- **Jest**: Unit testing framework
- **React Testing Library**: Component testing
- **Playwright**: E2E testing
- **Cypress**: E2E testing (alternate)

### 4. Test Commands
```bash
npm run test          # Run all tests
npm run test:watch   # Watch mode
npm run test:coverage # Generate coverage report
npm run test:e2e     # Run E2E tests
```

---

## Documentation Requirements

### 1. Feature Documentation
- Update PRD with new features
- Create detailed implementation plan
- Add user documentation
- Update README.md

### 2. Technical Documentation
- Document API endpoints
- Document services and components
- Add architecture diagrams
- Update system design

### 3. Deployment Documentation
- Update deployment guide
- Document environment variables
- Add rollback procedures
- Update monitoring setup

---

## Deployment Process

### 1. Staging Deployment
1. Merge PR to develop branch
2. Vercel automatically deploys to staging
3. Run smoke tests
4. Verify functionality

### 2. Production Deployment
1. Create release branch from develop
2. Test in staging environment
3. Merge to main branch
4. Vercel automatically deploys to production
5. Monitor for issues

### 3. Rollback Procedure
1. Identify issue
2. Revert problematic commit
3. Deploy revert to production
4. Investigate root cause

---

## Communication & Collaboration

### 1. Daily Standup
- Time: 9:30AM (Manila time)
- Platform: Discord/Zoom
- Duration: 15-20 minutes
- Format: What did I do yesterday? What will I do today? What are my blockers?

### 2. Communication Channels
- **Discord**: General communication, quick questions
- **Slack**: Project updates, announcements
- **GitHub Issues**: Bug tracking, feature requests
- **Jira**: Project management, sprint planning

### 3. Reporting Bugs
- Create GitHub issue with:
  - Clear title
  - Detailed description
  - Steps to reproduce
  - Expected behavior
  - Actual behavior
  - Screenshots (if applicable)
  - Browser and OS information

---

## Emergency Procedures

### 1. Production Incident Response
1. **Identify Incident**: Monitor alerts and user reports
2. **Assess Impact**: Determine severity and affected users
3. **Contain**: Implement temporary fix if available
4. **Investigate**: Find root cause
5. **Fix**: Develop and test permanent solution
6. **Deploy**: Deploy fix to production
7. **Verify**: Ensure issue is resolved
8. **Document**: Write post-mortem report

### 2. Critical Issue Protocol
- **P0**: Urgent (system down, data loss) - Response < 1 hour
- **P1**: High (major functionality broken) - Response < 2 hours
- **P2**: Medium (partial functionality broken) - Response < 4 hours
- **P3**: Low (minor issue, cosmetic) - Response < 24 hours

---

## Final Notes

Remember to always:
1. **Scan the project first** before starting any development
2. **Understand existing implementation**
3. **Follow coding standards**
4. **Write clean, maintainable code**
5. **Test thoroughly**
6. **Document changes**
7. **Communicate progress**

By following these guidelines, we ensure a smooth and efficient development process that produces high-quality, reliable software.
