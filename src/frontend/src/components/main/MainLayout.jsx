import propTypes from "prop-types";
import BlackLayer from "../misc/BlackLayer.jsx";

function MainLayout({ children }) {
  return (
    <main className="h-fit min-h-screen w-full bg-darker-navy p-0 lg:px-32">
      <BlackLayer />
      <div className="h-fit min-h-screen w-full bg-dark-navy px-6 py-10 xl:px-32 xl:py-16">
        {children}
      </div>
    </main>
  );
}

MainLayout.propTypes = {
  children: propTypes.any,
};

export default MainLayout;
