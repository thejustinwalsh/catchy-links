import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

function Index() {}

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<{}>> {
  // Redirect to the FALLBACK_URL if no slug is provided
  const url = process.env.FALLBACK_URL;
  if (url) {
    return {
      redirect: {
        destination: url,
        permanent: false,
      },
    };
  }

  // ensure FALLBACK_URL is set to avoid a 404
  return { notFound: true };
}

export default Index;
