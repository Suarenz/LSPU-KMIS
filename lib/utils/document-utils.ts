/**
 * Utility functions for handling document titles and names
 */

/**
 * Cleans a document title by removing the alphanumeric prefix that is added during Colivara processing
 * @param title The original document title that may contain an alphanumeric prefix
 * @returns The cleaned document title with the prefix removed
 * 
 * Example: 
 * Input: "cmicq4gtx0001lvg4tzbcpqgz_QPRO - 3RD QUARTER - JULY TO SEPTEMBER 2025.pdf"
 * Output: "QPRO - 3RD QUARTER - JULY TO SEPTEMBER 2025.pdf"
 */
export function cleanDocumentTitle(title: string): string {
  if (!title) {
    return title;
  }

  // Pattern to match the alphanumeric prefix followed by an underscore
  // This matches the pattern: alphanumeric_string_original_filename
  // The prefix is typically a longer random alphanumeric string (like a UUID), followed by an underscore
  // Then followed by the actual filename that starts with a non-underscore character
  const prefixPattern = /^[a-zA-Z0-9]{10,}_([^_].*)$/;
  
  const match = title.match(prefixPattern);
  
  if (match) {
    // Return the part after the underscore
    return match[1];
  }
  
  // If no match, return the original title
 return title;
}

/**
 * Cleans multiple document titles
 * @param titles Array of document titles to clean
 * @returns Array of cleaned document titles
 */
export function cleanDocumentTitles(titles: string[]): string[] {
  return titles.map(title => cleanDocumentTitle(title));
}