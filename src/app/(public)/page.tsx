import { client } from '@/lib/hono';
import { Metadata, ResolvingMetadata } from 'next';
import LeftSideGrid from './_components/left-side-grid';
import MainGrid from './_components/main-grid';
import RightSideGrid from './_components/right-side-grid';
import { PostsProvider } from './_hooks/post-context';
import { SwiperProvider } from './_hooks/swiper-context';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const _searchParams = await searchParams;
  const { id } = _searchParams;
  const postId = Array.isArray(id) ? id[0] : id;

  // If no postId is provided, return default metadata
  if (!postId) {
    return {
      title: 'Uploto',
      description: 'Discover creative content on Uploto.',
      openGraph: {
        title: 'Uploto',
        description: 'Discover creative content on Uploto.',
        url: process.env.NEXT_PUBLIC_APP_URL,
        images: [
          {
            url: `${process.env.NEXT_PUBLIC_APP_URL}/default-og.png`,
            width: 1200,
            height: 630,
            alt: 'Uploto Default Image',
          },
        ],
        locale: 'en_US',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Uploto',
        description: 'Discover creative content on Uploto.',
        images: [`${process.env.NEXT_PUBLIC_APP_URL}/default-og.png`],
      },
    };
  }

  try {
    const response = await client.api.post[':id'].$get({
      param: { id: postId },
    });

    if (!response.ok) {
      return {
        title: 'Uploto',
        description: 'Discover creative content on Uploto.',
        openGraph: {
          title: 'Uploto',
          description: 'Discover creative content on Uploto.',
          url: process.env.NEXT_PUBLIC_APP_URL,
          images: [
            {
              url: `${process.env.NEXT_PUBLIC_APP_URL}/default-og.png`,
              width: 1200,
              height: 630,
              alt: 'Uploto Default Image',
            },
          ],
          locale: 'en_US',
          type: 'website',
        },
        twitter: {
          card: 'summary_large_image',
          title: 'Uploto',
          description: 'Discover creative content on Uploto.',
          images: [`${process.env.NEXT_PUBLIC_APP_URL}/default-og.png`],
        },
      };
    }

    const { data } = await response.json();

    const title = data.caption || 'Uploto';
    const description = data.caption || 'Explore this creative post on Uploto.';
    const image =
      data.image || `${process.env.NEXT_PUBLIC_APP_URL}/default-og.png`;

    const searchParamsEntries = Object.entries(_searchParams)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => [
        key,
        Array.isArray(value) ? value[0] : (value as string),
      ]);
    const search = new URLSearchParams(searchParamsEntries).toString();
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/?${search}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url,
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
        locale: 'en_US',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        creator: data?.creator?.username
          ? '@' + data.creator.username
          : undefined,
        title,
        description,
        images: [image],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Uploto',
      description: 'Discover creative content on Uploto.',
      openGraph: {
        title: 'Uploto',
        description: 'Discover creative content on Uploto.',
        url: process.env.NEXT_PUBLIC_APP_URL,
        images: [
          {
            url: `${process.env.NEXT_PUBLIC_APP_URL}/default-og.png`,
            width: 1200,
            height: 630,
            alt: 'Uploto Default Image',
          },
        ],
        locale: 'en_US',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Uploto',
        description: 'Discover creative content on Uploto.',
        images: [`${process.env.NEXT_PUBLIC_APP_URL}/default-og.png`],
      },
    };
  }
}

export default function Home() {
  return (
    <SwiperProvider>
      <PostsProvider>
        <div className='grid grid-cols-1 xl:grid-cols-5'>
          <div className='hidden xl:block'>
            <LeftSideGrid />
          </div>
          <div className='lg:col-span-3 overflow-x-hidden'>
            <MainGrid />
          </div>
          <div className='xl:hidden'>
            <LeftSideGrid />
          </div>
          <div>
            <RightSideGrid />
          </div>
        </div>
      </PostsProvider>
    </SwiperProvider>
  );
}