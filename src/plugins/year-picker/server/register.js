"use strict";

module.exports = ({ strapi }) => {
  strapi.customFields.register({
    name: "year-picker",
    plugin: "year-picker",
    type: "integer",
    inputSize: {
      default: 4,
      isResizable: false,
    },
  });
};
