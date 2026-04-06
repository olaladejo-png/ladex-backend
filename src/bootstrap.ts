import type { Core } from '@strapi/strapi';

const bootstrap = async ({ strapi }: { strapi: Core.Strapi }) => {
    // Set public role permissions for read-only access on all published content
    const publicRole = await strapi
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: 'public' } });

    if (!publicRole) return;

    const contentTypes = [
        'api::carousel.carousel',
        'api::news-event.news-event',
        'api::service.service',
        'api::product-category.product-category',
        'api::product.product',
        'api::partner.partner',
        'api::about-page.about-page',
        'api::global-setting.global-setting',
    ];

    const readActions = ['find', 'findOne'];

    for (const contentType of contentTypes) {
        for (const action of readActions) {
            const permissionExists = await strapi
                .query('plugin::users-permissions.permission')
                .findOne({
                    where: {
                        role: publicRole.id,
                        action: `${contentType}.${action}`,
                    },
                });

            if (!permissionExists) {
                await strapi.query('plugin::users-permissions.permission').create({
                    data: {
                        action: `${contentType}.${action}`,
                        role: publicRole.id,
                    },
                });
            }
        }
    }

    console.log('✅ Public permissions configured for Ladex Group content types');

    // Seed sample data if environment is development
    if (process.env.NODE_ENV === 'development') {
        await seedSampleData(strapi);
    }
};

async function seedSampleData(strapi: Core.Strapi) {
    // Seed Global Settings
    const existingSettings = await strapi.entityService.findMany('api::global-setting.global-setting', {});
    if (!existingSettings || Object.keys(existingSettings).length === 0) {
        await strapi.entityService.create('api::global-setting.global-setting', {
            data: {
                site_name: 'LADEX Group',
                site_tagline: 'Connecting Europe & Africa: Energy, Technology, Agriculture',
                contact_email: 'iyiola@ladexgroup.com',
                contact_phone: '+49 1521 816 2816',
                address: 'Pfaffenhofen, Germany',
                footer_text: '© 2026 LADEX Group International. All rights reserved.',
                linkedin_url: 'https://linkedin.com/company/ladex-group',
                publishedAt: new Date(),
            },
        });
        console.log('✅ Global settings seeded');
    }

    // Seed About Page
    const existingAbout = await strapi.entityService.findMany('api::about-page.about-page', {});
    if (!existingAbout || Object.keys(existingAbout).length === 0) {
        await strapi.entityService.create('api::about-page.about-page', {
            data: {
                hero_tagline: 'Your Reliable Bridge Between Europe and Africa',
                mission: 'To make cross-continental trade easier, faster and more profitable for both European suppliers and African producers.',
                vision: 'To be the most trusted facilitator of sustainable trade and industrial growth between the European and African continents.',
                background: 'Headquartered in Pfaffenhofen, Germany, Ladex Group serves as a professional bridge between Europe and Africa. With deep roots in both Germany and Nigeria, we understand the cultural, commercial and logistical dynamics of doing business across both continents, giving our clients a genuine competitive advantage.',
                objectives: '1. Connect European suppliers with emerging African markets.\n2. Enable African producers to access premium European buyers.\n3. Simplify cross-continental logistics and commercial dynamics.\n4. Drive growth in Energy, Technology, and Agriculture sectors.',
                publishedAt: new Date(),
            },
        });
        console.log('✅ About page seeded');
    }

    // Seed Services
    const existingServices = await strapi.entityService.findMany('api::service.service', {});
    if (!existingServices || (existingServices as any[]).length === 0) {
        const servicesData = [
            {
                title: 'Energy Solutions',
                description: 'Connecting European energy technology with African infrastructure projects to drive sustainable power.',
                icon: 'zap',
                order: 1,
                publishedAt: new Date(),
            },
            {
                title: 'Technology Transfer',
                description: 'Facilitating the export of advanced European machinery and digital solutions to African industrial hubs.',
                icon: 'cpu',
                order: 2,
                publishedAt: new Date(),
            },
            {
                title: 'Agricultural Trade',
                description: 'Linking African agricultural producers with European markets through efficient supply chain management.',
                icon: 'leaf',
                order: 3,
                publishedAt: new Date(),
            }
        ];
        for (const s of servicesData) {
            await strapi.entityService.create('api::service.service', { data: s });
        }
        console.log('✅ Services seeded');
    }

    // Seed Product Categories
    const existingCats = await strapi.entityService.findMany('api::product-category.product-category', {});
    if (!existingCats || (existingCats as any[]).length === 0) {
        const catsData = [
            { name: 'Energy Systems', order: 1, publishedAt: new Date() },
            { name: 'Industrial Technology', order: 2, publishedAt: new Date() },
            { name: 'Agricultural Equipment', order: 3, publishedAt: new Date() },
            { name: 'Sustainable Inputs', order: 4, publishedAt: new Date() }
        ];
        for (const c of catsData) {
            await strapi.entityService.create('api::product-category.product-category', { data: c });
        }
        console.log('✅ Product categories seeded');
    }

    // Seed News
    const existingNews = await strapi.entityService.findMany('api::news-event.news-event', {});
    if (!existingNews || (existingNews as any[]).length === 0) {
        const newsData = [
            {
                title: 'Ladex Group Strengthens Germany-Nigeria Trade Ties',
                excerpt: 'Following our expansion in Pfaffenhofen, Ladex Group deepens its commitment to connecting German engineering with Nigerian industrial demand.',
                body: '<p>Pfaffenhofen, Germany – Ladex Group is proud to announce new trade routes and partnerships that simplify the flow of technology between Europe and Africa...</p>',
                category: 'company',
                date: '2026-02-15',
                is_featured: true,
                slug: 'germany-nigeria-trade-ties',
                publishedAt: new Date(),
            },
            {
                title: 'Sustainable Agriculture: Linking African Producers to Europe',
                excerpt: 'New logistics framework enables African agricultural producers to meet European standards and access premium markets.',
                body: '<p>Our agricultural division has successfully launched a new quality compliance program...</p>',
                category: 'announcement',
                date: '2026-03-10',
                is_featured: false,
                slug: 'sustainable-agriculture-europe',
                publishedAt: new Date(),
            }
        ];
        for (const article of newsData) {
            await strapi.entityService.create('api::news-event.news-event', { data: article as any });
        }
        console.log('✅ News seeded');
    }

    // Seed Partners
    const existingPartners = await strapi.entityService.findMany('api::partner.partner', {});
    if (!existingPartners || (existingPartners as any[]).length === 0) {
        const partnersData = [
            {
                name: 'German Industrial Export Chamber',
                website_url: 'https://example.com',
                description: 'Strategic partner for European machinery export and compliance.',
                order: 1,
                is_active: true,
                partner_type: 'Trade',
                publishedAt: new Date(),
            },
            {
                name: 'African Producers Association',
                website_url: 'https://example.com',
                description: 'Representative body for African agricultural and raw material producers.',
                order: 2,
                is_active: true,
                partner_type: 'Agriculture',
                publishedAt: new Date(),
            }
        ];
        for (const p of partnersData) {
            await strapi.entityService.create('api::partner.partner', { data: p as any });
        }
        console.log('✅ Partners seeded');
    }
}

export default bootstrap;
