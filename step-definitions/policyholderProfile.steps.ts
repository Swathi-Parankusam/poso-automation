
import { When, Then, DataTable } from '@cucumber/cucumber';
import { PolicyholderProfilePage } from '../pages/PolicyholderProfilePage.js';
import { CustomWorld } from '../support/world.js';

// =====================================================
// Helper
// =====================================================

function getPolicyholderPage(world: CustomWorld): PolicyholderProfilePage {
    if (!world.page) {
        throw new Error('Playwright page is not initialized');
    }

    if (!world.policyholderProfilePage) {
        world.policyholderProfilePage =
            new PolicyholderProfilePage(world.page);
    }

    return world.policyholderProfilePage;
}

// =====================================================
// Navigation
// =====================================================

When(
    'I navigate to Policy Management and select Policyholder Profile module',
    async function (this: CustomWorld) {
        const policyholderPage = getPolicyholderPage(this);

        await policyholderPage.navigateToPolicyholderProfile();

        console.log('Navigated to Policyholder Profile module');
    }
);

// =====================================================
// Add Customer
// =====================================================

When(
    'I click on Add Customer',
    async function (this: CustomWorld) {
        const policyholderPage = getPolicyholderPage(this);

        await policyholderPage.clickAddCustomer();

        console.log('Clicked on Add Customer');
    }
);

// =====================================================
// PERSONAL POLICYHOLDER DETAILS
// =====================================================

When(
    'I enter the Personal policyholder details',
    async function (
        this: CustomWorld,
        dataTable: DataTable
    ) {
        const policyholderPage = getPolicyholderPage(this);

        const details = dataTable.rowsHash();

        await policyholderPage.enterPersonalPolicyholderDetails(
            details
        );

        // Store name for verification
        this.personalPolicyholderName =
            `${details['Fore Name(s)']} ${details['Surname']}`;

        console.log(
            `Entered Personal policyholder details: ${this.personalPolicyholderName}`
        );
    }
);

// =====================================================
// PERSONAL KYC INFORMATION
// =====================================================

When(
    'I enter the Personal KYC information',
    async function (
        this: CustomWorld,
        dataTable: DataTable
    ) {
        const policyholderPage = getPolicyholderPage(this);

        const details = dataTable.rowsHash();

        await policyholderPage.enterPersonalKYCInformation(
            details
        );

        console.log('Entered Personal KYC information');
    }
);

// =====================================================
// PERSONAL KYC DOCUMENTS
// =====================================================

When(
    'I upload the required Personal KYC documents',
    async function (
        this: CustomWorld,
        dataTable: DataTable
    ) {
        const policyholderPage = getPolicyholderPage(this);

        const documents = dataTable.hashes();

        await policyholderPage.uploadPersonalKYCDocuments(
            documents
        );

        console.log('Uploaded required Personal KYC documents');
    }
);

// =====================================================
// PERSONAL ADDRESS INFORMATION
// =====================================================

When(
    'I enter the Personal address information',
    async function (
        this: CustomWorld,
        dataTable: DataTable
    ) {
        const policyholderPage = getPolicyholderPage(this);

        const details = dataTable.rowsHash();

        await policyholderPage.enterPersonalAddressInformation(
            details
        );

        console.log('Entered Personal address information');
    }
);

// =====================================================
// PERSONAL EMPLOYMENT AND BANKING
// =====================================================

When(
    'I enter the Personal employment and banking information',
    async function (
        this: CustomWorld,
        dataTable: DataTable
    ) {
        const policyholderPage = getPolicyholderPage(this);

        const details = dataTable.rowsHash();

        await policyholderPage.enterPersonalEmploymentAndBankingInformation(
            details
        );

        console.log('Entered Personal employment and banking information');
    }
);

// =====================================================
// PERSONAL SUPPORTING INFORMATION
// =====================================================

