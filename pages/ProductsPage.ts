import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

import { SelfHealingActions } from '../utils/SelfHealingActions.js';
import type { LocatorConfig } from '../utils/LocatorConfig.js';

// ==========================================================
// PRODUCT INTERFACES
// ==========================================================

export interface ProductDetails {
    productName?: string;
    abbreviation?: string;
    insuranceCompany?: string;
    productCategory?: string;
    productGroup?: string;
    // Supports the existing Gherkin table key "Product Group".
    'Product Group'?: string;
    description?: string;
}

export interface CoverageDetails {
    coverageName?: string;
    amount?: string;
    description?: string;
    subLimits?: string;
    waitingPeriod?: string;
    conditions?: string;
    mandatory?: string;
}

export interface BenefitDetails {
    benefitName?: string;
    validityPeriod?: string;
    description?: string;
    conditions?: string;
}

export interface AdditionalProductDetails {
    minimumAge?: string;
    maximumAge?: string;
    termsConditions?: string;
}

export interface CustomFieldDetails {
    fieldName?: string;
    fieldType?: string;
    requiredField?: string;
    additionalConstraints?: string;
}

export interface TerminationChargeDetails {
    chargeType?: string;
    refundPaidBy?: string;
}

// ==========================================================
// PRODUCTS PAGE
// ==========================================================

export class ProductsPage {

    private readonly page: Page;
    private readonly actions: SelfHealingActions;

    private currentProductName = '';

    constructor(page: Page) {

        this.page = page;

        this.actions =
            new SelfHealingActions(page);
    }

    // ======================================================
    // COMMON SELF-HEALING HELPERS
    // ======================================================

    private async getElement(
        key: string,
        primary: LocatorConfig,
        fallbacks: LocatorConfig[] = []
    ): Promise<Locator> {

        return await this.actions.getLocator(
            key,
            primary,
            fallbacks
        );
    }

    private async clickElement(
        key: string,
        primary: LocatorConfig,
        fallbacks: LocatorConfig[] = []
    ): Promise<void> {

        const element =
            await this.getElement(
                key,
                primary,
                fallbacks
            );

        await element.waitFor({
            state: 'visible',
            timeout: 15000
        });

        await element.scrollIntoViewIfNeeded();

        await element.click();
    }

    private async fillElement(
        key: string,
        primary: LocatorConfig,
        value: string,
        fallbacks: LocatorConfig[] = []
    ): Promise<void> {

        const element =
            await this.getElement(
                key,
                primary,
                fallbacks
            );

        await element.waitFor({
            state: 'visible',
            timeout: 15000
        });

        await element.scrollIntoViewIfNeeded();

        await element.fill(value);

        await expect(element).toHaveValue(
            value
        );
    }

    // ======================================================
    // DROPDOWN HELPERS
    // ======================================================

