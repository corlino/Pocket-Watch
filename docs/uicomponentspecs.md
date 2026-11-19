# **POCKET WATCH**

# **UI COMPONENT SPECIFICATIONS**

**Document:** Component Specifications  
**Version:** 1.0  
**Status:** Ready for AI code generation  
**Reference:** Supplied Pocket Watch UI concept screenshot  
**Design system:** Pocket Watch UI/UX Style Guide  
**Platform:** Responsive web application  
**Primary design:** Dark teal mobile-first interface, adapted for desktop

---

# **1\. DOCUMENT PURPOSE**

This document defines the reusable UI components required to recreate the Pocket Watch application based on the supplied visual references.

It establishes:

* Component appearance.  
* Component dimensions.  
* Component hierarchy.  
* Typography.  
* Colours.  
* Spacing.  
* Component variants.  
* Interaction behaviour.  
* Responsive behaviour.  
* Component states.  
* Implementation requirements.

The objective is to give an AI code generator enough detail to implement the interface consistently without independently inventing component styles.

## **1.1 Source of Truth**

Use the following hierarchy:

1. PRD: Defines product functionality and requirements.  
2. TAD: Defines technical architecture and implementation constraints.  
3. Style Guide: Defines the visual identity and global design tokens.  
4. This document: Defines individual component specifications.  
5. Supplied screenshot: Visual reference for the intended appearance.

Where a component's behaviour is not evident from the screenshot, follow the PRD and TAD rather than inventing functionality.

## **1.2 Measurement Conventions**

The screenshot is a composite of multiple mobile screens.

The measurements in this document are recommended implementation values, not verified measurements from the original design file.

Use the specified values as initial component dimensions and adjust them during visual comparison against the supplied reference.

All dimensions are in CSS pixels unless otherwise specified.

---

# **2\. COMPONENT INVENTORY**

The following reusable components have been identified.

## **2.1 Global Components**

| ID | Component | Priority |
| ----- | ----- | ----- |
| G-01 | Status Bar | Medium |
| G-02 | Application Header | High |
| G-03 | User Avatar | Medium |
| G-04 | Notification Button | Medium |
| G-05 | Page Title | High |
| G-06 | Section Header | High |
| G-07 | Bottom Navigation | High |
| G-08 | Floating Action Button | High |
| G-09 | Card Container | High |
| G-10 | Segmented Control | High |
| G-11 | Primary Button | High |
| G-12 | Secondary Button | Medium |
| G-13 | Icon Button | High |
| G-14 | Text Input | High |
| G-15 | Currency Input | High |
| G-16 | Date Input | High |
| G-17 | Select Input | High |
| G-18 | Category Selector | High |
| G-19 | Filter Chips | Medium |
| G-20 | Progress Bar | High |

## **2.2 Financial Components**

| ID | Component | Priority |
| ----- | ----- | ----- |
| F-01 | Current Balance Card | High |
| F-02 | Financial Metric Card | High |
| F-03 | Budget Category Card | High |
| F-04 | Transaction Row | High |
| F-05 | Transaction Group | High |
| F-06 | Financial Activity List | High |
| F-07 | Cash Flow Chart | High |
| F-08 | Monthly Expense Chart | High |
| F-09 | Savings Chart | High |
| F-10 | Budget Comparison Chart | High |
| F-11 | Chart Legend | Medium |
| F-12 | Budget Summary | High |
| F-13 | Subscription Card | High |
| F-14 | Category Icon | High |

## **2.3 Form Components**

| ID | Component | Priority |
| ----- | ----- | ----- |
| FR-01 | Transaction Type Selector | High |
| FR-02 | Transaction Form | High |
| FR-03 | Category Selection Grid | High |
| FR-04 | Add Budget Category Form | High |
| FR-05 | Add Subscription Form | High |
| FR-06 | Form Field Label | High |
| FR-07 | Form Action Button | High |
| FR-08 | Icon Selection Grid | Medium |

## **2.4 Profile Components**

| ID | Component | Priority |
| ----- | ----- | ----- |
| P-01 | Profile Header | High |
| P-02 | Profile Menu Item | High |
| P-03 | Profile Section Header | Medium |
| P-04 | Sign Out Button | High |

---

# **3\. GLOBAL COMPONENT SPECIFICATIONS**

# **G-01: STATUS BAR**

**Purpose:** Display the device status information at the top of mobile screens.

### **Appearance**

The screenshot uses a native-looking mobile status bar.

Elements:

* Current time.  
* Cellular signal.  
* Wi-Fi indicator.  
* Battery indicator.

### **Specifications**

| Property | Value |
| ----- | ----- |
| Height | 24px |
| Background | Transparent / application background |
| Horizontal padding | 10–16px |
| Text size | 10–11px |
| Text weight | Semibold |
| Text colour | Primary white |
| Icon size | 11–13px |

### **Behaviour**

On native mobile applications, use the operating system status bar.

On web applications, do not attempt to recreate a fake operating system status bar unless explicitly required by the visual prototype.

Respect device safe areas.

---

# **G-02: APPLICATION HEADER**

**Purpose:** Introduce the user and provide access to notifications.

**Used on:** Home and Analytics.

### **Structure**

1. User avatar.  
2. Greeting.  
3. User display name.  
4. Notification icon button.

### **Layout**

Use a horizontal flex container.

Avatar and greeting occupy the left side.

Notification button occupies the right side.

### **Specifications**

| Property | Value |
| ----- | ----- |
| Height | 44–52px |
| Horizontal padding | 0px |
| Avatar size | 34–38px |
| Greeting size | 9–10px |
| Display name | 12–14px |
| Notification button | 32–36px |
| Gap | 8–10px |

### **Typography**

Greeting:

* 9–10px.  
* Muted aqua.  
* Regular.

Display name:

* 12–14px.  
* White.  
* Medium or semibold.

### **Behaviour**

* Avatar can open Profile.  
* Notification button opens Notifications, if implemented.  
* Header should adapt to smaller screens.

---

# **G-03: USER AVATAR**

**Purpose:** Display the user's profile image.

### **Variants**

* Small: 32px.  
* Medium: 40px.  
* Large: 88px.

### **Appearance**

* Circular crop.  
* No unnecessary border.  
* Image uses object-fit: cover.  
* Fallback uses user initials.

### **Profile screen**

Use the large variant.

The avatar should be horizontally centered above the user's name and email address.

---

# **G-04: NOTIFICATION BUTTON**

**Purpose:** Provide access to application notifications.

