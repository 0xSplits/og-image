
import { readFileSync } from 'fs';
import type { SplitRecipient } from '@0xsplits/splits-sdk';

import { shortenAddress, shortenEns } from './utils';

const customCss = readFileSync(`${__dirname}/../_stylesheets/custom.css`).toString();
const tailwindCss = readFileSync(`${__dirname}/../_stylesheets/style.css`).toString();

export function getHtml(recipients: SplitRecipient[]) {
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
        <div class="h-full flex">
            <div class="py-32 pl-32 flex flex-col">
                <div>
                    <img class="w-64 h-64" src="https://www.0xsplits.xyz/logo_light.svg" />
                </div>
            </div>
            <div class="flex-grow pt-32 px-32 relative">
                <div class="space-y-14">
                    ${getRecipients(recipients.slice(0, recipients.length == 7 ? 7 : 6))}
                    ${recipients.length > 7 ? `<div class="text-center"> + ${recipients.length-6} more </div>` : ``}
                </div>
            </div>
        </div>
    </body>
</html>`;
}

function getRecipients(recipients: SplitRecipient[]) {
    let recipientDivs = ''

    recipients.map((recipient) => {
        const recipientHtml = getRecipientRow(recipient)
        recipientDivs += recipientHtml
    })

    return recipientDivs
}

function getRecipientRow(recipient: SplitRecipient) {
    const name = recipient.ensName ? shortenEns(recipient.ensName) : shortenAddress(recipient.address)
    return `
        <div class="py-1 flex items-center justify-between">
            <div class="font-tabular">${name}</div>
            <div>${getPercentBar(recipient.percentAllocation)}</div>
        </div>
    `
}

function getPercentBar(percentAllocation: number) {
    // Always set it to at least 1
    const barPercent = Math.max(1, Math.round(percentAllocation))

    return `
        <div class="flex w-[500px] h-8 rounded-full overflow-hidden">
            <div class="bg-blue-400 h-full" style="width:${barPercent}%"></div>
            <div class="bg-gray-200 h-full" style="width:${100-barPercent}%"></div>
        </div>
    `
}
