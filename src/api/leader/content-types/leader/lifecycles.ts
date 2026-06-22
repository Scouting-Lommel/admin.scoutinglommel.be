/**
 * Auto-generate the leader slug as "firstname-lastname".
 * Runs when both firstName and lastName are present in the payload.
 */

const generateSlug = (firstName: string, lastName: string): string => {
  const raw = `${firstName}-${lastName}`;

  return raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const setSlugFromNames = (data: Record<string, unknown>) => {
  const firstName = typeof data.firstName === "string" ? data.firstName.trim() : "";
  const lastName = typeof data.lastName === "string" ? data.lastName.trim() : "";

  if (firstName && lastName) {
    data.slug = generateSlug(firstName, lastName);
  }
};

export default {
  async beforeCreate(event) {
    setSlugFromNames(event.params.data);
  },
  async beforeUpdate(event) {
    setSlugFromNames(event.params.data);
  },
};
