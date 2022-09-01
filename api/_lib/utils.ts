const MAX_ENS_LENGTH = 24

export const shortenAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const shortenEns = (ens: string): string => {
  if (ens.length <= MAX_ENS_LENGTH) return ens

  return `${ens.slice(0, MAX_ENS_LENGTH - 11)}...${ens.slice(-8)}`
}

// Make sure to update the map in splits repo as well
export const MANUAL_SPLIT_NAMING_MAP: { [key: string]: string } = {
  '0xF8843981e7846945960f53243cA2Fd42a579f719': 'donations.0xsplits.eth',
  '0xC205dc8D56F9E544e0D9F8142694a61ebEaC65fd': 'theWIPmeetup.eth',
  '0xF29Ff96aaEa6C9A1fBa851f74737f3c069d4f1a9': 'theprotocolguild.eth',
  '0x72B1202c820e4B2F8ac9573188B638866C7D9274': 'bank.quantum.tech',
  '0xBc18CB7be21d7225F85f07408152FBc71f3380c1': 'earth.clients.quantum.tech',
  '0x0D29C0A1d81707c196A064492F575A84015a41d5': 'hydra.clients.quantum.tech',
}
