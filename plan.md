# Department of Agriculture Tap Page

This application is accessed by people tapping the NFC chip inside their Department of Agriculture hat. In doing so, they will land on the index route, and from there we will perform 2 checks:

1. Is their tap valid?
- We do this by hitting the `GET /refs/:id` endpoint from the IYK API with `iykRef` query parameter.
  - This will return a JSON response with 2 properties we care about: `isValidRef` and `uid`.
  - If `isValidRef` is `false`, redirect the user to a "tap-invalid" page.
  - If `isValidRef` is `true`, we will continue to the next check.
  - `uid` is the unique identifier for the chip.
  - Documentation for this endpoint can be found at https://docs.iyk.app/api-core/refs, and no API key is needed.

2. Is the reward period active?
- The reward period is active for 10 minutes on Friday (Eastern time) every week, and is triggered by an admin.
- If the reward period is not active, redirect the user to a "reward-not-active" page.
- If the reward is active and the current chip has not claimed for this week yet, redirect the user to a "reward-active-unclaimed" page.
- If the reward is active and the current chip has already claimed for this week, redirect the user to a "reward-active-claimed" page.

### Pages

- `tap-invalid`: The tap was invalid.
- `reward-not-active`: The reward period is not active.
- `reward-active-unclaimed`: The reward period is active and the chip has not claimed for this week yet.
- `reward-claimed-active`: The reward period is active and the chip has already claimed for this week.
- `reward-claimed-inactive`: The reward period has passed and the chip has already claimed for this week.
- `admin`: A password gated page for the admin to start the 10-minute reward period.

### Database

We use Supabase to store the data.