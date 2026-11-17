
import { Page, expect, Locator } from '@playwright/test';

export class PolicyholderProfilePage {
    constructor(private page: Page) { }

    // =========================================================
    // NAVIGATION
    // =========================================================

    async navigateToPolicyholderProfile(): Promise<void> {
        await this.page
            .getByRole('button', {
                name: 'Policy Management',
            })
            .click();

        await this.page
            .getByRole('link', {
                name: 'Policyholder Profile',
            })
            .click();

        await this.page.waitForURL(/\/screens\/customers/);
    }

    async clickAddCustomer(): Promise<void> {
        await this.page
            .getByRole('button', {
                name: 'New Policyholder',
                exact: true,
            })
            .click();

        await this.page.waitForURL(
            /\/screens\/customer-details\/new/
        );
    }

    // =========================================================
    // COMMON HELPERS
    // =========================================================

    private async selectDropdownOption(
        dropdown: Locator,
        value: string
    ): Promise<void> {
        await dropdown.click();

        const radixOption = this.page
            .getByRole('option', {
                name: value,
                exact: true,
            });

        if (await radixOption.count()) {
            await radixOption.last().click();
            return;
        }

        const textOption = this.page
            .getByText(value, {
                exact: true,
            })
            .filter({
                hasNot: this.page.locator('option'),
            });

        await textOption.last().click();
    }

    private async setHiddenDate(
        selector: string,
        dateValue: string
    ): Promise<void> {
        const dateInput = this.page.locator(selector);

        if (!(await dateInput.count())) {
            throw new Error(
                `Date input not found: ${selector}`
            );
        }

        const formattedDate =
            this.convertToISODate(dateValue);

        await dateInput.evaluate(
            (element, value) => {
                const input =
                    element as HTMLInputElement;

                const nativeSetter =
                    Object.getOwnPropertyDescriptor(
                        HTMLInputElement.prototype,
                        'value'
                    )?.set;

                nativeSetter?.call(input, value);

                input.dispatchEvent(
                    new Event('input', {
                        bubbles: true,
                    })
                );

                input.dispatchEvent(
                    new Event('change', {
                        bubbles: true,
                    })
                );

                input.dispatchEvent(
                    new Event('blur', {
                        bubbles: true,
                    })
                );
            },
            formattedDate
        );
    }

    private convertToISODate(dateValue: string): string {
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
            return dateValue;
        }

        const parsedDate = new Date(dateValue);

        if (Number.isNaN(parsedDate.getTime())) {
            throw new Error(
                `Invalid date value: ${dateValue}`
            );
        }

        const year = parsedDate.getFullYear();

        const month = String(
            parsedDate.getMonth() + 1
        ).padStart(2, '0');

        const day = String(
            parsedDate.getDate()
        ).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    // =========================================================
    // PERSONAL POLICYHOLDER DETAILS
    // =========================================================

