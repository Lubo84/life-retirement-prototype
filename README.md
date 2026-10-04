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

`engine.mjs` projects each year from retirement through age 95. Age Pension is recalculated using opening assets, lifetime purchase-price assessment and other income. Initial discretionary spending is generated from LIFE preferences, not the desired income field; desired income remains a comparison target. Planned own spending is reduced after the first ten years according to LIFE weights and later-life spending preferences.

First-ten-year and later-year headline figures are averages of annual spending. The age-90 balance is opening assets at age 90 from the same cash flows. Known expenses are deducted once at retirement before allocating savings. Savings outside super are included in a proportional invested pool; minimum pension drawdowns apply only to the pension fraction. Excess minimum withdrawals are kept as accessible cash, rather than assumed to be spent. If invested assets become insufficient, cash is used; after accessible assets deplete, spending falls to available lifetime, pension and other income. The UI flags the first shortfall age.

Model assumptions remain deliberately illustrative: 2% real pre-retirement super growth without contributions; 3% Growth / 2% Balanced / 1% Conservative net real retirement returns; 0% real cash return; 2.5% inflation. Future pension rates and thresholds are frozen in real terms. Original nominal lifetime purchase price is deflated over retirement for assessment in today's dollars. Lifetime payout defaults to 5.5%, can be adjusted, and assumes CPI indexing. It is neither a quoted product rate nor an investment return. A lifetime payout can include return of purchase capital and longevity pooling.

## Limits

Assumes residence eligibility, retirement from age 60 for both partners and both retired at the same calendar time. Assumes no surrender or death benefits. Higher benefits or capital access can alter lifetime assessment. No Rent Assistance, Work Bonus, grandfathering, tax, transfer balance cap, residency determination, future legislation, investment uncertainty, mortality, defined-benefit rules or actual product pricing. No advice or actuarial validation. Other income is treated as fully assessable income, without product-specific deductions. Annual minimum drawdown timing is approximate rather than a financial-year/date-of-birth calculation.

## Validation

Run `node tests/model.test.mjs`. Tests verify published rate arithmetic, both-test selection, deeming, partner age eligibility, homeowner thresholds, age-85/five-year step-down, higher lifetime income reducing an income-tested pension, allocation constraints, minimum pension rates, and conservation of funds across every projected year. They also check spending averages and the age-90 balance against annual cash flows across multiple profiles and trade-offs.

Browser visual testing and live WebMCP registration validation were unavailable in the permitted environment. Optional WebMCP tools are feature-detected.

## Experience revision — 5 October 2026

The mobile Explore view now keeps a compact outcome summary sticky and shows adjustment consequences directly below the active control. The review screen compares the real combined plan against its original starting point, rather than isolated hypothetical slider effects. Income targets are visibly optional comparison goals with a plain-language gap and action. Profile edits preserve preferences and exploration positions; editing priorities is an explicit separate action using draft answers until completion. Small effects use material-change wording. Projection periods reflect available years, and no later period is represented by null rather than $0. Zero-capital cases have no invented allocation. Starting-point explanations include actual amounts. The downloaded summary leads with the current priorities and combined changes. Dialog naming, radio keyboard behaviour, readable consequence text and a persistent prototype indicator have been added.

Run `node tests/experience.test.mjs` for source-driven controller and rendering checks. This harness exercises the actual handlers and templates, but does not render layout or replace browser/device/screen-reader testing. The member usability protocol is in `docs/member-usability-check.md`; member testing remains necessary before claiming a perfect experience score.
