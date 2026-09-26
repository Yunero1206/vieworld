import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MembershipBadge } from '../components/MembershipBadge';
import { membershipTenure } from '../world/membershipBadge';
import type { Membership } from '../domain/types';
const member: Membership={id:'m',tenantId:'vieworld-demo',version:1,updatedAt:'2026-09-09',fanId:'fan',worldId:'artist-a',status:'active',startedAt:'2026-06-10T00:00:00Z',expiresAt:'2027-06-10T00:00:00Z'};
describe('Per-artist membership loyalty',()=>{
  it('uses completed calendar months and never updatedAt for tenure',()=>{
    expect(membershipTenure(member,'2026-09-09T00:00:00Z')).toBe(2);
    expect(membershipTenure(member,'2026-09-10T00:00:00Z')).toBe(3);
    expect(membershipTenure({...member,startedAt:undefined},'2026-09-10T00:00:00Z')).toBe(-1);
  });
  it('does not award a badge for absent or expired membership',()=>{
    expect(membershipTenure(undefined,'2026-09-10')).toBeNull();
    expect(membershipTenure(member,'2027-07-01')).toBeNull();
    expect(membershipTenure({...member,status:'inactive'},'2026-09-10')).toBeNull();
  });
  it('uses distinct artist symbols and explains demo/tenure without payment ranks',()=>{
    const {rerender,container}=render(<MembershipBadge artistId="artist-a" months={6}/>);
    expect(screen.getByRole('img')).toHaveAccessibleName('Hội viên · 6 tháng đồng hành');
    const shape=container.querySelector('svg')?.innerHTML;
    rerender(<MembershipBadge artistId="artist-mira" months={6} demo/>);
    expect(container.querySelector('svg')?.innerHTML).not.toBe(shape);
    expect(screen.getByRole('img')).toHaveAccessibleName(/Minh họa/);
  });
});
