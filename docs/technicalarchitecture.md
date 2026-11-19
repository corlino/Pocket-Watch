# **Pocket Watch**

## **Technical Architecture Document (TAD)**

**Version:** 1.0  
**Status:** Draft for development  
**Product:** Personal finance and budgeting web application  
**Architecture:** Cloud-hosted Progressive Web Application  
**Development approach:** AI-assisted development using Claude Code  
**Primary user:** Single administrator  
**Default currency:** CAD

---

# **1\. Architecture Overview**

## **1.1 Purpose**

This document defines the technical architecture, technology stack, application structure, database design, security requirements, deployment approach, and implementation standards for Pocket Watch.

It serves as the technical source of truth for AI-assisted application development.

The architecture must support the requirements defined in the finalized Pocket Watch PRD.

## **1.2 Architecture Principles**

The application should follow these principles:

1. Simplicity: Avoid unnecessary infrastructure and dependencies.  
2. Maintainability: Use modular, reusable components and clearly separated application logic.  
3. Data integrity: Financial records must remain accurate and consistent.  
4. Security: All financial information must be protected through server-side authentication and authorization.  
5. Scalability: The architecture should accommodate future functionality without requiring a complete rebuild.  
6. Cost efficiency: Prefer free and open-source technologies and services.  
7. Design consistency: All interfaces must follow the established Pocket Watch design system.

## **1.3 High-Level Architecture**

Pocket Watch will use a three-layer architecture.

**Presentation Layer**

* Next.js  
* React  
* TypeScript  
* Tailwind CSS  
* shadcn/ui  
* Recharts

Responsible for rendering the user interface, handling user interactions, and presenting financial information.

**Application Layer**

* Next.js Server Components  
* Next.js Server Actions  
* Next.js Route Handlers  
* Zod validation  
* Financial calculation services  
* Recurring transaction processing

Responsible for application logic, validation, authentication, financial calculations, and database operations.

**Data Layer**

* Supabase  
* PostgreSQL  
* Supabase Authentication  
* Row Level Security

Responsible for persistent storage, data relationships, authentication identity, and database-level integrity.

---

# **2\. Technology Stack**

## **2.1 Frontend**

**Next.js**

* Application framework.  
* Use the App Router.  
* Support server-side rendering where appropriate.  
* Provide server actions and API routes.  
* Support Progressive Web Application functionality.

**TypeScript**

* Primary programming language.  
* Enable strict type checking.  
* Define shared application and database types.  
* Avoid using the `any` type unless explicitly justified.

**React**

* Component-based interface development.  
* Reusable UI components.  
* Local state management where appropriate.

**Tailwind CSS**

* Utility-first styling.  
* Responsive layouts.  
* Design token implementation.

**shadcn/ui**

* Reusable interface components.  
* Accessible form controls, dialogs, dropdowns, and navigation.  
* Components should be customized to follow the Pocket Watch design system.

**Recharts**

* Financial data visualizations.  
* Income versus expenses.  
* Expense breakdowns.  
* Historical trends.

## **2.2 Backend**

The application will use Next.js as its backend application layer.

Backend responsibilities include:

* Authentication and session management.  
* Transaction CRUD operations.  
* Category management.  
* Budget management.  
* Financial calculations.  
* Recurring transaction generation.  
* Data export and backup operations.

Business logic should be separated from interface components.

## **2.3 Database**

**Supabase PostgreSQL**

Supabase will provide:

* Persistent relational database storage.  
* Authentication.  
* Database access through the Supabase client.  
* Row Level Security.  
* Database constraints and indexes.

Database schema changes must be managed through version-controlled SQL migrations.

## **2.4 Development and Deployment**

**Claude Code**

* AI-assisted implementation.  
* Code generation and modification.  
* Debugging.  
* Test generation.  
* Refactoring.

**GitHub**

* Private source code repository.  
* Version control.  
* Development history.

**Vercel**

* Cloud application hosting.  
* Production deployment.  
* Preview deployments.  
* HTTPS.  
* Scheduled processing.

---

# **3\. Application Structure**

## **3.1 Navigation**

