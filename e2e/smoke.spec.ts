import { expect, test } from '@playwright/test';

test('home page loads with navigation and disclaimers', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('evidence you can check');
  await expect(page.getByRole('link', { name: 'Career explorer' }).first()).toBeVisible();
  await expect(page.getByText('Honest status')).toBeVisible();
  expect(errors).toEqual([]);
});

test('career explorer: default equal weights, search and restore', async ({ page }) => {
  await page.goto('/careers');
  await expect(page.getByText('Equal weighting (default) is active.')).toBeVisible();
  const rows = page.locator('tbody tr');
  await expect(rows).toHaveCount(41);
  await page.getByLabel('Search families or degrees').fill('nursing');
  await expect(rows.first()).toContainText(/nursing/i);
  await page.getByLabel('Search families or degrees').fill('');
  await page.getByLabel('Islamic alignment', { exact: false }).first().fill('100');
  await expect(page.getByText('Custom weighting is active.')).toBeVisible();
  await page.getByRole('button', { name: 'Restore equal weighting' }).click();
  await expect(page.getByText('Equal weighting (default) is active.')).toBeVisible();
});

test('universities: ties visible, profile loads, MIT shows official cost only', async ({ page }) => {
  await page.goto('/universities');
  await expect(page.getByText('ranks 1-150', { exact: false }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Massachusetts Institute of Technology (MIT)' })).toBeVisible();
  await page.goto('/universities/massachusetts-institute-technology-mit');
  await expect(page.getByRole('cell', { name: 'Mechanical Engineering (Course 2)' })).toBeVisible();
  await expect(page.getByText('no grade minimum is recorded', { exact: false }).first()).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Massachusetts');
  await expect(page.getByText('$92,760')).toBeVisible();
  await expect(page.getByText('Need-based', { exact: false }).first()).toBeVisible();
});

test('matcher: runs a check and never claims an unverified programme', async ({ page }) => {
  await page.goto('/matcher');
  await page.getByLabel('Degree').selectOption({ index: 1 });
  await page.getByLabel('University (QS 2027 list)').selectOption('massachusetts-institute-technology-mit');
  await page.getByRole('button', { name: 'Check this match' }).click();
  await expect(page.getByText('Programme NOT verified')).toBeVisible();
  await expect(page.getByText('not a probability of admission', { exact: false })).toBeVisible();
});

test('matcher: rejects an out-of-range percentage', async ({ page }) => {
  await page.goto('/matcher');
  await page.getByLabel('Degree').selectOption({ index: 1 });
  await page.getByLabel('University (QS 2027 list)').selectOption('massachusetts-institute-technology-mit');
  await page.getByLabel('Overall percentage or grade equivalent (optional)').fill('250');
  await page.getByRole('button', { name: 'Check this match' }).click();
  await expect(page.getByRole('alert').filter({ hasText: '0 to 100' })).toBeVisible();
});

test('roadmap ticks persist after reload', async ({ page }) => {
  await page.goto('/roadmap');
  const first = page.getByRole('checkbox').first();
  await first.check();
  await expect(page.getByText('steps ticked')).toContainText('1');
  await page.reload();
  await expect(page.getByRole('checkbox').first()).toBeChecked();
});

test('compare workspace shows families from the URL', async ({ page }) => {
  await page.goto('/compare?families=software-computing');
  await expect(page.getByRole('columnheader', { name: 'Software and Computing' })).toBeVisible();
});

test('unknown page shows a helpful not-found page', async ({ page }) => {
  const res = await page.goto('/does-not-exist');
  expect(res?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
});
