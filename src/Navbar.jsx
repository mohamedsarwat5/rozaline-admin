import React from "react";
import { NavLink, useParams } from "react-router-dom";

export default function Navbar() {

  const links = [
    { path: "/", name: "ِAll Products" },
    { path: "/addProduct", name: "Add Product" },
    {path:"/orders",name:"Orders"}
  ];

  return (
    <div className="p-4 md:p-6 bg-pink1  max-w-11/12 mx-auto mt-5 rounded-2xl ">
      <nav className="flex items-center justify-center ">


        <div>
          <ul className="flex items-center space-x-5">
            {links.map(({path,name},i)=>(
            <li key={i} className="text-pink5 relative font-bold transition-colors duration-200">
                <NavLink className={`transition-colors duration-300`} to={path}>{name}</NavLink>
            </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
}
