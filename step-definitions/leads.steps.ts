import { When, Then, DataTable } from '@cucumber/cucumber';
import { LeadsPage } from '../pages/LeadsPage.js';
import { CustomWorld } from '../support/world.js';

/**
 * Extended world type for Lead scenario data.
 */
type LeadsWorld = CustomWorld & {
    // Individual lead
    individualFirstName?: string;
    individualSurname?: string;

    // Business lead
    businessCompanyName?: string;
    businessContactPersonFirstName?: string;
    businessContactPersonSurname?: string;

    currentLeadType?: 'Individual' | 'Business';
};

/**
 * Helper method to get LeadsPage.
 */
function getLeadsPage(world: CustomWorld): LeadsPage {
    if (!world.page) {
        throw new Error('Playwright page is not initialized');
    }

    return new LeadsPage(world.page);
}

/**
 * Returns the currently created lead name.
 *
 * Individual:
 * First Name + Surname
 *
 * Business:
 * Company Name
 */
function getCurrentLeadName(world: LeadsWorld): string {
    if (world.currentLeadType === 'Individual') {
        const firstName = world.individualFirstName;
        const surname = world.individualSurname;

        if (!firstName || !surname) {
            throw new Error(
                'Individual lead name was not stored'
            );
        }

        return `${firstName} ${surname}`;
    }

    if (world.currentLeadType === 'Business') {
        const companyName = world.businessCompanyName;

        if (!companyName) {
            throw new Error(
                'Business company name was not stored'
            );
        }

        return companyName;
    }

    throw new Error(
        'Current lead type was not stored'
    );
}

/* ============================================================
   NAVIGATION TO LEADS
   ============================================================ */

When(
    'I navigate to Policy Management and select Leads module',
    async function (this: LeadsWorld) {
        const leadsPage = getLeadsPage(this);

        await leadsPage.navigateToLeads();

        console.log(
            'Navigated to Leads module successfully'
        );
    }
);

/* ============================================================
   ADD LEAD
   ============================================================ */

When(
    'I click on Add Lead',
    async function (this: LeadsWorld) {
        const leadsPage = getLeadsPage(this);

        await leadsPage.clickNewLead();

        console.log(
            'Add Lead clicked successfully'
        );
    }
);

/* ============================================================
   SELECT LEAD TYPE
   ============================================================ */

When(
    'I select {string} as the lead type',
    async function (
        this: LeadsWorld,
        leadType: string
    ) {
        const leadsPage = getLeadsPage(this);

        await leadsPage.selectCustomerType(leadType);

        if (
            leadType === 'Individual' ||
            leadType === 'Business'
        ) {
            this.currentLeadType = leadType;
        }

        console.log(
            `Lead type selected successfully: ${leadType}`
        );
    }
);

/* ============================================================
   INDIVIDUAL LEAD DETAILS
   ============================================================ */

When(
    'I enter the following Individual lead details',
    async function (
        this: LeadsWorld,
        dataTable: DataTable
    ) {
        const leadsPage = getLeadsPage(this);
        const data = dataTable.rowsHash();

        this.currentLeadType = 'Individual';

        /* =====================================================
           INDIVIDUAL INFORMATION
           ===================================================== */

        if (data.title) {
            await leadsPage.selectTitle(data.title);
        }

        if (data.firstName) {
            await leadsPage.enterFirstName(
                data.firstName
            );

            this.individualFirstName =
                data.firstName;
        }

        if (data.surname) {
            await leadsPage.enterSurname(
                data.surname
            );

            this.individualSurname =
                data.surname;
        }

        if (data.gender) {
            await leadsPage.selectGender(
                data.gender
            );
        }

        if (data.dateOfBirth) {
            await leadsPage.enterDateOfBirth(
                data.dateOfBirth
            );
        }

        if (data.age) {
            await leadsPage.enterAge(data.age);
        }

        if (data.email) {
            await leadsPage.enterEmail(data.email);
        }

        if (data.mobile) {
            await leadsPage.enterMobile(data.mobile);
        }

        if (data.idType) {
            await leadsPage.selectIdType(
                data.idType
            );
        }

        if (data.idNumber) {
            await leadsPage.enterIdNumber(
                data.idNumber
            );
        }

        /* =====================================================
           LEAD MANAGEMENT
           ===================================================== */

        if (data.source) {
            await leadsPage.selectSource(data.source);
        }

        if (data.status) {
            await leadsPage.selectStatus(data.status);
        }

        if (data.priority) {
            await leadsPage.selectPriority(
                data.priority
            );
        }

        if (data.createdDate) {
            await leadsPage.enterCreatedDate(
                data.createdDate
            );
        }

        if (data.renewalDate) {
            await leadsPage.enterRenewalDate(
                data.renewalDate
            );
        }

        /* =====================================================
           ADDRESS INFORMATION
           ===================================================== */

        if (data.streetAddress) {
            await leadsPage.enterStreetAddress(
                data.streetAddress
            );
        }

        if (data.city) {
            await leadsPage.enterCity(data.city);
        }

        if (data.state) {
            await leadsPage.enterState(data.state);
        }

        if (data.country) {
            await leadsPage.selectCountry(
                data.country
            );
        }

        /* =====================================================
           PRODUCT INFORMATION
           ===================================================== */

        if (data.productSubCategory) {
            await leadsPage.selectProductSubCategory(
                data.productSubCategory
            );
        }

        if (data.product) {
            await leadsPage.selectProduct(
                data.product
            );
        }

        /* =====================================================
           ADDITIONAL INFORMATION
           ===================================================== */

        if (data.notes) {
            await leadsPage.enterNotes(data.notes);
        }

        console.log(
            'Individual lead details entered successfully'
        );
    }
);