The application will contain four primary destinations:

1. Home  
2. Analytics  
3. Budget  
4. Profile

Transaction entry should be accessible throughout the application.

Navigation should adapt to screen size:

* Desktop: Persistent sidebar navigation.  
* Mobile: Bottom navigation.  
* Transaction entry: Prominent contextual action.

## **3.2 Recommended Project Structure**

Use a feature-oriented project structure.

```
pocket-watch/
│
├── app/
│   ├── (auth)/
│   │   └── login/
│   │
│   ├── (dashboard)/
│   │   ├── home/
│   │   ├── analytics/
│   │   ├── budget/
│   │   └── profile/
│   │
│   ├── api/
│   │   └── cron/
│   │       └── recurring-transactions/
│   │
│   ├── layout.tsx
│   ├── page.tsx
│   └── manifest.ts
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── navigation/
│   ├── transactions/
│   ├── categories/
│   ├── budgets/
│   ├── analytics/
│   └── shared/
│
├── features/
│   ├── authentication/
│   ├── transactions/
│   ├── categories/
│   ├── budgets/
│   ├── recurring/
│   ├── analytics/
│   └── preferences/
│
├── lib/
│   ├── supabase/
│   ├── validation/
│   ├── calculations/
│   ├── formatting/
│   ├── dates/
│   └── utilities/
│
├── types/
│
├── public/
│   ├── icons/
│   ├── images/
│   └── manifest-icons/
│
├── supabase/
│   ├── migrations/
│   └── seed.sql
│
├── tests/
│   ├── unit/
│   └── integration/
│
├── .env.example
├── next.config.ts
├── vercel.json
├── package.json
└── tsconfig.json
```

Features should remain modular. Components should not directly implement financial calculations or complex database operations.

---

# **4\. Database Architecture**

## **4.1 Database Tables**

The application will use the following primary tables.

### **profiles**

Stores the administrator's application profile.

Fields:

* id (UUID, references authentication user)  
* display\_name  
* created\_at  
* updated\_at

### **transactions**

Stores all manually created and generated financial transactions.

Fields:

* id (UUID)  
* owner\_id (UUID)  
* transaction\_type (income / expense)  
* category\_id (UUID)  
* amount (NUMERIC 12,2)  
* description (nullable)  
* notes (nullable)  
* transaction\_date (DATE)  
* recurring\_schedule\_id (nullable UUID)  
* created\_at  
* updated\_at

### **categories**

Stores income and expense categories.

Fields:

* id (UUID)  
* owner\_id (UUID)  
* name  
* category\_type (income / expense)  
* icon (nullable)  
* is\_archived (boolean)  
* created\_at  
* updated\_at

### **budgets**

Stores monthly and yearly budget allocations.

Fields:

* id (UUID)  
* owner\_id (UUID)  
* category\_id (UUID)  
* allocated\_amount (NUMERIC 12,2)  
* period\_type (monthly / yearly)  
* period\_identifier  
* created\_at  
* updated\_at

Period identifier examples:

* Monthly: 2026-11  
* Yearly: 2026

### **recurring\_schedules**

Stores recurring transaction definitions independently from generated transactions.

Fields:

* id (UUID)  
* owner\_id (UUID)  
* transaction\_type (income / expense)  
* category\_id (UUID)  
* amount (NUMERIC 12,2)  
* description (nullable)  
* notes (nullable)  
* recurrence\_interval (weekly / monthly)  
* original\_start\_date (DATE)  
* next\_scheduled\_date (DATE)  
* anchor\_day\_of\_month (nullable integer)  
* is\_active (boolean)  
* created\_at  
* updated\_at

### **preferences**

Stores application display and regional preferences.

Fields:

* id (UUID)  
* owner\_id (UUID)  
* currency\_display  
* date\_format  
* number\_format  
* appearance  
* created\_at  
* updated\_at

## **4.2 Data Relationships**

* One administrator owns all application data.  
* One category can have multiple transactions.  
* One category can have multiple budget allocations.  
* One recurring schedule can generate multiple transactions.  
* Each generated transaction references its originating recurring schedule.  
* Monthly and yearly budgets remain independent.  
* Transactions remain independent of budget allocations.

