# Account-entry package review and security boundary

## Package adaptation

The supplied development package is a separate Next.js application containing an account route and a reusable `AuthForms` component. Its useful design direction is a simple, light card-based account experience with clear **Create Account** and **Log In** choices, user-oriented explanatory copy, buyer onboarding, and distinct administrator controls. Its custom email/password endpoints and direct role-oriented account forms will not be copied into the Anilyfe application because Anilyfe already has a secure integrated OAuth session flow.

## Separate entry points

| Route | Audience | Purpose | Secure behavior |
|---|---|---|---|
| `/account/create` | Standard user | Explain buyer-account creation and begin secure sign-in. | A completed identity sign-in creates or retrieves a standard buyer account. |
| `/account/login` | Standard user | Provide a clear standard user login entry. | Uses the same protected sign-in flow and returns to the marketplace. |
| `/admin/create` | Administrator applicant | Explain how an administrator identity is provisioned. | Does not grant roles or permit public administrator self-registration. A verified owner must assign the existing `admin` role after identity creation. |
| `/admin/login` | Existing administrator | Provide a distinct administrator sign-in entry. | Signs in through the secure shared flow, then checks the role before allowing `/admin` access. |

## Security rule

Administrator creation is not a public sign-up path. A public form that creates its own administrator role would allow account takeover of the marketplace. The two administrator pages therefore provide a separate administrative experience and secure sign-in, but role assignment remains a protected administrative/owner task. Existing user and administrator account records continue to be authenticated by the project’s established OAuth callback, nonce protection, and signed session cookies.

## Preview confirmation

The account-choice hub and separate user and administrator creation/login routes were reviewed on desktop and at a 390-pixel mobile viewport. The hub keeps user and administrator choices distinct. The responsive account cards retain readable role notices, clear Create Account and Log In tabs, and no public path that promises administrator self-registration. The preview environment was already authenticated as the project administrator, so the signed-in confirmation correctly directs that account to Administrator Controls.
