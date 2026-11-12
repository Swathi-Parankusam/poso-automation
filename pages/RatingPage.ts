import { Page, Locator, expect } from '@playwright/test';

export class RatingPage {
  constructor(private readonly page: Page) {}

  private readonly timeout = 15000;

  // ============================================================
  // NAVIGATION LOCATORS
  // ============================================================

  private administrationMenu = () =>
    this.page
      .getByText('Administration', {
        exact: true,
      })
      .first();

  private ratingMenu = () =>
    this.page
      .locator('button')
      .filter({
        has: this.page.getByText('Rating', {
          exact: true,
        }),
      })
      .first();

  private shortTermRatingLink = () =>
    this.page.getByRole('link', {
      name: 'Short Term Rating',
      exact: true,
    });

  private longTermRatingLink = () =>
    this.page.getByRole('link', {
      name: 'Long Term Rating',
      exact: true,
    });

  // ============================================================
  // SHORT TERM RATING LIST
  // ============================================================

  private baseRatesHeading = () =>
    this.page.getByRole('heading', {
      name: 'Base Rates',
      exact: true,
    });

  private newBaseRateButton = () =>
    this.page.getByRole('button', {
      name: 'New Base Rate',
      exact: true,
    });

  private createBaseRateButton = () =>
    this.page.getByRole('button', {
      name: /Create Base Rate/i,
    });

  // ============================================================
  // LONG TERM RATING LIST
  // ============================================================

  private longTermRatingHeading = () =>
    this.page.getByRole('heading', {
      name: 'Long Term Rating',
      exact: true,
    });

  private addRatingButton = () =>
    this.page.getByRole('button', {
      name: /Add Rating|New Rating/i,
    });

  // ============================================================
  // REVIEW & SAVE
  // ============================================================

  private generalInformationHeading = () =>
    this.page.getByRole('heading', {
      name: 'General Information',
    });

  private ratingCriteriaHeading = () =>
    this.page.getByRole('heading', {
      name: 'Rating Criteria',
    });

  private lifeCoverRatesHeading = () =>
    this.page.getByRole('heading', {
      name: /Life Cover Rates/i,
    });

  private saveAndActivateButton = () =>
    this.page.getByRole('button', {
      name: /Save\s*&\s*Activate|Save and Activate/i,
    });

  // ============================================================
  // COMMON HELPERS
  // ============================================================

  private async closeOpenDropdown(): Promise<void> {
    await this.page.keyboard.press('Escape').catch(() => {});

    await this.page.waitForTimeout(200);
  }

