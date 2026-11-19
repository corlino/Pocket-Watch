# **Pocket Watch**

## **Product Requirements Document (PRD)**

**Version:** 1.0  
**Status:** Finalized for Phase 1 development  
**Product type:** Standalone personal finance web application  
**Platform:** Cloud-hosted responsive web application  
**Primary user:** Single administrator  
**Default currency:** CAD  
**Last updated:** November 19, 2026

---

# **1\. Product Overview**

## **1.1 Product Description**

Pocket Watch is a standalone personal finance and budgeting application designed to help an individual track, manage, and understand their monthly financial activity.

The application provides a centralized environment where the user can manually record income and expenses, organize transactions into customizable categories, establish monthly and yearly budgets, and analyze financial trends through interactive dashboards and visualizations.

Pocket Watch will not connect to external banking institutions, payment providers, or financial management services. All financial information will be entered manually by the user.

The application is intended to provide a simple, private, and accessible way to monitor personal finances without the complexity of a comprehensive financial management platform.

## **1.2 Product Vision**

Create a clean, intuitive, and visually engaging personal finance application that makes tracking money straightforward while helping the user develop a better understanding of their spending habits.

Three core principles:

* **Control:** Give the user complete control over their financial information and budgeting categories.  
* **Clarity:** Make financial activity easy to understand through accessible data visualization and reporting.  
* **Simplicity:** Minimize friction when entering transactions and reviewing financial information.

## **1.3 Problem Statement**

Many personal finance applications rely on integrations with external financial institutions, automated transaction synchronization, and complex account management features.

These capabilities can introduce unnecessary complexity for someone who simply wants to track their spending and income manually.

Pocket Watch addresses this by providing a lightweight, standalone alternative focused on manual transaction entry, personalized budgeting, and meaningful financial insights.

---

# **2\. Product Goals & Objectives**

## **2.1 Primary Goals**

1. Allow users to quickly record and manage personal financial transactions.  
2. Provide a centralized overview of monthly income, expenses, and net cash flow.  
3. Allow users to establish and monitor customizable monthly and yearly budgets.  
4. Present financial information through meaningful charts, graphs, and KPI indicators.  
5. Maintain persistent financial records that remain accessible between sessions.  
6. Provide secure, password-protected access to the application.

## **2.2 Success Criteria**

The application will be considered successful when:

* Users can create, edit, and delete transactions without difficulty.  
* All transactions are correctly categorized and reflected in financial summaries.  
* Monthly income and expenses are calculated accurately.  
* Budget allocations and spending progress update automatically.  
* Analytics reflect the underlying transaction data.  
* Recurring transactions are generated according to their schedules without duplication.  
* Financial records persist after logging out or closing the browser.  
* Unauthorized users cannot access the application's financial information.

## **2.3 Non-Goals**

The following functionality is outside the initial scope:

* Bank account integrations.  
* Automatic transaction synchronization from external providers.  
* Payment processing or money transfers.  
* Multiple user accounts.  
* Shared budgets or household accounts.  
* Investment portfolio management.  
* Credit score monitoring.  
* Financial advice or automated investment recommendations.  
* Third-party financial application integrations.  
* AI-powered financial recommendations.  
* Automatic currency conversion.

These features should not influence the architecture of the initial application unless necessary for foundational functionality.

---

# **3\. Target User**

## **3.1 Primary User**

Pocket Watch is designed for one individual who wants to manually monitor personal financial activity.

The user is expected to:

* Record income and expenses as they occur.  
* Organize transactions into relevant categories.  
* Establish monthly and yearly spending limits.  
* Review financial performance over time.  
* Identify spending patterns and recurring expenses.

There is no requirement to accommodate multiple user types, permissions, or administrative roles.

## **3.2 Primary User Needs**

| User Need | Application Solution |
| ----- | ----- |
| Track spending | Manual transaction entry |
| Understand income | Income tracking and reporting |
| Monitor expenses | Categorized expense tracking |
| Control spending | Monthly and yearly category budgets |
| Understand financial habits | Analytics and visualizations |
| Review historical activity | Monthly and historical transaction views |
| Protect financial information | Password-protected access |
| Maintain financial records | Persistent storage and backups |

---

# **4\. Application Architecture & Navigation**

The application will contain four primary navigation destinations:

1. Home  
2. Analytics  
3. Budget  
4. Profile

A persistent navigation system should allow users to move between these sections without losing context.

A prominent transaction-entry action should be accessible throughout the application.

## **4.1 Home — Financial Overview**

