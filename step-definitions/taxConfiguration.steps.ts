
import { When, Then, type DataTable } from '@cucumber/cucumber';
import type { CustomWorld } from '../support/world.js';
import {
    TaxConfigurationPage,
    type TaxConfigurationDetails
} from '../pages/TaxConfigurationPage.js';

// =========================================================
// TAX CONFIGURATION PAGE INITIALIZATION
// =========================================================

function getTaxConfigurationPage(
    world: CustomWorld
): TaxConfigurationPage {
    if (!world.page) {
        throw new Error('Playwright page is not initialized');
    }

    if (!world.taxConfigurationPage) {
        world.taxConfigurationPage =
            new TaxConfigurationPage(world.page);
    }

    return world.taxConfigurationPage;
}

// =========================================================
// NAVIGATION
// =========================================================

When(
    'I navigate to Administration and select Tax Configuration module',
    async function (this: CustomWorld) {
        const taxConfigurationPage = getTaxConfigurationPage(this);

        await taxConfigurationPage.navigateToTaxConfiguration();

        console.log('Navigated to Tax Configuration');
    }
);

// =========================================================
// CREATE NEW TAX CONFIGURATION
// =========================================================

When(
    'I click on New Tax Configuration',
    async function (this: CustomWorld) {
        const taxConfigurationPage = getTaxConfigurationPage(this);

        await taxConfigurationPage.clickNewTaxConfiguration();

        console.log('Clicked on New Tax Configuration');
    }
);

// =========================================================
// ENTER TAX CONFIGURATION DETAILS
// =========================================================

When(
    'I enter the Tax Configuration details',
    async function (
        this: CustomWorld,
        dataTable: DataTable
    ) {
        const taxConfigurationPage = getTaxConfigurationPage(this);

        const rows = dataTable.rowsHash();

        const details: TaxConfigurationDetails = {
            taxCode: rows['Tax Code'] ?? '',
            taxRate: rows['Tax Rate'] ?? '',
            underwriter: rows['Underwriter'] ?? '',
            product: rows['Product'] ?? '',
            effectiveFrom: rows['Effective From'] ?? '',
            effectiveTo: rows['Effective To'] ?? '',
            status: rows['Status'] ?? '',
            description: rows['Description'] ?? ''
        };

        this.currentTaxCode = details.taxCode;

        await taxConfigurationPage.fillTaxConfigurationDetails(details);

        console.log('Entered Tax Configuration details successfully');
    }
);

// =========================================================
// CREATE TAX CONFIGURATION
// =========================================================

When(
    'I click on Create Tax Configuration',
    async function (this: CustomWorld) {
        const taxConfigurationPage = getTaxConfigurationPage(this);

        await taxConfigurationPage.clickCreateTaxConfiguration();

        console.log('Clicked on Create Tax Configuration');
    }
);

// =========================================================
// VERIFY CREATED TAX CONFIGURATION IN LIST
// =========================================================

Then(
    'I should see the created Tax Configuration in the Tax Configuration list',
    async function (this: CustomWorld) {
        const taxConfigurationPage = getTaxConfigurationPage(this);

        if (!this.currentTaxCode) {
            throw new Error('Tax Code was not stored');
        }

        await taxConfigurationPage.verifyCreatedTaxConfiguration(
            this.currentTaxCode
        );

        console.log(
            `Verified created Tax Configuration: ${this.currentTaxCode}`
        );
    }
);