    async enterPersonalPolicyholderDetails(
        data: Record<string, string>
    ): Promise<void> {
        await this.selectDropdownOption(
            this.page.getByText(
                'Select Policyholder Type',
                { exact: true }
            ),
            data['Policyholder Type']
        );

        await this.selectDropdownOption(
            this.page.getByText(
                'Select Title',
                { exact: true }
            ),
            data['Title']
        );

        await this.page
            .getByPlaceholder('Enter first name')
            .fill(data['Fore Name(s)']);

        await this.page
            .getByPlaceholder('Enter last name')
            .fill(data['Surname']);

        // Date of Birth
        await this.setHiddenDate(
            '#customer-date-of-birth',
            data['Date of Birth']
        );

        // Gender
        const gender = this.page.getByRole(
            'radio',
            {
                name: data['Gender'],
                exact: true,
            }
        );

        await gender.click();

        // Mobile
        const mobileByLabel =
            this.page.getByLabel('Mobile number');

        if (await mobileByLabel.count()) {
            await mobileByLabel.fill(data['Mobile']);
        } else {
            const mobile = this.page.getByPlaceholder(
                '7X XXX XXX'
            );

            if (await mobile.count()) {
                await mobile.fill(data['Mobile']);
            }
        }

        // Email
        await this.page
            .getByPlaceholder('Enter email')
            .fill(data['Email Address']);

        // Marital Status
        const maritalStatus = this.page
            .getByRole('combobox')
            .filter({
                hasText: /Select Marital Status/i,
            })
            .first();

        if (
            await maritalStatus.count() &&
            data['Marital Status']
        ) {
            await this.selectDropdownOption(
                maritalStatus,
                data['Marital Status']
            );
        }

        // Nationality
        const nationality = this.page
            .locator('label')
            .filter({
                hasText: 'Nationality',
            })
            .locator('..')
            .getByRole('combobox');

        if (
            await nationality.count() &&
            data['Nationality']
        ) {
            await this.selectDropdownOption(
                nationality,
                data['Nationality']
            );
        }

        // Telephone / Work Telephone
        const phones = this.page.getByPlaceholder(
            'Include the country code, e.g. +267 3901234'
        );

        const phoneCount = await phones.count();

        if (phoneCount > 0 && data['Telephone']) {
            await phones.first().fill(
                data['Telephone']
            );
        }

        if (
            phoneCount > 1 &&
            data['Work Telephone']
        ) {
            await phones.last().fill(
                data['Work Telephone']
            );
        }

        // Educational Qualification
        const educationSelect = this.page.locator(
            'select'
        ).filter({
            has: this.page.locator(
                `option[label="${data['Educational Qualification']}"], option[value="${data['Educational Qualification']}"]`
            ),
        });

        if (
            await educationSelect.count() &&
            data['Educational Qualification']
        ) {
            await educationSelect
                .last()
                .selectOption({
                    label: data[
                        'Educational Qualification'
                    ],
                });
        } else {
            const education = this.page
                .getByRole('combobox')
                .filter({
                    hasText: /Select|Masters/i,
                })
                .last();

            if (await education.count()) {
                await this.selectDropdownOption(
                    education,
                    data[
                    'Educational Qualification'
                    ]
                );
            }
        }

        // Annual Income
        const annualIncome = this.page.getByPlaceholder(
            'Enter annual income'
        );

        if (
            await annualIncome.count() &&
            data['Annual Income']
        ) {
            await annualIncome.fill(
                data['Annual Income']
            );
        }

        // Active Status
        const activeStatus = this.page.getByRole(
            'switch',
            {
                name: 'Active Status',
            }
        );

        if (
            await activeStatus.count() &&
            data['Active Status']
        ) {
            const state =
                await activeStatus.getAttribute(
                    'data-state'
                );

            const shouldBeActive =
                data['Active Status']
                    .toLowerCase() === 'active';

            if (
                shouldBeActive &&
                state !== 'checked'
            ) {
                await activeStatus.click();
            }
        }
    }

    // =========================================================
    // PERSONAL KYC INFORMATION
    // =========================================================

    async enterPersonalKYCInformation(
        data: Record<string, string>
    ): Promise<void> {

        // ID Type
        const idType = this.page
            .getByRole('combobox')
            .filter({
                hasText: /Select ID type/i,
            })
            .last();

        if (
            await idType.count() &&
            data['ID Type']
        ) {
            await this.selectDropdownOption(
                idType,
                data['ID Type']
            );
        }

        // ID Number
        const idNumber = this.page
            .getByPlaceholder(/Enter 9 digits/i)
            .last();

        if (
            await idNumber.count() &&
            data['ID Number']
        ) {
            await idNumber.fill(data['ID Number']);
        }

        // Date KYC last completed
        if (data['Date KYC last completed']) {

            const kycDate = this.page
                .locator('label')
                .filter({
                    hasText: 'Date KYC last completed',
                })
                .locator('..')
                .locator('input[type="date"]');

            if (!(await kycDate.count())) {
                throw new Error(
                    'KYC date input not found using Date KYC last completed label'
                );
            }

            await this.setHiddenDate(
                'label:has-text("Date KYC last completed") + div input[type="date"]',
                data['Date KYC last completed']
            );
        }
    }

