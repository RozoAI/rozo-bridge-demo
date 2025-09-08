/**
 * Truncate an address to show first and last characters
 * @param address - The address to truncate
 * @param startChars - Number of characters to show at the start (default: 6)
 * @param endChars - Number of characters to show at the end (default: 4)
 * @returns Truncated address like "G3XYZ1...AB2C"
 */
export function truncateAddress(address: string, startChars = 6, endChars = 4): string {
  if (!address) return ''
  if (address.length <= startChars + endChars + 3) return address
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}

/**
 * Format a Stellar address with proper truncation
 * Stellar addresses are typically 56 characters (G...) or 69 characters (M... for muxed)
 */
export function formatStellarAddress(address: string): string {
  if (!address) return ''
  
  // For mobile or small screens, show less characters
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
  
  if (isMobile) {
    return truncateAddress(address, 4, 4)
  }
  
  // For larger screens, show more characters
  return truncateAddress(address, 8, 6)
}