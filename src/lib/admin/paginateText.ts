/**
 * The admin desk paginates pasted text with exactly the same routine the bulk
 * importer uses, so a book added by hand is chunked identically to one fetched
 * from Gutenberg. Re-exported here so application code never reaches into
 * `scripts/`.
 */
export { paginate as paginateText, stripGutenbergBoilerplate } from '../../../scripts/fetch-books';
