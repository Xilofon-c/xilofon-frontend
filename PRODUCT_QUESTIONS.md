# SmartCargo product questions

Open product decisions found while reading the frontend and `../backend`. Each question has a recommendation. Write `yes` in **Answer** to accept it, or write your own decision.

## Facts checked in the code

- Attaching a file on Home saves a shipment before the user has seen the plan. A later Generate BOL in the planner reuses that id. It overwrites the shipment only if the same user created it; otherwise it creates a new one (`_create_shipment` in `export_api/routes.py`).
- `POST /export/shipments/bol` uses an optional user and records `anonymous` without a token. `POST /export/shipments` is office-only.
- `GET /export/shipments` returns the latest 100 shipments for all users. There's no company or ownership filter. The Home KPIs are computed from that list.
- Loaders see New shipment on the mobile bar, and the backend doesn't stop them from generating a BOL.
- Nav links are read once, when the nav module loads.
- The file pickers offer PDF, images, and Word, but import only reads Excel and CSV.

## Core decisions

These come first. Several later questions depend on them.

### C1. What is the BOL: an input, an output, or both?

Office staff upload a "BOL" (Excel or CSV) to import cargo, and the app also prints its own barcoded "BOL" PDF. These are two documents with one name. In freight, a bill of lading is issued by the shipper or carrier.

**Recommendation:** Rename the upload to "cargo list" or "packing list". Keep "BOL" for the PDF SmartCargo produces.

**Answer:**

### C2. When does a shipment become real?

Attaching a file on Home saves a shipment immediately, so an import the user abandons still appears in everyone's list.

**Recommendation:** Home only imports cargo and opens the planner. Generate BOL in the planner is the one place that saves.

**Answer:**

### C3. Can a shipment change after its BOL is printed?

Regenerating overwrites the same id, so the paper a loader holds stops matching the stored plan.

**Recommendation:** Lock a shipment once its BOL is generated. Edits create a new shipment that references the old one.

**Answer:**

### C4. One company or many?

Every user sees every shipment, and Home says "from all staff".

**Recommendation:** One company for this project. Shared visibility is correct, and multi-tenancy is out of scope.

**Answer:**

### C5. Should loaders be strictly read-and-report?

**Recommendation:** Remove New from the loader mobile bar, require the office role on `POST /export/shipments/bol`, and drop `anonymous`.

**Answer:**

### C6. Who chooses the role?

Anyone can sign up as `office`.

**Recommendation:** Self-selection is acceptable for the demo. Note it as a known limitation.

**Answer:**

### C7. Whose layout is the truth: the solver's or the screen's?

The planner can send its own `layout`, and the backend then stores it instead of re-solving.

**Recommendation:** The solver is authoritative. The client sends cargo and order only, and the backend solves, so the PDF, the 3D view, and the loader all see the same plan.

**Answer:**

### C8. What does "done" look like, and by when?

**Recommendation:** The must-have is the end-to-end flow: office imports cargo, reviews the 3D plan, prints the BOL, then a loader scans the barcode, sees the 3D plan, and reports a problem. Everything else is stretch work. Record the deadline or demo date here.

**Answer:**

## Packing and the load plan

### Q1. Should identical boxes have a quantity?

Each row is one box (`quantity: 1`), so twenty identical pallets mean twenty rows.

**Recommendation:** Add quantity per row, and expand it to individual boxes only at the packing boundary.

**Answer:**

### Q2. Should the plan respect delivery stops?

List order is pack priority. With several drops, the last stop's boxes should go in first, at the front.

**Recommendation:** Not for this project. Single-drop only, with list order as the manual workaround.

**Answer:**

### Q3. Should the solver check weight distribution and axle loads?

Only total weight against max weight is checked.

**Recommendation:** Add a centre-of-gravity warning in the planner and on the PDF, not a hard constraint.

**Answer:**

### Q4. What does "fragile" mean?

It could mean nothing on top, only light items on top, or keep near the doors. The rule isn't written down.

**Recommendation:** Nothing stacked on top. Document it next to the flag.

**Answer:**

### Q5. Does "tiltable" allow every rotation?

**Recommendation:** Non-tiltable boxes may rotate 90° on the floor only. Tiltable boxes may use all 6 orientations.

**Answer:**

### Q6. Should stacking have a weight limit?

"Stackable" is a yes/no flag.

**Recommendation:** Keep the flag, and add a rule that a heavier box never goes on a lighter one.

**Answer:**

### Q7. What happens to cargo that doesn't fit?

**Recommendation:** Allow printing, and list the left-out cargo on the PDF in a "Not loaded" section.