    // =========================================================
    // PERSONAL KYC DOCUMENT UPLOAD
    // =========================================================

    async uploadPersonalKYCDocuments(
        _documents: Record<string, string>[] = []
    ): Promise<void> {
        const filePath =
            'test-data/documents/Proposal_Form.pdf';

        const fileInputs = this.page.locator(
            'input[type="file"]'
        );

        const count = await fileInputs.count();

        for (
            let i = 0;
            i < Math.min(count, 4);
            i++
        ) {
            await fileInputs
                .nth(i)
                .setInputFiles(filePath);
        }
    }

    // =========================================================
    // PERSONAL ADDRESS INFORMATION
    // =========================================================

    async enterPersonalAddressInformation(
        data: Record<string, string>
    ): Promise<void> {
        const country = this.page
            .locator('label')
            .filter({
                hasText: 'Country',
            })
            .last()
            .locator('..')
            .getByRole('combobox');

        if (
            await country.count() &&
            data['Country']
        ) {
            await this.selectDropdownOption(
                country,
                data['Country']
            );
        }

        const state = this.page
            .locator('label')
            .filter({
                hasText: 'State/District',
            })
            .locator('..')
            .getByRole('combobox');

        if (
            await state.count() &&
            data['State/District']
        ) {
            await this.selectDropdownOption(
                state,
                data['State/District']
            );
        }

        const city = this.page.getByPlaceholder(
            'Enter Village / Town / City'
        );

        if (
            await city.count() &&
            data['Village / Town / City']
        ) {
            await city.fill(
                data['Village / Town / City']
            );
        }

        const pincode = this.page.getByPlaceholder(
            'Enter zip code'
        );

        if (
            await pincode.count() &&
            data['Pincode']
        ) {
            await pincode.fill(data['Pincode']);
        }

        const physicalAddress =
            this.page.getByPlaceholder(
                'Enter physical address'
            );

        if (
            await physicalAddress.count() &&
            data['Physical Address']
        ) {
            await physicalAddress.fill(
                data['Physical Address']
            );
        }

        const postalAddress =
            this.page.getByPlaceholder(
                'Enter postal address'
            );

        if (
            await postalAddress.count() &&
            data['Postal Address']
        ) {
            await postalAddress.fill(
                data['Postal Address']
            );
        }

        const duration = this.page.getByPlaceholder(
            'Enter years of stay'
        );

        if (
            await duration.count() &&
            data['Duration of Stay (years)']
        ) {
            await duration.fill(
                data['Duration of Stay (years)']
            );
        }

        const region = this.page.getByPlaceholder(
            'Type region name'
        );

        if (
            await region.count() &&
            data['Region']
        ) {
            await region.fill(data['Region']);
        }
    }

    // =========================================================
    // PERSONAL EMPLOYMENT & BANKING
    // =========================================================

