"use strict";

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   */
  async bootstrap({ strapi }) {
    // Basic seed data bootstrap
    try {
      const globalSettingCount = await strapi.db.query('api::global-setting.global-setting').count();
      if (globalSettingCount === 0) {
        await strapi.entityService.create('api::global-setting.global-setting', {
          data: {
            siteName: 'Finzoop',
            tagline: 'Smart Financial Decisions Start Here',
            primaryColor: '#1B4FD8',
            secondaryColor: '#00C896',
            accentColor: '#FF6B35',
            maintenanceMode: false,
            isPublished: true,
            publishedAt: new Date()
          }
        });
        console.log('Seeded Global Settings');
      }

      // We would seed categories, calculators etc here as required.
    } catch (e) {
      console.log('Bootstrap seeding encountered an issue:', e);
    }
  },
};
