
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
        <div class="pt-40 px-40 text-6xl space-y-20">
            <div class="flex items-start justify-between">
                <div class="space-y-8">
                    <div class="text-gray-400 text-5xl">Split Contract</div>
                    <div>${splitId}</div>
                </div>
            </div>
            <div class="space-y-8">
                <div class="text-gray-400 text-5xl">Split Recipients (${recipients.length})</div>
                ${getRecipients(recipients.slice(0, 7))}
            </div>
        </div>
        <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-gray-300 h-24"></div>
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
    return `
        <div class="py-1 flex items-center justify-between">
            <div>${shortenAddress(address)}</div>
            <div class="flex items-center space-x-4">
                <div>${getPercentBar(percentAllocation)}</div>
                <div class="w-32 text-5xl">${percentAllocation.toFixed(2)}%</div>
            </div>
        </div>
    `
}

function getPercentBar(percentAllocation: number) {
    // Always set it to at least 1
    const barPercent = Math.max(1, Math.round(percentAllocation))

    return `
        <div class="flex w-80 h-8 rounded-xl overflow-hidden">
            <div class="bg-blue-400 h-full" style="width:${barPercent}%"></div>
            <div class="bg-gray-200 h-full" style="width:${100-barPercent}%"></div>
        </div>
    `
}