    async enterPersonalEmploymentAndBankingInformation(
        data: Record<string, string>
    ): Promise<void> {
        const occupation = this.page.getByText(
            'Select occupation',
            { exact: true }
        );

        if (
            await occupation.count() &&
            data['Occupation']
        ) {
            await this.selectDropdownOption(
                occupation,
                data['Occupation']
            );
        }

        const placeOfWork =
            this.page.getByPlaceholder(
                'Enter place of work'
            );

        if (
            await placeOfWork.count() &&
            data['Place of Work']
        ) {
            await placeOfWork.fill(
                data['Place of Work']
            );
        }

        const employer =
            this.page.getByPlaceholder(
                'Enter employer name'
            );

        if (
            await employer.count() &&
            data['Employer']
        ) {
            await employer.fill(data['Employer']);
        }

        const paymentMethod = this.page
            .locator('label')
            .filter({
                hasText: 'Payment Method',
            })
            .locator('..')
            .getByRole('combobox');

        if (
            await paymentMethod.count() &&
            data['Payment Method']
        ) {
            await this.selectDropdownOption(
                paymentMethod,
                data['Payment Method']
            );
        }

        const bankName =
            this.page.getByPlaceholder(
                'Enter bank name'
            );

        if (
            await bankName.count() &&
            data['Bank Name']
        ) {
            await bankName.fill(data['Bank Name']);
        }

        const branchName =
            this.page.getByPlaceholder(
                'Enter branch name'
            );

        if (
            await branchName.count() &&
            data['Branch Name']
        ) {
            await branchName.fill(
                data['Branch Name']
            );
        }

        const accountNumber =
            this.page.getByPlaceholder(
                'Enter bank account number'
            );

        if (
            await accountNumber.count() &&
            data['Account Number']
        ) {
            await accountNumber.fill(
                data['Account Number']
            );
        }

        const accountHolder =
            this.page.getByPlaceholder(
                'Enter account holder name'
            );

        if (
            await accountHolder.count() &&
            data['Account Holder Name']
        ) {
            await accountHolder.fill(
                data['Account Holder Name']
            );
        }

        const accountType =
            this.page.getByPlaceholder(
                'Enter account type'
            );

        if (
            await accountType.count() &&
            data['Account Type']
        ) {
            await accountType.fill(
                data['Account Type']
            );
        }

        if (data['Smoker']) {
            const smoker = this.page.getByText(
                data['Smoker'],
                {
                    exact: true,
                }
            );

            if (await smoker.count()) {
                await smoker.last().click();
            }
        }

        const sourceOfFunds = this.page
            .getByRole('combobox')
            .filter({
                hasText: /Salary|Select Source/i,
            })
            .last();

        if (
            await sourceOfFunds.count() &&
            data['Source of Funds']
        ) {
            await this.selectDropdownOption(
                sourceOfFunds,
                data['Source of Funds']
            );
        }

        const natureOfIncome = this.page
            .getByRole('combobox')
            .filter({
                hasText: /Regular|Select Nature/i,
            })
            .last();

        if (
            await natureOfIncome.count() &&
            data['Nature of Income']
        ) {
            await this.selectDropdownOption(
                natureOfIncome,
                data['Nature of Income']
            );
        }

        const notes = this.page.getByPlaceholder(
            'Enter any additional notes'
        );

        if (
            await notes.count() &&
            data['Notes']
        ) {
            await notes.fill(data['Notes']);
        }
    }

    // =========================================================
    // PERSONAL SUPPORTING INFORMATION
    // =========================================================

    async enterPersonalSupportingInformation(
        data: Record<string, string>
    ): Promise<void> {
        const agent = this.page
            .getByRole('combobox')
            .filter({
                hasText:
                    /Select|Priyanka Kambham/i,
            })
            .last();

        if (
            await agent.count() &&
            data['Agent Name']
        ) {
            await this.selectDropdownOption(
                agent,
                data['Agent Name']
            );
        }
    }

    async uploadPersonalSupportingDocument(): Promise<void> {
        const filePath =
            'test-data/documents/Proposal_Form.pdf';

        const upload =
            this.page.locator('#file-upload');

        if (await upload.count()) {
            await upload.setInputFiles(filePath);
        }
    }

    // =========================================================
    // COMMERCIAL POLICYHOLDER DETAILS
    // =========================================================

