import { PLUGIN_ID } from "./pluginId";
import { YearIcon } from "./components/YearIcon";

const name = "year-picker";

export default {
  register(app) {
    app.customFields.register({
      name,
      pluginId: PLUGIN_ID,
      type: "integer",
      intlLabel: {
        id: `${PLUGIN_ID}.${name}.label`,
        defaultMessage: "Year Picker",
      },
      intlDescription: {
        id: `${PLUGIN_ID}.${name}.description`,
        defaultMessage: "Select a year from a dropdown",
      },
      icon: YearIcon,
      components: {
        Input: async () =>
          import("./components/YearPicker").then((module) => ({
            default: module.Input,
          })),
      },
      options: {
        base: [
          {
            sectionTitle: {
              id: `${PLUGIN_ID}.${name}.settings.range`,
              defaultMessage: "Year Range",
            },
            items: [
              {
                name: "options.minYear",
                type: "number",
                intlLabel: {
                  id: `${PLUGIN_ID}.${name}.min-year.label`,
                  defaultMessage: "Minimum Year",
                },
                value: 1900,
              },
              {
                name: "options.maxYear",
                type: "number",
                intlLabel: {
                  id: `${PLUGIN_ID}.${name}.max-year.label`,
                  defaultMessage: "Maximum Year",
                },
                value: new Date().getFullYear() + 10,
              },
            ],
          },
        ],
      },
    });
  },

  bootstrap() {},

  async registerTrads({ locales }) {
    const importedTrads = await Promise.all(
      locales.map((locale) => {
        return import(`./translations/${locale}.json`)
          .then(({ default: data }) => ({ data, locale }))
          .catch(() => ({ data: {}, locale }));
      })
    );

    return Promise.resolve(importedTrads);
  },
};