/* ============================================================
   BUSINESS LEAD DETAILS
   ============================================================ */

When(
    'I enter the following Business lead details',
    async function (
        this: LeadsWorld,
        dataTable: DataTable
    ) {
        const leadsPage = getLeadsPage(this);
        const data = dataTable.rowsHash();

        this.currentLeadType = 'Business';

        /* =====================================================
           CONTACT PERSON INFORMATION
           ===================================================== */

        if (data.contactPersonTitle) {
            await leadsPage.selectContactPersonTitle(
                data.contactPersonTitle
            );
        }

        if (data.contactPersonFirstName) {
            await leadsPage.enterContactPersonFirstName(
                data.contactPersonFirstName
            );

            // Store for Policyholder search
            this.businessContactPersonFirstName =
                data.contactPersonFirstName;
        }

        if (data.contactPersonSurname) {
            await leadsPage.enterContactPersonSurname(
                data.contactPersonSurname
            );

            // Store for Policyholder search
            this.businessContactPersonSurname =
                data.contactPersonSurname;
        }

        /* =====================================================
           BUSINESS INFORMATION
           ===================================================== */

        if (data.companyName) {
            await leadsPage.enterCompanyName(
                data.companyName
            );

            this.businessCompanyName =
                data.companyName;
        }

        if (data.industry) {
            await leadsPage.selectIndustry(
                data.industry
            );
        }

        if (data.tradingName) {
            await leadsPage.enterTradingName(
                data.tradingName
            );
        }

        if (data.registrationNumber) {
            await leadsPage.enterRegistrationNumber(
                data.registrationNumber
            );
        }

        /* =====================================================
           CONTACT DETAILS
           ===================================================== */

        if (data.dateOfBirth) {
            await leadsPage.enterDateOfBirth(
                data.dateOfBirth
            );
        }

        if (data.email) {
            await leadsPage.enterEmail(data.email);
        }

        if (data.mobile) {
            await leadsPage.enterMobile(data.mobile);
        }

        if (data.idType) {
            await leadsPage.selectIdType(
                data.idType
            );
        }

        if (data.idNumber) {
            await leadsPage.enterIdNumber(
                data.idNumber
            );
        }

        /* =====================================================
           LEAD MANAGEMENT
           ===================================================== */

        if (data.source) {
            await leadsPage.selectSource(data.source);
        }

        if (data.status) {
            await leadsPage.selectStatus(data.status);
        }

        if (data.priority) {
            await leadsPage.selectPriority(
                data.priority
            );
        }

        if (data.createdDate) {
            await leadsPage.enterCreatedDate(
                data.createdDate
            );
        }

        if (data.renewalDate) {
            await leadsPage.enterRenewalDate(
                data.renewalDate
            );
        }

        /* =====================================================
           ADDRESS INFORMATION
           ===================================================== */

        if (data.streetAddress) {
            await leadsPage.enterStreetAddress(
                data.streetAddress
            );
        }

        if (data.city) {
            await leadsPage.enterCity(data.city);
        }

        if (data.state) {
            await leadsPage.enterState(data.state);
        }

        if (data.country) {
            await leadsPage.selectCountry(
                data.country
            );
        }

        /* =====================================================
           PRODUCT INFORMATION
           ===================================================== */

        if (data.productSubCategory) {
            await leadsPage.selectProductSubCategory(
                data.productSubCategory
            );
        }

        if (data.product) {
            await leadsPage.selectProduct(
                data.product
            );
        }

        /* =====================================================
           ADDITIONAL INFORMATION
           ===================================================== */

        if (data.notes) {
            await leadsPage.enterNotes(data.notes);
        }

        console.log(
            'Business lead details entered successfully'
        );
    }
);