    async enterCommercialPolicyholderDetails(
        data: Record<string, string>
    ): Promise<void> {
        const policyholderType = this.page.getByText(
            'Select Policyholder Type',
            { exact: true }
        );

        await this.selectDropdownOption(
            policyholderType,
            data['Policyholder Type']
        );

        const commercialSubType =
            this.page.getByLabel(
                'Commercial Sub-Type'
            );

        if (data['Commercial Sub-Type']) {
            await this.selectDropdownOption(
                commercialSubType,
                data['Commercial Sub-Type']
            );
        }

        await this.page
            .getByPlaceholder('Enter business name')
            .fill(data['Business Name']);

        await this.page
            .getByPlaceholder('Enter trading name')
            .fill(data['Trading Name']);

        await this.page
            .getByPlaceholder('Enter registration number')
            .fill(data['Registration Number']);

        await this.page
            .getByPlaceholder('Enter country of incorporation')
            .fill(data['Country of Incorporation']);

        await this.page
            .getByPlaceholder('Enter VAT registration number')
            .fill(data['VAT Registration Number']);

        await this.page
            .getByPlaceholder('Enter brief description of business')
            .fill(data['Brief Description of Business']);

        const natureOfBusiness =
            this.page.getByLabel('Nature of Business');

        if (data['Nature of Business']) {
            await this.selectDropdownOption(
                natureOfBusiness,
                data['Nature of Business']
            );
        }

        const activeStatus =
            this.page.getByRole('switch').first();

        if (
            await activeStatus.count() &&
            data['Active Status']
        ) {
            const state =
                await activeStatus.getAttribute('data-state');

            const shouldBeActive =
                data['Active Status'].toLowerCase() === 'active';

            if (
                shouldBeActive &&
                state !== 'checked'
            ) {
                await activeStatus.click();
            }
        }
    }

    // =========================================================
    // COMMERCIAL CONTACT PERSON
    // =========================================================

    async enterCommercialContactPersonDetails(
        data: Record<string, string>
    ): Promise<void> {
        const title =
            this.page.getByLabel('Title', {
                exact: true,
            });

        if (data['Title']) {
            await this.selectDropdownOption(
                title,
                data['Title']
            );
        }

        await this.page
            .getByPlaceholder('Enter first name')
            .fill(data['Fore Name(s)']);

        await this.page
            .getByPlaceholder('Enter last name')
            .fill(data['Surname']);

        await this.setHiddenDate(
            '#customer-date-of-birth',
            data['Date of Birth']
        );

        const gender = this.page.getByRole(
            'radio',
            {
                name: data['Gender'],
                exact: true,
            }
        );

        await gender.click();

        await this.page
            .locator('#customer-phoneNumber')
            .fill(data['Mobile']);

        await this.page
            .getByPlaceholder('Enter email')
            .fill(data['Email Address']);

        const maritalStatus =
            this.page.getByLabel('Marital Status');

        if (data['Marital Status']) {
            await this.selectDropdownOption(
                maritalStatus,
                data['Marital Status']
            );
        }

        const nationality = this.page
            .getByRole('combobox')
            .filter({
                hasText: 'Select nationality',
            });

        if (data['Nationality']) {
            await this.selectDropdownOption(
                nationality,
                data['Nationality']
            );
        }

        const idType = this.page
            .getByRole('combobox')
            .filter({
                hasText: 'Select ID type',
            })
            .first();

        if (data['ID Type']) {
            await this.selectDropdownOption(
                idType,
                data['ID Type']
            );
        }

        // Passport Number
        await this.page
            .getByPlaceholder('Enter passport number')
            .fill(data['Passport Number']);

        // Country of Issue (Passport)
        await this.page
            .getByPlaceholder('Enter country of issue')
            .fill(data['Country of Issue']);

        await this.page
            .getByPlaceholder('Enter capacity or position')
            .fill(data['Capacity/Position']);

        const phones = this.page.getByPlaceholder(
            'Include the country code, e.g. +267 3901234'
        );

        if (data['Telephone']) {
            await phones.first().fill(
                data['Telephone']
            );
        }

        if (data['Work Telephone']) {
            await phones.last().fill(
                data['Work Telephone']
            );
        }

        const education =
            this.page.getByLabel('Educational Qualification');

        if (data['Educational Qualification']) {
            await this.selectDropdownOption(
                education,
                data['Educational Qualification']
            );
        }

        await this.page
            .getByPlaceholder('Enter annual income')
            .fill(data['Annual Income']);
    }

