import {
    When,
    Then
} from '@cucumber/cucumber';

import type { DataTable } from '@cucumber/cucumber';

import { CustomWorld } from '../support/world.js';

import {
    ProductsPage
} from '../pages/ProductsPage.js';

import type {
    ProductDetails,
    CoverageDetails,
    BenefitDetails,
    AdditionalProductDetails,
    CustomFieldDetails,
    TerminationChargeDetails
} from '../pages/ProductsPage.js';

// --------------------------------------------------
// PRODUCTS PAGE INSTANCE
// --------------------------------------------------

const productsPageInstances = new WeakMap<
    CustomWorld,
    ProductsPage
>();

function getProductsPage(
    world: CustomWorld
): ProductsPage {

    const page = world.page;

    if (!page) {
        throw new Error(
            'Playwright page is not initialized in the current world.'
        );
    }

    let productsPage =
        productsPageInstances.get(world);

    if (!productsPage) {

        productsPage =
            new ProductsPage(page);

        productsPageInstances.set(
            world,
            productsPage
        );
    }

    return productsPage;
}

// --------------------------------------------------
// COMMON DATA TABLE HELPER
// --------------------------------------------------

function convertDataTable<T>(
    dataTable: DataTable
): T {

    const rows =
        dataTable.hashes();

    const details: Record<string, string> =
        {};

    for (const row of rows) {

        let fieldName =
            row.field.trim();

        const value =
            row.value.trim();

        // ------------------------------------------
        // FEATURE FILE FIELD NAME MAPPING
        // ------------------------------------------

        if (
            fieldName === 'Product Group'
        ) {

            fieldName = 'productGroup';
        }

        details[fieldName] = value;
    }

    return details as T;
}

// ==================================================
// PRODUCT NAVIGATION
// ==================================================

When(
    'I navigate to Administration and select Products',
    async function (
        this: CustomWorld
    ) {

        await getProductsPage(this)
            .navigateToProducts();
    }
);

Then(
    'the Products page should be displayed',
    async function (
        this: CustomWorld
    ) {

        await getProductsPage(this)
            .verifyProductsPageDisplayed();
    }
);

Then(
    'the products list should be displayed',
    async function (
        this: CustomWorld
    ) {

        await getProductsPage(this)
            .verifyProductsListDisplayed();
    }
);

// ==================================================
// CREATE PRODUCT
// ==================================================

When(
    'I select Add Product',
    async function (
        this: CustomWorld
    ) {

        await getProductsPage(this)
            .clickNewProduct();
    }
);

When(
    'I enter the following mandatory product details',
    async function (
        this: CustomWorld,
        dataTable: DataTable
    ) {

        const productDetails =
            convertDataTable<ProductDetails>(
                dataTable
            );

        await getProductsPage(this)
            .enterMandatoryProductDetails(
                productDetails
            );
    }
);

// ==================================================
// COVERAGES
// ==================================================

When(
    'I add a coverage with the following details',
    async function (
        this: CustomWorld,
        dataTable: DataTable
    ) {

        const coverageDetails =
            convertDataTable<CoverageDetails>(
                dataTable
            );

        await getProductsPage(this)
            .addCoverage(
                coverageDetails
            );
    }
);

// ==================================================
// BENEFITS
// ==================================================

When(
    'I add a benefit with the following details',
    async function (
        this: CustomWorld,
        dataTable: DataTable
    ) {

        const benefitDetails =
            convertDataTable<BenefitDetails>(
                dataTable
            );

        await getProductsPage(this)
            .addBenefit(
                benefitDetails
            );
    }
);

// ==================================================
// ADDITIONAL PRODUCT DETAILS
// ==================================================

When(
    'I enter the following additional product details',
    async function (
        this: CustomWorld,
        dataTable: DataTable
    ) {

        const additionalDetails =
            convertDataTable<AdditionalProductDetails>(
                dataTable
            );

        await getProductsPage(this)
            .enterAdditionalProductDetails(
                additionalDetails
            );
    }
);

// ==================================================
// CUSTOM FIELDS
// ==================================================

When(
    'I add a custom field with the following details',
    async function (
        this: CustomWorld,
        dataTable: DataTable
    ) {

        const customFieldDetails =
            convertDataTable<CustomFieldDetails>(
                dataTable
            );

        await getProductsPage(this)
            .addCustomField(
                customFieldDetails
            );
    }
);

// ==================================================
// TERMINATION CHARGE
// ==================================================

When(
    'I configure the following termination charge details',
    async function (
        this: CustomWorld,
        dataTable: DataTable
    ) {

        const terminationDetails =
            convertDataTable<TerminationChargeDetails>(
                dataTable
            );

        await getProductsPage(this)
            .configureTerminationCharge(
                terminationDetails
            );
    }
);

// ==================================================
// REQUIRED DOCUMENTS
// ==================================================

When(
    'I add the following required documents',
    async function (dataTable) {

        const documents = dataTable.hashes();

        for (const row of documents) {

            const documentName = row.documentName;

            await getProductsPage(this)
                .addRequiredDocument(documentName);
        }
    }
);

// ==================================================
// COMMISSION COLLECTION TYPE
// ==================================================

When(
    'I select the Commission Collection Type {string}',
    async function (
        this: CustomWorld,
        collectionType: string
    ) {

        await getProductsPage(this)
            .selectCommissionCollectionType(
                collectionType
            );
    }
);

// ==================================================
// SAVE PRODUCT
// ==================================================

When(
    'I save the product',
    async function (
        this: CustomWorld
    ) {

        await getProductsPage(this)
            .saveProduct();
    }
);

// ==================================================
// PRODUCT VALIDATIONS
// ==================================================

Then(
    'the product should be created successfully',
    async function (
        this: CustomWorld
    ) {

        await getProductsPage(this)
            .verifyProductCreatedSuccessfully();
    }
);

Then(
    'the created product {string} should be displayed in the products list',
    async function (
        this: CustomWorld,
        productName: string
    ) {

        await getProductsPage(this)
            .verifyCreatedProductInList(
                productName
            );
    }
);