/* ============================================================
   CREATE LEAD
   ============================================================ */

When(
    'I click on Create Lead',
    async function (this: LeadsWorld) {
        const leadsPage = getLeadsPage(this);

        await leadsPage.clickCreateLead();

        console.log(
            'Create Lead clicked successfully'
        );
    }
);

/* ============================================================
   VERIFY INDIVIDUAL LEAD
   ============================================================ */

Then(
    'I should see the created Individual lead in the list',
    async function (this: LeadsWorld) {
        const leadsPage = getLeadsPage(this);

        const firstName = this.individualFirstName;
        const surname = this.individualSurname;

        if (!firstName || !surname) {
            throw new Error(
                'Individual lead name was not stored'
            );
        }

        const fullName = `${firstName} ${surname}`;

        await leadsPage.verifyLeadInList(
            fullName
        );

        console.log(
            `Individual lead found: ${fullName}`
        );
    }
);

/* ============================================================
   VERIFY BUSINESS LEAD
   ============================================================ */

Then(
    'I should see the created Business lead in the list',
    async function (this: LeadsWorld) {
        const leadsPage = getLeadsPage(this);

        const firstName =
            this.businessContactPersonFirstName;

        const surname =
            this.businessContactPersonSurname;

        if (!firstName || !surname) {
            throw new Error(
                'Business contact person name was not stored'
            );
        }

        const fullName =
            `${firstName} ${surname}`;

        await leadsPage.verifyLeadInList(
            fullName
        );

        console.log(
            `Business lead found successfully: ${fullName}`
        );
    }
);

/* ============================================================
   CLICK THREE DOTS - INDIVIDUAL
   ============================================================ */

When(
    'I click the three dots for the created Individual lead',
    async function (this: LeadsWorld) {
        const leadsPage = getLeadsPage(this);

        const leadName =
            getCurrentLeadName(this);

        await leadsPage.openActionsMenu(
            leadName
        );

        console.log(
            `Three dots clicked for lead: ${leadName}`
        );
    }
);

/* ============================================================
   CLICK THREE DOTS - BUSINESS
   ============================================================ */

When(
    'I click the three dots for the created Business lead',
    async function (this: LeadsWorld) {
        const leadsPage = getLeadsPage(this);

        const firstName =
            this.businessContactPersonFirstName;

        const surname =
            this.businessContactPersonSurname;

        if (!firstName || !surname) {
            throw new Error(
                'Business contact person name was not stored'
            );
        }

        const fullName = `${firstName} ${surname}`;

        console.log(
            `Opening Actions menu for Business lead: ${fullName}`
        );

        await leadsPage.openActionsMenu(fullName);

        console.log(
            `Three dots clicked for Business lead: ${fullName}`
        );
    }
);

/* ============================================================
   CONVERT LEAD
   ============================================================ */

When(
    'I select Convert from the Actions menu',
    async function (this: LeadsWorld) {
        const leadsPage = getLeadsPage(this);

        await leadsPage.clickConvert();

        console.log(
            'Convert selected from Actions menu successfully'
        );
    }
);

/* ============================================================
   VERIFY INDIVIDUAL CONVERSION
   ============================================================ */

Then(
    'the Individual lead should be converted successfully',
    async function (this: LeadsWorld) {
        const leadsPage = getLeadsPage(this);

        await leadsPage.verifyConversionSuccess();

        console.log(
            `${this.currentLeadType} lead converted successfully`
        );
    }
);

/* ============================================================
   VERIFY BUSINESS CONVERSION
   ============================================================ */

Then(
    'the Business lead should be converted successfully',
    async function (this: LeadsWorld) {
        const leadsPage = getLeadsPage(this);

        await leadsPage.verifyConversionSuccess();

        console.log(
            'Business lead converted successfully'
        );
    }
);

/* ============================================================
   NAVIGATE TO POLICYHOLDER MODULE
   ============================================================ */

