# **POCKET WATCH**

## **UI/UX DESIGN SYSTEM & STYLE GUIDE**

**Version:** 1.0  
**Status:** Ready for AI-assisted implementation  
**Product:** Personal finance and budgeting application  
**Design direction:** Modern dark-teal fintech  
**Primary platform:** Responsive web application / Progressive Web Application  
**Default currency:** CAD  
**Technical stack:** Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, Recharts

---

# **1\. DESIGN PHILOSOPHY**

## **1.1 Product Identity**

Pocket Watch is a personal finance application designed to make managing money feel straightforward, organized, and approachable.

The interface should communicate three fundamental qualities:

* **Clarity:** Financial information should be immediately understandable.  
* **Control:** Users should feel confident managing their transactions, budgets, and financial records.  
* **Simplicity:** Every interaction should feel intentional, predictable, and uncomplicated.

The visual identity should feel modern and premium without becoming overly corporate, decorative, or visually overwhelming.

## **1.2 Visual Direction**

The application should follow a modern dark-teal fintech aesthetic.

Its defining characteristics are:

* Deep teal backgrounds.  
* Layered teal surfaces.  
* Bright cyan interactive elements.  
* Subtle gradients.  
* White primary typography.  
* Muted aqua secondary typography.  
* Yellow financial highlights.  
* Restrained use of semantic colours.  
* Rounded corners and soft elevation.  
* Minimalist line-based iconography.

Avoid excessive gradients, unnecessary illustrations, strong shadows, decorative animations, or overly complicated layouts.

The application should feel like a carefully designed financial instrument rather than a generic administration dashboard.

## **1.3 Design Principles**

1. Financial figures take priority over decoration.  
2. Every page should have a clear visual hierarchy.  
3. Components must remain consistent across all application sections.  
4. Interactive elements must look interactive.  
5. Colour must have a consistent semantic meaning.  
6. Information density should never compromise readability.  
7. Responsive layouts must be intentionally designed rather than simply compressed.  
8. Accessibility must be considered from the beginning.

---

# **2\. COLOUR SYSTEM**

## **2.1 Primary Colour Palette**

The following palette establishes the initial design tokens based on the supplied visual references.

These are implementation-ready starting values. They should be reconciled with any existing approved Figma colour values before being treated as immutable brand specifications.

### **Background colours**

| Token | Hex | Usage |
| ----- | ----- | ----- |
| background-primary | \#082F32 | Main application background |
| background-secondary | \#093A3D | Secondary background |
| background-elevated | \#0D474A | Elevated surfaces |
| background-overlay | \#061F21 | Modal overlays |

### **Surface colours**

| Token | Hex | Usage |
| ----- | ----- | ----- |
| surface-primary | \#10494C | Standard cards |
| surface-secondary | \#15585B | Elevated cards |
| surface-tertiary | \#1B6467 | Interactive surfaces |
| surface-input | \#205E61 | Form inputs |
| surface-hover | \#22686B | Hover states |
| surface-active | \#287478 | Selected states |

Cards should generally use a surface colour slightly lighter than their surrounding background.

Avoid using pure black for application surfaces.

### **Brand and accent colours**

| Token | Hex | Usage |
| ----- | ----- | ----- |
| brand-primary | \#28C6D6 | Primary actions |
| brand-primary-hover | \#3BD4E2 | Hover state |
| brand-primary-active | \#159DAD | Pressed state |
| brand-secondary | \#59DFE4 | Secondary highlights |
| brand-soft | \#174F54 | Soft accent surfaces |

Cyan is the primary interactive colour.

Use it for:

* Primary buttons.  
* Active navigation indicators.  
* Selected controls.  
* Important chart series.  
* Interactive links.  
* Floating action buttons.  
* Focus indicators.

Do not use cyan indiscriminately for every piece of information.

## **2.2 Typography Colours**

| Token | Hex | Usage |
| ----- | ----- | ----- |
| text-primary | \#F2FAF9 | Primary headings and figures |
| text-secondary | \#C1D8D8 | Supporting information |
| text-muted | \#91B2B3 | Secondary labels |
| text-disabled | \#64888A | Disabled content |
| text-inverse | \#07383B | Text on bright buttons |

Primary financial figures should always have strong contrast against their backgrounds.

Muted text must remain readable, especially for transaction dates, category labels, chart legends, and helper text.

## **2.3 Financial Semantic Colours**

Financial information requires consistent colour semantics.

| Token | Hex | Meaning |
| ----- | ----- | ----- |
| financial-income | \#66D9BD | Income |
| financial-expense | \#FF8B7B | Expenses |
| financial-neutral | \#D5E4E3 | Neutral values |
| financial-positive | \#67DDB9 | Positive financial performance |
| financial-negative | \#FF8B7B | Negative financial performance |
| financial-warning | \#F4CF67 | Approaching budget limit |
| financial-exceeded | \#FF8B7B | Budget exceeded |

Rules:

* Income transactions should use the income colour.  
* Expense transactions should use the expense colour.  
* Negative cash flow should use the negative semantic colour.  
* Approaching budget limits should use yellow.  
* Exceeded budgets should use the expense/error colour.  
* Neutral figures should use primary typography.