### **Appearance**

* Circular or rounded-square teal surface.  
* Small notification icon.  
* Optional unread indicator.

### **Specifications**

| Property | Value |
| ----- | ----- |
| Width | 34px |
| Height | 34px |
| Radius | 10px |
| Icon size | 16px |
| Background | Surface secondary |
| Icon colour | Secondary text |

### **States**

* Default.  
* Hover.  
* Active.  
* Unread.  
* Disabled.

---

# **G-05: PAGE TITLE**

**Purpose:** Establish the identity of the current screen.

### **Appearance**

The screenshot uses compact white page headings.

Examples:

* My Current Balance.  
* My Analytics.  
* My Budget.  
* Account Settings.

### **Specifications**

| Property | Value |
| ----- | ----- |
| Font size | 16–18px |
| Font weight | 600 |
| Colour | Primary text |
| Line height | 1.3 |
| Margin bottom | 4–6px |

A page subtitle or reporting date may appear beneath the heading.

### **Behaviour**

Page titles must remain visually consistent across all primary destinations.

---

# **G-06: SECTION HEADER**

**Purpose:** Introduce individual sections within a page.

Examples:

* Budget Categories.  
* Cash Flow Insights.  
* Recent Activity.  
* Monthly Budget Summary.  
* Active Subscriptions.

### **Structure**

* Section title.  
* Optional right-aligned action.

Examples:

* View All.  
* View More.  
  * Add.

### **Specifications**

| Property | Value |
| ----- | ----- |
| Font size | 13–15px |
| Weight | 600 |
| Colour | Primary text |
| Action size | 10–12px |
| Bottom margin | 10–12px |

### **Layout**

Horizontal alignment with space-between.

Do not place every section inside an additional card.

---

# **G-07: BOTTOM NAVIGATION**

**Purpose:** Provide persistent access to the application's main sections.

**Used on:** Home, Analytics, Budget, Profile.

### **Structure**

Five navigation positions:

1. Home.  
2. Analytics.  
3. Add Transaction.  
4. Budget.  
5. Profile.

The central Add Transaction action is elevated and visually emphasized.

### **Specifications**

| Property | Value |
| ----- | ----- |
| Height | 58–64px |
| Background | Dark teal elevated surface |
| Border radius | 18–24px |
| Horizontal padding | 8px |
| Navigation icon | 16–18px |
| Navigation label | 9–10px |
| Central button | 48–56px |

### **Appearance**

Default navigation items:

* Muted aqua icon.  
* Muted label.  
* Vertically centered layout.

Active navigation item:

* Yellow or cyan accent icon.  
* Brighter label.  
* Clear active indication.

Central button:

* Bright cyan.  
* Circular.  
* Prominent plus icon.  
* Slight elevation.

### **Behaviour**

* Home opens Home.  
* Analytics opens Analytics.  
* Budget opens Budget.  
* Profile opens Profile.  
* Center button opens Add Transaction.

### **Responsive Behaviour**

On mobile:

* Fixed to bottom.  
* Respect bottom safe-area inset.  
* Content must have sufficient bottom padding to prevent overlap.

On desktop:

* Replace with persistent sidebar navigation.

---

# **G-08: FLOATING ACTION BUTTON**

**Purpose:** Provide quick access to transaction creation.

### **Appearance**

* Circular cyan button.  
* Centered plus icon.  
* Elevated appearance.  
* Strong contrast against background.

### **Specifications**

| Property | Value |
| ----- | ----- |
| Diameter | 52px |
| Icon size | 24px |
| Background | Brand primary |
| Radius | 9999px |
| Shadow | Subtle elevation |

### **Behaviour**

Opens the Add Transaction interface.

Do not navigate away from the current page unnecessarily.

---

# **G-09: CARD CONTAINER**

**Purpose:** Provide a consistent surface for financial information.

### **Variants**

* Standard card.  
* Elevated card.  
* Compact card.  
* Interactive card.  
* Form card.

### **Specifications**

| Property | Standard |
| ----- | ----- |
| Background | Surface primary |
| Border | 1px subtle border |
| Radius | 14px |
| Padding | 14–16px |
| Shadow | Minimal |
| Gap | 8–12px |

### **Behaviour**

Cards should support flexible content.

Avoid creating visually different card styles for identical content types.

Interactive cards should have hover, focus, and pressed states.

---

# **G-10: SEGMENTED CONTROL**

**Purpose:** Switch between closely related views.

**Used on:**

* Budget Categories / Transactions / Subscriptions.  
* Expense / Income.  
* Other relevant filters.

### **Appearance**

Outer container:

* Teal background.  
* Rounded rectangle.  
* Subtle border.

Selected item:

* Elevated lighter teal surface.  
* Bright text.  
* Medium font weight.

Unselected item:

* Muted text.  
* Transparent background.

### **Specifications**

| Property | Value |
| ----- | ----- |
| Height | 34–40px |
| Radius | 9–12px |
| Text size | 11–12px |
| Padding | 8–12px |
| Gap | 2–4px |

### **Behaviour**

Clicking an option switches the selected view.

Only one option may be selected at a time.

The selected state must be clearly visible.

---

# **G-11: PRIMARY BUTTON**

**Purpose:** Execute the main action in a workflow.

Examples:

* Add Transaction.  
* Add Budget Category.  
* Add Subscription.

### **Appearance**

* Bright cyan gradient or solid cyan.  
* Dark teal text.  
* Rounded corners.  
* Medium/semibold font.

The screenshot uses a slightly luminous cyan treatment.

Use a subtle gradient only if it remains consistent with the overall design.

### **Specifications**

| Property | Value |
| ----- | ----- |
| Height | 44–48px |
| Width | Full width in mobile forms |
| Radius | 10–12px |
| Font size | 13–14px |
| Font weight | 600 |
| Background | Brand primary |
| Text | Inverse |

### **States**

* Default.  
* Hover.  
* Pressed.  
* Loading.  
* Disabled.

---

# **G-12: SECONDARY BUTTON**

**Purpose:** Provide supporting actions.

Examples:

* Cancel.  
* View More.  
* View All.

### **Appearance**

* Teal surface.  
* Light text.  
* Subtle border.

### **Specifications**

| Property | Value |
| ----- | ----- |
| Height | 36–44px |
| Radius | 10px |
| Font size | 12–13px |
| Background | Surface secondary |

---

# **G-13: ICON BUTTON**

**Purpose:** Provide compact interface actions.

Examples:

