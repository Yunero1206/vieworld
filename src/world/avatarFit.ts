import { digitalVisual } from './itemVisuals';
import type {FanProfile} from '../domain/types';
export type FanAppearance=NonNullable<FanProfile['avatarPreset']>;
export type DigitalLook=NonNullable<FanProfile['digitalLook']>;
const appearances:FanAppearance[]=['original','wave','bob','curl'];
/** Only explicitly authored fit data enables try-on. Every preset uses one canonical body. */
export const AVATAR_FITS: Record<string,{slot:keyof DigitalLook; appearances:FanAppearance[]; grip?:{x:number;y:number;scale:number;rotate:number}}> = {
  'star-shirt':{slot:'shirt',appearances},'mira-hoodie':{slot:'shirt',appearances},'kai-bomber':{slot:'shirt',appearances},
  'star-cap':{slot:'hat',appearances},
  'star-light':{slot:'lightstick',appearances,grip:{x:328,y:358,scale:.57,rotate:-12}},
  'mira-lightstick':{slot:'lightstick',appearances,grip:{x:328,y:358,scale:.59,rotate:-9}},
  'kai-lightstick':{slot:'lightstick',appearances,grip:{x:328,y:358,scale:.57,rotate:-10}},
  'c-lightstick-digital':{slot:'lightstick',appearances,grip:{x:328,y:358,scale:.56,rotate:-11}},
};
export function hasAvatarFit(id?:string,appearance:FanAppearance='original'){return !!id&&!!digitalVisual(id)&&!!AVATAR_FITS[id]?.appearances.includes(appearance);}
export function compatibleDigitalLook(look:DigitalLook,appearance:FanAppearance='original'):DigitalLook{
  return Object.fromEntries(Object.entries(look).filter(([slot,id])=>hasAvatarFit(id,appearance)&&AVATAR_FITS[id!].slot===slot));
}