    private async selectDropdown(
        key: string,
        dropdown: Locator,
        value: string
    ): Promise<void> {

        await dropdown.waitFor({
            state: 'visible',
            timeout: 15000
        });

        await dropdown.scrollIntoViewIfNeeded();

        const tagName =
            await dropdown.evaluate(
                function (element: Element) {

                    return element.tagName.toLowerCase();
                }
            );

        // --------------------------------------------------
        // NATIVE SELECT
        // --------------------------------------------------

        if (tagName === 'select') {

            await dropdown.selectOption({
                label: value
            });

            console.log(
                `${key} selected: ${value}`
            );

            return;
        }

        // --------------------------------------------------
        // CUSTOM DROPDOWN
        // --------------------------------------------------

        await dropdown.click();

        await this.page.waitForTimeout(500);

        // --------------------------------------------------
        // ROLE OPTION
        // --------------------------------------------------

        const roleOption =
            this.page.getByRole(
                'option',
                {
                    name: value,
                    exact: true
                }
            );

        const roleOptionCount =
            await roleOption.count();

        for (
            let index = 0;
            index < roleOptionCount;
            index++
        ) {

            const option =
                roleOption.nth(index);

            if (
                await option.isVisible()
            ) {

                await option.scrollIntoViewIfNeeded();

                await option.click();

                console.log(
                    `${key} selected: ${value}`
                );

                return;
            }
        }

        // --------------------------------------------------
        // LIST ITEM
        // --------------------------------------------------

        const listItem =
            this.page.getByRole(
                'listitem',
                {
                    name: value,
                    exact: true
                }
            );

        const listItemCount =
            await listItem.count();

        for (
            let index = 0;
            index < listItemCount;
            index++
        ) {

            const option =
                listItem.nth(index);

            if (
                await option.isVisible()
            ) {

                await option.scrollIntoViewIfNeeded();

                await option.click();

                console.log(
                    `${key} selected: ${value}`
                );

                return;
            }
        }

        // --------------------------------------------------
        // EXACT TEXT
        // --------------------------------------------------

        const textOption =
            this.page.getByText(
                value,
                {
                    exact: true
                }
            );

        const textOptionCount =
            await textOption.count();

        for (
            let index = 0;
            index < textOptionCount;
            index++
        ) {

            const option =
                textOption.nth(index);

            if (
                await option.isVisible()
            ) {

                await option.scrollIntoViewIfNeeded();

                await option.click();

                console.log(
                    `${key} selected: ${value}`
                );

                return;
            }
        }

        throw new Error(
            `Unable to select "${value}" ` +
            `from dropdown "${key}".`
        );
    }

    private async selectFormDropdown(
        key: string,
        index: number,
        value: string
    ): Promise<void> {

        const dropdown =
            this.page
                .getByRole('combobox')
                .nth(index);

        await this.selectDropdown(
            key,
            dropdown,
            value
        );
    }

    private async waitForDropdownEnabled(
        dropdown: Locator
    ): Promise<void> {

        await expect(dropdown).toBeVisible({
            timeout: 15000
        });

        await expect(dropdown).toBeEnabled({
            timeout: 15000
        });
    }

    private async setCheckbox(
        locator: Locator,
        shouldBeChecked: boolean
    ): Promise<void> {

        await locator.waitFor({
            state: 'visible',
            timeout: 15000
        });

        const isChecked =
            await locator.isChecked();

        if (
            shouldBeChecked &&
            !isChecked
        ) {

            await locator.check();
        }

        if (
            !shouldBeChecked &&
            isChecked
        ) {

            await locator.uncheck();
        }
    }

    // ======================================================
    // PRODUCTS NAVIGATION
    // ======================================================

    async navigateToProducts(): Promise<void> {

        const administration =
            this.page.getByRole(
                'button',
                {
                    name: 'Administration',
                    exact: true
                }
            );

        await expect(
            administration
        ).toBeVisible({
            timeout: 15000
        });

        const isExpanded =
            await administration.getAttribute(
                'aria-expanded'
            );

        console.log(
            `Administration expanded: ${isExpanded}`
        );

        if (isExpanded !== 'true') {

            await administration.click();

            await this.page.waitForTimeout(500);
        }

        const productsText =
            this.page.getByText(
                'Products',
                {
                    exact: true
                }
            );

        await expect(
            productsText
        ).toBeVisible({
            timeout: 15000
        });

        await productsText.scrollIntoViewIfNeeded();

        await productsText.click();

        console.log(
            'Products menu clicked'
        );

        await this.page.waitForTimeout(1000);

        console.log(
            'Navigated to Products page'
        );
    }

    // ======================================================
    // PRODUCTS PAGE VERIFICATION
    // ======================================================

    async verifyProductsPageDisplayed(): Promise<void> {

        await expect(
            this.page.getByRole(
                'heading',
                {
                    name: 'Products',
                    exact: true
                }
            )
        ).toBeVisible({
            timeout: 15000
        });

        console.log(
            'Products page displayed successfully'
        );
    }

