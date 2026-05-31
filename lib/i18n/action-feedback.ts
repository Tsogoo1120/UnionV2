/**
 * Normalizes common server-action messages for toasts / alerts.
 * The UI is English, so known messages map to clear English copy and any
 * unknown message is passed through unchanged.
 */
export function mapServerErrorToMn(message: string): string {
  const table: Record<string, string> = {
    "You must be logged in.": "Please sign in first.",
    "Not authenticated.": "Please sign in first.",
    "Please attach a screenshot of your bank transfer.": "Please attach a screenshot of your bank transfer.",
    "Only JPEG, PNG, or WebP images are allowed.": "Only JPEG, PNG, or WebP images are allowed.",
    "File must be under 5 MB.": "File must be under 5 MB.",
    "Image must be JPEG, PNG, or WebP.": "Image must be JPEG, PNG, or WebP.",
    "Image must be under 3 MB.": "Image must be under 3 MB.",
    "Title is required.": "Title is required.",
    "Body is required.": "Body is required.",
    "Subscription required.": "An active membership is required.",
    "Test not found.": "Test not found.",
    "Unexpected error.": "Something went wrong. Please try again.",
  };
  return table[message] ?? message;
}
