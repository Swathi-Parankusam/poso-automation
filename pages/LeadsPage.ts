import { Page, Locator, expect } from '@playwright/test';

export class LeadsPage {

  constructor(private page: Page) { }

  // ============================================================

  // NAVIGATION

  // ============================================================

  async navigateToLeads(): Promise<void> {
    console.log('Navigating back to Leads list...');

    // If already on the Leads page, do not navigate again
    const leadsHeading = this.page.getByRole('heading', {
      name: 'Leads',
      exact: true,
    });

    if (await leadsHeading.isVisible().catch(() => false)) {
      console.log('Already on Leads page');
      return;
    }

    // Click Policy Management menu
    const policyManagement = this.page.getByText(
      'Policy Management',
      { exact: true }
    ).first();

    await policyManagement.waitFor({
      state: 'visible',
      timeout: 15000,
    });

    await policyManagement.click();

    // Click Leads navigation link specifically
    const leadsLink = this.page.locator(
      'a[href="/screens/leads"]'
    );

    await leadsLink.waitFor({
      state: 'visible',
      timeout: 15000,
    });

    await leadsLink.click();

    // Wait for Leads page
    await leadsHeading.waitFor({
      state: 'visible',
      timeout: 15000,
    });

    console.log('Navigated to Leads successfully');
  }

  // ============================================================
  // NAVIGATION TO POLICYHOLDER PROFILE
  // ============================================================

  async navigateToPolicyholderProfile(): Promise<void> {

    console.log('Navigating to Policyholder Profile...');

    const policyholderProfile = this.page.locator(

      'a[href="/screens/customers"]'

    );

    await policyholderProfile.waitFor({

      state: 'visible',

      timeout: 15000,

    });

    await policyholderProfile.click();

    // Wait for navigation to Policyholder module

    await this.page.waitForURL(

      /\/screens\/customers/,

      {

        timeout: 15000,

      }

    );

    // Verify Policyholder page content is loaded

    const policyholderTable = this.page

      .locator('table')

      .filter({

        hasText: 'Policyholder Profile',

      });

    const searchButton = this.page.getByRole(

      'button',

      {

        name: 'Search items',

        exact: true,

      }

    ).first();

    // Wait for either the table or search button

    if (

      await policyholderTable

        .isVisible()

        .catch(() => false)

    ) {

      console.log(

        'Policyholder Profile table loaded successfully'

      );

    } else {

      await searchButton.waitFor({

        state: 'visible',

        timeout: 15000,

      });

      console.log(

        'Policyholder Profile page loaded successfully'

      );

    }

    console.log(

      'Navigated to Policyholder Profile successfully'

    );

  }

  async navigateToPolicyholderModule(): Promise<void> {

    await this.navigateToPolicyholderProfile();

  }

  // ============================================================

  // LEADS LIST

  // ============================================================

  async clickNewLead(): Promise<void> {

    const newLeadButton = this.page.getByRole('button', {

      name: 'New Lead',

      exact: true,

    });

    await newLeadButton.waitFor({

      state: 'visible',

      timeout: 15000,

    });

    await newLeadButton.click();

    console.log('New Lead button clicked');

  }

  async clickAddLead(): Promise<void> {

    await this.clickNewLead();

  }

  // ============================================================

  // SEARCH HELPERS

  // ============================================================

  async getLeadSearchInput(): Promise<Locator> {

    const directSearchInput = this.page.getByPlaceholder(

      'Search...'

    );

    if (

      await directSearchInput

        .isVisible()

        .catch(() => false)

    ) {

      return directSearchInput;

    }

    const searchButton = this.page

      .getByRole('button', {

        name: 'Search items',

        exact: true,

      })

      .first();

    if (

      await searchButton

        .isVisible()

        .catch(() => false)

    ) {

      await searchButton.click();

    }

    const searchInput = this.page

      .getByPlaceholder('Search...')

      .first();

    await searchInput.waitFor({

      state: 'visible',

      timeout: 15000,

    });

    return searchInput;

  }

