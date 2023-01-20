import { createCookieSessionStorage, redirect } from "remix";
import { UserType } from "~/application/enums/core/users/UserType";

import { db } from "./db.server";
import { getMyTenants } from "./db/tenants.db.server";
import { deleteUser } from "./db/users.db.server";
import { getMyWorkspaces, getWorkspace } from "./db/workspaces.db.server";

export async function setLoggedUser(user: { id: string; email: string; defaultWorkspaceId: string | null }) {
  const userTenants = await getMyTenants(user.id);

  let currentTenantId = "";
  let currentWorkspaceId = "";

  if (user.defaultWorkspaceId) {
    const workspace = await getWorkspace(user.defaultWorkspaceId);
    if (workspace) {
      return {
        userId: user.id,
        currentTenantId: workspace.tenantId,
        currentWorkspaceId: workspace.id,
      };
    }
  }

  if (userTenants.length > 0) {
    const tenant = userTenants[0].tenant;
    currentTenantId = tenant.id;
    const userWorkspaces = await getMyWorkspaces(user.id, tenant.id);
    if (userWorkspaces.length > 0) {
      currentWorkspaceId = userWorkspaces[0].workspace.id;
    }
  }

  return {
    userId: user.id,
    currentTenantId,
    currentWorkspaceId,
  };
}

const sessionSecret = process.env.REMIX_SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("REMIX_SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "RJ_session",
    // normally you want this to be `secure: true`
    // but that doesn't work on localhost for Safari
    // https://web.dev/when-to-use-local-https/
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

function getUserSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}

export async function getUserInfo(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  const currentTenantId = session.get("currentTenantId");
  const currentWorkspaceId = session.get("currentWorkspaceId");
  const lightOrDarkMode = session.get("lightOrDarkMode");
  return {
    userId,
    currentTenantId,
    currentWorkspaceId,
    lightOrDarkMode,
  };
}

export async function getUserType(request: Request): Promise<UserType> {
  const userInfo = await getUserInfo(request);
  const user = await db.user.findUnique({
    where: { id: userInfo?.userId },
  });
  return user?.type ?? UserType.Tenant;
}

export async function requireUserId(request: Request, redirectTo: string = new URL(request.url).pathname) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

// export async function getUser(request: Request) {
//   const userInfo = await getUserInfo(request);
//   if (typeof userInfo?.userId !== "string") {
//     return null;
//   }

//   try {
//     const user = await db.user.findUnique({
//       where: { id: userInfo.userId },
//       select: {
//         id: true,
//         email: true,
//         firstName: true,
//         lastName: true,
//         avatar: true,
//       },
//     });
//     return user;
//   } catch {
//     throw logout(request);
//   }
// }

// export async function getCurrentTenant(request: Request) {
//   const userInfo = await getUserInfo(request);
//   if (typeof userInfo?.currentTenantId !== "string") {
//     return null;
//   }

//   const tenant = await getTenant(userInfo.currentTenantId);
//   return tenant;
// }

// export async function getCurrentWorkspace(request: Request) {
//   const userInfo = await getUserInfo(request);
//   if (typeof userInfo?.currentWorkspaceId !== "string") {
//     return null;
//   }
//   const workspace = await getWorkspace(userInfo.currentWorkspaceId);
//   return workspace;
// }

export async function logout(request: Request) {
  const session = await getUserSession(request);
  return redirect("/login", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}

export async function createUserSession(
  userSession: {
    userId: string;
    currentTenantId: string;
    currentWorkspaceId: string;
    lightOrDarkMode: string;
  },
  redirectTo: string = ""
) {
  const session = await storage.getSession();
  session.set("userId", userSession.userId);
  session.set("currentTenantId", userSession.currentTenantId);
  session.set("currentWorkspaceId", userSession.currentWorkspaceId);
  session.set("lightOrDarkMode", userSession.lightOrDarkMode);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}
