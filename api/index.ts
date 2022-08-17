import { IncomingMessage, ServerResponse } from 'http';
import { SplitsClient } from '@0xsplits/splits-sdk';
import { AddressZero } from '@ethersproject/constants'
import { AlchemyProvider } from '@ethersproject/providers';

import { parseRequest } from './_lib/parser';
import { getScreenshot } from './_lib/chromium';
import { getHtml } from './_lib/template';

const isDev = !process.env.AWS_REGION;
const isHtmlDebug = process.env.OG_HTML_DEBUG === '1';
const ensProvider = new AlchemyProvider(undefined, process.env.ALCHEMY_API_KEY);

const CACHE_TIME_IMMUTABLE_SEC = 60 * 60 * 24 * 7 // 1 week
const CACHE_TIME_MUTABLE_SEC = 60 * 60 // 1 hour

export default async function handler(req: IncomingMessage, res: ServerResponse) {
    try {
        const parsedReq = parseRequest(req);
        
        const splitsClient = new SplitsClient({
            chainId: parsedReq.chainId,
            provider: ensProvider,
            includeEnsNames: true,
        })
        const split = await splitsClient.getSplitMetadata({ splitId: parsedReq.splitId })
        if (!split) throw new Error('Split not found');
        const cacheMaxAge = (!split.controller || split.controller === AddressZero) ? CACHE_TIME_IMMUTABLE_SEC : CACHE_TIME_MUTABLE_SEC
        
        const html = getHtml(split.id, split.recipients);
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
