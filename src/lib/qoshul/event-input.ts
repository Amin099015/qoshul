import { z } from 'zod';
export const eventInput = z.object({
 title:z.string().trim().min(1).max(65), category:z.string().trim().min(1).max(80), city:z.string().min(1), location:z.string().trim().min(1).max(300),
 lat:z.number().min(-90).max(90), lng:z.number().min(-180).max(180), date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/), time:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), capacity:z.number().int().min(2).max(500), description:z.string().trim().min(1).max(5000),
 price:z.number().min(0).default(0), ageLimit:z.string().default('Hamı üçün'), language:z.string().default('Azərbaycan dili'), level:z.string().default('Hamı üçün'), format:z.enum(['Oflayn','Onlayn']).default('Oflayn'), approval:z.boolean().default(false), recurring:z.string().default('Bir dəfəlik'), tags:z.array(z.string().max(60)).max(30).default([]), partnerId:z.string().uuid().nullable().default(null)
});