import {
  When,
  Then,
  DataTable,
} from '@cucumber/cucumber';

import { RatingPage } from '../pages/RatingPage.js';
import { CustomWorld } from '../support/world.js';

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getData(
  dataTable: DataTable,
): Record<string, string> {
  const data: Record<string, string> = {};

  dataTable.hashes().forEach((row) => {
    const field = row.field?.trim();
    const value = row.value?.trim();

    if (field && value !== undefined) {
      data[field] = value;
    }
  });

  return data;
}

function getRatingPage(
  world: CustomWorld,
): RatingPage {
  if (!world.page) {
    throw new Error(
      'Browser page is not initialized. Please ensure the browser is opened before executing this step.',
    );
  }

  return new RatingPage(world.page);
}

// ============================================================
// NAVIGATION
// ============================================================

When(
  'I navigate to Administration and select Rating',
  async function (this: CustomWorld) {
    const ratingPage = getRatingPage(this);

    await ratingPage.navigateToRating();
  },
);

// ============================================================
// SHORT TERM RATING
// ============================================================

When(
  'I select Short Term Rating',
  async function (this: CustomWorld) {
    const ratingPage = getRatingPage(this);

    await ratingPage.selectShortTermRating();
  },
);

When(
  'I click on New Base Rate',
  async function (this: CustomWorld) {
    const ratingPage = getRatingPage(this);

    await ratingPage.clickNewBaseRate();
  },
);

When(
  'I enter the following short term base rate details',
  async function (
    this: CustomWorld,
    dataTable: DataTable,
  ) {
    const ratingPage = getRatingPage(this);
    const data = getData(dataTable);

    await ratingPage.enterShortTermBaseRateDetails(
      data,
    );
  },
);

When(
  'I click on Create Base Rate',
  async function (this: CustomWorld) {
    const ratingPage = getRatingPage(this);

    await ratingPage.clickCreateBaseRate();
  },
);

Then(
  'I should see the created short term base rate in the list',
  async function (this: CustomWorld) {
    const ratingPage = getRatingPage(this);

    await ratingPage.verifyShortTermBaseRateCreated();
  },
);

// ============================================================
// LONG TERM RATING
// ============================================================

When(
  'I select Long Term Rating',
  async function (this: CustomWorld) {
    const ratingPage = getRatingPage(this);

    await ratingPage.selectLongTermRating();
  },
);

When(
  'I click on Add Rating',
  async function (this: CustomWorld) {
    const ratingPage = getRatingPage(this);

    await ratingPage.clickAddRating();
  },
);

When(
  'I enter the following long term product details',
  async function (
    this: CustomWorld,
    dataTable: DataTable,
  ) {
    const ratingPage = getRatingPage(this);
    const data = getData(dataTable);

    await ratingPage.enterLongTermProductDetails(
      data,
    );
  },
);

When(
  'I click Next',
  async function (this: CustomWorld) {
    const ratingPage = getRatingPage(this);

    await ratingPage.clickNext();
  },
);

// ============================================================
// LIFE COVER RATING CRITERIA
// ============================================================

When(
  'I enter the life cover rating criteria',
  async function (this: CustomWorld) {
    const ratingPage = getRatingPage(this);

    await ratingPage.enterLifeCoverRatingCriteria();
  },
);

// ============================================================
// LIFE COVER RATE CONFIGURATION
// ============================================================

When(
  'I configure the life cover rate with the following details',
  async function (
    this: CustomWorld,
    dataTable: DataTable,
  ) {
    const ratingPage = getRatingPage(this);
    const data = getData(dataTable);

    await ratingPage.configureLifeCoverRate(
      data,
    );
  },
);

When(
  'I add the life cover rate',
  async function (this: CustomWorld) {
    const ratingPage = getRatingPage(this);

    await ratingPage.clickAddRating();
  },
);

// ============================================================
// REVIEW & SAVE
// ============================================================

Then(
  'I should see the rating configuration review',
  async function (this: CustomWorld) {
    const ratingPage = getRatingPage(this);

    await ratingPage.verifyRatingReview();
  },
);

When(
  'I click Save and Activate',
  async function (this: CustomWorld) {
    const ratingPage = getRatingPage(this);

    await ratingPage.clickSaveAndActivate();
  },
);

Then(
  'I should see the created long term rating in the list',
  async function (this: CustomWorld) {
    const ratingPage = getRatingPage(this);

    await ratingPage.verifyLongTermRatingCreated();
  },
);

//============================================================
// RATING LOGOUT
// ============================================================

When(
  'I open the Rating Account menu',
  async function (this: CustomWorld) {
    const ratingPage = getRatingPage(this);

    await ratingPage.openAccountMenu();
  },
);

When(
  'I click the Rating Sign out option',
  async function (this: CustomWorld) {
    const ratingPage = getRatingPage(this);

    await ratingPage.clickSignOut();
  },
);

Then(
  'I should be redirected to the login page from Rating',
  async function (this: CustomWorld) {
    const ratingPage = getRatingPage(this);

    await ratingPage.verifyLoggedOut();
  },
);