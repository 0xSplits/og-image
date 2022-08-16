const MAX_ENS_LENGTH = 20

export const shortenAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const shortenEns = (ens: string): string => {
  if (ens.length <= MAX_ENS_LENGTH) return ens

  return `${ens.slice(0, MAX_ENS_LENGTH - 11)}...${ens.slice(-8)}`
}
