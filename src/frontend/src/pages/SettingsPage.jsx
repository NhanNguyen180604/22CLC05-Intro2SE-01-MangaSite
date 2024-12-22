import { useStore } from "@nanostores/react";
import { useEffect, useState } from "react";
import {
  MdDeleteOutline,
  MdFace,
  MdLibraryBooks,
  MdOutlineAdminPanelSettings,
  MdOutlineLogout,
} from "react-icons/md";
import DesktopLogo from "../components/main/DesktopLogo.jsx";
import DesktopNavigationBar from "../components/main/DesktopNavigationBar.jsx";
import MainLayout from "../components/main/MainLayout.jsx";
import MobileNavigationBar from "../components/main/MobileNavigationBar.jsx";
import { redirect } from "../service/service.js";
import { $token, checkClearance } from "../stores/auth.js";
import { deleteMe } from "../service/userService.js";
import DeletePopup from "../components/DeletePopup";

export default function SettingsPage() {
  useStore($token);
  const [loading, setLoading] = useState(true);
  const [clearance, setClearance] = useState(0);

  const [delPopupDetails, setDelPopupDetails] = useState({
    show: false,
    loading: false,
    onClose: () => { },
    message: '',
    callback: () => { },
  });
  const showDeletePopup = (e) => {
    e.preventDefault();
    setDelPopupDetails({
      show: true,
      loading: false,
      onClose: () => {
        setDelPopupDetails({
          ...delPopupDetails,
          show: false,
          loading: false,
        });
      },
      message: "You are about to delete this your account.",
      callback: deleteAccount,
    });
  };

  const deleteAccount = async () => {
    const response = await deleteMe();
    if (response.status === 200) {
      $token.set(null);
      redirect('/');
    }
    else {
      console.log('Failed to delete account');
    }
  };

  useEffect(() => {
    checkClearance().then((clearance) => {
      setClearance(clearance);
      setLoading(false);
    });
  });

  if (loading) {
    return (
      <MainLayout>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 -960 960 960"
          aria-hidden="true"
          className="size-4 animate-spin"
        >
          <path d="M480-60.78q-86.52 0-162.9-32.96-76.37-32.95-133.39-89.97-57.02-57.02-89.97-133.39Q60.78-393.48 60.78-480q0-87.04 32.95-163.06 32.95-76.03 89.96-133.18 57.01-57.15 133.4-90.07 76.39-32.91 162.91-32.91 22.09 0 37.54 15.46Q533-868.3 533-846.22q0 22.09-15.46 37.55-15.45 15.45-37.54 15.45-130.18 0-221.7 91.52-91.52 91.52-91.52 221.69 0 130.18 91.52 221.71 91.52 91.52 221.69 91.52 130.18 0 221.71-91.52 91.52-91.52 91.52-221.7 0-22.09 15.45-37.54Q824.13-533 846.22-533q22.08 0 37.54 15.46 15.46 15.45 15.46 37.54 0 86.52-32.95 162.92-32.95 76.4-89.96 133.44-57.01 57.03-133.1 89.95Q567.12-60.78 480-60.78Z" />
        </svg>
        <p className="">Loading...</p>
      </MainLayout>
    );
  }

  // Not logged in.
  if (clearance == 0) {
    redirect("/user/login");
    return;
  }

  return (
    <MainLayout>
      <header className="flex w-full flex-row items-center justify-between">
        <DesktopLogo />
        <DesktopNavigationBar />
      </header>

      <div className="flex flex-col gap-8 lg:mt-20">
        <h1 className="text-2xl font-bold">Settings</h1>

        <div className="-mx-6 flex flex-col divide-y-2 divide-blue lg:m-0 lg:divide-medium-navy">
          <a
            href="/user/me"
            className="flex flex-row items-center gap-2 p-4 px-6 font-semibold text-white hover:bg-blue focus:bg-blue lg:gap-4"
          >
            <MdFace className="size-6" /> My Profile
          </a>

          <a
            href="/user/library"
            className="flex flex-row items-center gap-2 p-4 px-6 font-semibold text-white hover:bg-blue focus:bg-blue lg:gap-4"
          >
            <MdLibraryBooks className="size-6" /> My Library
          </a>

          {clearance == 3 && (
            <a
              href="/admin"
              className="flex flex-row items-center gap-2 p-4 px-6 font-semibold text-light-red hover:bg-blue focus:bg-blue lg:gap-4"
            >
              <MdOutlineAdminPanelSettings color="white" className="size-6" />{" "}
              Administrative Tools
            </a>
          )}
        </div>

        <div className="-mx-6 flex flex-col divide-y-2 divide-blue lg:m-0">
          <button
            className="flex flex-row items-center gap-2 p-4 px-6 font-semibold text-light-red hover:bg-blue focus:bg-blue lg:gap-4"
            onClick={() => {
              $token.set(null);
              redirect("/login");
            }}
          >
            <MdOutlineLogout color="white" className="size-6" /> Logout
          </button>

          <button
            className="flex flex-row items-center gap-2 p-4 px-6 font-semibold text-light-red hover:bg-blue focus:bg-blue lg:gap-4"
            onClick={showDeletePopup}
          >
            <MdDeleteOutline color="white" className="size-6" /> Delete Account
          </button>
        </div>

        <DeletePopup
          open={delPopupDetails.show}
          onClose={delPopupDetails.onClose}
          message={delPopupDetails.message}
          callback={delPopupDetails.callback}
          loading={delPopupDetails.loading}
        />
      </div>

      <footer>
        <MobileNavigationBar />
      </footer>
    </MainLayout>
  );
}
