## Catchy Links 🔗
> A catchy link shortener for more memorable urls

## Features 🚀
- Generate urls using [friendly words](https://github.com/glitchdotcom/friendly-words)
- Each url maps to a determinstic shuffled range and is reversable to and from an 32bit int
- No collisions until > 4,294,967,296 (2^32) links have been geneerated
- Urls are locked to your own domain by default
- Rate limiting

## Why 🤷
Sharing long urls sucks. Depending on a third party service hungry for your data does too.  

I wanted to solve the problem of sharing incredibly long urls containing lz-string url encoded source code for the [ts-defold playground](https://ts-defold.dev/playground) site I am hacking on. Once you have crafted a masterpiece in the code playgroud dropping in a full screen URL into discord seems like bad taste. So, this idea was born.

## Setup, Config & Deploy 👷
1. `npm install`
2. Edit `env.local` with *ENV Variables*
3. `npm run boostrap`
4. `npx vercel`
5. Configure *ENV variables* on [Vercel](https://vercel.com/docs/environment-variables)

### ENV Variables ✍️
`FALLBACK_URL` - This url serves two purposes  
1. Locks the url generation to the domain provided
2. Is used when the slug is not found to redirect the user to something more useful than a 404


`REDIS_URL` - The connection info for the backing redis server  

`SENTRY_DNS` - Sentry DNS connection info for error montioring  

`RATE_LIMIT_WINDOW` - Time in milliseconds before the rate limit is reset (globally)  

`RATE_LIMIT_MAX` - Number of hits within `RATE_LIMIT_WINDOW` before rate limit kicks in

`RANDOM_SEED` - Used in the bootstrap script so we all aren't generating the same url sequences

## Specifics 🕴️
Built with ❤️ for 🧑‍🤝‍🧑 on [Next.js](https://nextjs.org), [Upstash](https://upstash.com), and [Sentry](https://sentry.io).  

It is recomended to use Vercel integrations for Upsatash and Sentry, or do what you want, I am not your mother.  

Rate limiting is using (express-rate-limit)[https://www.npmjs.com/package/express-rate-limit] and is not backed by a store.
It is being used as failsafe to protect costs of running the service from someone spaming the URL, and is not strict due to the in memory ip lists running serverless.

Fork if you need a feature, PRs always welcome. 🍻
