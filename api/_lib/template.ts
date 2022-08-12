
import { readFileSync } from 'fs';
import type { SplitRecipient } from '@0xsplits/splits-sdk';

import { shortenAddress } from './utils';

const rglr = readFileSync(`${__dirname}/../_fonts/Inter-Regular.woff2`).toString('base64');
const bold = readFileSync(`${__dirname}/../_fonts/Inter-Bold.woff2`).toString('base64');
const mono = readFileSync(`${__dirname}/../_fonts/Vera-Mono.woff2`).toString('base64');

function getCss() {
    return `
    @font-face {
        font-family: 'Inter';
        font-style:  normal;
        font-weight: normal;
        src: url(data:font/woff2;charset=utf-8;base64,${rglr}) format('woff2');
    }

    @font-face {
        font-family: 'Inter';
        font-style:  normal;
        font-weight: bold;
        src: url(data:font/woff2;charset=utf-8;base64,${bold}) format('woff2');
    }

    @font-face {
        font-family: 'Vera';
        font-style: normal;
        font-weight: normal;
        src: url(data:font/woff2;charset=utf-8;base64,${mono})  format("woff2");
      }

    body {
        background: white;
        background-image: radial-gradient(circle at 25px 25px, lightgray 2%, transparent 0%), radial-gradient(circle at 75px 75px, lightgray 2%, transparent 0%);
        background-size: 100px 100px;
        height: 100vh;
        display: flex;
        text-align: center;
        align-items: center;
        justify-content: center;
    }

    code {
        color: #D400FF;
        font-family: 'Vera';
        white-space: pre-wrap;
        letter-spacing: -5px;
    }

    code:before, code:after {
        content: '\`';
    }

    .logo-wrapper {
        display: flex;
        align-items: center;
        align-content: center;
        justify-content: center;
        justify-items: center;
    }

    .plus {
        color: #BBB;
        font-family: Times New Roman, Verdana;
        font-size: 100px;
    }

    .spacer {
        margin: 150px;
    }

    .emoji {
        height: 1em;
        width: 1em;
        margin: 0 .05em 0 .1em;
        vertical-align: -0.1em;
    }
    
    .heading {
        font-family: 'Inter', sans-serif;
        font-size: '100px';
        font-style: normal;
        color: black;
        line-height: 1.8;
    }

    .header {
        display: flex;
        justify-content: space-between;
    }

    .title-bar {
        text-align: left;
    }

    .logo {
        margin-left: 30px;
    }

    .recipients-section {
        margin-top: 10px;
    }

    .recipient-container {
        display: flex;
        justify-content: space-between;
    }

    .recipient-container > .address {
        display: flex;
    }

    .recipient-container > .percent {
        display: flex;
    }

    .percent-bar {
        display: flex;
        width: 100px;
        margin-right: 5px;
        border: solid black 1px;
        border-radius: 4px;
    }

    .percent-bar > .filled-in {
        background-color: blue;
    }

    .percent-bar > .empty {
        background-color: grey;
    }
    `;
}

export function getHtml(splitId: string, recipients: SplitRecipient[]) {
    return `<!DOCTYPE html>
<html>
    <meta charset="utf-8">
    <title>Split Image</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        ${getCss()}
    </style>
    <body>
        <div>
            <div class="header">
                <div class="title-bar">
                    <div>Split Contract</div>
                    <div>${splitId}</div>
                </div>
                <div>
                    <img class="logo" alt="Splits Logo" src="https://www.0xsplits.com/logo_light.svg" width="30" height="30" />
                </div>
            </div>
            <div class="recipients-section">
                <div>${recipients.length} Recipients</div>
                ${getRecipients(recipients.slice(0, 6))}
            </div>
        </div>
    </body>
</html>`;
}

function getRecipients(recipients: SplitRecipient[]) {
    let recipientDivs = ''

    recipients.map((recipient) => {
        const recipientHtml = getRecipientRow(recipient.address, recipient.percentAllocation)
        recipientDivs += recipientHtml
    })

    return recipientDivs
}

function getRecipientRow(address: string, percentAllocation: number) {
    const icon = 'icon'

    return `
        <div class="recipient-container">
            <div class="address">
                <div>${icon}</div>
                <div>${shortenAddress(address)}</div>
            </div>
            <div class="percent">
                ${getPercentBar(percentAllocation)}
                <div>${percentAllocation}%</div>
            </div>
        </div>
    `
}

function getPercentBar(percentAllocation: number) {
    // Always set it to at least 1
    const barPercent = Math.max(1, Math.round(percentAllocation))

    return `
        <div class="percent-bar">
            <div class="filled-in" style="width:${barPercent}px"></div>
            <div class="empty" style="width:${100-barPercent}px"></div>
        </div>
    `
}
