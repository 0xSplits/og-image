import { SplitRecipient } from "@0xsplits/splits-sdk"

const MAX_ENS_LENGTH = 24

export const shortenAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const shortenEns = (ens: string): string => {
  if (ens.length <= MAX_ENS_LENGTH) return ens

  return `${ens.slice(0, MAX_ENS_LENGTH - 11)}...${ens.slice(-8)}`
}

const SPLITS_DONATION_ADDRESS = // donations.0xsplits.eth
  '0xF8843981e7846945960f53243cA2Fd42a579f719'
const SPLITS_ADDRESS = '0xEc8Bfc8637247cEe680444BA1E25fA5e151Ba342' // 0xsplits.eth

// Make sure to update the map in splits repo as well
export const MANUAL_NAMING_MAP: { [chainId: number]: { [key: string]: string } } = {
  1: {
    [SPLITS_DONATION_ADDRESS]: 'donations.0xsplits.eth',
    '0xC205dc8D56F9E544e0D9F8142694a61ebEaC65fd': 'theWIPmeetup.eth',
    '0xF29Ff96aaEa6C9A1fBa851f74737f3c069d4f1a9': 'theprotocolguild.eth',
    '0x72B1202c820e4B2F8ac9573188B638866C7D9274': 'bank.quantum.tech',
    '0xBc18CB7be21d7225F85f07408152FBc71f3380c1': 'earth.clients.quantum.tech',
    '0x0D29C0A1d81707c196A064492F575A84015a41d5': 'hydra.clients.quantum.tech',
    '0x047ED5b8E8a7eDBd92FAF61f3117cAFE8c529ABb': 'headlesschaos.eth',
    '0x8427e46826a520b1264B55f31fCB5DDFDc31E349': 'liquid.headlesschaos.eth',
    '0xaD30f7EEBD9Bd5150a256F47DA41d4403033CdF0': 'split.airswap.eth',
    [SPLITS_ADDRESS]: '0xsplits.eth',
  },
}

const SPONSORSHIP_THRESHOLD = 0.1

const getSplitSponsorshipPercentage = (recipients: SplitRecipient[]) => {
  return recipients.filter(r => 
      r.address === SPLITS_ADDRESS || r.address === SPLITS_DONATION_ADDRESS
    ).reduce((acc, r) => {
      return (acc + r.percentAllocation)
  }, 0)
}

export const isSplitSponsor: (recipients: SplitRecipient[]) => boolean = (
  split,
) => {
  return getSplitSponsorshipPercentage(split) > SPONSORSHIP_THRESHOLD
}