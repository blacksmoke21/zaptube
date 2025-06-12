"use client";

import { Home, TrendingUp, Subscript, Library, History, Clock, ThumbsUp, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();
  const collapsed = pathname.startsWith("/watch");
  
  const mainItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: TrendingUp, label: "Trending", href: "/trending" },
    { icon: Subscript, label: "Subscriptions", href: "/subscriptions" },
  ];

  const libraryItems = [
    { icon: Library, label: "Library", href: "/library" },
    { icon: History, label: "History", href: "/history" },
    { icon: Clock, label: "Watch Later", href: "/watch-later" },
    { icon: ThumbsUp, label: "Liked Videos", href: "/liked" },
  ];

  if (collapsed) {
    return (
      <aside className="w-25 border-r border-gray-700 bg-background">
        <div className="space-y-2 p-2">
          {mainItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <button className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors hover:cursor-pointer hover:backdrop-brightness-60 rounded-md px-3 w-full flex-col gap-1 h-16">
                <item.icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </button>
            </Link>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 border-r border-gray-700 bg-background">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {mainItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <button className="inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors h-10 px-4 py-2 w-full justify-start hover:cursor-pointer hover:backdrop-brightness-60">
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </button>
              </Link>
            ))}
          </div>
        </div>

        <hr className="h-px my-4 bg-gray-700 border-0"></hr>

        <div className="px-3 py-2">
          <h3 className="px-3 py-2 text-sm font-semibold text-muted-foreground">Library</h3>
          <div className="space-y-1">
            {libraryItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <button className="inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors h-10 px-4 py-2 w-full justify-start hover:cursor-pointer hover:backdrop-brightness-60">
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </button>
              </Link>
            ))}
          </div>
        </div>

        <hr className="h-px my-4 bg-gray-700 border-0"></hr>

        <div className="px-3 py-2">
          <button className="inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors h-10 px-4 py-2 w-full justify-start hover:cursor-pointer hover:backdrop-brightness-60">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </button>
        </div>
      </div>
    </aside>
  );
}