**Purpose:** Provide a high-level overview of the user's current financial position and recent activity.

### **FR-HOME-001: Monthly Financial Summary**

Display the following KPI cards:

* Total Income.  
* Total Expenses.  
* Net Cash Flow.  
* Savings Rate.

All figures should reflect the currently selected month.

Net Cash Flow \= Total Income \- Total Expenses.

Savings Rate \= (Net Cash Flow / Total Income) × 100\.

If income is zero, savings rate should display as unavailable.

### **FR-HOME-002: Monthly Navigation**

Allow the user to navigate between calendar months.

Changing the selected month should update all relevant financial summaries, budget information, and transaction listings.

Historical months with no transactions should remain accessible.

### **FR-HOME-003: Recent Transactions**

Display a list of recently recorded transactions.

Each transaction should include:

* Transaction description.  
* Category.  
* Transaction date.  
* Amount.  
* Income or expense indicator.

Provide access to the complete transaction history.

### **FR-HOME-004: Budget Overview**

Display a summary of active monthly budgets.

Each category should display:

* Category name.  
* Allocated budget.  
* Amount spent.  
* Remaining budget.  
* Percentage of budget used.

### **FR-HOME-005: Quick Transaction Entry**

Provide a prominent action that opens the transaction-entry interface.

The user should be able to add a transaction without navigating away from the Home page.

---

## **4.2 Analytics — Financial Insights**

**Purpose:** Provide a detailed understanding of financial activity through data visualization, reporting, and historical comparisons.

### **FR-AN-001: Analytics Overview**

Display KPI cards for:

* Total Income.  
* Total Expenses.  
* Net Cash Flow.  
* Savings Rate.

### **FR-AN-002: Income vs. Expenses**

Provide a chart comparing income and expenses over time.

The user should be able to view monthly financial performance and identify changes in spending.

### **FR-AN-003: Expense Breakdown**

Provide a visualization of expenses grouped by category.

Recommended visualization: Donut chart.

Each category should display its corresponding total and percentage of overall expenses.

### **FR-AN-004: Monthly Financial Trends**

Provide a historical chart showing income and expenses over time.

The user should be able to identify financial patterns across multiple months.

### **FR-AN-005: Subscription Tracking**

Provide a dedicated view of subscription-related expenses.

Subscriptions should be identified using recurring expense transactions and their associated category or subscription designation.

Display:

* Subscription name.  
* Amount.  
* Billing frequency.  
* Next expected payment date.  
* Monthly equivalent cost.

Subscription tracking will initially be manual. The application will not automatically charge, verify, or synchronize subscriptions.

A recurring transaction is not automatically a subscription. Recurring income and non-subscription expenses must also be supported.

### **FR-AN-006: Analytics Filters**

Allow the user to filter analytics by:

* Date range.  
* Month.  
* Year.  
* Transaction category.  
* Transaction type.

All visualizations should update according to selected filters.

### **FR-AN-007: Historical Comparison**

Allow users to compare financial performance across different months and years.

The application should support comparisons of income, expenses, and net cash flow.

### **FR-AN-008: Budget History**

Provide historical views of monthly and yearly budget allocations and their corresponding spending.

Monthly and yearly budget allocations must be displayed independently.

The application should allow the user to review:

* Allocated budget.  
* Actual expenses.  
* Remaining budget.  
* Budget utilization.

---

## **4.3 Budget — Budget Management**

**Purpose:** Allow the user to create, manage, and monitor monthly and yearly spending limits.

### **FR-BUD-001: Budget Overview**

Display KPI cards for:

* Total Budget.  
* Total Amount Spent.  
* Remaining Budget.  
* Overall Budget Utilization.

Budget Utilization \= (Total Amount Spent / Total Budget) × 100\.

If no budget has been established, display an appropriate empty state.

If the total budget is zero, utilization should display as unavailable rather than causing a calculation error.

### **FR-BUD-002: Budget Categories**

Display all categories with an allocation for the selected budget period.

Each category should include:

* Category name.  
* Category icon or visual identifier.  
* Budget allocation.  
* Amount spent.  
* Remaining amount.  
* Spending progress indicator.

### **FR-BUD-003: Create Budget**

Allow users to create a budget allocation for an existing, active expense category.

The user must specify:

* Budget category.  
* Budget amount.  
* Budget period.  
* Relevant month or year.

Budget amounts may be zero or greater.

Archived categories cannot receive new budget allocations.

### **FR-BUD-004: Edit Budget**

