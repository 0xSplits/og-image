import { IncomingMessage, ServerResponse } from 'http';
import { SplitsClient } from '@0xsplits/splits-sdk';
import { AddressZero } from '@ethersproject/constants'
import { AlchemyProvider } from '@ethersproject/providers';

import { parseRequest } from './_lib/parser';
import { getScreenshot } from './_lib/chromium';
import { getSplitHtml, getWaterfallHtml } from './_lib/template';

const isDev = !process.env.AWS_REGION;
const isHtmlDebug = process.env.OG_HTML_DEBUG === '1';

const providerMap: { [key: number] : AlchemyProvider } = {
    1: new AlchemyProvider(1, process.env.ALCHEMY_API_KEY),
    5: new AlchemyProvider(5, process.env.GOERLI_ALCHEMY_API_KEY),
    137: new AlchemyProvider(137, process.env.POLYGON_ALCHEMY_API_KEY),
    80001: new AlchemyProvider(80001, process.env.MUMBAI_ALCHEMY_API_KEY),
}

const CACHE_TIME_IMMUTABLE_SEC = 60 * 60 * 24 * 7 // 1 week
const CACHE_TIME_MUTABLE_SEC = 60 * 60 // 1 hour

export default async function handler(req: IncomingMessage, res: ServerResponse) {
    try {
        const parsedReq = parseRequest(req);
        
        const splitsClient = new SplitsClient({
            chainId: parsedReq.chainId,
            provider: providerMap[parsedReq.chainId],
            ensProvider: providerMap[1],
            includeEnsNames: true,
        })

        const account = await splitsClient.getAccountMetadata({ accountId: parsedReq.accountId })
        if (!account) throw new Error('Account not found');
        let cacheMaxAge = CACHE_TIME_IMMUTABLE_SEC
        if (account.type === 'Split') {
            if (account.controller && account.controller !== AddressZero) cacheMaxAge = CACHE_TIME_MUTABLE_SEC
        }
        
        const html = account.type === 'Split' ? getSplitHtml(account.id, account.recipients) : getWaterfallHtml(account.id, account.token.symbol, account.tranches)
        if (isHtmlDebug) {
            res.setHeader('Content-Type', 'text/html');
            res.end(html);
            return;
        }
        const { fileType, viewportWidth, viewportHeight } = parsedReq;
        const file = await getScreenshot(html, fileType, viewportWidth, viewportHeight, isDev);
        res.statusCode = 200;
        res.setHeader('Content-Type', `image/${fileType}`);
        res.setHeader('Cache-Control', `public, immutable, no-transform, s-maxage=${cacheMaxAge}, max-age=${cacheMaxAge}`);
        res.end(file);
    } catch (e) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/html');
        res.end('<h1>Internal Error</h1><p>Sorry, there was a problem</p>');
        console.error(e);
    }
}
