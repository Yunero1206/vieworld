import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import { createInitialState } from '../data/fixtures';
import { FanShopView } from '../views/FanShopView';
import { availableShopCategories, getPreviewCapabilities, productBadge, productPrice } from '../world/shopPresentation';
import { DELIVERY_LABELS, productDisplayTitle } from '../world/merchCatalog';

const state = () => createInitialState('vieworld-demo');
function mount(path: string) {
  return render(<AppProvider><MemoryRouter initialEntries={[path]}><Routes><Route path="/shop" element={<FanShopView/>}/></Routes></MemoryRouter></AppProvider>);
}

describe('VieSHOP storefront presentation', () => {
  beforeEach(() => localStorage.clear());

  it('derives compact categories, capabilities and meaningful badges from canonical products', () => {
    const products = Object.values(state().products);
    const byId = Object.fromEntries(products.map(product => [product.id, product]));
    expect(availableShopCategories(products)).toEqual(['all', 'merch', 'album', 'membership']);
    expect(productBadge(byId['product-cap-real'])).toBeUndefined();
    expect(productBadge(byId['product-member-preview'])).toBe('Concept');
    expect(getPreviewCapabilities(byId['product-member-preview'], products)).toEqual({ avatar: false, room: false });
    expect(getPreviewCapabilities(byId['product-cap-real'], products)).toEqual({ avatar: true, room: false });
    expect(getPreviewCapabilities(byId['product-cd-real'], products)).toEqual({ avatar: false, room: true });
  });

  it('formats a variant range in ascending order and supports a compare-at price', () => {
    const product = state().products['product-star-shirt-real'];
    expect(productPrice(product, [{ ...product, priceVND: 450000 }, { ...product, priceVND: 420000 }]).current).toMatch(/^420\.000.*450\.000/);
    expect(productPrice({ ...product, priceVND: 420000, compareAtPriceVND: 450000 }).compareAt).toMatch(/^450\.000/);
  });

  it('uses one set of short edition labels without changing product IDs or names', () => {
    expect(DELIVERY_LABELS).toEqual({ physical: 'Ngoài đời', digital: 'Trong VieWorld', bundle: 'Cả hai' });
    expect(productDisplayTitle('Áo Star Club · Digital')).toBe('Áo Star Club');
    expect(state().products['product-star-shirt-digital'].title).toBe('Áo Star Club · Digital');
  });

  it('opens product details in a centered reading layout with explicit editions', () => {
    mount('/shop?product=product-star-shirt-real');
    const detail = screen.getByRole('dialog');
    expect(detail).toHaveClass('fw-panel-product');
    expect(detail.querySelector('.fw-product-detail-layout')).toBeInTheDocument();
    const editionChoices = detail.querySelector('.fw-variant-selector') as HTMLElement;
    expect(within(editionChoices).getByRole('button', { name: /Ngoài đời/ })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(within(editionChoices).getByRole('button', { name: /Trong VieWorld/ }));
    expect(within(detail).getByText(/Không giao hàng/)).toBeInTheDocument();
  });

  it('keeps artist entry scoped and makes removing that scope explicit', () => {
    mount('/shop?artist=artist-mira');
    expect(screen.getByRole('button', { name: 'Bỏ lọc nghệ sĩ MIRA' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Áo Hoodie MIRA Cloud Dream' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Áo Star Club' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Bỏ lọc nghệ sĩ MIRA' }));
    expect(screen.getByRole('heading', { name: 'Áo Star Club' })).toBeInTheDocument();
  });

  it('does not offer My Space preview for membership or a purchase action for concepts', () => {
    mount('/shop');
    const heading = screen.getByRole('heading', { name: 'Artist A · Club Membership' });
    const card = heading.closest('article')!;
    expect(within(card).queryByRole('button', { name: 'Thử trong My Space' })).not.toBeInTheDocument();
    fireEvent.click(heading.closest('button')!);
    const detail = screen.getByRole('dialog');
    expect(within(detail).getByText(/Ý tưởng · Chưa mở bán/)).toBeInTheDocument();
    expect(within(detail).queryByRole('button', { name: /Thêm vào giỏ/ })).not.toBeInTheDocument();
  });
});
