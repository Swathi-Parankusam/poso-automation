
import { expect, type Locator, type Page } from '@playwright/test';
import type { LocatorConfig } from '../utils/LocatorConfig.js';
import { SelfHealingActions } from '../utils/SelfHealingActions.js';

export interface TaxConfigurationDetails {
    taxCode: string;
    taxRate: string;
    underwriter: string;
    product: string;
    effectiveFrom: string;
    effectiveTo: string;
    status: string;
    description: string;
}

export class TaxConfigurationPage {
    private readonly page: Page;
    private readonly actions: SelfHealingActions;

    constructor(page: Page) {
        this.page = page;
        this.actions = new SelfHealingActions(page);
    }

    // =========================================================
    // SELF-HEALING LOCATOR HELPER
    // =========================================================

    private async getElement(
        key: string,
        primary: LocatorConfig,
        fallbacks: LocatorConfig[] = []
    ): Promise<Locator> {
        return await this.actions.getLocator(key, primary, fallbacks);
    }

    // =========================================================
    // COMMON ACTION METHODS
    // =========================================================

    private async clickElement(
        key: string,
        primary: LocatorConfig,
        fallbacks: LocatorConfig[] = []
    ): Promise<void> {
        const element = await this.getElement(key, primary, fallbacks);

        await element.waitFor({ state: 'visible', timeout: 15000 });
        await element.scrollIntoViewIfNeeded();
        await element.click();
    }

    private async fillElement(
        key: string,
        primary: LocatorConfig,
        value: string,
        fallbacks: LocatorConfig[] = []
    ): Promise<void> {
        const element = await this.getElement(key, primary, fallbacks);

        await element.waitFor({ state: 'visible', timeout: 15000 });
        await element.fill(value);

        await expect(element).toHaveValue(value);
    }

    // =========================================================
    // NAVIGATION
    // =========================================================


    async navigateToTaxConfiguration(): Promise<void> {
        // Administration menu
        const administrationButton = this.page.getByRole('button', {
            name: 'Administration',
            exact: true
        });

        await expect(administrationButton).toBeVisible({
            timeout: 15000
        });

        // Expand only when it is currently collapsed
        const isExpanded = await administrationButton.getAttribute(
            'aria-expanded'
        );

        if (isExpanded !== 'true') {
            await administrationButton.click();
        }

        await expect(administrationButton).toHaveAttribute(
            'aria-expanded',
            'true'
        );

        console.log('Administration menu expanded');

        // Tax Configuration submenu
        await this.clickElement(
            'taxConfiguration.navigation.taxConfiguration',
            {
                type: 'role',
                role: 'link',
                name: 'Tax Configuration'
            },
            [
                {
                    type: 'css',
                    value: 'a[href="/screens/tax-configurations"]'
                }
            ]
        );

        await expect(
            this.page.getByRole('heading', {
                name: 'Tax Configuration'
            })
        ).toBeVisible({ timeout: 15000 });

        console.log('Navigated to Tax Configuration');
    }

    // =========================================================
    // TAX CONFIGURATION LIST
    // =========================================================

    async verifyTaxConfigurationList(): Promise<void> {
        await expect(
            this.page.getByRole('heading', {
                name: 'Tax Configuration'
            })
        ).toBeVisible();

        const headers = [
            'Tax Code',
            'Rate',
            'Level',
            'Underwriter',
            'Product',
            'Effective From',
            'Effective To',
            'Status'
        ];

        for (const header of headers) {
            await expect(
                this.page.getByRole('columnheader', {
                    name: header
                })
            ).toBeVisible();
        }
    }

    async clickNewTaxConfiguration(): Promise<void> {
        await this.clickElement(
            'taxConfiguration.list.newTaxConfiguration',
            {
                type: 'role',
                role: 'button',
                name: 'New Tax Configuration'
            }
        );

        await expect(
            this.page.getByRole('heading', {
                name: 'New Tax Configuration'
            })
        ).toBeVisible();
    }

    // =========================================================
    // DROPDOWN SELECTION
    // =========================================================

    private async selectDropdown(
        key: string,
        dropdown: Locator,
        optionName: string
    ): Promise<void> {
        await dropdown.waitFor({
            state: 'visible',
            timeout: 15000
        });

        await dropdown.click();

        const option = await this.getElement(
            `${key}.option.${optionName.replace(/\s+/g, '_')}`,
            {
                type: 'role',
                role: 'option',
                name: optionName
            },
            [
                {
                    type: 'text',
                    value: optionName
                }
            ]
        );

        await option.waitFor({
            state: 'visible',
            timeout: 15000
        });

        await option.click();
    }

    // =========================================================
    // DATE FORMAT HELPER
    // =========================================================

