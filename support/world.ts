
import {
    setWorldConstructor,
    World,
} from '@cucumber/cucumber';

import type {
    Browser,
    BrowserContext,
    Page,
} from '@playwright/test';

import type { LoginPage } from '../pages/LoginPage.js';
import type { UnderwritersPage } from '../pages/UnderwritersPage.js';
import type { PolicyholderProfilePage } from '../pages/PolicyholderProfilePage.js';
import type { TaxConfigurationPage } from '../pages/TaxConfigurationPage.js';

export class CustomWorld extends World {

    // =========================================================
    // BROWSER CONFIGURATION
    // =========================================================

    browser?: Browser;
    context?: BrowserContext;
    page?: Page;

    // =========================================================
    // PAGE OBJECTS
    // =========================================================

    loginPage?: LoginPage;
    underwritersPage?: UnderwritersPage;
    policyholderProfilePage?: PolicyholderProfilePage;
    taxConfigurationPage?: TaxConfigurationPage;

    // =========================================================
    // ADDITIONAL PAGE REFERENCE
    // =========================================================

    websitePage?: Page;

    // =========================================================
    // UNDERWRITER TEST DATA
    // =========================================================

    currentUnderwriterIdentifier?: string;

    // =========================================================
    // POLICYHOLDER PROFILE TEST DATA
    // =========================================================

    personalPolicyholderName?: string;
    commercialPolicyholderName?: string;
    commercialPolicyholderDetails?: Record<string, string>;

    // =========================================================
    // TAX CONFIGURATION TEST DATA
    // =========================================================

    currentTaxCode?: string;
}

setWorldConstructor(CustomWorld);
