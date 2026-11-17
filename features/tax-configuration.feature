
@TaxConfiguration
Feature: Tax Configuration Management

    As a POSO user
    I want to create and manage tax configurations
    So that tax rates can be configured for the selected underwriter and product

    Background:
        Given I open the Chromium browser
        And I log in to POSO with valid credentials
        When I navigate to Administration and select Tax Configuration module

    @TAX_CONFIGURATION_TC_001
    Scenario: TAX_CONFIGURATION_TC_001 - Create a new tax configuration and verify the saved details

        When I click on New Tax Configuration

        # Tax Configuration Details
        And I enter the Tax Configuration details
            | Field          | Value                                  |
            | Tax Code       | VAT                                    |
            | Tax Rate       | 14.01                                  |
            | Underwriter    | Afritec Life Insurance                 |
            | Product        | All products                           |
            | Effective From | 17 Nov 2026                            |
            | Effective To   | 30 Nov 2026                            |
            | Status         | Active                                 |
            | Description    | POSO automation test tax configuration |

        And I click on Create Tax Configuration

        Then I should see the created Tax Configuration in the Tax Configuration list

        And I log out from the POSO application
