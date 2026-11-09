@Products
Feature: POSO Products Management

  As a POSO user
  I want to manage products
  So that I can create and manage insurance products with their coverages, benefits, terms and conditions

  Background:
    Given I open the Chromium browser
    And I log in to POSO with valid credentials
    When I navigate to Administration and select Products

  # ==========================================================
  # POSITIVE SCENARIOS
  # ==========================================================

  @PRODUCT_TC_001 @PRODUCT_Navigation @PRODUCT_Create @PRODUCT_MandatoryFields @PRODUCT_Positive
  Scenario: PRODUCT_TC_001 - Navigate to Products and create a product using all product details

    Then the Products page should be displayed
    And the products list should be displayed

    When I select Add Product

    And I enter the following mandatory product details
      | field             | value                        |
      | productName       | POSO Automation Health       |
      | abbreviation      | PAH                          |
      | insuranceCompany  | Afritec Life Insurance       |
      | productCategory   | Personal Lines               |
      | Product Group     | All Risk                     |
      | description       | POSO automation test product |

     
    And I add a coverage with the following details
      | field           | value                          |
      | coverageName    | Room Rent                      |
      | amount          | 50.00                          |
      | description     | Room rent coverage             |
      | subLimits       | Max 30 days/year               |
      | waitingPeriod   | 30 days                        |
      | conditions      | Applicable as per policy terms |
      | mandatory       | Yes                            |

    And I add a benefit with the following details
      | field           | value                       |
      | benefitName     | No Claim Bonus               |
      | validityPeriod  | 1 year                       |
      | description     | Bonus for claim-free policy  |
      | conditions      | Subject to policy terms      |

    And I enter the following additional product details
      | field             | value                        |
      | minimumAge        | 18                           |
      | maximumAge        | 65                           |
      | termsConditions   | Standard product terms apply |

    And I add a custom field with the following details
      | field                  | value                 |
      | fieldName              | Customer Reference    |
      | fieldType              | Text                  |
      | requiredField          | Yes                   |
      | additionalConstraints  | Maximum 50 characters |

    And I configure the following termination charge details
      | field             | value                      |
      | chargeType        | None                       |
      | refundPaidBy      | As set on the Underwriter  |

   And I add the following required documents
      | documentName  |
      | Proposal Form |
      | ID Proof      |

    And I select the Commission Collection Type "Premium Collected by Broker (Deduct-at-Source)"

    And I save the product

    Then the product should be created successfully
    And the created product "POSO Automation Health" should be displayed in the products list

    And I log out from POSO
