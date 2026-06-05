
import useUser from '@/hooks/userUser';
import { useTranslations } from 'next-intl';

export function UserInfo() {
  const { user, project } = useUser();
  const tc = useTranslations('common');

  return (
    <div className="flex items-center gap-3">
      <div className="h-8 lg:h-12 w-8 lg:w-12 flex items-center justify-center rounded-full bg-black text-white font-semibold">
        <span className="text-xl font-semibold">{project?.project_name?.[0] || tc('defaultAvatarInitial')}</span>
      </div>
      <div>
        <h2 className="font-semibold text-[#1A1F2C]">
          {project?.project_name}
        </h2>
        <p className="text-sm text-[#64748b]">{user?.name}</p>
      </div>
    </div>
  );
}
