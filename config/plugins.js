module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: "cloudinary",
      providerOptions: {
        cloud_name: env("CLOUDINARY_NAME"),
        api_key: env("CLOUDINARY_KEY"),
        api_secret: env("CLOUDINARY_SECRET"),
      },
      actionOptions: {
        upload: {},
        delete: {},
      },
    },
  },
  "google-maps": {
    enabled: true,
  },
  navigation: {
    enabled: true,
    config: {
      contentTypes: [
        'api::article.article',
        'api::manual.manual',
        'api::group.group',
        'api::rental-location.rental-location',
      ],
      defaultContentType: 'api::article.article',
      contentTypesNameFields: {
        'api::article.article': ['pageTitle'],
        'api::manual.manual': ['title'],
        'api::group.group': ['pageTitle'],
        'api::rental-location.rental-location': ['pageTitle'],
      },
      pathDefaultFields: {
        'api::article.article': ['slug'],
        'api::manual.manual': ['slug'],
        'api::group.group': ['slug'],
        'api::rental-location.rental-location': ['slug'],
      },
      allowedLevels: 2,
    },
  },
});
