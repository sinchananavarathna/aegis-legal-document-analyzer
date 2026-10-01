import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateContract, CONTRACT_META } from "./templates.ts";

const NDA_DATA: Record<string, string> = {
  effective_date: "27 August 2026",
  disclosing_name: "Acme Corp",
  disclosing_address: "London, UK",
  receiving_name: "Beta Inc",
  receiving_address: "New York, NY",
  purpose: "Due diligence",
  term_years: "3",
  notice_days: "30",
  governing_law: "England and Wales",
};

const SERVICE_DATA: Record<string, string> = {
  effective_date: "1 September 2026",
  provider: "Studio LLC",
  client: "Harbor Co",
  scope: "Product design",
  fee: "USD 8,500 per month",
  term: "12 months",
  cap: "fees paid in the prior 12 months",
  governing_law: "State of Delaware",
};

const FREELANCE_DATA: Record<string, string> = {
  effective_date: "15 October 2026",
  contractor: "Jordan Hale",
  client: "Pine & Copper Ltd.",
  services: "Editorial design",
  rate: "USD 120 per hour",
  invoice: "Net 15, monthly",
  governing_law: "State of New York",
};

const EMPLOYMENT_DATA: Record<string, string> = {
  effective_date: "14 September 2026",
  employer: "Aegis Research Pte. Ltd.",
  employee: "Alex Rivera",
  title: "Counsel, Commercial",
  salary: "USD 145,000 per year",
  location: "Singapore",
  governing_law: "Singapore",
};

describe("generateContract", () => {
  it("generates NDA with all fields filled", () => {
    const doc = generateContract("nda", NDA_DATA);
    assert.ok(doc.includes("Acme Corp"), "should contain disclosing party");
    assert.ok(doc.includes("Beta Inc"), "should contain receiving party");
    assert.ok(doc.includes("27 August 2026"), "should contain date");
    assert.ok(doc.includes("England and Wales"), "should contain governing law");
    assert.ok(doc.includes("Due diligence"), "should contain purpose");
    assert.ok(doc.includes("3"), "should contain term");
  });

  it("generates service agreement", () => {
    const doc = generateContract("service", SERVICE_DATA);
    assert.ok(doc.includes("Studio LLC"), "should contain provider");
    assert.ok(doc.includes("Harbor Co"), "should contain client");
    assert.ok(doc.includes("Product design"), "should contain scope");
    assert.ok(doc.includes("USD 8,500 per month"), "should contain fee");
  });

  it("generates freelance agreement", () => {
    const doc = generateContract("freelance", FREELANCE_DATA);
    assert.ok(doc.includes("Jordan Hale"), "should contain contractor");
    assert.ok(doc.includes("Editorial design"), "should contain services");
    assert.ok(doc.includes("USD 120 per hour"), "should contain rate");
  });

  it("generates employment letter", () => {
    const doc = generateContract("employment", EMPLOYMENT_DATA);
    assert.ok(doc.includes("Alex Rivera"), "should contain employee");
    assert.ok(doc.includes("Counsel, Commercial"), "should contain title");
    assert.ok(doc.includes("USD 145,000 per year"), "should contain salary");
    assert.ok(doc.includes("Aegis Research Pte. Ltd."), "should contain employer");
  });

  it("fills [to be completed] for missing fields", () => {
    const doc = generateContract("nda", {});
    assert.ok(doc.includes("[to be completed]"), "missing fields should show placeholder");
  });

  it("does not leave template markers for filled fields", () => {
    const doc = generateContract("nda", NDA_DATA);
    assert.ok(!doc.includes("{{effective_date}}"), "should not contain template markers");
    assert.ok(!doc.includes("{{disclosing_name}}"), "should not contain template markers");
  });
});

describe("CONTRACT_META", () => {
  it("has metadata for all contract types", () => {
    assert.ok(CONTRACT_META.nda, "should have nda meta");
    assert.ok(CONTRACT_META.service, "should have service meta");
    assert.ok(CONTRACT_META.freelance, "should have freelance meta");
    assert.ok(CONTRACT_META.employment, "should have employment meta");
  });

  it("each type has a title and fields", () => {
    for (const [type, meta] of Object.entries(CONTRACT_META)) {
      assert.ok(meta.title.length > 0, `${type} should have a title`);
      assert.ok(meta.fields.length > 0, `${type} should have fields`);
    }
  });
});