**Answer:**

### Q8. Is the solver deterministic?

Does the same input always give the same layout? Depends on C7.

**Recommendation:** It must be deterministic. Add a backend test for it.

**Answer:**

### Q9. What does the user see if solving is slow or fails?

**Recommendation:** Keep showing the stale layout with a "Recalculating" badge, and show an error banner if the solve fails.

**Answer:**

## Trailers

### Q10. Should custom trailers be saved for reuse?

**Recommendation:** Not for now. Three presets plus custom dimensions are enough for the demo.

**Answer:**

### Q11. Should custom trailers get a mesh?

A custom size is drawn as a plain box.

**Recommendation:** Keep the plain box. It's clearer and honest about the dimensions.

**Answer:**

### Q12. Is the imperial units toggle a real feature?

There's a unit toggle on the trailer form.

**Recommendation:** Remove it and go metric only. The product is European, and it removes a source of conversion bugs.

**Answer:**

### Q13. Should the trailer's weight limit be editable?

One backend path hardcodes `DEFAULT_MAX_WEIGHT_KG`.

**Recommendation:** Max payload always comes from the trailer type, and is editable for custom trailers. Remove the hardcoded default from the request path.

**Answer:**

## Import

### Q14. What should the file pickers accept?

**Recommendation:** Restrict them to `.xlsx`, `.xls`, and `.csv`. Treat OCR import as a separate, later feature.

**Answer:**

### Q15. Is there a fixed import template?

**Recommendation:** Publish a downloadable template and link it beside the upload, while keeping the lenient parser.

**Answer:**

### Q16. What happens to bad rows?

For example, 3 of 40 rows are missing a weight.

**Recommendation:** Import everything. Bad rows show as drafts needing attention, which matches the existing draft-layout behaviour.

**Answer:**

### Q17. How are duplicate names handled?

The backend runs `_unique_names` on the boxes.

**Recommendation:** Make names unique on the client before generating, so the PDF and the screen match.

**Answer:**

## Scan BOL

### Q18. What should the barcode encode?

**Recommendation:** A full URL, `https://…/shipments/<id>`, so both the in-app scanner and the phone's own camera app open the shipment.

**Answer:**

### Q19. What if the camera isn't available?

Permission is denied, or the device has no camera.

**Recommendation:** Show a text field in the same dialog for typing the BOL number.

**Answer:**

### Q20. What happens after a successful scan?

**Recommendation:** Open the 3D view directly, with a Report button on that screen that is prefilled with the BOL number.

**Answer:**

## Reports

### Q21. Must a report reference a real shipment?

**Recommendation:** Validate on the backend, and offer an autocomplete of recent shipments.

**Answer:**

### Q22. What is the report lifecycle?

Reports have a status (`open`). Who closes them, and which statuses exist?

**Recommendation:** Statuses are open, in progress, and resolved. Office users resolve reports with a short resolution note. Loaders only create them.

**Answer:**

### Q23. Should reports accept photos?

**Recommendation:** Allow one to three photos per report. It's high value for loaders on mobile.

**Answer:**

### Q24. How does the office learn about new reports?

**Recommendation:** A nav badge with the open-report count. No email.

**Answer:**

## Account and session

### Q25. Should tokens expire?

The token sits in `localStorage`, and the frontend has no visible expiry handling.

**Recommendation:** Add a global 401 handler in `apiClient` that clears the session and redirects to `/login`.

**Answer:**

### Q26. Should the nav update right after login?

A login in the same tab shows the wrong nav until a reload.

**Recommendation:** Build the nav from the session context, and delete the module-level `readRole()`.

**Answer:**

### Q27. Does the password-reset PIN email actually send?

**Recommendation:** The PIN expires after 10 minutes and allows 5 attempts. If there's no mail provider, log the PIN on the server for the demo and document it.

**Answer:**

## Platform and delivery

### Q28. Should the shipment list paginate?

The list returns at most 100 rows, so the Home KPIs go wrong beyond 100 shipments.

**Recommendation:** Add a small `/export/shipments/stats` endpoint for the KPIs, and cursor pagination for the list.

**Answer:**

### Q29. Should loaders be able to work offline?

**Recommendation:** Out of scope. Show a clear "You're offline" message.

**Answer:**

### Q30. Where does this get deployed?

There's a `dist.zip` and a Cloud SQL proxy.

**Recommendation:** Deploy to GCP (Cloud Run with Cloud SQL, plus static hosting for the frontend), build in CI, and add `dist.zip` to `.gitignore`.

**Answer:**
