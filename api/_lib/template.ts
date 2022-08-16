
import { readFileSync } from 'fs';
import type { SplitRecipient } from '@0xsplits/splits-sdk';

import { shortenAddress, shortenEns } from './utils';

const customCss = readFileSync(`${__dirname}/../_stylesheets/custom.css`).toString();
const tailwindCss = readFileSync(`${__dirname}/../_stylesheets/style.css`).toString();

const DOUGHNUT_BACKGROUND_COLORS = [
    "'#34778C'",
    "'#EC9736'",
    "'#3C7FEA'",
    "'#E75928'",
    "'#58BCED'",
    "'#1E495C'",
    "'#E73956'",
    "'#3E8C7E'",
]

const MAX_DISPLAY_RECIPIENTS = 6
const MAX_EXTRA_DATA_POINTS = 100

export function getHtml(recipients: SplitRecipient[]) {
    const displayRecipients = recipients.slice(0, recipients.length === MAX_DISPLAY_RECIPIENTS ? MAX_DISPLAY_RECIPIENTS : MAX_DISPLAY_RECIPIENTS - 1)
    const extraTextHtml = recipients.length > MAX_DISPLAY_RECIPIENTS ? `<div class="text-gray-400"> + ${recipients.length - MAX_DISPLAY_RECIPIENTS - 1} more </div>` : ''

    const doughnutData = recipients.slice(0, MAX_DISPLAY_RECIPIENTS + MAX_EXTRA_DATA_POINTS).map((recipient) => recipient.percentAllocation * 100)

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
        <div class="h-full flex flex-col relative">
            <div class="flex-grow py-32 px-32 flex items-center space-x-12">
                <div class="w-3/5 flex-grow space-y-8 overflow-x-hidden">
                    ${getRecipients(displayRecipients)}
                    ${extraTextHtml}
                </div>
                <div class="w-2/5">
                    <canvas class="w-full h-full" id="chartDoughnut"></canvas>
                </div>
            </div>
            <div class="w-full px-12 py-10 bg-black flex items-center space-x-6 text-7xl text-white">
                <img class="w-24 h-24" src="https://www.0xsplits.xyz/logo_dark.svg" />
                <div>0xSplits</div>
            </div>
        </div>
    </body>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
        const dataDoughnut = {
            datasets: [
                {
                    data: [${doughnutData}],
                    backgroundColor: [${DOUGHNUT_BACKGROUND_COLORS}]
                },
            ],
        };
    
        const configDoughnut = {
            type: "doughnut",
            data: dataDoughnut,
            options: {
                animation: false,
                events: [],
                borderRadius: 12,
                borderWidth: 6,
                cutout: "56%",
            },
        };
        
        const chartBar = new Chart(
            document.getElementById("chartDoughnut"),
            configDoughnut
        );
    </script>
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
        <div>${name}</div>
    `
}
