import { expect, test } from "@playwright/test";

const cases = [
  { type: "workplace", label: "Workplace Feedback" },
  { type: "service", label: "Service Feedback", service: "IT Helpdesk" },
  { type: "visitor", label: "Visitor Feedback", purpose: "Client visit", person: "Reception" },
  { type: "applicant", label: "Applicant Feedback", position: "Customer Service Representative", stage: "Interview" },
  { type: "account", label: "Account Feedback", account: "Ashley", concern: "Queue visibility" },
];

test.describe("feedback form happy paths", () => {
  for (const item of cases) {
    test(`submits ${item.label}`, async ({ page }) => {
      await page.goto(`/feedback/${item.type}`);
      await expect(page.getByRole("heading", { name: /Tell Us What Happened/i })).toBeVisible();
      await page.getByLabel("Full name").fill("QA User");
      await page.getByLabel("Email optional").fill("qa@example.com");

      if (item.service) {
        await page.getByRole("button", { name: /Service type/i }).click();
        await page.getByRole("option", { name: item.service }).click();
      }
      if (item.purpose) {
        await page.getByRole("button", { name: /Visit purpose/i }).click();
        await page.getByRole("option", { name: item.purpose }).click();
        await page.getByLabel("Person or department visited").fill(item.person ?? "Reception");
      }
      if (item.position) {
        await page.getByLabel("Position applied for").fill(item.position);
        await page.getByRole("button", { name: /Recruitment stage/i }).click();
        await page.getByRole("option", { name: item.stage ?? "Interview" }).click();
      }
      if (item.account) {
        await page.getByRole("button", { name: /Account \/ Campaign/i }).click();
        await page.getByRole("option", { name: item.account, exact: true }).click();
        await page.getByLabel("Operational concern").fill(item.concern ?? "Coaching support");
      }

      await page.getByRole("radio", { name: "5 stars" }).click();
      await page.getByLabel("Detailed comments").fill("This automated check confirms the feedback form can submit successfully.");
      await page.getByRole("button", { name: /Submit Feedback/i }).click();
      await expect(page.getByRole("heading", { name: /Thank You/i })).toBeVisible();
      await expect(page.getByText(/Submission ID/i)).toBeVisible();
    });
  }
});