    private convertDateToInputFormat(date: string): string {
        const trimmedDate = date.trim();

        const match = trimmedDate.match(
            /^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/
        );

        if (match) {
            const months: Record<string, string> = {
                Jan: '01', Feb: '02', Mar: '03',
                Apr: '04', May: '05', Jun: '06',
                Jul: '07', Aug: '08', Sep: '09',
                Oct: '10', Nov: '11', Dec: '12'
            };

            const month = months[
                match[2].charAt(0).toUpperCase() +
                match[2].slice(1).toLowerCase()
            ];

            if (!month) {
                throw new Error(`Invalid month: ${match[2]}`);
            }

            return `${match[3]}-${month}-${match[1].padStart(2, '0')}`;
        }

        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedDate)) {
            return trimmedDate;
        }

        throw new Error(
            `Invalid date format: ${date}. Expected DD MMM YYYY or YYYY-MM-DD.`
        );
    }

    // =========================================================
    // TAX CONFIGURATION FORM
    // =========================================================

    async enterTaxCode(taxCode: string): Promise<void> {
        await this.fillElement(
            'taxConfiguration.form.taxCode',
            {
                type: 'label',
                value: 'Tax Code'
            },
            taxCode,
            [
                {
                    type: 'css',
                    value: 'input[name="taxCode"]'
                },
                {
                    type: 'placeholder',
                    value: 'Enter tax code'
                }
            ]
        );
    }

    async enterTaxRate(taxRate: string): Promise<void> {
        await this.fillElement(
            'taxConfiguration.form.taxRate',
            {
                type: 'label',
                value: 'Tax Rate (%)'
            },
            taxRate,
            [
                {
                    type: 'placeholder',
                    value: '14'
                }
            ]
        );
    }

    async selectUnderwriter(underwriter: string): Promise<void> {
        const dropdown = await this.getElement(
            'taxConfiguration.form.underwriter',
            {
                type: 'xpath',
                value: '(//*[@role="combobox"])[1]'
            }
        );

        await this.selectDropdown(
            'taxConfiguration.form.underwriter',
            dropdown,
            underwriter
        );
    }

    async selectProduct(product: string): Promise<void> {
        const dropdown = await this.getElement(
            'taxConfiguration.form.product',
            {
                type: 'xpath',
                value: '(//*[@role="combobox"])[2]'
            }
        );

        await this.selectDropdown(
            'taxConfiguration.form.product',
            dropdown,
            product
        );
    }

    async enterEffectiveFrom(date: string): Promise<void> {
        const inputDate = this.convertDateToInputFormat(date);

        await this.fillElement(
            'taxConfiguration.form.effectiveFrom',
            {
                type: 'xpath',
                value: '(//input[@type="date"])[1]'
            },
            inputDate
        );
    }

    async enterEffectiveTo(date: string): Promise<void> {
        const inputDate = this.convertDateToInputFormat(date);

        await this.fillElement(
            'taxConfiguration.form.effectiveTo',
            {
                type: 'xpath',
                value: '(//input[@type="date"])[2]'
            },
            inputDate
        );
    }

    async selectStatus(status: string): Promise<void> {
        const dropdown = await this.getElement(
            'taxConfiguration.form.status',
            {
                type: 'xpath',
                value: '(//*[@role="combobox"])[3]'
            }
        );

        await this.selectDropdown(
            'taxConfiguration.form.status',
            dropdown,
            status
        );
    }

    async enterDescription(description: string): Promise<void> {
        await this.fillElement(
            'taxConfiguration.form.description',
            {
                type: 'label',
                value: 'Description'
            },
            description,
            [
                {
                    type: 'placeholder',
                    value: 'Optional notes'
                }
            ]
        );
    }

    // =========================================================
    // FILL COMPLETE TAX CONFIGURATION FORM
    // =========================================================

    async fillTaxConfigurationDetails(
        details: TaxConfigurationDetails
    ): Promise<void> {
        await this.enterTaxCode(details.taxCode);

        await this.enterTaxRate(details.taxRate);

        // Select Underwriter before Product
        await this.selectUnderwriter(details.underwriter);

        await this.selectProduct(details.product);

        await this.enterEffectiveFrom(details.effectiveFrom);

        if (details.effectiveTo.trim() !== '') {
            await this.enterEffectiveTo(details.effectiveTo);
        }

        await this.selectStatus(details.status);

        if (details.description.trim() !== '') {
            await this.enterDescription(details.description);
        }
    }

    // =========================================================
    // CREATE TAX CONFIGURATION
    // =========================================================

    async clickCreateTaxConfiguration(): Promise<void> {
        await this.clickElement(
            'taxConfiguration.form.create',
            {
                type: 'role',
                role: 'button',
                name: 'Create Tax Configuration'
            }
        );
    }

    // =========================================================
    // VERIFY CREATED TAX CONFIGURATION
    // =========================================================

    async verifyCreatedTaxConfiguration(
        taxCode: string
    ): Promise<void> {
        await expect(
            this.page.getByRole('heading', {
                name: 'Tax Configuration'
            })
        ).toBeVisible({ timeout: 15000 });

        const createdRow = this.page
            .locator('table tbody tr')
            .filter({
                has: this.page.locator('td').filter({
                    hasText: new RegExp(`^${taxCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`)
                })
            });

        await expect(createdRow.first()).toBeVisible({
            timeout: 15000
        });

        console.log(
            `Successfully verified Tax Configuration: ${taxCode}`
        );
    }
    // =========================================================
    // CANCEL / BACK TO LIST
    // =========================================================

    async clickCancel(): Promise<void> {
        await this.clickElement(
            'taxConfiguration.form.cancel',
            {
                type: 'role',
                role: 'button',
                name: 'Cancel'
            }
        );
    }

    async clickBackToList(): Promise<void> {
        await this.clickElement(
            'taxConfiguration.form.backToList',
            {
                type: 'role',
                role: 'button',
                name: 'Back to List'
            }
        );
    }
}
