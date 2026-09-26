import { useState, type FormEvent } from "react";

interface SearchBarProps {
  loading: boolean;
  onSearch: (symbol: string) => void;
}

export function SearchBar({ loading, onSearch }: SearchBarProps) {
  const [value, setValue] = useState("");
  const trimmed = value.trim();
  const disabled = loading || trimmed === "";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled) {
      return;
    }
    setValue(trimmed);
    onSearch(trimmed);
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <label className="search-bar__field" htmlFor="symbol">
        Symbol
        <input
          id="symbol"
          name="symbol"
          className="search-bar__input"
          placeholder="e.g. AAPL, MSFT, ^GSPC"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
      </label>
      <button className="button" type="submit" disabled={disabled}>
        Search
      </button>
    </form>
  );
}
