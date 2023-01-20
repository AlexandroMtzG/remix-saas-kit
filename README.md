## remix-saas-kit

This is a v0.0.1 of [SaasRock](http://saasrock.com/?ref=AlexandroMtzG/remix-saas-kit) - The One-Man SaaS Framework. [A lot has been added](https://saasrock.com/changelog) since this version. This version is not maintained anymore as we're currently on v0.8.

![SaasRock v0.0.1](https://yahooder.sirv.com/saasfrontends/remix/ss/cover.png)

### Getting started

1. Create the `.env` file and set the following values:

- **DATABASE_URL**
- **REMIX_SESSION_SECRET** - any string
- **REMIX_ADMIN_EMAIL** - this will be your admin user
- **REMIX_ADMIN_PASSWORD** - don't commit your .env file
- **REMIX_STRIPE_SK** - [click here to get the secret key](https://dashboard.stripe.com/test/developers)
- **REMIX_POSTMARK_SERVER_TOKEN** - [create a free email server here](https://account.postmarkapp.com/servers)
- **REMIX_INTEGRATIONS_CONTACT_FORMSPREE** - [create a free form here](https://formspree.io/forms)
- **REMIX_COMPANY_ADDRESS** - used on emails

2. Generate and seed your database. If your using **sqlite** and your database gets messed up, you can always delete the `dev.db` file and run npx prisma db push again.

```
npx prisma migrate dev --name init
```

3. Run the app:

```
yarn
yarn dev
```

4. Log in with your `REMIX_ADMIN_EMAIL` and `REMIX_ADMIN_PASSWORD`.

5. Generate **Stripe products** at `/admin/pricing`.

6. Generate **Postmark email templates** at `/admin/emails`.

7. Sign out.

8. Verify the created Stripe products at the `/pricing` page.

9. Register with a new email at `/register`. You should get a `welcome` email.

10. Click on `Click here to subscribe` and subscribe any plan using **Stripe checkout** (use any [Stripe test card](https://stripe.com/docs/testing#cards)).

11. Click on the sidebar item `Links` and `New link`. Invite your **admin** user (`REMIX_ADMIN_EMAIL`) and its workspace **T1.Workspace 1** or **T1.Workspace 2**. You should get an `workspace link invitation` email, and be redirected to `/app/links/pending`.

12. Sign out, and log in as your **admin** user.

13. Select the invited workspace and click on `1 pending link`.

14. Reject the invitation. You should get a `invitation rejected` email.

15. Sign out, log in as your user registered on **step 9**, and repeat **steps 11, 12 and 13**.

16. Sign out, log in as your **admin** user and accept the invitation. You should get a `invitation accepted` email.

17. Click on the sidebar item `Employees` and `Add employee`. Add 1 or 2.

18. Click on the sidebar item `Contracts` and `New contract`. Set the `name` and `description`, and upload a `PDF file`. Click on `Select signatories and viewers`, select your **admin** user and the user registered on **step 9**. Click on `Select employees` and select 1 or 2. You should get a `new contract` email with the PDF as attachment. Edit or delete the contract if you want.

19. Go to `app/settings/members` and add a new user. You should get an `user invitation` email.

20. Go to `app/settings/workspaces` and `Create`, `Edit` and `Delete` workspaces.

21. That's it!