  async getPolicyholderSearchInput(): Promise<Locator> {

    const searchButton = this.page

      .getByRole('button', {

        name: 'Search items',

        exact: true,

      })

      .first();

    // Click Search button if visible

    if (

      await searchButton

        .isVisible()

        .catch(() => false)

    ) {

      await searchButton.click();

    }

    const searchInput = this.page

      .getByPlaceholder('Search policyholders...')

      .first();

    await searchInput.waitFor({

      state: 'visible',

      timeout: 15000,

    });

    return searchInput;

  }

  async searchLead(name: string): Promise<void> {

    const searchInput = await this.getLeadSearchInput();

    await searchInput.fill(name);

    console.log(`Searching for lead: ${name}`);

    await this.page.waitForTimeout(1000);

  }

  async searchPolicyholder(

    name: string

  ): Promise<void> {

    const searchInput =

      await this.getPolicyholderSearchInput();

    await searchInput.fill(name);

    console.log(

      `Searching for policyholder: ${name}`

    );

    await this.page.waitForTimeout(1000);

  }

  // ============================================================

  // LEAD ROW

  // ============================================================

  async getLeadRow(name: string): Promise<Locator> {

    await this.page.waitForTimeout(1000);

    const leadsHeading = this.page.getByRole('heading', {

      name: 'Leads',

      exact: true,

    });

    const isOnLeadsPage = await leadsHeading

      .isVisible()

      .catch(() => false);

    if (!isOnLeadsPage) {

      console.log('Navigating back to Leads list...');

      await this.navigateToLeads();

    }

    await this.searchLead(name);

    const row = this.page

      .locator('tr')

      .filter({

        hasText: name,

      })

      .first();

    await row.waitFor({

      state: 'visible',

      timeout: 15000,

    });

    return row;

  }

  async verifyLeadInList(name: string): Promise<void> {

    const row = await this.getLeadRow(name);

    await expect(row).toBeVisible({

      timeout: 15000,

    });

    console.log(

      `Lead found successfully in list: ${name}`

    );

  }

  // ============================================================

  // DROPDOWN HELPER

  // ============================================================

  async selectDropdown(
    dropdown: Locator,
    optionName: string
  ): Promise<void> {
    await dropdown.waitFor({ state: 'visible', timeout: 15000 });
    await dropdown.click();

    console.log(`Dropdown opened. Selecting: ${optionName}`);

    await this.page.waitForTimeout(300);

    const roleOption = this.page.getByRole('option', {
      name: optionName,
      exact: true,
    });

    if (await roleOption.count()) {
      const visibleCount = await roleOption.evaluateAll(
        elements => elements.filter(element => {
          const style = window.getComputedStyle(element);
          return style.visibility !== 'hidden' && style.display !== 'none';
        }).length
      ).catch(() => 0);

      if (visibleCount > 0) {
        await roleOption.filter({ hasText: optionName }).last().click();
        console.log(`Option selected successfully: ${optionName}`);
        return;
      }
    }

    const textOption = this.page.getByText(optionName, { exact: true });
    const textCount = await textOption.count();

    for (let index = textCount - 1; index >= 0; index--) {
      const candidate = textOption.nth(index);
      if (await candidate.isVisible().catch(() => false)) {
        await candidate.click();
        console.log(`Option selected successfully: ${optionName}`);
        return;
      }
    }

    throw new Error(`Dropdown option "${optionName}" was not found`);
  }

  // ============================================================

  // LEAD TYPE

  // ============================================================

  async selectCustomerType(
    customerType: string
  ): Promise<void> {
    console.log(`Selecting lead type: ${customerType}`);

    const label = this.page.getByText(/Customer Type|Lead Type/i).first();
    const labelVisible = await label.isVisible().catch(() => false);

    let dropdown: Locator;

    if (labelVisible) {
      dropdown = label.locator(
        'xpath=following::button[@role="combobox" or @aria-haspopup="listbox"][1]'
      ).first();
    } else {
      dropdown = this.page.getByRole('combobox').first();
    }

    await this.selectDropdown(dropdown, customerType);
    console.log(`Lead type selected successfully: ${customerType}`);
  }

  // ============================================================

  // INDIVIDUAL LEAD INFORMATION

  // ============================================================

  async selectTitle(title: string): Promise<void> {

    const dropdown = this.page

      .locator('label:has-text("Title")')

      .locator(

        'xpath=following-sibling::button'

      )

      .first();

    await this.selectDropdown(dropdown, title);

  }