Allow users to modify existing budget allocations.

Changes should automatically update relevant financial summaries.

### **FR-BUD-005: Delete Budget**

Allow users to remove an existing budget allocation without deleting the associated transaction category or historical transactions.

### **FR-BUD-006: Transactions by Category**

Selecting a budget category should display all associated transactions within the selected budget period.

The user should be able to review individual transactions and their amounts.

### **FR-BUD-007: Budget Warnings**

Provide subtle visual indicators when a category approaches or exceeds its budget.

Suggested thresholds:

* Below 75%: Normal.  
* 75–99%: Approaching budget limit.  
* 100% or higher: Budget exceeded.

These thresholds should remain consistent throughout the application.

Negative remaining balances are valid and should be displayed when spending exceeds the allocated budget.

### **FR-BUD-008: Monthly Budget Management**

Allow users to establish individual budget allocations for each calendar month.

Each month must operate independently.

Budget allocations must not automatically carry forward from previous months.

Historical monthly allocations must remain available for review.

### **FR-BUD-009: Yearly Budget Management**

Allow users to establish individual budget allocations for each calendar year.

Yearly budgets must operate independently from monthly budgets.

A yearly allocation is not a parent budget or a sum of monthly allocations.

The same category can have a monthly budget and a yearly budget simultaneously.

Both allocations must be independently tracked and reported.

### **FR-BUD-010: Unbudgeted Categories**

Transactions assigned to an expense category without a budget allocation must still:

* Appear in transaction history.  
* Contribute to total expenses.  
* Appear in analytics.  
* Be included in category expense breakdowns.

The absence of a budget must never prevent a transaction from being recorded.

---

## **4.4 Profile — Personalization & Settings**

**Purpose:** Provide access to personal information, security settings, and application preferences.

### **FR-PRO-001: Personal Information**

Allow the user to view and update their display name.

### **FR-PRO-002: Authentication Management**

Allow the administrator to change their existing password.

### **FR-PRO-003: Currency Preferences**

Allow the user to select their preferred display currency.

Initial default: CAD.

Currency is strictly a display-formatting preference.

Changing the display currency must not automatically convert previously recorded transaction amounts.

The application must:

* Preserve the original numerical transaction values.  
* Never perform currency conversion.  
* Use the stored numerical values consistently in all calculations.  
* Allow the user to manually convert foreign-currency purchases before recording them.

### **FR-PRO-004: Regional Preferences**

Allow the user to customize:

* Date format.  
* Number formatting.  
* Preferred currency display.

### **FR-PRO-005: Appearance**

Support light and dark appearance modes.

The selected appearance should persist between sessions.

### **FR-PRO-006: Category Management**

Allow users to create, edit, archive, restore, and manage income and expense categories.

### **FR-PRO-007: Data Export**

Allow users to export transaction history in CSV format.

### **FR-PRO-008: Data Backup**

Provide an option to download a complete backup of application data.

The backup should include:

* Transactions.  
* Categories.  
* Budgets.  
* Recurring schedules.  
* Relevant preferences.

### **FR-PRO-009: Logout**

Allow users to securely terminate their current session.

---

# **5\. Transaction Management**

Transaction management is the foundational feature of Pocket Watch. All financial summaries, budgets, and analytics rely on transaction records.

## **5.1 Transaction Entry**

### **FR-TRANS-001: Create Transaction**

Users must be able to manually create a transaction through a dedicated entry form.

Required fields:

| Field | Requirement |
| ----- | ----- |
| Transaction Type | Income or Expense |
| Category | Required |
| Amount | Required |
| Date | Required |

Optional fields:

* Description.  
* Notes.  
* Recurring transaction designation.

### **FR-TRANS-002: Transaction Types**

Users must select between:

* Income.  
* Expense.

Available categories must change according to the selected transaction type.

### **FR-TRANS-003: Amount Validation**

Transaction amounts must:

* Be greater than or equal to zero only where permitted for budgets; transaction amounts themselves must be greater than zero.  
* Support decimal values to two decimal places.  
* Reject invalid characters and unsupported values.  
* Be stored using a precision-safe monetary representation.

### **FR-TRANS-004: Transaction Date**

The transaction date should default to the current date.

Users must be able to select previous dates for historical transactions.

Future-dated transactions may be entered but must not affect reporting periods before their transaction date.

### **FR-TRANS-005: Save Transaction**

Selecting Add Transaction should save the record and update all relevant financial summaries.

The application should provide confirmation when a transaction is successfully saved.

