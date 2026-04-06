import type { Core } from '@strapi/strapi';

const bootstrap = async ({ strapi }: { strapi: Core.Strapi }) => {
    // Set public role permissions for read-only access on all published content
    const publicRole = await strapi
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: 'public' } });

    if (!publicRole) return;

    // Read-only content types
    const readContentTypes = [
        'api::carousel.carousel',
        'api::service.service',
        'api::team-member.team-member',
        'api::about-page.about-page',
        'api::global-setting.global-setting',
    ];

    for (const contentType of readContentTypes) {
        for (const action of ['find', 'findOne']) {
            const exists = await strapi.query('plugin::users-permissions.permission')
                .findOne({ where: { role: publicRole.id, action: `${contentType}.${action}` } });
            if (!exists) {
                await strapi.query('plugin::users-permissions.permission').create({
                    data: { action: `${contentType}.${action}`, role: publicRole.id },
                });
            }
        }
    }

    // Allow public to CREATE contact messages (write-only, no find/findOne)
    const contactCreateAction = 'api::contact-message.contact-message.create';
    const contactPermExists = await strapi.query('plugin::users-permissions.permission')
        .findOne({ where: { role: publicRole.id, action: contactCreateAction } });
    if (!contactPermExists) {
        await strapi.query('plugin::users-permissions.permission').create({
            data: { action: contactCreateAction, role: publicRole.id },
        });
    }

    console.log('✅ Public permissions configured for Ladex Group content types');

    // Seed sample data if environment is development
    if (process.env.NODE_ENV === 'development') {
        await seedSampleData(strapi);
    }
};

async function seedSampleData(strapi: Core.Strapi) {
    // Seed Global Settings
    const existingSettings = await strapi.entityService.findMany('api::global-setting.global-setting' as any, {});
    if (!existingSettings || (Array.isArray(existingSettings) && existingSettings.length === 0)) {
        await strapi.entityService.create('api::global-setting.global-setting' as any, {
            data: {
                site_name: 'Ladex Group',
                site_tagline: 'Europe to Africa: Equipment & Technical Support',
                contact_email: 'sales@ladexgroup.com',
                contact_phone: '+49 1521 816 2816',
                address: 'Pfaffenhofen, Germany',
                footer_text: '© 2026 Ladex Group. All rights reserved.',
                linkedin_url: 'https://linkedin.com/company/ladexgroup',
                publishedAt: new Date().toISOString(),
            },
        });
        console.log('✅ Global settings seeded');
    }

    // Seed About Page
    const existingAbout = await strapi.entityService.findMany('api::about-page.about-page' as any, {});
    if (!existingAbout || (Array.isArray(existingAbout) && existingAbout.length === 0)) {
        await strapi.entityService.create('api::about-page.about-page' as any, {
            data: {
                hero_tagline: 'Germany-Based. Africa-Focused.',
                mission: 'To bridge the gap between European excellence and African opportunity by delivering premium products, technical expertise and reliable trade solutions to Nigeria and West African markets.',
                vision: 'To be the most trusted bridge between European manufacturers and African industrial sectors, defined by our commitment to quality, technical precision, and operational excellence.',
                publishedAt: new Date().toISOString(),
            },
        });
        console.log('✅ About page seeded');
    }

    // Seed Services
    const existingServices = await strapi.entityService.findMany('api::service.service' as any, {});
    if (!existingServices || (existingServices as any[]).length === 0) {
        const servicesData = [
            {
                title: 'Equipment Sourcing and Supply',
                description: 'We source and supply genuine European and American equipment directly to clients in Nigeria and West Africa.',
                icon: 'package',
                order: 1,
                publishedAt: new Date().toISOString(),
            },
            {
                title: 'Technical Representation',
                description: 'We act as a technical partner for European and American manufacturers in Nigeria and West Africa.',
                icon: 'handshake',
                order: 2,
                publishedAt: new Date().toISOString(),
            },
            {
                title: 'Engineering Consulting & Project Support',
                description: 'We support infrastructure and industrial projects by coordinating complete equipment solutions.',
                icon: 'settings',
                order: 3,
                publishedAt: new Date().toISOString(),
            }
        ];
        for (const s of servicesData) {
            await strapi.entityService.create('api::service.service' as any, { data: s });
        }
        console.log('✅ Services seeded');
    }

    // Seed Team
    const existingTeam = await strapi.entityService.findMany('api::team-member.team-member' as any, {});
    if (!existingTeam || (existingTeam as any[]).length === 0) {
        const teamData = [
            {
                name: 'Lekan Ladejo',
                role: 'Founder & Chairman',
                bio: 'Engr. Lekan Ladejo has over 30 years of engineering experience in Nigeria.',
                location: 'Nigeria',
                flag: '🇳🇬',
                order: 1,
                publishedAt: new Date().toISOString(),
            },
            {
                name: 'Iyiola Ladejo',
                role: 'Director, European Operations',
                bio: 'Based in Munich Area, Germany, he oversees European procurement and supplier relations.',
                location: 'Munich Area, Germany',
                flag: '🇩🇪',
                order: 2,
                publishedAt: new Date().toISOString(),
            }
        ];
        for (const tm of teamData) {
            await strapi.entityService.create('api::team-member.team-member' as any, { data: tm });
        }
        console.log('✅ Team seeded');
    }
}

export default bootstrap;
