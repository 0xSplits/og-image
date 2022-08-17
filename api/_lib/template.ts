
import { readFileSync } from 'fs';
import type { SplitRecipient } from '@0xsplits/splits-sdk';
import { ethers } from 'ethers';

import { shortenAddress, shortenEns } from './utils';

const customCss = readFileSync(`${__dirname}/../_stylesheets/custom.css`).toString();
const tailwindCss = readFileSync(`${__dirname}/../_stylesheets/style.css`).toString();

const MAX_DISPLAY_RECIPIENTS = 6
const MAX_EXTRA_DATA_POINTS = 60

function getHslColor(address: string, jump: number) {
    const hue = ethers.BigNumber.from(address).mod(360).toNumber()
    const jumpedAlpha = (99 - jump) % 100 / 100.0
    return ("hsla(" + hue + ", 88%, 64%, " + jumpedAlpha + ")")
}

export function getHtml(splitId: string, recipients: SplitRecipient[]) {
    const displayRecipients = recipients.slice(0, recipients.length === MAX_DISPLAY_RECIPIENTS ? MAX_DISPLAY_RECIPIENTS : MAX_DISPLAY_RECIPIENTS - 1)
    const extraTextHtml = recipients.length > MAX_DISPLAY_RECIPIENTS ? `<div class="text-[#898989]"> + ${recipients.length - MAX_DISPLAY_RECIPIENTS - 1} more</div>` : ''

    const doughnutData = recipients.slice(0, MAX_DISPLAY_RECIPIENTS + MAX_EXTRA_DATA_POINTS).map((recipient) => recipient.percentAllocation * 100)
    const jumpMultiplier = 100 / doughnutData.length
    const doughnutColors = recipients.slice(0, MAX_DISPLAY_RECIPIENTS + MAX_EXTRA_DATA_POINTS).map((_recipient, index) => "'"  + getHslColor(splitId, index * jumpMultiplier) + "'")


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
            <div class="w-full pt-20 px-44 flex justify-end">
                <img class="w-32 h-32" src="https://www.0xsplits.xyz/logo_light.svg" />
            </div>
            <div class="flex-grow py-32 px-44 flex items-center space-x-32">
                <div class="w-1/3">
                    <canvas class="w-full h-full" id="chartDoughnut"></canvas>
                </div>
                <div class="w-3/5 flex-grow flex flex-col h-full justify-evenly overflow-x-hidden space-y-4">
                    ${getRecipients(displayRecipients)}
                    ${extraTextHtml}
                </div>
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
                borderWidth: 8,
                borderRadius: 0,
                cutout: "56%",
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
        <div class="text-[#222222] flex items-bottom justify-between space-x-4">
            <div>${name}</div>
            <div class="flex-grow border-b-8 mb-3 border-dotted border-gray-200"></div>
            <div class="text-[#898989]">${recipient.percentAllocation.toFixed(0)}%</div>
        </div>
    `
}