* Close.  
* Edit.  
* Delete.  
* Add.  
* Notifications.  
* More options.

### **Specifications**

| Property | Value |
| ----- | ----- |
| Width | 32–40px |
| Height | 32–40px |
| Radius | 9–12px |
| Icon size | 16–20px |

Use descriptive accessible labels.

---

# **G-14: TEXT INPUT**

**Purpose:** Collect standard text information.

Examples:

* Description.  
* Subscription name.  
* Profile name.

### **Specifications**

| Property | Value |
| ----- | ----- |
| Height | 44–48px |
| Radius | 9–11px |
| Padding | 12px |
| Font size | 13px |
| Background | Surface input |
| Text | Primary |
| Placeholder | Muted |

### **Structure**

* External label.  
* Input.  
* Optional helper text.  
* Optional error message.

### **States**

* Default.  
* Focus.  
* Filled.  
* Error.  
* Disabled.

---

# **G-15: CURRENCY INPUT**

**Purpose:** Collect financial amounts.

**Used in:** Transactions, budgets, subscriptions.

### **Appearance**

The screenshot shows a prominent currency field with a currency symbol and large financial input.

### **Specifications**

| Property | Value |
| ----- | ----- |
| Height | 46–50px |
| Radius | 9–11px |
| Padding | 12px |
| Font size | 15–17px |
| Font weight | 500 |
| Background | Surface input |

### **Behaviour**

* Display the selected currency.  
* Support decimal values.  
* Prevent invalid characters.  
* Format values consistently.  
* Preserve user-entered values after validation errors.

Use a proper decimal-safe financial representation.

Do not use floating-point arithmetic for financial calculations.

---

# **G-16: DATE INPUT**

**Purpose:** Select transaction dates and renewal dates.

### **Appearance**

* Teal input surface.  
* Date placeholder.  
* Calendar icon.  
* Consistent field height.

### **Specifications**

| Property | Value |
| ----- | ----- |
| Height | 42–46px |
| Radius | 9px |
| Font size | 12–13px |
| Icon size | 16px |

### **Behaviour**

Opens a date picker.

Display dates according to the user's selected date format.

---

# **G-17: SELECT INPUT**

**Purpose:** Choose from predefined options.

Examples:

* Category.  
* Billing cycle.  
* Budget period.

### **Specifications**

| Property | Value |
| ----- | ----- |
| Height | 42–46px |
| Radius | 9px |
| Font size | 12–13px |
| Icon | Chevron down |

### **Behaviour**

* Display selected option.  
* Open selectable dropdown.  
* Highlight selected value.  
* Support keyboard navigation.

---

# **G-18: CATEGORY SELECTOR**

**Purpose:** Select an existing transaction or budget category.

### **Variants**

* Compact category selector.  
* Grid category selector.  
* Category list item.

### **Appearance**

Each category contains:

* Category icon.  
* Category name.  
* Optional selection indicator.

### **Behaviour**

Selected category receives:

* Brighter surface.  
* Clear border or indicator.  
* Stronger text.

Category selection must use actual application category data.

---

# **G-19: FILTER CHIPS**

**Purpose:** Filter transaction lists.

**Visible examples:**

* All.  
* Income.  
* Expenses.

### **Appearance**

Pill-shaped controls.

Selected:

* Cyan or teal highlight.  
* Stronger text.

Unselected:

* Dark teal surface.  
* Muted text.

### **Specifications**

| Property | Value |
| ----- | ----- |
| Height | 27–32px |
| Radius | 9999px |
| Horizontal padding | 10px |
| Font size | 10–11px |

---

# **G-20: PROGRESS BAR**

**Purpose:** Communicate spending against an allocated budget.

### **Appearance**

* Rounded track.  
* Coloured fill.  
* Compact height.

### **Specifications**

| Property | Value |
| ----- | ----- |
| Height | 5–7px |
| Radius | 9999px |
| Track | Surface tertiary |
| Fill | Semantic/category colour |

### **States**

Normal:

* Cyan or category colour.

Approaching limit:

* Yellow.

Exceeded:

* Coral.

The visual fill must stop at 100%, even when actual spending exceeds the budget.

Display the true percentage separately.

---

# **4\. FINANCIAL COMPONENT SPECIFICATIONS**

# **F-01: CURRENT BALANCE CARD**

**Reference:** First Home screen.

**Purpose:** Display the user's current financial balance.

### **Structure**

1. Section heading: My Current Balance.  
2. Reporting date.  
3. Large balance value.  
4. Optional comparison with previous month.

### **Appearance**

The balance is displayed directly against the dark teal page background rather than inside a prominent standalone card.

This creates visual hierarchy and makes the balance the main focal point.

### **Specifications**

| Property | Value |
| ----- | ----- |
| Heading | 16px semibold |
| Date | 10px muted |
| Balance | 27–32px |
| Balance weight | 500 |
| Balance colour | White |
| Supporting text | 10–11px |
| Vertical spacing | 6–10px |

### **Behaviour**

The displayed balance must come from the application's financial data.

If a balance comparison is displayed, it must use a consistent comparison period.

Do not invent historical comparisons.

---

# **F-02: FINANCIAL METRIC CARD**

**Reference:** Home and Analytics.

**Purpose:** Display important financial measurements.

### **Visible examples**

* Income.  
* Expenses.  
* Total Budget.  
* Total Spent.  
* Remaining Budget.  
* Savings Rate.

### **Structure**

1. Metric label.  
2. Financial value.  
3. Optional supporting comparison.

### **Appearance**

Compact rectangular teal card.

### **Specifications**

| Property | Value |
| ----- | ----- |
| Padding | 10–12px |
| Radius | 10–12px |
| Label | 9–11px |
| Value | 16–20px |
| Value weight | 600 |
| Supporting text | 9–10px |

### **Variants**

* Income.  
* Expense.  
* Neutral.  
* Positive.  
* Warning.

The component should support different widths depending on the responsive layout.

---

# **F-03: BUDGET CATEGORY CARD**

**Reference:** Home and Budget Categories.

**Purpose:** Display category spending and allocated budget.

### **Structure**

1. Category icon.  
2. Category name.  
3. Allocated budget.  
4. Amount spent.  
5. Remaining amount.  
6. Progress bar.  
7. Optional spending percentage.

### **Appearance**

The screenshot uses colourful category cards with distinct category colours.

Examples:

* Transportation: Purple.  
* Housing: Cyan.  
* Food & Drinks: Turquoise.  
* Shopping: Purple.  
* Savings: Teal.

