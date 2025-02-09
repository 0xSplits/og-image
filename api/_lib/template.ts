
import { readFileSync } from 'fs';
import type { SplitRecipient, WaterfallTranche } from '@0xsplits/splits-sdk';
import { ethers } from 'ethers';

import { MANUAL_NAMING_MAP, isSplitSponsor, shortenAddress, shortenEns } from './utils';

const customCss = readFileSync(`${__dirname}/../_stylesheets/custom.css`).toString();
const tailwindCss = readFileSync(`${__dirname}/../_stylesheets/style.css`).toString();
const medium = readFileSync(`${__dirname}/../_fonts/Inter-Medium.woff2`).toString('base64');

const MAX_DISPLAY_RECIPIENTS = 6
const MAX_EXTRA_DATA_POINTS = 60

function getCss() {
    return `
    @font-face {
        font-family: 'Inter';
        font-style:  normal;
        font-weight: normal;
        src: url(data:font/woff2;charset=utf-8;base64,${medium}) format('woff2');
    }`
}

function getHslColor(address: string, jump: number) {
    const hue = ethers.BigNumber.from(address).mod(360).toNumber()
    const jumpedAlpha = (99 - jump) % 100 / 100.0
    return ("hsla(" + hue + ", 88%, 56%, " + jumpedAlpha + ")")
}

export function getWaterfallHtml(chainId: number, waterfallModuleId: string, tokenSymbol: string, tranches: WaterfallTranche[]) {
    const displayTranches = tranches.slice(0, tranches.length === MAX_DISPLAY_RECIPIENTS ? MAX_DISPLAY_RECIPIENTS : MAX_DISPLAY_RECIPIENTS - 1)
    const extraTextHtml = tranches.length > MAX_DISPLAY_RECIPIENTS ? `<div class="text-[#898989]"> + ${tranches.length - MAX_DISPLAY_RECIPIENTS - 1} more</div>` : ''
    const trancheSum = tranches.reduce((acc, tranche) => {
        if (tranche.size) { return acc + tranche.size}
        return acc
    }, 0)

    return `<!DOCTYPE html>
<html>
    <meta charset="utf-8">
    <title>Waterfall Image</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        ${tailwindCss}
        ${customCss}
        ${getCss()}
    </style>
    <body>
        <div class="py-40 px-40 h-full">
            <div class="absolute top-40 right-40">
                ${drawSplitLogo(waterfallModuleId, 'w-72 h-72')}
            </div>
            <div class="w-full flex flex-col h-full justify-end -space-y-14">
                ${getTrancheRecipients(chainId, displayTranches, tokenSymbol, trancheSum, waterfallModuleId)}
                ${extraTextHtml}
            </div>
        </div>
    </body>
</html>`;
}

function getTrancheRecipients(chainId: number, tranches: WaterfallTranche[], tokenSymbol: string, trancheSum: number, waterfallModuleId: string) {
    let recipientDivs = ''
    const jumpMultiplier = 100 / tranches.length
    tranches.map((tranche, idx) => {
        const trancheColor = getHslColor(waterfallModuleId, idx * jumpMultiplier)
        const recipientHtml = getTrancheRecipientRow(chainId, tranche, tokenSymbol, trancheSum, trancheColor)
        recipientDivs += recipientHtml
    })

    return recipientDivs
}

function getTrancheRecipientRow(chainId: number, tranche: WaterfallTranche, tokenSymbol: string, trancheSum: number, trancheColor: string) {
    const manualEnsName = MANUAL_NAMING_MAP[chainId]?.[tranche.recipientAddress]
    const trancheLeftOffset = tranche.size ? `${tranche.startAmount / trancheSum * 85}%` : `85%`
    const trancheWidth = tranche.size ? `${tranche.size / trancheSum * 85}%` : `15%`
    const trancheSize = tranche.size ?? `Residual`
    const isResidual = !tranche.size
    const symbol = tokenSymbol
    const name = tranche.recipientEnsName ?
        shortenEns(tranche.recipientEnsName)
        : manualEnsName ?
            shortenEns(manualEnsName)
            : shortenAddress(tranche.recipientAddress)

    return `
        <div class="flex flex-col relative">
            <div class="whitespace-nowrap flex flex-col items-center justify-center space-y-2" style="width: ${trancheWidth}; margin-left: ${trancheLeftOffset}">
                <div class="w-full py-16 rounded-xl whitespace-nowrap flex flex-col items-center justify-center" style="background-color: ${trancheColor}">
                    <div class="text-[64px]">${trancheSize}${!isResidual ? ` ${symbol}` : ``}</div>
                </div>
                <div class="text-[#222222] text-[56px]">${name}</div>
            </div>
        </div>
    `
}

