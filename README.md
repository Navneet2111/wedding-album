## Firebase Auth setup

This app now uses Firebase Authentication with email/password login.

1. Create a Firebase project.
2. In Firebase Auth, enable the `Email/Password` sign-in provider.
3. Add your app domain to Firebase authorized domains.
4. Create a Firebase web app and copy the public config values into `.env.local`.
5. Create the family user accounts in Firebase Authentication so they can sign in with email and password.

Use `.env.example` as the template.

## Getting started

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```


Only users created in Firebase Authentication can open `/dashboard`.
