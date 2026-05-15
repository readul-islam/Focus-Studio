import dayjs from "dayjs";
import Link from "next/link";
import { Card, CardContent } from "../ui/card";
import Image from "next/image";
import projectCover from '/public/project_cover.jpg';
import { Badge } from "../ui/badge";
import { Building, Store } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ViewCurrencySymbol } from "../ViewCurrencySymbol";

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'Residential':
    case 'residential':
      return <Building className="w-3 h-3 mr-1" />;
    case 'Commercial':
    case 'commercial':
      return <Store className="w-3 h-3 mr-1" />;
    default:
      return <Building className="w-3 h-3 mr-1" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'Residential':
    case 'residential':
      return 'bg-white text-gray-700 border-gray-300';
    case 'Commercial':
    case 'commercial':
      return 'bg-white text-gray-700 border-gray-300';
    default:
      return 'bg-white text-gray-700 border-gray-300';
  }
};


const formatDate = (dateString: string) => {
  if (!dateString) return;
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getStatus = (status: string) =>{
  switch (status) {
    case 'AC':
      return 'Active';
    case 'ARC':
      return 'Archived';
    case 'COM':
      return 'Completed';
    default:
      return 'Active';
  }
}




export default function ProjectCardTable({ project }: { project: any }) {
  return (
    <tr key={project?.id} className="hover:bg-stone-50">
      <td className="py-4 px-4">
        <Link href={`/projects/${project?.id}`} className="flex items-center gap-3 hover:text-primary">
          <div className="w-10 h-10 bg-greige-100 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              width={200}
              height={200}
              className="w-full h-full object-cover"
              src={
                project?.images
                || projectCover
              }
              alt=""
              loading="lazy"
            />
          </div>
          <div>
            <div className="font-medium capitalize max-w-[150px] truncate text-ink">{project?.name}</div>
            <div className="text-sm text-ink-muted">{project?.code}</div>
          </div>
        </Link>
      </td>
      <td className="py-4 px-4 text-sm text-ink">
        {project?.client ? project?.client : 'No client'}
      </td>
      <td className="py-4 px-4 capitalize">
        <Badge variant="outline" className={`text-xs ${getTypeColor(project?.projectType)}`}>
          <div className="flex capitalize items-center">
            {getTypeIcon(project?.projectType)}
            {project?.projectType || 'Not set'}
          </div>
        </Badge>
      </td>
      <td className="py-4 px-4">
        <Badge
          variant="outline"
          className={`text-xs ${project?.status === 'In Progress'
            ? 'bg-sage-50 text-sage-700 border-sage-200'
            : project?.status === 'Planning'
              ? 'bg-clay-50 text-clay-700 border-clay-200'
              : 'bg-greige-50 text-greige-700 border-greige-200'
            }`}
        >
          {getStatus(project?.status) || 'In progress'}
        </Badge>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <div className="w-16 bg-stone-200 rounded-full h-1">
            <div
              className="bg-sage-500 h-1 rounded-full transition-all duration-300"
              style={{
                width: `${project?.progress}%`,
              }}
            />
          </div>
          <span className="text-sm font-medium text-ink">
            {Math.round(project?.progress)}%
          </span>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center justify-end text-sm">
          {/* <span className="text-ink-muted">Budget</span> */}
          <div className="text-right">
            <div className="font-medium text-ink">
              <ViewCurrencySymbol code={project?.currencyCode} />
              {Number(project?.budget).toLocaleString('en-GB', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="text-xs text-ink-muted">
              <ViewCurrencySymbol code={project?.currencyCode} />{project?.spent} spent
            </div>
          </div>
        </div>
      </td>
      <td className="py-4 px-4 text-sm text-ink">
        <div>
          <div>{formatDate(project?.startDate)}</div>
          <div className="text-ink-muted">to {formatDate(project?.endDate)}</div>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex -space-x-2">
          {project?.assigned &&
            project.assigned.slice(0, 3).map((member, memberIndex) => (
              <Avatar key={memberIndex} className="w-6 h-6 border-2 border-white">
                <AvatarImage src={member?.photoURL} />
                <AvatarFallback className="text-xs bg-clay-200 text-clay-700">{member?.name[0]}</AvatarFallback>
              </Avatar>
            ))}
          {project?.assigned && project.assigned.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-greige-200 border-2 border-white flex items-center justify-center">
              <span className="text-xs text-ink-muted">+{project?.assigned.length - 3}</span>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}