When(
    'I navigate to the Policyholder module',
    async function (this: LeadsWorld) {
        const leadsPage = getLeadsPage(this);

        await leadsPage.navigateToPolicyholderModule();

        console.log(
            'Navigated to Policyholder module successfully'
        );
    }
);

/* ============================================================
   SEARCH CONVERTED INDIVIDUAL POLICYHOLDER
   ============================================================ */

When(
    'I search for the converted Individual policyholder',
    async function (this: LeadsWorld) {
        const leadsPage = getLeadsPage(this);

        const firstName =
            this.individualFirstName;

        const surname =
            this.individualSurname;

        if (!firstName || !surname) {
            throw new Error(
                'Individual policyholder name was not stored'
            );
        }

        const fullName = `${firstName} ${surname}`;

        await leadsPage.searchPolicyholder(
            fullName
        );

        console.log(
            `Searching for Individual policyholder: ${fullName}`
        );
    }
);

/* ============================================================
   VERIFY CONVERTED INDIVIDUAL POLICYHOLDER
   ============================================================ */

Then(
    'I should see the converted Individual policyholder in the Policyholder list',
    async function (this: LeadsWorld) {
        const leadsPage = getLeadsPage(this);

        const firstName =
            this.individualFirstName;

        const surname =
            this.individualSurname;

        if (!firstName || !surname) {
            throw new Error(
                'Individual policyholder name was not stored'
            );
        }

        const fullName = `${firstName} ${surname}`;

        await leadsPage.verifyPolicyholderExists(
            fullName
        );

        console.log(
            `Converted Individual policyholder found: ${fullName}`
        );
    }
);

/* ============================================================
   SEARCH CONVERTED BUSINESS POLICYHOLDER

   Business Policyholder is searched using:
   Contact Person First Name + Surname
   ============================================================ */

When(
    'I search for the converted Business policyholder',
    async function (this: LeadsWorld) {
        const leadsPage = getLeadsPage(this);

        const firstName =
            this.businessContactPersonFirstName;

        const surname =
            this.businessContactPersonSurname;

        if (!firstName || !surname) {
            throw new Error(
                'Business contact person name was not stored'
            );
        }

        const fullName = `${firstName} ${surname}`;

        await leadsPage.searchPolicyholder(
            fullName
        );

        console.log(
            `Searching for Business policyholder: ${fullName}`
        );
    }
);

/* ============================================================
   VERIFY CONVERTED BUSINESS POLICYHOLDER
   ============================================================ */

Then(
    'I should see the converted Business policyholder in the Policyholder list',
    async function (this: LeadsWorld) {
        const leadsPage = getLeadsPage(this);

        const firstName =
            this.businessContactPersonFirstName;

        const surname =
            this.businessContactPersonSurname;

        if (!firstName || !surname) {
            throw new Error(
                'Business contact person name was not stored'
            );
        }

        const fullName = `${firstName} ${surname}`;

        await leadsPage.verifyPolicyholderExists(
            fullName
        );

        console.log(
            `Converted Business policyholder found: ${fullName}`
        );
    }
);

/* ============================================================
   LOGOUT - OPEN ACCOUNT MENU
   ============================================================ */

When(
    'I open the Lead Account menu',
    async function (this: LeadsWorld) {
        const leadsPage = getLeadsPage(this);

        await leadsPage.openAccountMenu();

        console.log(
            'Lead Account menu opened successfully'
        );
    }
);

/* ============================================================
   LOGOUT - CLICK SIGN OUT
   ============================================================ */

When(
    'I click the Lead Sign out option',
    async function (this: LeadsWorld) {
        const leadsPage = getLeadsPage(this);

        await leadsPage.clickSignOut();

        console.log(
            'Lead Sign out clicked successfully'
        );
    }
);

/* ============================================================
   VERIFY LOGOUT
   ============================================================ */

Then(
    'I should be redirected to the POSO login page',
    async function (this: LeadsWorld) {
        const leadsPage = getLeadsPage(this);

        await leadsPage.verifyRedirectedToLogin();

        console.log(
            'Successfully redirected to POSO login page'
        );
    }
);

/* ============================================================
   VERIFY REDIRECT TO LOGIN PAGE
   ============================================================ */

Then(
    'I should be redirected to the login page from Leads',
    async function (this: LeadsWorld) {
        const page = this.page;

        if (!page) {
            throw new Error('Page is not available');
        }

        await page.waitForURL(
            /login|sign-in|signin/i,
            {
                timeout: 15000,
            }
        );

        console.log(
            'Successfully redirected to the login page from Leads'
        );
    }
);