Never use the income colour simply to indicate that a number is positive unless the number represents income or a positive financial outcome.

## **2.4 Chart Palette**

Use a consistent palette across Recharts visualizations.

| Token | Hex | Usage |
| ----- | ----- | ----- |
| chart-cyan | \#39D5E4 | Primary series |
| chart-yellow | \#F4D16A | Secondary series |
| chart-mint | \#6CD8BC | Third series |
| chart-coral | \#FF927E | Fourth series |
| chart-purple | \#A995E8 | Fifth series |
| chart-blue | \#70AEEB | Sixth series |
| chart-muted | \#71999A | Reference data |

For example:

* Income: cyan or mint.  
* Expenses: yellow or coral.  
* Net cash flow: mint.  
* Housing: cyan.  
* Transportation: purple.  
* Shopping: blue.  
* Savings: mint.

Category colours should remain stable across Home, Analytics, and Budget.

## **2.5 Light Appearance Mode**

Light mode must preserve the same Pocket Watch identity.

It should not introduce an unrelated colour scheme.

Suggested token mapping:

| Token | Light mode |
| ----- | ----- |
| background-primary | \#F1F7F6 |
| background-secondary | \#E9F2F1 |
| background-elevated | \#FFFFFF |
| surface-primary | \#FFFFFF |
| surface-secondary | \#E7F1F0 |
| surface-tertiary | \#DCEBE9 |
| surface-input | \#F2F7F6 |
| text-primary | \#153C3D |
| text-secondary | \#466666 |
| text-muted | \#718D8D |
| brand-primary | \#078E9C |
| brand-primary-hover | \#087C89 |
| financial-income | \#168D72 |
| financial-expense | \#C75E50 |
| financial-warning | \#A87917 |

In light mode:

* Cards should use white surfaces.  
* Backgrounds should use pale grey-green.  
* Text should use dark teal.  
* Borders should remain subtle.  
* Brand cyan should become sufficiently dark for readable text and controls.

All components must support both themes through semantic tokens.

The selected appearance must persist between sessions.

---

# **3\. TYPOGRAPHY SYSTEM**

## **3.1 Font Family**

Recommended primary font: **Inter**.

Use Inter throughout the application.

Fallback stack:

`Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

The font should be loaded efficiently using the Next.js font optimization system.

## **3.2 Type Scale**

| Style | Size | Weight | Usage |
| ----- | ----- | ----- | ----- |
| Display | 36px | 600 | Large financial balance |
| H1 | 28px | 600 | Page titles |
| H2 | 22px | 600 | Major sections |
| H3 | 18px | 600 | Card headings |
| H4 | 16px | 600 | Component headings |
| Body Large | 16px | 400 | Important supporting content |
| Body | 14px | 400 | Standard content |
| Body Medium | 14px | 500 | Labels and emphasized content |
| Caption | 12px | 400 | Secondary information |
| Overline | 11px | 500 | Small metadata labels |

Mobile layouts may reduce large heading sizes slightly, but normal body text should not be reduced simply to fit more content.

Avoid using extremely small text.

The supplied mockups use some very small labels. Improve their readability while retaining the compact aesthetic.

## **3.3 Financial Number Typography**

Financial values are among the most important elements in the application.

Use:

* Inter.  
* Font weight 500–600.  
* Tabular numerals.  
* Consistent decimal precision.  
* Appropriate currency formatting.

Enable:

`font-variant-numeric: tabular-nums;`

Examples:

* \$11,291.84  
* \$4,953.92  
* \$2,514.22  
* \-\$348.52

Large financial values should never wrap awkwardly onto multiple lines.

Use responsive font sizing when necessary.

---

# **4\. SPACING & LAYOUT SYSTEM**

## **4.1 Spacing Scale**

Use a consistent 4px-based spacing system.

| Token | Value |
| ----- | ----- |
| space-1 | 4px |
| space-2 | 8px |
| space-3 | 12px |
| space-4 | 16px |
| space-5 | 20px |
| space-6 | 24px |
| space-8 | 32px |
| space-10 | 40px |
| space-12 | 48px |
| space-16 | 64px |

Use these values consistently for padding, margins, gaps, and component layouts.

## **4.2 Application Layout**

Desktop is the primary development target.

The application should use:

* A persistent left sidebar.  
* A central content area.  
* A consistent page header.  
* A responsive content grid.  
* A maximum content width to prevent excessively stretched interfaces.

Recommended desktop layout:

* Sidebar width: 240px.  
* Collapsed sidebar width: 76px.  
* Main content horizontal padding: 32px.  
* Main content maximum width: 1440px.  
* Standard card gap: 16–24px.

The main content area should expand to occupy available space.

## **4.3 Page Structure**

Every main application page should follow a consistent structure:

1. Page heading.  
2. Supporting description or selected reporting period.  
3. Primary actions and filters.  
4. Financial KPI cards, where relevant.  
5. Main content sections.  
6. Supporting information.

Avoid changing the position of major interface elements unnecessarily between pages.

## **4.4 Responsive Breakpoints**

Use the following initial breakpoints:

| Device | Width |
| ----- | ----- |
| Mobile | Below 640px |
| Large mobile / small tablet | 640px–767px |
| Tablet | 768px–1023px |
| Desktop | 1024px–1279px |
| Large desktop | 1280px and above |

Use Tailwind's responsive utilities.

Mobile should not be treated as a scaled-down desktop layout.

It should have its own optimized navigation, spacing, and component arrangements.

---

# **5\. BORDER RADIUS, BORDERS & SHADOWS**

## **5.1 Border Radius**

| Token | Value | Usage |
| ----- | ----- | ----- |
| radius-sm | 6px | Small controls |
| radius-md | 10px | Inputs and buttons |
| radius-lg | 14px | Standard cards |
| radius-xl | 18px | Large cards |
| radius-2xl | 22px | Modal surfaces |
| radius-full | 9999px | Pills and circular buttons |

Cards should generally use 14–18px radii.

Buttons and inputs should generally use 10–12px radii.

The central floating action button should be circular.

## **5.2 Borders**

Use subtle borders to establish separation.

Dark mode:

`1px solid rgba(111, 206, 204, 0.12)`

Light mode:

`1px solid rgba(20, 75, 76, 0.10)`

Borders should never compete with content.

## **5.3 Shadows**

Use restrained elevation.

Recommended dark-mode shadow:

`0 4px 16px rgba(0, 15, 16, 0.18)`

Recommended light-mode shadow:

`0 3px 12px rgba(15, 55, 55, 0.07)`

Use shadows primarily for:

* Dropdown menus.  
* Floating action buttons.  
* Dialogs.  
* Popovers.  
* Elevated cards.

Avoid strong shadows on every card.

---

# **6\. ICONOGRAPHY**

## **6.1 Icon Library**

Use **Lucide Icons** throughout the application.

The icon style should be:

* Minimalist.  
* Outline-based.  
* Consistent in stroke width.  
* Simple and recognizable.

Default icon stroke width: 1.8–2px.

## **6.2 Icon Sizes**

| Size | Usage |
| ----- | ----- |
| 14px | Compact metadata |
| 16px | Small interface actions |
| 18px | Standard controls |
| 20px | Navigation and category icons |
| 24px | Prominent actions |
| 28px | Large category selectors |

Avoid mixing icon libraries or using emoji as substitutes for interface icons.

## **6.3 Recommended Icons**

| Feature | Icon |
| ----- | ----- |
| Home | house |
| Analytics | chart-no-axes-combined |
| Budget | wallet |
| Profile | user-round |
| Add transaction | plus |
| Income | trending-up |
| Expense | trending-down |
| Housing | house |
| Groceries | shopping-basket |
| Transportation | car-front |
| Dining | utensils |
| Entertainment | ticket |
| Shopping | shopping-bag |
| Healthcare | heart-pulse |
| Subscriptions | repeat |
| Savings | piggy-bank |
| Calendar | calendar |
| Search | search |
| Notifications | bell |
| Settings | settings |
| Security | shield-check |
| Export | download |
| Delete | trash-2 |
| Edit | pencil |
| Close | x |
| More options | ellipsis |

Use category-specific icons consistently wherever the category appears.

---

# **7\. COMPONENT DESIGN SYSTEM**

All components must be reusable.

Do not implement visually separate versions of the same component for different pages.

## **7.1 Buttons**

### **Primary button**

Usage:

* Add Transaction.  
* Save Budget.  
* Create Category.  
* Add Subscription.  
* Save Changes.

Appearance:

* Cyan background.  
* Dark teal text.  
* Medium or semibold font.  
* 44–48px standard height.  
* 10–12px border radius.

Hover:

* Slightly brighter cyan.

Active:

* Slightly darker cyan.

Disabled:

* Reduced opacity.  
* No hover animation.  
* Clearly recognizable disabled state.

### **Secondary button**

Usage:

* Cancel.  
* View All.  
* Filters.  
* Secondary page actions.

Appearance:

* Teal surface.  
* Light text.  
* Subtle border.

### **Destructive button**

Usage:

* Delete Transaction.  
* Delete Budget.  
* Remove Category.

Appearance:

* Restrained red/coral treatment.

Destructive actions must always require confirmation when they permanently remove data.

## **7.2 Floating Action Button**

The central Add Transaction action is a defining part of the Pocket Watch interface.

Appearance:

* Circular.  
* Bright cyan.  
* White or dark teal plus icon, depending on contrast.  
* Subtle shadow.  
* Approximately 56px diameter on mobile.

Mobile:

* Positioned centrally within the bottom navigation region.  
* Must remain accessible above the device safe area.

Desktop:

* Use a prominent contextual Add Transaction button in the main interface.  
* A floating action button may be retained if it does not obstruct content.

Clicking the button opens the Add Transaction interface without navigating away from the current page.

## **7.3 Cards**

Standard cards should have:

* Consistent padding.  
* Teal surface.  
* Rounded corners.  
* Subtle border.  
* Clear internal hierarchy.

Recommended padding:

* Desktop: 20px.  
* Mobile: 16px.

Cards should not all have identical visual emphasis.

Use elevated surfaces for important KPIs and standard surfaces for supporting content.

## **7.4 KPI Cards**

KPI cards are used throughout Home, Analytics, and Budget.

Each card should contain:

1. Small descriptive label.  
2. Prominent financial value.  
3. Optional comparison or contextual information.  
4. Optional icon or indicator.

Examples:

**Total Income**  
\$4,953.92

**Total Expenses**  
\$2,514.22

**Net Cash Flow**  
\$2,439.70

**Savings Rate**  
49.25%

KPI cards should be visually consistent.

Use tabular numerals and consistent currency formatting.

Do not introduce arbitrary trends or percentage comparisons when the underlying data does not support them.

## **7.5 Progress Bars**

Budget progress indicators should communicate spending relative to the allocation.

Use:

* Teal track.  
* Cyan fill for normal progress.  
* Yellow fill when approaching the budget limit.  
* Coral fill when the budget is exceeded.

Apply the PRD thresholds consistently:

| Utilization | Appearance |
| ----- | ----- |
| Below 75% | Normal |
| 75–99% | Warning |
| 100% or higher | Exceeded |

The bar should never exceed 100% visually.

However, the displayed percentage may exceed 100%.

Example:

Allocated: \$500  
Spent: \$650  
Remaining: \-\$150  
Utilization: 130%

Display the negative remaining balance rather than hiding or clamping it.

Always provide a numerical value alongside the progress bar.

## **7.6 Inputs**

All inputs should share:

* Consistent height.  
* Rounded corners.  
* Teal surface.  
* Subtle border.  
* Light text.  
* Clear labels.  
* Visible focus states.

Recommended standard height: 44–48px.

Input placeholder text should use muted typography.

Focus state:

* Cyan border.  
* Visible focus ring.  
* No excessive glow.

Invalid state:

* Coral border.  
* Short explanatory message.  
* Appropriate accessible error association.

Do not rely on placeholder text as a replacement for a field label.

## **7.7 Select Menus**

Use consistent custom-styled select controls.

Examples:

* Category.  
* Billing cycle.  
* Month.  
* Year.  
* Transaction type.

Dropdown menus should use elevated teal surfaces and clear selected states.

Long lists should support searching where useful.

## **7.8 Segmented Controls**

Use segmented controls for related views.

Examples:

* Income / Expense.  
* Categories / Transactions.  
* Monthly / Yearly.  
* All / Income / Expenses.

Selected option:

* Contrasting surface.  
* Stronger typography.  
* Clear visual indication.

Unselected options:

* Muted text.  
* Transparent or subtle background.

## **7.9 Dialogs and Drawers**

Use dialogs for:

* Delete confirmations.  
* Important warnings.  
* Short editing workflows.

Use drawers or larger modal surfaces for:

* Transaction entry.  
* Budget creation.  
* Subscription creation.  
* Detailed transaction editing.

On mobile, use a full-height or bottom-sheet presentation when appropriate.

Every dialog must:

* Have a clear heading.  
* Have an explicit close action.  
* Support keyboard navigation.  
* Prevent accidental background interaction.  
* Return focus appropriately when closed.

## **7.10 Notifications**

Use toast notifications for successful actions and non-blocking errors.

Examples:

* Transaction added successfully.  
* Budget updated.  
* Category archived.  
* Subscription saved.  
* Changes could not be saved.

Success notifications should be brief and unobtrusive.

Errors should explain what happened and what the user can do next.

Do not use alerts for routine successful actions.

---

# **8\. NAVIGATION SYSTEM**

## **8.1 Primary Destinations**

Pocket Watch has four primary navigation destinations:

1. Home  
2. Analytics  
3. Budget  
4. Profile

These destinations must remain consistent throughout the application.

## **8.2 Desktop Navigation**

Use a persistent sidebar on desktop.

Recommended structure:

Top:

* Pocket Watch logo and wordmark.

Navigation:

* Home.  
* Analytics.  
* Budget.  
* Profile.

Bottom:

* Optional application version information.  
* User profile shortcut.  
* Logout access.

Active destination:

* Teal elevated background.  
* Cyan icon or indicator.  
* Brighter text.

Inactive destinations:

* Muted text.  
* Muted outline icons.

The sidebar should support a collapsed state.

## **8.3 Mobile Navigation**

Use a persistent bottom navigation bar.

The four destinations should be distributed evenly.

The central Add Transaction action should be visually prominent.

The navigation bar should:

* Respect iOS safe-area insets.  
* Remain above device gesture areas.  
* Avoid covering scrollable content.  
* Use accessible touch targets.  
* Clearly indicate the active destination.

## **8.4 Navigation Transitions**

Navigation should feel immediate.

Avoid elaborate transitions between main sections.

Use subtle content transitions only where they improve continuity.

Preserve the selected reporting period and relevant filter context when navigating between related sections.

---

# **9\. PAGE-SPECIFIC DESIGN SPECIFICATIONS**

# **9.1 HOME — FINANCIAL OVERVIEW**

### **Purpose**

Provide an immediate understanding of the user's financial position and recent activity.

### **Page hierarchy**

1. Greeting and user profile.  
2. Selected reporting month.  
3. Financial KPI cards.  
4. Cash flow visualization.  
5. Budget category overview.  
6. Recent transactions.

### **Header**

Display:

* Greeting.  
* User display name.  
* Profile avatar or initials.  
* Notification shortcut, if notifications are implemented.

Provide month navigation using previous and next controls.

The currently selected month should be easy to identify.

### **Financial KPI section**

Display:

* Total Income.  
* Total Expenses.  
* Net Cash Flow.  
* Savings Rate.

Desktop:

* Four cards in a horizontal row where space permits.

Tablet:

* Two-column arrangement.

Mobile:

* Two-column arrangement, with a single-column fallback on narrow screens.

### **Cash Flow Insights**

Use a bar chart comparing monthly income and expenses.

Chart requirements:

* Income and expense legends.  
* Month labels.  
* Currency values.  
* Interactive tooltips.  
* Clear axis labels.  
* Accessible textual summary.

### **Budget Categories**

Display active monthly budget allocations.

Each category should contain:

* Icon.  
* Category name.  
* Allocated budget.  
* Amount spent.  
* Remaining budget.  
* Utilization percentage.  
* Progress bar.

Allow access to the detailed budget view.

### **Recent Activity**

Display the most recently recorded transactions.

Each row should contain:

* Category icon.  
* Transaction description.  
* Category.  
* Date.  
* Amount.  
* Income or expense indicator.

Expenses should be visually distinguishable from income.

Provide a View All action.

---

# **9.2 ANALYTICS — FINANCIAL INSIGHTS**

### **Purpose**

Provide a detailed understanding of financial behaviour and historical financial performance.

### **Page hierarchy**

1. Page title.  
2. Date and reporting filters.  
3. Financial KPI cards.  
4. Income versus expenses.  
5. Expense breakdown.  
6. Historical trends.  
7. Subscription tracking.  
8. Budget history.

### **Analytics filters**

Provide controls for:

* Date range.  
* Month.  
* Year.  
* Category.  
* Transaction type.

All relevant charts and KPI cards must update when filters change.

Selected filters should be clearly visible and easy to reset.

### **Income vs. Expenses**

Use a grouped bar chart.

Income and expenses must use consistent colours.

The chart should support historical monthly comparisons.

### **Expense Breakdown**

Use a donut chart.

Display:

* Category.  
* Amount.  
* Percentage of total expenses.

The legend should remain readable.

Do not rely exclusively on the chart's colours to identify categories.

### **Monthly Financial Trends**

Use a line or grouped bar chart to show historical financial performance.

Support:

* Income.  
* Expenses.  
* Net cash flow where useful.

Provide appropriate tooltips and date labels.

### **Subscription Tracking**

Subscriptions belong within Analytics.

Display:

* Subscription name.  
* Category.  
* Amount.  
* Billing frequency.  
* Next expected payment.  
* Monthly equivalent cost.

Use compact subscription cards or a structured list.

The visual design must distinguish manually designated subscriptions from ordinary recurring transactions.

Do not imply that subscriptions are automatically synchronized with external providers.

### **Budget History**

Display historical monthly and yearly budget performance.

Keep monthly and yearly allocations independent.

Use charts and structured category comparisons.

---

# **9.3 BUDGET — BUDGET MANAGEMENT**

### **Purpose**

Provide complete control over category-based spending allocations.

### **Page hierarchy**

1. Page heading.  
2. Budget period selector.  
3. Monthly / Yearly selector.  
4. Budget KPI cards.  
5. Category budget list.  
6. Category transaction details.

### **Budget KPIs**

Display:

* Total Budget.  
* Total Spent.  
* Remaining Budget.  
* Budget Utilization.

### **Period selector**

Support:

* Monthly budgets.  
* Yearly budgets.

The selected reporting period must be obvious.

Monthly and yearly budgets must never be visually or mathematically combined.

### **Category budget cards**

Each category should display:

* Category icon.  
* Category name.  
* Allocated amount.  
* Amount spent.  
* Remaining amount.  
* Utilization.  
* Progress indicator.

Clicking a category should reveal its associated transactions within the selected reporting period.

### **Budget management actions**

Allow:

* Create allocation.  
* Edit allocation.  
* Delete allocation.

Creating an allocation should use an existing active expense category.

Archived categories must not appear as new budget options.

### **Budget warnings**

Use the established 75%, 100% thresholds.

Warnings should remain subtle and informative.

Avoid aggressive red alerts for ordinary spending progress.

---

# **9.4 PROFILE — PERSONALIZATION & SETTINGS**

### **Purpose**

Centralize application preferences, personal information, security, and data management.

### **Page hierarchy**

1. Profile information.  
2. Account settings.  
3. Appearance.  
4. Regional preferences.  
5. Category management.  
6. Data management.  
7. Logout.

### **Profile information**

Display:

* Profile image or initials.  
* Display name.  
* Relevant account information.

Allow the display name to be edited.

### **Security**

Provide:

* Change password.  
* Security information.  
* Logout.

Sensitive actions should require appropriate confirmation.

### **Appearance**

Provide a clear theme selector:

* Dark.  
* Light.  
* System, if system-following behaviour is implemented.

Persist the selected preference.

### **Regional preferences**

Provide:

* Display currency.  
* Date format.  
* Number format.

Changing currency must not convert or modify stored financial amounts.

### **Category Management**

Provide a dedicated interface for managing income and expense categories.

Support:

* Create.  
* Edit.  
* Archive.  
* Restore.

Archived categories must remain visible in historical records.

### **Data Management**

Provide:

* CSV transaction export.  
* Full application-data export.  
* Data restoration when implemented.

Restoration must include validation and explicit confirmation before overwriting existing data.

---

# **10\. FORM DESIGN SPECIFICATIONS**

All forms should use a consistent layout and validation pattern.

## **10.1 Transaction Entry**

The Add Transaction interface is one of the most important workflows.

It should be accessible from all primary destinations.

### **Form fields**

1. Transaction type.  
2. Amount.  
3. Description.  
4. Date.  
5. Category.  
6. Notes.  
7. Recurring designation.

### **Transaction type**

Use a segmented control:

* Expense.  
* Income.

The selected type should determine which categories are available.

### **Amount**

Use a prominent currency input.

Display the current currency preference.

Validate:

* Amount must be greater than zero.  
* Maximum two decimal places.  
* Invalid characters are rejected.

### **Description**

Optional text field.

### **Date**

Default to the current date.

Allow historical and future dates.

### **Category**

Display a selectable category grid or dropdown.

Use category icons.

Only active categories belonging to the selected transaction type should be available.

### **Notes**

Optional multiline field.

### **Recurring designation**

Provide an enable/disable control.

When enabled, reveal:

* Weekly recurrence.  
* Monthly recurrence.

Explain that generated transactions will be created automatically.

### **Form actions**

Primary:  
Add Transaction.

Secondary:  
Cancel.

Show a success notification after saving.

Do not clear or discard user input when validation fails.

## **10.2 Add Budget Category**

Fields:

* Category.  
* Budget amount.  
* Period type.  
* Relevant month or year.

Use the same input and button components as the transaction form.

## **10.3 Add Subscription**

Fields:

* Subscription name.  
* Category.  
* Amount.  
* Billing cycle.  
* Renewal date.  
* Icon.

Use a clear billing-cycle selector.

Display the calculated monthly equivalent where appropriate.

---

# **11\. CHART & DATA VISUALIZATION STANDARDS**

Use Recharts for financial visualizations.

All charts must follow the Pocket Watch colour system.

### **Chart containers**

* Teal surface.  
* Standard card radius.  
* Consistent padding.  
* Clear chart title.  
* Supporting description where useful.  
* Legends and tooltips.

### **Grid lines**

Use subtle low-contrast grid lines.

Avoid prominent borders and heavy axis decoration.

### **Tooltips**

Tooltips should use:

* Elevated teal surface in dark mode.  
* White surface in light mode.  
* Clear category labels.  
* Formatted monetary values.  
* Corresponding series indicators.

### **Chart responsiveness**

Charts must resize naturally with their containers.

Avoid fixed desktop chart widths.

### **Accessibility**

Every chart must provide an accessible textual summary or equivalent data representation.

Colour must not be the only method of distinguishing series.

Provide meaningful labels and values.

### **Data accuracy**

Charts must always reflect the underlying transaction data and active filters.

Do not use mock financial figures in production.

---

# **12\. INTERACTION & MOTION DESIGN**

Pocket Watch should feel responsive without becoming animated or distracting.

## **12.1 Transition Timing**

| Interaction | Duration |
| ----- | ----- |
| Button hover | 120ms |
| Button press | 80ms |
| Card hover | 150ms |
| Dropdown | 150ms |
| Modal | 180ms |
| Page content transition | 180ms |

Use ease-out transitions.

## **12.2 Interaction Feedback**

Provide subtle feedback for:

* Button hover.  
* Button press.  
* Selected tabs.  
* Active navigation.  
* Input focus.  
* Successful form submission.  
* Loading operations.  
* Destructive actions.

Avoid unnecessary movement or bouncing.

## **12.3 Reduced Motion**

Respect the operating system's reduced-motion preference.

When enabled:

* Remove nonessential transitions.  
* Avoid animated chart entrances.  
* Disable decorative motion.

---

# **13\. STATES & ERROR HANDLING**

Every reusable component and page must support relevant interface states.

## **13.1 Loading**

Use skeleton placeholders for:

* KPI cards.  
* Transaction lists.  
* Budget categories.  
* Analytics charts.

Avoid flashing empty layouts while data loads.

## **13.2 Empty States**

Empty states should explain what is missing and what action the user can take.

Examples:

No transactions:

"Nothing here yet. Add your first transaction to start tracking your finances."

No budget:

"You haven't created a budget for this period."

No subscriptions:

"No subscriptions added yet."

No analytics data:

"Not enough financial activity to display this chart."

Empty states should use minimal iconography and a clear action where appropriate.

## **13.3 Error States**

Errors must:

* Explain the issue in plain language.  
* Preserve user-entered information where possible.  
* Provide a recovery action.  
* Avoid exposing internal technical details.

## **13.4 Success States**

Use small toast notifications.

Do not interrupt the user's workflow with unnecessary success dialogs.

## **13.5 Destructive States**

Deleting transactions or budgets must require confirmation.

Deleting an individual recurring transaction must not imply cancellation of its recurring schedule.

Disabling a recurring schedule should have a separate, explicit action.

---

# **14\. RESPONSIVE DESIGN RULES**

## **14.1 Desktop**

Desktop is the primary design target.

Use:

* Persistent sidebar.  
* Main content grid.  
* Horizontal KPI cards.  
* Multi-column layouts.  
* Larger chart containers.  
* Structured tables where appropriate.

## **14.2 Tablet**

Use:

* Collapsed or compact sidebar.  
* Two-column KPI layouts.  
* Adaptive chart layouts.  
* Stacked supporting sections.

Ensure controls remain comfortably accessible.

## **14.3 Mobile**

Use:

* Bottom navigation.  
* Central Add Transaction action.  
* Single-column content where necessary.  
* Two-column KPI cards where readable.  
* Full-width primary buttons.  
* Touch-friendly controls.  
* Bottom-sheet forms when appropriate.

Avoid horizontal scrolling for standard application content.

Tables should become structured transaction cards or use carefully designed responsive alternatives.

## **14.4 Touch Targets**

Interactive controls should generally have a minimum 44px touch target.

Provide sufficient spacing between adjacent actions.

Account for iOS safe-area insets.

---

# **15\. ACCESSIBILITY STANDARDS**

Target WCAG 2.2 AA.

Required standards:

* Appropriate foreground/background contrast.  
* Semantic HTML.  
* Keyboard navigation.  
* Visible focus indicators.  
* Descriptive form labels.  
* Accessible error messages.  
* Screen-reader-friendly buttons.  
* Accessible dialog behaviour.  
* Meaningful chart summaries.  
* Non-colour indicators for financial status.  
* Reduced-motion support.  
* Logical heading hierarchy.

Financial warning states must include text labels or icons alongside their colours.

Do not use low-contrast muted typography for essential information.

Accessibility should be tested in both appearance modes.

---

# **16\. DESIGN TOKEN IMPLEMENTATION**

All design values must be centralized.

Implement CSS variables in the global stylesheet.

Suggested structure:

```
:root {
  /* Dark theme */
  --background: #082F32;
  --background-secondary: #093A3D;

  --surface: #10494C;
  --surface-elevated: #15585B;
  --surface-input: #205E61;

  --brand: #28C6D6;
  --brand-hover: #3BD4E2;

  --text-primary: #F2FAF9;
  --text-secondary: #C1D8D8;
  --text-muted: #91B2B3;

  --income: #66D9BD;
  --expense: #FF8B7B;
  --warning: #F4CF67;

  --border: rgba(111, 206, 204, 0.12);

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 18px;
  --radius-2xl: 22px;

  --shadow-card:
    0 4px 16px rgba(0, 15, 16, 0.18);
}

