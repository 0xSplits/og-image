import { IncomingMessage, ServerResponse } from 'http';
import { SplitsClient } from '@0xsplits/splits-sdk';
import { AddressZero } from '@ethersproject/constants'
import { JsonRpcProvider } from '@ethersproject/providers';

import { parseRequest } from './_lib/parser';
import { getScreenshot } from './_lib/chromium';
import { getGenericHtml, getSplitHtml, getWaterfallHtml } from './_lib/template';

const isDev = !process.env.AWS_REGION;
const isHtmlDebug = process.env.OG_HTML_DEBUG === '1';

const providerMap: { [chain: number]: JsonRpcProvider } = {
    1: new JsonRpcProvider(`https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`, 1),
    5: new JsonRpcProvider(`https://eth-goerli.g.alchemy.com/v2/${process.env.GOERLI_ALCHEMY_API_KEY}`, 5),
    10: new JsonRpcProvider(`https://opt-mainnet.g.alchemy.com/v2/${process.env.OPTIMISM_ALCHEMY_API_KEY}`, 10),
    137: new JsonRpcProvider(`https://polygon-mainnet.g.alchemy.com/v2/${process.env.POLYGON_ALCHEMY_API_KEY}`, 137),
    420: new JsonRpcProvider(`https://opt-goerli.g.alchemy.com/v2/${process.env.OPT_GOERLI_ALCHEMY_API_KEY}`, 420),
    42161: new JsonRpcProvider(`https://arb-mainnet.g.alchemy.com/v2/${process.env.ARBITRUM_ALCHEMY_API_KEY}`, 42161),
    80001: new JsonRpcProvider(`https://polygon-mumbai.g.alchemy.com/v2/${process.env.MUMBAI_ALCHEMY_API_KEY}`, 80001),
    421613: new JsonRpcProvider(`https://arb-goerli.g.alchemy.com/v2/${process.env.ARB_GOERLI_ALCHEMY_API_KEY}`, 421613),

    56: new JsonRpcProvider(`https://white-summer-dinghy.bsc.quiknode.pro/${process.env.BSC_QUICKNODE_API_KEY}/`, 56),
    100: new JsonRpcProvider(`https://proud-cold-slug.xdai.quiknode.pro/${process.env.GNOSIS_QUICKNODE_API_KEY}/`, 100),
    250: new JsonRpcProvider(`https://distinguished-light-scion.fantom.quiknode.pro/${process.env.FANTOM_QUICKNODE_API_KEY}/`, 250),
    43114: new JsonRpcProvider(`https://divine-convincing-lambo.avalanche-mainnet.quiknode.pro/${process.env.AVALANCHE_QUICKNODE_API_KEY}/ext/bc/C/rpc`, 43114),
    8453: new JsonRpcProvider(`https://holy-sly-moon.base-mainnet.quiknode.pro/${process.env.BASE_QUICKNODE_API_KEY}/`, 8453),
    
    1313161554: new JsonRpcProvider(`https://aurora-mainnet.infura.io/v3/${process.env.AURORA_INFURA_API_KEY}`, 1313161554),

    7777777: new JsonRpcProvider('https://rpc.zora.energy/', 7777777),
}

const CACHE_TIME_IMMUTABLE_SEC = 60 * 60 * 24 * 7 // 1 week
const CACHE_TIME_MUTABLE_SEC = 60 * 60 // 1 hour
const CACHE_TIME_LIQUID_SPLIT = 60 * 60 // 1 hour

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

        let cacheMaxAge = CACHE_TIME_IMMUTABLE_SEC
        if (account?.type === 'Split') {
            if (account.controller && account.controller !== AddressZero) cacheMaxAge = CACHE_TIME_MUTABLE_SEC
        } else if (account?.type === 'LiquidSplit') {
            cacheMaxAge = CACHE_TIME_LIQUID_SPLIT
        }
        
        const html = account?.type === 'Split' ?
            getSplitHtml(parsedReq.chainId, account.id, account.recipients) :
            account?.type === 'LiquidSplit' ?
            getSplitHtml(parsedReq.chainId, account.id, account.holders) :
            account?.type === 'WaterfallModule' ?
            getWaterfallHtml(parsedReq.chainId, account.id, account.token.symbol, account.tranches) :
            getGenericHtml(parsedReq.accountId)
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