### **FR-TRANS-006: Edit Transaction**

Users must be able to modify previously recorded transactions.

Changes should automatically recalculate affected dashboards, category totals, and budget utilization.

### **FR-TRANS-007: Delete Transaction**

Users must be able to delete existing transactions.

A confirmation step should prevent accidental deletion.

Deleting an individual recurring transaction must not automatically cancel its recurring schedule.

### **FR-TRANS-008: Transaction History**

Provide a complete transaction history with:

* Date.  
* Description.  
* Category.  
* Transaction type.  
* Amount.  
* Recurring indicator, where applicable.

Transactions should be displayed in reverse chronological order by default.

### **FR-TRANS-009: Search and Filtering**

Users should be able to search and filter transactions by:

* Description.  
* Category.  
* Transaction type.  
* Date range.  
* Month.  
* Year.

### **FR-TRANS-010: Duplicate Transactions**

The application should permit transactions with identical amounts and categories.

The user may legitimately make the same purchase multiple times.

The application should not automatically reject transactions based on matching amounts or descriptions.

### **FR-TRANS-011: Recurring Designation**

Users can enable or disable recurring functionality when creating a transaction.

Recurring functionality must be available for both income and expenses.

A recurring transaction must retain its original:

* Transaction type.  
* Category.  
* Amount.  
* Description.  
* Notes.

Recurring transactions must be identifiable in transaction history.

### **FR-TRANS-012: Recurrence Interval**

Users can select between:

* Weekly: Generate a transaction every seven calendar days.  
* Monthly: Generate a transaction on the corresponding calendar day of the following month.

Only weekly and monthly recurrence intervals are supported initially.

### **FR-TRANS-013: Initial Transaction Date**

The initial transaction date defaults to the current date.

The first transaction must be saved immediately when the user selects Add Transaction.

The first future transaction must be calculated from the original transaction date.

The user must not need to manually enter the next payment date.

### **FR-TRANS-014: Automatic Transaction Generation**

The application must automatically create new transactions when their scheduled recurrence dates are reached.

The generated transaction must inherit the recurring schedule's:

* Transaction type.  
* Category.  
* Amount.  
* Description.  
* Notes.

Each generated transaction must be stored as an independent transaction record.

Generated transactions must:

* Appear in transaction history.  
* Contribute to financial summaries.  
* Contribute to relevant budget calculations.  
* Appear in analytics.  
* Retain their scheduled transaction date.

A recurring schedule must not generate duplicate transactions for the same scheduled occurrence.

Recurring transactions must be automatically generated on their scheduled date through server-side scheduled processing. The application must not generate future transactions in advance. Each transaction should only be created once its scheduled date has been reached.

### **FR-TRANS-015: Disable Recurring Transactions**

Users must be able to disable recurring functionality on an existing schedule.

Disabling recurrence must:

* Prevent future transactions from being generated.  
* Preserve previously generated transactions.  
* Preserve historical financial records.  
* Retain the schedule's historical relationship where appropriate.

### **FR-TRANS-016: Edit Recurring Schedules**

Editing an individual generated transaction must only modify that transaction.

Editing the recurring schedule must affect future transactions only.

Historical transactions must never be retroactively modified by schedule changes.

The updated schedule must retain its future recurrence behavior.

### **FR-TRANS-017: Delete Individual Recurring Transactions**

Deleting an individual transaction generated by a recurring schedule must not automatically cancel the recurring schedule.

Future scheduled transactions must continue to be generated unless the schedule is explicitly disabled.

### **FR-TRANS-018: Missed Recurring Transactions**

The application must identify missed recurring transactions and generate all outstanding occurrences when scheduled processing next runs.

For example, if the application is unavailable for three scheduled weekly occurrences, all three missed transactions must be generated with their original scheduled dates.

The application must:

* Generate every missed occurrence.  
* Preserve the correct historical transaction dates.  
* Avoid duplicate generation.  
* Continue the schedule from its original recurrence pattern.  
* Process missed occurrences automatically without requiring manual entry.

### **FR-TRANS-019: Monthly Recurrence Date Handling**

Monthly recurrence follows calendar months rather than fixed 30-day intervals.

The recurring schedule should retain its original intended day of the month.

If the intended day does not exist in a particular month, use the final calendar day of that month.

For example:

* January 31 → February 28\.  
* February 28 → March 31\.

The original recurrence anchor must be preserved so shorter months do not permanently change the intended recurrence day.

---

# **6\. Category Management**

## **6.1 Default Categories**

