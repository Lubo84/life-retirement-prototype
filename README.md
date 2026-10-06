# LIFE Retirement Prototype

Single-page retirement exploration prototype. Client-side state only; no information is sent to a financial provider. Reload clears member data.

## Model upgrade — 5 October 2026

The Age Pension module now uses the Australian rules snapshot effective 20 September 2026, with sources in `rules.mjs`. It calculates both tests and selects the lower payment. Annual figures use 26 fortnights. Current standard rates include maximum pension and energy supplements. The asset taper is continuous rather than using legislative $250 rounding.

- Pension age 67, assessed separately for each partner.
- Single maximum $1,237.70/fortnight; couple $933 each.
- Assets free areas: single homeowner $333,000 / non-homeowner $600,000; couple combined $499,000 / $766,000.
- Asset taper $3/fortnight per $1,000 above the free area (couple combined).
- Income free areas: single $226/fortnight; couple combined $396. Taper 50 cents per dollar for single or combined couple, divided between eligible partners.
- Deeming: 1.75% on first $66,800 single / $110,600 combined couple; 3.75% above.
- Newly commenced qualifying immediate lifetime streams: 60% of payments assessable as income; 60% of original purchase price as assets, stepping to 30% from age 85 or five years after commencement, whichever is later. Individual lifetime streams are assumed for each partner. Current threshold age follows DSS 1.1.T.101, which updates the older age-84 examples still present on some public pages.
- No blanket promise of higher Age Pension from a higher lifetime allocation. Product payments can make the income test bind; high assumed payouts can reduce entitlement.

## Integrated projection

`engine.mjs` projects each year from retirement through age 95. Age Pension is recalculated using opening assets, lifetime purchase-price assessment and other income. When entered, desired income is the starting early-retirement spending budget. Lifetime income, Age Pension and other income are counted first; the residual is funded from actual invested-savings withdrawals, then accessible cash if needed. Each withdrawal is deducted from the projected balance. If no income target is entered, the original LIFE-based draw calculation is used. Later spending reflects the early-lifestyle and later-spending answers.

First-ten-year and later-year headline figures are averages of annual spending. The age-90 balance is opening assets at age 90 from the same cash flows. Known expenses are deducted once at retirement before allocating savings. Savings outside super are included in a proportional invested pool; minimum pension drawdowns apply only to the pension fraction. Excess minimum withdrawals are kept as accessible cash, rather than assumed to be spent. If invested assets become insufficient, cash is used; after accessible assets deplete, spending falls to available lifetime, pension and other income. The UI flags the first shortfall age.

Model assumptions remain deliberately illustrative: 2% real pre-retirement super growth with optional annual contributions after tax (default zero, combined for couples, credited at year end); 3% Growth / 2% Balanced / 1% Conservative net real retirement returns; 0% real cash return; 2.5% inflation. Future pension rates and thresholds are frozen in real terms. Original nominal lifetime purchase price is deflated over retirement for assessment in today's dollars. Lifetime payout defaults to 5.5%, can be adjusted, and assumes CPI indexing. It is neither a quoted product rate nor an investment return. A lifetime payout can include return of purchase capital and longevity pooling.

## Limits

Assumes residence eligibility, retirement from age 60 for both partners and both retired at the same calendar time. Assumes no surrender or death benefits. Higher benefits or capital access can alter lifetime assessment. No Rent Assistance, Work Bonus, grandfathering, tax, transfer balance cap, residency determination, future legislation, investment uncertainty, mortality, defined-benefit rules or actual product pricing. No advice or actuarial validation. Other income is treated as fully assessable income, without product-specific deductions. Annual minimum drawdown timing is approximate rather than a financial-year/date-of-birth calculation.

## Validation

Run `node tests/model.test.mjs`. Tests verify published rate arithmetic, both-test selection, deeming, partner age eligibility, homeowner thresholds, age-85/five-year step-down, higher lifetime income reducing an income-tested pension, allocation constraints, minimum pension rates, and conservation of funds across every projected year. They also check spending averages and the age-90 balance against annual cash flows across multiple profiles and trade-offs.

