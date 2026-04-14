import type { Core } from '@strapi/strapi';
import fs from 'fs';
import path from 'path';

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
        'api::sector.sector',
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

    // Full re-seed: run once with RESEED=true env var, e.g.:
    //   NODE_ENV=development RESEED=true npm run develop
    if (process.env.RESEED === 'true') {
        await reseedAll(strapi);
    }
};

// ─── Shared seed data factories ───────────────────────────────────────────────

function globalSettingsData() {
    return {
        site_name: 'Ladex Group',
        site_tagline: 'Quality Without Compromise. Europe to the World.',
        contact_email: 'sales@ladexgroup.com',
        contact_phone: '+49 1521 816 2816',
        address: 'Pfaffenhofen, Bavaria, Germany',
        footer_text: '© 2026 Ladex Group. All rights reserved.',
        linkedin_url: 'https://linkedin.com/in/iyiola-ladejo',
        twitter_url: 'https://x.com/iyioladejo',
        // Homepage copy
        homepage_tagline: 'Quality Without Compromise. Europe to the World.',
        homepage_intro_1: 'We supply high-quality European equipment and technical solutions for infrastructure and industrial projects worldwide, with a strong focus on Nigeria and West Africa.',
        homepage_intro_2: 'From sourcing to delivery, we provide reliable procurement, logistics coordination, and technical support for engineering-driven industries.',
        whoweare_heading: 'Germany-Based. Global Procurement.',
        whoweare_body_1: 'Ladex Group is a Germany-based procurement and supply company specializing in sourcing high-quality electrical, automation, and industrial equipment from leading European manufacturers. With operations in Germany and Nigeria, we combine direct access to Europe\'s manufacturing eco-system with on-ground technical support and delivery coordination across Africa and other international markets.',
        whoweare_body_2: 'From our base in Bavaria, Germany, the heart of Europe\'s industrial network, we provide reliable sourcing, efficient logistics, and trusted supply solutions to our clients globally.',
        homepage_cta_eyebrow: 'Get Started',
        homepage_cta_heading: 'Ready to Source European Equipment?',
        homepage_cta_body: 'Tell us your requirements, specification and timeline. We handle the rest — from supplier identification to delivery.',
        services_cta_heading: 'Have a Specific Requirement?',
        services_cta_body: 'Contact us with your specification. We will identify the right supplier and provide a competitive quotation.',
        about_cta_heading: 'Ready to Source European Equipment?',
        about_cta_body: 'Share your requirement and specification. Our team will identify the right European supplier and manage the entire procurement process for you.',
        brands_list: 'ABB,Beckhoff,Danfoss,Eaton,Endress+Hauser,Festo,Fluke,Fronius,Hager,Janitza,Lapp Group,Legrand,Megger,OMICRON,Pepperl+Fuchs,Phoenix Contact,Pilz,Rittal,Schneider Electric,Screening Eagle Technologies,Siemens,SKF,SMA Solar,WAGO',
        // Structured components
        how_it_works: [
            { num: '01', title: 'Tell us what you need', description: 'Share your requirement, specification, quantity and delivery timeline.' },
            { num: '02', title: 'We source and quote', description: 'We identify the best European supplier and provide a competitive quotation.' },
            { num: '03', title: 'We deliver', description: 'We manage procurement, export documentation, and shipping to your destination.' },
        ],
        why_us: [
            { icon: 'globe', title: 'Germany Based', description: 'Direct access to European manufacturers and distribution networks' },
            { icon: 'graduation-cap', title: 'Technically Qualified', description: 'MSc in Electrical Engineering' },
            { icon: 'map-pin', title: 'Nigeria Presence', description: 'Operations in Ibadan and Lagos' },
            { icon: 'handshake', title: 'Customer Focus', description: 'End-to-end support from enquiry to delivery' },
            { icon: 'package', title: 'Complete Service', description: 'Sourcing, logistics, and after-sales support' },
        ],
    } as any;
}

