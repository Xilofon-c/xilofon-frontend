# SmartCargo product discussion

A summary of the product questions asked on 26 October 2026 and the team's answers. Answers are lightly edited for spelling. Questions without an answer are marked **Not answered**.

## Core decisions

**C1. What is the BOL: an input, an output, or both?**
The BOL (bill of lading) is an input. We receive it, and based on it we generate the PDF.

**C2. When does a shipment become real?**
When the Generate button is used.

**C3. Can a shipment change after its PDF is printed?**
Yes, it can.

**C4. Is SmartCargo for one company or many?**
At this stage the web app is for one company only.

**C5. Should loaders be strictly read-and-report?**
Yes. Loaders are strictly read-and-report, and New will be removed from the mobile bar.

**C6. Who chooses the role at signup?**
The user does. Everyone is responsible for their own selection.

**C7. Whose layout is the truth: the solver's or the screen's?**
Today the planner generates the layout, which can be sent to the backend and stored without being recalculated, so the saved layout may differ from a newly calculated one. The backend should be responsible for the final layout, so that the PDF, the 3D view, and the loading instructions agree.

**C8. What does "done" look like?**
A shipment is done when the loader confirms that loading is finished. This is a future feature.

## Packing and the load plan

**Q1. Should identical boxes have a quantity?**
Today each row is one box with a quantity of 1, so twenty identical pallets are twenty rows. A quantity field would simplify cargo entry, and the system would expand quantities into individual boxes during packing.

**Q2. Should the plan respect delivery stops?**
Yes, the plan respects delivery stops.

**Q3. Should the solver check weight distribution and axle loads?**
The solver takes axle loads and weight into account.

**Q4. What does "fragile" mean?**
Nothing can be placed on top.

**Q5. Does "tiltable" allow every rotation?**
Yes, it does.

**Q6. Should stacking have a weight limit?**
No.

**Q7. What happens to cargo that doesn't fit?**
The PDF lists the objects that were not loaded.

**Q8. Is the solver deterministic?**
Yes, the same input gives the same layout.

**Q9. What does the user see if solving is slow or fails?**
An error message.

## Trailers

**Q10. Should custom trailers be saved for reuse?**
No, they aren't saved.

**Q11. Should custom trailers get a truck model?**
No, they're drawn as a plain box.

**Q12. Is the imperial units toggle a real feature?**
Yes. The user can work in either imperial or metric.

**Q13. Should the trailer's weight limit be editable?**
Yes, it's editable.

## Import

**Q14. Which file formats should the upload accept?**
PDF, image, Word, Excel, CSV, or TXT, up to 15 MB.

**Q15. Is there a fixed import template?**
No. The program takes what it needs from the file.

**Q16. What happens to rows with missing values?**
A default value is filled in.

**Q17. How are duplicate names handled?**
Duplicates get different names.

## Scan BOL

**Q18. What should the barcode encode?**
**Not answered.**

**Q19. What if the camera isn't available?**
**Not answered.**

**Q20. What happens after a successful scan?**
The shipment's PDF opens.

## Reports

**Q21. Must a report reference a real shipment?**
Yes.

**Q22. What is the report lifecycle?**
A report has three statuses: draft, in process, and complete. The loader closes it when loading is done.

**Q23. Should reports accept attachments?**
PDF only.

**Q24. How does the office learn about new reports?**
There's no notification today. A navigation badge with the number of open reports could be added.

## Account and session

**Q25. Should expired tokens log the user out?**
Yes. The token is stored in `localStorage`, and expiry isn't handled today. An expired session should clear the stored session and send the user to the login page.

**Q26. Should the nav update right after login?**
Yes. Today the nav may show the wrong role until a reload. It should update from the current session.

**Q27. Does the password-reset PIN email actually send?**
It depends on the backend and whether an email service is configured.

## Platform and delivery

**Q28. Should the shipment list paginate?**
**Not answered.**

**Q29. Should loaders be able to work offline?**
**Not answered.**

**Q30. Where does SmartCargo get deployed?**
The backend runs on Google Cloud Run. The frontend is a static site on Netlify.

## Follow-ups from the code

These answers describe how SmartCargo should work, but the code currently behaves differently. Checked against the frontend and `../backend`.

- **C2:** uploading a BOL on Home already saves a shipment, before Generate.
- **C5:** the PDF endpoint accepts requests without a login and saves them as `anonymous`.
- **C7:** the backend stores the planner's layout as sent instead of solving it again.
- **Q1:** the packing engine and BOL import already support quantity. The planner has no quantity field.
- **Q2:** the solver supports stop order (`stop_sequence`), but the planner can't set it.
- **Q3:** axle loads are checked only when the trailer defines its axle data.
- **Q14:** the backend import only reads `.xlsx`, `.xls`, and `.csv`.
- **Q21–Q23:** reports have one status, `open`, don't check that the shipment exists, and have no attachments.
- **Q27:** the backend prints the PIN to the server log and sends no email. The PIN expires after 15 minutes.
