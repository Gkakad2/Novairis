import Sidebar from "../components/navigation/Sidebar";
import Header from "../components/navigation/Header";

export default function MainLayout({
  page,
  setPage,
  searchQuery,
  setSearchQuery,
  activeSearch,
  onSearchSubmit,
  children,
}) {
  return (
    <div className="app-shell flex h-screen text-white">
      <Sidebar page={page} setPage={setPage} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          page={page}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeSearch={activeSearch}
          onSearchSubmit={onSearchSubmit}
          setPage={setPage}
        />

        <main className="flex-1 overflow-auto px-6 py-7 md:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