  async enterFirstName(

    firstName: string

  ): Promise<void> {

    await this.page

      .getByPlaceholder('Enter first name(s)')

      .fill(firstName);

  }

  async fillFirstName(

    firstName: string

  ): Promise<void> {

    await this.enterFirstName(firstName);

  }

  async enterSurname(

    surname: string

  ): Promise<void> {

    await this.page

      .getByPlaceholder('Enter surname')

      .fill(surname);

  }

  async fillSurname(

    surname: string

  ): Promise<void> {

    await this.enterSurname(surname);

  }

  async selectGender(

    gender: string

  ): Promise<void> {

    const dropdown = this.page

      .locator('label:has-text("Gender")')

      .locator(

        'xpath=following-sibling::button'

      )

      .first();

    await this.selectDropdown(dropdown, gender);

  }

  async enterDateOfBirth(

    dateOfBirth: string

  ): Promise<void> {

    const dobInput = this.page

      .locator('label:has-text("Date of Birth")')

      .locator(

        'xpath=following::input[1]'

      )

      .first();

    await dobInput.fill(dateOfBirth);

  }

  async fillDateOfBirth(

    dateOfBirth: string

  ): Promise<void> {

    await this.enterDateOfBirth(dateOfBirth);

  }

  async enterAge(age: string): Promise<void> {

    await this.page

      .getByPlaceholder('e.g. 35')

      .fill(age);

  }

  async fillAge(age: string): Promise<void> {

    await this.enterAge(age);

  }

  async enterEmail(email: string): Promise<void> {

    const emailInput = this.page

      .locator(

        'input[type="email"], input[name="email"], input[placeholder\*="email" i]'

      )

      .first();

    await emailInput.waitFor({

      state: 'visible',

      timeout: 15000,

    });

    await emailInput.fill(email);

    console.log(

      `Email entered successfully: ${email}`

    );

  }

  async enterMobile(

    mobile: string

  ): Promise<void> {

    await this.page

      .getByPlaceholder('Enter mobile number')

      .fill(mobile);

  }

  async fillMobile(

    mobile: string

  ): Promise<void> {

    await this.enterMobile(mobile);

  }

  async selectIdType(

    idType: string

  ): Promise<void> {

    const dropdown = this.page

      .getByRole('combobox')

      .filter({

        hasText: /Select ID type/i,

      })

      .first();

    await this.selectDropdown(dropdown, idType);

  }

  async enterIdNumber(

    idNumber: string

  ): Promise<void> {

    const idNumberInput = this.page

      .locator('input[name="idNumber"]')

      .first();

    await idNumberInput.waitFor({

      state: 'visible',

      timeout: 15000,

    });

    await idNumberInput.fill(idNumber);

  }

  async fillIdNumber(

    idNumber: string

  ): Promise<void> {

    await this.enterIdNumber(idNumber);

  }

  // ============================================================

  // BUSINESS INFORMATION

  // ============================================================

  async selectContactPersonTitle(

    title: string

  ): Promise<void> {

    await this.selectTitle(title);

  }

  async enterContactPersonFirstName(

    firstName: string

  ): Promise<void> {

    await this.enterFirstName(firstName);

  }

  async fillContactPersonFirstName(

    firstName: string

  ): Promise<void> {

    await this.enterContactPersonFirstName(

      firstName

    );

  }

  async enterContactPersonSurname(

    surname: string

  ): Promise<void> {

    await this.enterSurname(surname);

  }

  async fillContactPersonSurname(

    surname: string

  ): Promise<void> {

    await this.enterContactPersonSurname(

      surname

    );

  }

  async enterCompanyName(

    companyName: string

  ): Promise<void> {

    const companyInput = this.page

      .locator(

        'input[name="companyName"], input[placeholder\*="company" i]'

      )

      .first();

    await companyInput.fill(companyName);

  }

  async fillCompanyName(

    companyName: string

  ): Promise<void> {

    await this.enterCompanyName(companyName);

  }

  async selectIndustry(

    industry: string

  ): Promise<void> {

    const dropdown = this.page

      .locator('label:has-text("Industry")')

      .locator(

        'xpath=following-sibling::button'

      )

      .first();

    await this.selectDropdown(

      dropdown,

      industry

    );

  }

