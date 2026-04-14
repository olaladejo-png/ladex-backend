/**
 * Full seed script for Ladex Group local database.
 * Run with: npx ts-node --project tsconfig.json -e "require('./scripts/seed-all')"
 * Or via: node -r ts-node/register scripts/seed-all.ts
 *
 * Actually designed to run via Strapi shell:
 *   strapi console (then paste) OR
 *   load strapi and call seedAll(strapi)
 */

import path from 'path';
import fs from 'fs';
import FormData from 'form-data';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UploadedFile {
    id: number;
    url: string;
    name: string;
}

// ─── Image uploader ───────────────────────────────────────────────────────────

async function uploadImage(strapi: any, filePath: string, fileName: string): Promise<UploadedFile | null> {
    try {
        if (!fs.existsSync(filePath)) {
            console.warn(`  ⚠ Image not found: ${filePath}`);
            return null;
        }
        const fileBuffer = fs.readFileSync(filePath);
        const mimeType = filePath.endsWith('.png') ? 'image/png'
            : filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') ? 'image/jpeg'
            : 'image/jpeg';
        const uploadedFiles = await strapi.plugins.upload.services.upload.upload({
            data: {},
            files: {
                path: filePath,
                name: fileName,
                type: mimeType,
                size: fileBuffer.length,
            },
        });
        if (uploadedFiles && uploadedFiles.length > 0) {
            const f = uploadedFiles[0];
            console.log(`  ✅ Uploaded: ${fileName} → id=${f.id}`);
            return f;
        }
        return null;
    } catch (err: any) {
        console.error(`  ✗ Failed to upload ${fileName}:`, err.message);
        return null;
    }
}

// ─── Public path resolver ─────────────────────────────────────────────────────

const FRONTEND_PUBLIC = path.resolve(__dirname, '../../ladex-frontend/public');

function img(relPath: string): string {
    return path.join(FRONTEND_PUBLIC, relPath);
}

// ─── Main seed ────────────────────────────────────────────────────────────────