    // =========================================================
    // COMMERCIAL KYC INFORMATION
    // =========================================================

    async enterCommercialKYCInformation(
        data: Record<string, string>
    ): Promise<void> {
        const idType = this.page
            .getByRole('combobox')
            .filter({
                hasText: 'Select ID type',
            })
            .last();

        if (data['ID Type']) {
            await this.selectDropdownOption(
                idType,
                data['ID Type']
            );
        }

        const idNumber =
            this.page.getByPlaceholder('Enter ID number');

        if (data['ID Number']) {
            await idNumber.fill(data['ID Number']);
        }
    }

    // =========================================================
    // COMMERCIAL KYC DOCUMENT UPLOAD
    // =========================================================

    async uploadCommercialKYCDocuments(): Promise<void> {
        const filePath =
            'test-data/documents/Proposal_Form.pdf';

        for (let i = 1; i <= 10; i++) {
            const input = this.page.locator(
                `#kycFileInput-${i}`
            );

            if (await input.count()) {
                await input.setInputFiles(filePath);
            }
        }
    }

    // =========================================================
    // COMMERCIAL ADDRESS INFORMATION
    // =========================================================

    async enterCommercialAddressInformation(
        data: Record<string, string>
    ): Promise<void> {
        const country =
            this.page.getByLabel('Country', {
                exact: true,
            });

        if (data['Country']) {
            await this.selectDropdownOption(
                country,
                data['Country']
            );
        }

        const state =
            this.page.getByLabel('State/District');

        if (data['State/District']) {
            await this.selectDropdownOption(
                state,
                data['State/District']
            );
        }

        await this.page
            .getByPlaceholder('Enter Village / Town / City')
            .fill(data['Village / Town / City']);

        await this.page
            .getByPlaceholder('Enter zip code')
            .fill(data['Pincode']);

        await this.page
            .getByPlaceholder('Enter physical address')
            .fill(data['Physical Address']);

        await this.page
            .getByPlaceholder('Enter postal address')
            .fill(data['Postal Address']);

        await this.page
            .getByPlaceholder('Enter years of stay')
            .fill(data['Duration of Stay (years)']);

        await this.page
            .getByPlaceholder('Type region name')
            .fill(data['Region']);
    }

    // =========================================================
    // COMMERCIAL EMPLOYMENT & BANKING
    // =========================================================

    async enterCommercialEmploymentAndBankingInformation(
        data: Record<string, string>
    ): Promise<void> {
        await this.page
            .getByPlaceholder('Enter bank name')
            .fill(data['Bank Name']);

        await this.page
            .getByPlaceholder('Enter branch name')
            .fill(data['Branch Name']);

        await this.page
            .getByPlaceholder('Enter bank account number')
            .fill(data['Account Number']);

        await this.page
            .getByPlaceholder('Enter account holder name')
            .fill(data['Account Holder Name']);

        await this.page
            .getByPlaceholder('Enter account type')
            .fill(data['Account Type']);

        const sourceOfFunds =
            this.page.getByLabel('Source of Funds');

        if (data['Source of Funds']) {
            await this.selectDropdownOption(
                sourceOfFunds,
                data['Source of Funds']
            );
        }

        const natureOfIncome =
            this.page.getByLabel('Nature of Income');

        if (data['Nature of Income']) {
            await this.selectDropdownOption(
                natureOfIncome,
                data['Nature of Income']
            );
        }

        await this.page
            .getByPlaceholder('Enter any additional notes')
            .fill(data['Notes']);
    }

    // =========================================================
    // COMMERCIAL SUPPORTING INFORMATION
    // =========================================================

    async enterCommercialSupportingInformation(
        data: Record<string, string>
    ): Promise<void> {
        const agent = this.page
            .getByRole('combobox')
            .filter({
                hasText:
                    /Priyanka Kambham|Select Agent/i,
            })
            .last();

        if (
            await agent.count() &&
            data['Agent Name']
        ) {
            await this.selectDropdownOption(
                agent,
                data['Agent Name']
            );
        }
    }

