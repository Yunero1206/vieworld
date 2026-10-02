import { useId, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { rankSuggestions, type SearchSuggestion } from '../utils/searchSuggestions';
export { rankSuggestions, type SearchSuggestion } from '../utils/searchSuggestions';


/** Local, manual-selection autocomplete. Typing never opens a destination automatically. */
export function SearchCombobox({ value, onChange, suggestions, onSelect, onSubmit, label, placeholder, className = '', groups }: {
  value: string; onChange: (value: string) => void; suggestions: SearchSuggestion[];
  onSelect: (item: SearchSuggestion) => void; onSubmit?: (query: string) => void;
  label: string; placeholder: string; className?: string;
  groups?: { id: string; label: string; limit?: number }[];
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const results = useMemo(() => groups ? groups.flatMap(group => rankSuggestions(suggestions.filter(item => item.group === group.id), value, group.limit || 3)) : rankSuggestions(suggestions, value), [suggestions, value, groups]);
  const choose = (item: SearchSuggestion) => { setOpen(false); setActive(-1); onSelect(item); };
  const option = (item: SearchSuggestion) => {
    const index = results.indexOf(item);
    return <li id={`${id}-${index}`} key={item.id} role="option" aria-selected={index === active}
      onMouseDown={event => event.preventDefault()} onClick={() => choose(item)} onMouseMove={() => setActive(index)}>
      {item.image ? <img src={item.image} alt=""/> : <Search size={15} aria-hidden="true"/>}<div><strong>{item.label}</strong><span>{item.context}</span></div>
    </li>;
  };
  return <div className={`vw-search-combobox ${className}`} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) { setOpen(false); setActive(-1); }
  }}>
    <div className="vw-search-input"><Search size={18} aria-hidden="true" />
      <input role="combobox" aria-label={label} aria-autocomplete="list" aria-expanded={open}
        aria-controls={`${id}-list`} aria-activedescendant={open && results[active] ? `${id}-${active}` : undefined}
        autoComplete="off" spellCheck={false} value={value} placeholder={placeholder}
        onFocus={() => setOpen(true)} onChange={event => { onChange(event.target.value); setOpen(true); setActive(-1); }}
        onKeyDown={event => {
          if (event.nativeEvent.isComposing) return;
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault(); setOpen(true);
            setActive(index => !results.length ? -1 : index < 0 ? (event.key === 'ArrowDown' ? 0 : results.length - 1) : (index + (event.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length);
          } else if (event.key === 'Escape') { event.preventDefault(); setOpen(false); setActive(-1); }
          else if (event.key === 'Enter') { event.preventDefault(); if (open && results[active]) choose(results[active]); else { setOpen(false); onSubmit?.(value.trim()); } }
        }} />
      {value && <button type="button" aria-label="Xóa từ khóa" onClick={() => { onChange(''); setActive(-1); }}><X size={16}/></button>}
      {onSubmit && <button type="button" aria-label="Tìm kiếm" onClick={() => { setOpen(false); onSubmit(value.trim()); }}><Search size={17}/></button>}
    </div>
    <span className="sr-only" role="status">{open ? `${results.length} gợi ý. Dùng phím lên xuống để chọn.` : ''}</span>
    {open && <div className={`vw-search-dropdown${groups ? ' is-grouped' : ''}`}><small>{value.trim() ? 'Gợi ý phù hợp' : 'Bạn có thể bắt đầu từ'}</small>
      <ul id={`${id}-list`} role="listbox" aria-label={`Gợi ý ${label.toLocaleLowerCase('vi')}`}>
        {groups ? groups.map(group => <li key={group.id} role="presentation" className="presence-search-group"><span className="presence-search-group-title">{group.label}</span><ul role="group" aria-label={group.label}>{results.filter(item => item.group === group.id).map(option)}</ul>{!results.some(item => item.group === group.id) && <small>Chưa có gợi ý.</small>}</li>) : results.map(option)}
      </ul>
      {!results.length && <p role="status">Chưa có gợi ý phù hợp. Thử tên hoặc từ khóa khác.</p>}
      {onSubmit && value.trim() && <button type="button" className="vw-search-all" onClick={() => { setOpen(false); onSubmit(value.trim()); }}>Tìm “{value.trim()}” →</button>}
    </div>}
  </div>;
}
