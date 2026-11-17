@PolicyholderProfile
Feature: POSO Policyholder Profile Management

    As a POSO user
    I want to create and manage Personal and Commercial policyholder profiles
    So that I can maintain customer information and policyholder records

    Background:
        Given I open the Chromium browser
        And I log in to POSO with valid credentials
        When I navigate to Policy Management and select Policyholder Profile module


    @POLICYHOLDER_PERSONAL_TC_001
    Scenario: POLICYHOLDER_PERSONAL_TC_001 - Create a Personal policyholder profile and verify the saved details

        When I click on Add Customer

        # Identity Details / General Info
        And I enter the Personal policyholder details
            | Field                     | Value               |
            | Policyholder Type         | Personal            |
            | Title                     | Mr                  |
            | Fore Name(s)              | Tom                 |
            | Surname                   | Tin                 |
            | Date of Birth             | 01 Jan 1990         |
            | Gender                    | Male                |
            | Mobile                    | +267 75668642       |
            | Email Address             | tom.tin@example.com |
            | Marital Status            | Single              |
            | Nationality               | Botswana            |
            | Telephone                 | +267 3901234        |
            | Work Telephone            | +267 3901235        |
            | Educational Qualification | Masters             |
            | Annual Income             | 500000              |
            | Active Status             | Active              |

        # KYC Information
        And I enter the Personal KYC information
            | Field                   | Value       |
            | ID Type                 | National ID |
            | ID Number               | 711519719   |
            | Date KYC last completed | 01 Jan 2026 |

        And I upload the required Personal KYC documents
            | Document Name             | Required |
            | Application Form          | Yes      |
            | Identification Document   | Yes      |
            | Proof of Address          | Yes      |
            | Proof of Source of Income | Yes      |
            | Proof of Bank Account     | No       |

        # Address Information
        And I enter the Personal address information
            | Field                    | Value                            |
            | Country                  | Botswana                         |
            | State/District           | Gaborone City                    |
            | Village / Town / City    | Gaborone                         |
            | Pincode                  | 00001                            |
            | Physical Address         | POSO Automation Physical Address |
            | Postal Address           | POSO Automation Postal Address   |
            | Duration of Stay (years) | 5                                |
            | Region                   | Central Region                   |

        # Employment and Banking
        And I enter the Personal employment and banking information
            | Field               | Value                                 |
            | Occupation          | Business Owner                        |
            | Place of Work       | POSO Automation Office                |
            | Employer            | POSO Automation Employer              |
            | Payment Method      | Bank                                  |
            | Bank Name           | ABC Bank                              |
            | Branch Name         | Main Branch                           |
            | Account Number      | 1234567890                            |
            | Account Holder Name | POSO Personal Automation              |
            | Account Type        | Savings                               |
            | Smoker              | No                                    |
            | Source of Funds     | Salary                                |
            | Nature of Income    | Regular                               |
            | Notes               | Personal policyholder automation test |

        # Supporting Information
        And I enter the Personal supporting information
            | Field      | Value            |
            | Agent Name | Priyanka Kambham |

        And I upload a Personal supporting document

        And I click on Create Policyholder

        Then I should see the created Personal policyholder in the policyholder list

        When I reopen the created Personal policyholder record

        Then all entered Personal policyholder details should be saved correctly

        And I log out from the POSO application



    @POLICYHOLDER_COMMERCIAL_TC_001
    Scenario: POLICYHOLDER_COMMERCIAL_TC_001 - Create a Commercial policyholder profile and verify the saved details

        When I click on Add Customer

        And I enter the Commercial policyholder details
            | Field                         | Value                              |
            | Policyholder Type             | Commercial                         |
            | Commercial Sub-Type           | Corporate Group                    |
            | Business Name                 | POSO Commercial Automation         |
            | Trading Name                  | POSO Automation Trading            |
            | Registration Number           | REG-2026-001                       |
            | Country of Incorporation      | Botswana                           |
            | VAT Registration Number       | VAT-2026-001                       |
            | Brief Description of Business | Commercial automation test company |
            | Nature of Business            | Finance & Insurance                |
            | Active Status                 | Active                             |

        And I enter the Commercial contact person details
            | Field                     | Value                   |
            | Title                     | Mr                      |
            | Fore Name(s)              | John                    |
            | Surname                   | Tom                     |
            | Date of Birth             | 01 Jan 1990             |
            | Gender                    | Male                    |
            | Mobile                    | +267 75668642           |
            | Email Address             | John.tom@commercial.com |
            | Marital Status            | Single                  |
            | Nationality               | Botswana                |
            | ID Type                   | Passport                |
            | Passport Number           | P1234567                |
            | Country of Issue          | Botswana                |
            | Capacity/Position         | Manager                 |
            | Telephone                 | +267 3901234            |
            | Work Telephone            | +267 3901235            |
            | Educational Qualification | Masters                 |
            | Annual Income             | 500000                  |

        And I enter the Commercial KYC information
            | Field     | Value       |
            | ID Type   | Passport    |
            | ID Number | COMPA123456 |

        And I upload all required Commercial KYC documents

        And I enter the Commercial address information
            | Field                    | Value                            |
            | Country                  | Botswana                         |
            | State/District           | Gaborone City                    |
            | Village / Town / City    | Gaborone                         |
            | Pincode                  | 00001                            |
            | Physical Address         | POSO Commercial Physical Address |
            | Postal Address           | POSO Commercial Postal Address   |
            | Duration of Stay (years) | 5                                |
            | Region                   | Central Region                   |

        And I enter the Commercial employment and banking information
            | Field               | Value                                   |
            | Bank Name           | ABC Bank                                |
            | Branch Name         | Main Branch                             |
            | Account Number      | 9876543210                              |
            | Account Holder Name | POSO Commercial Automation              |
            | Account Type        | Current                                 |
            | Source of Funds     | Salary                                  |
            | Nature of Income    | Regular                                 |
            | Notes               | Commercial policyholder automation test |

        And I enter the Commercial supporting information
            | Field      | Value            |
            | Agent Name | Priyanka Kambham |

        And I upload a Commercial supporting document

        And I click on Create Policyholder

        Then I should see the created Commercial policyholder in the policyholder list

        When I reopen the created Commercial policyholder record

        Then all entered Commercial policyholder details should be saved correctly

        And I log out from the POSO application