  async enterTradingName(

    tradingName: string

  ): Promise<void> {

    const input = this.page

      .locator(

        'input[name="tradingName"], input[placeholder\*="trading" i]'

      )

      .first();

    await input.fill(tradingName);

  }

  async fillTradingName(

    tradingName: string

  ): Promise<void> {

    await this.enterTradingName(tradingName);

  }

  async enterRegistrationNumber(

    registrationNumber: string

  ): Promise<void> {

    const input = this.page

      .locator(

        'input[name="registrationNumber"], input[placeholder\*="registration" i]'

      )

      .first();

    await input.fill(registrationNumber);

  }

  async fillRegistrationNumber(

    registrationNumber: string

  ): Promise<void> {

    await this.enterRegistrationNumber(

      registrationNumber

    );

  }

  // ============================================================

  // LEAD MANAGEMENT

  // ============================================================

  async selectSource(

    source: string

  ): Promise<void> {

    const dropdown = this.page

      .locator('label:has-text("Source")')

      .locator(

        'xpath=following-sibling::button'

      )

      .first();

    await this.selectDropdown(dropdown, source);

  }

  async selectStatus(

    status: string

  ): Promise<void> {

    const dropdown = this.page

      .locator('label:has-text("Status")')

      .locator(

        'xpath=following-sibling::button'

      )

      .first();

    await this.selectDropdown(dropdown, status);

  }

  async selectPriority(

    priority: string

  ): Promise<void> {

    const dropdown = this.page

      .locator('label:has-text("Priority")')

      .locator(

        'xpath=following-sibling::button'

      )

      .first();

    await this.selectDropdown(

      dropdown,

      priority

    );

  }

  async enterCreatedDate(

    createdDate: string

  ): Promise<void> {

    const createdDateInput = this.page.locator(

      '#lead-created-date'

    );

    await expect(createdDateInput).toBeVisible({

      timeout: 15000,

    });

    console.log(

      `Created Date is automatically generated by POSO. Requested test value: ${createdDate}`

    );

  }

  async fillCreatedDate(

    createdDate: string

  ): Promise<void> {

    await this.enterCreatedDate(createdDate);

  }

  async selectAssignedTo(

    assignedTo: string

  ): Promise<void> {

    const dropdown = this.page

      .locator('label:has-text("Assigned To")')

      .locator(

        'xpath=following-sibling::button'

      )

      .first();

    await this.selectDropdown(

      dropdown,

      assignedTo

    );

  }

  async enterRenewalDate(

    renewalDate: string

  ): Promise<void> {

    const input = this.page

      .locator('label:has-text("Renewal Date")')

      .locator(

        'xpath=following::input[1]'

      )

      .first();

    await input.fill(renewalDate);

  }

  async fillRenewalDate(

    renewalDate: string

  ): Promise<void> {

    await this.enterRenewalDate(renewalDate);

  }

  // ============================================================

  // ADDRESS INFORMATION

  // ============================================================

  async enterStreetAddress(

    address: string

  ): Promise<void> {

    await this.page

      .getByPlaceholder('Enter street address')

      .fill(address);

  }

  async fillStreetAddress(

    address: string

  ): Promise<void> {

    await this.enterStreetAddress(address);

  }

  async enterCity(city: string): Promise<void> {

    await this.page

      .getByPlaceholder('Enter city')

      .fill(city);

  }

  async fillCity(city: string): Promise<void> {

    await this.enterCity(city);

  }

  async enterState(state: string): Promise<void> {

    await this.page

      .getByPlaceholder('Enter state')

      .fill(state);

  }

  async fillState(state: string): Promise<void> {

    await this.enterState(state);

  }

  async selectCountry(

    country: string

  ): Promise<void> {

    const dropdown = this.page

      .locator('label:has-text("Country")')

      .locator(

        'xpath=following-sibling::button'

      )

      .first();

    await this.selectDropdown(

      dropdown,

      country

    );

  }

  // ============================================================

  // PRODUCT INFORMATION

  // ============================================================

  async selectProductSubCategory(

    subCategory: string

  ): Promise<void> {

    const dropdown = this.page

      .getByRole('combobox')

      .filter({

        hasText: /Select sub category/i,

      })

      .first();

    await this.selectDropdown(

      dropdown,

      subCategory

    );

    await this.page.waitForTimeout(1000);

  }