Use a consistent category colour assignment.

### **Specifications**

| Property | Value |
| ----- | ----- |
| Radius | 10–13px |
| Padding | 10–12px |
| Icon size | 20–24px |
| Category name | 12–13px |
| Allocated amount | 13–15px |
| Supporting values | 9–10px |
| Progress height | 5–6px |

### **Behaviour**

* Display actual category spending.  
* Update progress when transactions change.  
* Display remaining budget.  
* Indicate exceeded budgets.  
* Open category details when clicked, where supported.

### **Responsive Behaviour**

Mobile:

* Cards can use a compact horizontal arrangement or two-column grid, depending on available space.

Desktop:

* Use a responsive grid with consistent card dimensions.

---

# **F-04: TRANSACTION ROW**

**Reference:** Home Recent Activity and Budget Transactions.

**Purpose:** Display an individual financial transaction.

### **Structure**

Left:

* Category icon.  
* Description.  
* Category name.  
* Date.

Right:

* Transaction amount.

### **Appearance**

Compact teal row with:

* Icon container.  
* Stacked text.  
* Right-aligned amount.  
* Subtle divider or surface separation.

### **Specifications**

| Property | Value |
| ----- | ----- |
| Minimum height | 48px |
| Padding | 8–10px |
| Icon container | 28–32px |
| Icon | 16–18px |
| Description | 11–12px |
| Category/date | 9–10px |
| Amount | 11–12px |
| Radius | 8–10px |

### **Amount formatting**

Income:  
`+$2,624.84`

Expense:  
`-$348.52`

### **Behaviour**

* Clicking the row opens transaction details.  
* Editing and deletion should be accessible through an appropriate action menu.  
* Amount and category must reflect stored transaction data.

---

# **F-05: TRANSACTION GROUP**

**Reference:** Budget Transactions screen.

**Purpose:** Organize transactions under category headings.

### **Structure**

1. Category icon.  
2. Category name.  
3. Transaction count.  
4. Expand/collapse chevron.  
5. Transaction rows.

### **Appearance**

A compact header with a subtle separator.

### **Behaviour**

* Clicking the group header expands or collapses its contents.  
* Display the correct transaction count.  
* Preserve expansion state during relevant interactions where practical.

### **Visual hierarchy**

Group title:

* 12–13px.  
* Medium weight.

Transaction row:

* Smaller text.  
* Slightly indented relative to group heading.

---

# **F-06: FINANCIAL ACTIVITY LIST**

**Reference:** Home Recent Activity.

**Purpose:** Present a chronological list of recent transactions.

### **Structure**

1. Section heading.  
2. View All action.  
3. Transaction type filter chips.  
4. Transaction rows.

### **Behaviour**

* All displays all transaction types.  
* Income filters income.  
* Expenses filters expenses.  
* Transactions are sorted chronologically according to the selected view.

### **Empty State**

Display a brief explanation and an action to add the first transaction.

---

# **F-07: CASH FLOW CHART**

**Reference:** Home Cash Flow Insights.

**Purpose:** Compare monthly income and expenses.

### **Chart type**

Grouped vertical bar chart.

### **Structure**

* Chart title.  
* Legend.  
* Vertical bar groups.  
* Month labels.  
* Tooltip.

### **Appearance**

Income:

* Cyan.

Expenses:

* Yellow.

Background:

* Transparent or standard card surface.

Grid:

* Subtle.

### **Specifications**

| Property | Value |
| ----- | ----- |
| Chart height | 110–160px mobile |
| Chart height | 220–280px desktop |
| Bar radius | 3–4px |
| Bar width | 5–8px mobile |
| Axis label | 9–10px |
| Legend | 9–10px |

### **Behaviour**

Hovering or tapping a bar should reveal:

* Month.  
* Income amount.  
* Expense amount.

The chart must resize responsively.

---

# **F-08: MONTHLY EXPENSE CHART**

**Reference:** Analytics screen.

**Purpose:** Compare monthly expenses over time.

### **Chart type**

Grouped vertical bar chart.

### **Visible series**

The screenshot displays:

* Other Expenses.  
* Subscription Expenses.

### **Colours**

Other Expenses:

* Yellow.

Subscription Expenses:

* Coral.

### **Structure**

* Chart heading.  
* Legend.  
* Monthly bars.  
* Month labels.

### **Behaviour**

Display actual monthly expense totals.

Allow access to detailed subscription information where supported.

---

# **F-09: SAVINGS CHART**

**Reference:** Analytics screen.

**Purpose:** Visualize savings performance across reporting months.

### **Appearance**

Horizontal progress-style bars.

Each row contains:

* Month label.  
* Horizontal bar.  
* Percentage or value.

### **Specifications**

| Property | Value |
| ----- | ----- |
| Bar height | 5–7px |
| Month label | 9–10px |
| Value | 9–10px |
| Row gap | 8–10px |

### **Behaviour**

The chart must display actual savings data.

Do not assume that savings percentages can be calculated if the underlying income data is missing.

---

# **F-10: BUDGET COMPARISON CHART**

**Reference:** Analytics screen.

**Purpose:** Compare budget allocations and spending across reporting periods.

### **Appearance**

Stacked information sections grouped by month.

Each month contains:

* Month heading.  
* Category name.  
* Allocated amount.  
* Actual amount.  
* Horizontal comparison bar.

### **Structure**

A vertical list of compact monthly comparison cards.

### **Behaviour**

* Display budget versus actual spending.  
* Use consistent category colours.  
* Highlight over-budget categories.  
* Allow navigation to the corresponding budget period.

---

# **F-11: CHART LEGEND**

**Purpose:** Explain chart series.

### **Appearance**

A small coloured indicator followed by a text label.

### **Specifications**

| Property | Value |
| ----- | ----- |
| Indicator | 6–8px |
| Radius | 2px |
| Label | 9–10px |
| Gap | 4–6px |

Use consistent chart colours.

---

# **F-12: BUDGET SUMMARY**

**Reference:** Budget screen.

**Purpose:** Summarize the user's total budget allocation and spending.

### **Structure**

Top row:

* Total Budget.  
* Total Spent.

Bottom row:

* Currently Remaining.  
* Current Savings Rate, if applicable.

### **Appearance**

A large rounded card containing two-column metric arrangements.

### **Specifications**

| Property | Value |
| ----- | ----- |
| Padding | 16px |
| Radius | 14px |
| Metric label | 9–10px |
| Main value | 18–21px |
| Supporting text | 9–10px |

### **Behaviour**