export async function seedAll(strapi: any) {
    console.log('\n🚀 Starting full Ladex Group seed...\n');

    // ── 1. Global Settings ────────────────────────────────────────────────────
    console.log('── 1. Global Settings');
    const existingSettings: any[] = await strapi.entityService.findMany('api::global-setting.global-setting' as any, {});
    if (existingSettings && existingSettings.length > 0) {
        const docId = existingSettings[0].documentId;
        await strapi.documents('api::global-setting.global-setting' as any).update({
            documentId: docId,
            data: {
                site_name: 'Ladex Group',
                site_tagline: 'Europe to Africa: Equipment & Technical Support',
                contact_email: 'sales@ladexgroup.com',
                contact_phone: '+49 1521 816 2816',
                address: 'Pfaffenhofen, Bavaria, Germany',
                footer_text: '© 2026 Ladex Group. All rights reserved.',
                linkedin_url: 'http://linkedin.com/in/iyiola-ladejo',
                twitter_url: 'https://x.com/iyioladejo',
            } as any,
        });
        console.log('  ✅ Updated global settings');
    }

    // ── 2. About Page ─────────────────────────────────────────────────────────
    console.log('── 2. About Page');
    const existingAbout: any[] = await strapi.entityService.findMany('api::about-page.about-page' as any, {});
    if (existingAbout && existingAbout.length > 0) {
        const docId = existingAbout[0].documentId;
        await strapi.documents('api::about-page.about-page' as any).update({
            documentId: docId,
            data: {
                hero_tagline: 'Germany-Based. Africa-Focused.',
                mission: 'To bridge the gap between European excellence and African opportunity by delivering premium products, technical expertise and reliable trade solutions to Nigeria and West African markets.',
                vision: 'To be the most trusted bridge between European manufacturers and African industrial sectors, defined by our commitment to quality, technical precision, and operational excellence.',
            } as any,
        });
        console.log('  ✅ Updated about page');
    }

    // ── 3. Services ──────────────────────────────────────────────────────────
    console.log('── 3. Services');
    const existingServices: any[] = await strapi.entityService.findMany('api::service.service' as any, {});
    // Delete old wrong services
    for (const svc of existingServices) {
        await strapi.entityService.delete('api::service.service' as any, svc.id);
        console.log(`  🗑 Deleted old service: ${svc.title}`);
    }

    const serviceImageMap: Record<string, string> = {
        'equipment-sourcing-supply': img('pics/services/equipment-sourcing-supply.jpeg'),
        'technical-representation': img('pics/services/technical-representation.png'),
        'engineering-consulting': img('pics/services/engineering-consultancy.png'),
        'inspection-procurement': img('pics/services/inspection-procurement-services.png'),
        'logistics-trade': img('pics/services/technical-representation.png'), // fallback
    };

    const servicesData = [
        {
            slug: 'equipment-sourcing-supply',
            title: 'Equipment Sourcing and Supply',
            description: 'We source and supply genuine European and American equipment directly to clients in Nigeria and West Africa. Working directly with original manufacturers and authorised distributors, we guarantee authenticity, quality certification and full technical documentation for every product we supply.',
            icon: 'package',
            order: 1,
            imageKey: 'equipment-sourcing-supply',
        },
        {
            slug: 'technical-representation',
            title: 'Technical Representation',
            description: 'We act as a technical partner for European and American manufacturers in Nigeria and West Africa, bridging the gap between manufacturers and end users. We provide pre-sales technical support, product demonstration, after-sales service coordination and in-country liaison.',
            icon: 'handshake',
            order: 2,
            imageKey: 'technical-representation',
        },
        {
            slug: 'engineering-consulting',
            title: 'Engineering Consulting & Project Support',
            description: 'We support infrastructure and industrial projects by coordinating complete equipment solutions — from technical specification writing through procurement, logistics and commissioning. Our engineering background ensures we understand the technical demands of every project.',
            icon: 'settings',
            order: 3,
            imageKey: 'engineering-consulting',
        },
        {
            slug: 'inspection-procurement',
            title: 'Inspection & Procurement Services',
            description: 'We provide end-to-end inspection and procurement services for clients who require verified sourcing and quality assurance from European markets. From vendor qualification and factory inspection to logistics coordination and documentation, we manage every step.',
            icon: 'search',
            order: 4,
            imageKey: 'inspection-procurement',
        },
        {
            slug: 'logistics-trade',
            title: 'Logistics & Trade Documentation',
            description: 'We coordinate the full logistics chain from European suppliers to Nigerian and West African destinations. Our services cover shipping, freight forwarding, customs documentation, import permits and last-mile delivery coordination, simplifying the trade process end to end.',
            icon: 'truck',
            order: 5,
            imageKey: 'logistics-trade',
        },
    ];

    for (const svc of servicesData) {
        const imgFile = await uploadImage(strapi, serviceImageMap[svc.imageKey], `service-${svc.slug}.${serviceImageMap[svc.imageKey].endsWith('.png') ? 'png' : 'jpeg'}`);
        const data: any = {
            title: svc.title,
            slug: svc.slug,
            description: svc.description,
            icon: svc.icon,
            order: svc.order,
            publishedAt: new Date().toISOString(),
        };
        if (imgFile) data.image = imgFile.id;
        await strapi.entityService.create('api::service.service' as any, { data });
        console.log(`  ✅ Created service: ${svc.title}`);
    }

    // ── 4. Sectors — upload images ────────────────────────────────────────────
    console.log('── 4. Sector Images');
    const sectors: any[] = await strapi.entityService.findMany('api::sector.sector' as any, { sort: 'order:asc' });

    const sectorImageMap: Record<string, string> = {
        'oil-and-gas': img('sectors/oil-gas.jpg'),
        'power-electrical-instrumentation': img('sectors/power-electrical.jpg'),
        'automation-control-systems': img('sectors/automation.jpg'),
        'construction-infrastructure': img('sectors/construction.jpg'),
        'mining-heavy-engineering': img('sectors/mining.jpg'),
        'agriculture-agro-processing': img('sectors/agriculture.jpg'),
    };

    for (const sector of sectors) {
        const imgPath = sectorImageMap[sector.slug];
        if (!imgPath) continue;
        const ext = imgPath.endsWith('.png') ? 'png' : 'jpg';
        const imgFile = await uploadImage(strapi, imgPath, `sector-${sector.slug}.${ext}`);
        if (imgFile) {
            await strapi.entityService.update('api::sector.sector' as any, sector.id, {
                data: { image: imgFile.id } as any,
            });
            console.log(`  ✅ Attached image to sector: ${sector.title}`);
        }
    }

    // ── 5. Team Members — photos ──────────────────────────────────────────────
    console.log('── 5. Team Member Photos');
    const teamMembers: any[] = await strapi.entityService.findMany('api::team-member.team-member' as any, { sort: 'order:asc' });

    const teamPhotoMap: Record<string, string> = {
        'Lekan Ladejo': img('pics/team-lekan.jpg'),
        'Iyiola Ladejo': img('pics/team-iyiola.jpg'),
    };

    for (const member of teamMembers) {
        const photoPath = teamPhotoMap[member.name];
        if (!photoPath || !fs.existsSync(photoPath)) {
            console.log(`  ⚠ No photo found for ${member.name}`);
            continue;
        }
        const imgFile = await uploadImage(strapi, photoPath, `team-${member.name.toLowerCase().replace(/\s+/g, '-')}.jpg`);
        if (imgFile) {
            await strapi.entityService.update('api::team-member.team-member' as any, member.id, {
                data: { image: imgFile.id } as any,
            });
            console.log(`  ✅ Attached photo to: ${member.name}`);
        }
    }

    // ── 6. Carousels ──────────────────────────────────────────────────────────
    console.log('── 6. Carousels');
    const existingCarousels: any[] = await strapi.entityService.findMany('api::carousel.carousel' as any, {});
    for (const c of existingCarousels) {
        await strapi.entityService.delete('api::carousel.carousel' as any, c.id);
    }

    const carouselsData = [
        {
            title: 'Oil & Gas Operations',
            subtitle: 'Instrumentation, safety and process equipment for upstream and downstream operations.',
            link_url: '/sectors#oil-and-gas',
            link_text: 'Explore Oil & Gas',
            is_active: true,
            order: 1,
            imageFile: img('hero/hero_carousel_1.jpg'),
            imageExt: 'jpg',
        },
        {
            title: 'Mining & Heavy Engineering',
            subtitle: 'Robust European equipment for mining, quarrying and heavy engineering projects.',
            link_url: '/sectors#mining-heavy-engineering',
            link_text: 'Explore Mining',
            is_active: true,
            order: 2,
            imageFile: img('hero/hero_carousel_2.png'),
            imageExt: 'png',
        },
        {
            title: 'Manufacturing & Industry',
            subtitle: 'Precision equipment and technical solutions for manufacturing and industrial operations.',
            link_url: '/sectors#automation-control-systems',
            link_text: 'Explore Automation',
            is_active: true,
            order: 3,
            imageFile: img('hero/hero_carousel_3.png'),
            imageExt: 'png',
        },
        {
            title: 'Instrumentation & Control',
            subtitle: 'European instrumentation and control systems for Nigeria and West Africa.',
            link_url: '/sectors#power-electrical-instrumentation',
            link_text: 'Explore Power',
            is_active: true,
            order: 4,
            imageFile: img('hero/hero_carousel_4.jpg'),
            imageExt: 'jpg',
        },
    ];

    for (const c of carouselsData) {
        const imgFile = await uploadImage(strapi, c.imageFile, `carousel-${c.order}.${c.imageExt}`);
        const data: any = {
            title: c.title,
            subtitle: c.subtitle,
            link_url: c.link_url,
            link_text: c.link_text,
            is_active: c.is_active,
            order: c.order,
            publishedAt: new Date().toISOString(),
        };
        if (imgFile) data.image = imgFile.id;
        await strapi.entityService.create('api::carousel.carousel' as any, { data });
        console.log(`  ✅ Created carousel: ${c.title}`);
    }

    console.log('\n🎉 Seed complete!\n');
}