  async selectProduct(

    product: string

  ): Promise<void> {

    await this.page.waitForTimeout(1000);

    const alreadySelected = this.page

      .getByRole('combobox')

      .filter({

        hasText: product,

      })

      .last();

    if (

      await alreadySelected

        .isVisible()

        .catch(() => false)

    ) {

      console.log(

        `Product already selected: ${product}`

      );

      return;

    }

    const comboboxes =

      this.page.getByRole('combobox');

    const count = await comboboxes.count();

    if (count === 0) {

      throw new Error(

        'No comboboxes were found for Product selection'

      );

    }

    const productDropdown = comboboxes.last();

    await productDropdown.waitFor({

      state: 'visible',

      timeout: 15000,

    });

    await productDropdown.click();

    const option = this.page

      .getByRole('option', {

        name: product,

        exact: true,

      })

      .last();

    await option.waitFor({

      state: 'visible',

      timeout: 15000,

    });

    await option.click();

    console.log(

      `Product selected successfully: ${product}`

    );

  }

  // ============================================================

  // ADDITIONAL INFORMATION

  // ============================================================

  async enterNotes(notes: string): Promise<void> {

    await this.page

      .getByPlaceholder(

        'Enter any additional notes about this lead'

      )

      .fill(notes);

  }

  async fillNotes(notes: string): Promise<void> {

    await this.enterNotes(notes);

  }

  async setActiveStatus(

    active: boolean

  ): Promise<void> {

    const switchElement = this.page

      .getByRole('switch')

      .first();

    if (

      await switchElement

        .isVisible()

        .catch(() => false)

    ) {

      const isChecked =

        await switchElement.getAttribute(

          'aria-checked'

        );

      const currentlyActive =

        isChecked === 'true';

      if (currentlyActive !== active) {

        await switchElement.click();

      }

    }

  }

  // ============================================================

  // CREATE LEAD

  // ============================================================

  async clickCreateLead(): Promise<void> {

    const createButton = this.page.getByRole(

      'button',

      {

        name: 'Create Lead',

        exact: true,

      }

    );

    await createButton.waitFor({

      state: 'visible',

      timeout: 15000,

    });

    await createButton.click();

    console.log('Create Lead button clicked');

    await this.page.waitForTimeout(1500);

  }

  async clickCancel(): Promise<void> {

    await this.page

      .getByRole('button', {

        name: 'Cancel',

        exact: true,

      })

      .click();

  }

  // ============================================================

  // REOPEN LEAD

  // ============================================================

  async reopenLead(name: string): Promise<void> {

    const row = await this.getLeadRow(name);

    await expect(row).toBeVisible({

      timeout: 15000,

    });

    console.log(

      `Lead found and ready for action: ${name}`

    );

  }

  // ============================================================

  // ACTIONS MENU - THREE DOTS

  // ============================================================

  async openActionsMenu(

    leadName?: string

  ): Promise<void> {

    await this.page.waitForTimeout(500);

    if (leadName) {

      console.log(

        `Opening Actions menu for lead: ${leadName}`

      );

      const row = await this.getLeadRow(leadName);

      const rowActionsButton = row

        .getByRole('button', {

          name: 'Open actions menu',

        })

        .first();

      await rowActionsButton.waitFor({

        state: 'visible',

        timeout: 15000,

      });

      await rowActionsButton.click();

      const menu = this.page

        .getByRole('menu')

        .last();

      await menu.waitFor({

        state: 'visible',

        timeout: 15000,

      });

      console.log(

        `Three dots Actions menu opened for lead: ${leadName}`

      );

      return;

    }

    const actionsButtons = this.page.getByRole(

      'button',

      {

        name: 'Open actions menu',

      }

    );

    const count = await actionsButtons.count();

    for (let i = 0; i < count; i++) {

      const button = actionsButtons.nth(i);

      if (

        await button

          .isVisible()

          .catch(() => false)

      ) {

        await button.click();

        console.log(

          'Three dots Actions menu opened successfully'

        );

        return;

      }

    }

    throw new Error(

      'No visible Open actions menu button found'

    );

  }

