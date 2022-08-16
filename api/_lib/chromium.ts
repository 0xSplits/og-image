import core from 'puppeteer-core';
import { getOptions } from './options';
import { FileType } from './types';
let _page: core.Page | null;

async function getPage(isDev: boolean) {
    if (_page) {
        return _page;
    }
    const options = await getOptions(isDev);
    const browser = await core.launch(options);
    _page = await browser.newPage();
    return _page;
}

export async function getScreenshot(html: string, type: FileType, isDev: boolean) {
    console.log('GETTING SCREENSHOT');
    const page = await getPage(isDev);
    console.log(page)
    console.log(html)
    await page.setViewport({ width: 2048, height: 1170 });
    await page.setContent(html);
    await new Promise(r => setTimeout(r, 5000)); // Sleep to allow chartjs to load
    const file = await page.screenshot({ type });
    return file;
}
