import { useEffect, useState } from "react";
import { MdAddCircleOutline, MdOutlineSettings } from "react-icons/md";
import { getMe } from "../../service/userService.js";
import { $showBlackLayer } from "../../stores/black-layer";
import IconBookmark from "../icons/IconBookmark";
import IconHome from "../icons/IconHome";

function DesktopNavLoading() {
  return <div className="bg-slate-500 animate-pulse size-14 rounded-full hidden lg:flex"></div>
}

export default function DesktopNavigationBar() {
  const [me, setMe] = useState({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  // Load the profile.
  useEffect(() => {
    getMe().then(setMe).then(() => setLoading(false));
  }, []);

  useEffect(() => {
    $showBlackLayer.set(expanded);
  }, [expanded]);

  // Loading state
  if (loading) return <DesktopNavLoading />;

  // It's null, loading failed. Returns a login button, this is only available on the desktop bar.
  if (me == null) return <a href="/user/login" className="font-semibold text-xl hidden h-14 px-4 items-center justify-center lg:flex bg-sky-blue text-black rounded-2xl">Login</a>;

  return (
    <div
      data-testid="desktop-nav-bar"
      className={`group relative hidden w-fit flex-col items-center justify-between gap-12 rounded-full lg:flex`}
      tabIndex={0}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onFocus={() => setExpanded(true)}
      onBlur={() => setExpanded(false)}
    >
      <a
        href="/user/me"
        aria-label="Profile"
        className={`relative size-14 overflow-clip rounded-full ${expanded ? "z-[60]" : ""}`}
      >
        <img
          src={me.avatar?.url || 'https://placehold.co/100x100?text=User+Avatar'}
          alt="Your Profile Image"
        />
      </a>

      <div
        className={`absolute -inset-2 z-50 flex h-64 flex-col items-center justify-end gap-2 overflow-hidden rounded-full pb-4 duration-200 ${expanded ? "visible max-h-64 bg-medium-navy" : "invisible max-h-0"}`}
      >
        <a href="/" aria-label="Home">
          <IconHome className="size-8 fill-icon-white" />
        </a>
        <a href="/publish" aria-label="Publish">
          <MdAddCircleOutline color="white" size={32} />
        </a>
        <a href="/library" aria-label="Library">
          <IconBookmark className="size-8 fill-icon-white" />
        </a>
        <a href="/settings" aria-label="Notifications">
          <MdOutlineSettings color="white" size={32} />
        </a>
      </div>
    </div>
  );
}