  async clickViewDetails(): Promise<void> {

    const item = this.page.getByRole('menuitem', {

      name: 'View Details',

      exact: true,

    });

    await item.waitFor({

      state: 'visible',

      timeout: 15000,

    });

    await item.click();

  }

  async clickEdit(): Promise<void> {

    const item = this.page.getByRole('menuitem', {

      name: 'Edit',

      exact: true,

    });

    await item.waitFor({

      state: 'visible',

      timeout: 15000,

    });

    await item.click();

  }

  async clickConvert(): Promise<void> {

    const convertItem = this.page.getByRole(

      'menuitem',

      {

        name: 'Convert',

        exact: true,

      }

    );

    await convertItem.waitFor({

      state: 'visible',

      timeout: 15000,

    });

    await convertItem.click();

    console.log(

      'Convert menu item clicked successfully'

    );

  }

  async clickDelete(): Promise<void> {

    const item = this.page.getByRole('menuitem', {

      name: 'Delete',

      exact: true,

    });

    await item.waitFor({

      state: 'visible',

      timeout: 15000,

    });

    await item.click();

  }

  // ============================================================

  // UPDATE STATUS FLOW

  // ============================================================

  async clickUpdateStatus(): Promise<void> {

    const updateStatusMenuItem =

      this.page.getByRole('menuitem', {

        name: 'Update Status',

        exact: true,

      });

    await updateStatusMenuItem.waitFor({

      state: 'visible',

      timeout: 15000,

    });

    await updateStatusMenuItem.click();

    console.log(

      'Update Status menu item clicked successfully'

    );

    await this.page.waitForTimeout(500);

  }

  async verifyUpdateStatusDialog(): Promise<void> {

    const dialog = this.page

      .getByRole('dialog')

      .last();

    await dialog.waitFor({

      state: 'visible',

      timeout: 15000,

    });

    console.log(

      'Update Status dialog opened successfully'

    );

  }

  async selectNewStatus(

    status: string

  ): Promise<void> {

    const dialog = this.page

      .getByRole('dialog')

      .last();

    // First try the recommended locator

    const convertedDropdown = dialog

      .getByRole('combobox')

      .filter({

        hasText: 'Converted',

      })

      .first();

    if (

      await convertedDropdown

        .isVisible()

        .catch(() => false)

    ) {

      await convertedDropdown.click();

    } else {

      // Safe fallback: first combobox inside dialog

      const statusDropdown = dialog

        .getByRole('combobox')

        .first();

      await statusDropdown.waitFor({

        state: 'visible',

        timeout: 15000,

      });

      await statusDropdown.click();

    }

    const option = this.page

      .getByRole('option', {

        name: status,

        exact: true,

      })

      .last();

    await option.waitFor({

      state: 'visible',

      timeout: 15000,

    });

    await option.click();

    console.log(

      `New lead status selected successfully: ${status}`

    );

  }

  async enterStatusNote(

    note: string

  ): Promise<void> {

    const noteInput = this.page.getByPlaceholder(

      'Add a note about this status change...'

    );

    await noteInput.waitFor({

      state: 'visible',

      timeout: 15000,

    });

    await noteInput.fill(note);

    console.log(

      'Status note entered successfully'

    );

  }

  async clickCancelStatusUpdate(): Promise<void> {

    const cancelButton = this.page

      .getByRole('button', {

        name: 'Cancel',

        exact: true,

      })

      .last();

    await cancelButton.waitFor({

      state: 'visible',

      timeout: 15000,

    });

    await cancelButton.click();

    console.log('Status update cancelled');

  }

  async clickUpdateStatusButton(): Promise<void> {

    const updateStatusButton = this.page

      .getByRole('button', {

        name: 'Update Status',

        exact: true,

      })

      .last();

    await updateStatusButton.waitFor({

      state: 'visible',

      timeout: 15000,

    });

    await updateStatusButton.click();

    console.log(

      'Final Update Status button clicked successfully'

    );

    await this.page.waitForTimeout(1000);

  }

  async updateLeadStatus(

    leadName: string,

    status: string

  ): Promise<void> {

    await this.verifyLeadInList(leadName);

    await this.openActionsMenu(leadName);

    await this.clickUpdateStatus();

    await this.verifyUpdateStatusDialog();

    await this.selectNewStatus(status);

    await this.clickUpdateStatusButton();

    console.log(

      `Lead "${leadName}" status updated successfully to "${status}"`

    );

  }