function aboutPageData() {
    return {
        hero_tagline: 'Germany-Based. Africa-Focused.',
        mission: 'To bridge the gap between European excellence and global opportunity; delivering premium products, technical expertise and reliable trade solutions to West African and international markets.',
        vision: 'To become the most trusted gateway connecting global businesses with European and American industrial solutions.',
        publishedAt: new Date().toISOString(),
        values: [
            { icon: 'shield', title: 'Integrity', description: 'Genuine products always' },
            { icon: 'gem', title: 'Excellence', description: 'Engineering precision in everything' },
            { icon: 'clock', title: 'Reliability', description: 'Delivering on every promise' },
            { icon: 'handshake', title: 'Partnership', description: 'Growing together with our clients' },
        ],
        objectives_list: [
            { icon: 'globe', title: '', description: 'Supply genuine European equipment directly to industrial clients in Nigeria and West Africa.' },
            { icon: 'trending-up', title: '', description: 'Bridge the gap between European manufacturers and African procurement teams.' },
            { icon: 'wrench', title: '', description: 'Provide end-to-end technical support from specification through commissioning.' },
            { icon: 'truck', title: '', description: 'Manage export logistics, documentation and shipping to minimise lead times.' },
            { icon: 'shield', title: '', description: 'Ensure quality, compliance and accuracy through pre-shipment inspection.' },
            { icon: 'landmark', title: '', description: 'Act as a trusted technical representative for European manufacturers in West Africa.' },
        ],
    } as any;
}

