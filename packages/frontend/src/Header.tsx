// Header.tsx
import './Header.css';

import { useNavigate } from "react-router-dom";

function Header() {

  const navigate = useNavigate();

  let username = localStorage.getItem("Username");

  const logout_func = () =>{

    localStorage.removeItem("authToken");
    localStorage.removeItem("Username");
    navigate("/");
    window.location.reload();

  }


  return (
    <header className="Header">
      <div className="Header_Container">
        <h1 className="Header_Title">Event Calendar</h1>
        <h2 className="UserName">{username}</h2>
        <a className="Header_Login" onClick={logout_func} href="/login">Log out</a>
      </div>
    </header>
  );
}

export default Header;
