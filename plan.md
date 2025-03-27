# Department of Agriculture Tap Page

This application is accessed by people tapping the NFC chip inside their Department of Agriculture hat. In doing so, they will land on the index route, and from there we will perform 2 checks:

1. Is their tap valid?
- We do this by hitting the `GET /refs/:id` endpoint from the IYK API with `iykRef` query parameter.
  - This will return a JSON response with 3 properties we care about: `isValidRef`, `uid`, and `otp`.
  - If `isValidRef` is `false`, redirect the user to a "tap-invalid" page.
  - If `isValidRef` is `true`, we will continue to the next check.
  - `uid` is the unique identifier for the chip.
  - Documentation for this endpoint can be found at https://docs.iyk.app/api-core/refs, and no API key is needed.

1. Is the reward period active?
- The reward period is active for 10 minutes on Friday (Eastern time) every week, and is triggered by an admin.
- If the reward period is not active, redirect the user to a "reward-not-active" page.
- If the reward is active and the current chip has not claimed for this week yet, redirect the user to a "reward-active-unclaimed" page.
- If the reward is active and the current chip has already claimed for this week, redirect the user to a "reward-active-claimed" page.

### Pages

- `/` (index): The main page where users will be redirected to after tapping their chip.
- `tap-invalid`: The tap was invalid.
- `reward-not-active`: The reward period is not active.
- `reward-active-unclaimed`: The reward period is active and the chip has not claimed for this week yet.
- `reward-claimed-active`: The reward period is active and the chip has already claimed for this week.
- `reward-claimed-inactive`: The reward period has passed and the chip has already claimed for this week.
- `admin`: A password gated page for the admin to start the 10-minute reward period.

The user should not be able to navigate to any of the pages prefixed with `reward` unless they came from a valid tap in the current session. We do this by validating the `iykRef` on the server in the index page, and then setting a cookie with the OTP code.

Whenever the user accesses one of the reward pages, they should be redirected to the index page if they do not have a valid OTP cookie. We check the OTP validity with `GET /otps/:id` from the IYK API, and grab the `uid` from this response to validate the user is on the correct page based on the state of the chip.

### Database

We use Supabase to store the data.

### Assorted TODOs
- Review cookie lifetime for storing OTP
- Implement proper password authentication for the admin page
- Connect wallet + sign message to authenticate user for claiming reward (and use Viem on the backend to validate the address + signature)