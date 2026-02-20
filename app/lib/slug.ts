export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD") // Normalizálja az unicode karaktereket
    .replace(/[\u0300-\u036f]/g, "") // Eltávolítja az ékezetes jeleket
    .replace(/[^a-z0-9\s-]/g, "") // Csak betűk, számok, szóközök és kötőjelek maradnak
    .trim()
    .replace(/\s+/g, "-") // Szóközök helyett kötőjel
    .replace(/-+/g, "-"); // Több egymás utáni kötőjel helyett egy
}

export async function generateUniqueSlug(
  title: string,
  existingSlugCheck: (slug: string) => Promise<boolean>,
  currentSlug?: string,
): Promise<string> {
  const baseSlug = generateSlug(title);

  // Ha a jelenlegi slug megegyezik a base slug-gal, megtartjuk
  if (currentSlug === baseSlug) {
    return baseSlug;
  }

  // Ellenőrizzük hogy a base slug szabad-e
  const baseExists = await existingSlugCheck(baseSlug);
  if (!baseExists) {
    return baseSlug;
  }

  // Ha foglalt, próbálkozunk számozással
  let counter = 2;
  while (counter < 1000) {
    // biztonsági határ
    const numberedSlug = `${baseSlug}-${counter}`;
    const exists = await existingSlugCheck(numberedSlug);
    if (!exists) {
      return numberedSlug;
    }
    counter++;
  }

  // Ha 1000 próbálkozás után sem sikerült, adjunk hozzá random stringet
  return `${baseSlug}-${Math.random().toString(36).substring(2, 8)}`;
}
