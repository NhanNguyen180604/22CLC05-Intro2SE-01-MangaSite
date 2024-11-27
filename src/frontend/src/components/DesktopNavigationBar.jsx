import { useEffect, useState } from "react";
import { MdAddCircleOutline, MdOutlineSettings } from "react-icons/md";
import { getMe } from "../service/userService";
import { $showBlackLayer } from "../stores/black-layer";
import IconBookmark from "./icons/IconBookmark";
import IconHome from "./icons/IconHome";

export default function DesktopNavigationBar() {
  const [me, setMe] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    getMe().then(setMe);
  }, []);

  useEffect(() => {
    $showBlackLayer.set(expanded);
  }, [expanded]);

  if (me == null) return <></>;
  return (
    <div
      className={`group relative z-50 hidden w-fit flex-col items-center justify-between gap-12 rounded-full p-2 lg:flex ${expanded ? "bg-medium-navy pb-4" : "bg-transparent"}`}
      tabIndex={0}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onFocus={() => setExpanded(true)}
      onBlur={() => setExpanded(false)}
    >
      <a href="/profile/me" className="size-14 overflow-clip rounded-full">
        <img
          src="https://scontent.fsgn8-4.fna.fbcdn.net/v/t39.30808-1/436206323_2076351882728767_8485457505120256923_n.jpg?stp=dst-jpg_s200x200&_nc_cat=102&ccb=1-7&_nc_sid=0ecb9b&_nc_ohc=kUc3MlfzDiMQ7kNvgGdccvY&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent.fsgn8-4.fna&_nc_gid=AIa2rn1HH5yb9lA92aRjYFr&oh=00_AYAdf2vi7_5Q7NJz-MJYCQwNdw9bsQToiyhWY7XTwAhDhQ&oe=674BF93E"
          alt="Your Profile Image"
        />
      </a>

      {expanded && (
        <div className="flex flex-col gap-4">
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
      )}
    </div>
  );
}
