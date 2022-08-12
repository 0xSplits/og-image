import { IncomingMessage } from 'http';
import { parse } from 'url';
import { ParsedRequest } from './types';

export function parseRequest(req: IncomingMessage) {
    console.log('HTTP ' + req.url);
    const { pathname, query } = parse(req.url || '/', true);
    const { chainId } = (query || {});

    if (Array.isArray(chainId)) {
        throw new Error('Expected a single chain')
    }
    
    const splitId = (pathname || '/').slice(1);
    if (!splitId) {
        throw new Error('Split id required')
    }

    const parsedRequest: ParsedRequest = {
        fileType: 'png',
        text: '',
        // theme: theme === 'dark' ? 'dark' : 'light',
        theme: 'light',
        // md: md === '1' || md === 'true',
        md: true,
        fontSize: '96px',
        images: [],
        widths: [],
        heights: [],
        chainId: chainId ? parseInt(chainId) : 1,
        splitId,
    };
    // parsedRequest.images = getDefaultImages(parsedRequest.images, parsedRequest.theme);
    return parsedRequest;
}

// function getArray(stringOrArray: string[] | string | undefined): string[] {
//     if (typeof stringOrArray === 'undefined') {
//         return [];
//     } else if (Array.isArray(stringOrArray)) {
//         return stringOrArray;
//     } else {
//         return [stringOrArray];
//     }
// }

// function getDefaultImages(images: string[], theme: Theme): string[] {
//     const defaultImage = theme === 'light'
//         ? 'https://assets.vercel.com/image/upload/front/assets/design/vercel-triangle-black.svg'
//         : 'https://assets.vercel.com/image/upload/front/assets/design/vercel-triangle-white.svg';

//     if (!images || !images[0]) {
//         return [defaultImage];
//     }
//     if (!images[0].startsWith('https://assets.vercel.com/') && !images[0].startsWith('https://assets.zeit.co/')) {
//         images[0] = defaultImage;
//     }
//     return images;
// }