    async verifyProductsListDisplayed(): Promise<void> {

        const headers = [
            'Product',
            'Product Category',
            'Product Group',
            'Underwriter',
            'Status',
            'Description',
            'Last Updated',
            'Actions'
        ];

        for (const header of headers) {

            await expect(
                this.page.getByRole(
                    'columnheader',
                    {
                        name: header,
                        exact: true
                    }
                )
            ).toBeVisible({
                timeout: 15000
            });
        }

        console.log(
            'Products list displayed successfully'
        );
    }

    // ======================================================
    // CREATE PRODUCT
    // ======================================================

    async clickNewProduct(): Promise<void> {

        await this.clickElement(
            'products.create.newProduct',
            {
                type: 'role',
                role: 'button',
                name: 'New Product'
            },
            [
                {
                    type: 'text',
                    value: 'New Product'
                }
            ]
        );

        console.log(
            'New Product form opened'
        );
    }

    // ======================================================
    // MANDATORY PRODUCT DETAILS
    // ======================================================

    async enterMandatoryProductDetails(
        details: ProductDetails
    ): Promise<void> {

        // --------------------------------------------------
        // PRODUCT NAME
        // --------------------------------------------------

        if (details.productName) {

            this.currentProductName = details.productName;

            // The application generates a dynamic ID for this input.
            // Use its stable name attribute first, then the stable placeholder.
            let productNameField = this.page.locator('input[name="name"]');

            if (await productNameField.count() !== 1) {
                productNameField = this.page.getByPlaceholder(
                    'Enter product name',
                    { exact: true }
                );
            }

            // Do not let self-healing guess if the field is ambiguous.
            await expect(productNameField).toHaveCount(1, {
                timeout: 15000
            });
            await expect(productNameField).toBeVisible({
                timeout: 15000
            });

            await productNameField.scrollIntoViewIfNeeded();
            await productNameField.fill(details.productName);

            await expect(productNameField).toHaveValue(
                details.productName
            );

            console.log(
                `Product name entered: ${details.productName}`
            );
        }

        // --------------------------------------------------
        // ABBREVIATION
        // --------------------------------------------------

        if (details.abbreviation) {

            await this.fillElement(
                'products.form.abbreviation',
                {
                    type: 'css',
                    value:
                        'input[name="abbreviation"]'
                },
                details.abbreviation,
                [
                    {
                        type: 'placeholder',
                        value:
                            'Enter abbreviation'
                    }
                ]
            );
        }

        // --------------------------------------------------
        // INSURANCE COMPANY
        // --------------------------------------------------

        if (details.insuranceCompany) {

            await this.selectFormDropdown(
                'products.form.insuranceCompany',
                0,
                details.insuranceCompany
            );
        }

        // --------------------------------------------------
        // PRODUCT CATEGORY
        // --------------------------------------------------

        if (details.productCategory) {

            await this.selectFormDropdown(
                'products.form.productCategory',
                1,
                details.productCategory
            );
        }

        // --------------------------------------------------
        // PRODUCT GROUP
        // --------------------------------------------------

        const productGroupValue =
            details.productGroup ?? details['Product Group'];

        if (productGroupValue) {

            const productGroupByLabel =
                this.page.getByLabel(
                    'Product Group',
                    {
                        exact: true
                    }
                );

            if (
                await productGroupByLabel.count() > 0
            ) {

                await this.waitForDropdownEnabled(
                    productGroupByLabel
                );

                await this.selectDropdown(
                    'products.form.productGroup',
                    productGroupByLabel,
                    productGroupValue
                );

            } else {

                const productGroupDropdown =
                    this.page
                        .getByRole('combobox')
                        .nth(2);

                await this.waitForDropdownEnabled(
                    productGroupDropdown
                );

                await this.selectDropdown(
                    'products.form.productGroup',
                    productGroupDropdown,
                    productGroupValue
                );
            }

            console.log(
                `Product Group selected: ${productGroupValue}`
            );
        }

        // --------------------------------------------------
        // DESCRIPTION
        // --------------------------------------------------

        if (details.description) {

            await this.fillElement(
                'products.form.description',
                {
                    type: 'css',
                    value:
                        'textarea[name="description"]'
                },
                details.description,
                [
                    {
                        type: 'placeholder',
                        value:
                            'Enter product description'
                    }
                ]
            );
        }

        console.log(
            'Mandatory product details entered'
        );
    }