The application should include predefined categories to simplify initial setup.

Suggested expense categories:

* Housing.  
* Groceries.  
* Transportation.  
* Dining & Restaurants.  
* Entertainment.  
* Shopping.  
* Utilities.  
* Healthcare.  
* Personal Care.  
* Subscriptions.  
* Travel.  
* Education.  
* Other Expenses.

Suggested income categories:

* Salary.  
* Freelance.  
* Investments.  
* Gifts.  
* Bonuses.  
* Other Income.

## **6.2 Custom Categories**

**FR-CAT-001:** Users can create new categories.

**FR-CAT-002:** Users can assign a name and optional icon to each category.

**FR-CAT-003:** Categories must be associated with either Income or Expense.

**FR-CAT-004:** Users can edit category names and icons.

**FR-CAT-005:** Category names must be unique within their respective transaction types.

**FR-CAT-006:** Duplicate category names within the same transaction type must be rejected.

**FR-CAT-007:** Categories associated with historical transactions must not be permanently deleted in a way that breaks historical reporting.

Categories with existing transactions should be archived rather than permanently deleted.

**FR-CAT-008:** Archived categories must remain visible on historical transactions.

**FR-CAT-009:** Archived categories must not be available for new transactions or new budget allocations.

**FR-CAT-010:** Archived categories may retain existing historical budget allocations.

**FR-CAT-011:** Users must be able to restore archived categories.

**FR-CAT-012:** Renaming a category must update its displayed name across associated historical transactions.

**FR-CAT-013:** Categories must be available across Home, Analytics, Budget, and transaction-management interfaces where relevant.

---

# **7\. Data Model & Relationships**

The application must use a persistent database to store financial information.

## **7.1 Administrator**

A single administrator record should exist to associate application settings and authentication credentials.

Fields:

* Internal Record ID.  
* Display Name.  
* Password Hash.  
* Must Change Password.  
* Created At.  
* Updated At.

The administrator does not need to enter a username or user ID when logging in.

## **7.2 Transactions**

Fields:

* Transaction ID.  
* Transaction Type.  
* Category ID.  
* Amount.  
* Description.  
* Notes.  
* Transaction Date.  
* Recurring Schedule ID (nullable).  
* Created At.  
* Updated At.

Transaction amounts must be stored using a precision-safe monetary representation.

## **7.3 Categories**

Fields:

* Category ID.  
* Category Name.  
* Category Type.  
* Icon.  
* Archived Status.  
* Created At.  
* Updated At.

## **7.4 Budgets**

Fields:

* Budget ID.  
* Category ID.  
* Allocated Amount.  
* Budget Period Type (Monthly or Yearly).  
* Budget Period Identifier.  
* Created At.  
* Updated At.

A category may have one monthly allocation per calendar month and one yearly allocation per calendar year.

Monthly and yearly allocations must be independent.

## **7.5 Recurring Schedules**

Recurring schedules must be stored separately from individual transactions.

Fields:

* Schedule ID.  
* Transaction Type.  
* Category ID.  
* Amount.  
* Description.  
* Notes.  
* Recurrence Interval (Weekly or Monthly).  
* Original Start Date.  
* Next Scheduled Date.  
* Active Status.  
* Created At.  
* Updated At.

Each generated transaction should reference its originating schedule.

A unique schedule-and-occurrence relationship must prevent duplicate transaction generation.

## **7.6 Application Preferences**

Fields:

* Administrator Record ID.  
* Currency Display Preference.  
* Date Format.  
* Number Format.  
* Appearance Preference.  
* Created At.  
* Updated At.

## **7.7 Data Relationships**

* One administrator owns all application data.  
* One category can be associated with multiple transactions.  
* One category can have multiple monthly and yearly budget allocations.  
* Each transaction belongs to one category.  
* Each budget belongs to one expense category and one reporting period.  
* One recurring schedule can generate multiple transactions.  
* Each generated transaction may reference one recurring schedule.  
* Recurring schedules must remain independent of historical transaction records.

Transactions must be stored independently of budget allocations so historical records remain intact when budgets change.

---

# **8\. Financial Calculations & Business Logic**

All financial metrics must be derived from underlying transaction records rather than independently stored totals.

## **8.1 Core Calculations**

**Total Income**

Sum of all income transactions within the selected reporting period.

**Total Expenses**

Sum of all expense transactions within the selected reporting period.

**Net Cash Flow**

Total Income \- Total Expenses.

**Savings Rate**

(Net Cash Flow / Total Income) × 100\.

