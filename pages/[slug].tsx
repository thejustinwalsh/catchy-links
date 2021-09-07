import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { absoluteUrl } from 'lib/absolute-url';

type Props = {
  slug: string;
  link?: string;
};

function Slug({ slug }: Props) {}

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<Props>> {
  const { slug } = context.query;

  // Fetch link from api
  const { origin } = absoluteUrl(context.req, 'localhost:3000');
  const res = await fetch(`${origin}/api/links/${slug}`);
  if (res.status != 200) return { notFound: true };

  // Redirect to link
  const { link }: Props = await res.json();
  return {
    redirect: {
      destination: link || process.env.FALLBACK_URL || '/',
      permanent: link ? true : false,
    },
  };
}

export default Slug;
