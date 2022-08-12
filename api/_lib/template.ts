
import { readFileSync } from 'fs';
import type { SplitRecipient } from '@0xsplits/splits-sdk';

import { shortenAddress } from './utils';

const customCss = readFileSync(`${__dirname}/../_stylesheets/custom.css`).toString();
const tailwindCss = readFileSync(`${__dirname}/../_stylesheets/style.css`).toString();

export function getHtml(splitId: string, recipients: SplitRecipient[]) {
    return `<!DOCTYPE html>
<html>
    <meta charset="utf-8">
    <title>Split Image</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        ${tailwindCss}
        ${customCss}
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
