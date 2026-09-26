import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SearchCombobox, rankSuggestions } from '../components/SearchCombobox';
import { globalSearchSuggestions } from '../world/searchDiscovery';
import { createInitialState } from '../data/fixtures';

const suggestions = [{ id:'a', label:'Đêm Hà Nội', context:'Artist A' }, { id:'b', label:'Hoodie', context:'Artist B' }];
describe('Scoped search suggestions', () => {
  it('normalizes Vietnamese and deduplicates, ranks exact/prefix before context', () => {
    expect(rankSuggestions([...suggestions,suggestions[0]],'dem ha')).toEqual([suggestions[0]]);
    expect(rankSuggestions(suggestions,'artist b')[0].id).toBe('b');
    expect(rankSuggestions(suggestions,'unrelated')).toEqual([]);
  });
  it('keeps focus in input, selects only after Enter, Escape dismisses', () => {
    const select = vi.fn(); const submit = vi.fn();
    function Demo() { const [value,setValue] = useState(''); return <SearchCombobox value={value} onChange={setValue} suggestions={suggestions} onSelect={select} onSubmit={submit} label="Search" placeholder="Search"/>; }
    render(<Demo/>); const input = screen.getByRole('combobox');
    fireEvent.focus(input); fireEvent.keyDown(input,{key:'ArrowUp'});
    expect(input).toHaveAttribute('aria-activedescendant');
    expect(select).not.toHaveBeenCalled();
    fireEvent.keyDown(input,{key:'Enter'}); expect(select).toHaveBeenCalledWith(suggestions[1]);
    fireEvent.change(input,{target:{value:'dem'}}); fireEvent.keyDown(input,{key:'Escape'});
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    fireEvent.keyDown(input,{key:'Enter'}); expect(submit).toHaveBeenCalledWith('dem');
  });
  it('does not navigate on IME Enter and does not trap Tab', () => {
    const submit = vi.fn(); render(<SearchCombobox value="đ" onChange={()=>{}} suggestions={suggestions} onSelect={()=>{}} onSubmit={submit} label="Search" placeholder="Search"/>);
    const input = screen.getByRole('combobox'); fireEvent.focus(input);
    fireEvent.keyDown(input,{key:'Enter',isComposing:true}); expect(submit).not.toHaveBeenCalled();
    fireEvent.blur(input); expect(input).toHaveAttribute('aria-expanded','false');
  });
  it('does not index Hall messages or personal owned data; event routes retain context prefix', () => {
    const state=createInitialState('vieworld-demo');
    const results=globalSearchSuggestions(state);
    expect(results.every(item=>!item.id.startsWith('hall-'))).toBe(true);
    expect(results.find(item=>item.id.startsWith('event-'))?.target).toContain('context=session%3A');
    expect(results.some(item=>item.id.startsWith('moment-'))).toBe(true);
  });
});