## **4.3 Database Integrity**

Implement the following database constraints:

* Category names must be unique within their respective transaction types.  
* Budget allocations must be unique per category and reporting period.  
* A recurring schedule must not generate the same scheduled occurrence twice.  
* Transaction amounts must be positive.  
* Budget amounts may be zero or greater.  
* Every transaction must reference a valid category.  
* Historical transactions must retain their category relationships.

Use foreign keys, unique constraints, appropriate indexes, and database-level validation.

Use PostgreSQL NUMERIC rather than floating-point types for monetary values.

---

# **5\. Authentication and Security Architecture**

## **5.1 Authentication**

Use Supabase Authentication.

The application must support one administrator only.

Requirements:

* Public registration must be disabled.  
* An administrator account must be provisioned during initial deployment.  
* Authentication must be required before accessing financial data.  
* Sessions must persist securely between visits.  
* The administrator must be able to log out and change their password.

The login interface should follow the PRD:

"Hello Colin, password please."

The user interface should only request a password.

Implementation approach:

* Provision one internal Supabase Auth user.  
* Keep the internal authentication identity out of the visible interface.  
* Authenticate using a server-side login action.  
* Establish a secure session using HTTP-only cookies.  
* Never expose authentication credentials or the Supabase service-role key to the browser.

## **5.2 Authorization**

Use Supabase Row Level Security (RLS).

Every financial table must enforce administrator ownership.

Policies must ensure:

* Only the authenticated administrator can read financial records.  
* Only the authenticated administrator can create records.  
* Only the authenticated administrator can modify records.  
* Only the authenticated administrator can delete records.

Do not rely exclusively on frontend route protection.

All sensitive database operations must be authorized server-side and protected by database policies.

## **5.3 Additional Security Requirements**

* HTTPS for all production traffic.  
* Secure and appropriately configured session cookies.  
* Rate limiting on authentication attempts.  
* Password hashing handled by Supabase Auth.  
* Secrets stored in environment variables.  
* No credentials committed to GitHub.  
* Server-side validation of all financial data.  
* Protected scheduled-processing endpoints.

---

# **6\. Financial Logic Architecture**

## **6.1 Financial Calculations**

Create a centralized financial calculation module.

Calculations must derive from transaction records rather than separately stored dashboard totals.

Required calculations:

**Total Income**

Sum of income transactions within the selected reporting period.

**Total Expenses**

Sum of expense transactions within the selected reporting period.

**Net Cash Flow**

Total Income \- Total Expenses.

**Savings Rate**

(Net Cash Flow / Total Income) × 100\.

If income is zero, display unavailable.

**Budget Remaining**

Allocated Budget \- Actual Expenses.

**Budget Utilization**

(Actual Expenses / Allocated Budget) × 100\.

If the allocated budget is zero, display unavailable.

**Monthly Subscription Cost**

Weekly recurring subscription amount × 52 / 12\.

Monthly recurring subscription amount remains unchanged.

## **6.2 Financial Calculation Standards**

* Never use JavaScript floating-point arithmetic for financial calculations.  
* Use PostgreSQL NUMERIC for database monetary values.  
* Use a precision-safe decimal library in application calculations where needed.  
* Round monetary results to two decimal places for display.  
* Store expense and income amounts as positive values.  
* Use transaction type to determine financial classification.  
* Keep currency formatting separate from financial calculations.  
* Changing the display currency must not modify stored amounts.

---

# **7\. Recurring Transaction Processing**

## **7.1 Architecture**

Recurring transactions must be processed server-side.

The application must not depend on an open browser, active session, or iPhone to generate transactions.

Use Vercel Cron Jobs to invoke a protected Next.js API route once per day.

Endpoint:

`GET /api/cron/recurring-transactions`

The endpoint will:

1. Authenticate the scheduled request.  
2. Identify active recurring schedules.  
3. Compare next scheduled dates against the current application date.  
4. Generate all outstanding occurrences.  
5. Preserve the original scheduled transaction dates.  
6. Advance each recurring schedule.  
7. Prevent duplicate generation.  
8. Record processing errors for troubleshooting.

