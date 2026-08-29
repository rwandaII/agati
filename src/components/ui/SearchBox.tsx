export function SearchBox({ defaultValue = '' }: { defaultValue?: string }) {
  return (
    <form className="searchbox" method="get" action="/search" role="search">
      <label className="searchbox__label" htmlFor="site-search">
        Search the library
      </label>
      <input
        id="site-search"
        className="searchbox__input"
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="A book, a story, a programme…"
        autoComplete="off"
      />
      <button className="searchbox__go" type="submit" aria-label="Search">
        ⌕
      </button>
    </form>
  );
}