  private escapeRegExp(value: string): string {
    return value.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&',
    );
  }

  // ============================================================
  // LABEL HELPER
  // ============================================================

  private async getLabel(
    labelText: string,
  ): Promise<Locator> {
    const exactLabel = this.page
      .locator('label')
      .filter({
        hasText: new RegExp(
          `^${this.escapeRegExp(labelText)}(?:\\s|$)`,
          'i',
        ),
      })
      .first();

    if (
      await exactLabel
        .isVisible()
        .catch(() => false)
    ) {
      return exactLabel;
    }

    const flexibleLabel = this.page
      .locator('label')
      .filter({
        hasText: new RegExp(
          this.escapeRegExp(labelText),
          'i',
        ),
      })
      .first();

    await flexibleLabel.waitFor({
      state: 'visible',
      timeout: this.timeout,
    });

    return flexibleLabel;
  }

  // ============================================================
  // CONTROL BY LABEL
  // ============================================================

  private async getControlByLabel(
    labelText: string,
    controlType?: 'combobox' | 'date' | 'input',
  ): Promise<Locator> {
    const label =
      await this.getLabel(labelText);

    const controlId =
      await label.getAttribute('for');

    // ==========================================================
    // PRIMARY - LABEL "FOR" ATTRIBUTE
    // ==========================================================

    if (controlId) {
      let control: Locator;

      if (controlType === 'combobox') {
        control = this.page
          .locator(
            `button[role="combobox"][id="${controlId}"]`,
          )
          .first();

        if (
          !(await control
            .count()
            .catch(() => 0))
        ) {
          control = this.page
            .locator(
              `[id="${controlId}"][role="combobox"]`,
            )
            .first();
        }
      } else if (controlType === 'date') {
        control = this.page
          .locator(
            `input[type="date"][id="${controlId}"]`,
          )
          .first();
      } else {
        control = this.page
          .locator(`[id="${controlId}"]`)
          .first();
      }

      if (
        await control
          .count()
          .catch(() => 0)
      ) {
        await control.waitFor({
          state: 'visible',
          timeout: this.timeout,
        });

        return control;
      }
    }

    // ==========================================================
    // FALLBACK 1 - PARENT
    // ==========================================================

    const parent =
      label.locator('xpath=..');

    let control: Locator;

    if (controlType === 'combobox') {
      control = parent
        .locator('button[role="combobox"]')
        .first();
    } else if (controlType === 'date') {
      control = parent
        .locator('input[type="date"]')
        .first();
    } else {
      control = parent
        .locator('input, textarea')
        .first();
    }

    if (
      await control
        .count()
        .catch(() => 0)
    ) {
      await control.waitFor({
        state: 'visible',
        timeout: this.timeout,
      });

      return control;
    }

    // ==========================================================
    // FALLBACK 2 - GRANDPARENT
    // ==========================================================

    const grandParent =
      label.locator('xpath=../..');

    if (controlType === 'combobox') {
      control = grandParent
        .locator('button[role="combobox"]')
        .first();
    } else if (controlType === 'date') {
      control = grandParent
        .locator('input[type="date"]')
        .first();
    } else {
      control = grandParent
        .locator('input, textarea')
        .first();
    }

    await control.waitFor({
      state: 'visible',
      timeout: this.timeout,
    });

    return control;
  }

  // ============================================================
  // WAIT FOR DROPDOWN TO BE ENABLED
  // ============================================================

  private async waitForDropdownEnabled(
    labelText: string,
  ): Promise<Locator> {
    const dropdown =
      await this.getControlByLabel(
        labelText,
        'combobox',
      );

    await dropdown.waitFor({
      state: 'visible',
      timeout: this.timeout,
    });

    await expect(dropdown).toBeEnabled({
      timeout: this.timeout,
    });

    return dropdown;
  }

  // ============================================================
  // OPTION HELPERS
  // ============================================================

  private getVisibleOption(
    value: string,
  ): Locator {
    return this.page
      .locator(
        [
          '[role="option"]:visible',
          '[role="menuitem"]:visible',
          '[data-radix-collection-item]:visible',
        ].join(', '),
      )
      .filter({
        hasText: new RegExp(
          `^${this.escapeRegExp(value)}$`,
          'i',
        ),
      })
      .first();
  }

  private async findVisibleOption(
    value: string,
  ): Promise<Locator> {
    const exactOption =
      this.getVisibleOption(value);

    if (
      await exactOption
        .isVisible()
        .catch(() => false)
    ) {
      return exactOption;
    }

    const partialOption = this.page
      .locator(
        [
          '[role="option"]:visible',
          '[role="menuitem"]:visible',
          '[data-radix-collection-item]:visible',
        ].join(', '),
      )
      .filter({
        hasText: new RegExp(
          this.escapeRegExp(value),
          'i',
        ),
      })
      .first();

    await partialOption.waitFor({
      state: 'visible',
      timeout: this.timeout,
    });

    return partialOption;
  }

  // ============================================================
  // GENERIC DROPDOWN
  // ============================================================

  private async selectDropdown(
    dropdown: Locator,
    value: string,
  ): Promise<void> {
    await dropdown.waitFor({
      state: 'visible',
      timeout: this.timeout,
    });

    await dropdown.scrollIntoViewIfNeeded();

    await expect(dropdown).toBeEnabled({
      timeout: this.timeout,
    });

    await this.closeOpenDropdown();

    await dropdown.click();

    const optionContainer = this.page
      .locator(
        [
          '[role="option"]:visible',
          '[role="menuitem"]:visible',
          '[data-radix-collection-item]:visible',
        ].join(', '),
      )
      .first();

    await optionContainer.waitFor({
      state: 'visible',
      timeout: this.timeout,
    });

    const option =
      await this.findVisibleOption(value);

    await option.scrollIntoViewIfNeeded();

    await option.click();

    await this.page.waitForTimeout(500);
  }

  // ============================================================
  // DROPDOWN BY LABEL
  // ============================================================

  private async selectDropdownByLabel(
    labelText: string,
    value: string,
  ): Promise<void> {
    const dropdown =
      await this.waitForDropdownEnabled(
        labelText,
      );

    await this.selectDropdown(
      dropdown,
      value,
    );
  }

  // ============================================================
  // RATING CRITERIA DROPDOWNS
  // ============================================================

  private async getCriteriaDropdown(
    labelText: string,
  ): Promise<Locator> {
    const label =
      await this.getLabel(labelText);

    const parent =
      label.locator('xpath=..');

    let dropdown = parent
      .locator('button[role="combobox"]')
      .first();

    if (
      !(await dropdown
        .count()
        .catch(() => 0))
    ) {
      const grandParent =
        label.locator('xpath=../..');

      dropdown = grandParent
        .locator('button[role="combobox"]')
        .first();
    }

    await dropdown.waitFor({
      state: 'visible',
      timeout: this.timeout,
    });

    return dropdown;
  }

  private async selectCriteriaDropdown(
    labelText: string,
    value: string,
  ): Promise<void> {
    const dropdown =
      await this.getCriteriaDropdown(labelText);

    await dropdown.scrollIntoViewIfNeeded();

    const selectedValue = dropdown
      .getByText(value, {
        exact: true,
      })
      .first();

    if (
      await selectedValue
        .isVisible()
        .catch(() => false)
    ) {
      return;
    }

    await this.closeOpenDropdown();

    await dropdown.click();

    const option =
      await this.findVisibleOption(value);

    await option.scrollIntoViewIfNeeded();

    await option.click();

    await this.page.waitForTimeout(400);
  }

  // ============================================================
  // INPUT HELPERS
  // ============================================================

  private async fillInput(
    placeholder: string,
    value: string,
  ): Promise<void> {
    const input = this.page
      .getByPlaceholder(placeholder, {
        exact: true,
      })
      .first();

    await input.waitFor({
      state: 'visible',
      timeout: this.timeout,
    });

    await input.fill(value);
  }

  private async fillInputByLabel(
    labelText: string,
    value: string,
  ): Promise<void> {
    const label =
      await this.getLabel(labelText);

    const parent =
      label.locator('xpath=..');

    let input = parent
      .locator('input')
      .first();

    if (
      !(await input
        .count()
        .catch(() => 0))
    ) {
      input = label
        .locator('xpath=../..')
        .locator('input')
        .first();
    }

    await input.waitFor({
      state: 'visible',
      timeout: this.timeout,
    });

    await input.fill(value);
  }

  // ============================================================
  // DATE HELPER
  // ============================================================

  private async setDate(
    labelText: string,
    dateValue: string,
  ): Promise<void> {
    const label =
      await this.getLabel(labelText);

    const parent =
      label.locator('xpath=..');

    let dateInput = parent
      .locator('input[type="date"]')
      .first();

    if (
      !(await dateInput
        .count()
        .catch(() => 0))
    ) {
      dateInput = label
        .locator('xpath=../..')
        .locator('input[type="date"]')
        .first();
    }

    await dateInput.waitFor({
      state: 'attached',
      timeout: this.timeout,
    });

    await dateInput.evaluate(
      (element, value) => {
        const input =
          element as HTMLInputElement;

        const nativeSetter =
          Object.getOwnPropertyDescriptor(
            HTMLInputElement.prototype,
            'value',
          )?.set;

        nativeSetter?.call(
          input,
          value,
        );

        input.dispatchEvent(
          new Event('input', {
            bubbles: true,
          }),
        );

        input.dispatchEvent(
          new Event('change', {
            bubbles: true,
          }),
        );

        input.dispatchEvent(
          new Event('blur', {
            bubbles: true,
          }),
        );
      },
      dateValue,
    );

    await this.page.waitForTimeout(500);
  }

  // ============================================================
  // NAVIGATION METHODS
  // ============================================================

  async navigateToRating(): Promise<void> {
    const administration =
      this.administrationMenu();

    await administration.waitFor({
      state: 'visible',
      timeout: this.timeout,
    });

    const rating =
      this.ratingMenu();

    const isRatingVisible =
      await rating
        .isVisible()
        .catch(() => false);

    if (!isRatingVisible) {
      await administration.click();

      await this.page.waitForTimeout(500);
    }

    await rating.waitFor({
      state: 'visible',
      timeout: this.timeout,
    });

    await rating.click();

    await this.page.waitForTimeout(500);
  }

  async selectShortTermRating(): Promise<void> {
    const shortTermRating =
      this.shortTermRatingLink();

    await shortTermRating.waitFor({
      state: 'visible',
      timeout: this.timeout,
    });

    await shortTermRating.click();

    await expect(
      this.baseRatesHeading(),
    ).toBeVisible({
      timeout: this.timeout,
    });
  }

  async selectLongTermRating(): Promise<void> {
    const longTermRating =
      this.longTermRatingLink();

    await longTermRating.waitFor({
      state: 'visible',
      timeout: this.timeout,
    });

    await longTermRating.click();

    await expect(
      this.longTermRatingHeading(),
    ).toBeVisible({
      timeout: this.timeout,
    });
  }

  // ============================================================
  // SHORT TERM RATING
  // ============================================================

  async clickNewBaseRate(): Promise<void> {
    const button =
      this.newBaseRateButton();

    await button.waitFor({
      state: 'visible',
      timeout: this.timeout,
    });

    await button.click();

    await this.page.waitForTimeout(500);
  }

  async enterShortTermBaseRateDetails(
    data: Record<string, string>,
  ): Promise<void> {
    // ==========================================================
    // UNDERWRITER
    // ==========================================================

    if (data.underwriter) {
      await this.selectDropdownByLabel(
        'Underwriter',
        data.underwriter,
      );

      await this.page.waitForTimeout(700);
    }

    // ==========================================================
    // PRODUCT - DEPENDS ON UNDERWRITER
    // ==========================================================

    if (data.product) {
      const productDropdown =
        await this.waitForDropdownEnabled(
          'Product',
        );

      await this.selectDropdown(
        productDropdown,
        data.product,
      );

      await this.page.waitForTimeout(700);
    }

    // ==========================================================
    // COVERAGE - DEPENDS ON PRODUCT
    // ==========================================================

    if (data.coverage) {
      const coverageDropdown =
        await this.waitForDropdownEnabled(
          'Coverage',
        );

      await this.selectDropdown(
        coverageDropdown,
        data.coverage,
      );

      await this.page.waitForTimeout(500);
    }

    // ==========================================================
    // RATING ZONE
    // ==========================================================

    if (data.ratingZone) {
      await this.fillInput(
        'Enter Rating Zone',
        data.ratingZone,
      );
    }

    if (data.sumInsuredFrom) {
      await this.fillInput(
        'Enter Sum Insured From',
        data.sumInsuredFrom,
      );
    }

    if (data.sumInsuredTo) {
      await this.fillInput(
        'Enter Sum Insured To',
        data.sumInsuredTo,
      );
    }

    if (data.ratePercent) {
      await this.fillInput(
        'Enter Rate Percent',
        data.ratePercent,
      );
    }

    if (data.rateValue) {
      await this.fillInput(
        'Enter Rate Value',
        data.rateValue,
      );
    }

    if (data.policyTerm) {
      await this.fillInput(
        'Enter Policy Term',
        data.policyTerm,
      );
    }

    if (data.paymentFrequency) {
      await this.selectDropdownByLabel(
        'Payment Frequency',
        data.paymentFrequency,
      );
    }

    if (data.make) {
      await this.fillInput(
        'Enter Make',
        data.make,
      );
    }

    if (data.engineSize) {
      await this.fillInput(
        'Enter Engine Size',
        data.engineSize,
      );
    }

    // ==========================================================
    // VEHICLE ORIGIN
    // ==========================================================

    if (data.vehicleOrigin) {
      const vehicleOriginLabel =
        this.page
          .locator('label')
          .filter({
            hasText: /Vehicle Origin/i,
          })
          .first();

      await vehicleOriginLabel.waitFor({
        state: 'visible',
        timeout: this.timeout,
      });

      const vehicleOriginDropdown =
        vehicleOriginLabel
          .locator('xpath=..')
          .locator('button[role="combobox"]')
          .first();

      await vehicleOriginDropdown.waitFor({
        state: 'visible',
        timeout: this.timeout,
      });

      await this.selectDropdown(
        vehicleOriginDropdown,
        data.vehicleOrigin,
      );
    }

    if (data.minimumPremium) {
      await this.fillInput(
        'e.g. 2500',
        data.minimumPremium,
      );
    }

    if (data.basicExcess) {
      await this.fillInputByLabel(
        'Basic Excess (% of claim)',
        data.basicExcess,
      );
    }

    if (data.excessMinimum) {
      await this.fillInput(
        'e.g. 3000',
        data.excessMinimum,
      );
    }

    if (data.excessMinimumUpper) {
      await this.fillInput(
        'Optional',
        data.excessMinimumUpper,
      );
    }

    if (data.startDate) {
      await this.setDate(
        'Start Date',
        data.startDate,
      );
    }

    if (data.endDate) {
      await this.setDate(
        'End Date',
        data.endDate,
      );
    }

    if (data.gender) {
      await this.selectDropdownByLabel(
        'Gender',
        data.gender,
      );
    }
  }

  async clickCreateBaseRate(): Promise<void> {
    const button =
      this.createBaseRateButton();

    await button.waitFor({
      state: 'visible',
      timeout: this.timeout,
    });

    await button.scrollIntoViewIfNeeded();

    await button.click();

    await this.page.waitForTimeout(700);
  }

  async verifyShortTermBaseRateCreated(): Promise<void> {
    await expect(
      this.baseRatesHeading(),
    ).toBeVisible({
      timeout: this.timeout,
    });
  }

  // ============================================================
  // LONG TERM - GENERAL INFORMATION
  // ============================================================

  async clickAddRating(): Promise<void> {
    const button =
      this.addRatingButton();

    await button.waitFor({
      state: 'visible',
      timeout: this.timeout,
    });

    await button.click();

    await this.page.waitForTimeout(700);
  }

  async enterLongTermProductDetails(
    data: Record<string, string>,
  ): Promise<void> {
    // UNDERWRITER

    if (data.underwriter) {
      await this.selectDropdownByLabel(
        'Underwriter',
        data.underwriter,
      );

      await this.page.waitForTimeout(700);
    }

    // PRODUCT - DEPENDS ON UNDERWRITER

    if (data.product) {
      const productDropdown =
        await this.waitForDropdownEnabled(
          'Product',
        );

      await this.selectDropdown(
        productDropdown,
        data.product,
      );

      await this.page.waitForTimeout(700);
    }

    // RATING TYPE

    if (data.ratingType) {
      await this.selectDropdownByLabel(
        'Rating Type',
        data.ratingType,
      );
    }

    // STATUS

    if (data.status) {
      await this.selectDropdownByLabel(
        'Status',
        data.status,
      );
    }

    // EFFECTIVE FROM

    if (data.effectiveFrom) {
      await this.setDate(
        'Effective From',
        data.effectiveFrom,
      );
    }

    // EFFECTIVE TO

    if (data.effectiveTo) {
      await this.setDate(
        'Effective To',
        data.effectiveTo,
      );
    }
  }

  // ============================================================
  // NEXT BUTTON
  // ============================================================

  async clickNext(): Promise<void> {
    await this.closeOpenDropdown();

    const nextButton =
      this.page
        .getByRole('button', {
          name: /^Next/i,
        })
        .last();

    await nextButton.waitFor({
      state: 'visible',
      timeout: this.timeout,
    });

    await nextButton.scrollIntoViewIfNeeded();

    await expect(nextButton).toBeEnabled({
      timeout: this.timeout,
    });

    await nextButton.click();

    await this.page.waitForTimeout(800);
  }

  // ============================================================
  // LONG TERM - LIFE COVER RATING CRITERIA
  // ============================================================

  async enterLifeCoverRatingCriteria(): Promise<void> {
    // GENDER

    await this.selectCriteriaDropdown(
      'Gender',
      'Male',
    );

    await this.selectCriteriaDropdown(
      'Gender',
      'Female',
    );

    // AGE RANGE

    await this.page
      .getByPlaceholder('18', {
        exact: true,
      })
      .first()
      .fill('18');

    await this.page
      .getByPlaceholder('65', {
        exact: true,
      })
      .first()
      .fill('65');

    // COVER AMOUNT RANGE

    await this.page
      .getByPlaceholder('50000', {
        exact: true,
      })
      .first()
      .fill('50000');

    await this.page
      .getByPlaceholder('5000000', {
        exact: true,
      })
      .first()
      .fill('5000000');

    // MEDICAL UNDERWRITING

    await this.selectCriteriaDropdown(
      'Medical Underwriting',
      'Required',
    );

    await this.selectCriteriaDropdown(
      'Medical Underwriting',
      'Not Required',
    );

    // SMOKING STATUS

    await this.selectCriteriaDropdown(
      'Smoking Status',
      'Smoker',
    );

    await this.selectCriteriaDropdown(
      'Smoking Status',
      'Non-Smoker',
    );

    // EDUCATION LEVEL

    await this.selectCriteriaDropdown(
      'Education Level',
      'Primary',
    );

    await this.selectCriteriaDropdown(
      'Education Level',
      'Secondary',
    );

    await this.selectCriteriaDropdown(
      'Education Level',
      'Tertiary',
    );

    // FINANCIAL UNDERWRITING

    await this.selectCriteriaDropdown(
      'Financial Underwriting',
      'Required',
    );

    await this.selectCriteriaDropdown(
      'Financial Underwriting',
      'Not Required',
    );

    // CASHBACK OPTION

    await this.selectCriteriaDropdown(
      'Cashback Option',
      'Included',
    );

    await this.selectCriteriaDropdown(
      'Cashback Option',
      'Not Included',
    );

    await this.closeOpenDropdown();
  }

  // ============================================================
  // LONG TERM - RATE CONFIGURATION
  // ============================================================

  async configureLifeCoverRate(
    data: Record<string, string>,
  ): Promise<void> {
    await this.closeOpenDropdown();

    const addRateButton =
      this.page.getByRole('button', {
        name: 'Add Rate',
        exact: true,
      });

    await addRateButton.waitFor({
      state: 'visible',
      timeout: this.timeout,
    });

    await addRateButton.scrollIntoViewIfNeeded();

    await addRateButton.click();

    await this.page.waitForTimeout(500);

    const row =
      this.page
        .locator('tbody tr')
        .filter({
          has: this.page.locator(
            'button[role="combobox"]',
          ),
        })
        .last();

    await row.waitFor({
      state: 'visible',
      timeout: this.timeout,
    });

    const dropdowns =
      row.getByRole('combobox');

    // GENDER

    if (data.gender) {
      await this.selectDropdown(
        dropdowns.nth(0),
        data.gender,
      );
    }

    // AGE RANGE

    if (data.ageFrom) {
      await row
        .getByPlaceholder('18', {
          exact: true,
        })
        .fill(data.ageFrom);
    }

    if (data.ageTo) {
      await row
        .getByPlaceholder('30', {
          exact: true,
        })
        .fill(data.ageTo);
    }

    // COVER AMOUNT RANGE

    if (data.coverAmountFrom) {
      await row
        .getByPlaceholder('50000', {
          exact: true,
        })
        .fill(data.coverAmountFrom);
    }

    if (data.coverAmountTo) {
      await row
        .getByPlaceholder('500000', {
          exact: true,
        })
        .fill(data.coverAmountTo);
    }

    // SMOKING STATUS

    if (data.smokingStatus) {
      await this.selectDropdown(
        dropdowns.nth(1),
        data.smokingStatus,
      );
    }

    // EDUCATION

    if (data.education) {
      await this.selectDropdown(
        dropdowns.nth(2),
        data.education,
      );
    }

    // MEDICAL UNDERWRITING

    if (data.medicalUW) {
      await this.selectDropdown(
        dropdowns.nth(3),
        data.medicalUW,
      );
    }

    // FINANCIAL UNDERWRITING

    if (data.financialUW) {
      await this.selectDropdown(
        dropdowns.nth(4),
        data.financialUW,
      );
    }

    // CASHBACK

    if (data.cashback) {
      await this.selectDropdown(
        dropdowns.nth(5),
        data.cashback,
      );
    }

    // MONTHLY PREMIUM

    if (data.monthlyPremium) {
      const premiumInput =
        row
          .getByPlaceholder('0.00', {
            exact: true,
          })
          .first();

      await premiumInput.waitFor({
        state: 'visible',
        timeout: this.timeout,
      });

      await premiumInput.fill(
        data.monthlyPremium,
      );
    }

    await this.closeOpenDropdown();

    await this.page.waitForTimeout(300);
  }

  // ============================================================
  // REVIEW & SAVE
  // ============================================================

  async verifyRatingReview(): Promise<void> {
    await expect(
      this.generalInformationHeading(),
    ).toBeVisible({
      timeout: this.timeout,
    });

    await expect(
      this.ratingCriteriaHeading(),
    ).toBeVisible({
      timeout: this.timeout,
    });

    const lifeCoverRates =
      this.lifeCoverRatesHeading();

    if (
      await lifeCoverRates
        .isVisible()
        .catch(() => false)
    ) {
      await expect(
        lifeCoverRates,
      ).toBeVisible({
        timeout: this.timeout,
      });
    }
  }

  async clickSaveAndActivate(): Promise<void> {
    await this.closeOpenDropdown();

    const button =
      this.saveAndActivateButton();

    await button.waitFor({
      state: 'visible',
      timeout: this.timeout,
    });

    await button.scrollIntoViewIfNeeded();

    await expect(button).toBeEnabled({
      timeout: this.timeout,
    });

    await button.click();

    await this.page.waitForTimeout(700);
  }

  async verifyLongTermRatingCreated(): Promise<void> {
    await expect(
      this.longTermRatingHeading(),
    ).toBeVisible({
      timeout: this.timeout,
    });
  }

  // ============================================================
  // LOGOUT
  // ============================================================

  private accountMenuButton = () =>
    this.page.getByRole('button', {
      name: 'Account menu',
      exact: true,
    });

  private signOutOption = () =>
    this.page.getByRole('menuitem', {
      name: /Sign out/i,
    });

  async openAccountMenu(): Promise<void> {
    const accountMenu =
      this.accountMenuButton();

    await accountMenu.waitFor({
      state: 'visible',
      timeout: this.timeout,
    });

    await accountMenu.click();

    await this.page.waitForTimeout(300);
  }

  async clickSignOut(): Promise<void> {
    const signOut =
      this.signOutOption();

    await signOut.waitFor({
      state: 'visible',
      timeout: this.timeout,
    });

    await signOut.click();

    await this.page.waitForTimeout(500);
  }

  async verifyLoggedOut(): Promise<void> {
    const loginEmail =
      this.page.locator('#email');

    await loginEmail.waitFor({
      state: 'visible',
      timeout: this.timeout,
    });

    await expect(loginEmail).toBeVisible();

    console.log(
      'POSO logout completed successfully.',
    );
  }
}