When(
    'I enter the Personal supporting information',
    async function (
        this: CustomWorld,
        dataTable: DataTable
    ) {
        const policyholderPage = getPolicyholderPage(this);

        const details = dataTable.rowsHash();

        await policyholderPage.enterPersonalSupportingInformation(
            details
        );

        console.log('Entered Personal supporting information');
    }
);

When(
    'I upload a Personal supporting document',
    async function (this: CustomWorld) {
        const policyholderPage = getPolicyholderPage(this);

        await policyholderPage.uploadPersonalSupportingDocument();

        console.log('Uploaded Personal supporting document');
    }
);

// =====================================================
// CREATE PERSONAL POLICYHOLDER
// =====================================================

When(
    'I click on Create Policyholder',
    async function (this: CustomWorld) {
        const policyholderPage = getPolicyholderPage(this);

        await policyholderPage.clickCreatePolicyholder();

        console.log('Clicked on Create Policyholder');
    }
);

Then(
    'I should see the created Personal policyholder in the policyholder list',
    async function (this: CustomWorld) {
        const policyholderPage = getPolicyholderPage(this);

        if (!this.personalPolicyholderName) {
            throw new Error(
                'Personal policyholder name was not stored'
            );
        }

        await policyholderPage.verifyPolicyholderInList(
            this.personalPolicyholderName
        );

        console.log(
            `Verified Personal policyholder: ${this.personalPolicyholderName}`
        );
    }
);

When(
    'I reopen the created Personal policyholder record',
    async function (this: CustomWorld) {
        const policyholderPage = getPolicyholderPage(this);

        if (!this.personalPolicyholderName) {
            throw new Error(
                'Personal policyholder name was not stored'
            );
        }

        await policyholderPage.reopenPolicyholder(
            this.personalPolicyholderName
        );

        console.log('Reopened Personal policyholder record');
    }
);

Then(
    'all entered Personal policyholder details should be saved correctly',
    async function (this: CustomWorld) {
        const policyholderPage = getPolicyholderPage(this);

        await policyholderPage.verifyPersonalPolicyholderDetails();

        console.log('Verified saved Personal policyholder details');
    }
);

// =====================================================
// COMMERCIAL POLICYHOLDER DETAILS
// =====================================================

When(
    'I enter the Commercial policyholder details',
    async function (
        this: CustomWorld,
        dataTable: DataTable
    ) {
        const policyholderPage = getPolicyholderPage(this);

        const details = dataTable.rowsHash();

        await policyholderPage.enterCommercialPolicyholderDetails(
            details
        );

        // Store complete Commercial details for final verification
        this.commercialPolicyholderDetails = details;

        // Store Business Name for list verification and reopening
        this.commercialPolicyholderName =
            details['Business Name'];

        console.log(
            `Entered Commercial policyholder details: ${this.commercialPolicyholderName}`
        );
    }
);

// =====================================================
// COMMERCIAL CONTACT PERSON
// =====================================================

When(
    'I enter the Commercial contact person details',
    async function (
        this: CustomWorld,
        dataTable: DataTable
    ) {
        const policyholderPage = getPolicyholderPage(this);

        const details = dataTable.rowsHash();

        await policyholderPage.enterCommercialContactPersonDetails(
            details
        );

        console.log('Entered Commercial contact person details');
    }
);

// =====================================================
// COMMERCIAL KYC INFORMATION
// =====================================================

When(
    'I enter the Commercial KYC information',
    async function (
        this: CustomWorld,
        dataTable: DataTable
    ) {
        const policyholderPage = getPolicyholderPage(this);

        const details = dataTable.rowsHash();

        await policyholderPage.enterCommercialKYCInformation(
            details
        );

        console.log('Entered Commercial KYC information');
    }
);

// =====================================================
// COMMERCIAL KYC DOCUMENTS
// =====================================================