async function seedSampleData(strapi: Core.Strapi) {
    // Seed Global Settings
    const existingSettings = await strapi.entityService.findMany('api::global-setting.global-setting' as any, {});
    if (!existingSettings || (Array.isArray(existingSettings) && existingSettings.length === 0)) {
        await strapi.entityService.create('api::global-setting.global-setting' as any, {
            data: globalSettingsData(),
        });
        console.log('✅ Global settings seeded');
    }

    // Seed About Page
    const existingAbout = await strapi.entityService.findMany('api::about-page.about-page' as any, {});
    if (!existingAbout || (Array.isArray(existingAbout) && existingAbout.length === 0)) {
        await strapi.entityService.create('api::about-page.about-page' as any, {
            data: aboutPageData(),
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

    // Seed Sectors
    const existingSectors = await strapi.entityService.findMany('api::sector.sector' as any, {});
    if (!existingSectors || (existingSectors as any[]).length === 0) {
        const sectorsData = [
            {
                title: 'Oil and Gas',
                slug: 'oil-and-gas',
                icon: 'droplet',
                description: 'We supply instrumentation, safety, and process equipment to upstream and downstream oil and gas operations across Nigeria and West Africa.',
                products: [
                    'Flow meters and level instruments',
                    'Pressure and temperature transmitters',
                    'Safety valves and pressure relief systems',
                    'Control valves and actuators',
                    'Gas detection equipment',
                    'Flare ignition and burner systems',
                    'NDT inspection equipment',
                    'Electrical and instrumentation cables',
                    'Junction boxes and control panels',
                    'Switchgear and motor control centres',
                ],
                order: 1,
                publishedAt: new Date().toISOString(),
            },
            {
                title: 'Power, Electrical & Instrumentation',
                slug: 'power-electrical-instrumentation',
                icon: 'settings',
                description: 'We source and supply a wide range of electrical and instrumentation equipment from leading European manufacturers.',
                products: [
                    'Protection relays and IEDs',
                    'Switchgear — LV, MV and HV',
                    'Power transformers and distribution transformers',
                    'Power quality analysers and meters',
                    'Energy management systems',
                    'Substation automation equipment',
                    'Cables — power, control and instrumentation',
                    'Cable management and containment systems',
                    'UPS systems and battery banks',
                    'Earthing and lightning protection systems',
                ],
                order: 2,
                publishedAt: new Date().toISOString(),
            },
            {
                title: 'Automation and Control Systems',
                slug: 'automation-control-systems',
                icon: 'box',
                description: 'We source industrial automation and control equipment from European manufacturers to support process industries and manufacturing facilities.',
                products: [
                    'Programmable Logic Controllers (PLCs)',
                    'SCADA systems and HMI panels',
                    'Variable speed drives and soft starters',
                    'Industrial sensors and transducers',
                    'Process controllers and regulators',
                    'Field buses and industrial networking equipment',
                    'Motor control centres (MCCs)',
                    'Remote terminal units (RTUs)',
                    'Automation enclosures and control panels',
                    'Industrial communication modules',
                ],
                order: 3,
                publishedAt: new Date().toISOString(),
            },
            {
                title: 'Construction and Infrastructure',
                slug: 'construction-infrastructure',
                icon: 'landmark',
                description: 'We supply high-quality equipment and materials to support civil, structural and infrastructure projects across Nigeria and West Africa.',
                products: [
                    'Generators and power distribution equipment',
                    'Site lighting and temporary power systems',
                    'Electrical installation materials and fittings',
                    'Structural inspection and testing equipment',
                    'Cable management and trunking systems',
                    'Industrial fasteners and fixings',
                    'Safety and PPE equipment',
                    'Survey and measurement instruments',
                    'Concrete testing and monitoring equipment',
                    'Communication and signalling systems',
                ],
                order: 4,
                publishedAt: new Date().toISOString(),
            },
            {
                title: 'Mining and Heavy Engineering',
                slug: 'mining-heavy-engineering',
                icon: 'truck',
                description: 'We supply robust European equipment for mining operations, quarrying, and heavy engineering projects.',
                products: [
                    'NDT equipment — ultrasonic, radiographic and magnetic',
                    'Structural inspection tools',
                    'Explosive atmosphere (ATEX) certified equipment',
                    'Heavy-duty electrical cables and connectors',
                    'Motor control and variable speed drives',
                    'Industrial sensors for harsh environments',
                    'Pump control and monitoring equipment',
                    'Conveyor and material handling instrumentation',
                    'Condition monitoring and vibration analysis tools',
                    'Safety and gas detection systems',
                ],
                order: 5,
                publishedAt: new Date().toISOString(),
            },
            {
                title: 'Agriculture and Agro-processing',
                slug: 'agriculture-agro-processing',
                icon: 'wheat',
                description: 'We facilitate the sourcing and delivery of agricultural inputs and processing equipment from certified European suppliers.',
                products: [
                    'Layers and broiler hatching eggs from certified European hatcheries',
                    'Incubation and hatchery equipment',
                    'Poultry farm automation and ventilation systems',
                    'Feed milling and processing machinery',
                    'Grain storage and handling equipment',
                    'Irrigation and water management systems',
                    'Cold chain and refrigeration equipment',
                    'Agricultural monitoring and control systems',
                    'Technical support and import documentation',
                    'Logistics coordination for perishable goods',
                ],
                order: 6,
                publishedAt: new Date().toISOString(),
            },
        ];
        for (const s of sectorsData) {
            await strapi.entityService.create('api::sector.sector' as any, { data: s as any });
        }
        console.log('✅ Sectors seeded');
    }
}

// ─── Image upload helper ──────────────────────────────────────────────────────

async function uploadImageFile(strapi: Core.Strapi, filePath: string, fileName: string): Promise<number | null> {
    if (!fs.existsSync(filePath)) {
        console.warn(`  ⚠ Image not found: ${filePath}`);
        return null;
    }
    try {
        const mimeType = filePath.endsWith('.png') ? 'image/png' : 'image/jpeg';
        const stat = fs.statSync(filePath);
        const uploaded = await (strapi.plugins as any).upload.services.upload.upload({
            data: {},
            files: {
                path: filePath,
                name: fileName,
                type: mimeType,
                size: stat.size,
            },
        });
        if (uploaded && uploaded.length > 0) {
            console.log(`  ✅ Uploaded ${fileName} → id=${uploaded[0].id}`);
            return uploaded[0].id as number;
        }
    } catch (err: any) {
        console.error(`  ✗ Upload failed for ${fileName}:`, err.message);
    }
    return null;
}

// ─── Full reseed (run once with RESEED=true) ──────────────────────────────────

async function reseedAll(strapi: Core.Strapi) {
    console.log('\n🌱 RESEED=true — running full data + image seed...\n');

    // process.cwd() = ladex-backend root during strapi develop
    const FRONTEND_PUBLIC = path.resolve(process.cwd(), '../ladex-frontend/public');
    const img = (...parts: string[]) => path.join(FRONTEND_PUBLIC, ...parts);

    // ── Global Settings ───────────────────────────────────────────────────────
    // Note: single types return the entity directly (not an array)
    console.log('── Global Settings');
    const settingsEntry: any = await strapi.entityService.findMany('api::global-setting.global-setting' as any, {});
    const settingsId = Array.isArray(settingsEntry) ? settingsEntry[0]?.id : settingsEntry?.id;
    if (settingsId) {
        await strapi.entityService.update('api::global-setting.global-setting' as any, settingsId, {
            data: globalSettingsData(),
        });
        console.log('  ✅ Global settings updated');
    } else {
        await strapi.entityService.create('api::global-setting.global-setting' as any, { data: globalSettingsData() });
        console.log('  ✅ Global settings created');
    }

    // ── About Page ────────────────────────────────────────────────────────────
    console.log('── About Page');
    const aboutEntry: any = await strapi.entityService.findMany('api::about-page.about-page' as any, {});
    const aboutId = Array.isArray(aboutEntry) ? aboutEntry[0]?.id : aboutEntry?.id;
    if (aboutId) {
        await strapi.entityService.update('api::about-page.about-page' as any, aboutId, {
            data: aboutPageData(),
        });
        console.log('  ✅ About page updated');
    } else {
        await strapi.entityService.create('api::about-page.about-page' as any, { data: aboutPageData() });
        console.log('  ✅ About page created');
    }

    // ── Services — delete old, create 5 correct ones ──────────────────────────
    console.log('── Services');
    const oldServices: any[] = await strapi.entityService.findMany('api::service.service' as any, {});
    for (const svc of oldServices) {
        await strapi.entityService.delete('api::service.service' as any, svc.id);
        console.log(`  🗑 Deleted: ${svc.title}`);
    }

    const servicesList = [
        {
            title: 'Equipment Sourcing and Supply',
            slug: 'equipment-sourcing-supply',
            description: 'We source and supply genuine European and American equipment directly to clients in Nigeria and West Africa. Working directly with original manufacturers and authorised distributors, we guarantee authenticity, quality certification and full technical documentation.',
            icon: 'package',
            order: 1,
            imgPath: img('pics', 'services', 'equipment-sourcing-supply.jpeg'),
            imgName: 'service-equipment-sourcing.jpeg',
        },
        {
            title: 'Technical Representation',
            slug: 'technical-representation',
            description: 'We act as a technical partner for European and American manufacturers in Nigeria and West Africa, bridging the gap between manufacturers and end users with pre-sales support, product demonstration and after-sales service coordination.',
            icon: 'handshake',
            order: 2,
            imgPath: img('pics', 'services', 'technical-representation.png'),
            imgName: 'service-technical-representation.png',
        },
        {
            title: 'Engineering Consulting & Project Support',
            slug: 'engineering-consulting',
            description: 'We support infrastructure and industrial projects by coordinating complete equipment solutions — from technical specification writing through procurement, logistics and commissioning.',
            icon: 'settings',
            order: 3,
            imgPath: img('pics', 'services', 'engineering-consultancy.png'),
            imgName: 'service-engineering-consultancy.png',
        },
        {
            title: 'Inspection & Procurement Services',
            slug: 'inspection-procurement',
            description: 'We provide end-to-end inspection and procurement services for clients who require verified sourcing and quality assurance from European markets — from vendor qualification and factory inspection to logistics coordination.',
            icon: 'search',
            order: 4,
            imgPath: img('pics', 'services', 'inspection-procurement-services.png'),
            imgName: 'service-inspection-procurement.png',
        },
        {
            title: 'Logistics & Trade Documentation',
            slug: 'logistics-trade',
            description: 'We coordinate the full logistics chain from European suppliers to Nigerian and West African destinations: shipping, freight forwarding, customs documentation, import permits and last-mile delivery coordination.',
            icon: 'truck',
            order: 5,
            imgPath: img('pics', 'services', 'technical-representation.png'),
            imgName: 'service-logistics-trade.png',
        },
    ];

    for (const svc of servicesList) {
        const imageId = await uploadImageFile(strapi, svc.imgPath, svc.imgName);
        const data: any = {
            title: svc.title,
            slug: svc.slug,
            description: svc.description,
            icon: svc.icon,
            order: svc.order,
            publishedAt: new Date().toISOString(),
        };
        if (imageId) data.image = imageId;
        await strapi.entityService.create('api::service.service' as any, { data });
        console.log(`  ✅ Created: ${svc.title}`);
    }

    // ── Sector Images ─────────────────────────────────────────────────────────
    console.log('── Sector Images');
    const sectors: any[] = await strapi.entityService.findMany('api::sector.sector' as any, { sort: 'order:asc' } as any);

    const sectorImgMap: Record<string, { file: string; name: string }> = {
        'oil-and-gas':                     { file: img('sectors', 'oil-gas.jpg'),          name: 'sector-oil-gas.jpg' },
        'power-electrical-instrumentation': { file: img('sectors', 'power-electrical.jpg'), name: 'sector-power-electrical.jpg' },
        'automation-control-systems':       { file: img('sectors', 'automation.jpg'),        name: 'sector-automation.jpg' },
        'construction-infrastructure':      { file: img('sectors', 'construction.jpg'),      name: 'sector-construction.jpg' },
        'mining-heavy-engineering':         { file: img('sectors', 'mining.jpg'),            name: 'sector-mining.jpg' },
        'agriculture-agro-processing':      { file: img('sectors', 'agriculture.jpg'),       name: 'sector-agriculture.jpg' },
    };

    for (const sector of sectors) {
        const entry = sectorImgMap[sector.slug];
        if (!entry) continue;
        const imageId = await uploadImageFile(strapi, entry.file, entry.name);
        if (imageId) {
            await strapi.entityService.update('api::sector.sector' as any, sector.id, {
                data: { image: imageId } as any,
            });
            console.log(`  ✅ Image attached to sector: ${sector.title}`);
        }
    }

    // ── Team Member Photos ────────────────────────────────────────────────────
    console.log('── Team Member Photos');
    const teamMembers: any[] = await strapi.entityService.findMany('api::team-member.team-member' as any, { sort: 'order:asc' } as any);

    const teamPhotoMap: Record<string, { file: string; name: string }> = {
        'Lekan Ladejo':  { file: img('pics', 'team-lekan.jpg'),  name: 'team-lekan-ladejo.jpg' },
        'Iyiola Ladejo': { file: img('pics', 'team-iyiola.jpg'), name: 'team-iyiola-ladejo.jpg' },
    };

    for (const member of teamMembers) {
        const entry = teamPhotoMap[member.name];
        if (!entry || !fs.existsSync(entry.file)) {
            console.log(`  ⚠ No photo for ${member.name}`);
            continue;
        }
        const imageId = await uploadImageFile(strapi, entry.file, entry.name);
        if (imageId) {
            await strapi.entityService.update('api::team-member.team-member' as any, member.id, {
                data: { image: imageId } as any,
            });
            console.log(`  ✅ Photo attached to: ${member.name}`);
        }
    }

    // ── Carousels ─────────────────────────────────────────────────────────────
    console.log('── Carousels');
    const oldCarousels: any[] = await strapi.entityService.findMany('api::carousel.carousel' as any, {});
    for (const c of oldCarousels) {
        await strapi.entityService.delete('api::carousel.carousel' as any, c.id);
    }

    const carouselsList = [
        {
            title: 'Oil & Gas Operations',
            subtitle: 'Instrumentation, safety and process equipment for upstream and downstream operations across Nigeria and West Africa.',
            link_url: '/sectors#oil-and-gas',
            link_text: 'Explore Oil & Gas',
            order: 1,
            imgPath: img('hero', 'hero_carousel_1.jpg'),
            imgName: 'carousel-1-oil-gas.jpg',
        },
        {
            title: 'Mining & Heavy Engineering',
            subtitle: 'Robust European equipment for mining operations, quarrying and heavy engineering projects.',
            link_url: '/sectors#mining-heavy-engineering',
            link_text: 'Explore Mining',
            order: 2,
            imgPath: img('hero', 'hero_carousel_2.png'),
            imgName: 'carousel-2-mining.png',
        },
        {
            title: 'Manufacturing & Industry',
            subtitle: 'Precision equipment and technical solutions for manufacturing and industrial operations.',
            link_url: '/sectors#automation-control-systems',
            link_text: 'Explore Automation',
            order: 3,
            imgPath: img('hero', 'hero_carousel_3.png'),
            imgName: 'carousel-3-manufacturing.png',
        },
        {
            title: 'Instrumentation & Control',
            subtitle: 'European instrumentation and control systems — delivered to Nigeria and West Africa.',
            link_url: '/sectors#power-electrical-instrumentation',
            link_text: 'Explore Power',
            order: 4,
            imgPath: img('hero', 'hero_carousel_4.jpg'),
            imgName: 'carousel-4-instrumentation.jpg',
        },
    ];

    for (const c of carouselsList) {
        const imageId = await uploadImageFile(strapi, c.imgPath, c.imgName);
        const data: any = {
            title: c.title,
            subtitle: c.subtitle,
            link_url: c.link_url,
            link_text: c.link_text,
            is_active: true,
            order: c.order,
            publishedAt: new Date().toISOString(),
        };
        if (imageId) data.image = imageId;
        await strapi.entityService.create('api::carousel.carousel' as any, { data });
        console.log(`  ✅ Created carousel: ${c.title}`);
    }

    console.log('\n🎉 Full reseed complete!\n');
}

export default bootstrap;