Update values according to the selected budget period.

---

# **F-13: SUBSCRIPTION CARD**

**Reference:** Budget Subscriptions screen.

**Purpose:** Display individual recurring subscriptions.

### **Structure**

Left:

* Subscription icon.  
* Subscription name.  
* Billing frequency or renewal date.

Right:

* Subscription amount.

### **Appearance**

* Teal surface.  
* Rounded corners.  
* Icon container.  
* Clear amount alignment.

### **Specifications**

| Property | Value |
| ----- | ----- |
| Minimum height | 48px |
| Padding | 9–11px |
| Icon container | 30px |
| Icon size | 17px |
| Name | 11–12px |
| Date | 9–10px |
| Amount | 12px |

### **Behaviour**

* Open subscription details.  
* Allow editing.  
* Allow deletion.  
* Display renewal information.  
* Support the billing cycle defined by the subscription.

### **Subscription Summary**

At the bottom of the subscription list, display:

* Total Monthly Cost.  
* Projected Yearly Cost.

Calculate using the actual subscription records and their billing cycles.

---

# **F-14: CATEGORY ICON**

**Purpose:** Provide consistent category identification throughout the application.

### **Appearance**

Icons use:

* Lucide outline icons.  
* Category-specific background colours.  
* Consistent icon sizing.

### **Visible categories**

* Housing.  
* Food & Drinks.  
* Transport.  
* Entertainment.  
* Shopping.  
* Health.  
* Savings.  
* Other.  
* Salary.  
* Freelance.  
* Investments.  
* Gifts/Other.

### **Behaviour**

Category icons should be sourced from the category definition.

Do not hardcode separate icon implementations in every component.

---

# **5\. FORM COMPONENT SPECIFICATIONS**

# **FR-01: TRANSACTION TYPE SELECTOR**

**Reference:** Add Transaction screens.

**Purpose:** Switch between Expense and Income transaction forms.

### **Appearance**

A two-option segmented control.

Expense:

* Left option.

Income:

* Right option.

Selected option:

* Light elevated surface.  
* Dark text.

Unselected:

* Teal background.  
* Muted text.

### **Specifications**

| Property | Value |
| ----- | ----- |
| Height | 34–38px |
| Radius | 8–10px |
| Font size | 11–12px |
| Options | Equal width |

### **Behaviour**

Expense selection displays expense categories.

Income selection displays income categories.

Changing the selected transaction type must update the category options.

Do not allow an expense category to be assigned to an income transaction.

---

# **FR-02: TRANSACTION FORM**

**Reference:** Add Expense and Add Income screens.

**Purpose:** Create a transaction.

### **Layout**

1. Form header.  
2. Transaction type selector.  
3. Amount.  
4. Description.  
5. Date and time, as depicted in the supplied form concept.  
6. Category selection.  
7. Primary action button.

### **Form Header**

Title:  
Add Transaction.

Right:  
Close button.

### **Specifications**

| Property | Value |
| ----- | ----- |
| Mobile width | Full available width |
| Background | Elevated dark teal |
| Radius | 14–18px |
| Padding | 10–12px |
| Field spacing | 12–16px |

### **Amount Field**

Use Currency Input component.

Default:  
`$0.00`

### **Description**

Placeholder:  
`describe transaction`

The screenshot displays a character counter.

Support a 20-character limit if that limit is confirmed by the PRD.

### **Date and Time**

The screenshot depicts two adjacent inputs:

* Date.  
* Time.

Keep these as separate controls if the existing product requirements require both.

Otherwise, follow the PRD's transaction date specification.

### **Categories**

Use the Category Selection Grid.

Expense and Income should have different available category sets.

### **Primary Action**

Add Transaction.

### **Behaviour**

* Validate required fields.  
* Display field-specific errors.  
* Preserve form values on error.  
* Prevent accidental duplicate submissions.  
* Show success feedback.  
* Close the form after successful creation.

---

# **FR-03: CATEGORY SELECTION GRID**

**Reference:** Add Income and Add Expense.

**Purpose:** Provide an easy way to select transaction categories.

### **Layout**

Two-column grid.

Each category item contains:

* Icon.  
* Category label.

### **Specifications**

| Property | Value |
| ----- | ----- |
| Columns | 2 |
| Gap | 6–8px |
| Item height | 52–60px |
| Radius | 9–11px |
| Icon size | 18–20px |
| Label | 10–11px |

### **Appearance**

Default:

* Teal surface.  
* White icon.  
* White label.

Selected:

* Brighter teal or cyan surface.  
* Stronger contrast.  
* Clear selection indicator.

### **Behaviour**

Only one category may be selected.

The selected category must remain visually highlighted.

---

# **FR-04: ADD BUDGET CATEGORY FORM**

**Reference:** Add Budget Category screen.

**Purpose:** Create a budget allocation.

### **Layout**

1. Form header.  
2. Category selection.  
3. Monthly budget input.  
4. Add Budget Category button.

### **Category Selection**

The screenshot uses a two-column grid.

Visible categories:

* Food & Drinks.  
* Transport.  
* Housing.  
* Entertainment.  
* Health.  
* Shopping.  
* Savings.  
* Other.

### **Specifications**

Category grid:

* Two columns.  
* 8px gap.  
* 52–58px height.  
* Rounded teal surfaces.

Budget input:

* Full width.  
* 46px height.

Primary button:

* Full width.  
* 46px height.

### **Behaviour**

* Select a valid existing category.  
* Enter budget allocation.  
* Validate positive amount.  
* Prevent duplicate active allocations for the same category and period, in accordance with the PRD.  
* Save and display confirmation.

---

# **FR-05: ADD SUBSCRIPTION FORM**

**Reference:** Add Subscription screen.

**Purpose:** Create a recurring subscription record.

### **Layout**

1. Form heading.  
2. Subscription name.  
3. Category.  
4. Amount.  
5. Billing cycle.  
6. Renewal date.  
7. Icon selector.  
8. Primary button.

### **Subscription Name**

Text input.

Placeholder:  
`e.g. Netflix`

The screenshot displays a character counter.

A 20-character limit should be applied only if confirmed by the product requirements.

### **Category**

Dropdown selector.

### **Amount**

Currency input.

Default:  
`$0.00`

### **Billing Cycle**

Dropdown.

The screenshot displays:  
Monthly.

Other options should follow the supported product requirements.

### **Renewal Date**

Date input with calendar icon.

### **Icon Selector**

A grid of selectable icon buttons.

The screenshot uses a compact four-column layout.