[data-theme="light"] {
  --background: #F1F7F6;
  --background-secondary: #E9F2F1;

  --surface: #FFFFFF;
  --surface-elevated: #FFFFFF;
  --surface-input: #F2F7F6;

  --brand: #078E9C;
  --brand-hover: #087C89;

  --text-primary: #153C3D;
  --text-secondary: #466666;
  --text-muted: #718D8D;

  --income: #168D72;
  --expense: #C75E50;
  --warning: #A87917;

  --border: rgba(20, 75, 76, 0.10);

  --shadow-card:
    0 3px 12px rgba(15, 55, 55, 0.07);
}
```

The final implementation should extend this structure to include all spacing, typography, chart, interaction, and component tokens.

Tailwind should reference these variables instead of duplicating hardcoded colours throughout components.

Use semantic token names rather than naming components after specific colours.

---

# **17\. RECOMMENDED COMPONENT ARCHITECTURE**

Build reusable components using the existing Next.js, React, TypeScript, Tailwind CSS, and shadcn/ui architecture.

Suggested component organization:

```
components/
  ui/
    button.tsx
    input.tsx
    select.tsx
    dialog.tsx
    dropdown-menu.tsx
    tabs.tsx
    badge.tsx
    tooltip.tsx

  layout/
    app-shell.tsx
    page-header.tsx
    sidebar.tsx
    mobile-navigation.tsx
    content-container.tsx

  shared/
    kpi-card.tsx
    financial-value.tsx
    progress-bar.tsx
    empty-state.tsx
    loading-state.tsx
    error-state.tsx
    confirmation-dialog.tsx
    toast-provider.tsx

  transactions/
    transaction-form.tsx
    transaction-list.tsx
    transaction-item.tsx
    transaction-filters.tsx
    transaction-type-selector.tsx

  categories/
    category-icon.tsx
    category-selector.tsx
    category-card.tsx
    category-form.tsx

  budgets/
    budget-card.tsx
    budget-summary.tsx
    budget-form.tsx
    budget-progress.tsx

  analytics/
    income-expense-chart.tsx
    expense-breakdown-chart.tsx
    financial-trend-chart.tsx
    chart-tooltip.tsx
    analytics-filters.tsx
    subscription-list.tsx
