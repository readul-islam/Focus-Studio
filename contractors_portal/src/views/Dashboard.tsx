import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { SquareCheckBig } from 'lucide-react';
const projectCover = '/images/project_cover.jpg';
import { Link } from '@/lib/navigation';
import { Helmet } from 'react-helmet-async';
import useUser from '@/hooks/userUser';
import useFetch from '@/hooks/useFetch';
import { useTranslations } from 'next-intl';
import { useShortDate } from '@/lib/i18n-helpers';

export default function Dashboard() {
  const { user, project: projectData } = useUser();
  const t = useTranslations('dashboard');
  const tApp = useTranslations('app');
  const formatShortDate = useShortDate();

  const contractorId = user?.id;
  const { data: dashboardData, isLoading: dashboardLoading } = useFetch(
    projectData?.project_id && contractorId
      ? `contractor_portal/dashboard/?project_id=${projectData.project_id}&contractor_id=${contractorId}`
      : null,
    {
      enabled: !!projectData?.project_id && !!contractorId,
    },
  );

  return (
    <DashboardLayout>
      <Helmet>
        <title>{`${dashboardData?.project_name ? dashboardData?.project_name : t('title')} | ${tApp('pageTitleSuffix')}`}</title>
      </Helmet>
      <div className="space-y-6 ">
        {!dashboardLoading && (
          <div className=" h-[200px] md:h-[400px] relative rounded-xl overflow-hidden">
            <img
              className="w-full brightness-[0.6] object-cover object-center h-full absolute top-0 left-0"
              src={dashboardData?.project_picture ? dashboardData?.project_picture : projectCover}
              alt=""
              loading="lazy"
            />
            <div className="text-white absolute left-7 bottom-7">
              <p className="font-bold text-3xl">{dashboardData?.project_name}</p>
              <p className="text-sm font-medium opacity-70">{dashboardData?.project_address}</p>
            </div>
          </div>
        )}
        {!dashboardLoading && dashboardData && (
          <StatsGrid project={dashboardData} />
        )}

        {!dashboardLoading && dashboardData && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-4">{t('projectInformation')}</h2>
            <div className="space-y-3">
              {dashboardData.project_address && (
                <div className="flex items-start gap-3">
                  <span className="text-neutral-500 text-sm font-medium min-w-[100px]">{t('address')}</span>
                  <span className="text-neutral-900 text-sm">{dashboardData.project_address}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">{t('actionItems')}</h2>
          <div className=" flex flex-col sm:flex-row gap-2 rounded-lg items-center justify-between bg-gray-50 py-3 px-4">
            <div>
              <p className="text-sm font-medium text-gray-700">{t('requestedToView')}</p>
              {dashboardData?.unread_procurement_count > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {t('newItems', { count: dashboardData.unread_procurement_count })}
                </p>
              )}
            </div>
            <Link
              className="flex items-center text-sm font-semibold py-2.5 duration-200 hover:bg-black hover:text-white px-4 gap-3 border border-black rounded-lg"
              to={'/procurement'}
            >
              <SquareCheckBig size={15} /> {t('viewNow')}
            </Link>
          </div>
        </div>

        {!dashboardLoading && dashboardData?.recent_activity && dashboardData.recent_activity.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-4">{t('recentActivity')}</h2>
            <div className="space-y-3">
              {dashboardData.recent_activity.slice(0, 3).map((activity: any, index: number) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                  <div className="flex-shrink-0 mt-1">
                    {activity.type === 'document' ? (
                      <span className="text-lg">📄</span>
                    ) : (
                      <span className="text-lg">📦</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-neutral-900">{activity.description || activity.name}</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {activity.date ? formatShortDate(activity.date) : formatShortDate(undefined)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