    // ======================================================
    // PRODUCT GROUP
    // KEPT FOR FUTURE REUSE
    // ======================================================

    async selectProductGroup(
        group: string
    ): Promise<void> {

        const productGroupByLabel =
            this.page.getByLabel(
                'Product Group',
                {
                    exact: true
                }
            );

        if (
            await productGroupByLabel.count() > 0
        ) {

            await this.waitForDropdownEnabled(
                productGroupByLabel
            );

            await this.selectDropdown(
                'products.form.productGroup',
                productGroupByLabel,
                group
            );

            console.log(
                `Product Group selected: ${group}`
            );

            return;
        }

        const productGroupDropdown =
            this.page
                .getByRole('combobox')
                .nth(2);

        await this.waitForDropdownEnabled(
            productGroupDropdown
        );

        await this.selectDropdown(
            'products.form.productGroup',
            productGroupDropdown,
            group
        );

        console.log(
            `Product Group selected: ${group}`
        );
    }

    // ======================================================
    // COVERAGES
    // ======================================================

    async addCoverage(
        details: CoverageDetails,
        index = 0
    ): Promise<void> {

        await this.clickElement(
            'products.coverage.addCoverage',
            {
                type: 'role',
                role: 'button',
                name: 'Add Coverage'
            },
            [
                {
                    type: 'text',
                    value: 'Add Coverage'
                }
            ]
        );

        // Wait briefly for the new coverage section
        await this.page.waitForTimeout(300);

        const fields: {
            key: string;
            name: string;
            value?: string;
            placeholder: string;
        }[] = [
            {
                key: 'coverageName',
                name: `coverages.${index}.name`,
                value: details.coverageName,
                placeholder: 'e.g., Room Rent'
            },
            {
                key: 'amount',
                name: `coverages.${index}.amount`,
                value: details.amount,
                placeholder: 'e.g., 50.00'
            },
            {
                key: 'description',
                name:
                    `coverages.${index}.description`,
                value: details.description,
                placeholder:
                    'Describe the coverage'
            },
            {
                key: 'subLimits',
                name:
                    `coverages.${index}.subLimits`,
                value: details.subLimits,
                placeholder:
                    'e.g., Max 30 days/year'
            },
            {
                key: 'waitingPeriod',
                name:
                    `coverages.${index}.waitingPeriod`,
                value: details.waitingPeriod,
                placeholder:
                    'e.g., 30 days'
            },
            {
                key: 'conditions',
                name:
                    `coverages.${index}.conditions`,
                value: details.conditions,
                placeholder:
                    'Any specific conditions for this coverage'
            }
        ];

        for (const field of fields) {

            if (field.value) {

                await this.fillElement(
                    `products.coverage.${field.key}`,
                    {
                        type: 'css',
                        value:
                            `[name="${field.name}"]`
                    },
                    field.value,
                    [
                        {
                            type: 'placeholder',
                            value:
                                field.placeholder
                        }
                    ]
                );
            }
        }

        // --------------------------------------------------
        // MANDATORY COVERAGE
        //
        // Multiple coverage checkboxes may exist.
        // Use the LAST checkbox because it belongs to the
        // most recently added coverage.
        // --------------------------------------------------

        if (details.mandatory) {

            const mandatoryCoverages =
                this.page.getByRole(
                    'checkbox',
                    {
                        name: 'Mandatory coverage',
                        exact: true
                    }
                );

            const mandatoryCoverage =
                mandatoryCoverages.last();

            await this.setCheckbox(
                mandatoryCoverage,
                details.mandatory
                    .toLowerCase() === 'yes'
            );

            console.log(
                `Mandatory coverage: ` +
                `${details.mandatory}`
            );
        }

        console.log(
            `Coverage added: ${details.coverageName}`
        );
    }

