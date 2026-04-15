import React, { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "./ui/input";

export default function Layout() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="sticky top-0 z-50 w-full h-[70px] px-[40px] flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
        <Link to="/" className="text-[24px] font-black tracking-[-1px] text-brand uppercase">
          Anikai
        </Link>
        
        <div className="hidden md:flex gap-[30px]">
          <Link to="/" className="text-[14px] font-medium text-text-white">Discover</Link>
          <Link to="/" className="text-[14px] font-medium text-text-gray hover:text-text-white transition-colors">Movies</Link>
          <Link to="/" className="text-[14px] font-medium text-text-gray hover:text-text-white transition-colors">TV Series</Link>
          <Link to="/" className="text-[14px] font-medium text-text-gray hover:text-text-white transition-colors">My List</Link>
        </div>

        <form onSubmit={handleSearch} className="flex items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-gray" />
            <Input
              type="search"
              placeholder="Search for your favorite anime..."
              className="w-[240px] h-[36px] pl-9 bg-accent border-border-subtle rounded-[20px] text-[13px] text-text-gray placeholder:text-text-gray focus-visible:ring-brand focus-visible:ring-1 focus-visible:ring-offset-0 border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
      </header>

      <main className="flex-1 flex flex-col px-[40px] pb-[40px] gap-[30px]">
        <Outlet />
        
        <div className="text-[10px] text-text-gray flex justify-between border-t border-border-subtle pt-5 mt-10">
          <div>API Status: <span className="text-[#4ade80]">Connected</span> to 1.x.x (hello-lyart)</div>
          <div>Active Proxy: animekai-proxy-01</div>
          <div>&copy; 2024 ANIKAI NETWORK</div>
        </div>
      </main>
    </div>
  );
}
