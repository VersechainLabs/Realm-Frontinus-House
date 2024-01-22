import classes from './SearchBarV2.module.css';
import { RiSearchLine as SearchIcon } from 'react-icons/ri';

interface SearchBarProps {
  input: string;
  handleSeachInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}

const SearchBarV2 = ({ input, handleSeachInputChange, placeholder }: SearchBarProps) => {
  return (
    <div className={classes.searchBar}>
      <span className={classes.searchIcon}>
        <SearchIcon />
      </span>

      <input
        type="text"
        value={input}
        onChange={e => handleSeachInputChange(e)}
        placeholder={placeholder}
      />
    </div>
  );
};

export default SearchBarV2;