    // ======================================================
    // BENEFITS
    // ======================================================

    async addBenefit(
        details: BenefitDetails,
        index = 0
    ): Promise<void> {

        await this.clickElement(
            'products.benefit.addBenefit',
            {
                type: 'role',
                role: 'button',
                name: 'Add Benefit'
            },
            [
                {
                    type: 'text',
                    value: 'Add Benefit'
                }
            ]
        );

        await this.page.waitForTimeout(300);

        const fields: {
            key: string;
            name: string;
            value?: string;
            placeholder: string;
        }[] = [
            {
                key: 'benefitName',
                name: `benefits.${index}.name`,
                value: details.benefitName,
                placeholder:
                    'e.g., No Claim Bonus'
            },
            {
                key: 'validityPeriod',
                name:
                    `benefits.${index}.validityPeriod`,
                value: details.validityPeriod,
                placeholder:
                    'e.g., 1 year'
            },
            {
                key: 'description',
                name:
                    `benefits.${index}.description`,
                value: details.description,
                placeholder:
                    'Describe the benefit'
            },
            {
                key: 'conditions',
                name:
                    `benefits.${index}.conditions`,
                value: details.conditions,
                placeholder:
                    'Any specific conditions for this benefit'
            }
        ];

        for (const field of fields) {

            if (field.value) {

                await this.fillElement(
                    `products.benefit.${field.key}`,
                    {
                        type: 'css',
                        value:
                            `[name="${field.name}"]`
                    },
                    field.value,
                    [
                        {
                            type: 'placeholder',
                            value:
                                field.placeholder
                        }
                    ]
                );
            }
        }

        console.log(
            `Benefit added: ${details.benefitName}`
        );
    }

    // ======================================================
    // ADDITIONAL PRODUCT DETAILS
    // ======================================================

    async enterAdditionalProductDetails(
        details: AdditionalProductDetails
    ): Promise<void> {

        if (details.minimumAge) {

            await this.fillElement(
                'products.additional.minimumAge',
                {
                    type: 'css',
                    value: 'input[name="minAge"]'
                },
                details.minimumAge,
                [
                    {
                        type: 'placeholder',
                        value:
                            'Enter minimum age'
                    }
                ]
            );
        }

        if (details.maximumAge) {

            await this.fillElement(
                'products.additional.maximumAge',
                {
                    type: 'css',
                    value: 'input[name="maxAge"]'
                },
                details.maximumAge,
                [
                    {
                        type: 'placeholder',
                        value:
                            'Enter maximum age'
                    }
                ]
            );
        }

        if (details.termsConditions) {

            await this.fillElement(
                'products.additional.termsConditions',
                {
                    type: 'css',
                    value:
                        'textarea[name="termsAndConditions"]'
                },
                details.termsConditions,
                [
                    {
                        type: 'placeholder',
                        value:
                            'Enter terms and conditions'
                    }
                ]
            );
        }

        console.log(
            'Additional product details entered'
        );
    }

    // ======================================================
    // CUSTOM FIELDS
    // ======================================================