export function getSplitHtml(chainId: number, splitId: string, recipients: SplitRecipient[]) {
    const displayRecipients = recipients.slice(0, recipients.length === MAX_DISPLAY_RECIPIENTS ? MAX_DISPLAY_RECIPIENTS : MAX_DISPLAY_RECIPIENTS - 1)
    const extraTextHtml = recipients.length > MAX_DISPLAY_RECIPIENTS ? `<div class="text-[#898989]"> + ${recipients.length - MAX_DISPLAY_RECIPIENTS - 1} more</div>` : ''

    const doughnutData = recipients.slice(0, MAX_DISPLAY_RECIPIENTS + MAX_EXTRA_DATA_POINTS).map((recipient) => recipient.percentAllocation * 100)
    const jumpMultiplier = 100 / doughnutData.length
    const doughnutColors = recipients.slice(0, MAX_DISPLAY_RECIPIENTS + MAX_EXTRA_DATA_POINTS).map((_recipient, index) => "'"  + getHslColor(splitId, index * jumpMultiplier) + "'")
    
    const isSponsor = isSplitSponsor(recipients)

    return `<!DOCTYPE html>
<html>
    <meta charset="utf-8">
    <title>Split Image</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        ${tailwindCss}
        ${customCss}
        ${getCss()}
    </style>
    <body>
        <div class="h-full flex flex-col relative">
            ${
                isSponsor ? 
                `<div class="absolute inset-x-0 text-center text-black text-[68px] tracking-wider py-8 overflow-hidden" style="background-color:${getHslColor(splitId,0)}">OFFICIAL SPLITS SPONSOR</div>` : ""
            }
            <div class="flex-grow py-40 px-40 flex items-center space-x-40">
                <div class="w-2/5 relative">
                    <canvas class="w-full h-full" id="chartDoughnut"></canvas>
                    <div class="absolute inset-x-0 inset-y-0 flex items-center justify-center">
                        ${drawSplitLogo(splitId, 'w-72 h-72')}
                    </div>
                </div>
                <div class="w-3/5 flex-grow flex flex-col h-full justify-center overflow-x-hidden space-y-16">
                    ${getRecipients(chainId, displayRecipients)}
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
                borderWidth: 10,
                borderRadius: 0,
                cutout: "64%",
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

function getRecipients(chainId: number, recipients: SplitRecipient[]) {
    let recipientDivs = ''

    recipients.map((recipient) => {
        const recipientHtml = getRecipientRow(chainId, recipient)
        recipientDivs += recipientHtml
    })

    return recipientDivs
}

function getRecipientRow(chainId: number, recipient: SplitRecipient) {
    const manualEnsName = MANUAL_NAMING_MAP[chainId]?.[recipient.address]
    const name = recipient.ensName ?
        shortenEns(recipient.ensName)
        : manualEnsName ?
            shortenEns(manualEnsName)
            : shortenAddress(recipient.address)
    return `
        <div class="text-[#222222] flex items-bottom justify-between space-x-4">
            <div>${name}</div>
            <div class="flex-grow border-b-8 mb-3 border-dotted border-gray-300"></div>
            <div class="text-[#898989]">${recipient.percentAllocation.toFixed(0)}%</div>
        </div>
    `
}

export function getGenericHtml(address: string) {
    return `<!DOCTYPE html>
<html>
    <meta charset="utf-8">
    <title>Splits Image</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        ${tailwindCss}
        ${customCss}
        ${getCss()}
    </style>
    <body>
        <div class="py-40 px-40 h-full">
            ${drawSplitLogo(address, 'max-h-full mx-auto')}
        </div>
    </body>
</html>`;
}

function drawSplitLogo(address: string, customCss?: string) {
    return `
        <svg class="${customCss ? customCss : ''}" fill="${getHslColor(address, 0)}" viewBox="0 0 1024 1024" stroke="none"  xmlns="http://www.w3.org/2000/svg">
            <path d="M136.043 599.327C184.115 599.327 223.086 560.356 223.086 512.284C223.086 464.212 184.115 425.241 136.043 425.241C87.9704 425.241 49 464.212 49 512.284C49 560.356 87.9704 599.327 136.043 599.327Z" />
            <path d="M337.074 586.27C377.935 586.27 411.06 553.146 411.06 512.284C411.06 471.422 377.935 438.298 337.074 438.298C296.212 438.298 263.087 471.422 263.087 512.284C263.087 553.146 296.212 586.27 337.074 586.27Z" />
            <path d="M538.122 573.214C571.772 573.214 599.052 545.935 599.052 512.284C599.052 478.633 571.772 451.354 538.122 451.354C504.471 451.354 477.192 478.633 477.192 512.284C477.192 545.935 504.471 573.214 538.122 573.214Z" />
            <path d="M739.152 560.158C765.592 560.158 787.026 538.724 787.026 512.284C787.026 485.844 765.592 464.411 739.152 464.411C712.712 464.411 691.279 485.844 691.279 512.284C691.279 538.724 712.712 560.158 739.152 560.158Z" />
            <path d="M940.183 547.101C959.412 547.101 975 531.513 975 512.284C975 493.055 959.412 477.467 940.183 477.467C920.954 477.467 905.366 493.055 905.366 512.284C905.366 531.513 920.954 547.101 940.183 547.101Z" />
            <path d="M236.558 760.373C277.42 760.373 310.545 727.249 310.545 686.387C310.545 645.525 277.42 612.401 236.558 612.401C195.697 612.401 162.572 645.525 162.572 686.387C162.572 727.249 195.697 760.373 236.558 760.373Z" />
            <path d="M437.606 747.317C471.257 747.317 498.536 720.038 498.536 686.387C498.536 652.736 471.257 625.457 437.606 625.457C403.955 625.457 376.676 652.736 376.676 686.387C376.676 720.038 403.955 747.317 437.606 747.317Z" />
            <path d="M638.637 734.261C665.077 734.261 686.51 712.827 686.51 686.387C686.51 659.947 665.077 638.513 638.637 638.513C612.197 638.513 590.763 659.947 590.763 686.387C590.763 712.827 612.197 734.261 638.637 734.261Z" />
            <path d="M839.668 721.204C858.897 721.204 874.485 705.616 874.485 686.387C874.485 667.158 858.897 651.57 839.668 651.57C820.439 651.57 804.851 667.158 804.851 686.387C804.851 705.616 820.439 721.204 839.668 721.204Z" />
            <path d="M337.074 921.403C370.724 921.403 398.003 894.123 398.003 860.473C398.003 826.822 370.724 799.543 337.074 799.543C303.423 799.543 276.144 826.822 276.144 860.473C276.144 894.123 303.423 921.403 337.074 921.403Z" />
            <path d="M538.121 908.346C564.561 908.346 585.995 886.912 585.995 860.473C585.995 834.033 564.561 812.599 538.121 812.599C511.682 812.599 490.248 834.033 490.248 860.473C490.248 886.912 511.682 908.346 538.121 908.346Z" />
            <path d="M739.152 895.29C758.381 895.29 773.969 879.702 773.969 860.473C773.969 841.244 758.381 825.656 739.152 825.656C719.923 825.656 704.335 841.244 704.335 860.473C704.335 879.702 719.923 895.29 739.152 895.29Z" />
            <path d="M236.558 412.167C277.42 412.167 310.545 379.043 310.545 338.181C310.545 297.32 277.42 264.195 236.558 264.195C195.697 264.195 162.572 297.32 162.572 338.181C162.572 379.043 195.697 412.167 236.558 412.167Z" />
            <path d="M437.606 399.111C471.257 399.111 498.536 371.832 498.536 338.181C498.536 304.53 471.257 277.251 437.606 277.251C403.955 277.251 376.676 304.53 376.676 338.181C376.676 371.832 403.955 399.111 437.606 399.111Z" />
            <path d="M638.637 386.055C665.077 386.055 686.51 364.621 686.51 338.181C686.51 311.741 665.077 290.308 638.637 290.308C612.197 290.308 590.763 311.741 590.763 338.181C590.763 364.621 612.197 386.055 638.637 386.055Z" />
            <path d="M839.668 372.998C858.897 372.998 874.485 357.41 874.485 338.181C874.485 318.952 858.897 303.364 839.668 303.364C820.439 303.364 804.851 318.952 804.851 338.181C804.851 357.41 820.439 372.998 839.668 372.998Z" />
            <path d="M337.074 225.008C370.724 225.008 398.003 197.729 398.003 164.078C398.003 130.428 370.724 103.148 337.074 103.148C303.423 103.148 276.144 130.428 276.144 164.078C276.144 197.729 303.423 225.008 337.074 225.008Z" />
            <path d="M538.121 211.952C564.561 211.952 585.995 190.518 585.995 164.078C585.995 137.638 564.561 116.205 538.121 116.205C511.682 116.205 490.248 137.638 490.248 164.078C490.248 190.518 511.682 211.952 538.121 211.952Z" />
            <path d="M739.152 198.895C758.381 198.895 773.969 183.307 773.969 164.078C773.969 144.849 758.381 129.261 739.152 129.261C719.923 129.261 704.335 144.849 704.335 164.078C704.335 183.307 719.923 198.895 739.152 198.895Z" />
        </svg>
    `
}