If income is zero, display unavailable.

Negative savings rates are valid.

**Budget Remaining**

Allocated Budget \- Actual Expenses.

**Budget Utilization**

(Actual Expenses / Allocated Budget) × 100\.

If the allocated budget is zero, display unavailable.

**Monthly Subscription Cost**

Convert recurring subscription amounts into monthly equivalents based on billing frequency.

Suggested conversion:

* Weekly: Amount × 52 / 12\.  
* Monthly: Amount.  
* Annual, if introduced later: Amount / 12\.

**Yearly Budget Reporting**

Yearly budget calculations must use transactions within the corresponding calendar year.

Monthly and yearly budget utilization must be calculated independently.

## **8.2 Calculation Rules**

* Income and expenses must be calculated independently.  
* Only transactions within the selected date range should contribute to reporting.  
* Expense totals must be positive amounts in storage, with transaction type determining their financial classification.  
* Editing or deleting transactions must update all relevant calculations.  
* Historical reporting must remain accurate when categories are renamed or archived.  
* A category's budget utilization must only include expense transactions assigned to that category.  
* Income transactions must not contribute to expense budget utilization.  
* Transactions without budget allocations must still contribute to expense reporting.  
* Monthly and yearly budgets must remain independent.  
* Changing currency preferences must not alter stored transaction amounts.  
* Negative budget balances are valid.  
* Financial calculations must avoid floating-point precision errors.

## **8.3 Monthly and Yearly Reporting**

Monthly reporting should follow calendar months.

Yearly reporting should follow calendar years.

For example:

* November 2026 includes November 1–30, 2026\.  
* 2026 includes January 1–December 31, 2026\.

The application should support historical periods even when no transactions have been recorded.

---

# **9\. Authentication & Security**

## **9.1 Authentication Requirements**

Pocket Watch is intended for a single administrator and must not require public account registration.

The application should open with the following login message:

**"Hello Colin, password please."**

The login interface should contain:

* Password input.  
* Login action.  
* Appropriate invalid-password feedback.

No username or user ID should be requested.

The initial administrator credential should be provisioned securely during deployment.

**FR-SEC-001:** Users must authenticate before accessing financial information.

**FR-SEC-002:** Passwords must be securely hashed using a modern password-hashing algorithm such as Argon2id or bcrypt.

**FR-SEC-003:** Login attempts must be rate-limited.

**FR-SEC-004:** Sessions must expire after a configurable period of inactivity.

**FR-SEC-005:** The administrator must be able to change their password.

**FR-SEC-006:** Authentication credentials must never be stored in plaintext.

**FR-SEC-007:** The initial administrator must be required to establish a stronger password before public deployment.

**FR-SEC-008:** Public registration must not be available.

## **9.2 Data Security**

* All application traffic must use HTTPS.  
* Database access must be restricted.  
* Sensitive authentication information must not be exposed to the frontend.  
* Application sessions should use secure, appropriately configured cookies.  
* Financial records must only be accessible through authenticated application requests.  
* Backups must be handled securely.  
* Server-side authorization must protect all financial data operations.  
* The initial password must not be hardcoded into source code or committed to version control.

## **9.3 Account Recovery**

Because the application supports only one administrator and does not require email integration, password recovery should be handled through a documented owner-controlled recovery process.

The recovery mechanism must not create an unauthenticated route to financial data.

## **9.4 Security Scope**

Multi-factor authentication, social login, and multiple account permissions are not required for the initial release.

---

# **10\. Data Persistence & Backup**

## **10.1 Persistent Storage**

Financial information must remain available after:

* Closing the browser.  
* Refreshing the application.  
* Logging out.  
* Restarting the device.  
* Returning to the application in a later session.

The application must use a persistent database rather than relying exclusively on browser local storage.

## **10.2 Backup & Recovery**

Users should be able to:

* Export transactions as CSV.  
* Download a complete application-data backup.  
* Restore data from a valid backup.

Restoration must include validation and confirmation before existing data is overwritten.

Backups should preserve relationships between transactions, categories, budgets, recurring schedules, and preferences.

## **10.3 Data Ownership**

All financial information belongs to the user.

The application must not sell, share, or transmit financial data to third-party financial services.

## **10.4 Cloud Hosting**

Pocket Watch will be hosted online using a privately controlled application environment and database.

The application must:

* Be accessible through a web browser.  
* Require authentication before accessing financial information.  
* Maintain persistent cloud database storage.  
* Support secure communication between frontend and backend.  
* Support scheduled recurring transaction processing.  
* Maintain backups independently of the user's browser or device.

