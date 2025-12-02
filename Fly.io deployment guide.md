# Deploying to Fly.io 🎈

In order to deploy this monorepo to Fly.io, we'll need to deploy it as two separate apps - one for the frontend (`app`) and one for the backend (`jobs`).
There are `fly.toml` files in each directory that should be ready to go.

## The Prerequisites
1. Make sure you have `flyctl` installed - go [here](https://fly.io/docs/flyctl/install/) to install it.
2. Clone this repo to your local machine and navigate to the directory in your terminal - `pwd` should show that you're in `stripe-analytics/`.
3. Create a Fly.io account and log into it through `flyctl` - run `fly auth whoami` to double-check and start the login process if necessary.
4. Create `.env` files for both the `app` and `jobs` directories, using the `.env.example` files.

## The Frontend
1. Go into the `app` directory - `cd app/`.
2. Run `fly launch --dockerfile ./Dockerfile` - you'll be asked if you want to use the settings specified in the `app/fly.toml`. Say yes.
3. You'll be presented with a summary of your app's configuration - it should look something like this:
```sh
We're about to launch your app on Fly.io. Here's what you're getting:

Organization: [Personal org here]       (fly launch defaults to the personal org)
Name:         stripe-analytics-app      (from your fly.toml)
Region:       San Jose, California (US) (from your fly.toml)
App Machines: shared-cpu-1x, 1GB RAM    (from your fly.toml)
Postgres:     <none>                    (not requested)
Redis:        <none>                    (not requested)
Tigris:       <none>                    (not requested)
```
If you'd like to change any of these settings, feel free to hit `y` - the only ones you may want to tweak are the name and the region.

4. Once you're done tweaking any settings, the deployment should start. You'll probably see some warnings related to a lack of the needed env vars, but we can set those in a little bit.

5. Hopefully, the deployment completes successfully and you see something like:
```sh
🎉  SUCCESS! Your app is live and ready to use!  🎉

Visit: https://stripe-analytics-app.fly.dev/
```
If so, let's move on to the backend.

## The Backend
This will be overall pretty similar to the frontend deployment process.
1. Go into the `jobs` directory - `cd jobs/`.
2. Run `fly launch --dockerfile ./Dockerfile` - you'll be asked if you want to use the settings specified in the `jobs/fly.toml`. Say yes.
3. You'll be presented with a summary of your backend app's configuration - unlike before, however, we do want to definitely change one thing, which is using Upstash Redis. Say `y` to make changes, and in the browser window that opens, choose "Upstash for Redis" as a Provider in the "Redis" section. Then click "Confirm".
4. The deploy should start - you should see some Redis related messages that look like this:
```sh
Your database stripe-analytics-jobs-redis is ready. Apps in the personal org can connect to Redis at redis://default:<password>@fly-stripe-analytics-jobs-redis.upstash.io:6379

If you have redis-cli installed, use fly redis connect to get a Redis console.

Your database is billed at $0.20 per 100K commands. If you're using Sidekiq or BullMQ, which poll Redis frequently, consider switching to a fixed-price plan. See https://fly.io/docs/reference/redis/#pricing

Redis database stripe-analytics-jobs-redis is set on stripe-analytics-jobs as the REDIS_URL environment variable
Wrote config file fly.toml
```
Make a note of that Redis connection string - we'll need it for setting env vars later. If you don't see these Redis messages, then you'll need to create the Upstash Redis DB manually. After the deploy, run `fly redis create` to do that.

5. Hopefully, the deploy completes successfully. If so, great - let's keep moving.

## The Database (Fly Managed Postgres)
We've got our NextJS frontend and we've got our backend jobs processor with Redis - now we just need our database up and running. We'll use Fly Managed Postgres for that.

1. Go back to the repo's root directory, `stripe-analytics/`. From there, run `fly mpg create` to create your MPG cluster.
2. Enter a database name (say, `stripe-analytics-db`) and choose the Fly org where your MPG cluster should live - make sure this is the same org that the frontend and backend apps are on (if we haven't changed any settings, it should be our personal one).
3. Choose a region for your cluster - ideally it's as close to our frontend and backend apps as possible. Let's choose `sjc`.
4. Now we need to choose a pricing plan for our cluster - Basic should be fine.
5. Afterwards, the deploy should start. You should see a message indicating that you can see the cluster in the Fly dashboard UI - follow the link to look at the cluster in the browser.
6. Once the cluster state has gone from "Initializing" to "Ready", we're set.

## The Glue (putting it all together)
We're almost done! Now, we need to set the env vars on our apps so that everything talks to each other properly. You can set secrets through the Fly dashboard or through the `flyctl` CLI - just to switch things up, let's do this all in the dashboard.

1. If you're still on your MPG dashboard page, click over to the "Connect" tab and copy the connection string - you can choose either the pooled connection string or the direct connection. The pooled connection string is probably ideal, so copy that one.
2. Now, go to your frontend Fly app in the dashboard (if you didn't change the name, it's `stripe-analytics-app`). Go to the "Secrets" tab and click on "Add Secrets".
3. Paste in all the secrets needed for `app` in the "Add all the secrets!" textbox - it should be something like:
```sh
DATABASE_URL=postgresql://fly-user:<password>@pgbouncer.abcdefg.flympg.net/fly-db
BETTER_AUTH_SECRET=<your-better-auth-secret>
CLIENT_URL=<your app hostname, probably something like https://stripe-analytics-app.fly.dev>
NEXT_PUBLIC_APP_URL=<your app hostname, probably something like https://stripe-analytics-app.fly.dev>
RESEND_KEY=<your-resend-key-here>
REDIS_URL=<your redis url, probably something like redis://default:<password>@fly-<app-name>-redis.upstash.io:6379>
STRIPE_SECRET_ENCRYPTION_KEY=<your-stripe-key>
```
Then click "Set secrets". IMPORTANT: this only "stages" the secrets - the app now needs a re-deployment in order for the app to pick up the new secrets. But don't click "Deploy secrets" here, since we should actually re-run a full deploy in order to run the release_command.
4. Do the same thing with the backend Fly app (`stripe-analytics-jobs`). Go to the Fly dashboard and the "Secrets" tab, then add the secrets. The `REDIS_URL` should already be set, but if it isn't, add it here.
```sh
DATABASE_URL=postgresql://fly-user:<password>@pgbouncer.abcdefg.flympg.net/fly-db
WORKER_CONCURRENCY=3
STRIPE_SECRET_ENCRYPTION_KEY=<your-stripe-key>
REDIS_URL=<your redis url, if it hasn't already been set - probably something like redis://default:<password>@fly-<app-name>-redis.upstash.io:6379>
```

5. Now, we need to set the `NEXT_PUBLIC_APP_URL` as a build argument in our `app/fly.toml`, since NextJS needs that variable at build time. Go to `app/fly.toml`, uncomment the `[build.args]` section, and paste the hostname of the frontend app as the value - https://stripe-analytics-app.fly.dev, if you're using the default name.
6. Now we need to deploy these secrets, and deploy the build argument change for our frontend app, and we also need the database migration to run. Let's fully re-deploy the frontend app. Go to `/app` and run `fly deploy`. This should run the `release_command` defined in the `app/fly.toml`, and set up the database properly, in addition to setting all of those secrets we just staged.
7. Re-deploy the backend app as well - go to `/jobs` and run `fly deploy` to set the secrets we staged for the backend app.
8. Now, navigate to your deployed app in the browser - find the hostname for the frontend app and open it. Try signing up, then pasting in the Stripe key - it should all work.
9. Try going to your Upstash Redis database in your Fly dashboard and data should eventually start populating.
10. You can also go to your Fly MPG database in the Fly dashboard and click over to the "Explore" page - data should populate once you sign up a user. You can see it in the "Tables" tab.

If things aren't working, try looking at the "Logs & Errors" tab in the app's dashboard UI.
