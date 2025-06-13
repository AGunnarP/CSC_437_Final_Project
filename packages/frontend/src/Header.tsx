// Header.tsx
//import './Header.css';

function Header() {
  return (
    <header className="Header">
      <div className="Header_Container">
        <h1 className="Header_Title">Event Calendar</h1>
        <a className="Header_Login" href="/login">Log in</a>
      </div>
    </header>
  );
}

export default Header;
