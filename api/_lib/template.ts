
import { readFileSync } from 'fs';
import type { SplitRecipient } from '@0xsplits/splits-sdk';
import { ethers } from 'ethers';

import { shortenAddress, shortenEns } from './utils';

const customCss = readFileSync(`${__dirname}/../_stylesheets/custom.css`).toString();
const tailwindCss = readFileSync(`${__dirname}/../_stylesheets/style.css`).toString();

const MAX_DISPLAY_RECIPIENTS = 6
const MAX_EXTRA_DATA_POINTS = 60

function getHslColor(address: string) {
    const hue = ethers.BigNumber.from(address).mod(360).toNumber()
    return ("hsl(" + hue + ", 80%, 64%)")
}

export function getHtml(recipients: SplitRecipient[]) {
    const displayRecipients = recipients.slice(0, recipients.length === MAX_DISPLAY_RECIPIENTS ? MAX_DISPLAY_RECIPIENTS : MAX_DISPLAY_RECIPIENTS - 1)
    const extraTextHtml = recipients.length > MAX_DISPLAY_RECIPIENTS ? `<div class="text-[#898989] text-7xl pl-20"> + ${recipients.length - MAX_DISPLAY_RECIPIENTS - 1} more</div>` : ''

    const doughnutData = recipients.slice(0, MAX_DISPLAY_RECIPIENTS + MAX_EXTRA_DATA_POINTS).map((recipient) => recipient.percentAllocation * 100)
    const doughnutColors = recipients.slice(0, MAX_DISPLAY_RECIPIENTS + MAX_EXTRA_DATA_POINTS).map((recipient) => "'"  + getHslColor(recipient.address) + "'")

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
            <div class="flex-grow py-32 px-48 flex items-center space-x-32">
                <div class="w-2/5">
                    <canvas class="w-full h-full" id="chartDoughnut"></canvas>
                </div>
                <div class="w-3/5 flex-grow flex flex-col h-full justify-evenly overflow-x-hidden space-y-8">
                    ${getRecipients(displayRecipients, doughnutColors.slice(0, displayRecipients.length))}
                    ${extraTextHtml}
                </div>
            </div>
            <div class="w-full px-12 py-10 bg-[#222222] flex items-center space-x-6 text-7xl text-white">
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
                    backgroundColor: [${doughnutColors}]
                },
            ],
        };
    
        const configDoughnut = {
            type: "doughnut",
            data: dataDoughnut,
            options: {
                animation: false,
                events: [],
                borderWidth: 6,
                borderRadius: 12,
                cutout: "16%",
                borderColor: "#FFFFFF",
            },
        };
        
        const chartBar = new Chart(
            document.getElementById("chartDoughnut"),
            configDoughnut
        );
    </script>
</html>`;
}

function getRecipients(recipients: SplitRecipient[], colors: string[]) {
    let recipientDivs = ''

    recipients.map((recipient, index) => {
        const recipientHtml = getRecipientRow(recipient, colors[index])
        recipientDivs += recipientHtml
    })

    return recipientDivs
}

function getRecipientRow(recipient: SplitRecipient, color: string) {
    const name = recipient.ensName ? shortenEns(recipient.ensName) : shortenAddress(recipient.address)
    return `
        <div class="text-[#222222] flex items-center space-x-8">
            <div class="flex-shrink-0 w-12 h-12 rounded-full" style="background-color: ${color.slice(1, -1)}"></div>
            <div>${name}</div>
        </div>
    `
}
