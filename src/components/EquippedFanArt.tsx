import {useId} from 'react';
import {digitalVisual} from '../world/itemVisuals';
import {compatibleDigitalLook,AVATAR_FITS,type FanAppearance,type DigitalLook} from '../world/avatarFit';
import {ItemMotif} from './DigitalObjectArt';
import {PreparedPropArt} from './PreparedPropArt';
export const FAN_ART_RIGS={original:{width:450,height:550},wave:{width:450,height:550},bob:{width:450,height:550},curl:{width:450,height:550}};
export function EquippedFanArt({source,appearance,look,onError}:{source:string;appearance:FanAppearance;look:DigitalLook;onError:()=>void}){
 const id=useId().replace(/:/g,''); const fitted=compatibleDigitalLook(look,appearance);
 const shirt=digitalVisual(fitted.shirt);const hat=digitalVisual(fitted.hat);const light=digitalVisual(fitted.lightstick);
 const grip=light&&AVATAR_FITS[light.id].grip;
 const outline=shirt?.kind==='shirt'?'M153 264Q170 273 193 267Q225 282 252 267L285 263L313 283L344 331L316 348L300 326L305 403Q228 419 149 403L151 329L133 348L108 331L131 285Z':'M157 257Q172 247 192 263Q225 282 253 263Q275 247 290 263L309 281L333 329L347 389L334 407L306 404L292 351L299 410Q225 423 150 410L157 351L142 404L113 399L106 382L124 328L139 281Z';
 return <svg className="vx-character-art vw-equipped-fan" viewBox="0 0 450 550" aria-hidden="true" data-rig="canonical">
 <defs>
   <clipPath id={id+'-head'}><path d={hat?'M0 105H450V253H0Z':'M0 0H450V253H0Z'}/></clipPath>
   <clipPath id={id+'-body'}><rect x="0" y="249" width="450" height="301"/></clipPath>
   <mask id={id+'-base'}><rect width="450" height="550" fill="white"/>{shirt&&<path d={outline} fill="black" stroke="black" strokeWidth="4"/>}{light&&<path d="M295 278L352 313L354 422L303 423L286 338Z" fill="black"/>}</mask>
   <linearGradient id={id+'-fabric'} x1="0" y1="0" x2="1" y2="1"><stop stopColor={shirt?.color||'#f3e6d2'}/><stop offset=".5" stopColor={shirt?.color||'#f3e6d2'}/><stop offset="1" stopColor={shirt?.shade||'#c8b79f'}/></linearGradient>
 </defs>
 <g clipPath={'url(#'+id+'-body)'} mask={'url(#'+id+'-base)'}><image href="/images/characters-v4/fan.webp" width="450" height="550" onError={onError}/></g>
 <g clipPath={'url(#'+id+'-head)'}><image href={source} width={appearance==='original'?450:400} height={appearance==='original'?550:560} transform={appearance==='original'?undefined:'translate(29 4) scale(.98)'} onError={onError}/></g>
 {shirt&&<g data-testid="digital-shirt" data-visual-id={shirt.id} strokeLinejoin="round">
   {shirt.kind==='shirt'&&<g fill="#f4cba7" stroke="#9c7254" strokeWidth="3"><path d="M113 329L111 391Q115 414 134 416L145 409L152 337Z"/><path d="M316 334L301 391Q302 411 324 413L338 404L340 343Z"/></g>}
   <path d={outline} fill={'url(#'+id+'-fabric)'} stroke={shirt.shade} strokeWidth="3"/>
   <path d="M180 268Q225 291 269 267" fill="none" stroke={shirt.shade} strokeWidth={shirt.kind==='shirt'?6:3}/>
   {shirt.kind==='hoodie'&&<><path d="M169 263Q147 238 178 248L195 265M259 264L279 247Q299 245 287 263" fill={shirt.color} stroke={shirt.shade} strokeWidth="3"/><path d="M196 280V329M253 280V329M182 359L172 393Q225 403 279 392L265 359Z" fill="none" stroke={shirt.shade} strokeWidth="2.5"/><circle cx="196" cy="330" r="4" fill={shirt.shade}/><circle cx="253" cy="330" r="4" fill={shirt.shade}/></>}
   {shirt.kind==='bomber'&&<><path d="M224 277V414M166 367L193 357M280 367L253 357" stroke={shirt.accent} strokeWidth="3" fill="none"/><path d="M153 404Q225 418 297 404M113 392L140 398M311 400L338 400" stroke={shirt.shade} strokeWidth="9" fill="none"/></>}
   <path d="M164 327L162 371M288 327L290 371M183 401Q205 396 219 403" fill="none" stroke={shirt.shade} opacity=".5" strokeWidth="2"/>
   <g transform="translate(270 314) scale(.75)"><ItemMotif visual={shirt}/></g>
   {!light&&<g fill="#f4cba7" stroke="#976e51" strokeWidth="2.5"><path d="M115 400Q110 415 121 419Q139 429 143 410L143 403Z"/><path d="M310 406Q313 426 329 419Q341 415 335 403Z"/></g>}
 </g>}
 {hat&&<g data-testid="digital-hat" data-visual-id={hat.id}>
   <path d="M105 125Q95 40 193 28Q301 12 331 115L332 133Q227 152 105 125Z" fill={hat.color} stroke={hat.shade} strokeWidth="4"/>
   <path d="M128 113Q220 91 324 111L365 135Q321 165 224 147L118 138Z" fill={hat.shade} stroke="#3f523d" strokeWidth="3"/>
   <path d="M216 35Q230 65 229 112M159 46Q137 72 136 112M278 46Q303 78 309 112" fill="none" stroke={hat.shade} opacity=".5" strokeWidth="2"/>
   <g transform="translate(226 78) scale(1)"><ItemMotif visual={hat}/></g>
 </g>}
 {light&&grip&&<g data-testid="digital-lightstick" data-visual-id={light.id}>
   <path d="M295 287Q304 280 317 294L334 321L324 351L294 337Z" fill={shirt?.color||'#eee3cc'} stroke={shirt?.shade||'#b09d80'} strokeWidth="3"/>
   <g transform={`translate(${grip.x} ${grip.y}) rotate(${grip.rotate}) scale(${grip.scale}) translate(-80 -155)`}><svg width="160" height="200"><PreparedPropArt visual={light}/></svg></g>
   <path d="M314 338Q306 342 309 355Q312 365 326 363Q339 360 337 349L327 340Z" fill="#f3cba9" stroke="#9b7254" strokeWidth="3"/>
   <path d="M313 345L328 349M312 352L328 355" fill="none" stroke="#b18464" strokeWidth="2"/>
 </g>}
 </svg>;
}
