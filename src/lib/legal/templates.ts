import type { ContractField, ContractType } from "./types";

export const CONTRACT_META: Record<
  ContractType,
  { title: string; blurb: string; fields: ContractField[] }
> = {
  nda: {
    title: "Mutual NDA",
    blurb: "Two-way confidentiality for exploratory talks and diligence.",
    fields: [
      { key: "effective_date", label: "Effective date", placeholder: "27 August 2026" },
      { key: "disclosing_name", label: "Disclosing party", placeholder: "Novacore Systems Ltd." },
      { key: "disclosing_address", label: "Disclosing address", placeholder: "London, United Kingdom" },
      { key: "receiving_name", label: "Receiving party", placeholder: "Orbital Solutions Inc." },
      { key: "receiving_address", label: "Receiving address", placeholder: "Wilmington, Delaware" },
      { key: "purpose", label: "Permitted purpose", placeholder: "Evaluating a strategic partnership" },
      { key: "term_years", label: "Term (years)", placeholder: "3" },
      { key: "notice_days", label: "Notice period (days)", placeholder: "30" },
      { key: "governing_law", label: "Governing law", placeholder: "England and Wales" },
    ],
  },
  service: {
    title: "Service agreement",
    blurb: "Scoped professional services with fees, IP, and liability caps.",
    fields: [
      { key: "effective_date", label: "Effective date", placeholder: "27 August 2026" },
      { key: "provider", label: "Service provider", placeholder: "Northline Studio LLC" },
      { key: "client", label: "Client", placeholder: "Harbor & Co." },
      { key: "scope", label: "Scope of work", placeholder: "Product design and implementation", multiline: true },
      { key: "fee", label: "Fee", placeholder: "USD 8,500 per month" },
      { key: "term", label: "Term", placeholder: "12 months" },
      { key: "cap", label: "Liability cap", placeholder: "fees paid in the prior 12 months" },
      { key: "governing_law", label: "Governing law", placeholder: "State of Delaware" },
    ],
  },
  freelance: {
    title: "Freelance agreement",
    blurb: "Independent contractor terms, deliverables, and payment.",
    fields: [
      { key: "effective_date", label: "Effective date", placeholder: "27 August 2026" },
      { key: "contractor", label: "Contractor", placeholder: "Jordan Hale" },
      { key: "client", label: "Client", placeholder: "Pine & Copper Ltd." },
      { key: "services", label: "Services", placeholder: "Editorial design and production", multiline: true },
      { key: "rate", label: "Rate", placeholder: "USD 120 per hour" },
      { key: "invoice", label: "Invoice cycle", placeholder: "Net 15, monthly" },
      { key: "governing_law", label: "Governing law", placeholder: "State of New York" },
    ],
  },
  employment: {
    title: "Employment offer",
    blurb: "At-will employment letter with compensation and confidentiality.",
    fields: [
      { key: "effective_date", label: "Start date", placeholder: "14 September 2026" },
      { key: "employer", label: "Employer", placeholder: "Aegis Research Pte. Ltd." },
      { key: "employee", label: "Employee", placeholder: "Alex Rivera" },
      { key: "title", label: "Title", placeholder: "Counsel, Commercial" },
      { key: "salary", label: "Salary", placeholder: "USD 145,000 per year" },
      { key: "location", label: "Location", placeholder: "Singapore (hybrid)" },
      { key: "governing_law", label: "Governing law", placeholder: "Singapore" },
    ],
  },
};

function fill(template: string, data: Record<string, string>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => data[key]?.trim() || "[to be completed]");
}

const NDA = `MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement ("Agreement") is entered into as of {{effective_date}} (the "Effective Date") by and between:

{{disclosing_name}}, with an address at {{disclosing_address}} ("Disclosing Party"); and
{{receiving_name}}, with an address at {{receiving_address}} ("Receiving Party").

Each a "Party" and together the "Parties".

1. Purpose. The Parties wish to exchange confidential information for {{purpose}} (the "Purpose").

2. Confidential Information. "Confidential Information" means non-public information disclosed by a Party, including business, technical, financial, and customer information, whether marked confidential or that a reasonable person would treat as confidential.

3. Obligations. Each Receiving Party shall (a) hold Confidential Information in confidence; (b) use it solely for the Purpose; (c) disclose it only to personnel with a need to know who are bound by written confidentiality duties; and (d) protect it with at least reasonable care.

4. Exclusions. Obligations do not apply to information that is public, previously known, independently developed, or rightfully received from a third party without duty of confidence.

5. Term. This Agreement begins on the Effective Date and continues for {{term_years}} years. Either Party may terminate with {{notice_days}} days' prior written notice. Confidentiality survives for five (5) years after disclosure, and indefinitely for trade secrets.

6. Return. Upon request or termination, the Receiving Party shall return or destroy Confidential Information and certify destruction in writing.

7. No license. No intellectual property license is granted. No warranty is made as to accuracy of disclosed information.

8. Liability. Neither Party's aggregate liability under this Agreement shall exceed USD 100,000, except for willful misconduct or unauthorized disclosure.

9. Indemnification. Each Party shall indemnify the other against third-party claims arising from unauthorized disclosure caused by that Party.

10. Dispute resolution. Disputes shall first be submitted to mediation. If unresolved in thirty (30) days, they shall be settled by binding arbitration.

11. Governing law. This Agreement is governed by the laws of {{governing_law}}.

12. Amendment and assignment. Amendments must be in a writing signed by both Parties. Neither Party may assign without prior written consent, except to a successor in a merger or sale of substantially all assets.

13. Severability. If a provision is unenforceable, the remainder remains in effect.

IN WITNESS WHEREOF, the Parties have executed this Agreement as of the Effective Date.

_______________________________          _______________________________
{{disclosing_name}}                      {{receiving_name}}
`;

