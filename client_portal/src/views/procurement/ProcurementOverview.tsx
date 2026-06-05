import { Skeleton } from '@/components/ui/skeleton';
import { ViewCurrencySymbol } from '@/components/ViewCurrencySymbol';
import useUser from '@/hooks/userUser';
import { useTranslations } from 'next-intl';
import { useRoomDisplayName } from '@/lib/portal-i18n';

const ProcurementOverview = ({ isLoading, roomInfo }) => {
  const { project: projectData } = useUser();
  const t = useTranslations('procurement');
  const getRoomLabel = useRoomDisplayName();

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-5">{t('budgetOverview')}</h1>
      <div className="p-4 md:p-6 bg-white rounded-lg border">
        {isLoading && (
          <div className=" mb-10">
            <div className="space-y-5 mb-4 pb-4 border-b">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex font-semibold text-sm gap-3 w-full items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-6 h-6 rounded-full bg-gray-200" />
                    <Skeleton className="h-6 w-[200px] bg-gray-200" />
                  </div>
                  <Skeleton className="h-6 w-16 bg-gray-200" />
                </div>
              ))}
            </div>

            <div className="flex font-medium items-center justify-between">
              <Skeleton className="h-6 w-20 bg-gray-200" />
              <Skeleton className="h-6 w-20 bg-gray-200" />
            </div>
          </div>
        )}
        {!isLoading && roomInfo?.rooms?.length > 0 && (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 font-semibold text-sm">{t('roomName')}</th>
                <th className="text-right py-3 font-semibold text-sm">{t('proposedBudget')}</th>
              </tr>
            </thead>
            <tbody>
              {roomInfo.rooms.map((room, index) => {
                const totalValue = typeof room.total === 'object' ? room.total.parsedValue : room.total;
                const hue = (index * 30) % 360;
                const colors = `hsl(${hue}, 70%, 60%)`;
                return (
                  <tr key={room.room_id || index} className="border-b last:border-b-0">
                    <td className="py-3 text-sm">
                      <span className="flex items-center gap-3">
                        <span style={{ backgroundColor: colors }} className="w-4 h-4 rounded-full inline-block opacity-40"></span>
                        {getRoomLabel(room.room_name)} ({room.item_count})
                      </span>
                    </td>
                    <td className="py-3 text-sm text-right">
                      <ViewCurrencySymbol code={projectData?.currency || 'USD'} />
                      {totalValue?.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t">
                <td className="py-3 font-medium">{t('totalBudget')}</td>
                <td className="py-3 font-medium text-right">
                  <ViewCurrencySymbol code={projectData?.currency || 'USD'} />
                  {roomInfo.grand_total?.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
              </tr>
            </tfoot>
          </table>
        )}

        {!isLoading && (!roomInfo?.rooms || roomInfo.rooms.length === 0) && (
          <div className="text-center text-gray-500 py-4">{t('noBudgetData')}</div>
        )}
      </div>
    </div>
  );
};

export default ProcurementOverview;
