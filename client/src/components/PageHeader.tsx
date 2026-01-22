import logo from "@assets/Artemis_Logo_Slogan_1767398341449.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, Search, Menu, ClipboardList } from "lucide-react";

export function PageHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden text-slate-500">
            <Menu className="w-6 h-6" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 relative overflow-hidden rounded-lg bg-white flex items-center justify-center border border-slate-100 shadow-sm">
              <img src={logo} alt="Artemis Hunting" className="h-full w-full object-contain p-1" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-slate-900 leading-none">Artemis</h1>
              <p className="text-xs text-slate-500 font-medium tracking-wide">HUNTING MVP</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden md:flex items-center px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search clients..." 
              className="bg-transparent border-none text-sm focus:outline-none w-48 text-slate-700 placeholder:text-slate-400"
            />
          </div>

          <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-primary hover:bg-blue-50">
            <ClipboardList className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full border-2 border-white"></span>
          </Button>

          <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-primary hover:bg-blue-50">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </Button>
          
          <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-900 leading-tight">Agent Silva</p>
              <p className="text-xs text-slate-500">Credit Officer</p>
            </div>
            <Avatar className="h-9 w-9 border-2 border-white shadow-sm cursor-pointer ring-2 ring-transparent hover:ring-primary/20 transition-all">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback className="bg-primary text-primary-foreground font-bold">AS</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}