const SERVICE = `PROFESSIONAL SERVICES AGREEMENT

This Professional Services Agreement ("Agreement") is entered into as of {{effective_date}} between {{provider}} ("Provider") and {{client}} ("Client").

1. Services. Provider shall perform: {{scope}} (the "Services").

2. Fees. Client shall pay {{fee}}. Invoices are due within fifteen (15) days. Late amounts accrue 1% per month.

3. Term. The term is {{term}}, unless earlier terminated. Either Party may terminate for convenience with thirty (30) days' prior written notice, or immediately for material breach not cured within fifteen (15) days after notice.

4. Intellectual property. Client owns deliverables upon full payment. Provider retains pre-existing tools, libraries, and know-how. Provider grants Client a non-exclusive license to use such materials as embodied in the deliverables.

5. Confidentiality. Each Party shall protect the other's confidential information with reasonable care and use it only to perform this Agreement.

6. Warranty. Provider warrants that Services will be performed in a professional and workmanlike manner. Except as stated, services are provided without other warranties.

7. Limitation of liability. Except for fraud, willful misconduct, or confidentiality breach, each Party's aggregate liability is limited to {{cap}}. Neither Party is liable for indirect or consequential damages.

8. Indemnification. Each Party shall indemnify the other against third-party claims arising from its negligence or willful misconduct.

9. Independent contractor. Provider is an independent contractor, not an employee.

10. Dispute resolution. The Parties shall first mediate in good faith. Unresolved disputes shall be submitted to binding arbitration.

11. Governing law. This Agreement is governed by the laws of {{governing_law}}.

12. Entire agreement. This is the entire agreement. Amendments must be in writing and signed by both Parties.

_______________________________          _______________________________
{{provider}}                             {{client}}
`;

const FREELANCE = `INDEPENDENT CONTRACTOR AGREEMENT

This Independent Contractor Agreement ("Agreement") is entered into as of {{effective_date}} between {{client}} ("Client") and {{contractor}} ("Contractor").

1. Services. Contractor shall provide: {{services}}.

2. Compensation. Client shall pay {{rate}}. Contractor shall invoice {{invoice}}.

3. Status. Contractor is an independent contractor, responsible for taxes, insurance, and equipment. Nothing creates an employment, partnership, or agency relationship.

4. Intellectual property. Work product created under this Agreement is a work made for hire. To the extent it is not, Contractor hereby assigns all right, title, and interest to Client upon payment.

5. Confidentiality. Contractor shall not disclose Client confidential information and shall return it upon request.

6. Non-solicitation. During the engagement and for six (6) months after, Contractor shall not solicit Client employees with whom Contractor worked, except through general advertising.

7. Term. Either Party may terminate with fourteen (14) days' written notice, or immediately for material breach.

8. Liability. Contractor's aggregate liability shall not exceed fees paid in the prior three (3) months, except for IP infringement, confidentiality breach, or willful misconduct.

9. Governing law. This Agreement is governed by the laws of {{governing_law}}. Disputes shall be resolved by mediation, then binding arbitration.

_______________________________          _______________________________
{{contractor}}                           {{client}}
`;

const EMPLOYMENT = `EMPLOYMENT OFFER LETTER

{{effective_date}}

Dear {{employee}},

{{employer}} (the "Company") is pleased to offer you employment as {{title}}, starting on {{effective_date}}, based in {{location}}.

1. Compensation. Your salary will be {{salary}}, payable in accordance with the Company's ordinary payroll practices.

2. Status. Employment is at-will. Either you or the Company may end the relationship at any time, with or without cause, subject to applicable law. The Company may provide two (2) weeks' notice as a courtesy, except in cases of misconduct.

3. Duties. You will perform the duties customarily associated with the role and such other duties as reasonably assigned. You will devote your full professional time to the Company.

4. Confidentiality and IP. You will sign the Company's standard confidentiality and invention assignment agreement. Work product created in the course of employment belongs to the Company.

5. Policies. Employment is subject to Company policies, which may be updated from time to time with notice.

6. Conditions. This offer is contingent on proof of right to work and satisfactory background checks where lawful.

7. Governing law. This letter is governed by the laws of {{governing_law}}.

If you accept, please sign and return a copy of this letter.

Sincerely,

{{employer}}

Accepted and agreed:

_______________________________
{{employee}}
Date: _______________
`;

const BODIES: Record<ContractType, string> = {
  nda: NDA,
  service: SERVICE,
  freelance: FREELANCE,
  employment: EMPLOYMENT,
};

export function generateContract(type: ContractType, data: Record<string, string>) {
  return fill(BODIES[type], data).trim() + "\n";
}
