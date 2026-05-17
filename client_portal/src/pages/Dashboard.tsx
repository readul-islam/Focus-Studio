import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MessageSquare,
  Calendar,
  MoreHorizontal,
  SquareCheckBig,
} from "lucide-react";
import projectCover from "/images/project_cover.jpg";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import useUser from "@/hooks/userUser";
import useFetch from "@/hooks/useFetch";

export default function Dashboard() {
  const { user  , project:projectData} = useUser()
  
  console.log('projectData',projectData)
  
  const {data: dashboardData, isLoading: dashboardLoading} = useFetch(`client_portal/dashboard/?project_id=${projectData?.project_id}`,{
    enabled: !!projectData?.project_id
  })
 

  return (
    <DashboardLayout>
      <Helmet>
        <title>{`${
          dashboardData?.project_name ? dashboardData?.project_name : "Dashboard"
        } | TechStyles`}</title>
      </Helmet>
      <div className="space-y-6 ">
        {!dashboardLoading && (
          <div className=" h-[200px] md:h-[400px] relative rounded-xl overflow-hidden">
            <img
              className="w-full brightness-[0.6] object-cover object-center h-full absolute top-0 left-0"
              src={
              dashboardData?.project_picture ? dashboardData?.project_picture : projectCover 
              }
              alt=""
              loading="lazy"
            />
            <div className="text-white absolute left-7 bottom-7">
              <p className="font-bold text-2xl">{dashboardData?.project_name}</p>
              <p className="text-sm font-medium opacity-70">
                {dashboardData?.project_address}
              </p>
            </div>
          </div>
        )}
        <StatsGrid project={dashboardData}  />
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold mb-4 text-base text-gray-900">Action Items</h2>
          <div className=" flex flex-col sm:flex-row gap-2 rounded-lg items-center justify-between bg-gray-50 py-3 px-4">
            <p className="text-sm font-medium text-gray-700">Requested to Review</p>
            <Link
              className="flex items-center text-sm font-semibold py-2.5 duration-200 hover:bg-black hover:text-white px-4 gap-3 border border-black rounded-lg"
              to={"/procurement"}>
              <SquareCheckBig size={15} /> Approve Now
            </Link>
          </div>
        </div>
        {/* <div className="grid grid-cols-1">
          <Card className="xl:col-span-2 p-4">
            <CardHeader className="flex flex-row items-center justify-between p-0">
              <CardTitle className="text-base font-semibold text-gray-900">
                Recent Communication
              </CardTitle>
              <button className="text-sm text-primary border border-[#E1E4EA] py-[6px] px-[10px] rounded-lg">
                See All
              </button>
            </CardHeader>
            <CardContent className="p-0">
              <CommentsView comments={commentsData} />
            </CardContent>
          </Card>
        </div> */}
      </div>
    </DashboardLayout>
  );
}