    // ======================================================
// CUSTOM FIELDS
// ======================================================

async addCustomField(
    details: CustomFieldDetails
): Promise<void> {

    // --------------------------------------------------
    // CLICK ADD CUSTOM FIELD IF REQUIRED
    // --------------------------------------------------

    const addCustomFieldButton =
        this.page.getByRole(
            'button',
            {
                name: /add custom field/i
            }
        );

    if (
        await addCustomFieldButton.count() > 0
    ) {

        const button =
            addCustomFieldButton.last();

        if (
            await button.isVisible()
        ) {

            await button.scrollIntoViewIfNeeded();

            await button.click();

            await this.page.waitForTimeout(500);

            console.log(
                'Add Custom Field button clicked'
            );
        }
    }

    // --------------------------------------------------
    // FIELD NAME
    // --------------------------------------------------

    if (details.fieldName) {

        const fieldName =
            this.page.getByPlaceholder(
                'Enter field name',
                {
                    exact: true
                }
            ).last();

        await expect(fieldName).toBeVisible({
            timeout: 15000
        });

        await fieldName.scrollIntoViewIfNeeded();

        await fieldName.fill(
            details.fieldName
        );

        console.log(
            `Custom field name entered: ` +
            `${details.fieldName}`
        );
    }

    // --------------------------------------------------
    // FIELD TYPE
    // --------------------------------------------------

    if (details.fieldType) {

        const selects =
            this.page.locator('select');

        const selectCount =
            await selects.count();

        let fieldTypeSelected = false;

        for (
            let index = selectCount - 1;
            index >= 0;
            index--
        ) {

            const select =
                selects.nth(index);

            if (
                await select.isVisible()
            ) {

                await select.scrollIntoViewIfNeeded();

                try {

                    await select.selectOption({
                        label: details.fieldType
                    });

                    fieldTypeSelected = true;

                    console.log(
                        `Custom field type selected: ` +
                        `${details.fieldType}`
                    );

                    break;

                } catch {

                    // Try next visible select
                }
            }
        }

        if (!fieldTypeSelected) {

            const comboboxes =
                this.page.getByRole(
                    'combobox'
                );

            const comboboxCount =
                await comboboxes.count();

            for (
                let index =
                    comboboxCount - 1;
                index >= 0;
                index--
            ) {

                const dropdown =
                    comboboxes.nth(index);

                if (
                    await dropdown.isVisible()
                ) {

                    try {

                        await this.selectDropdown(
                            'products.customField.fieldType',
                            dropdown,
                            details.fieldType
                        );

                        fieldTypeSelected = true;

                        break;

                    } catch {

                        // Try next dropdown
                    }
                }
            }
        }

        if (!fieldTypeSelected) {

            throw new Error(
                `Unable to select custom field type: ` +
                `${details.fieldType}`
            );
        }
    }

    // --------------------------------------------------
    // REQUIRED FIELD
    // --------------------------------------------------

    if (details.requiredField) {

        const requiredCheckboxes =
            this.page.getByRole(
                'checkbox',
                {
                    name: /required/i
                }
            );

        const checkboxCount =
            await requiredCheckboxes.count();

        let requiredCheckbox: Locator | null =
            null;

        for (
            let index =
                checkboxCount - 1;
            index >= 0;
            index--
        ) {

            const checkbox =
                requiredCheckboxes.nth(index);

            if (
                await checkbox.isVisible()
            ) {

                requiredCheckbox =
                    checkbox;

                break;
            }
        }

        if (!requiredCheckbox) {

            throw new Error(
                'Unable to find Required Field checkbox.'
            );
        }

        await this.setCheckbox(
            requiredCheckbox,
            details.requiredField
                .toLowerCase() === 'yes'
        );

        console.log(
            `Required Field: ` +
            `${details.requiredField}`
        );
    }

    // --------------------------------------------------
    // ADDITIONAL CONSTRAINTS
    // --------------------------------------------------

    if (details.additionalConstraints) {

        const constraints =
            this.page.getByPlaceholder(
                'Enter any additional constraints or validation rules',
                {
                    exact: true
                }
            ).last();

        await expect(constraints).toBeVisible({
            timeout: 15000
        });

        await constraints.scrollIntoViewIfNeeded();

        await constraints.fill(
            details.additionalConstraints
        );

        console.log(
            'Additional constraints entered'
        );
    }

    // --------------------------------------------------
    // ADD FIELD
    // --------------------------------------------------

    const addFieldButton =
        this.page.getByRole(
            'button',
            {
                name: 'Add Field',
                exact: true
            }
        );

    const addFieldCount =
        await addFieldButton.count();

    for (
        let index =
            addFieldCount - 1;
        index >= 0;
        index--
    ) {

        const button =
            addFieldButton.nth(index);

        if (
            await button.isVisible()
        ) {

            await button.scrollIntoViewIfNeeded();

            await button.click();

            console.log(
                'Custom field added successfully'
            );

            return;
        }
    }

    throw new Error(
        'Unable to find visible Add Field button.'
    );
}