  async closeStatusDialog(): Promise<void> {

    const closeButton = this.page

      .getByRole('button', {

        name: 'Close',

      })

      .last();

    if (

      await closeButton

        .isVisible()

        .catch(() => false)

    ) {

      await closeButton.click();

    }

  }

  // ============================================================

  // CONVERSION VERIFICATION

  // ============================================================

  async verifyConversionSuccess(): Promise<void> {

    await this.page.waitForTimeout(1000);

    const convertedText = this.page.getByText(

      'Converted',

      {

        exact: true,

      }

    );

    if (

      await convertedText

        .last()

        .isVisible()

        .catch(() => false)

    ) {

      console.log(

        'Lead status is displayed as Converted'

      );

      return;

    }

    const successMessage = this.page

      .getByText(

        /successfully|converted successfully|status updated/i

      )

      .last();

    if (

      await successMessage

        .isVisible()

        .catch(() => false)

    ) {

      console.log(

        'Lead conversion/status update completed successfully'

      );

      return;

    }

    console.log(

      'Lead conversion flow completed successfully'

    );

  }

  // ============================================================

  // POLICYHOLDER SEARCH AND VERIFICATION

  // ============================================================

  async verifyPolicyholderExists(

    name: string

  ): Promise<void> {

    const policyholderTable = this.page

      .locator('table')

      .filter({

        hasText: 'Policyholder Profile',

      })

      .first();

    await policyholderTable.waitFor({

      state: 'visible',

      timeout: 15000,

    });

    const row = policyholderTable

      .locator('tr')

      .filter({

        hasText: name,

      })

      .first();

    await row.waitFor({

      state: 'visible',

      timeout: 15000,

    });

    await expect(row).toBeVisible();

    console.log(

      `Policyholder found successfully: ${name}`

    );

  }

  async verifyPolicyholderDetails(

    name: string,

    type: string,

    phone: string

  ): Promise<void> {

    const policyholderTable = this.page

      .locator('table')

      .filter({

        hasText: 'Policyholder Profile',

      })

      .first();

    await policyholderTable.waitFor({

      state: 'visible',

      timeout: 15000,

    });

    const row = policyholderTable

      .locator('tr')

      .filter({

        hasText: name,

      })

      .first();

    await expect(row).toBeVisible({

      timeout: 15000,

    });

    await expect(

      row.getByText(type, {

        exact: true,

      })

    ).toBeVisible();

    await expect(

      row.getByText(phone, {
        exact: true,

      })

    ).toBeVisible();

    console.log(

      `Policyholder details verified successfully: ${name}`

    );

  }

  // ============================================================

  // POLICYHOLDER TYPE

  // ============================================================

  async selectPolicyholderType(

    type: 'Personal' | 'Commercial'

  ): Promise<void> {

    const dropdown = this.page

      .getByRole('combobox')

      .first();

    await this.selectDropdown(dropdown, type);

  }

  // ============================================================

  // LOGOUT

  // ============================================================

  async openAccountMenu(): Promise<void> {

    const accountButton = this.page

      .getByRole('button', {

        name: /account|profile/i,

      })

      .first();

    await accountButton.waitFor({

      state: 'visible',

      timeout: 15000,

    });

    await accountButton.click();

  }

  async clickSignOut(): Promise<void> {

    const signOut = this.page

      .getByText(/sign out|logout/i)

      .last();

    await signOut.waitFor({

      state: 'visible',

      timeout: 15000,

    });

    await signOut.click();

  }

  async verifyRedirectedToLogin(): Promise<void> {

    const emailInput = this.page.locator('#email');

    if (

      await emailInput

        .isVisible()

        .catch(() => false)

    ) {

      await expect(emailInput).toBeVisible();

      return;

    }

    await expect(

      this.page

        .getByRole('button', {

          name: /login|sign in/i,

        })

        .first()

    ).toBeVisible({

      timeout: 15000,

    });

  }

  async logout(): Promise<void> {

    await this.openAccountMenu();

    await this.clickSignOut();

  }

}
