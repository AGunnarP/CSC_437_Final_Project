// Header.tsx
import './Header.css';

import { Link, useNavigate } from "react-router-dom";

function Header() {

  const navigate = useNavigate();

  let username = localStorage.getItem("Username");

  const logout_func = () =>{

    if(!username)
        return;

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
        <Link
          className="Header_Login"
          onClick={logout_func}
          to="/login"
        >
          {(username) ? "Log out" : "Log in"}
        </Link>
      </div>
    </header>
  );

}

export default Header;