    // ======================================================
    // TERMINATION CHARGE AND REFUND DETAILS
    // ======================================================

    async configureTerminationCharge(
        details: TerminationChargeDetails
    ): Promise<void> {

        if (details.chargeType) {

            const chargeType =
                this.page
                    .getByText(
                        'Charge Type',
                        {
                            exact: true
                        }
                    )
                    .locator('..')
                    .getByRole('combobox');

            await this.selectDropdown(
                'products.termination.chargeType',
                chargeType,
                details.chargeType
            );
        }

        if (details.refundPaidBy) {

            const refundPaidBy =
                this.page
                    .getByText(
                        'Refund Paid By',
                        {
                            exact: true
                        }
                    )
                    .locator('..')
                    .getByRole('combobox');

            await this.selectDropdown(
                'products.termination.refundPaidBy',
                refundPaidBy,
                details.refundPaidBy
            );
        }

        console.log(
            'Termination charge details configured'
        );
    }

// ======================================================
// REQUIRED DOCUMENTS
// ======================================================

async addRequiredDocument(
    documentName: string
): Promise<void> {

    await this.fillElement(
        'products.documents.documentName',
        {
            type: 'role',
            role: 'textbox',
            name: 'Required document name'
        },
        documentName,
        [
            {
                type: 'placeholder',
                value: 'e.g. Proposal Form'
            }
        ]
    );

    await this.clickElement(
        'products.documents.addDocument',
        {
            type: 'role',
            role: 'button',
            name: 'Add'
        }
    );

    await expect(
        this.page.getByText(documentName, { exact: true })
    ).toBeVisible({ timeout: 15000 });

    console.log(`Required document added successfully: ${documentName}`);
}

    // ======================================================
    // COMMISSION COLLECTION TYPE
    // ======================================================

    async selectCommissionCollectionType(
        collectionType: string
    ): Promise<void> {

        const commissionOption =
            await this.getElement(
                'products.commission.collectionType',
                {
                    type: 'role',
                    role: 'radio',
                    name: collectionType
                }
            );

        await commissionOption.check();

        console.log(
            `Commission Collection Type selected: ` +
            `${collectionType}`
        );
    }

    // ======================================================
    // SAVE PRODUCT
    // ======================================================

    async saveProduct(): Promise<void> {

        await this.clickElement(
            'products.create.createProduct',
            {
                type: 'role',
                role: 'button',
                name: 'Create Product'
            },
            [
                {
                    type: 'text',
                    value: 'Create Product'
                }
            ]
        );

        console.log(
            'Create Product button clicked'
        );
    }

    // ======================================================
    // PRODUCT CREATION VERIFICATION
    // ======================================================

    async verifyProductCreatedSuccessfully(): Promise<void> {

        if (!this.currentProductName) {

            throw new Error(
                'Product name is not available for verification'
            );
        }

        await expect(
            this.page.getByText(
                this.currentProductName,
                {
                    exact: true
                }
            )
        ).toBeVisible({
            timeout: 20000
        });

        console.log(
            `Product created successfully: ` +
            `${this.currentProductName}`
        );
    }

    async verifyCreatedProductInList(
        productName: string
    ): Promise<void> {

        const product =
            this.page.getByText(
                productName,
                {
                    exact: true
                }
            );

        await expect(product).toBeVisible({
            timeout: 20000
        });

        console.log(
            `Verified product in Products list: ` +
            `${productName}`
        );
    }
}