Optional WebMCP tools are feature-detected. Automated checks do not replace member usability testing or financial model validation.

## Experience revision — 5 October 2026

The mobile Explore view now keeps a compact outcome summary sticky and shows adjustment consequences directly below the active control. The review screen compares the real combined plan against its original starting point, rather than isolated hypothetical slider effects. Income targets are optional; the funding revision below supersedes their previous comparison-only role. Profile edits preserve preferences and exploration positions; editing priorities is an explicit separate action using draft answers until completion. Small effects use material-change wording. Projection periods reflect available years, and no later period is represented by null rather than $0. Zero-capital cases have no invented allocation. Starting-point explanations include actual amounts. The downloaded summary leads with the current priorities and combined changes. Dialog naming, radio keyboard behaviour, readable consequence text and a persistent prototype indicator have been added.

Run `node tests/experience.test.mjs` for source-driven controller and rendering checks. This harness exercises the actual handlers and templates, but does not render layout or replace browser/device/screen-reader testing. The member usability protocol is in `docs/member-usability-check.md`; member testing remains necessary before claiming a perfect experience score.

## Decision support revision — 5 October 2026

Visible stacked income bars show the first year, first estimated Age Pension year, later spending transition and later ages. The annual target is marked separately from period averages. Results lead with lifestyle, continuing income and accessible savings; reserves and projection details expand on demand. Allocation rules and the illustrative investment setting are explained beside the LIFE allocations.

The shortfall dialog recalculates individual alternatives and shows first-year income, early average, remaining gap, accessible capital and money at 90. Applying an alternative preserves other choices. Exhausted controls are omitted. Later retirement is offered only before retirement; it can alter the illustrative investment setting and continues entered contributions. Lowering a target now reduces the spending budget and required withdrawals, as described in the funding revision below.

An expandable sensitivity comparison reduces retirement investment returns by one percentage point each year with unchanged spending preferences. It recalculates Age Pension and cash flows; it is neither a probability range nor modelling of market shocks. Renter and contribution limitations are surfaced at the relevant inputs and outputs. A real Hostplus advice-options link accompanies a personalised conversation checklist; entries are not transmitted. Downloads include key annual incomes, the gap, questions, allocation basis and lower-return results.

Run `node tests/decision-support.test.mjs` as well as the model and experience checks. Current rule inputs are unchanged by this revision.

## Income funding revision — 7 October 2026

An entered target sets the initial first-ten-year total annual budget, rather than merely being compared with an independently generated income. Certainty changes the funding mix; lifetime and Age Pension income replace part of the savings withdrawal instead of being added twice. At each year, required own funding is max(0, planned total less Age Pension, lifetime income and other income). Minimum pension withdrawals exceeding spending are reinvested in cash. If fixed income already exceeds the budget, the full available income is shown. Unfunded amounts are excluded from funded income and explicitly displayed.

Exploration uses simple, disclosed prototype budget adjustments relative to the questionnaire starting positions: early multiplier = 1 + 0.25 × enjoyment change − 0.20 × legacy change − 0.08 × buffer change (changes scaled to −1..1, multiplier clamped to 0.5..1.5). Later multiplier = 1 − 0.20 × legacy change − 0.04 × buffer change, multiplied by later-spending [0.85, 1, 1.15] and early-lifestyle [0.85, 1, 1.10] factors. These are illustrative rules, not advice. More spending early does not automatically lower the later budget; its cost appears in the remaining balance and potential shortfall.

Every annual row records ABP-funded spending, other invested-savings spending, reserve use, Age Pension, lifetime income, other income and shortfall. ABP and other invested savings are attributed using the existing proportional pension share; this remains an approximation. Period funding averages use exactly the headline's years. Largest-remainder $10 rounding makes displayed source amounts add to displayed funded income. Timeline bars include hatched unfunded segments with amounts, and annual funding detail and downloads show the same source breakdown.

Tests include the exact $50,000 = $10,000 lifetime + $20,000 Age Pension + $20,000 ABP example, zero-capital shortfalls, target-driven balance depletion, no-target fallback, cash-flow conservation and displayed rounding reconciliation.
