import {describe,it,expect,beforeEach} from 'vitest';
import {render,screen} from '@testing-library/react';
import {MemoryRouter,Routes,Route} from 'react-router-dom';
import {AppProvider} from '../context/AppContext';
import {createInitialState} from '../data/fixtures';
import {FanShopView} from '../views/FanShopView';
import {RoomPropVisual} from '../components/RoomPropVisual';
import {CatalogItemArt,hasCatalogItemArt} from '../components/CatalogItemArt';
import {ArtistWorldView} from '../views/ArtistWorldView';

describe('Catalog illustration truth',()=>{
 beforeEach(()=>localStorage.clear());
 it.each([['product-c-poster-real','poster'],['product-mira-tea-cup-real','cup'],['product-d-songbook-real','book'],['product-d-pick-real','pick'],['product-d-tote-real','tote'],['product-mira-digital-companion','headband'],['product-kai-keychain-real','keychain'],['product-a-hanoi-towel','scarf']])('renders %s as its own item type, never a borrowed photo',(id,kind)=>{const{container}=render(<CatalogItemArt id={id} title="Concept"/>);expect(container.querySelector('[data-catalog-art]')).toHaveAttribute('data-catalog-art',kind);expect(container.querySelector('image')).toBeNull();});
 it('replaces the incorrect old poster shirt-cutout only in presentation',()=>{const item={id:'product-c-poster-real',title:'Poster',detail:'',slot:'ticket' as const,roomAsset:'/images/world-v6/shirt-cutout.webp',image:'ticket-digital'};const{container}=render(<RoomPropVisual item={item}/>);expect(container.querySelector('[data-catalog-art]')).toHaveAttribute('data-catalog-art','poster');expect(container.querySelector('img')).toHaveAttribute('src','/images/merch-studio/c-concert-poster.webp');expect(container.querySelector('[data-catalog-art]')).toHaveClass('is-cutout');expect(item.roomAsset).toContain('shirt-cutout');});
 it('prefers a genuine room asset over the concept fallback',()=>{const item={id:'product-c-poster-real',title:'Poster',detail:'',slot:'ticket' as const,roomAsset:'/images/artist-c-poster-room.webp',image:'ticket-digital'};const{container}=render(<RoomPropVisual item={item}/>);expect(container.querySelector('img')).toHaveAttribute('src',item.roomAsset);expect(container.querySelector('[data-catalog-art]')).toBeNull();});
 it('puts the story artist first while keeping all families in the same catalogue',()=>{render(<AppProvider initialState={createInitialState('vieworld-demo')}><MemoryRouter><FanShopView/></MemoryRouter></AppProvider>);expect(document.querySelector('.fw-product-tile')?.textContent).toContain('Artist A');expect(screen.getByRole('heading',{name:'Cốc Gốm Sứ Luna MIRA · Midnight Tea'})).toBeVisible();expect(hasCatalogItemArt('product-star-shirt-real')).toBe(false);});
 it('uses the same illustration in the artist merchandise rail',()=>{render(<AppProvider initialState={createInitialState('vieworld-demo')}><MemoryRouter initialEntries={['/artist/artist-a']}><Routes><Route path="/artist/:artistId" element={<ArtistWorldView/>}/></Routes></MemoryRouter></AppProvider>);expect(document.querySelector('.artist-home-products [data-catalog-art="scarf"]')).not.toBeNull();expect(document.querySelector('.artist-home-products [data-catalog-art="poster"]')).not.toBeNull();});
});
