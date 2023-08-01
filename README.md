# 0xSplits Open Graph Images

## Local dev
Make sure to have node installed, currently we're using 18. Can find the installation
[here](https://nodejs.org/en/download/). A node version manager can also
be useful, you can read more about it [here](https://github.com/nvm-sh/nvm).

To setup local development, clone down the repo and run:
```bash
yarn install
npm install -g vercel
vercel dev
```

If the vercel installation fails, may need to run it with `sudo` in front.

Create a .env.local file and fill it in with the appropriate values.

If you are having trouble check out [instructions](https://github.com/vercel/og-image/blob/main/CONTRIBUTING.md) in the original repo.

## Editing images
The request is handled in `/api/index.ts`. This is where the splits metadata is fetched.
The template is generated in `/_lib/template.ts`. Any html/css changes should be made there.

## Testing
The easiest way to test locally is to set an environment variable, `OG_HTML_DEBUG` to 1. You can also find the if 
statement using that in `/api/index.ts` and just set it to `if (true) {`. Then once the server is running, go to
http://localhost:3000/0xF8843981e7846945960f53243cA2Fd42a579f719?chainId=1 to view the image. You can swap in any split id. If
you are testing on a chain other than mainnet, be sure to set the appropriate chain id (it will default to mainnet if not included).


## Other
The original repo can be found [here](https://github.com/vercel/og-image).
