import core from 'puppeteer-core';
import { getOptions } from './options';
import { FileType } from './types';
let _page: core.Page | null;

async function getPage(isDev: boolean) {
    // This is causing an issue with chart.js. It's only working the first time with a fresh _page.
    // Using the previously generated _page causes the chart to not display for some reason.
    // if (_page) {
    //     return _page;
    // }
    const options = await getOptions(isDev);
    const browser = await core.launch(options);
    _page = await browser.newPage();
    return _page;
}

export async function getScreenshot(html: string, type: FileType, isDev: boolean) {
    console.log('GETTING SCREENSHOT');
    const page = await getPage(isDev);
    console.log(page)
    await page.setViewport({ width: 2048, height: 1170 });
    await page.setContent(html);
    await new Promise(r => setTimeout(r, 5000)); // Sleep to allow chartjs to load
    const file = await page.screenshot({ type });
    return file;
}
