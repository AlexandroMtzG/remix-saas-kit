import { Link, MetaFunction, Outlet, useLoaderData } from "remix";
import { json } from "remix";
import type { LoaderFunction } from "remix";
import { db } from "~/utils/db.server";
import { useAppData } from "~/utils/data/useAppData";

export const meta: MetaFunction = () => ({
  title: "Jokes | Remix SaasFrontend",
});

type LoaderData = {
  items: Array<{ id: string; name: string }>;
};

export const loader: LoaderFunction = async ({ request }) => {
  // await new Promise((r) => setTimeout(r, 5000));

  const data: LoaderData = {
    items: await db.joke.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  };
  return json(data);
};

export default function JokesRoute() {
  const appData = useAppData();
  const data = useLoaderData<LoaderData>();
  return (
    <div className="jokes-layout">
      <header className="jokes-header">
        <div className="container">
          <h1 className="home-link">
            <Link to="/app/jokes" title="Remix Jokes" aria-label="Remix Jokes">
              <span className="logo">🤪</span>
              <span className="logo-medium">J🤪KES</span>
            </Link>
          </h1>
        </div>
      </header>
      <main className="jokes-main">
        <div className="container">
          <div className="jokes-list">
            <Link to=".">Get a random joke</Link>
            <p>Here are a few more jokes to check out:</p>
            <ul>
              {data.items.map((joke) => (
                <li key={joke.id}>
                  <Link prefetch="intent" to={joke.id}>
                    {joke.name}
                  </Link>
                </li>
              ))}
            </ul>
            <Link to="new" className="button">
              Add your own
            </Link>
          </div>
          <div className="jokes-outlet">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
