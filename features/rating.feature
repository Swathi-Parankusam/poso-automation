@Rating
Feature: POSO Rating Management

  As a POSO user
  I want to manage short term and long term ratings
  So that I can create and manage insurance rating configurations

  Background:
    Given I open the Chromium browser
    And I log in to POSO with valid credentials
    When I navigate to Administration and select Rating


  @SHORT_TERM_RATING_TC_001
  Scenario: SHORT_TERM_RATING_TC_001 - Create a new short term base rate

    When I select Short Term Rating
    And I click on New Base Rate

    And I enter the following short term base rate details
      | field              | value                |
      | underwriter        | Old Mutual           |
      | product            | Old Mutual Multisure |
      | coverage           | Old Mutual Multisure |
      | ratingZone         | 1                    |
      | sumInsuredFrom     | 10000                |
      | sumInsuredTo       | 50000                |
      | ratePercent        | 5                    |
      | rateValue          | 500                  |
      | policyTerm         | 12                   |
      | paymentFrequency   | Monthly              |
      | make               | Toyota               |
      | engineSize         | 2000                 |
      | vehicleOrigin      | Local                |
      | minimumPremium     | 2500                 |
      | basicExcess        | 5                    |
      | excessMinimum      | 3000                 |
      | excessMinimumUpper | 5000                 |
      | startDate          | 2026-11-09           |
      | endDate            | 2027-11-09           |
      | gender             | Male                 |

    And I click on Create Base Rate

    Then I should see the created short term base rate in the list

    # Logout
    When I open the Rating Account menu
    And I click the Rating Sign out option
    Then I should be redirected to the login page from Rating

  @LONG_TERM_RATING_TC_001
  Scenario: LONG_TERM_RATING_TC_001 - Create and activate a new long term Life Cover rating

    When I select Long Term Rating
    And I click on Add Rating

    # Step 1 - General Information
    And I enter the following long term product details
      | field         | value           |
      | underwriter   | Old Mutual      |
      | product       | Poso Life Cover |
      | ratingType    | Life Cover      |
      | status        | Active          |
      | effectiveFrom | 2026-11-10      |
      | effectiveTo   | 2027-11-10      |

    And I click Next

    # Step 2 - Rating Criteria
    And I enter the life cover rating criteria

    And I click Next

    # Step 3 - Rates
    And I configure the life cover rate with the following details
      | field           | value      |
      | gender          | Male       |
      | ageFrom         | 18         |
      | ageTo           | 30         |
      | coverAmountFrom | 50000      |
      | coverAmountTo   | 500000     |
      | smokingStatus   | Non-Smoker |
      | education       | Tertiary   |
      | medicalUW       | Required   |
      | financialUW     | Required   |
      | cashback        | Included   |
      | monthlyPremium  | 5000       |

    And I click Next

    # Step 4 - Review and Save
    Then I should see the rating configuration review

    When I click Save and Activate

    Then I should see the created long term rating in the list


    # Logout
    When I open the Rating Account menu
    And I click the Rating Sign out option
    Then I should be redirected to the login page from Rating
