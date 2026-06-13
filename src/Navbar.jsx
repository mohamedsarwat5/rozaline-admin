import React from "react";
import { NavLink, useParams } from "react-router-dom";

export default function Navbar() {

  const links = [
    { path: "/", name: "ِAll Products" },
    { path: "/addProduct", name: "Add Product" },
    {path:"/orders",name:"Orders"}
    // { path: `/updateproduct/${id}`, name: "Update Product" },
  ];

  return (
    <div className="p-4 md:p-6 bg-indigo-600">
      <nav className="flex items-center justify-between">
        <div>
          <h2>Rozaline</h2>
        </div>

        <div>
          <ul className="flex items-center space-x-3">
            {links.map(({path,name},i)=>(
            <li key={i} className="text-white relative font-medium">
                <NavLink className={``} to={path}>{name}</NavLink>
            </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
}