## **7.2 Recurrence Rules**

**Weekly**

Generate a new transaction every seven calendar days.

**Monthly**

Generate transactions according to the original intended calendar day.

Example:

* January 31 → February 28  
* February 28 → March 31

The original anchor day must be stored independently of the next scheduled date.

The system must not calculate subsequent monthly occurrences by simply adding one month to the previously clamped date.

## **7.3 Missed Transaction Processing**

The scheduler must catch up all missed occurrences.

Example:

A weekly schedule has three missed occurrences.

When processing next runs:

* Generate occurrence one.  
* Generate occurrence two.  
* Generate occurrence three.  
* Preserve all original scheduled dates.  
* Continue from the original recurrence pattern.

## **7.4 Duplicate Prevention**

Recurring processing must be idempotent.

Implement:

* A unique constraint on the originating recurring schedule and scheduled transaction date.  
* Database transactions for generation and schedule advancement.  
* Appropriate row locking to prevent overlapping processing.  
* Conflict handling so an already-generated occurrence is not duplicated.

A retry must never generate a duplicate financial transaction.

## **7.5 Individual Transaction and Schedule Separation**

Deleting an individual generated transaction must not cancel its recurring schedule.

Editing an individual generated transaction must not change the schedule.

Editing a recurring schedule must affect future occurrences only.

Disabling a schedule must prevent future generation while preserving historical transactions.

## **7.6 Scheduling Configuration**

Use a daily Vercel Cron Job.

The scheduler should run after midnight in the application's configured local timezone.

Store an IANA timezone in the deployment configuration and use date-only values for recurrence calculations.

The scheduled endpoint must be protected by a secret environment variable such as CRON\_SECRET.

The processing logic must remain reliable even if a scheduled execution is delayed or missed.

---

# **8\. Application Functionality Architecture**

## **8.1 Phase 1 — Core Application**

Implement:

* Single-administrator authentication.  
* Database configuration.  
* Transaction creation.  
* Transaction editing and deletion.  
* Category management.  
* Category archiving and restoration.  
* Transaction history.  
* Search and filtering.  
* Recurring schedule creation.  
* Weekly and monthly recurrence.  
* Automatic transaction generation.  
* Missed occurrence catch-up.  
* Schedule editing and cancellation.  
* Initial data backup/export.

Phase 1 must establish a reliable financial data foundation.

## **8.2 Phase 2 — Home and Budget**

Implement:

* Home dashboard.  
* Monthly financial summaries.  
* Income and expense KPIs.  
* Net cash flow.  
* Savings rate.  
* Recent transactions.  
* Monthly navigation.  
* Monthly budgets.  
* Yearly budgets.  
* Budget creation, editing, and deletion.  
* Category-level spending indicators.  
* Budget warnings.  
* Budget history.

Monthly and yearly budgets must remain independently managed.

## **8.3 Phase 3 — Analytics**

Implement:

* Analytics dashboard.  
* Income versus expenses chart.  
* Expense breakdown by category.  
* Historical financial trends.  
* Subscription tracking.  
* Monthly and yearly comparisons.  
* Date range filters.  
* Category filters.  
* Transaction type filters.  
* Budget history visualizations.

## **8.4 Phase 4 — Profile and Refinement**

Implement:

* Personal information settings.  
* Password management.  
* Currency display preferences.  
* Regional formatting preferences.  
* Light and dark appearance modes.  
* CSV exports.  
* Full application backup and restoration.  
* Responsive improvements.  
* Accessibility refinements.

---

# **9\. Progressive Web Application Architecture**

## **9.1 Objective**

Pocket Watch should be installable on an iPhone through Safari's Add to Home Screen functionality.

The application will remain a web application rather than requiring a native iOS application.

## **9.2 PWA Requirements**

Implement:

* Web application manifest.  
* Application name and short name.  
* Custom application icon.  
* iPhone home-screen icon assets.  
* Standalone display mode.  
* Theme and background colours.  
* Responsive layouts.  
* Appropriate iOS status bar presentation.