Selected icon should have a clear active background.

### **Primary Action**

Add Subscription.

### **Behaviour**

Validate all required fields.

Show the subscription in the subscription list after successful creation.

---

# **FR-06: FORM FIELD LABEL**

**Purpose:** Provide consistent field identification.

### **Appearance**

Small muted aqua text positioned above the input.

### **Specifications**

| Property | Value |
| ----- | ----- |
| Font size | 9–11px |
| Weight | 500 |
| Margin bottom | 5–7px |
| Colour | Secondary text |

Labels should remain visible even after values are entered.

---

# **FR-07: FORM ACTION BUTTON**

**Purpose:** Provide a consistent action area at the bottom of forms.

### **Appearance**

Full-width cyan primary action.

### **Specifications**

* Height: 44–48px.  
* Radius: 10px.  
* Font size: 12–14px.  
* Font weight: 600\.

The button should be separated from the preceding field by 12–16px.

---

# **FR-08: ICON SELECTION GRID**

**Purpose:** Allow selection of an icon for a subscription or custom category.

### **Appearance**

Compact grid of icon-only buttons.

The screenshot uses approximately four columns.

### **Specifications**

| Property | Value |
| ----- | ----- |
| Columns | 4 |
| Item size | 38–44px |
| Gap | 6–8px |
| Icon size | 17–20px |
| Radius | 8–10px |

### **Behaviour**

* Only one icon may be selected.  
* Selected icon receives an active background.  
* Store the selected icon identifier rather than a rendered icon component.

---

# **6\. PROFILE COMPONENT SPECIFICATIONS**

# **P-01: PROFILE HEADER**

**Reference:** Profile screen.

**Purpose:** Display the user's account identity.

### **Structure**

1. Large avatar.  
2. Display name.  
3. Email address.

### **Appearance**

Vertically centered.

Avatar:

* Approximately 88px.

Display name:

* 16–18px.  
* Semibold.

Email:

* 10–11px.  
* Muted aqua.

### **Behaviour**

The profile header is informational.

Editing should be available through the Edit Profile menu item.

---

# **P-02: PROFILE MENU ITEM**

**Reference:** Profile screen.

**Purpose:** Provide access to account settings and application functions.

### **Structure**

Left:

* Icon container.  
* Menu title.  
* Optional description.

Right:

* Chevron.

### **Visible menu items**

Account Settings:

* Edit Profile.  
* Security.  
* Notifications.  
* Privacy.

More:

* Help & Support.  
* Terms & Conditions.

### **Specifications**

| Property | Value |
| ----- | ----- |
| Minimum height | 42–48px |
| Radius | 9–11px |
| Padding | 8–10px |
| Icon container | 28–32px |
| Icon size | 16–18px |
| Title | 11–12px |
| Description | 9–10px |

### **Behaviour**

Clicking a menu item opens the corresponding destination.

Items should have visible hover, focus, and pressed states.

---

# **P-03: PROFILE SECTION HEADER**

**Purpose:** Separate groups of account settings.

Examples:

* Account Settings.  
* More.

### **Appearance**

* Small white heading.  
* Semibold.  
* Consistent spacing above and below.

### **Specifications**

* Font size: 12–13px.  
* Weight: 600\.  
* Margin bottom: 8px.  
* Margin top: 14–18px.

---

# **P-04: SIGN OUT BUTTON**

**Purpose:** Allow the user to end their session.

### **Appearance**

* Full-width or card-width.  
* Coral/red surface.  
* White text.  
* Logout icon.

### **Behaviour**

* Require confirmation where appropriate.  
* End the authenticated session.  
* Redirect to the appropriate authentication screen.

---

# **7\. PAGE-LEVEL COMPONENT COMPOSITION**

The following defines how the reusable components are assembled into the screens shown in the reference image.

## **7.1 HOME SCREEN**

Component hierarchy:

```
HomePage
│
├── ApplicationHeader
│   ├── UserAvatar
│   ├── Greeting
│   └── NotificationButton
│
├── CurrentBalance
│   ├── PageTitle
│   ├── ReportingDate
│   └── BalanceValue
│
├── FinancialMetrics
│   ├── IncomeMetricCard
│   └── ExpenseMetricCard
│
├── BudgetCategoriesSection
│   ├── SectionHeader
│   ├── AddCategoryButton
│   └── BudgetCategoryCards
│
├── CashFlowSection
│   ├── SectionHeader
│   ├── ChartLegend
│   └── CashFlowChart
│
├── RecentActivitySection
│   ├── SectionHeader
│   ├── FilterChips
│   └── FinancialActivityList
│       └── TransactionRow
│
└── BottomNavigation
    └── FloatingActionButton
```

### **Layout**

Mobile:

* Single-column page.  
* Compact vertical spacing.  
* Two-column financial metric grid.  
* Horizontally scrollable budget category cards if matching the reference.  
* Full-width cash flow chart.  
* Stacked transaction rows.

Desktop:

* Sidebar.  
* Wider content area.  
* KPI grid.  
* Two-column supporting sections where appropriate.

## **7.2 ANALYTICS SCREEN**

Component hierarchy:

```
AnalyticsPage
│
├── ApplicationHeader
├── PageTitle
│
├── IncomeExpenseMetrics
│   ├── IncomeMetricCard
│   └── ExpenseMetricCard
│
├── MonthlyBudgetSummary
│   ├── TotalBudget
│   ├── TotalSpent
│   ├── RemainingBudget
│   └── SavingsRate
│
├── SavingsSection
│   └── SavingsChart
│
├── MonthlyExpensesSection
│   └── MonthlyExpenseChart
│
├── BudgetComparisonSection
│   └── BudgetComparisonChart
│
└── BottomNavigation
```

The page should preserve the compact financial dashboard appearance of the reference.

## **7.3 BUDGET SCREEN — CATEGORIES**

```
BudgetPage
│
├── PageTitle
├── ReportingDate
│
├── BudgetSummary
│   ├── TotalBudget
│   └── TotalSpent
│
├── BudgetRemaining
│
├── BudgetNavigation
│   ├── CategoriesTab
│   ├── TransactionsTab
│   └── SubscriptionsTab
│
├── CategoriesSection
│   ├── SectionHeader
│   └── BudgetCategoryCards
│
└── BottomNavigation
```

## **7.4 BUDGET SCREEN — TRANSACTIONS**

