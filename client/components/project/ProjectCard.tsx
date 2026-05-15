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

export const getDaysLeft = (date?: string | null): number | null => {
  if (!date) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  return Math.ceil(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
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





export default function ProjectCard({ project }: { project: any }) {
  const nextPhase = project.phases
    ?.filter(phase => dayjs(phase.endDate).isAfter(dayjs()))
    .sort((a, b) => dayjs(a.endDate) - dayjs(b.endDate))[0];
  const daysUntilMilestone = nextPhase ? dayjs(nextPhase.endDate).diff(dayjs(), 'day') : null;
  return (
    <Link key={project?.id} href={`/projects/${project?.id}`}>
      <Card className="border-borderSoft h-full bg-white hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-0">
          {/* Project Image */}
          <div className="relative h-48 bg-greige-100 rounded-t-lg overflow-hidden">
            <Image
              width={400}
              height={400}
              className="w-full h-full object-cover"
              src={
                project?.images
                || projectCover
              }
              alt=""
              loading="lazy"
            />
            <div className="absolute top-3 right-3">
              {project?.phases && (
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30">
                  {project?.phases[0]?.name}
                </Badge>
              )}
            </div>
          </div>

          {/* Project Details */}
          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold capitalize text-ink line-clamp-1">{project?.name}</h3>
                <Badge variant="outline" className={`text-xs ${getTypeColor(project?.type)}`}>
                  <div className="flex capitalize items-center">
                    {getTypeIcon(project?.projectType)}
                    {project?.projectType || 'Not Set'}
                  </div>
                </Badge>
              </div>
              <span className="text-sm text-ink-muted">
                {project?.code ? (
                  <>
                    {project?.code} •{' '}
                    {project?.client ? project?.client : 'No client'}
                  </>
                ) : project?.client ? (
                  project?.client || 'No client'
                ) : (
                  'No client'
                )}
              </span>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-muted">Progress</span>
                <span className="font-medium text-ink">
                  {project?.progress}%
                </span>
              </div>
              <div className="w-full bg-greige-200 rounded-full h-1">
                <div
                  className="bg-sage-500 h-1 rounded-full transition-all duration-300"
                  style={{
                    width: `${project?.progress}%`,
                  }}
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-muted">Date</span>
              <span className="font-medium text-ink">
                {formatDate(project?.startDate)} - {formatDate(project?.endDate)}
              </span>
            </div>

            {/* Budget */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-muted">Budget</span>
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

            {/* Team */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-muted">Team</span>
              <div className="flex -space-x-2">
                {project?.assigned &&
                  project?.assigned.slice(0, 3).map((member, index) => (
                    <Avatar key={index} className="w-6 h-6 border-2 border-white">
                      <AvatarImage src={member?.photoURL} />
                      <AvatarFallback className="text-xs bg-clay-200 capitalize text-clay-700">{member?.name[0]}</AvatarFallback>
                    </Avatar>
                  ))}
                {project?.assigned && project?.assigned.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-greige-200 border-2 border-white flex items-center justify-center">
                    <span className="text-xs text-ink-muted">+{project?.assigned.length - 3}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Next Milestone */}
            {
              <div className="pt-2 border-t border-borderSoft">
                <div className="flex h-full items-center justify-between text-sm">
                  <span className="text-ink-muted">Next milestone</span>
                  {project?.nextMilestone ? (
                    <div className="text-right">
                      <div className="font-medium text-ink">{project?.nextMilestone?.name}</div>
                      {/* <div className="text-xs text-ink-muted">
                                            {project?.nextMilestone?.start_date === 0 ? 'Due today' : `${project?.nextMilestone?.start_date} days`}
                                          </div> */}
                      <div className="text-xs text-ink-muted">
                        {getDaysLeft(project?.nextMilestone?.start_date) === 0
                          ? 'Due today'
                          : getDaysLeft(project?.nextMilestone?.start_date) && getDaysLeft(project?.nextMilestone?.start_date) > 0
                            ? `${getDaysLeft(project?.nextMilestone?.start_date)} days`
                            : 'Overdue'}
                      </div>
                    </div>
                  ) : (
                    <div className="text-right">
                      <div className="font-medium text-ink">Not applicable</div>
                      {/* <div className="text-xs text-ink-muted">Please add phase</div> */}
                    </div>
                  )}
                </div>
              </div>
            }
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}