    async uploadCommercialSupportingDocument(): Promise<void> {
        const filePath =
            'test-data/documents/Proposal_Form.pdf';

        const upload =
            this.page.locator('#file-upload');

        if (await upload.count()) {
            await upload.setInputFiles(filePath);
        }
    }

    // =========================================================
    // CREATE POLICYHOLDER
    // =========================================================

    async clickCreatePolicyholder(): Promise<void> {
    await this.page
        .getByRole('button', {
            name: 'Create Policyholder',
            exact: true,
        })
        .click();

    await this.page.waitForURL(
        /\/screens\/customers/,
        {
            timeout: 60000,
        }
    );

    console.log(
        'Navigated to Policyholder list'
    );
}

    // =========================================================
    // VERIFY POLICYHOLDER IN LIST
    // =========================================================

    async verifyPolicyholderInList(
        policyholderName: string
    ): Promise<void> {
        console.log(
            `Waiting for policyholder in list: ${policyholderName}`
        );

        await expect(
            this.page
                .getByText(policyholderName, {
                    exact: false,
                })
                .first()
        ).toBeVisible({
            timeout: 60000,
        });

        console.log(
            `Verified policyholder in list: ${policyholderName}`
        );
    }

    // =========================================================
    // REOPEN POLICYHOLDER
    // =========================================================

    async reopenPolicyholder(
        policyholderName: string
    ): Promise<void> {
        await this.page
            .getByText(policyholderName, {
                exact: false,
            })
            .first()
            .click();
    }

    // =========================================================
    // VERIFY PERSONAL POLICYHOLDER DETAILS
    // =========================================================

    async verifyPersonalPolicyholderDetails(
        data?: Record<string, string>
    ): Promise<void> {
        if (!data) {
            await expect(
                this.page.getByPlaceholder(
                    'Enter first name'
                )
            ).toBeVisible();

            return;
        }

        if (data['Fore Name(s)']) {
            await expect(
                this.page.getByPlaceholder(
                    'Enter first name'
                )
            ).toHaveValue(data['Fore Name(s)']);
        }

        if (data['Surname']) {
            await expect(
                this.page.getByPlaceholder(
                    'Enter last name'
                )
            ).toHaveValue(data['Surname']);
        }

        if (data['Email Address']) {
            await expect(
                this.page.getByPlaceholder(
                    'Enter email'
                )
            ).toHaveValue(data['Email Address']);
        }
    }

    // =========================================================
    // VERIFY COMMERCIAL POLICYHOLDER DETAILS
    // =========================================================

    async verifyCommercialPolicyholderDetails(
        data?: Record<string, string>
    ): Promise<void> {
        if (!data) {
            await expect(
                this.page.getByPlaceholder(
                    'Enter business name'
                )
            ).toBeVisible();

            return;
        }

        if (data['Business Name']) {
            await expect(
                this.page.getByPlaceholder(
                    'Enter business name'
                )
            ).toHaveValue(data['Business Name']);
        }

        if (data['Registration Number']) {
            await expect(
                this.page.getByPlaceholder(
                    'Enter registration number'
                )
            ).toHaveValue(
                data['Registration Number']
            );
        }

        if (data['VAT Registration Number']) {
            await expect(
                this.page.getByPlaceholder(
                    'Enter VAT registration number'
                )
            ).toHaveValue(
                data['VAT Registration Number']
            );
        }
    }

    // =========================================================
    // LOGOUT
    // =========================================================

    async logout(): Promise<void> {
        await this.page
            .getByRole('button', {
                name: 'Account menu',
            })
            .click();

        await this.page
            .getByRole('menuitem', {
                name: 'Sign out',
                exact: true,
            })
            .click();

        console.log(
            'Successfully logged out from POSO'
        );
    }
}