```
BudgetPage
│
├── PageTitle
├── BudgetSummary
├── BudgetNavigation
│
├── TransactionsSection
│   ├── SectionHeader
│   ├── TransactionGroup
│   │   ├── CategoryHeader
│   │   └── TransactionRow
│   └── TransactionGroup
│
└── BottomNavigation
```

## **7.5 BUDGET SCREEN — SUBSCRIPTIONS**

```
BudgetPage
│
├── PageTitle
├── BudgetSummary
├── BudgetNavigation
│
├── SubscriptionsSection
│   ├── SectionHeader
│   ├── SubscriptionCard
│   ├── SubscriptionCard
│   └── SubscriptionSummary
│       ├── MonthlyCost
│       └── ProjectedYearlyCost
│
└── BottomNavigation
```

## **7.6 PROFILE SCREEN**

```
ProfilePage
│
├── ProfileHeader
│   ├── UserAvatar
│   ├── DisplayName
│   └── Email
│
├── ProfileSettingsSection
│   ├── ProfileMenuItem
│   ├── ProfileMenuItem
│   ├── ProfileMenuItem
│   └── ProfileMenuItem
│
├── MoreSection
│   ├── ProfileMenuItem
│   └── ProfileMenuItem
│
├── SignOutButton
│
└── BottomNavigation
```

## **7.7 ADD TRANSACTION SCREEN**

```
AddTransactionPage
│
├── FormHeader
├── TransactionTypeSelector
├── CurrencyInput
├── DescriptionInput
├── DateInput
├── TimeInput
├── CategorySelectionGrid
└── PrimaryButton
```

## **7.8 ADD BUDGET CATEGORY SCREEN**

```
AddBudgetCategoryPage
│
├── FormHeader
├── CategorySelectionGrid
├── CurrencyInput
└── PrimaryButton
```

## **7.9 ADD SUBSCRIPTION SCREEN**

```
AddSubscriptionPage
│
├── FormHeader
├── SubscriptionNameInput
├── CategorySelect
├── CurrencyInput
├── BillingCycleSelect
├── RenewalDateInput
├── IconSelectionGrid
└── PrimaryButton
```

---

# **8\. RESPONSIVE COMPONENT RULES**

The reference image primarily depicts mobile screens.

All components must therefore be implemented with mobile behaviour explicitly defined.

## **8.1 Mobile**

Target:  
Below 768px.

Requirements:

* Bottom navigation.  
* Central floating action button.  
* Compact page headers.  
* Single-column primary layouts.  
* Two-column KPI cards where readable.  
* Horizontally scrollable category cards where appropriate.  
* Full-width form buttons.  
* Touch-friendly controls.  
* No unnecessary horizontal scrolling.

## **8.2 Tablet**

Target:  
768px–1023px.

Requirements:

* Adaptive navigation.  
* Two-column financial layouts.  
* Larger chart containers.  
* Flexible category grids.  
* Forms constrained to comfortable widths.

## **8.3 Desktop**

Target:  
1024px and above.

Requirements:

* Persistent sidebar.  
* Main content area.  
* Wider KPI grids.  
* Larger charts.  
* More spacious transaction lists.  
* Responsive card grids.  
* Forms displayed in centered dialogs or structured content panels where appropriate.

## **8.4 Responsive Component Behaviour**

| Component | Mobile | Desktop |
| ----- | ----- | ----- |
| Application Header | Compact horizontal | Compact horizontal |
| Bottom Navigation | Visible | Hidden |
| Sidebar | Hidden | Visible |
| Floating Action | Central bottom | Contextual primary action |
| KPI Cards | Two columns | Three or four columns |
| Category Cards | Compact / horizontal | Responsive grid |
| Transaction Rows | Compact | Expanded |
| Charts | Full width | Larger containers |
| Forms | Full-width sheet/page | Centered dialog/panel |
| Profile Header | Centered | Centered or page-aligned |

---

# **9\. COMPONENT STATES**

All interactive components must have defined states.

## **9.1 Standard States**

* Default.  
* Hover.  
* Focus.  
* Active.  
* Selected.  
* Disabled.  
* Loading.  
* Error.

Not every state applies to every component.

## **9.2 Form States**

Default:

* Empty fields.  
* Placeholder visible.

Focused:

* Cyan border.  
* Visible focus indicator.

Filled:

* Primary text.  
* Standard input background.

Invalid:

* Coral border.  
* Error message.

Disabled:

* Muted appearance.  
* No interaction.

Submitting:

* Loading indicator.  
* Prevent duplicate submissions.

## **9.3 Card States**

Default:

* Standard surface.

Hover:

* Slightly lighter surface.

Selected:

* Brighter border or background.

Disabled:

* Reduced contrast.

## **9.4 Navigation States**

Default:

* Muted icon and text.

Active:

* Highlighted icon and label.

Hover:

* Slightly brighter background.

Focus:

* Visible focus outline.

---

# **10\. COMPONENT ACCESSIBILITY**

All components must support accessible interaction.

Requirements:

* Semantic HTML elements.  
* Keyboard navigation.  
* Visible focus states.  
* Appropriate accessible names.  
* Descriptive labels for icon-only buttons.  
* Screen-reader-readable transaction amounts.  
* Proper input labels.  
* Accessible validation messages.  
* Sufficient colour contrast.  
* Minimum 44px touch targets where practical.  
* Non-colour indicators for financial status.

Charts must provide text summaries or equivalent accessible data.

Dialogs must manage focus appropriately.

The application should target WCAG 2.2 AA.

---

# **11\. COMPONENT IMPLEMENTATION STANDARDS**

## **11.1 Reusability**

Every repeated visual element should be implemented as a reusable component.

Examples:

* One FinancialMetricCard component.  
* One TransactionRow component.  
* One BudgetCategoryCard component.  
* One CategoryIcon component.  
* One PrimaryButton component.

Use component variants rather than duplicate implementations.

## **11.2 Data Separation**

Components should receive data through props.

Example:

```
type FinancialMetricCardProps = {
  label: string;
  value: number;
  currency: string;
  variant?: "income" | "expense" | "neutral";
  comparison?: string;
};
```

A FinancialMetricCard must not calculate its own financial totals.

Financial calculations belong in the appropriate business logic or calculation layer.

## **11.3 Formatting**

Centralize:

* Currency formatting.  
* Date formatting.  
* Percentage formatting.  
* Transaction amount formatting.

Do not implement separate formatting logic inside individual components.

## **11.4 Icons**

Use Lucide icons consistently.

Category icon identifiers should be centrally defined.

Avoid hardcoding icon definitions throughout the application.

