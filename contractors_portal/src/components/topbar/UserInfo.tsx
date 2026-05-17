
import useUser from '@/hooks/userUser';


export function UserInfo() {
  const { user ,project } = useUser()


  return (
    <div className="flex items-center gap-3">
      <div className="h-8 lg:h-12 w-8 lg:w-12 flex items-center justify-center rounded-full bg-black text-white font-semibold">
        <span className="text-base font-semibold">{project?.project_name[0] || 'C'}</span>
      </div>
      <div>
        <h2 className="text-sm font-semibold text-gray-900">
          {project?.project_name}
        </h2>
        <p className="text-sm text-[#64748b]">{user?.name}</p>
      </div>
    </div>
  );
}