---

# **11\. UX & UI Requirements**

## **11.1 Design Direction**

Pocket Watch should have a modern personal-finance interface that prioritizes clarity and ease of use.

The visual design should feel polished without becoming overly decorative or complex.

Recommended design characteristics:

* Clean, minimalist layouts.  
* Clear typographic hierarchy.  
* Consistent spacing and component styles.  
* Neutral foundational color palette.  
* Distinct visual treatment for income and expenses.  
* Accessible data visualizations.  
* Consistent iconography.  
* Subtle interaction feedback.  
* Responsive layouts.

## **11.2 Responsive Behavior**

The application should support:

* Desktop.  
* Tablet.  
* Mobile.

Desktop should be the primary design target, with layouts adapting appropriately for smaller screens.

## **11.3 Interaction Requirements**

* Navigation should be consistent across pages.  
* Transaction entry should require minimal interaction.  
* Important financial figures should be easy to locate.  
* Charts should include meaningful labels and supporting values.  
* Forms should provide clear validation feedback.  
* Destructive actions should require confirmation.  
* Empty states should explain what the user can do next.  
* Loading and error states should be handled appropriately.

## **11.4 Accessibility**

The application should aim to meet WCAG 2.2 AA accessibility standards.

This includes:

* Sufficient color contrast.  
* Keyboard-accessible controls.  
* Appropriate focus indicators.  
* Descriptive labels.  
* Accessible chart summaries.  
* Avoiding reliance on color alone to communicate financial status.

---

# **12\. MVP Scope & Development Phases**

## **Phase 1 — Core Application**

**Objective:** Establish the foundational application, authentication, financial data model, and transaction management system.

Features:

* Single-administrator authentication.  
* Initial password provisioning and password management.  
* Persistent cloud database.  
* Transaction creation.  
* Transaction editing and deletion.  
* Income and expense categories.  
* Custom category creation.  
* Category editing, archiving, and restoration.  
* Transaction history.  
* Search and filtering.  
* Recurring transaction schedules.  
* Weekly and monthly recurrence.  
* Automatic recurring transaction generation.  
* Missed recurrence catch-up.  
* Recurring schedule editing and cancellation.  
* Currency storage and formatting rules.  
* Initial backup capability.

**Completion criteria:** The administrator can securely access the application, manage categories and transactions, establish recurring schedules, and retrieve financial records across sessions.

## **Phase 2 — Home & Budget**

**Objective:** Introduce financial summaries and budget management.

Features:

* Home dashboard.  
* Monthly income and expense summaries.  
* Net cash flow.  
* Savings rate.  
* Recent transactions.  
* Monthly budgets.  
* Yearly budgets.  
* Budget creation, editing, and deletion.  
* Category spending indicators.  
* Monthly and yearly navigation.  
* Budget utilization calculations.  
* Budget warnings.

**Completion criteria:** The user can understand financial activity and monitor independent monthly and yearly category allocations.

## **Phase 3 — Analytics**

**Objective:** Introduce deeper financial insights.

Features:

* Analytics dashboard.  
* Income vs. expenses charts.  
* Spending breakdown.  
* Monthly financial trends.  
* Subscription tracking.  
* Historical comparisons.  
* Budget history.  
* Date and category filters.

**Completion criteria:** The user can identify financial trends and understand how spending changes over time.

## **Phase 4 — Profile & Refinement**

**Objective:** Complete application customization and data-management functionality.

Features:

* Personal information settings.  
* Currency display preferences.  
* Date formatting.  
* Light and dark modes.  
* Category management refinements.  
* CSV exports.  
* Full data backup and restoration.  
* Final responsive improvements.  
* Accessibility improvements.

**Completion criteria:** The application provides a complete, customizable, and maintainable personal finance experience.

---

# **13\. Acceptance Criteria**