## **11.5 Styling**

Use:

* Tailwind CSS.  
* CSS variables.  
* Centralized semantic design tokens.  
* Consistent component variants.

Avoid:

* Inline styling for repeated design values.  
* Arbitrary one-off colours.  
* Duplicate component CSS.  
* Unnecessary dependencies.

## **11.6 Component Documentation**

Every major component should have:

* A clear component name.  
* Defined props.  
* Documented variants.  
* Defined states.  
* A usage example.  
* Appropriate accessibility behaviour.

---

# **12\. RECOMMENDED COMPONENT FILE STRUCTURE**

```
components/
│
├── ui/
│   ├── button.tsx
│   ├── icon-button.tsx
│   ├── input.tsx
│   ├── currency-input.tsx
│   ├── date-input.tsx
│   ├── select.tsx
│   ├── segmented-control.tsx
│   ├── filter-chip.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── progress-bar.tsx
│
├── layout/
│   ├── app-shell.tsx
│   ├── app-header.tsx
│   ├── page-header.tsx
│   ├── sidebar.tsx
│   ├── bottom-navigation.tsx
│   └── floating-action-button.tsx
│
├── financial/
│   ├── current-balance.tsx
│   ├── financial-metric-card.tsx
│   ├── budget-summary.tsx
│   ├── budget-category-card.tsx
│   ├── transaction-row.tsx
│   ├── transaction-group.tsx
│   ├── financial-activity-list.tsx
│   ├── subscription-card.tsx
│   └── category-icon.tsx
│
├── charts/
│   ├── cash-flow-chart.tsx
│   ├── monthly-expense-chart.tsx
│   ├── savings-chart.tsx
│   ├── budget-comparison-chart.tsx
│   └── chart-legend.tsx
│
├── forms/
│   ├── transaction-form.tsx
│   ├── transaction-type-selector.tsx
│   ├── category-selection-grid.tsx
│   ├── budget-category-form.tsx
│   ├── subscription-form.tsx
│   └── icon-selection-grid.tsx
│
└── profile/
    ├── profile-header.tsx
    ├── profile-menu-item.tsx
    ├── profile-section-header.tsx
    └── sign-out-button.tsx
```

This structure is a recommended component organization. Adapt it to the existing TAD and codebase rather than replacing established architecture unnecessarily.

---

# **13\. VISUAL ACCEPTANCE CRITERIA**

The implementation must be visually compared against the supplied screenshot.

## **13.1 Global**

* Dark teal background matches the visual reference.  
* Cyan accents are consistent.  
* White typography is clear and readable.  
* Secondary text uses muted aqua.  
* Cards use consistent radii.  
* Spacing is consistent.  
* Icons use a unified visual style.

## **13.2 Home**

* Current balance is visually prominent.  
* Income and expense cards are aligned.  
* Budget categories display progress.  
* Cash flow chart has two distinct series.  
* Activity filters are visible.  
* Transaction rows are compact and readable.  
* Bottom navigation matches the reference.

## **13.3 Analytics**

* Financial metrics have consistent hierarchy.  
* Monthly savings bars are readable.  
* Monthly expense chart uses the correct series colours.  
* Budget comparison is structured and readable.  
* Charts remain responsive.

## **13.4 Budget**

* Budget summary is prominent.  
* Categories, Transactions, and Subscriptions tabs work.  
* Category cards display spending information.  
* Transaction groups expand and collapse.  
* Subscription cards display amounts and renewal details.  
* Monthly subscription cost is calculated correctly.

## **13.5 Profile**

* Profile avatar is centered.  
* Account name and email are readable.  
* Menu items use consistent icons.  
* Settings are grouped logically.  
* Sign Out is visually distinguishable.

## **13.6 Forms**

* Transaction type selector works.  
* Currency input is consistent.  
* Description fields are consistent.  
* Date inputs are consistent.  
* Category grids use consistent dimensions.  
* Subscription form uses consistent field spacing.  
* Primary buttons are visually consistent.

## **13.7 Responsive**

* Mobile screens match the reference proportions.  
* Bottom navigation does not overlap content.  
* Desktop sidebar replaces mobile navigation.  
* Cards adapt to available width.  
* Forms remain usable on small screens.  
* No unnecessary horizontal overflow.

---

# **14\. AI CODE GENERATOR MASTER INSTRUCTIONS**

Use the following instructions when implementing Pocket Watch.

## **Implementation directive**

Read the complete Pocket Watch PRD, TAD, UI/UX Style Guide, and Component Specifications before beginning development.

The supplied screenshot is the primary visual reference for the appearance of the application.

Recreate its visual identity as closely as practical.

Implement the application using reusable components rather than building each page independently.

### **Mandatory implementation rules**

1. Follow the design tokens established in the Style Guide.  
2. Follow the component properties and specifications in this document.  
3. Use the same components across all relevant pages.  
4. Implement all specified component variants and states.  
5. Preserve the existing technical architecture.  
6. Do not introduce unnecessary dependencies.  
7. Do not invent product features that are not supported by the PRD.  
8. Do not hardcode financial values.  
9. Keep financial calculations separate from presentation components.  
10. Implement mobile and desktop layouts intentionally.  
11. Use consistent spacing and typography.  
12. Ensure all components meet the accessibility requirements.

### **Development workflow**

Implement in the following order:

**Phase 1: Foundation**

* Design tokens.  
* Global typography.  
* Theme system.  
* Shared component styles.

**Phase 2: Core UI**

* Buttons.  
* Inputs.  
* Cards.  
* Selectors.  
* Navigation.  
* Progress bars.

**Phase 3: Financial Components**

* KPI cards.  
* Budget category cards.  
* Transaction rows.  
* Subscription cards.  
* Financial charts.

**Phase 4: Forms**

* Transaction form.  
* Budget form.  
* Subscription form.

**Phase 5: Application Pages**

* Home.  
* Analytics.  
* Budget.  
* Profile.

**Phase 6: Quality Assurance**

* Visual comparison.  
* Responsive testing.  
* Accessibility testing.  
* Functional testing.  
* Error and loading state testing.

### **Final instruction**

Do not treat the supplied screenshot as a loose inspiration.

Treat it as the intended visual direction and recreate the application using the reusable components and design standards defined in this document.

Where exact visual measurements cannot be determined from the screenshot, use the documented recommended dimensions and maintain consistency throughout the application.

---

# **END OF COMPONENT SPECIFICATIONS**

**Pocket Watch — Consistent components. Clear financial information. Unified user experience.**