Use a service worker for appropriate application-shell caching.

## **9.3 Financial Data Caching**

Financial records must not be stored in an unauthenticated or publicly accessible offline cache.

Do not cache authenticated API responses or financial records in shared service-worker caches.

The initial release should prioritize secure online access rather than full offline transaction functionality.

## **9.4 Installation**

The application should be accessible through its Vercel production URL.

On iPhone:

1. Open the application in Safari.  
2. Select the Share icon.  
3. Select Add to Home Screen.  
4. Confirm the application name.  
5. Launch Pocket Watch from the home screen.

---

# **10\. Design System Implementation**

## **10.1 Source of Truth**

The Pocket Watch Figma design system will be the primary visual reference for development.

AI-generated interface decisions must not override established design specifications without approval.

## **10.2 Design Tokens**

Create reusable tokens for:

* Primary and secondary colours.  
* Background colours.  
* Surface colours.  
* Text colours.  
* Income and expense indicators.  
* Typography.  
* Font weights.  
* Spacing.  
* Border radii.  
* Borders.  
* Shadows.  
* Breakpoints.  
* Component states.

Implement tokens using CSS variables and Tailwind CSS configuration.

## **10.3 Component Standards**

Build reusable components for:

* Buttons.  
* Inputs.  
* Select menus.  
* Transaction forms.  
* Transaction lists.  
* Financial KPI cards.  
* Budget progress indicators.  
* Navigation.  
* Dialogs.  
* Notifications.  
* Charts.  
* Empty states.  
* Loading states.

Components must remain consistent across all four primary application destinations.

## **10.4 Responsive Standards**

Desktop is the primary design target.

The application must also support tablet and mobile layouts.

Mobile layouts should prioritize:

* Quick transaction entry.  
* Readable financial figures.  
* Accessible navigation.  
* Touch-friendly controls.  
* Minimal horizontal scrolling.

## **10.5 Accessibility**

Target WCAG 2.2 AA.

Implement:

* Keyboard accessibility.  
* Visible focus indicators.  
* Accessible labels.  
* Appropriate contrast.  
* Semantic HTML.  
* Screen-reader-friendly chart summaries.  
* Status indicators that do not rely on colour alone.

---

# **11\. Testing and Quality Assurance**

## **11.1 Testing Tools**

Use:

* Vitest for unit testing.  
* React Testing Library for component testing.  
* Playwright for end-to-end testing.

## **11.2 Required Test Areas**

**Authentication**

* Valid login.  
* Invalid password.  
* Session persistence.  
* Logout.  
* Unauthorized access.

**Transactions**

* Create income.  
* Create expense.  
* Edit transaction.  
* Delete transaction.  
* Validate amounts and dates.  
* Recalculate affected financial summaries.

**Categories**

* Create categories.  
* Edit categories.  
* Reject duplicates.  
* Archive categories.  
* Restore categories.  
* Preserve historical relationships.

**Recurring Transactions**

* Weekly recurrence.  
* Monthly recurrence.  
* Month-end handling.  
* Missed occurrence catch-up.  
* Duplicate prevention.  
* Schedule editing.  
* Schedule disabling.  
* Individual transaction deletion.

**Budgets**

* Monthly allocations.  
* Yearly allocations.  
* Independent budget calculations.  
* Zero-budget handling.  
* Overspending.  
* Unbudgeted expenses.

**PWA**

* Manifest validation.  
* Installation on iPhone.  
* Responsive behaviour.  
* Session behaviour after relaunch.

## **11.3 Financial Accuracy**

Financial calculation tests must include:

* Zero income.  
* Negative net cash flow.  
* Decimal amounts.  
* Zero budget.  
* Negative remaining budget.  
* Month boundaries.  
* Year boundaries.  
* Multiple transactions within the same category.

---

# **12\. Environment Configuration**

Use environment variables for all credentials and deployment-specific settings.

Required variables:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

ADMIN_AUTH_EMAIL=

CRON_SECRET=

