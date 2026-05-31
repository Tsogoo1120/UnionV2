/**
 * Maps common English server-action messages to Mongolian for toasts / alerts.
 */
export function mapServerErrorToMn(message: string): string {
  const table: Record<string, string> = {
    "You must be logged in.": "Эхлээд нэвтэрнэ үү.",
    "Not authenticated.": "Эхлээд нэвтэрнэ үү.",
    "Please attach a screenshot of your bank transfer.": "Дансны дэлгэцийн зураг хавсаргана уу.",
    "Only JPEG, PNG, or WebP images are allowed.": "Зөвхөн JPEG, PNG эсвэл WebP зураг хүлээн авна.",
    "File must be under 5 MB.": "Файлын хэмжээ 5 MB-аас их байна.",
    "Image must be JPEG, PNG, or WebP.": "Зураг зөвхөн JPEG, PNG эсвэл WebP байх ёстой.",
    "Image must be under 3 MB.": "Зургийн хэмжээ 3 MB-аас их байна.",
    "Title is required.": "Гарчиг оруулна уу.",
    "Body is required.": "Текст бичнэ үү.",
    "Subscription required.": "Идэвхтэй гишүүнчлэл шаардлагатай.",
    "Test not found.": "Тест олдсонгүй.",
    "Unexpected error.": "Тодорхойгүй алдаа гарлаа. Дахин оролдоно уу.",
  };
  return table[message] ?? message;
}
