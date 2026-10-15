# SmartCargo

Load planner for trailer cargo. An office user sets the trailer and the cargo, the packing service places the boxes, and Generate BOL saves the shipment and downloads a barcoded PDF. A loader opens that shipment in 3D, or reports a problem against the BOL number.

The API is the sibling `../backend` app. `VITE_API_URL` defaults to `http://localhost:8000`. It mounts `/data`, `/packing`, and `/export`.

## Roles

Signup chooses `office` or `loader`. The token, role, and profile live in `localStorage`.

- Office nav: Home, Shipments, Report, and New shipment.
- Loader nav: Shipments and Report. Desktop hides New shipment. The mobile bar still has New.
- Every path except `/login`, `/forgot-password`, `/input-pin`, and `/reset-password` requires a token. A missing token sends the visitor to `/login`. A signed-in loader who opens `/` is sent to `/account`.

Nav links are read once, when the nav module loads. A login in the same tab updates them after a reload.

## Plan a load

`/` is the office start. Step 1 is the trailer. Step 2 is an optional BOL file. Continue opens `/shipments/new`.

- Blank trailer and no file: the planner opens on the default European semi-trailer and three sample objects.
- Trailer filled, no file: the planner opens with that trailer.
- A file is attached: import the cargo, generate the BOL PDF, then open the planner with those objects. The id in `BOL-<id>.pdf` is the shipment id.

`/shipments/new` is the planner: cargo list, 3D view, trailer settings.

- Cargo is typed in, reordered, or imported. Each object has length, width, height, weight, and the flags fragile, tiltable, and stackable.
- Presets are European semi-trailer, European trailer, and truck with fixed body. Any other size is custom dimensions, drawn as a box instead of the truck mesh.
- The 3D view follows the packing service when size, weight, flags, or the trailer change. An object without a size and a weight stays on the local draft layout. An object the solver leaves out is marked “Does not fit”.
- List order is pack priority. The first object is placed before the ones below it.
- Generate BOL posts the packing body plus the trailer type id to `POST /export/shipments/bol` and downloads the PDF. That request is what saves the shipment.

BOL import (`POST /data/import/bol`) reads Excel and CSV. The file pickers also offer PDF, images, and Word; those fail at import.

## Review a shipment

`/shipments` lists saved loads for a signed-in user, with search and a Placed / Unplaced filter. Home shows the latest five, and office KPIs from that list. View 3D opens `/shipments/:shipmentId`: the stored plan, the cargo list, and who created it. Selecting a box in the list or in the scene highlights it. This screen shows the stored plan.

Scan BOL, in the header and in the center of the mobile bar, opens the camera on the printed barcode. Decoding that barcode and opening the shipment are later work.

## Report a problem

`/report` requires a signed-in user. The form takes the shipment or BOL number, a problem type (damaged cargo, missing box, load does not match the plan, wrong trailer size, other), and a description. Recent reports sit beside the form.

## Account

Signup on `/login` collects name, surname, email, password, and role, then switches to the login tab. Login stores the token and opens `/account`. The account page edits first name and surname. Email and role stay as stored. Logout is `/logout`.

Password reset is `/forgot-password`, then a 4-digit PIN on `/input-pin`, then `/reset-password`.

## Units

Convert at the API boundary. The planner keeps the trailer interior in metres, and cargo size and weight as centimetre and kilogram strings. Packing and BOL import use centimetres: x across the width, y along the length, z up. The viewport uses metres: x along the length, y up, z across the width.
