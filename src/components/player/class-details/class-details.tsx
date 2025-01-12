'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { IPlayerClassGroupProps } from '../playlist/player-class-group'
import { VideoPlayer, IVideoPlayerRef } from './video-player'
import { ClassHeader } from './class-header'
import { Comments } from './comments/comments'
import { ICommentProps } from './comments/comment'
import { PlayerPlaylist } from '../playlist/player-playlist'
import { CourseHeader } from '@/components/course-header/course-header'
import { MdThumbUp, MdVisibility } from 'react-icons/md'

const comments: ICommentProps[] = [
  {
    author: {
      image: 'https://github.com/Tiago0Br.png',
      name: 'Tiago Lopes',
    },
    content: 'Opa, essa aula é muito boa!',
    likesCount: 2,
    publishedAt: '2023-06-24T10:00:00.000Z',
    replies: [
      {
        author: {
          image: 'https://github.com/Tiago0Br.png',
          name: 'Tiago Lopes',
        },
        content: 'Eu achei bem fraquinha.',
        likesCount: 1,
        publishedAt: '2023-12-24T10:00:00.000Z',
      },
    ],
  },
  {
    author: {
      image: 'https://github.com/Tiago0Br.png',
      name: 'Tiago Lopes',
    },
    content: 'Top demais da conta!',
    likesCount: 200,
    publishedAt: '2024-12-24T10:00:00.000Z',
  },
]

export interface IClassItem {
  id: string
  title: string
  description: string
  videoId: string
  likesCount: number
  viewsCount: number
  commentsCount: number
}

export interface ICourseItem {
  id: string
  title: string
  description: string
  numberOfClasses: number
  classGroups: Pick<IPlayerClassGroupProps, 'classes' | 'title'>[]
}

interface IClassDetailsProps {
  course: ICourseItem
  classItem: IClassItem
}

export function ClassDetails({ course, classItem }: IClassDetailsProps) {
  const router = useRouter()
  const nextClassId = useMemo(() => {
    const classes = course.classGroups.flatMap(({ classes }) => classes)
    const currentClassIndex = classes.findIndex(({ id }) => id === classItem.id)

    const nextClassIndex = currentClassIndex + 1

    if (!classes[nextClassIndex]) {
      return undefined
    }

    return classes[nextClassIndex].id
  }, [classItem.id, course.classGroups])

  const videoPlayerRef = useRef<IVideoPlayerRef>(null)
  const [currentTab, setCurrentTab] = useState('class-details')

  useEffect(() => {
    const matchMedia = window.matchMedia('(min-width: 768px)')

    const handleMatchMedia = (event: MediaQueryListEvent) => {
      if (event.matches && currentTab === 'course-playlist') {
        setCurrentTab('class-details')
      }
    }

    matchMedia.addEventListener('change', handleMatchMedia)

    return () => matchMedia.removeEventListener('change', handleMatchMedia)
  }, [currentTab])

  return (
    <div className="flex-1 overflow-auto pb-10">
      <div className="aspect-video">
        <VideoPlayer
          ref={videoPlayerRef}
          videoId={classItem.videoId}
          onPlayNext={() =>
            nextClassId
              ? router.push(`/player/${course.id}/${nextClassId}`)
              : {}
          }
        />
      </div>

      <div className="flex gap-2 p-2 opacity-50">
        <div className="flex gap-1 items-center">
          <MdVisibility />
          <span>{classItem.viewsCount}</span>
          <span>Visualizações</span>
        </div>
        <a
          className="flex gap-1 items-center"
          href={`https://www.youtube.com/watch?v=${classItem.videoId}`}
          target="_blank"
        >
          <MdThumbUp />
          <span>{classItem.likesCount}</span>
          <span>Curtidas</span>
        </a>
        <div className="flex gap-1 items-center">
          <MdVisibility />
          <span>{classItem.commentsCount}</span>
          <span>Comentários</span>
        </div>
      </div>

      <Tabs.Root value={currentTab} onValueChange={setCurrentTab}>
        <Tabs.List className="flex gap-4 border-b border-paper mb-2">
          <Tabs.Trigger
            value="class-details"
            className="p-2 flex items-center justify-center border-b-4 border-transparent data-[state=active]:border-primary"
          >
            Visão geral da aula
          </Tabs.Trigger>
          <Tabs.Trigger
            value="course-playlist"
            className="p-2 flex items-center justify-center border-b-4 border-transparent data-[state=active]:border-primary md:hidden"
          >
            Conteúdo do curso
          </Tabs.Trigger>
          <Tabs.Trigger
            value="class-comments"
            className="p-2 flex items-center justify-center border-b-4 border-transparent data-[state=active]:border-primary"
          >
            Comentários
          </Tabs.Trigger>
          <Tabs.Trigger
            value="course-details"
            className="p-2 flex items-center justify-center border-b-4 border-transparent data-[state=active]:border-primary"
          >
            Visão geral do curso
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content className="px-2" value="class-details">
          <ClassHeader
            title={classItem.title}
            description={classItem.description}
            onTimeClick={(seconds) =>
              videoPlayerRef.current?.setProgress(seconds)
            }
          />
        </Tabs.Content>
        <Tabs.Content className="px-2 md:hidden" value="course-playlist">
          <PlayerPlaylist
            classGroups={course.classGroups}
            courseId={course.id}
            playingClassId={classItem.id}
          />
        </Tabs.Content>
        <Tabs.Content className="px-2" value="class-comments">
          <Comments comments={comments} />
        </Tabs.Content>
        <Tabs.Content className="px-2" value="course-details">
          <CourseHeader
            description={course.description}
            title={course.title}
            numberOfClasses={course.numberOfClasses}
          />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}
