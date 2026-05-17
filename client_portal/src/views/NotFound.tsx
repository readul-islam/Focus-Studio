import { Link } from "@/lib/navigation";

const NotFound = () => {
  return (
    // <DashboardLayout>
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-xl font-semibold text-gray-900">Page Not Found</h1>
        <p className="text-lg mt-5">The page you are looking for does not exist or has been moved</p>
        <Link to="/" className="mt-4 text-blue-500">
          Go back to home
        </Link>
      </div>
    // </DashboardLayout>
  );
};

export default NotFound;
