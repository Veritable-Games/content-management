export async function POST(request: Request) {
  const data = await request.json();
  return new Response(`Hello, ${data.name}. Your message has been received.`, {
    status: 200,
  });
}
