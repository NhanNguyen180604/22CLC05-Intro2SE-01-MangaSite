import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MdAddCircleOutline, MdOutlineSettings } from "react-icons/md";
import { getMe } from "../../service/userService.js";
import IconBookmark from "../icons/IconBookmark";
import IconHome from "../icons/IconHome";

function MobileNavigationLoading() {
  return (
    <div className="fixed bottom-0 z-50 flex w-full animate-pulse bg-darker-navy px-10 py-4 lg:hidden"></div>
  );
}

export default function MobileNavigationBar() {
  const [me, setMe] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then(setMe)
      .then(() => setLoading(false));
  }, []);

  if (loading) return <MobileNavigationLoading />;
  if (!me) return <></>;
  return createPortal(
    <>
      {/* Mobile version (fixed at bottom at screen, disappears at iPad Pro size) */}
      <div
        data-testid="mobile-nav-bar"
        className="fixed bottom-0 z-50 flex w-full flex-row items-center justify-around gap-6 bg-darker-navy px-10 py-4 lg:hidden"
      >
        <a href="/" aria-label="Home">
          <IconHome className="size-8 fill-icon-white" />
        </a>
        <a href="/publish" aria-label="Publish">
          <MdAddCircleOutline color="white" size={32} />
        </a>
        <a
          href="/user/me"
          aria-label="My Profile"
          className="relative -top-4 mx-4 flex shrink-0 scale-[2.0] items-center justify-center rounded-full bg-darker-navy p-2 duration-200 hover:-translate-y-2"
        >
          <img
            src={
              me.avatar?.url || "https://placehold.co/100x100?text=User+Avatar"
            }
            alt="Your profile picture"
            className="size-8 rounded-full object-fill"
          />
        </a>
        <a href="/library" aria-label="Library">
          <IconBookmark className="size-8 fill-icon-white" />
        </a>
        <a href="/settings" aria-label="Settings">
          <MdOutlineSettings color="white" size={32} />
        </a>
      </div>
    </>,
    document.body,
  );
}
