import { it,expect } from 'vitest';
import {eventInput} from './event-input';
const event={title:'Görüş',category:'Qəhvə',city:'Bakı',location:'Məkan',lat:40,lng:49,date:'2026-10-20',time:'18:00',capacity:8,description:'Söhbət'};
it('accepts real event details',()=>expect(eventInput.parse(event).capacity).toBe(8));
it('rejects fewer than 2 people',()=>expect(eventInput.safeParse({...event,capacity:1}).success).toBe(false));
it('rejects more than 500 people',()=>expect(eventInput.safeParse({...event,capacity:501}).success).toBe(false));