APP_TIME_ZONE=
```

Requirements:

* Never commit real environment values.  
* Maintain `.env.example` with empty placeholders.  
* Never expose the service-role key to client-side code.  
* Use separate development and production configuration.  
* Restrict access to the Vercel and Supabase administration accounts.

---

# **13\. Deployment Architecture**

## **13.1 Source Control**

GitHub will store the application source code in a private repository.

Recommended branches:

* main: Production-ready code.  
* development: Active development.

Use commits to maintain a recoverable development history.

## **13.2 Deployment Workflow**

1. Claude Code develops and modifies the application locally.  
2. Changes are tested locally.  
3. Changes are committed and pushed to GitHub.  
4. Vercel detects the GitHub changes.  
5. Vercel builds and deploys the application.  
6. The production application becomes available through its assigned URL.

## **13.3 Production Infrastructure**

Vercel:

* Hosts the Next.js application.  
* Provides HTTPS.  
* Handles production deployment.  
* Runs scheduled recurring transaction processing.

Supabase:

* Stores financial records.  
* Provides authentication.  
* Enforces database security policies.

GitHub:

* Maintains application source code.  
* Provides version history.

---

# **14\. Backup and Recovery**

## **14.1 Initial Backup**

Phase 1 should support an initial full-data JSON export.

The export should include:

* Transactions.  
* Categories.  
* Budgets.  
* Recurring schedules.  
* Application preferences.

## **14.2 Full Backup and Restoration**

Phase 4 should introduce:

* Complete application-data backup.  
* Backup validation.  
* Restoration workflow.  
* Confirmation before overwriting existing records.

Database backups must be considered separately from application exports.

The free Supabase tier does not include automatic database backups. The application owner must maintain independent copies of exported financial data.

---

# **15\. Development Standards**

Claude Code must follow these standards:

1. Read the PRD and Technical Architecture Document before implementing features.  
2. Follow the Figma design system as the visual source of truth.  
3. Use TypeScript throughout the application.  
4. Keep components modular and reusable.  
5. Separate UI, business logic, and database operations.  
6. Never duplicate financial calculation logic across components.  
7. Validate all financial inputs.  
8. Protect every database operation with server-side authorization.  
9. Use database migrations for schema changes.  
10. Write tests for financial calculations and recurring transaction logic.  
11. Avoid introducing unnecessary dependencies.  
12. Never replace existing working functionality without understanding its dependencies.  
13. Do not implement features outside the approved development phase without authorization.  
14. Document architectural changes.  
15. Never use mock financial data in production.

---

# **16\. Architecture Decisions and Outstanding Questions**

The following decisions should be confirmed before development begins:

| Decision | Proposed approach |
| ----- | ----- |
| Frontend framework | Next.js |
| Programming language | TypeScript |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| Hosting | Vercel Hobby |
| Source control | Private GitHub repository |
| Mobile experience | Progressive Web App |
| Recurring processing | Daily Vercel Cron Job |
| Monetary precision | PostgreSQL NUMERIC |
| Data security | Supabase RLS |
| Design system | Existing Pocket Watch Figma designs |
| Testing | Vitest and Playwright |
| Development assistant | Claude Code |

Additional configuration decisions:

* Confirm the application's IANA timezone.  
* Confirm the initial administrator authentication setup.  
* Confirm the Figma design system and assets.  
* Confirm the initial application icon and branding.

---

# **17\. Definition of Technical Completion**

The architecture will be considered successfully implemented when:

1. Pocket Watch is deployed and accessible through its production URL.  
2. Authentication protects all financial information.  
3. The database persistently stores financial records.  
4. Transactions and categories can be managed.  
5. Recurring schedules generate transactions automatically.  
6. Missed occurrences are recovered without duplication.  
7. Financial calculations use precision-safe monetary handling.  
8. The application follows the approved design system.  
9. The application is installable on an iPhone home screen.  
10. Application functionality is covered by appropriate automated tests.  
11. Data can be exported and recovered through the supported backup workflow.  
12. The application operates within the selected hosting and database service limits.

**Final architecture objective:** Deliver a secure, maintainable, low-cost, single-administrator Progressive Web Application that provides a dependable foundation for all Pocket Watch functionality.