| ID | Acceptance Criteria |
| ----- | ----- |
| AC-001 | Administrator can access the application using their password. |
| AC-002 | Unauthenticated users cannot access financial information. |
| AC-003 | User can create an income transaction. |
| AC-004 | User can create an expense transaction. |
| AC-005 | User can assign transactions to categories. |
| AC-006 | User can edit and delete transactions. |
| AC-007 | Transaction totals update after relevant changes. |
| AC-008 | User can create and customize categories. |
| AC-009 | Duplicate category names within the same type are rejected. |
| AC-010 | Archived categories retain historical transaction relationships. |
| AC-011 | User can establish recurring income and expense transactions. |
| AC-012 | Weekly recurring transactions are generated every seven days. |
| AC-013 | Monthly recurring transactions follow calendar-month rules. |
| AC-014 | Missed recurring transactions are generated without duplication. |
| AC-015 | Editing a recurring schedule does not alter historical transactions. |
| AC-016 | Deleting an individual recurring transaction does not cancel its schedule. |
| AC-017 | Disabling a recurring schedule prevents future generation. |
| AC-018 | Currency preference changes do not modify stored numerical amounts. |
| AC-019 | User can create monthly budgets. |
| AC-020 | User can create yearly budgets. |
| AC-021 | Monthly and yearly budgets operate independently. |
| AC-022 | Budget utilization reflects actual expenses. |
| AC-023 | Unbudgeted transactions still contribute to expense totals. |
| AC-024 | Home dashboard reflects the selected reporting month. |
| AC-025 | Analytics accurately reflect stored transactions. |
| AC-026 | User can review historical financial activity. |
| AC-027 | Financial records persist across sessions. |
| AC-028 | User can securely log out. |

---

# **14\. Assumptions & Constraints**

1. Pocket Watch is exclusively for one individual.  
2. All transactions are manually entered or generated from user-configured recurring schedules.  
3. The initial default currency display is CAD.  
4. Currency selection is a formatting preference only.  
5. No currency conversion is performed by the application.  
6. Budgets operate on calendar-month and calendar-year bases.  
7. Monthly and yearly budget allocations are independent.  
8. Expense categories are the only categories that receive budget allocations.  
9. Subscription tracking is based on manually configured recurring expense transactions.  
10. Recurring transactions support weekly and monthly intervals only.  
11. Missed recurring transactions must be generated when scheduled processing next runs.  
12. Historical transactions must remain available indefinitely unless explicitly deleted.  
13. The application does not require external financial integrations.  
14. The application is cloud-hosted and accessible through a web browser.  
15. A persistent cloud database is required.  
16. A single administrator account is required.  
17. Public registration is not supported.  
18. The application must be deployable without complex infrastructure or unnecessary ongoing paid integrations.

---

# **15\. Technical Decisions & Implementation Constraints**

The following constraints must be respected during development.

## **15.1 Financial Data Integrity**

* Monetary values must use precision-safe storage.  
* Currency formatting must remain separate from financial calculations.  
* Transaction records must not depend on budget records.  
* Historical transaction dates must not be modified by recurring schedule updates.  
* All financial summaries must be derived from stored transaction data.

## **15.2 Recurring Transaction Reliability**

* Recurring schedules must be stored independently.  
* Scheduled generation must run server-side.  
* The system must catch up missed occurrences.  
* Generation must be idempotent: processing the same occurrence more than once must never create duplicate transactions.  
* Original scheduled dates must be preserved.  
* Monthly recurrence must retain its original day-of-month anchor.  
* Disabling a schedule must prevent further generation.

## **15.3 Database Integrity**

* Category relationships must remain valid when categories are renamed or archived.  
* Duplicate category names within a category type must be prevented.  
* Duplicate category/month budget allocations must be prevented.  
* Duplicate category/year budget allocations must be prevented.  
* Duplicate recurring schedule occurrences must be prevented.  
* Destructive operations must preserve historical relationships where required.

## **15.4 Cloud Infrastructure**

* Frontend and backend responsibilities must be separated appropriately.  
* Sensitive credentials must be stored securely.  
* Authentication must be enforced server-side.  
* Scheduled tasks must operate independently of the browser.  
* Database backups must be supported.  
* The application must use HTTPS.

---

# **16\. Final Product Definition**

Pocket Watch is a single-administrator, cloud-hosted personal finance and budgeting application focused on manual transaction management, recurring transactions, independent monthly and yearly budgeting, and financial analytics.

The application will provide four primary destinations: Home, Analytics, Budget, and Profile.

Its foundational functionality will allow users to record income and expenses, organize transactions into customizable categories, establish recurring transaction schedules, and maintain persistent financial records.

The application will build upon this foundation with monthly financial summaries, category-level budgeting, subscription tracking, and historical data visualization.

Security, simplicity, and data ownership are central considerations throughout the product.

The initial release should remain intentionally focused, avoiding unnecessary integrations and complex financial functionality while providing a polished and dependable personal finance experience.

**Product objective:** Give the user a clear, reliable, and centralized understanding of where their money comes from, where it goes, and how they manage it.

