import dynamic from 'next/dynamic'
import { Metadata } from 'next'
import { StartCourse } from '@/components/start-course/start-course'
import { CourseContent } from '@/components/course-content/course-content'
import { APIYoutube } from '@/shared/services/api-youtube'

const CourseHeader = dynamic(
  () =>
    import('@/components/course-header/course-header').then(
      (mod) => mod.CourseHeader
    ),
  { ssr: false }
)

interface CourseDetailsProps {
  params: {
    id: string
  }
}

export async function generateStaticParams(): Promise<
  CourseDetailsProps['params'][]
> {
  const courses = await APIYoutube.course.getAll()

  return courses.map((course) => ({
    id: course.id,
  }))
}

export async function generateMetadata({
  params: { id },
}: CourseDetailsProps): Promise<Metadata> {
  const courseDetail = await APIYoutube.course.getById(id)

  return {
    title: courseDetail.title,
    description: courseDetail.description,
    openGraph: {
      locale: 'pt_BR',
      type: 'video.other',
      title: courseDetail.title,
      images: courseDetail.thumbnail,
      description: courseDetail.description,
    },
  }
}

export default async function CourseDetailsPage({
  params: { id },
}: CourseDetailsProps) {
  const courseDetail = await APIYoutube.course.getById(id)
  const firstClass = courseDetail.classGroups.at(0)?.classes.at(0)

  return (
    <main className="mt-8 flex justify-center">
      <div className="w-full min-[920px]:max-w-[920px] px-2 lg:px-0 flex flex-col md:flex-row-reverse gap-4">
        {firstClass && (
          <div className="flex-1">
            <StartCourse
              classId={firstClass.id}
              title={firstClass.title}
              courseId={courseDetail.id}
              imageUrl={courseDetail.thumbnail}
            />
          </div>
        )}
        <div className="flex-[2] flex flex-col gap-14 pb-12">
          <CourseHeader
            title={courseDetail.title}
            description={courseDetail.description}
            numberOfClasses={courseDetail.numberOfClasses}
          />

          <CourseContent classGroups={courseDetail.classGroups} />
        </div>
      </div>
    </main>
  )
}
