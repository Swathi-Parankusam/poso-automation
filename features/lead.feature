@Leads
Feature: POSO Lead Management

    As a POSO user
    I want to create and manage Individual and Business leads
    So that I can convert leads into policyholder profiles

    Background:
        Given I open the Chromium browser
        And I log in to POSO with valid credentials
        When I navigate to Policy Management and select Leads module


    @LEAD_INDIVIDUAL_TC_001
    Scenario: LEAD_INDIVIDUAL_TC_001 - Create an Individual lead and convert it to a policyholder

        When I click on Add Lead
        And I select "Individual" as the lead type

        And I enter the following Individual lead details
            | field              | value                                |
            | title              | Mrs                                  |
            | firstName          | Anna                                 |
            | surname            | Turner                               |
            | gender             | Male                                 |
            | dateOfBirth        | 2002-11-12                           |
            | age                | 24                                   |
            | email              | Anna.Turner@example.com              |
            | mobile             | 80756856776                          |
            | idType             | National ID                          |
            | idNumber           | 978909960                            |
            | source             | Agent                                |
            | status             | Enquiry                              |
            | priority           | Medium                               |
            | createdDate        | 2026-11-09                           |
            | renewalDate        | 2027-11-09                           |
            | streetAddress      | Hill Valle                           |
            | city               | Gaborone                             |
            | state              | South State                          |
            | country            | Botswana                             |
            | productSubCategory | Personal Lines (Short Term Products) |
            | product            | Old Mutual Allsure - Old Mutual      |
            | notes              | Individual automation lead           |

        And I click on Create Lead

        Then I should see the created Individual lead in the list

        # Convert lead using three-dot Actions menu
        When I click the three dots for the created Individual lead
        And I select Convert from the Actions menu
        Then the Individual lead should be converted successfully

        # Verify converted record in Policyholder Profile
        When I navigate to the Policyholder module
        And I search for the converted Individual policyholder
        Then I should see the converted Individual policyholder in the Policyholder list

        # Logout
        When I open the Lead Account menu
        And I click the Lead Sign out option
        Then I should be redirected to the login page from Leads


    @LEAD_BUSINESS_TC_002
    Scenario: LEAD_BUSINESS_TC_002 - Create a Business lead and convert it to a policyholder

        When I click on Add Lead
        And I select "Business" as the lead type

        And I enter the following Business lead details
            | field                  | value                                      |
            | contactPersonTitle     | Mr                                         |
            | contactPersonFirstName | Richael                                    |
            | contactPersonSurname   | Doe                                        |
            | companyName            | Business Automation Company                |
            | industry               | Other                                      |
            | tradingName            | Auto Test Trading                          |
            | registrationNumber     | REG654123                                  |
            | dateOfBirth            | 1990-11-15                                 |
            | email                  | richael.doe@example.com                    |
            | mobile                 | 67876527657                                |
            | idType                 | National ID                                |
            | idNumber               | 889798480                                  |
            | source                 | Agent                                      |
            | status                 | Enquiry                                    |
            | priority               | Medium                                     |
            | createdDate            | 2026-11-09                                 |
            | renewalDate            | 2027-11-09                                 |
            | streetAddress          | Red Valley                                 |
            | city                   | Gaborone                                   |
            | state                  | East Gaborone                              |
            | country                | Botswana                                   |
            | productSubCategory     | Specialized Lines (Short Term Products)    |
            | product                | Specialized Cover Insurance - Insure Guard |
            | notes                  | Business automation lead                   |

        And I click on Create Lead

        Then I should see the created Business lead in the list

        # Convert lead using three-dot Actions menu
        When I click the three dots for the created Business lead
        And I select Convert from the Actions menu
        Then the Business lead should be converted successfully

        # Verify converted record in Policyholder Profile
        When I navigate to the Policyholder module
        And I search for the converted Business policyholder
        Then I should see the converted Business policyholder in the Policyholder list

        # Logout
        When I open the Lead Account menu
        And I click the Lead Sign out option
        Then I should be redirected to the login page from Leads