import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MdAddCircleOutline, MdOutlineNotifications } from "react-icons/md";
import { getMe } from "../../service/userService";
import IconBookmark from "../icons/IconBookmark";
import IconHome from "../icons/IconHome";

export default function MobileNavigationBar() {
  let [me, setMe] = useState(null);

  useEffect(() => {
    getMe().then(setMe);
  }, []);

  if (me == null) return <></>;
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
          href="/profile/me"
          aria-label="My Profile"
          className="relative -top-4 mx-4 flex shrink-0 scale-[2.0] items-center justify-center rounded-full bg-darker-navy p-2 duration-200 hover:-translate-y-2"
        >
          <img
            src="https://scontent.fsgn8-4.fna.fbcdn.net/v/t39.30808-1/436206323_2076351882728767_8485457505120256923_n.jpg?stp=dst-jpg_s200x200&_nc_cat=102&ccb=1-7&_nc_sid=0ecb9b&_nc_ohc=kUc3MlfzDiMQ7kNvgGdccvY&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent.fsgn8-4.fna&_nc_gid=AIa2rn1HH5yb9lA92aRjYFr&oh=00_AYAdf2vi7_5Q7NJz-MJYCQwNdw9bsQToiyhWY7XTwAhDhQ&oe=674BF93E"
            alt="test"
            className="size-8 rounded-full object-fill"
          />
        </a>
        <a href="/library" aria-label="Library">
          <IconBookmark className="size-8 fill-icon-white" />
        </a>
        <a href="/notifications" aria-label="Notifications">
          <MdOutlineNotifications color="white" size={32} />
        </a>
      </div>
    </>,
    document.body,
  );
}