When(
    'I upload all required Commercial KYC documents',
    async function (this: CustomWorld) {
        const policyholderPage = getPolicyholderPage(this);

        await policyholderPage.uploadCommercialKYCDocuments();

        console.log('Uploaded all required Commercial KYC documents');
    }
);

// =====================================================
// COMMERCIAL ADDRESS INFORMATION
// =====================================================

When(
    'I enter the Commercial address information',
    async function (
        this: CustomWorld,
        dataTable: DataTable
    ) {
        const policyholderPage = getPolicyholderPage(this);

        const details = dataTable.rowsHash();

        await policyholderPage.enterCommercialAddressInformation(
            details
        );

        console.log('Entered Commercial address information');
    }
);

// =====================================================
// COMMERCIAL EMPLOYMENT AND BANKING
// =====================================================

When(
    'I enter the Commercial employment and banking information',
    async function (
        this: CustomWorld,
        dataTable: DataTable
    ) {
        const policyholderPage = getPolicyholderPage(this);

        const details = dataTable.rowsHash();

        await policyholderPage.enterCommercialEmploymentAndBankingInformation(
            details
        );

        console.log('Entered Commercial employment and banking information');
    }
);

// =====================================================
// COMMERCIAL SUPPORTING INFORMATION
// =====================================================

When(
    'I enter the Commercial supporting information',
    async function (
        this: CustomWorld,
        dataTable: DataTable
    ) {
        const policyholderPage = getPolicyholderPage(this);

        const details = dataTable.rowsHash();

        await policyholderPage.enterCommercialSupportingInformation(
            details
        );

        console.log('Entered Commercial supporting information');
    }
);

When(
    'I upload a Commercial supporting document',
    async function (this: CustomWorld) {
        const policyholderPage = getPolicyholderPage(this);

        await policyholderPage.uploadCommercialSupportingDocument();

        console.log('Uploaded Commercial supporting document');
    }
);

// =====================================================
// COMMERCIAL POLICYHOLDER VERIFICATION
// =====================================================

Then(
    'I should see the created Commercial policyholder in the policyholder list',
    async function (this: CustomWorld) {
        const policyholderPage = getPolicyholderPage(this);

        if (!this.commercialPolicyholderName) {
            throw new Error(
                'Commercial policyholder name was not stored'
            );
        }

        await policyholderPage.verifyPolicyholderInList(
            this.commercialPolicyholderName
        );

        console.log(
            `Verified Commercial policyholder: ${this.commercialPolicyholderName}`
        );
    }
);

When(
    'I reopen the created Commercial policyholder record',
    async function (this: CustomWorld) {
        const policyholderPage = getPolicyholderPage(this);

        if (!this.commercialPolicyholderName) {
            throw new Error(
                'Commercial policyholder name was not stored'
            );
        }

        await policyholderPage.reopenPolicyholder(
            this.commercialPolicyholderName
        );

        console.log('Reopened Commercial policyholder record');
    }
);

Then(
    'all entered Commercial policyholder details should be saved correctly',
    async function (this: CustomWorld) {
        const policyholderPage = getPolicyholderPage(this);

        if (!this.commercialPolicyholderDetails) {
            throw new Error(
                'Commercial policyholder details were not stored'
            );
        }

        await policyholderPage.verifyCommercialPolicyholderDetails(
            this.commercialPolicyholderDetails
        );

        console.log('Verified saved Commercial policyholder details');
    }
);

// =====================================================
// LOGOUT FROM POSO
// =====================================================

Then(
    'I log out from the POSO application',
    async function (this: CustomWorld) {
        if (!this.page) {
            throw new Error(
                'Playwright page is not initialized'
            );
        }

        // Open Account menu
        await this.page
            .getByRole('button', {
                name: 'Account menu',
            })
            .click();

        // Click Sign out
        await this.page
            .getByRole('menuitem', {
                name: 'Sign out',
                exact: true,
            })
            .click();

        console.log('Successfully logged out from POSO');
    }
);