```

Keep business logic and financial calculations outside presentation components.

Use centralized formatting utilities for dates and monetary values.

Use the centralized financial calculation module defined by the TAD.

---

# **18\. DESIGN CONSISTENCY RULES**

The following rules are mandatory:

1. Do not introduce new colours without updating the design token system.  
2. Do not introduce arbitrary border-radius values.  
3. Do not use multiple icon libraries.  
4. Do not create page-specific button styles.  
5. Do not duplicate existing reusable components.  
6. Do not hardcode financial calculations inside UI components.  
7. Do not use inconsistent currency formatting.  
8. Do not rely on colour alone to communicate transaction types or budget status.  
9. Do not use decorative gradients excessively.  
10. Do not use unnecessarily small typography.  
11. Do not allow mobile navigation to obscure content.  
12. Do not create a different visual language for light mode.  
13. Do not introduce unnecessary animation.  
14. Do not use mock financial data in production.  
15. Do not alter established design tokens without documenting the change.

The supplied Pocket Watch visual concepts should remain the primary visual reference.

The design system must remain consistent across all four primary application destinations.

---

# **19\. AI CODE GENERATOR IMPLEMENTATION INSTRUCTIONS**

The following instructions should be treated as implementation constraints.

## **19.1 Before Development**

Read the complete:

* Pocket Watch PRD.  
* Pocket Watch Technical Architecture Document.  
* Pocket Watch UI/UX Style Guide.

The PRD defines product requirements.

The TAD defines technical architecture.

This document defines visual design and interface behaviour.

All three documents must be respected.

## **19.2 Implementation Priority**

Implement the design system in the following order:

**Stage 1 — Foundations**

* Global CSS variables.  
* Colour tokens.  
* Typography.  
* Spacing.  
* Border radii.  
* Shadows.  
* Dark and light themes.

**Stage 2 — Core Components**

* Buttons.  
* Inputs.  
* Select menus.  
* Cards.  
* Dialogs.  
* Toast notifications.  
* Tabs.  
* Progress bars.

**Stage 3 — Application Layout**

* Desktop sidebar.  
* Mobile navigation.  
* Page header.  
* Responsive content container.  
* Floating transaction action.

**Stage 4 — Feature Components**

* KPI cards.  
* Transaction components.  
* Category components.  
* Budget components.  
* Chart components.  
* Subscription components.

**Stage 5 — Page Implementation**

* Home.  
* Analytics.  
* Budget.  
* Profile.

**Stage 6 — Refinement**

* Responsive testing.  
* Accessibility testing.  
* Interaction states.  
* Loading and error states.  
* Light mode verification.  
* Visual consistency review.

## **19.3 Technical Constraints**

* Use TypeScript throughout.  
* Use Tailwind CSS for styling.  
* Customize shadcn/ui components to match the design system.  
* Use Recharts for charts.  
* Use Lucide icons.  
* Keep components modular.  
* Use CSS variables for design tokens.  
* Avoid unnecessary dependencies.  
* Preserve existing working functionality.  
* Do not implement features outside the approved PRD scope without authorization.

## **19.4 Visual Quality Requirements**

The generated application must not look like a generic shadcn/ui dashboard.

Default shadcn/ui styling must be customized.

The final interface should closely reflect the supplied Pocket Watch design references.

The AI code generator must prioritize:

* Visual consistency.  
* Financial readability.  
* Appropriate information density.  
* High-quality spacing.  
* Consistent component styling.  
* Responsive behaviour.  
* Accessible interaction patterns.

---

# **20\. FINAL DESIGN ACCEPTANCE CHECKLIST**

The design system is considered successfully implemented when the following requirements are satisfied.

### **Visual identity**

* Dark teal theme matches the Pocket Watch design direction.  
* Cyan is consistently used for primary interactions.  
* Financial semantic colours are consistent.  
* Typography follows the defined hierarchy.  
* Cards and controls use consistent radii.  
* Spacing follows the design scale.  
* Iconography is consistent.

### **Components**

* Buttons have consistent states.  
* Inputs have consistent states.  
* KPI cards are reusable.  
* Budget progress indicators use consistent thresholds.  
* Dialogs and drawers are consistent.  
* Notifications are consistent.  
* Loading and empty states are implemented.

### **Navigation**

* Desktop sidebar works correctly.  
* Mobile bottom navigation works correctly.  
* Add Transaction is accessible throughout the application.  
* Active navigation states are clear.  
* Mobile safe areas are respected.

### **Pages**

* Home displays the required financial KPIs.  
* Analytics displays financial charts and subscription tracking.  
* Budget supports independent monthly and yearly allocations.  
* Profile supports the required settings.  
* All pages share the same visual language.

### **Accessibility**

* WCAG 2.2 AA is the target.  
* Keyboard navigation works.  
* Focus states are visible.  
* Text contrast is sufficient.  
* Chart information is accessible.  
* Colour is not the sole status indicator.  
* Reduced-motion preferences are respected.

### **Responsive behaviour**

* Desktop layout is polished.  
* Tablet layout is usable.  
* Mobile layout is optimized.  
* No unnecessary horizontal scrolling.  
* Touch targets are appropriately sized.

### **Technical implementation**

* Design tokens are centralized.  
* Dark and light themes work.  
* Components are reusable.  
* Financial logic is separated from UI.  
* No unnecessary dependencies are introduced.  
* No mock financial data appears in production.

---

# **END OF POCKET WATCH UI/UX STYLE GUIDE**

**Design philosophy:** Clear finances. Complete control. Less complexity.

**Visual identity:** Modern dark-teal fintech with cyan accents.

**Implementation objective:** A polished, accessible, responsive, and consistent financial management application that faithfully reflects the Pocket Watch visual direction.

